import { OrderStatus } from '../enum/order-status.enum';

export interface OrderSummary {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  deliveryDate: Date;
  quoteId: string;
  customer: {
    id: string;
    names: string;
    lastNames: string;
    phone: string;
  };
  address: {
    id: string;
    department: string;
    city: string;
    district: string;
    street: string;
  };

  totalClothes: number; // Total unique base clothes
  totalUnitsToProduced: number; // Total units (sum of quantities * variants)
}
