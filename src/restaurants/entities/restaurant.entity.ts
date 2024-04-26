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
  @Column()
  longitude: number;
  @Column()
  latitude: number;
  @Column({ nullable: true })
  priceRangeLowerBound: number;
  @Column({ nullable: true })
  priceRangeUpperBound: number;
  @Column({ type: 'enum', enum: PriceCategory, nullable: true })
  priceCategory: PriceCategory | null;
}
