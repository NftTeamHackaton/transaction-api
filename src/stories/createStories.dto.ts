import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStoriesDto {
    @IsNotEmpty()
    @IsNumber()
    previewId: number;

    @IsNotEmpty()
    @IsArray()
    contents: number[];

    @IsNotEmpty()
    @IsString()
    name: string;
}