import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClothesSize } from '../enum/size.enum';
import { Gender } from '../enum/gender.enum';

@Entity('clothes')
export class ClothesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  name: string;

  @Column({ type: 'text', length: 500, nullable: false })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'enum', enum: Gender, length: 10, nullable: true })
  genre: string;

  @Column({ type: 'enum', enum: ClothesSize, length: 10, nullable: false })
  size: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
