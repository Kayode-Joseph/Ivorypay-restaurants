import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { GetRestaurantDto } from './dto/GetRestaurant';
import { CreateRestaurantDto } from './dto/createRestaurant';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Get()
  //calulating the logitude / latitude range in the service layer in an expensive operation
  //we dont want to block the http thread
  async getRestaurant(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    getRestaurantsParam: GetRestaurantDto,
  ) {
    const { city } = getRestaurantsParam;
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
}
