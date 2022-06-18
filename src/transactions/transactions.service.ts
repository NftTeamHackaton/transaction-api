import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Web3 from 'web3';
import { BRIDGE_ABI } from './bridge.abi';
import { Transactions } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
const abiDecoder = require('abi-decoder');
abiDecoder.addABI(BRIDGE_ABI)

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transactions)
        private readonly transactionRepository: Repository<Transactions>
      ) {}
    
    public async statusTransaction(hash: string) {
        return this.transactionRepository.findOne({hash})
    }

      public async cacheTransaction(hash: string, network: number) {
        let url = ""
        if(network == 1) {
            url = "https://kovan.infura.io/v3/800075abfbc641a1a59bfb477eed5c01"
        } else if (network == 2) {
            url = "https://rinkeby.infura.io/v3/800075abfbc641a1a59bfb477eed5c01"
        }

        const web3Kovan = new Web3(new Web3.providers.HttpProvider(url));
        const tx = await web3Kovan.eth.getTransactionReceipt(hash)
        const decodedLogs = abiDecoder.decodeLogs(tx.logs)
        
        const transaction = this.transactionRepository.create({hash, status: '1'})
        
        for(let i = 0; i < decodedLogs.length; i++) {
          const events = decodedLogs[i].events
          events.map(function (event) {
    
            if(event.name == "resourceID") {
              transaction.resourseID = event.value
            }
    
            if(event.name == "depositNonce") {
              transaction.nonce = web3Kovan.utils.toDecimal(event.value).toString()
            }
          })
        }
        const finalTx = await this.transactionRepository.save(transaction)
    
        return finalTx
      }

      public async voteProposal(hash: string, network: number) {
        let url = ""
        if(network == 1) {
            url = "https://kovan.infura.io/v3/800075abfbc641a1a59bfb477eed5c01"
        } else if (network == 2) {
            url = "https://rinkeby.infura.io/v3/800075abfbc641a1a59bfb477eed5c01"
        }
        const web3Kovan = new Web3(new Web3.providers.HttpProvider(url));
        const tx = await web3Kovan.eth.getTransactionReceipt(hash)
        const decodedLogs = abiDecoder.decodeLogs(tx.logs)
        
        let nonce
        let dataHash
        for(let i = 0; i < decodedLogs.length; i++) {
            const events = decodedLogs[i].events
            events.map(function(event) {
                if(event.name == "depositNonce") {
                    nonce = web3Kovan.utils.toDecimal(event.value).toString()
                }

                if(event.name == "dataHash") {
                    dataHash = event.value
                }
            })
        }
        const transaction = await this.transactionRepository.findOne({nonce})
        transaction.status = "2"
        transaction.dataHash = dataHash
        
        return this.transactionRepository.save(transaction)
      }

      public async executeProposal(nonce: string) {
            const tx = await this.transactionRepository.findOne({nonce})
            tx.status = "3"
            return this.transactionRepository.save(tx)
      }
    
      async getHello() {
        
        abiDecoder.addABI(BRIDGE_ABI)
        const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/800075abfbc641a1a59bfb477eed5c01"));
        // Execute
        const tx = await web3.eth.getTransactionReceipt("0x23f5849b3765c9cd485cff482885fe39ddd30e29064e8b14956f9882e352da00")
        const decodedLogs = abiDecoder.decodeLogs(tx.logs)
        console.log(decodedLogs[0].events)
        console.log("======================================")
        const s = await web3.eth.getTransaction("0x23f5849b3765c9cd485cff482885fe39ddd30e29064e8b14956f9882e352da00")
        const l = abiDecoder.decodeMethod(s.input)
        console.log(l)
        console.log("======================================")
        // Vote
        const tx2 = await web3.eth.getTransactionReceipt("0x7b7956fa0b080b74f7a7e01345a16b30433bb37eba8ea674d83f201cdb6a1367")
        const decodedLogs2 = abiDecoder.decodeLogs(tx2.logs)
        console.log(decodedLogs2[0].events)
        console.log("======================================")
    
        // Deposit
        const web3Kovan = new Web3(new Web3.providers.HttpProvider("https://kovan.infura.io/v3/800075abfbc641a1a59bfb477eed5c01"));
        const tx3 = await web3Kovan.eth.getTransactionReceipt("0xd6ca06eea1be1c7fd38f022194f2885dec207d1d66ee3541522ebfcc1294914c")
        const decodedLogs3 = abiDecoder.decodeLogs(tx3.logs)
        console.log(decodedLogs3[0].events)
    
        console.log(web3Kovan.utils.toDecimal('0x0000000000000000000000000000000000000000000000000000000000000006'))
        
        return ""
      }
}
