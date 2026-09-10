import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[#21262d] rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};
