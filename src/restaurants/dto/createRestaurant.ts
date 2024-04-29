import { Type } from 'class-transformer';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  Length,
  Max,
  min,
  Min,
  ValidateNested,
} from 'class-validator';

export class PriceRange {
  @Min(1)
  priceRangeLowerBound: number;
  @Min(2)
  priceRangeUpperBound: number;
}

export class CreateRestaurantRequest {
  @Length(3)
  name: string;
  @Length(6, undefined, { message: 'invalid address' })
  address: string;
  @IsLongitude()
  longitude: number;
  @IsLatitude()
  latitude: number;
  @IsInt({ message: 'rating values can only be between 1 and 5' })
  @Min(1, { message: 'rating values can only be between 1 and 5' })
  @Max(5, { message: 'rating values can only be between 1 and 5' })
  @IsOptional()
  ratings: number;
  @ValidateNested()
  @Type(() => PriceRange) //price range is not cmpulsory but if provided, upper and lower bound must be provided
  priceRange: PriceRange;
}
