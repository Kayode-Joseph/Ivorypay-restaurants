import { IsInt, IsLatitude, IsLongitude, Length } from 'class-validator';

export class GetRestaurantDto {
  @Length(3)
  city: string;
  @IsLongitude()
  longitude: number;
  @IsLatitude()
  latitude: number;
  @IsInt()
  distance: number;
}
