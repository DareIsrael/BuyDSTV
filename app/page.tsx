import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';

export const metadata: Metadata = {
  title: 'Buy DSTV & GOTV Decoders Online in Nigeria — BuyDSTV',
  description:
    'Buy  DSTV decoders, GOTV decoders, and subscription packages online in Nigeria. DStv Explora, HD decoders, GOtv Jolli & more. Secure Paystack payment, fast nationwide delivery. Best prices guaranteed.',
  alternates: {
    canonical: 'https://buydstv.com.ng',
  },
};

export default function Home() {
  return <Hero />;
}
