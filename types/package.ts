export interface IPackage {
  _id: string;
  name: string;
  price: number;
  productType: 'dstv' | 'gotv' | 'dstv-with-dish';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePackageDTO {
  name: string;
  price: number;
  productType: 'dstv' | 'gotv' | 'dstv-with-dish';
}

export interface UpdatePackageDTO {
  name?: string;
  price?: number;
  productType?: 'dstv' | 'gotv' | 'dstv-with-dish';
}