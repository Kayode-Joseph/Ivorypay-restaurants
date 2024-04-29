import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './createRestaurant';

export class UpdateRestaurantRequest extends OmitType(CreateRestaurantDto, [
  'name',
]) {}
