import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "src/config/config.service";
import { ServiceInfoEntity } from "src/entities/serviceInfo.entity";
import { Repository } from "typeorm";
import Web3 from 'web3'
import { BigNumber } from "bignumber.js";
import { ServiceInterface } from "../service.interface";
import { ChainId, Fetcher, Route, Token, WETH } from "@uniswap/sdk";
import { UniswapTokenBuilder } from "src/uniswap/tokens/uniswapToken.builder";

@Injectable()
export class UniswapService {

    constructor(
        @InjectRepository(ServiceInfoEntity)
        private readonly serviceInfoRepository: Repository<ServiceInfoEntity>,
        private readonly tokenBuild: UniswapTokenBuilder,
        private readonly configService: ConfigService
    ) {}

    public async getAPY(network: string): Promise<ServiceInterface[]> {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));

        const infos = await this.serviceInfoRepository.find({service: "Uniswap"})
        const result: ServiceInterface[] = []
        const BLOCKS_PER_YEAR = 6400 * 365;
        


        for (let i = 0; i < infos.length; i++) {
            const info = infos[i]
            let pairTokens = info.symbol.split('/')
            pairTokens = pairTokens.filter((p) => p != 'ETH')
            const token = this.tokenBuild.build(ChainId.KOVAN, pairTokens[0])
            let rewardTokenPrice = await this.getTokenPriceInETH(token);

            const REWARD_PER_BLOCK = 10000000000;
            const totalRewardPricePerYear = new BigNumber(rewardTokenPrice)
                .times(REWARD_PER_BLOCK)
                .times(BLOCKS_PER_YEAR);

                  // Get Total LP Tokens Deposited in Farming Contract
            const LpTokenContract = new provider.eth.Contract(
                IUniswapV2Pair,
                LP_TOKEN_ADDRESS
            );
        
            const totalLpDepositedInFarmingContract = await LpTokenContract.methods
                .balanceOf(FARMING_CONTRACT_ADDRESS)
                .call();
        
            // Calculate LP Token Price
            const lpTokenPrice = await calculateLpTokenPrice();
        
            // Calculate Total Price Of LP Tokens in Contract
            const totalPriceOfLpTokensInFarmingContract = new BigNumber(
                lpTokenPrice
            ).times(totalLpDepositedInFarmingContract);
        
            // Calculate APY
            const apy = totalRewardPricePerYear
                .div(totalPriceOfLpTokensInFarmingContract)
                .times(100);
        
            // Return apy if apy is a valid number or return 0
            return apy.isNaN() || !apy.isFinite() ? 0 : apy.toNumber();
        }
        return result
    }

    private async getTokenPriceInETH(token: Token) {
        try {
            const pair = await Fetcher.fetchPairData(token, WETH[token.chainId])
            const route = new Route([pair], WETH[token.chainId])
            return route.midPrice.toSignificant(6);
        } catch (e) {
            console.log(e)
            return 0
        }
    }
}

// const getDogecoinPriceInETH = async () => {
//     try {
//       const DOGECOIN = new Token(
//         ChainId.MAINNET, //ChainId for Ethereum Mainnet
//         "0x4206931337dc273a630d328da6441786bfad668f", //DOGECOIN address on Ethereum Mainnet
//         8 //Number of Decimals
//       );
//       const pair = await Fetcher.fetchPairData(DOGECOIN, WETH[DOGECOIN.chainId]);
//       const route = new Route([pair], WETH[DOGECOIN.chainId]);
//       return route.midPrice.toSignificant(6);
//     } catch (e) {
//       console.log(e);
//       return 0;
//     }
//   };

// const calculateAPY = async () => {
//     try {
//       //BLOCKS_PER_DAY varies acccording to network all values are approx and they keep changing
//       //BLOCKS_PER_DAY = 21600 for Kovan Testnet
//       //BLOCKS_PER_DAY = 28800 for BSC Testnet
//       //BLOCKS_PER_DAY = 6400 for Ethereum Mainnet
//       //I am using the value for Ethereum mainnet
//       const BLOCKS_PER_YEAR = 6400 * 365;
  
//       let rewardTokenPrice = 0;
//       // For Price IN ETH
//       // Reward Token is Dodgecoin in our case
//       rewardTokenPrice = await getDogecoinPriceInETH();
  
//       // For Price in BNB
//       // If you want to do calculations in BNB uncomment the line below and comment line number 124
//       // rewardTokenPrice = await getDodgecoinPriceInBNB()
  
//       // REWARD_PER_BLOCK = Number of tokens your farming contract gives out per block
//       const REWARD_PER_BLOCK = 10000000000;
//       const totalRewardPricePerYear = new BigNumber(rewardTokenPrice)
//         .times(REWARD_PER_BLOCK)
//         .times(BLOCKS_PER_YEAR);
  
//       // Get Total LP Tokens Deposited in Farming Contract
//       const LpTokenContract = new web3.eth.Contract(
//         IUniswapV2Pair,
//         LP_TOKEN_ADDRESS
//       );
  
//       const totalLpDepositedInFarmingContract = await LpTokenContract.methods
//         .balanceOf(FARMING_CONTRACT_ADDRESS)
//         .call();
  
//       // Calculate LP Token Price
//       const lpTokenPrice = await calculateLpTokenPrice();
  
//       // Calculate Total Price Of LP Tokens in Contract
//       const totalPriceOfLpTokensInFarmingContract = new BigNumber(
//         lpTokenPrice
//       ).times(totalLpDepositedInFarmingContract);
  
//       // Calculate APY
//       const apy = totalRewardPricePerYear
//         .div(totalPriceOfLpTokensInFarmingContract)
//         .times(100);
  
//       // Return apy if apy is a valid number or return 0
//       return apy.isNaN() || !apy.isFinite() ? 0 : apy.toNumber();
//     } catch (e) {
//       console.log(e);
//       return 0;
//     }
//   };