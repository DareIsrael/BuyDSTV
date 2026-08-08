export interface IProduct {
  _id: string;
  name: string;
  price: number;
  type: 'dstv' | 'gotv' | 'dstv-with-dish';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  type: 'dstv' | 'gotv' | 'dstv-with-dish';
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
  type?: 'dstv' | 'gotv' | 'dstv-with-dish';
}