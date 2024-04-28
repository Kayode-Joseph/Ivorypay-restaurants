import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PriceCategory } from '../common/priceCategory.enum';

@Entity({ name: 'restaurants' })
export class Restaurant {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id?: number;
  @Column({ unique: true })
  name: string;
  @Column()
  address: string;
  @Column({ type: 'double' })
  longitude: number;
  @Column({ type: 'double' })
  latitude: number;
  @Column({ nullable: true, type: 'double' })
  priceRangeLowerBound: number;
  @Column({ nullable: true, type: 'double' })
  priceRangeUpperBound: number;
  @Column({ type: 'enum', enum: PriceCategory, nullable: true })
  priceCategory: PriceCategory | null;
  @Column({ default: 0 })
  ratings: number;
}
