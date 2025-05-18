import { cn } from '@/lib/utils/tailwind';
import { Download, Upload, type LucideIcon } from 'lucide-react';
import type { ClassNameValue } from 'tailwind-merge';
import { useRef } from 'react';

interface UploadFieldProps {
  type: 'upload' | 'download';
  text: string;
  onClick?: () => void;
  onFileSelect?: (file: File) => void;
  inputClassName?: ClassNameValue;
  disabled?: boolean;
  accept?: string;
  file?: File;
}

const UploadField = ({
  type,
  text,
  onClick,
  onFileSelect,
  inputClassName,
  disabled = false,
  accept,
  file,
}: UploadFieldProps) => {
  const Icon: LucideIcon = type === 'upload' ? Upload : Download;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (type === 'upload') {
      fileInputRef.current?.click();
    } else {
      onClick?.();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect?.(file);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-10 w-10" />
      </div>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between px-6 py-3 w-full',
          'border-[1px] border-black rounded-lg',
          'text-titlePrimaryBlue font-poppins',
          'hover:bg-black/10 transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          inputClassName
        )}
      >
        {file ? file.name : text}
      </button>
      {type === 'upload' && (
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default UploadField;
