import { Injectable } from '@nestjs/common';
import { CreateRestaurantRequest, PriceRange } from './dto/createRestaurant';
import { RestaurantConstants } from './common/restaurant.constants';
import { PriceCategory } from './common/priceCategory.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Between, MoreThan, Repository } from 'typeorm';
import { GetRestaurantQueryParams } from './dto/GetRestaurant';
import { CoordinateService } from 'src/coordinate/coordinate.service';
import { Coordinate } from 'src/coordinate/domain/coordinates.model';
import { RestaurantServiceModel } from './common/restaurant.serviceModel';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly coordinateService: CoordinateService,
  ) {}

  //I wouldnt pass the dto to the service layer in a real world project, im pressed for time
  async createRestuarants(
    restaurant: CreateRestaurantRequest,
  ): Promise<CreateRestaurantRequest> {
    const restaurantEntity: Restaurant = {
      ...restaurant,
      ...restaurant.priceRange,
      priceCategory: this.calculatePrice(restaurant.priceRange),
    };

    await this.restaurantRepository.save(restaurantEntity);
    return restaurant;
  }

  async findRestaurants(
    findRestaurantsParams: GetRestaurantQueryParams,
  ): Promise<RestaurantServiceModel[]> {
    //we need to first roughly estimate the range coordinates
    // that are within the specified distance before
    //going to select all the restaurants in that coordinate range,
    //doing this would reduce the amount of row returned from the DB,
    // we want few rows because the math to calculate the
    //distance between 2 coordinate point is very compuattionally expensive.
    //If we go and get all the rows in the DB and start process, the system would turn to spagetti at scale,
    // when there are a lot of restaurants
    const coordinatesRange: [Coordinate, Coordinate] =
      await this.coordinateService.calculateDegreeRangeForDistance(
        { ...findRestaurantsParams },
        findRestaurantsParams.distance,
      );

    const restaurants: Restaurant[] = await this.restaurantRepository.findBy([
      {
        latitude: Between(
          coordinatesRange[0].latitude,
          coordinatesRange[1].latitude,
        ),
        longitude: Between(
          coordinatesRange[0].longitude,
          coordinatesRange[1].longitude,
        ),
      },
    ]);

    const processedResults: RestaurantServiceModel[] =
      await this.processAndOrderRestaurants(restaurants, findRestaurantsParams);

    return processedResults;
  }

  //converts the restaurant entity to the resutaurant service model, and determines
  //the position of a restaurant on the list by 3 factors:
  //
  //1: The distance between the user and the restuarant,
  //this factor is designed to be the strongest determinant for order of the restuarant,
  //restaurants closer to the user are shown to the user first.
  //
  //
  //2.if the restuarant's price category, and the price category the user specified in the
  /**{@code findRestaurantsParams}**/
  //are the same, this is would also promote a restaurant up the list.
  //This match is the second strongest factor in determining the position of a restaurant in the finsl list shown to the user.
  //
  //3. The restaurant's rating, the restaurants rating would also play a part in
  //determining the final position of a restaurant on the list. It is the least weighted factor.

  private async processAndOrderRestaurants(
    restaurants: Restaurant[],
    findRestaurantsParams: GetRestaurantQueryParams,
  ): Promise<RestaurantServiceModel[]> {
    let processedResults: RestaurantServiceModel[] = [];

    restaurants.forEach((restaurants) => {
      processedResults.push({
        ...restaurants,
        orderScore: 0,
      });
    });

    const sortedRestaurants: RestaurantServiceModel[] = [];

    for (let i = 0; i < processedResults.length; i++) {
      const restaurant: RestaurantServiceModel = processedResults[i];

      const distanceOrderScore: number | null =
        await this.calulateDistanceOrderScore(
          restaurant,
          findRestaurantsParams,
        );

      if (distanceOrderScore === null) {
        //we dont want to process this order if  the order distance score is null
        //, because it can only be null if the distance between the user
        //and restaurant is much higher than the distance in the
        /**{@code findRestaurantsParams}**/
        console.warn(
          `Estimated restaurant distance is too far from distance bound user requested
   Restaurant:${restaurant} find restaurant params:${findRestaurantsParams}`,
        );

        break;
      }

      // this is the higher weighted score, it's max value!!! is
      /** {@code CoordinateService.LONGEST_DISTANCE_BETWEEN_2_LONGITUDE_AND_LATITUDE_POINTS_IN_METERS} **/
      // The score is calcualed as the max value minus the distance between the user and restaurant.
      // For example: if the distance between a user and a restaurant is 0, then the score return which is max value - distance,
      // is the max value, which is a very big number. Conversly, if the distance between the user and restaurant is very high,
      // then the, max value - distance, would be a very small number, which would not greatly affect the score.
      // If the score here is low, then the order would be further down the final list of restaurants returned to the user,
      // when the restuarants are later sorted by this order score field
      restaurant.orderScore = distanceOrderScore;

      //if the price category match, we want the order to be shown to the user earlier in the list,
      //this factor is the second strongest factor in determinng the order of the restaurants returned to the user
      if (findRestaurantsParams.priceCategory === restaurant.priceCategory) {
        restaurant.orderScore + RestaurantConstants.PRICE_CATEGORY_MATCH_SCORE;
      }

      //restuarants with higher ratings should have a higher order score,
      //the max value of this score is 5 as that is the highest rating,
      //so this wont have as much as an impact as the other factors, but it is still a factor.
      restaurant.orderScore = restaurant.orderScore + restaurant.ratings;

      for (let i = 0; i < sortedRestaurants.length; i++) {
        const current: RestaurantServiceModel = sortedRestaurants[i];
        //the sortedRestaurants is always sorted, so if restaurant.orderScore < current.orderScore,
        // it is lower than everything atfer the current, becase the array is sorted,
        //so everything after current has a higher orderScore than current. very efficient way to sort
        if (restaurant.orderScore < current.orderScore) {
          sortedRestaurants.splice(i, 0, restaurant);
          break;
        }
      }

      if (sortedRestaurants.length === 0) {
        sortedRestaurants.push(restaurant);
      }
    }

    return sortedRestaurants;
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

  private async calulateDistanceOrderScore(
    processedRestaurant: RestaurantServiceModel,
    findRestaurantsParams: GetRestaurantQueryParams,
  ): Promise<number | null> {
    const distanceBetweenPoints: number =
      await this.coordinateService.calculateDistanceBetween2Coordinates([
        { ...processedRestaurant },
        { ...findRestaurantsParams },
      ]);

    //if the distance between the user, and the restaurant gotten from the DB based on the estimate
    // is way more than the distance the user specfied in
    /**{@code findRestaurantsParams}**/
    //we should return null to caller, so the restaurant wont be processed as part of the results
    if (
      !this.coordinateService.isDistanceGreaterthanUserSpecifiedDistance(
        distanceBetweenPoints,
        findRestaurantsParams.distance,
      )
    ) {
      return null;
    }
    //we want the distance score to be the overwhelimg
    //favorite in determining the order of the restuarant
    // thats why if the distance is closer together,
    //the order score would be higer and no other factor can
    // really influence the order like the promixity of the user to the restuarant
    const orderScore: number =
      CoordinateService.LONGEST_DISTANCE_BETWEEN_2_LONGITUDE_AND_LATITUDE_POINTS_IN_METERS -
      distanceBetweenPoints;

    return orderScore;
  }
}
