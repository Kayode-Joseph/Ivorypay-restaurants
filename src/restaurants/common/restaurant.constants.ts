export class RestaurantConstants {
  public static readonly LOWER_PRICE_LIMIT: number = 5000;
  public static readonly MID_PRICE_LIMIT: number = 10000;
  public static readonly PRICE_CATEGORY_MATCH_SCORE: number = 10;

  public static readonly VALIDATION_OPTIONS = {
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    forbidNonWhitelisted: true,
  };
}
