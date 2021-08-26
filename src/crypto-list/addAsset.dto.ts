import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class AddAssetDto {
    @IsNotEmpty()
    @IsNumber()
    listId: number;

    @IsNotEmpty()
    @IsArray()
    assets: CryptoAssetInterface[]
}