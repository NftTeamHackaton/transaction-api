// import { NATIVE_SOL, TokenAmount, TOKENS } from "./solana.tokens"

import { AccountInfo, clusterApiUrl, Connection, PublicKey } from "@solana/web3.js"
import { LIQUIDITY_POOL_PROGRAM_ID_V4, SERUM_PROGRAM_ID_V3 } from './ids'
import { LiquidityPoolInfo, LIQUIDITY_POOLS } from "./raydium.pools"
import { LP_TOKENS, NATIVE_SOL, TokenAmount, TOKENS } from "./solana.tokens"
import { commitment, createAmmAuthority, getAddressForWhat, getFilteredProgramAccountsAmmOrMarketCache, getLpMintListDecimals, getMultipleAccounts } from "./web3.service"
import { ACCOUNT_LAYOUT, AMM_INFO_LAYOUT, AMM_INFO_LAYOUT_V3, AMM_INFO_LAYOUT_V4, getBigNumber, MINT_LAYOUT } from './layouts'
import { cloneDeep } from "lodash"
import { OpenOrders } from "@project-serum/serum"
  
  export function getSwapOutAmount(
    poolInfo: any,
    fromCoinMint: string,
    toCoinMint: string,
    amount: string,
    slippage: number
  ) {
    const { coin, pc, fees } = poolInfo
    const { swapFeeNumerator, swapFeeDenominator } = fees
    coin.balance = new TokenAmount(coin.balance.wei, coin.decimals, true)
    pc.balance = new TokenAmount(pc.balance.wei, pc.decimals, true)
    if (fromCoinMint === coin.mintAddress && toCoinMint === pc.mintAddress) {
      // coin2pc
      const fromAmount = new TokenAmount(amount, coin.decimals, false)
      const fromAmountWithFee = fromAmount.wei
        .multipliedBy(swapFeeDenominator - swapFeeNumerator)
        .dividedBy(swapFeeDenominator)
      
      const denominator = coin.balance.wei.plus(fromAmountWithFee)
      const amountOut = pc.balance.wei.multipliedBy(fromAmountWithFee).dividedBy(denominator)
      const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100)
  
      const outBalance = pc.balance.wei.minus(amountOut)
      const beforePrice = new TokenAmount(
        parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
          parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
        pc.decimals,
        false
      )
      const afterPrice = new TokenAmount(
        parseFloat(new TokenAmount(outBalance, pc.decimals).fixed()) /
          parseFloat(new TokenAmount(denominator, coin.decimals).fixed()),
        pc.decimals,
        false
      )
      const priceImpact =
        ((parseFloat(beforePrice.fixed()) - parseFloat(afterPrice.fixed())) / parseFloat(beforePrice.fixed())) * 100
      let price = 0
      price = +new TokenAmount(
        parseFloat(amountOut) / parseFloat(amount),
        pc.decimals,
        true
      ).fixed()
      return {
        amountIn: fromAmount,
        amountOut: new TokenAmount(amountOut, pc.decimals),
        amountOutWithSlippage: new TokenAmount(amountOutWithSlippage, pc.decimals),
        priceImpact,
        executionPrice: price
      }
    } else {
      // pc2coin
      const fromAmount = new TokenAmount(amount, pc.decimals, false)
      const fromAmountWithFee = fromAmount.wei
        .multipliedBy(swapFeeDenominator - swapFeeNumerator)
        .dividedBy(swapFeeDenominator)
  
      const denominator = pc.balance.wei.plus(fromAmountWithFee)
      const amountOut = coin.balance.wei.multipliedBy(fromAmountWithFee).dividedBy(denominator)
      const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100)
  
      const outBalance = coin.balance.wei.minus(amountOut)
  
      const beforePrice = new TokenAmount(
        parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
          parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
        pc.decimals,
        false
      )
      const afterPrice = new TokenAmount(
        parseFloat(new TokenAmount(denominator, pc.decimals).fixed()) /
          parseFloat(new TokenAmount(outBalance, coin.decimals).fixed()),
        pc.decimals,
        false
      )
      const priceImpact =
        ((parseFloat(afterPrice.fixed()) - parseFloat(beforePrice.fixed())) / parseFloat(beforePrice.fixed())) * 100
      let price = 0
      price = +new TokenAmount(
        parseFloat(amountOut) / parseFloat(amount),
        coin.decimals,
        true
      ).fixed()

      return {
        amountIn: fromAmount,
        amountOut: new TokenAmount(amountOut, coin.decimals),
        amountOutWithSlippage: new TokenAmount(amountOutWithSlippage, coin.decimals),
        priceImpact,
        executionPrice: price
      }
    }
  }
  
  export function forecastBuy(market: any, orderBook: any, pcIn: any, slippage: number) {
    let coinOut = 0
    let bestPrice = null
    let worstPrice = 0
    let availablePc = pcIn
  
    for (const { key, quantity } of orderBook.items(false)) {
      const price = market?.priceLotsToNumber(key.ushrn(64)) || 0
      const size = market?.baseSizeLotsToNumber(quantity) || 0
  
      if (!bestPrice && price !== 0) {
        bestPrice = price
      }
  
      const orderPcVaule = price * size
      worstPrice = price
  
      if (orderPcVaule >= availablePc) {
        coinOut += availablePc / price
        availablePc = 0
        break
      } else {
        coinOut += size
        availablePc -= orderPcVaule
      }
    }
  
    coinOut = coinOut * 0.993
  
    const priceImpact = ((worstPrice - bestPrice) / bestPrice) * 100
  
    worstPrice = (worstPrice * (100 + slippage)) / 100
    const amountOutWithSlippage = (coinOut * (100 - slippage)) / 100
  
    // const avgPrice = (pcIn - availablePc) / coinOut;
    const maxInAllow = pcIn - availablePc
  
    return {
      side: 'buy',
      maxInAllow,
      amountOut: coinOut,
      amountOutWithSlippage,
      worstPrice,
      priceImpact
    }
  }
  
  export function forecastSell(market: any, orderBook: any, coinIn: any, slippage: number) {
    let pcOut = 0
    let bestPrice = null
    let worstPrice = 0
    let availableCoin = coinIn
  
    for (const { key, quantity } of orderBook.items(true)) {
      const price = market.priceLotsToNumber(key.ushrn(64)) || 0
      const size = market?.baseSizeLotsToNumber(quantity) || 0
  
      if (!bestPrice && price !== 0) {
        bestPrice = price
      }
  
      worstPrice = price
  
      if (availableCoin <= size) {
        pcOut += availableCoin * price
        availableCoin = 0
        break
      } else {
        pcOut += price * size
        availableCoin -= size
      }
    }
  
    pcOut = pcOut * 0.993
  
    const priceImpact = ((bestPrice - worstPrice) / bestPrice) * 100
  
    worstPrice = (worstPrice * (100 - slippage)) / 100
    const amountOutWithSlippage = (pcOut * (100 - slippage)) / 100
  
    // const avgPrice = pcOut / (coinIn - availableCoin);
    const maxInAllow = coinIn - availableCoin
  
    return {
      side: 'sell',
      maxInAllow,
      amountOut: pcOut,
      amountOutWithSlippage,
      worstPrice,
      priceImpact
    }
  }


export async function requestInfos() {

    const conn = new Connection(clusterApiUrl('mainnet-beta'))

    let ammAll: {
      publicKey: PublicKey
      accountInfo: AccountInfo<Buffer>
    }[] = []

    await Promise.all([
      await (async () => {//getFilteredProgramAccountsAmmOrMarketCache
        ammAll = await getFilteredProgramAccountsAmmOrMarketCache(
          'amm',
          conn,
          new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
          [
            {
              dataSize: AMM_INFO_LAYOUT_V4.span
            }
          ]
        )
      })(),
    ])

    const marketToLayout: { [name: string]: any } = {}

    const lpMintAddressList: string[] = []
    ammAll.forEach((item) => {
      const ammLayout = AMM_INFO_LAYOUT_V4.decode(Buffer.from(item.accountInfo.data))
      if (
        ammLayout.pcMintAddress.toString() === ammLayout.serumMarket.toString() ||
        ammLayout.lpMintAddress.toString() === '11111111111111111111111111111111'
      ) {
        return
      }
      lpMintAddressList.push(ammLayout.lpMintAddress.toString())
    })
    const lpMintListDecimls = await getLpMintListDecimals(conn, lpMintAddressList)

    for (let indexAmmInfo = 0; indexAmmInfo < ammAll.length; indexAmmInfo += 1) {
      const ammInfo = AMM_INFO_LAYOUT_V4.decode(Buffer.from(ammAll[indexAmmInfo].accountInfo.data))
      if (
        !Object.keys(lpMintListDecimls).includes(ammInfo.lpMintAddress.toString()) ||
        ammInfo.pcMintAddress.toString() === ammInfo.serumMarket.toString() ||
        ammInfo.lpMintAddress.toString() === '11111111111111111111111111111111' ||
        !Object.keys(marketToLayout).includes(ammInfo.serumMarket.toString())
      ) {
        continue
      }
      const fromCoin =
        ammInfo.coinMintAddress.toString() === TOKENS.WSOL.mintAddress
          ? NATIVE_SOL.mintAddress
          : ammInfo.coinMintAddress.toString()
      const toCoin =
        ammInfo.pcMintAddress.toString() === TOKENS.WSOL.mintAddress
          ? NATIVE_SOL.mintAddress
          : ammInfo.pcMintAddress.toString()
      let coin = Object.values(TOKENS).find((item) => item.mintAddress === fromCoin)
      if (!coin) {
        TOKENS[`unknow-${ammInfo.coinMintAddress.toString()}`] = {
          symbol: 'unknown',
          name: 'unknown',
          mintAddress: ammInfo.coinMintAddress.toString(),
          decimals: getBigNumber(ammInfo.coinDecimals),
          cache: true,
          tags: []
        }
        coin = TOKENS[`unknow-${ammInfo.coinMintAddress.toString()}`]
      }
      if (!coin.tags.includes('unofficial')) {
        coin.tags.push('unofficial')
      }

      let pc = Object.values(TOKENS).find((item) => item.mintAddress === toCoin)
      if (!pc) {
        TOKENS[`unknow-${ammInfo.pcMintAddress.toString()}`] = {
          symbol: 'unknown',
          name: 'unknown',
          mintAddress: ammInfo.pcMintAddress.toString(),
          decimals: getBigNumber(ammInfo.pcDecimals),
          cache: true,
          tags: []
        }
        pc = TOKENS[`unknow-${ammInfo.pcMintAddress.toString()}`]
      }
      if (!pc.tags.includes('unofficial')) {
        pc.tags.push('unofficial')
      }

      if (coin.mintAddress === TOKENS.WSOL.mintAddress) {
        coin.symbol = 'SOL'
        coin.name = 'SOL'
        coin.mintAddress = '11111111111111111111111111111111'
      }
      if (pc.mintAddress === TOKENS.WSOL.mintAddress) {
        pc.symbol = 'SOL'
        pc.name = 'SOL'
        pc.mintAddress = '11111111111111111111111111111111'
      }
      const lp = Object.values(LP_TOKENS).find((item) => item.mintAddress === ammInfo.lpMintAddress) ?? {
        symbol: `${coin.symbol}-${pc.symbol}`,
        name: `${coin.symbol}-${pc.symbol}`,
        coin,
        pc,
        mintAddress: ammInfo.lpMintAddress.toString(),
        decimals: lpMintListDecimls[ammInfo.lpMintAddress]
      }

      const { publicKey } = await createAmmAuthority(new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4))

      const market = marketToLayout[ammInfo.serumMarket]

      const serumVaultSigner = await PublicKey.createProgramAddress(
        [ammInfo.serumMarket.toBuffer(), market.vaultSignerNonce.toArrayLike(Buffer, 'le', 8)],
        new PublicKey(SERUM_PROGRAM_ID_V3)
      )

      const itemLiquidity: LiquidityPoolInfo = {
        name: `${coin.symbol}-${pc.symbol}`,
        coin,
        pc,
        lp,
        version: 4,
        programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
        ammId: ammAll[indexAmmInfo].publicKey.toString(),
        ammAuthority: publicKey.toString(),
        ammOpenOrders: ammInfo.ammOpenOrders.toString(),
        ammTargetOrders: ammInfo.ammTargetOrders.toString(),
        ammQuantities: NATIVE_SOL.mintAddress,
        poolCoinTokenAccount: ammInfo.poolCoinTokenAccount.toString(),
        poolPcTokenAccount: ammInfo.poolPcTokenAccount.toString(),
        poolWithdrawQueue: ammInfo.poolWithdrawQueue.toString(),
        poolTempLpTokenAccount: ammInfo.poolTempLpTokenAccount.toString(),
        serumProgramId: SERUM_PROGRAM_ID_V3,
        serumMarket: ammInfo.serumMarket.toString(),
        serumBids: market.bids.toString(),
        serumAsks: market.asks.toString(),
        serumEventQueue: market.eventQueue.toString(),
        serumCoinVaultAccount: market.baseVault.toString(),
        serumPcVaultAccount: market.quoteVault.toString(),
        serumVaultSigner: serumVaultSigner.toString(),
        official: false
      }
      if (!LIQUIDITY_POOLS.find((item) => item.ammId === itemLiquidity.ammId)) {
        LIQUIDITY_POOLS.push(itemLiquidity)
      } else {
        for (let itemIndex = 0; itemIndex < LIQUIDITY_POOLS.length; itemIndex += 1) {
          if (
            LIQUIDITY_POOLS[itemIndex].ammId === itemLiquidity.ammId &&
            LIQUIDITY_POOLS[itemIndex].name !== itemLiquidity.name &&
            !LIQUIDITY_POOLS[itemIndex].official
          ) {
            LIQUIDITY_POOLS[itemIndex] = itemLiquidity
          }
        }
      }
    }

    const liquidityPools = {} as any
    const publicKeys = [] as any

    LIQUIDITY_POOLS.forEach((pool) => {
      const { poolCoinTokenAccount, poolPcTokenAccount, ammOpenOrders, ammId, coin, pc, lp } = pool

      publicKeys.push(
        new PublicKey(poolCoinTokenAccount),
        new PublicKey(poolPcTokenAccount),
        new PublicKey(ammOpenOrders),
        new PublicKey(ammId),
        new PublicKey(lp.mintAddress)
      )

      const poolInfo = cloneDeep(pool)

      poolInfo.coin.balance = new TokenAmount(0, coin.decimals)
      poolInfo.pc.balance = new TokenAmount(0, pc.decimals)

      liquidityPools[lp.mintAddress] = poolInfo
    })

    const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)

    multipleInfo.forEach((info) => {
      if (info) {
        const address = info.publicKey.toBase58()
        const data = Buffer.from(info.account.data)

        const { key, lpMintAddress, version } = getAddressForWhat(address)

        if (key && lpMintAddress) {
          const poolInfo = liquidityPools[lpMintAddress]

          switch (key) {
            case 'poolCoinTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data)
              // quick fix: Number can only safely store up to 53 bits
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(getBigNumber(parsed.amount))

              break
            }
            case 'poolPcTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data)

              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(getBigNumber(parsed.amount))

              break
            }
            case 'ammOpenOrders': {
              const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(new PublicKey(poolInfo.serumProgramId))
              const parsed = OPEN_ORDERS_LAYOUT.decode(data)

              const { baseTokenTotal, quoteTokenTotal } = parsed
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(getBigNumber(baseTokenTotal))
              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(getBigNumber(quoteTokenTotal))

              break
            }
            case 'ammId': {
              let parsed
              if (version === 2) {
                parsed = AMM_INFO_LAYOUT.decode(data)
              } else if (version === 3) {
                parsed = AMM_INFO_LAYOUT_V3.decode(data)
              } else {
                parsed = AMM_INFO_LAYOUT_V4.decode(data)

                const { swapFeeNumerator, swapFeeDenominator } = parsed
                poolInfo.fees = {
                  swapFeeNumerator: getBigNumber(swapFeeNumerator),
                  swapFeeDenominator: getBigNumber(swapFeeDenominator)
                }
              }

              const { status, needTakePnlCoin, needTakePnlPc } = parsed
              poolInfo.status = getBigNumber(status)
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.minus(getBigNumber(needTakePnlCoin))
              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.minus(getBigNumber(needTakePnlPc))

              break
            }
            // getLpSupply
            case 'lpMintAddress': {
              const parsed = MINT_LAYOUT.decode(data)

              poolInfo.lp.totalSupply = new TokenAmount(getBigNumber(parsed.supply), poolInfo.lp.decimals)

              break
            }
          }
        }
      }
    })
    return liquidityPools
  }