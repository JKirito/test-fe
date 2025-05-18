import { AbacusCostBenchmarkHome } from './Abacus-cost-benchmark-home';
import { HomeProvider } from './HomeContext';
import SuccessConfirmation from './components/SuccessConfirmation';
import { useState } from 'react';
import './abacus-home.scss';

const AbacusCostInputPage = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <div className="flex w-full mx-auto flex-col bg-white px-8 min-w-[80%] abacus-home">
      <HomeProvider>
        {/* Show SuccessConfirmation if submission is successful, otherwise show HomeContent */}
        {showSuccess ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <SuccessConfirmation
              title="Submitted successfully"
              description="The project cost calculation has been successfully completed and waiting for the further approval. Click 'Close' to exit this screen and start a new calculation."
              buttonText="Close"
              onClose={handleCloseSuccess}
              imageSrc="/icons/abacus-cost.svg"
            />
          </div>
        ) : (
          <AbacusCostBenchmarkHome setShowSuccess={setShowSuccess} />
        )}
      </HomeProvider>
    </div>
  );
};

export default AbacusCostInputPage;
