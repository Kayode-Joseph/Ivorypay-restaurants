import { Injectable } from '@nestjs/common';
import { Coordinate } from './domain/coordinates.model';

@Injectable()
export class CoordinateService {
  static readonly lengthOfOneDegreeLatitudeInMeters = 111132.92;

  //calculate the value of one meter in degrees
  static readonly lengthOfOneMeterLatitudeInDegrees =
    1 / CoordinateService.lengthOfOneDegreeLatitudeInMeters;

  static readonly LATITUDE_RANGE_LOWER_BOUND = -90; //smallest allowed latitude value

  static readonly LATITUDE_RANGE_UPPER_BOUND = 90; //biggest allowed latitude value

  static readonly LONGITUDE_RANGE_LOWER_BOUND = -180;

  static readonly LONGITUDE_RANGE_UPPER_BOUND = 180;

  static readonly EARTH_RADIUS = 6378137; // Approximate radius of the Earth (in meters)

  //source{@link: https://www.quora.com/What-is-the-longest-distance-between-any-two-places-on-earth}
  static readonly LONGEST_DISTANCE_BETWEEN_2_LONGITUDE_AND_LATITUDE_POINTS_IN_METERS = 20010000;

  //The purpose of this function is to roughly estatimate the bouding box in degree graph points.
  //imagine a sqaure where the coordinate parameter is the center of the square
  //and everypoint within the square can be gotten to without exhausting the distanceInMeters.
  //This method makes small circle longitude estimations, becuase the latitude calculation is a range,
  //the small circle diameter cannot be the same for every point on the latitude range,
  //but if the distanceInMeters is less than 200km, this estimations would have negligible error.
  async calculateDegreeRangeForDistance(
    coordinate: Coordinate,
    distanceInMeters: number,
  ): Promise<[Coordinate, Coordinate]> {
    const latitudeRange: [number, number] =
      this.calculateRangeOfLatitudeThatCoversDistanceInMeters(
        coordinate.latitude,
        distanceInMeters,
      );

    const longitudeRange: [number, number] =
      this.calculateRangeOfLongitudeThatCoversDistanceInMeters(
        coordinate.latitude,
        coordinate.longitude,
        distanceInMeters,
      );

    return [
      { latitude: latitudeRange[0], longitude: longitudeRange[0] },
      { latitude: latitudeRange[1], longitude: longitudeRange[1] },
    ];
  }

  async calculateDistanceBetween2Coordinates(
    coordinates: [Coordinate, Coordinate],
  ): Promise<number> {
    const [coord1, coord2] = coordinates;

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = this.toRadians(coord1.latitude);
    const lon1Rad = this.toRadians(coord1.longitude);
    const lat2Rad = this.toRadians(coord2.latitude);
    const lon2Rad = this.toRadians(coord2.longitude);

    // Calculate differences between latitudes and longitudes
    const latDiff = lat2Rad - lat1Rad;
    const lonDiff = lon2Rad - lon1Rad;

    // Calculate the distance using the Haversine formula
    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(lonDiff / 2) *
        Math.sin(lonDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = CoordinateService.EARTH_RADIUS * c;

    return distance;
  }

  isDistanceGreaterthanUserSpecifiedDistance(
    userDistanceToRestaurantFromCalculation: number,
    distanceToRestaurantUserRequested: number,
  ): boolean {
    if (
      distanceToRestaurantUserRequested >
      userDistanceToRestaurantFromCalculation
    ) {
      return true;
    }

    //we want to include restuarants up to 50 meters error outside the user request zone
    if (
      userDistanceToRestaurantFromCalculation -
        distanceToRestaurantUserRequested <
      50
    ) {
      return true;
    }

    return false;
  }

  //utility methods should always be below, so it doesn't ugly up the class
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private calculateRangeOfLatitudeThatCoversDistanceInMeters(
    latitude: number,
    distanceInMeters: number,
  ): [number, number] {
    const deltaLatitude =
      CoordinateService.lengthOfOneMeterLatitudeInDegrees * distanceInMeters;

    let latitudeLowerBound: number = latitude - deltaLatitude;
    let latitudeUpperBound: number = latitude + deltaLatitude;

    latitudeLowerBound =
      latitudeLowerBound < CoordinateService.LATITUDE_RANGE_LOWER_BOUND
        ? CoordinateService.LATITUDE_RANGE_LOWER_BOUND
        : latitudeLowerBound;

    latitudeUpperBound =
      latitudeUpperBound > CoordinateService.LATITUDE_RANGE_UPPER_BOUND
        ? CoordinateService.LATITUDE_RANGE_UPPER_BOUND
        : latitudeUpperBound;

    return [latitudeLowerBound, latitudeUpperBound];
  }

  private calculateRangeOfLongitudeThatCoversDistanceInMeters(
    latitude: number,
    longitude: number,
    distanceInMeters: number,
  ): [number, number] {
    // Convert latitude to radians
    const latitudeRadians = latitude * (Math.PI / 180);

    // Circumference of the Earth at the given latitude,
    // due to the mathematical properties of a sphere,
    //the circumfrence of the earth is different at different latitudes
    const circumferenceAtLatitude =
      2 * Math.PI * CoordinateService.EARTH_RADIUS * Math.cos(latitudeRadians);

    // Length of one degree of longitude at the given latitude
    const lengthOfOneDegreeLongitude = circumferenceAtLatitude / 360;

    //express distanceInMeters in terms of degree
    const deltaLongitude = (1 / lengthOfOneDegreeLongitude) * distanceInMeters;

    let longitudeLowerBound: number = longitude - deltaLongitude;
    let longitudeUpperBound: number = longitude + deltaLongitude;

    longitudeLowerBound =
      longitudeLowerBound < CoordinateService.LONGITUDE_RANGE_LOWER_BOUND
        ? CoordinateService.LONGITUDE_RANGE_LOWER_BOUND
        : longitudeLowerBound;

    longitudeUpperBound =
      longitudeUpperBound > CoordinateService.LONGITUDE_RANGE_UPPER_BOUND
        ? CoordinateService.LONGITUDE_RANGE_UPPER_BOUND
        : longitudeUpperBound;

    return [longitudeLowerBound, longitudeUpperBound];
  }
}
