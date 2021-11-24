import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';
import { ERC20ABI } from 'src/config/ERC20.abi';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { Repository } from 'typeorm';
import BatchCall from "web3-batch-call";

@Injectable()
export class BalancesService {

    constructor(
        @InjectRepository(CryptoAsset)
        private readonly cryptoAssetRepository: Repository<CryptoAsset>,
        private readonly config: ConfigService
    ) {}

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
