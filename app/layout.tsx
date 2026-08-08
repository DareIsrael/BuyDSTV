import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BuyDSTV - DSTV & GOTV Decoders',
  description: 'Purchase DSTV and GOTV decoders with subscription packages. Fast delivery, secure payment.',
  icons: {
    icon: '/BuyDSTV_LOGO.png',
    shortcut: '/BuyDSTV_LOGO.png',
    apple: '/BuyDSTV_LOGO.png',
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
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}