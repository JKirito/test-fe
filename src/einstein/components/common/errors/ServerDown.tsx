import { useNavigate } from 'react-router-dom';

const ServerDown = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">Server is Down</h1>
        <p className="text-lg text-gray-600 mb-4">
          We are currently experiencing technical difficulties. Please try again later.
        </p>
        <button
          onClick={handleRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};

export default ServerDown;
