import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator"

export class SignInAuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string


  @IsNotEmpty()
  @IsStrongPassword()
  password: string
}
