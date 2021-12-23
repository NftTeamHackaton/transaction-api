import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { ERC20ABI } from 'src/config/ERC20.abi';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { Repository } from 'typeorm';
import BatchCall from "web3-batch-call";
import { HttpService } from "@nestjs/axios"
import Web3 from 'web3';
import { BalancesABI } from './balances.abi';

@Injectable()
export class BalancesService {

    constructor(
        @InjectRepository(CryptoAsset)
        private readonly cryptoAssetRepository: Repository<CryptoAsset>,
        private readonly config: ConfigService
    ) {}

    public async splBalances(address: string) {
        const httpService = new HttpService()
        const resp = await (await httpService.post('https://solana-api.projectserum.com', [
            {
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    address,
                    {
                        "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                    },
                    {
                        "commitment": "processed",
                        "encoding": "jsonParsed"
                    }
                ]   
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
        const web3 = new Web3(new Web3.providers.HttpProvider(this.config.getInfuraURL(network)))
        const balancesContract = new web3.eth.Contract(BalancesABI, "0x353Eac17324100dce72c33788444b95c5c344014")
        return balancesContract.methods.getBalances(addresses, address).call()
        // console.log(addressesInDB)
        // const contracts = [
        //     {
        //         namespace: '',
        //         addresses: addresses,
        //         abi: ERC20ABI,
        //         allReadMethods: true,
        //         groupByNamespace: false,
        //         logging: false,
        //         readMethods: [
        //             {
        //                 name: "balanceOf",
        //                 args: [address],
        //             }
        //         ],

        //     }
        // ]

        // const batchCall = new BatchCall({
        //     provider: this.config.getInfuraURL(network)
        // })
        // return batchCall.execute(contracts)
    }

    public async bep20Balances(address: string) {
        let addressesInDB = await this.cryptoAssetRepository.createQueryBuilder('c').select('c.contract_address').where('c.type = :type', {type: 'BEP20'}).getRawMany()
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
            provider: "https://bsc-dataseed.binance.org"
        })
        return batchCall.execute(contracts)
    }

}
