import React from 'react';

interface VideoBackgroundProps {
  className?: string;
  overlayClassName?: string;
  videoSrc?: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  className = '',
  overlayClassName = 'bg-gradient-to-b from-black/85 via-black/75 to-black/95 md:from-dark/85 md:via-dark/75 md:to-dark/95',
  videoSrc = '/MyDstv.mp4',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden ${className}`}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        style={{
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
};

