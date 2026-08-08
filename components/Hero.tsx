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
          className="mt-12 md:mt-16 space-y-2 px-4"
        >
          <p className="text-gray-300 text-xs sm:text-sm">
            Fast Delivery • Secure Payment • 24/7 Support
          </p>
          <p className="text-gray-300 text-xs sm:text-sm">
            For Support, Call or Whatsapp: 09164633598
          </p>
        </motion.div>
      </div>
    </div>
  );
};