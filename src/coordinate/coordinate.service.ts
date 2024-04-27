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

  async calculateDegreeRangeForDistance(
    coordinates: Coordinate,
    distanceInMeters: number,
  ): Promise<[Coordinate, Coordinate]> {
    return [coordinates, coordinates];
  }

  private degreesLatitudeFromDistanceInMeters(
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

  private lengthOfOneMeterLongitude(
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
