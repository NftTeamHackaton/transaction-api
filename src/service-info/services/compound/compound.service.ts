import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "src/config/config.service";
import { ServiceInfoEntity } from "src/entities/serviceInfo.entity";
import { Repository } from "typeorm";
import Compound from '@compound-finance/compound-js';
import Web3 from 'web3'
import { cTokenABI } from '../../../compound/cToken.abi';
import { ServiceInterface } from "../service.interface";

@Injectable()
export class CompoundService {

    constructor(
        @InjectRepository(ServiceInfoEntity)
        private readonly serviceInfoRepository: Repository<ServiceInfoEntity>,
        private readonly configService: ConfigService
    ) {}

    public async getAPY(network: string): Promise<ServiceInterface[]> {
        let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL(network)));

        const tokens = await this.serviceInfoRepository.find({service: "Compound"})
        const result: ServiceInterface[] = []
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            const cTokenAddress = Compound.util.getAddress("c" + token.symbol, network)
            const cToken = new provider.eth.Contract(cTokenABI, cTokenAddress);
            const rate = await cToken.methods.supplyRatePerBlock().call()
            const ethMantissa = 1 * (10 ** 18)
            const blocksPerDay = 6570
            const days = 365
            const apy = ((((rate / ethMantissa * blocksPerDay + 1) ** days)) - 1) * 100
            result.push({
                symbol: token.symbol,
                service: 'Compound',
                apy: apy.toString()
            })
        }
        return result
    }
}