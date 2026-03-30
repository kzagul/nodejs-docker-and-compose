import {
  IsDecimal,
  IsNotEmpty,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateWishDto {
  @Length(1, 250)
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  link: string;

  @IsUrl()
  image: string;

  @IsDecimal()
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;
}
