import { IsNotEmpty, IsString } from "class-validator";

export class CreateListDto {
    @IsNotEmpty()
    @IsString()
    meta: string;

    @IsNotEmpty()
    @IsString()
    network: string;

    type: string;
}