import { IsNotEmpty, IsString } from 'class-validator';

export class CompoundTxDto {
    @IsNotEmpty()
    @IsString()
    public erc20Symbol: string;
    
    @IsNotEmpty()
    @IsString()
    public сTokenSymbol: string;

    @IsNotEmpty()
    @IsString()
    public address: string;

    @IsNotEmpty()
    @IsString()
    public operation: string;
}