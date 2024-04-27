import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto, PriceRange } from './dto/createRestaurant';
import { RestaurantConstants } from './common/restaurant.constants';
import { PriceCategory } from './common/priceCategory.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Between, MoreThan, Repository } from 'typeorm';
import { GetRestaurantDto } from './dto/GetRestaurant';
import { CoordinateService } from 'src/coordinate/coordinate.service';
import { Coordinate } from 'src/coordinate/domain/coordinates.model';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly coordinateService: CoordinateService,
  ) {}

  //i wouldnt pass the dto to the service layer in a real world project, im pressed for time
  async createRestuarants(
    restaurant: CreateRestaurantDto,
  ): Promise<CreateRestaurantDto> {
    const restaurantEntity: Restaurant = {
      ...restaurant,
      ...restaurant.priceRange,
      priceCategory: this.calculatePrice(restaurant.priceRange),
    };

    await this.restaurantRepository.save(restaurantEntity);
    return restaurant;
  }

  async findRestaurants(
    findRestaurantsParams: GetRestaurantDto,
  ): Promise<Restaurant[] | null> {
    const coordinatesRange: [Coordinate, Coordinate] =
      await this.coordinateService.calculateDegreeRangeForDistance(
        { ...findRestaurantsParams },
        findRestaurantsParams.distance,
      );

    return await this.restaurantRepository.findBy({
      latitude: Between(coordinatesRange[0].latitude, coordinatesRange[1].latitude),
    });
  }

  private calculatePrice(priceRange: PriceRange): PriceCategory | null {
    if (!priceRange) {
      return null;
    }

    const medianPriceRange: number =
      (priceRange.priceRangeLowerBound + priceRange.priceRangeUpperBound) / 2;

    //using guard conditions instead of else blocks to make code cleaner and easier to understand
    if (medianPriceRange < RestaurantConstants.LOWER_PRICE_LIMIT) {
      return PriceCategory.LOW;
    }

    if (medianPriceRange < RestaurantConstants.MID_PRICE_LIMIT) {
      return PriceCategory.MID;
    }

    return PriceCategory.HIGH;
  }
}
