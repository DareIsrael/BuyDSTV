export interface IOrder {
  _id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  package: string;
  totalPrice: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  reference: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  package: string;
  totalPrice: number;
  reference: string;
}

export interface PaymentInitializeRequest {
  email: string;
  amount: number;
  product: string;
  package: string;
  customerName: string;
  phone: string;
  address: string;
  customerId: string;
}

export interface PaymentVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    amount: number;
    status: string;
    reference: string;
  };
}