import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils/tailwind';

interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'link';
  onClick?: () => void;
  text: string;
  className?: string;
  href?: string;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  imageClassName?: string;
  textClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  onClick,
  text,
  className = '',
  href,
  image,
  imageClassName,
  textClassName,
}) => {
  const baseClasses =
    'flex items-center gap-2 justify-center px-4 py-2 rounded-md transition-colors';
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-red-500 text-white hover:bg-red-600',
    link: 'text-titlePrimaryBlue hover:text-blue-700 hover:underline',
  };

  const classes = cn(baseClasses, variantClasses[variant], className);

  const content = (
    <>
      {image && (
        <img
          src={image.src}
          alt={image.alt}
          width={image.width || 30}
          height={image.height || 30}
          className={cn('object-contain', imageClassName)}
        />
      )}
      <span className={cn('text-base font-medium', textClassName)}>{text}</span>
    </>
  );

  if (href) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick}>
      {content}
    </button>
  );
};

export default Button;
