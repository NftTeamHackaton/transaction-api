import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { CryptoAsset } from 'src/entities/cryptoAsset.entity';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'src/raydium/ids';
import { Repository } from 'typeorm';

@Injectable()
export class SolanaTransactionService {

    constructor(
        @InjectRepository(CryptoAsset)
        private readonly cryptoAsset: Repository<CryptoAsset>
    ) {}

    public async getTransactions(network: web3.Cluster, address: web3.PublicKey, mint: web3.PublicKey) {
        const connection = new web3.Connection(web3.clusterApiUrl(network), 'confirmed')
        const token = await this.cryptoAsset.findOne({
            contractAddress: mint.toBase58()
        })
        console.log(token)
        const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, address, true)
        const singaturesData = await connection.getConfirmedSignaturesForAddress2(ata)
        const signatures = singaturesData.map(function(signature) {
            return signature.signature
        })
        const parsedTransactions = await connection.getParsedConfirmedTransactions(signatures)
        const final = []
        for (let i = 0; i < parsedTransactions.length; i++) {
            const detail = parsedTransactions[i]
            for(let z = 0; z < detail.transaction.message.instructions.length; z++) {
                let instruction: any = detail.transaction.message.instructions[z]
                if(instruction.parsed && instruction.parsed.info.tokenAmount) {
                    const direction = ata.toBase58() == instruction.parsed.info.source ? 'outgoing' : 'incoming'
                    final.push({
                        blockTime: detail.blockTime,
                        transactionDate: new Date(Number(detail.blockTime) * 1000),
                        signature: detail.transaction.signatures[0],
                        fee: detail.meta.fee,
                        mint: instruction.parsed.info.mint,
                        from: instruction.parsed.info.source,
                        to: instruction.parsed.info.destination,
                        decimals: instruction.parsed.info.tokenAmount.decimals,
                        amount: instruction.parsed.info.tokenAmount.amount,
                        direction: direction,
                        symbol: token?.symbol,
                        name: token?.name
                    })
                }
            }
        }
        console.log(parsedTransactions.length, final.length)
        return final
    }

    
}
    // blockTime: string;

    // transactionDate: Date;

    // signature: string;

    // fee: number;

    // from: string;

    // mint: string;

    // to: string;

    // value: string;

    // tokenName: string;

    // tokenSymbol: string;

    // tokenDecimals: number;