import { Injectable } from '@nestjs/common';
import Compound from '@compound-finance/compound-js';


@Injectable()
export class CompoundService {
    public async getAccountData(address: string) {
        const Compound = require('@compound-finance/compound-js'); // in Node.js
        // var compound = new Compound('https://kovan.infura.io/v3/cf9ea9a288c245f3bb640e6a1bc8602a');
        const cUsdcMarketData = await Compound.api.marketHistory({
            "asset": Compound.util.getAddress(Compound.cUSDC),
            "min_block_timestamp": 1559339900,
            "max_block_timestamp": 1598320674,
            "num_buckets": 10,
          });
        
          console.log('cUsdcMarketData', cUsdcMarketData);

    }
}
