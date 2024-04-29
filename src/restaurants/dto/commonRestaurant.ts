import { Length } from 'class-validator';
import { RestaurantServiceModel } from '../common/restaurant.serviceModel';

export class RestaurantNamePathVariable {
  @Length(3)
  name: string;
}
export type RestaurantResponse = Omit<RestaurantServiceModel, 'orderScore'>;
