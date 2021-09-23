import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class BindAssetDto {
    @IsNotEmpty()
    @IsNumber()
    listId: number;

    @IsNotEmpty()
    @IsArray()
    assets: [
        {
            symbol: string,
            network: string,
            type: string,
        }
    ]
}