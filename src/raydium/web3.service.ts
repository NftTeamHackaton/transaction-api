import { HttpService } from "@nestjs/axios"
import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js"
import { MINT_LAYOUT } from "./layouts"
import { LIQUIDITY_POOLS } from "./raydium.pools"
import { LP_TOKENS } from "./solana.tokens"

// export const commitment: Commitment = 'processed'
export const commitment: Commitment = 'confirmed'
// export const commitment: Commitment = 'finalized'

export async function findProgramAddress(seeds: Array<Buffer | Uint8Array>, programId: PublicKey) {
  const [publicKey, nonce] = await PublicKey.findProgramAddress(seeds, programId)
  return { publicKey, nonce }
}

export async function createAmmAuthority(programId: PublicKey) {
  return await findProgramAddress(
    [new Uint8Array(Buffer.from('amm authority'.replace('\u00A0', ' '), 'utf-8'))],
    programId
  )
}

export async function getFilteredProgramAccounts(
    connection: Connection,
    programId: PublicKey,
    filters: any
  ): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
    // @ts-ignore
    const resp = await connection._rpcRequest('getProgramAccounts', [
      programId.toBase58(),
      {
        commitment: connection.commitment,
        filters,
        encoding: 'base64'
      }
    ])
    if (resp.error) {
      throw new Error(resp.error.message)
    }
    // @ts-ignore
    return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], 'base64'),
        executable,
        owner: new PublicKey(owner),
        lamports
      }
    }))
  }
  
  export async function getFilteredProgramAccountsAmmOrMarketCache(
    cacheName: String,
    connection: Connection,
    programId: PublicKey,
    filters: any
  ): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
    try {
      if (!cacheName) {
        throw new Error('cacheName error')
      }
      const httpService = new HttpService()
  
    //   const resp = await (await fetch('https://api.raydium.io/cache/rpc/' + cacheName)).json()
      const resp = await (await httpService.get('https://api.raydium.io/cache/rpc/' + cacheName).toPromise()).data
      if (resp.error) {
        throw new Error(resp.error.message)
      }
      // @ts-ignore
      return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
        publicKey: new PublicKey(pubkey),
        accountInfo: {
          data: Buffer.from(data[0], 'base64'),
          executable,
          owner: new PublicKey(owner),
          lamports
        }
      }))
    } catch (e) {
      return getFilteredProgramAccounts(connection, programId, filters)
    }
  }
  
  // getMultipleAccounts
  export async function getMultipleAccounts(
    connection: Connection,
    publicKeys: PublicKey[],
    commitment?: Commitment
  ): Promise<Array<null | { publicKey: PublicKey; account: AccountInfo<Buffer> }>> {
    const keys: PublicKey[][] = []
    let tempKeys: PublicKey[] = []
  
    publicKeys.forEach((k) => {
      if (tempKeys.length >= 100) {
        keys.push(tempKeys)
        tempKeys = []
      }
      tempKeys.push(k)
    })
    if (tempKeys.length > 0) {
      keys.push(tempKeys)
    }
  
    const accounts: Array<null | {
      executable: any
      owner: PublicKey
      lamports: any
      data: Buffer
    }> = []
  
    const resArray: { [key: number]: any } = {}
    await Promise.all(
      keys.map(async (key, index) => {
        const res = await connection.getMultipleAccountsInfo(key, commitment)
        resArray[index] = res
      })
    )
  
    Object.keys(resArray)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((itemIndex) => {
        const res = resArray[parseInt(itemIndex)]
        for (const account of res) {
          accounts.push(account)
        }
      })
  
    return accounts.map((account, idx) => {
      if (account === null) {
        return null
      }
      return {
        publicKey: publicKeys[idx],
        account
      }
    })
  }
  
  function throwIfNull<T>(value: T | null, message = 'account not found'): T {
    if (value === null) {
      throw new Error(message)
    }
    return value
  }
  
  export async function getMintDecimals(connection: Connection, mint: PublicKey): Promise<number> {
    const { data } = throwIfNull(await connection.getAccountInfo(mint), 'mint not found')
    const { decimals } = MINT_LAYOUT.decode(data)
    return decimals
  }
  
  export async function getFilteredTokenAccountsByOwner(
    connection: Connection,
    programId: PublicKey,
    mint: PublicKey
  ): Promise<{ context: {}; value: [] }> {
    // @ts-ignore
    const resp = await connection._rpcRequest('getTokenAccountsByOwner', [
      programId.toBase58(),
      {
        mint: mint.toBase58()
      },
      {
        encoding: 'jsonParsed'
      }
    ])
    if (resp.error) {
      throw new Error(resp.error.message)
    }
    return resp.result
  }
  
  export function getAddressForWhat(address: string) {
    for (const pool of LIQUIDITY_POOLS) {
      for (const [key, value] of Object.entries(pool)) {
        if (key === 'lp') {
          if (value.mintAddress === address) {
            return { key: 'lpMintAddress', lpMintAddress: pool.lp.mintAddress, version: pool.version }
          }
        } else if (value === address) {
          return { key, lpMintAddress: pool.lp.mintAddress, version: pool.version }
        }
      }
    }
  
    return {}
  }

  export async function getLpMintListDecimals(
    conn: any,
    mintAddressInfos: string[]
  ): Promise<{ [name: string]: number }> {
    const reLpInfoDict: { [name: string]: number } = {}
    const mintList = [] as PublicKey[]
    mintAddressInfos.forEach((item) => {
      let lpInfo = Object.values(LP_TOKENS).find((itemLpToken) => itemLpToken.mintAddress === item)
      if (!lpInfo) {
        mintList.push(new PublicKey(item))
        lpInfo = {
          decimals: null
        }
      }
      reLpInfoDict[item] = lpInfo.decimals
    })
  
    const mintAll = await getMultipleAccounts(conn, mintList, commitment)
    for (let mintIndex = 0; mintIndex < mintAll.length; mintIndex += 1) {
      const itemMint = mintAll[mintIndex]
      if (itemMint) {
        const mintLayoutData = MINT_LAYOUT.decode(Buffer.from(itemMint.account.data))
        reLpInfoDict[mintList[mintIndex].toString()] = mintLayoutData.decimals
      }
    }
    const reInfo: { [name: string]: number } = {}
    for (const key of Object.keys(reLpInfoDict)) {
      if (reLpInfoDict[key] !== null) {
        reInfo[key] = reLpInfoDict[key]
      }
    }
    return reInfo
  }