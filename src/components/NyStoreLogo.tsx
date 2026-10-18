import React from 'react';

interface NyStoreLogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon' | 'card';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const NyStoreLogo: React.FC<NyStoreLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true
}) => {
  // Sizing definitions
  const iconSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const subSizes = {
    xs: 'text-[8px] tracking-wider',
    sm: 'text-[9px] tracking-widest',
    md: 'text-[10px] tracking-[0.25em]',
    lg: 'text-xs tracking-[0.28em]',
    xl: 'text-sm tracking-[0.3em]'
  };

  // Pure SVG shopping bag icon with heart exactly matching the brand logo
  const BagIcon = ({ iconClass = '' }: { iconClass?: string }) => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} shrink-0 drop-shadow-sm transition-transform duration-200 group-hover:scale-105 ${iconClass}`}
    >
      <defs>
        {/* Main bag gradient */}
        <linearGradient id="nyBagGrad" x1="50" y1="28" x2="50" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff7ea8" />
          <stop offset="45%" stopColor="#f44f85" />
          <stop offset="100%" stopColor="#e11d68" />
        </linearGradient>

        {/* Bag handle gradient */}
        <linearGradient id="nyHandleGrad" x1="50" y1="8" x2="50" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff6596" />
          <stop offset="100%" stopColor="#ec3175" />
        </linearGradient>

        {/* Soft shadow */}
        <filter id="nyShadow" x="10" y="85" width="80" height="15" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Ground drop shadow under bag */}
      <ellipse cx="50" cy="91" rx="32" ry="4.5" fill="#be185d" opacity="0.22" filter="url(#nyShadow)" />

      {/* Bag Handle (Arched semi-ring) */}
      <path
        d="M34 32 C34 16, 66 16, 66 32"
        stroke="url(#nyHandleGrad)"
        strokeWidth="7.5"
        strokeLinecap="round"
      />

      {/* Bag Body (Soft rounded trapezoid) */}
      <path
        d="M26 31 
           C29 30, 31 30, 34 30 
           L66 30 
           C69 30, 71 30, 74 31 
           C78 32, 80 35, 81 39 
           L86 78 
           C87 84, 83 89, 77 89 
           L23 89 
           C17 89, 13 84, 14 78 
           L19 39 
           C20 35, 22 32, 26 31 Z"
        fill="url(#nyBagGrad)"
      />

      {/* Subtle bag top highlight */}
      <path
        d="M28 33 Q50 36 72 33"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* White Heart in center */}
      <path
        d="M50 72 
           C49 71, 35 60, 35 49 
           C35 44, 38.5 40.5, 43 40.5 
           C46 40.5, 48.5 42, 50 44 
           C51.5 42, 54 40.5, 57 40.5 
           C61.5 40.5, 65 44, 65 49 
           C65 60, 51 71, 50 72 Z"
        fill="#ffffff"
      />
    </svg>
  );

  // Icon only
  if (variant === 'icon') {
    return <BagIcon iconClass={className} />;
  }

  // Card format (Exact replica of user's app icon with rounded square card background)
  if (variant === 'card') {
    return (
      <div
        className={`flex flex-col items-center justify-center p-5 rounded-3xl bg-gradient-to-b from-white via-rose-50/40 to-pink-50/70 border border-pink-100 shadow-lg shadow-pink-100/50 text-center ${className}`}
      >
        <BagIcon iconClass="w-24 h-24 sm:w-28 sm:h-28 mb-3" />
        <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#9f1239] leading-tight">
          Ny Store
        </span>
        {showSubtitle && (
          <span className="mt-1 text-[10px] sm:text-xs font-bold text-[#f43f5e] tracking-[0.28em] uppercase">
            BEAUTY & FASHION
          </span>
        )}
      </div>
    );
  }

  // Stacked format
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <BagIcon iconClass="mb-1.5" />
        <span className={`font-black tracking-tight text-[#9f1239] leading-tight ${titleSizes[size]}`}>
          Ny Store
        </span>
        {showSubtitle && (
          <span className={`font-bold text-[#f43f5e] uppercase ${subSizes[size]} mt-0.5`}>
            BEAUTY & FASHION
          </span>
        )}
      </div>
    );
  }

  // Default: Horizontal brand mark (Perfect for navigation bar and headers)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative p-1 rounded-2xl bg-gradient-to-b from-rose-50/80 to-pink-100/60 border border-pink-200/60 shadow-xs group-hover:border-pink-300 transition-colors">
        <BagIcon />
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-neutral-900 group-hover:text-[#be185d] transition-colors leading-tight ${titleSizes[size]}`}>
            Ny Store
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 tracking-wide">
            ຮ້ານຄ້າອອນລາຍ
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-bold text-[#f43f5e] uppercase ${subSizes[size]} mt-0.5`}>
            BEAUTY & FASHION
          </span>
        )}
      </div>
    </div>
  );
};
