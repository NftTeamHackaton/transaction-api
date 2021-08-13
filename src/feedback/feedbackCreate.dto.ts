import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class FeedBackCreateDto {
    @IsNotEmpty()
    @IsString()
    @Length(1, 100)
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    title: string;

    @IsNotEmpty()
    @IsString()
    @Length(1, 1000)
    text: string;
}