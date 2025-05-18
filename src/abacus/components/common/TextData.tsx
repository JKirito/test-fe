import { cn } from '@/lib/utils/tailwind';
import type { ClassNameValue } from 'tailwind-merge';

interface TextDataProps {
  data: string;
  inputClassName?: ClassNameValue;
}

const TextData = ({ data, inputClassName }: TextDataProps) => {
  return (
    <p
      className={cn(
        'text-md bg-primaryBlue/20 rounded-full p-4 text-titlePrimaryBlue font-poppins text-center',
        inputClassName
      )}
    >
      {data}
    </p>
  );
};

export default TextData;
