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
import { UpdateRestaurantRequest } from './dto/updateRestaurant';

//every request here is validated by a global valdiator set in the src/main.ts
@Controller('/v1/restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Get()
  //using async because calulating the logitude / latitude range in the service layer in an expensive operation
  //we dont want to block the http thread
  async getRestaurants(
    @Query()
    getRestaurantsParam: GetRestaurantQueryParams,
  ): Promise<RestaurantResponse[]> {
    //the result would already be sorted by RestaurantServiceModel#orderScore, in descending order
    //so the best match restaurants are at the top of the list
    return await this.restaurantService.findRestaurants(getRestaurantsParam);
  }

  @Post()
  async createRestaurant(
    @Body()
    createRestaurant: CreateRestaurantDto,
  ): Promise<CreateRestaurantDto> {
    return await this.restaurantService.createRestuarants(createRestaurant);
  }

  //restuarants are idempotent by name so we can delete by name
  //todo: use global pipes
  @Delete(':name')
  async deleteRestaurant(
    @Param()
    nameObject: RestaurantNamePathVariable,
  ): Promise<RestaurantResponse> {
    return await this.restaurantService.deleteRestaurant(nameObject.name);
  }

  @Put(':name')
  async updateRestaurant(
    @Param()
    nameObject: RestaurantNamePathVariable,
    @Body(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
        skipMissingProperties: true, 
        //we want to skip missing properties here becuause you can decide to only updates some fields
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
