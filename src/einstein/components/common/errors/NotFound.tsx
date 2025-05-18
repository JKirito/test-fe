import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center flex flex-col items-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Oops! Page not found.</h1>
        <p className="text-lg text-gray-600">
          The page you are looking for might have been removed, had its name changed, or is
          temporarily unavailable.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
