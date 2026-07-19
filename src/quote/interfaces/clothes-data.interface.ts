import { QuoteStatus } from '../enums/status.enum';

export interface QuoteSummary {
  id: string;
  total: number;
  customerId: string;
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    names: string;
    lastNames: string;
    phone: string;
  };
  totalClothes: number;
  totalUnitsToProduced: number;
}
