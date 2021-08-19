import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
    @IsArray()
    removeContent: number[];

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsBoolean()
    isActive: boolean;
}