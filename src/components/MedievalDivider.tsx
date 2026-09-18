import React from 'react';

interface MedievalDividerProps {
  className?: string;
  variant?: 'standard' | 'fleur' | 'compact';
}

export const MedievalDivider: React.FC<MedievalDividerProps> = ({
  className = '',
  variant = 'standard',
}) => {
  if (variant === 'fleur') {
    return (
      <div className={`flex items-center justify-center my-3 text-[#8a5d2b] select-none ${className}`}>
        <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#b08244] to-[#8a5d2b]" />
        <div className="mx-2 flex items-center gap-1.5 text-xs">
          <span className="text-[10px]">✦</span>
          <span className="text-base font-serif">⚜</span>
          <span className="text-[10px]">✦</span>
        </div>
        <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent via-[#b08244] to-[#8a5d2b]" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center my-1.5 text-[#8a5d2b] select-none opacity-80 ${className}`}>
        <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent via-[#b08244] to-[#8a5d2b]" />
        <span className="mx-1.5 text-[9px]">❖</span>
        <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent via-[#b08244] to-[#8a5d2b]" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center my-2 text-[#7d5225] select-none ${className}`}>
      <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-[#ab7e42] to-[#7d5225]" />
      <div className="mx-2 flex items-center gap-1.5 text-[11px] font-serif tracking-widest text-[#6c431b]">
        <span>◆</span>
        <span>❖</span>
        <span>◆</span>
      </div>
      <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-l from-transparent via-[#ab7e42] to-[#7d5225]" />
    </div>
  );
};
