import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils/tailwind';
import { Spinner } from '@/shared/spinner/spinner';
import type { ClassValue } from 'clsx';

interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'link';
  onClick?: () => void;
  text: string;
  className?: ClassValue;
  href?: string;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  imageClassName?: ClassValue;
  textClassName?: ClassValue;
  loading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
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
  loading = false,
  icon,
  disabled = false,
}) => {
  const baseClasses =
    'flex items-center gap-2 justify-center px-4 py-2 rounded-48 transition-colors';
  const variantClasses = {
    default: 'bg-grayscale-100 text-grayscale-700 hover:bg-grayscale-200 font-rubik',
    primary: 'bg-primary-500 text-white hover:bg-primary-600 font-rubik',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 font-rubik',
    link: 'text-titlePrimaryBlue hover:text-titlePrimaryBlue hover:underline',
  };

  const classes = cn(baseClasses, variantClasses[variant], className);

  const content = (
    <>
      {icon && <div className="flex items-center justify-center">{icon}</div>}
      {image && (
        <img
          src={image.src}
          alt={image.alt}
          width={image.width || 30}
          height={image.height || 30}
          className={cn('object-contain', imageClassName)}
        />
      )}
      {loading ? (
        <Spinner className="h-4 w-4 text-primary-500 animate-spin" />
      ) : (
        <span className={cn('text-base font-medium', textClassName)}>{text}</span>
      )}
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
    <button className={classes} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
};

export default Button;
