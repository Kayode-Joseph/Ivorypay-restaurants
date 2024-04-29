import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  GetRestaurantQueryParams,
  RestaurantResponse,
} from './dto/GetRestaurant';
import { CreateRestaurantDto } from './dto/createRestaurant';
import { RestaurantsService } from './restaurants.service';
import { DeleteRestaurantParam } from './dto/deleteRestaurant';

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
    params: DeleteRestaurantParam,
  ): Promise<RestaurantResponse> {
    return await this.restaurantService.deleteRestaurant(params.name);
  }

  
}
