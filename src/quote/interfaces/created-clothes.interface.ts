export interface CreatedClothes {
  total: number;
  customerId: string;
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  details: Detail[];
}

export interface Detail {
  unitPrice: number;
  quantity: number;
  quoteId: string;
  clothesVariantId: string;
  id: string;
}
