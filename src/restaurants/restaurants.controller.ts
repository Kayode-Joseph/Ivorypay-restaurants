import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { GetRestaurantQueryParams } from './dto/GetRestaurant';
import { RestaurantResponse } from './dto/commonRestaurant';
import { CreateRestaurantDto } from './dto/createRestaurant';
import { RestaurantsService } from './restaurants.service';
import { RestaurantNamePathVariable } from './dto/commonRestaurant';
import { pipe } from 'rxjs';
import { UpdateRestaurantRequest } from './dto/updateRestaurant';

@Controller('/v1/restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Get()
  //using async because calulating the logitude / latitude range in the service layer in an expensive operation
  //we dont want to block the http thread
  async getRestaurants(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    getRestaurantsParam: GetRestaurantQueryParams,
  ): Promise<RestaurantResponse[]> {
    //the result would already be sorted by RestaurantServiceModel#orderScore, in descending order
    //so the best match restaurants are at the top of the list
    return await this.restaurantService.findRestaurants(getRestaurantsParam);
  }

  @Post()
  async createRestaurant(
    @Body(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    createRestaurant: CreateRestaurantDto,
  ): Promise<CreateRestaurantDto> {
    return await this.restaurantService.createRestuarants(createRestaurant);
  }

  //restuarants are idempotent by name so we can delete by name
  //todo: use global pipes
  @Delete(':name')
  async deleteRestaurant(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    nameObject: RestaurantNamePathVariable,
  ): Promise<RestaurantResponse> {
    return await this.restaurantService.deleteRestaurant(nameObject.name);
  }

  @Put('name')
  async updateRestaurant(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    nameObject: RestaurantNamePathVariable,
    @Body(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    updateRestaurant: UpdateRestaurantRequest,
  ): Promise<RestaurantResponse> {
    return await this.restaurantService.updateRestaurant(
      nameObject.name,
      updateRestaurant,
    );
  }
}
