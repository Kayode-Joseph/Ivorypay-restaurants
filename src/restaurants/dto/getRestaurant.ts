import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsPositive,
  Length,
} from 'class-validator';
import { PriceCategory } from '../common/priceCategory.enum';

export class GetRestaurantDto {
  @Length(3)
  city: string;
  @IsLongitude()
  longitude: number;
  @IsLatitude()
  latitude: number;
  @IsInt()
  @IsPositive()
  distance: number;
  @IsEnum(PriceCategory)
  priceCategory: PriceCategory;
}
