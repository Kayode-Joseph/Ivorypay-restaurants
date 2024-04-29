import { Length } from "class-validator";

export class DeleteRestaurantParam {
  @Length(3)
  name: string;
}
