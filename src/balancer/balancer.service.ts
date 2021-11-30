import { Injectable } from '@nestjs/common';
import { PriceImpactDto } from './dto/priceImpact.dto';
import { ProportionalSuggestionDto } from './dto/proportionalSuggestion.dto';
import { BalancerSubgraph } from './subgraph/balancer.subgraph';
import { WeightedPool } from './pools/weighted.pool';
import { Vault__factory, WeightedPool__factory, StablePool__factory, InvestmentPool__factory } from '@balancer-labs/typechain';
import { ERC20ABI } from 'src/config/ERC20.abi';
import Web3 from 'web3'
import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { StablePool } from './pools/stable.pool';
import { PoolCalcLp } from './dto/poolCalcLp.dto';
import { PoolExitSingleCalcDto } from './dto/poolExitSingleCalc.dto';
import { ExitPoolEncodeFunctionDto } from './dto/exitPoolEncodeFunction.dto';
import { ConfigService } from 'src/config/config.service';
import { VAULT_ABI } from './vault.abi';

interface Amounts {
    send: string[];
    receive: string[];
    fixedToken: number;
  }
  

@Injectable()
export class BalancerService {
        constructor(
            private readonly balancerSubgraph: BalancerSubgraph,
            private readonly weightedPool: WeightedPool,
            private readonly stablePool: StablePool,
            private readonly configService: ConfigService
        ) {}

        private action: string
        private pool: any
        private useNativeAsset: boolean

        private poolTotalSupplyOnChain: any
        private poolDecimals: any
        private allTokens: any


        public async exitPoolEncodeFunction(encodeDto: ExitPoolEncodeFunctionDto) {
          let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL('kovan')));
          const contract = new provider.eth.Contract(VAULT_ABI)
          return contract.methods.exitPool(encodeDto.poolId, encodeDto.sender, encodeDto.recipient, {
            assets: encodeDto.assets, 
            minAmountsOut: encodeDto.minAmountsOut, 
            userData: encodeDto.userData, 
            toInternalBalance: encodeDto.toInternalBalance
          }).encodeABI()
        }
        
        public async getPools() {
            const ids = ["0x6b15a01b5d46a5321b627bd7deef1af57bc629070000000000000000000000d4", "0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004", "0x647c1fd457b95b75d0972ff08fe01d7d7bda05df000200000000000000000001"]
            return this.balancerSubgraph.getPoolsByIds(ids)
        }

        public allABIs(): any {
            return Object.values(
                Object.fromEntries(
                [
                    ...Vault__factory.abi,
                    ...WeightedPool__factory.abi,
                    ...StablePool__factory.abi,
                    ...InvestmentPool__factory.abi,
                    ...ERC20ABI
                ].map(row => [row.name, row])
                )
            );
        }

        public propAmountsGiven(
            fixedAmount: string,
            index: number,
            type: 'send' | 'receive'
          ): Amounts {
            if (fixedAmount.trim() === '')
              return { send: [], receive: [], fixedToken: 0 };
        
            const types = ['send', 'receive'];
            const fixedTokenAddress = this.tokenOf(type, index);
        
            const fixedToken = this.allTokens[fixedTokenAddress];
            console.log(fixedAmount, fixedToken.decimals)
            const fixedDenormAmount = parseUnits(fixedAmount, fixedToken.decimals);
            
            const fixedRatio = this.ratioOf(type, index);
            
            const amounts = {
              send: this.sendTokens.map(() => ''),
              receive: this.receiveTokens.map(() => ''),
              fixedToken: index
            };
        
        
            amounts[type][index] = fixedAmount;
        
            [this.sendRatios, this.receiveRatios].forEach((ratios, ratioType) => {
              ratios.forEach((ratio, i) => {
                if (i !== index || type !== types[ratioType]) {
                  const tokenAddress = this.tokenOf(types[ratioType], i);
                  const token = this.allTokens[tokenAddress];
                  console.log("DECIMALS", i, fixedDenormAmount.toString(), fixedRatio.toString())
                  amounts[types[ratioType]][i] = formatUnits(
                    fixedDenormAmount.mul(ratio).div(fixedRatio),
                    token.decimals
                  );
                  
                }
              });
            });
        
            return amounts;
          }

        public tokenOf(type: string, index: number) {
            return this[`${type}Tokens`][index];
          }
        
          public ratioOf(type: string, index: number) {
            return this[`${type}Ratios`][index];
          }

        public get tokenAddresses(): string[] {
            if (this.useNativeAsset) {
              return this.pool.tokensList.map(address => {
                if (address === "0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1")
                  return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
                return address;
              });
            }
            return this.pool.tokensList;
          }

        public get sendTokens(): string[] {
            if (this.action === 'join') return this.tokenAddresses;
            return [this.pool.address];
        }
    
        public get receiveTokens(): string[] {
            if (this.action === 'join') return [this.pool.address];
            return this.tokenAddresses;
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
    
        public get sendRatios(): BigNumberish[] {
          if (this.action === 'join') return this.poolTokenBalances;
          return [this.poolTotalSupply];
        }
    
        public get receiveRatios(): BigNumberish[] {
          if (this.action === 'join') return [this.poolTotalSupply];
          return this.poolTokenBalances;
        }

        public get poolTotalSupply(): BigNumber {
          console.log(this.poolTotalSupplyOnChain)
          return this.poolTotalSupplyOnChain //parseUnits(this.poolTotalSupplyOnChain, this.poolDecimals);
        }


        public async calcAmounts(proportionalSuggestionDto: ProportionalSuggestionDto, action: string) {
            const pool = (await this.balancerSubgraph.getPoolsByIds([proportionalSuggestionDto.poolId])).pools[0]
            const provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/cf9ea9a288c245f3bb640e6a1bc8602a"));
            const poolContract = new provider.eth.Contract(this.allABIs(), pool.address)

            this.action = action
            this.pool = pool
            this.useNativeAsset = false
            this.poolTotalSupplyOnChain = await poolContract.methods.totalSupply().call()
            this.poolDecimals = await poolContract.methods.decimals().call()
            
            let tokens = []
            tokens[pool.address] = {
              address: pool.address,
              decimals: this.poolDecimals,
              id: pool.id,
              name: pool.name,
              symbol: pool.symbol,
              balance: proportionalSuggestionDto.amount
            }
            for(let i = 0; i < pool.tokens.length; i++) {
                tokens[pool.tokens[i].address] = pool.tokens[i]
            }
            this.allTokens = tokens
            const amounts = this.propAmountsGiven(proportionalSuggestionDto.amount, proportionalSuggestionDto.index, proportionalSuggestionDto.type)
            return amounts
        }

        public async exitPoolSingleAsset(poolExitSingCalcDto: PoolExitSingleCalcDto) {
          const pool = (await this.balancerSubgraph.getPoolsByIds([poolExitSingCalcDto.poolId])).pools[0]

          const provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/cf9ea9a288c245f3bb640e6a1bc8602a"));
          const poolContract = new provider.eth.Contract(this.allABIs(), pool.address)

          let totalSupply = await poolContract.methods.totalSupply().call()

          if(this.isStablePool(pool.poolType)) {
              const poolDecimals = await poolContract.methods.decimals().call()
              return this.stablePool.exactBPTInForTokenOut(poolExitSingCalcDto.amount, poolExitSingCalcDto.index, pool, totalSupply, poolDecimals)
          }

          if(this.isWeightedPool(pool.poolType)) {
              const poolDecimals = await poolContract.methods.decimals().call()
              const poolTokenWeight = pool.tokens.map(function (token) {
                  return parseUnits(token.weight.toString(), 18)
              })
  
              const poolTokenBalances = pool.tokens.map(function (token) {
                  return parseUnits(token.balance, token.decimals)
              })
              return this.weightedPool.exactBPTInForTokenOut(poolExitSingCalcDto.amount, poolExitSingCalcDto.index, poolTokenBalances, poolTokenWeight, poolDecimals, totalSupply, parseUnits(pool.swapFee, 18)).toString()
          }
        }

        public async priceImpact(priceImpactDto: PriceImpactDto) {
            const pool = (await this.balancerSubgraph.getPoolsByIds([priceImpactDto.poolId])).pools[0]

            const provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/cf9ea9a288c245f3bb640e6a1bc8602a"));
            const poolContract = new provider.eth.Contract(this.allABIs(), pool.address)

            let totalSupply = await poolContract.methods.totalSupply().call()

            if(this.isStablePool(pool.poolType)) {
                const poolDecimals = await poolContract.methods.decimals().call()
                return this.stablePool.priceImpactJoin(priceImpactDto.amountsIn, pool, totalSupply, poolDecimals)
            }

            if(this.isWeightedPool(pool.poolType)) {
                const poolTokenWeight = pool.tokens.map(function (token) {
                    return parseUnits(token.weight.toString(), 18)
                })
    
                const poolTokenDecimals = pool.tokens.map(function (token) {
                    return token.decimals
                })
    
                const poolTokenBalances = pool.tokens.map(function (token) {
                    return parseUnits(token.balance, token.decimals)
                })
                return this.weightedPool.priceImpactJoin(priceImpactDto.amountsIn, poolTokenBalances, poolTokenWeight, poolTokenDecimals, totalSupply, parseUnits(pool.swapFee, 18))
            }
        }

        public async poolCalcLp(poolCalcLpDto: PoolCalcLp) {
          const pool = (await this.balancerSubgraph.getPoolsByIds([poolCalcLpDto.poolId])).pools[0]

          const provider = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/cf9ea9a288c245f3bb640e6a1bc8602a"));
          const poolContract = new provider.eth.Contract(this.allABIs(), pool.address)

          let totalSupply = await poolContract.methods.totalSupply().call()

          if(this.isStablePool(pool.poolType)) {
              const poolDecimals = await poolContract.methods.decimals().call()
              return this.stablePool.btpAmountCalc(poolCalcLpDto.amountsIn, pool, totalSupply, poolDecimals)
          }

          if(this.isWeightedPool(pool.poolType)) {
              const poolTokenWeight = pool.tokens.map(function (token) {
                  return parseUnits(token.weight.toString(), 18)
              })
  
              const poolTokenDecimals = pool.tokens.map(function (token) {
                  return token.decimals
              })
  
              const poolTokenBalances = pool.tokens.map(function (token) {
                  return parseUnits(token.balance, token.decimals)
              })
              return this.weightedPool.btpAmountCalc(poolCalcLpDto.amountsIn, poolTokenBalances, poolTokenWeight, poolTokenDecimals, totalSupply, parseUnits(pool.swapFee, 18))
          }
      }

        private isStablePool(type: string): boolean {
            return type == 'Stable' 
        }

        private isWeightedPool(type: string): boolean {
            return type == 'Weighted'
        }
}
