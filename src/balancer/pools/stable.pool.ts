import { BigNumber } from '@ethersproject/bignumber';
import { parseUnits, formatUnits } from '@ethersproject/units';

import OldBigNumber from 'bignumber.js';

import { stableBPTForTokensZeroPriceImpact as _bptForTokensZeroPriceImpact } from '@balancer-labs/sor2';
import * as SDK from '@georgeroman/balancer-v2-pools';
import { bnum } from '../utils/balancer.utils';

/**
 * The stableMathEvm works with all values scaled to 18 decimals,
 * all inputs should be scaled appropriately.
 */
export class StablePool {
    AMP_PRECISION = bnum(1000);

    private pool: any

    private poolTotalSupplyOnChain: any
    private poolDecimals: number

    public priceImpactJoin(
        tokenAmounts: string[], 
        pool,
        poolTotalSupplyOnChain,
        poolDecimals: number
    ): OldBigNumber {
        this.pool = pool
        this.poolTotalSupplyOnChain = poolTotalSupplyOnChain
        this.poolDecimals = poolDecimals
        
        let bptAmount, bptZeroPriceImpact;
    
        bptAmount = this.exactTokensInForBPTOut(tokenAmounts, pool);
        if (bptAmount < 0) return bnum(0);
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts);

        return bnum(1).minus(bptAmount.div(bptZeroPriceImpact));
    }

    public btpAmountCalc(
      tokenAmounts: string[], 
      pool,
      poolTotalSupplyOnChain,
      poolDecimals: number
    ) {
      this.pool = pool
      this.poolTotalSupplyOnChain = poolTotalSupplyOnChain
      this.poolDecimals = poolDecimals
      return this.exactTokensInForBPTOut(tokenAmounts, pool);
    }

    public exactTokensInForBPTOut(tokenAmounts: string[], pool): OldBigNumber {
        try {
          const amp = bnum(pool.amp?.toString() || '0');
          const ampAdjusted = this.adjustAmp(amp);
          const amounts = pool.tokens.map(({ priceRate }, i) =>
            this.scaleInput(tokenAmounts[i], priceRate)
          );
    
          const bptOut = SDK.StableMath._calcBptOutGivenExactTokensIn(
            ampAdjusted,
            this.scaledBalances,
            amounts,
            this.scaledPoolTotalSupply,
            bnum(this.pool.swapFee.toString())
          );
          console.log(this.poolDecimals)
    
          return this.scaleOutput(
            bptOut.toString(),
            this.poolDecimals,
            '1',
            OldBigNumber.ROUND_DOWN // If OUT given IN, round down
          );
        } catch (error) {
          console.error(error);
          return this.scaleOutput(
            '0',
            this.poolDecimals,
            '1',
            OldBigNumber.ROUND_DOWN // If OUT given IN, round down
          );
        }
      }

      private get scaledBalances(): OldBigNumber[] {
        return this.poolTokenBalances.map((balance, i) => {
          const normalizedBalance = formatUnits(
            balance,
            this.poolTokenDecimals[i]
          );
          const scaledBalance = this.scaleInput(
            normalizedBalance,
            this.pool.tokens[i].priceRate
          );
          return bnum(scaledBalance.toString());
        });
      }
    
      private get scaledPoolTotalSupply(): OldBigNumber {
        const normalizedSupply = formatUnits(
          this.poolTotalSupplyOnChain,
          this.poolDecimals
        );
        const scaledSupply = parseUnits(normalizedSupply, 18);
        return bnum(scaledSupply.toString());
      }


      private bptForTokensZeroPriceImpact(tokenAmounts: string[]): OldBigNumber {
        const amp = bnum(this.pool.amp?.toString() || '0');
        const ampAdjusted = BigNumber.from(this.adjustAmp(amp).toString());
        const denormAmounts = this.denormAmounts(
          tokenAmounts,
          this.poolTokenDecimals
        );
    
        // _bptForTokensZeroPriceImpact is the only stable pool function
        // that requires balances be scaled by the token decimals and not 18
        const balances = this.scaledBalances.map((balance, i) => {
          const normalizedBalance = formatUnits(balance.toString(), 18);
          const denormBalance = parseUnits(
            normalizedBalance,
            this.poolTokenDecimals[i]
          );
          return denormBalance;
        });
    
        const bptZeroImpact = _bptForTokensZeroPriceImpact(
          balances,
          this.poolTokenDecimals,
          denormAmounts,
          this.poolTotalSupplyOnChain,
          ampAdjusted
        );
    
        return bnum(bptZeroImpact.toString());
      }

      public denormAmounts(amounts: string[], decimals: number[]): BigNumber[] {
        return amounts.map((a, i) => parseUnits(a, decimals[i]));
      }

    private scaleInput(
        normalizedAmount: string,
        priceRate: string | null = null
    ): OldBigNumber {
        if (priceRate === null) priceRate = '1';

        const denormAmount = bnum(parseUnits(normalizedAmount, 18).toString())
            .times(priceRate)
            .toFixed(0, OldBigNumber.ROUND_UP);

        return bnum(denormAmount.toString());
    }

    private scaleOutput(
        amount: string,
        decimals: number,
        priceRate: string | null,
        rounding: OldBigNumber.RoundingMode
      ): OldBigNumber {
        if (priceRate === null) priceRate = '1';
    
        const amountAfterPriceRate = bnum(amount)
          .div(priceRate)
          .toString();
        console.log('decimalsq23e123', decimals)
        const normalizedAmount = bnum(amountAfterPriceRate)
          .div(parseUnits('1', 18).toString())
          .toFixed(Number(decimals), rounding);
        const scaledAmount = parseUnits(normalizedAmount, decimals);
    
        return bnum(scaledAmount.toString());
    }

    // Solidity maths uses precison method for amp that must be replicated
    private adjustAmp(amp: OldBigNumber): OldBigNumber {
        return amp.times(this.AMP_PRECISION);
    }

    public get poolTokenBalances(): BigNumber[] {
        const normalizedBalances = Object.values(
          this.pool.tokens
        ).map((t: any) => t.balance);
        return normalizedBalances.map((balance, i) =>
          parseUnits(balance, this.poolTokenDecimals[i])
        );
      }

    public get poolTokenDecimals(): number[] {
        return Object.values(this.pool.tokens).map((t: any) => t.decimals);
      }
}
