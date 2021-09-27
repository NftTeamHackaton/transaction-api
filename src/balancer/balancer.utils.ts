import { BigNumber } from 'bignumber.js';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Contract } from '@ethersproject/contracts';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';
import {
    SOR,
    SwapInfo,
    SwapTypes,
    scale,
    bnum,
    SubgraphPoolBase,
} from '@balancer-labs/sor2';

export async function getSwap(
    provider: JsonRpcProvider,
    networkId,
    poolsSource: string,
    tokenIn,
    tokenOut,
    swapType: SwapTypes,
    swapAmount: BigNumber
): Promise<SwapInfo> {
    const sor = new SOR(provider, networkId, poolsSource);
    // Will get onChain data for pools list
    await sor.fetchPools();

    // gasPrice is used by SOR as a factor to determine how many pools to swap against.
    // i.e. higher cost means more costly to trade against lots of different pools.
    const gasPrice = new BigNumber('40000000000');
    // This determines the max no of pools the SOR will use to swap.
    const maxPools = 4;

    // This calculates the cost to make a swap which is used as an input to sor to allow it to make gas efficient recommendations.
    // Note - tokenOut for SwapExactIn, tokenIn for SwapExactOut
    const outputToken =
        swapType === SwapTypes.SwapExactOut ? tokenIn : tokenOut;
        
    const cost = await sor.getCostOfSwapInToken(
        outputToken.contractAddress,
        gasPrice
    );

    console.log(cost)

    const swapInfo: SwapInfo = await sor.getSwaps(
        tokenIn.contractAddress,
        tokenOut.contractAddress,
        swapType,
        swapAmount,
        { gasPrice, maxPools }
    );

    const amtInScaled =
        swapType === SwapTypes.SwapExactIn
            ? swapAmount.toString()
            : scale(swapInfo.returnAmount, -tokenIn.decimals).toString();
    const amtOutScaled =
        swapType === SwapTypes.SwapExactIn
            ? scale(swapInfo.returnAmount, -tokenOut.decimals).toString()
            : swapAmount.toString();
    const swapTypeStr =
        swapType === SwapTypes.SwapExactIn ? 'SwapExactIn' : 'SwapExactOut';
    console.log(swapTypeStr);
    console.log(`Token In: ${tokenIn.symbol}, Amt: ${amtInScaled}`);
    console.log(
        `Token Out: ${tokenOut.symbol}, Amt: ${amtOutScaled.toString()}`
    );
    console.log(`Cost to swap: ${cost.toString()}`);
    console.log(`Swaps:`);
    console.log(swapInfo.swaps);
    console.log(swapInfo.tokenAddresses);

    return swapInfo;
}