import { PriceCategory } from './priceCategory.enum';

export class RestaurantServiceModel {
  orderScore?: number = 0;
  address: string;
  longitude: number;
  latitude: number;
  priceCategory: PriceCategory | null;
  ratings: number;
}
