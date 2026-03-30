import { Length, IsNotEmpty, IsEmail } from 'class-validator';
export class CreateUserDto {
  @Length(2, 30)
  username: string;
  @Length(2, 200)
  about: string;
  avatar: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
