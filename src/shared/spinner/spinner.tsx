import { cn } from '@/lib/utils/tailwind';
import './spinner.scss';

export interface ISpinner {
  size?: string;
  color?: string;
  className?: string;
}

export function Spinner({ size, color, className }: ISpinner) {
  return (
    <svg
      className={cn('spinner', className)}
      width={size || '24px'}
      height={size || '24px'}
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="path"
        fill="none"
        stroke={color || 'var(--e-primary-500)'}
        strokeWidth="6"
        strokeLinecap="round"
        cx="33"
        cy="33"
        r="30"
      ></circle>
    </svg>
  );
}
