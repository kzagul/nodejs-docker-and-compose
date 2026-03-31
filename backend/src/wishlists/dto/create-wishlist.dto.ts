import { IsString, IsUrl, IsArray } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  name: string;
  @IsUrl()
  image: string;
  @IsArray()
  // wishesId: number[];
  itemsId: number[];
}
