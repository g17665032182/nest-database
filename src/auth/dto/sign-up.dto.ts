import { IsEmail, IsOptional, IsString, MinLength } from "class-validator"

export class SignUpDto {
  @IsEmail()
  @IsOptional()
  email:string
  @IsString()
  @MinLength(8)
  password:string
}
