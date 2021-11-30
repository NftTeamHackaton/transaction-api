export class ExitPoolEncodeFunctionDto {
    poolId: string;
    sender: string;
    recipient: string;
    assets: string[];
    minAmountsOut: string;
    userData: string;
    toInternalBalance: boolean;
}