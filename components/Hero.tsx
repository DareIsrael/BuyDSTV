// 'use client';

// import { motion } from 'framer-motion';
// import { Button } from './Button';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';

// export const Hero: React.FC = () => {
//   const router = useRouter();
//   const { data: session } = useSession();

//   const handleBuy = (product: 'dstv' | 'gotv') => {
//     const checkoutUrl = `/checkout?product=${product}`;
//     if (session) {
//       router.push(checkoutUrl);
//     } else {
//       router.push(`/auth/login?product=${product}&callbackUrl=${encodeURIComponent(checkoutUrl)}`);
//     }
//   };

//   return (
//     <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
//       {/* Video Background */}
//       <video
//         autoPlay
//         loop
//         muted
//         playsInline
//         className="absolute inset-0 w-full h-full object-contain md:object-cover scale-90 md:scale-100"
//       >
//         <source
//           src="https://res.cloudinary.com/dveill0ji/video/upload/v1774876119/DstvMotion_jpswci.mp4"
//           type="video/mp4"
//         />
//       </video>

//       {/* Overlay */}
//       <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/60 to-dark/90" />

//       {/* Content */}
//       <div className="relative z-10 text-center px-4 pt-16">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           <h1 className="text-3xl md:text-7xl font-bold mb-6">
//             <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//               Premium Entertainment
//             </span>
//             <br />
//             <span className="text-white">At Your Fingertips</span>
//           </h1>
//           <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
//             Get the best DSTV and GOTV decoders with amazing subscription packages.
//             Upgrade your entertainment experience today!
//           </p>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.2 }}
//           className="flex flex-col sm:flex-row gap-6 justify-center"
//         >
//           <Button
//             size="lg"
//             onClick={() => handleBuy('dstv')}
//             className="min-w-[200px]"
//           >
//             Buy DSTV+Dish
//           </Button>
//           <Button
//             size="lg"
//             variant="outline"
//             onClick={() => handleBuy('gotv')}
//             className="min-w-[200px]"
//           >
//             Buy GOTV+Antenna
//           </Button>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 1, delay: 0.5 }}
//           className="mt-16"
//         >
//           <p className="text-gray-400 text-sm">
//             Fast Delivery • Secure Payment • 24/7 Support
//           </p>
//           <p className="text-gray-400 text-sm">
//            For Support, Call or Whatsapp: 09164633598
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   );
// };




'use client';

import { motion } from 'framer-motion';
import { Button } from './Button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const Hero: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBuy = (product: 'dstv' | 'gotv' | 'dstv-with-dish') => {
    const checkoutUrl = `/checkout?product=${product}`;
    if (session) {
      router.push(checkoutUrl);
    } else {
      router.push(`/auth/login?product=${product}&callbackUrl=${encodeURIComponent(checkoutUrl)}`);
    }
  };

  // Select video URL based on device
  const videoUrl = isMobile
    ? "https://res.cloudinary.com/dveill0ji/video/upload/v1774943918/mobile5_a1uhpo.mp4"
    : "https://res.cloudinary.com/dveill0ji/video/upload/v1774876119/DstvMotion_jpswci.mp4";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          key={videoUrl} // Force re-render when video URL changes
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            minWidth: '100%',
            minHeight: '100%',
          }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Overlay - Optimized for both mobile and desktop */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 md:from-dark/80 md:via-dark/60 md:to-dark/90" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 pt-24 pb-8 sm:pt-28 md:py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
              Premium Entertainment
            </span>
            <span className="text-white text-2xl sm:text-3xl md:text-5xl block mt-2">
              At Your Fingertips
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 md:mb-12 max-w-2xl mx-auto px-2 leading-relaxed">
            Get the best DSTV and GOTV decoders with amazing subscription packages.
            Upgrade your entertainment experience today!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
        >
          <Button
            size="lg"
            onClick={() => handleBuy('dstv')}
            className="w-full sm:w-auto min-w-[200px]"
          >
            Buy DSTV Decoder Only
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleBuy('dstv-with-dish')}
            className="w-full sm:w-auto min-w-[200px]"
          >
            Buy DSTV+Dish
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleBuy('gotv')}
            className="w-full sm:w-auto min-w-[200px]"
          >
            Buy GOTV+Antenna
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-10 md:mt-14 space-y-4 px-4"
        >
          <p className="text-gray-300 text-xs sm:text-sm font-medium tracking-wide uppercase">
            Fast Delivery • Secure Payment • 24/7 Support
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
            {/* WhatsApp Chat Button */}
            <a
              href="https://wa.me/2349164633598"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 hover:text-emerald-100 text-xs sm:text-sm font-medium transition-all shadow-md hover:scale-105"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.999 1.595-1.156 4.218 4.316-1.132 1.584.986zm10.748-4.887c-.244-.122-1.444-.712-1.668-.794-.223-.081-.386-.122-.549.122-.163.245-.631.794-.773.957-.143.163-.285.184-.529.061-.244-.122-1.033-.381-1.968-1.214-.727-.648-1.218-1.448-1.361-1.693-.143-.245-.015-.377.107-.499.11-.11.244-.285.366-.427.122-.143.163-.245.244-.407.082-.163.041-.306-.02-.428-.061-.122-.549-1.325-.752-1.812-.198-.475-.399-.411-.549-.418l-.468-.008c-.163 0-.427.061-.65.306-.224.245-.855.836-.855 2.039 0 1.203.876 2.364.998 2.527.122.163 1.724 2.632 4.177 3.691.583.252 1.038.403 1.393.516.586.186 1.12.16 1.542.097.471-.07 1.444-.591 1.647-1.161.204-.571.204-1.06.143-1.161-.061-.102-.224-.163-.468-.285z" />
              </svg>
              <span>WhatsApp Chat</span>
            </a>

            {/* Email Link */}
            <a
              href="mailto:support@buydstv.com.ng"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/80 hover:bg-gray-800 border border-gray-700/60 text-gray-200 hover:text-white text-xs sm:text-sm transition-all shadow-md hover:scale-105"
            >
              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>support@buydstv.com.ng</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};