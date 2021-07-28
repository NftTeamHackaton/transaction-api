import { IsNotEmpty, IsString } from "class-validator";

export class AaveTxDto {
    @IsNotEmpty()
    @IsString()
    public erc20Symbol: string;

    @IsNotEmpty()
    @IsString()
    public address: string;

    @IsNotEmpty()
    @IsString()
    public operation: string;
}