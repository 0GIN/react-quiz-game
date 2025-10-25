/**
 * @fileoverview Badge component
 */

import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md' 
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#232946] text-[#B8C1EC]',
    success: 'bg-[#00E096] text-[#0A0E27]',
    warning: 'bg-[#FFAA00] text-[#0A0E27]',
    error: 'bg-[#FF3D71] text-white',
    info: 'bg-[#00E5FF] text-[#0A0E27]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span 
      className={`
        inline-flex items-center font-semibold rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
    >
      {children}
    </span>
  );
}
