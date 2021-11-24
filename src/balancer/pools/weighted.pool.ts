import { bnum } from "../utils/balancer.utils";
import { parseUnits } from '@ethersproject/units';
import * as SDK from '@georgeroman/balancer-v2-pools';
import OldBigNumber from 'bignumber.js';
import { weightedBPTForTokensZeroPriceImpact as _bptForTokensZeroPriceImpact } from '@balancer-labs/sor2';

export class WeightedPool {
    public priceImpactJoin(
        tokenAmounts: string[], 
        poolTokenBalances: string[], 
        poolTokenWeights: string[],
        poolTokenDecimals: number[],
        poolTotalSupply,
        poolSwapFee, 
    ): OldBigNumber {
        let bptAmount, bptZeroPriceImpact;
    
        bptAmount = this.exactTokensInForBPTOut(tokenAmounts, poolTokenBalances, poolTokenWeights, poolTokenDecimals, poolTotalSupply, poolSwapFee);
        if (bptAmount < 0) return bnum(0);
        bptZeroPriceImpact = this.bptForTokensZeroPriceImpact(tokenAmounts, poolTokenBalances, poolTokenWeights, poolTokenDecimals, poolTotalSupply);

        return bnum(1).minus(bptAmount.div(bptZeroPriceImpact));
    }

    public btpAmountCalc(
        tokenAmounts: string[], 
        poolTokenBalances: string[], 
        poolTokenWeights: string[],
        poolTokenDecimals: number[],
        poolTotalSupply,
        poolSwapFee, 
    ) {
        return this.exactTokensInForBPTOut(tokenAmounts, poolTokenBalances, poolTokenWeights, poolTokenDecimals, poolTotalSupply, poolSwapFee);
    }

    public exactBPTInForTokenOut(
        bptAmount: string,
        tokenIndex: number,
        poolTokenBalances: string[], 
        poolTokenWeights: string[],
        poolTokenDecimals: number,
        poolTotalSupply,
        poolSwapFee, 
      ): OldBigNumber {
        const tokenBalance = bnum(
          poolTokenBalances[tokenIndex].toString()
        );
        const tokenNormalizedWeight = bnum(
          poolTokenWeights[tokenIndex].toString()
        );
        const bptAmountIn = bnum(
          parseUnits(bptAmount, poolTokenDecimals).toString()
        );
    
        return SDK.WeightedMath._calcTokenOutGivenExactBptIn(
          tokenBalance,
          tokenNormalizedWeight,
          bptAmountIn,
          bnum(poolTotalSupply.toString()),
          bnum(poolSwapFee.toString())
        );
      }

    public exactTokensInForBPTOut(
            tokenAmounts: string[], 
            poolTokenBalances: string[], 
            poolTokenWeights: string[],
            poolTokenDecimals: number[],
            poolTotalSupply,
            poolSwapFee
    ): OldBigNumber {
        const balances = poolTokenBalances.map(b => bnum(b.toString()));
        const weights = poolTokenWeights.map(w => bnum(w.toString()));
        const denormAmounts = this.denormAmounts(
            tokenAmounts,
            poolTokenDecimals
        );
        const amounts = denormAmounts.map(a => bnum(a.toString()));

        return SDK.WeightedMath._calcBptOutGivenExactTokensIn(
            balances,
            weights,
            amounts,
            bnum(poolTotalSupply.toString()),
            bnum(poolSwapFee.toString())
        );
    }

    public bptForTokensZeroPriceImpact(
        tokenAmounts: string[], 
        poolTokenBalances: string[], 
        poolTokenWeights: any[],
        poolTokenDecimals: number[],
        poolTotalSupply,
    ): OldBigNumber {
        const denormAmounts = this.denormAmounts(
          tokenAmounts,
          poolTokenDecimals
        );

        return bnum(
          _bptForTokensZeroPriceImpact(
            poolTokenBalances,
            poolTokenDecimals,
            poolTokenWeights,
            denormAmounts,
            poolTotalSupply
          ).toString()
        );
      }

    public denormAmounts(amounts: string[], decimals: number[]): any[] {
        return amounts.map((a, i) => parseUnits(a, decimals[i]));
    }
}