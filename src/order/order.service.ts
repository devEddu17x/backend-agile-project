import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { AddressEntity } from './entities/address.entity';
import { Repository } from 'typeorm/repository/Repository';
import { CreateOrderDTO } from './dtos/create-order.dto';
import { DataSource } from 'typeorm/data-source/DataSource';
import { QuoteService } from 'src/quote/quote.service';
import { QuoteStatus } from 'src/quote/enums/status.enum';
import { OrderSummary } from './interfaces/order-summary.interface';
import { OrderStatus } from './enum/order-status.enum';
import { ClothesService } from 'src/clothes/services/clothes.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    private readonly dataSource: DataSource,
    private readonly quoteService: QuoteService,
    private readonly clothesService: ClothesService,
  ) {}

  async createOrder(dto: CreateOrderDTO): Promise<OrderEntity> {
    const quote = await this.quoteService.getQuoteById(dto.quoteId);

    const clothesIds = [
      ...new Set(
        quote.details.map((detail) => detail.clothesVariant.clothesId),
      ),
    ];

    const draftCheck =
      await this.clothesService.checkIfClothesAreDraft(clothesIds);

    if (draftCheck.hasDrafts) {
      const draftNames = draftCheck.draftClothes
        .map((c) => `"${c.name}"`)
        .join(', ');
      throw new BadRequestException(
        `Cannot create order. The following clothes are still in draft mode and must be completed first: ${draftNames}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const address = this.addressRepository.create(dto.address);
      const savedAddress = await queryRunner.manager.save(address);
      const order = this.orderRepository.create({
        quoteId: dto.quoteId,
        total: quote.total,
        deliveryDate: new Date(dto.deliveryDate),
        address: savedAddress,
      });
      console.log(order);
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

  async getOrders(): Promise<OrderSummary[]> {
    return this.fetchOrders();
  }

  async getOrderById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'address',
        'quote',
        'quote.customer',
        'quote.details',
        'quote.details.clothesVariant',
        'quote.details.clothesVariant.clothes',
      ],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<any> {
    try {
      const order = await this.orderRepository.update(
        {
          id,
        },
        {
          status,
        },
      );
      if (order.affected === 0) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      return this.orderRepository.findOne({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating order status');
    }
  }

  async getOrdersByStatus(status: OrderStatus): Promise<OrderSummary[]> {
    return this.fetchOrders(undefined, status);
  }

  /**
   * Private method that builds and executes the query to fetch orders with all related data
   * @param orderId - Optional. Filter by specific order ID
   * @param status - Optional. Filter by specific status
   * @returns Array of orders with summary
   */
  private async fetchOrders(
    orderId?: string,
    status?: OrderStatus,
  ): Promise<OrderSummary[]> {
    const queryBuilder = this.buildOrderSummaryQuery();

    // Apply filters if provided
    if (orderId) {
      queryBuilder.where('order.id = :orderId', { orderId });
    }

    if (status) {
      if (orderId) {
        queryBuilder.andWhere('order.status = :status', { status });
      } else {
        queryBuilder.where('order.status = :status', { status });
      }
    }

    // Execute query
    const orders = await queryBuilder.getRawAndEntities();

    // Map results
    const result = this.mapToOrderSummary(orders);

    if (!result || result.length === 0) {
      const message = status
        ? `No orders found for status: ${status}`
        : 'No orders found';
      throw new NotFoundException(message);
    }

    return result;
  }

  /**
   * Builds query builder to get order summary with customer, address, and clothes aggregation
   * @returns Configured QueryBuilder
   */
  private buildOrderSummaryQuery() {
    return (
      this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.address', 'address')
        .leftJoin('order.quote', 'quote')
        .leftJoinAndSelect('quote.customer', 'customer')
        .leftJoin('quote.details', 'quoteDetail')
        .leftJoin('quoteDetail.clothesVariant', 'variant')
        .select([
          // Order fields
          'order.id',
          'order.total',
          'order.status',
          'order.createdAt',
          'order.deliveryDate',
          'order.quoteId',
          // Address fields
          'address.id',
          'address.department',
          'address.city',
          'address.district',
          'address.street',
          // Customer fields
          'customer.id',
          'customer.names',
          'customer.lastNames',
          'customer.phone',
        ])
        // Total unique base clothes (from quote details)
        .addSelect('COUNT(DISTINCT variant.clothes_id)', 'totalClothes')
        // Total units to produce (sum of quantities from quote details)
        .addSelect(
          'COALESCE(SUM(quoteDetail.quantity), 0)',
          'totalUnitsToProduced',
        )
        .groupBy('order.id')
        .addGroupBy('address.id')
        .addGroupBy('customer.id')
        .orderBy('order.createdAt', 'DESC')
    );
  }

  /**
   * Maps the results of the query to the OrderSummary interface
   * @param orders - Result of getRawAndEntities()
   * @returns Array of OrderSummary
   */
  private mapToOrderSummary(orders: {
    entities: OrderEntity[];
    raw: any[];
  }): OrderSummary[] {
    return orders.entities.map((order, index) => {
      const rawData = orders.raw[index];
      return {
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        deliveryDate: order.deliveryDate,
        quoteId: order.quoteId,
        customer: {
          id: rawData.customer_id,
          names: rawData.customer_names,
          lastNames: rawData.customer_lastNames,
          phone: rawData.customer_phone,
        },
        address: {
          id: order.address.id,
          department: order.address.department,
          city: order.address.city,
          district: order.address.district,
          street: order.address.street,
        },
        totalClothes: parseInt(rawData.totalClothes) || 0,
        totalUnitsToProduced: parseInt(rawData.totalUnitsToProduced) || 0,
      };
    });
  }
}
