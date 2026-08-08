export interface ICustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  role: 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export interface CreateCustomerDTO {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin';
}
