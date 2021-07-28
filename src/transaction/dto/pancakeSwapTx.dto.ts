import { IsNotEmpty, IsString } from "class-validator";

export class PancakeSwapDto {
    @IsNotEmpty()
    @IsString()
    public address: string;

    @IsNotEmpty()
    @IsString()
    public token0: string;

    @IsNotEmpty()
    @IsString()
    public token1: string;

    @IsNotEmpty()
    @IsString()
    public operation: string;
}