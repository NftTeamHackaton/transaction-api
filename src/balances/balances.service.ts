import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { ERC20ABI } from 'src/config/ERC20.abi';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { Repository } from 'typeorm';
import BatchCall from "web3-batch-call";
import { HttpService } from "@nestjs/axios"

@Injectable()
export class BalancesService {

    constructor(
        @InjectRepository(CryptoAsset)
        private readonly cryptoAssetRepository: Repository<CryptoAsset>,
        private readonly config: ConfigService
    ) {}

    public async splBalances(address: string) {
        let addressesInDB = await this.cryptoAssetRepository.createQueryBuilder('c').select('c.contract_address').where('c.type = :type', {type: 'SPL'}).getRawMany()
        let params = addressesInDB.map(function (item) {
            return [
                address,
                {
                    mint: item.contract_address
                },
                {
                encoding: "jsonParsed"
                }
            ]
        })
        console.log(params)
        const httpService = new HttpService()
        const resp = await (await httpService.post('https://api.mainnet-beta.solana.com', [
            {
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByDelegate",
                params: params
            }
        ], {
            headers: {
                "Content-Type": "application/json"
            }
        }).toPromise()).data
        return resp
    }

    public async erc20Balances(address: string, network: string) {
        let addressesInDB = await this.cryptoAssetRepository.createQueryBuilder('c').select('c.contract_address').where('c.type = :type', {type: 'ERC20'}).getRawMany()
        let addresses = addressesInDB.map(e => {
            return e.contract_address
        })
        console.log(addressesInDB)
        const contracts = [
            {
                namespace: '',
                addresses: addresses,
                abi: ERC20ABI,
                allReadMethods: true,
                groupByNamespace: false,
                logging: false,
                readMethods: [
                    {
                        name: "balanceOf",
                        args: [address],
                    }
                ],

            }
        ]

        const batchCall = new BatchCall({
            provider: this.config.getInfuraURL(network)
        })
        return batchCall.execute(contracts)
    }

}
