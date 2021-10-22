import { Controller, Get, Res } from '@nestjs/common';
import { Account, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { loadPoolInfo, PoolTransactions } from '@project-serum/pool';
import BN from 'bn.js';
import { Response } from 'express';

@Controller('serum')
export class SerumController {

    @Get('')
    public async test(@Res() response: Response) {
        console.log(clusterApiUrl('mainnet-beta'))
        let connection = new Connection('https://solana-api.projectserum.com');

        let poolAddress = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'); // Address of the pool.
        let poolInfo = await loadPoolInfo(connection, poolAddress);
        console.log(poolInfo)
        return response.status(200).send(poolInfo)
    }

}
