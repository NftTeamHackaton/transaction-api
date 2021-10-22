import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import Web3 from 'web3'
import { ConfigService } from './config/config.service';
import { BalancerAbiProvider } from './balancerProvider.abi';
@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService
) {}
 
  @Get()
  async getHello() {
    let provider = new Web3(new Web3.providers.HttpProvider(this.configService.getInfuraURL('kovan')));
    const balancer = new provider.eth.Contract(BalancerAbiProvider, "0x04DC836C07926d9e03d7e032f04055d368D9d457")
    const address = "0x04DC836C07926d9e03d7e032f04055d368D9d457"
    const account = "0xF0291BE50725Ef8eA95694Ba18BF162026f8fCE9"
    const MainAccountPrivateKey = "4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318"
    const ethAmount = '0.02'
    provider.eth.accounts.wallet.add('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318');
    const res = await balancer.methods.swap({
          poolId: '0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004',
          kind: 0,
          assetIn: '0x0000000000000000000000000000000000000000',
          assetOut: '0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115',
          amount: '20000000000000000',
          userData: '0x'
      }, {
          sender: account,
          fromInternalBalance: false,
          recipient: account,
          toInternalBalance: false
      }, '1250916622', '115792089237316195423570985008687907853269984665640564039457584007913129639935').send({
          from: '0xF0291BE50725Ef8eA95694Ba18BF162026f8fCE9',
          value: Web3.utils.toWei(ethAmount),
      })
      console.log(res)
  }
}
