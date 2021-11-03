import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class BalancerTxDto {
    @IsNotEmpty()
    @IsString()
    public address: string;

    @IsNotEmpty()
    @IsArray()
    public tokens: string[];

    @IsNotEmpty()
    @IsString()
    public operation: string;
}