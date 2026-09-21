export interface IProduct {
  _id: string;
  name: string;
  price: number;
  type: 'dstv' | 'gotv' | 'dstv-with-dish' | 'dstv-explora';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  type: 'dstv' | 'gotv' | 'dstv-with-dish' | 'dstv-explora';
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
  type?: 'dstv' | 'gotv' | 'dstv-with-dish' | 'dstv-explora';
}