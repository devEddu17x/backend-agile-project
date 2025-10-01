import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CLOTHES_SIZES } from '../enum/size.enum';

@Entity('size')
export class SizeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CLOTHES_SIZES, nullable: false })
  size: CLOTHES_SIZES;
}
