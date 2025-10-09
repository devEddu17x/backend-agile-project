import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('address')
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  departamento: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  district: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  street: string;
}
