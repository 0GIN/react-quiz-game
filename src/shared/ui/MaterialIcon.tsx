import React from 'react';

interface MaterialIconProps {
  icon: string;
  className?: string;
  filled?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Material Symbols Icon Component
 * Używa Google Material Symbols: https://fonts.google.com/icons
 * 
 * @example
 * <MaterialIcon icon="history_edu" />
 * <MaterialIcon icon="public" filled />
 * <MaterialIcon icon="science" size={32} />
 */
export const MaterialIcon: React.FC<MaterialIconProps> = ({
  icon,
  className = '',
  filled = false,
  size,
  style,
}) => {
  const combinedStyle: React.CSSProperties = {
    fontSize: size ? `${size}px` : undefined,
    ...style,
  };

  return (
    <span
      className={`material-symbols-outlined ${filled ? 'material-symbols-filled' : ''} ${className}`}
      style={combinedStyle}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
};

export default MaterialIcon;
