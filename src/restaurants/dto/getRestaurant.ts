import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsPositive,
  Length,
} from 'class-validator';
import { PriceCategory } from '../common/priceCategory.enum';
import { RestaurantServiceModel } from '../common/restaurant.serviceModel';

export class GetRestaurantQueryParams {
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

export type GetRestaurantResponse = Omit<RestaurantServiceModel, 'orderScore'>;
