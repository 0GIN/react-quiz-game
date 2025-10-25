/**
 * @fileoverview Input component
 */

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="input-group">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#B8C1EC] mb-1"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={`
          w-full px-4 py-2 
          bg-[#232946] 
          border ${error ? 'border-[#FF3D71]' : 'border-[#2A3353]'}
          rounded-lg 
          text-white 
          placeholder:text-[#6B7A99]
          focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-[#FF3D71]">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-[#6B7A99]">{helperText}</p>
      )}
    </div>
  );
}
