import React from 'react';
import { useHomeData } from './HomeContext';
import { HomeFormFirst } from './HomeFormFirst';
import { HomeFormSecond } from './HomeFormSecond';
import Header from './Header';
import './HomeContent.scss'; // Import main SCSS

interface AbacusCostBenchmarkHomeProps {
  setShowSuccess?: (show: boolean) => void;
}

// --- HomeContent Component ---
export const AbacusCostBenchmarkHome: React.FC<AbacusCostBenchmarkHomeProps> = ({
  setShowSuccess,
}) => {
  const { state } = useHomeData();

  // Determine current step number (1-based)
  const currentStepNumber = state.currentStep === 'first' ? 1 : 2;
  const totalSteps = 2;

  return (
    <div className="homeContent">
      <Header currentStepNumber={currentStepNumber} totalSteps={totalSteps} />
      <main className="homeContent__main">
        {state.currentStep === 'first' && <HomeFormFirst />}
        {state.currentStep === 'second' && (
          <HomeFormSecond onSubmitSuccess={() => setShowSuccess?.(true)} />
        )}
      </main>
    </div>
  );
};
