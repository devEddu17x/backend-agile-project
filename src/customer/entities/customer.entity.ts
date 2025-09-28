import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customer')
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  names: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  lastNames: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  reference: string;

  @Column({ nullable: false })
  phone: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
