import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CLOTHES_GENDER } from '../enum/gender.enum';

@Entity('gender')
export class GenderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CLOTHES_GENDER, nullable: false })
  gender: CLOTHES_GENDER;
}
