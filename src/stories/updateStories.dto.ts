import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateStoriesDto {
    @IsNotEmpty()
    @IsNumber()
    storiesId: number;

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