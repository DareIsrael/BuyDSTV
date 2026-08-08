import { PaymentVerifyResponse } from '@/types/order';

export class PaystackService {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY!;
  }

  async initializePayment(
    email: string,
    amount: number,
    reference: string,
    metadata: any
  ): Promise<{
    status: boolean;
    data: { authorization_url: string; reference: string };
  }> {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        reference,
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/verify`,
      }),
    });

    const data = await response.json();
    return data;
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    const data = await response.json();
    return data;
  }
}

export const paystackService = new PaystackService();