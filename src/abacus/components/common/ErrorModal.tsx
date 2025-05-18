import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ErrorModalProps {
  errors: string[];
  onClose: () => void;
}

const ErrorModal = ({ errors, onClose }: ErrorModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-red-600">Required Fields Missing</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primaryBlue text-white rounded hover:bg-primaryBlue/80"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
