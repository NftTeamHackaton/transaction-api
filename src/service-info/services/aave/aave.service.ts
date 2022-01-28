import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "src/config/config.service";
import { ServiceInfoEntity } from "src/entities/serviceInfo.entity";
import { Repository } from "typeorm";
import Web3 from "web3";
import { AaveTokenBuilder } from '../../../aave/aaveToken.builder';
import { ChainId } from '@uniswap/sdk';
import { LendingPoolABI } from "src/aave/lendingPool.abi";
import { ServiceInterface } from "../service.interface";
@Injectable()
export class AaveService {
    constructor(
        @InjectRepository(ServiceInfoEntity)
        private readonly serviceInfoRepository: Repository<ServiceInfoEntity>,
        private readonly configService: ConfigService,
        private readonly tokenBuilder: AaveTokenBuilder,
    ) {}

    public async getAPY(network: string): Promise<ServiceInterface[]> {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));
        const tokens = await this.serviceInfoRepository.find({service: "Aave"})

        const RAY = 1e27
        const result: ServiceInterface[] = []
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            const erc20Token = this.tokenBuilder.build(ChainId[network.toUpperCase()], token.symbol.toUpperCase())
            const lendingPool = new provider.eth.Contract(LendingPoolABI, this.configService.getAaveLendingPoolAddress(network))
            const info = await lendingPool.methods.getReserveData(erc20Token.address).call()
            result.push({
                symbol: token.symbol,
                service: 'Aave',
                apy: (100 * Number(info.currentLiquidityRate)/RAY).toFixed(2)
            })
        }
        return result
    }
}