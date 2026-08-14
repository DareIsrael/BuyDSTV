import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://buydstv.com.ng'),
  title: {
    default: 'BuyDSTV — Buy DSTV & GOTV Decoders Online in Nigeria',
    template: '%s | BuyDSTV',
  },
  description:
    'Buy DSTV and GOTV decoders with subscription packages online in Nigeria. Affordable prices, secure Paystack payment, and fast nationwide delivery. Shop DStv Explora, HD decoders, GOtv Jolli, and more.',
  keywords: [
    'buy dstv',
    'buy dstv decoder',
    'dstv decoder price in Nigeria',
    'gotv decoder',
    'buy gotv online',
    'dstv explora',
    'dstv subscription',
    'gotv jolli',
    'gotv jinja',
    'dstv Nigeria',
    'gotv Nigeria',
    'buy decoder online Nigeria',
    'dstv decoder and subscription',
    'cheap dstv decoder',
    'multichoice decoder',
  ],
  authors: [{ name: 'BuyDSTV', url: 'https://buydstv.com.ng' }],
  creator: 'BuyDSTV',
  publisher: 'BuyDSTV',
  icons: {
    icon: '/BuyDSTV_LOGO.png',
    shortcut: '/BuyDSTV_LOGO.png',
    apple: '/BuyDSTV_LOGO.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://buydstv.com.ng',
    siteName: 'BuyDSTV',
    title: 'BuyDSTV — Buy DSTV & GOTV Decoders Online in Nigeria',
    description:
      'Shop DSTV and GOTV decoders with subscription packages. Secure payment, fast delivery across Nigeria.',
    images: [
      {
        url: '/BuyDSTV_LOGO.png',
        width: 512,
        height: 512,
        alt: 'BuyDSTV Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'BuyDSTV — Buy DSTV & GOTV Decoders Online in Nigeria',
    description:
      'Shop  DSTV and GOTV decoders with subscription packages. Secure payment, fast delivery across Nigeria.',
    images: ['/BuyDSTV_LOGO.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://buydstv.com.ng',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}