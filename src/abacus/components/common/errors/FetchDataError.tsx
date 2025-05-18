import { AlertCircle } from 'lucide-react';

const FetchDataError = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center flex flex-col items-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Failed to Fetch Data</h1>
        <p className="text-lg text-gray-600">
          There was an error retrieving the data. Please try again later or contact support if the
          issue persists.
        </p>
      </div>
    </div>
  );
};

export default FetchDataError;
