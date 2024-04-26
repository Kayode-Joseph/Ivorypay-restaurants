import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class PriceRange {
  @Min(1)
  priceRangeLowerBound: number;
  @Min(2)
  priceRangeUpperBound: number;
}

export class CreateRestaurantDto {
  @Length(3)
  name: string;
  @Length(6, undefined, { message: 'invalid address' })
  address: string;
  @IsLongitude()
  longitude: number;
  @IsLatitude()
  latitude: number;
  @ValidateNested()
  @Type(() => PriceRange) //price range is not cmpulsory but if provided, upper and lower bound must be provided
  priceRange: PriceRange;
}
