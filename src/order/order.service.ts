import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { AddressEntity } from './entities/address.entity';
import { Repository } from 'typeorm/repository/Repository';
import { CreateOrderDTO } from './dtos/create-order.dto';
import { DataSource } from 'typeorm/data-source/DataSource';
import { QuoteService } from 'src/quote/quote.service';
import { QuoteStatus } from 'src/quote/enums/status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    private readonly dataSource: DataSource,
    private readonly quoteService: QuoteService,
  ) {}

  async createOrder(dto: CreateOrderDTO): Promise<OrderEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const address = this.addressRepository.create(dto.address);
      const savedAddress = await queryRunner.manager.save(address);

      const order = this.orderRepository.create({
        ...dto,
        address: savedAddress,
      });
      const savedOrder = await queryRunner.manager.save(order);
      await this.quoteService.updateStatus(dto.quoteId, QuoteStatus.APPROVED);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
