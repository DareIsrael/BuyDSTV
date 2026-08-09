import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark/90 border-t border-gray-800/50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} BuyDSTV. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href="mailto:support@buydstv.com.ng"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </a>
            <a
              href="https://wa.me/2349164633598"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
