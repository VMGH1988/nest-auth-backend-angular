import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateMailDto {
    @IsNotEmpty()
    name: string;
    @IsEmail()
    email: string;

}
