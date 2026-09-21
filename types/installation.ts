export type ProductType = 'dstv' | 'gotv' | 'dstv-with-dish' | 'dstv-explora';

export interface IInstallation {
  _id: string;
  productType: ProductType;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstallationDTO {
  productType: ProductType;
  price: number;
  isActive?: boolean;
}

export interface UpdateInstallationDTO {
  price?: number;
  isActive?: boolean;
}
