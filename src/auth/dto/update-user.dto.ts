import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(6)
    password: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsString({ each: true }) // Asegura que cada rol sea una cadena
    roles?: string[];
}