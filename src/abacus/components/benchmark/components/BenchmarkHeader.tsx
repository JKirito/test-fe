import React from 'react';
import { BenchmarkProgress } from './BenchmarkProgress';
import '../BenchmarkHeader.scss'; // We'll create this file next

// Define props for BenchmarkHeader
interface BenchmarkHeaderProps {
  currentStep: 'filters' | 'results' | 'benchmark';
  // Add other props if needed
}

const getStepNumber = (step: 'filters' | 'results' | 'benchmark'): number => {
  switch (step) {
    case 'filters':
      return 1;
    case 'results':
      return 2;
    case 'benchmark':
      return 3;
    default:
      return 1;
  }
};

const getHeaderTitle = (step: 'filters' | 'results' | 'benchmark'): string => {
  switch (step) {
    case 'filters':
      return 'Benchmark Cost Estimates';
    case 'results':
      return 'Search Results';
    case 'benchmark':
      return 'Benchmark Analysis';
    default:
      return 'Let’s Select Projects For Cost Benchmarking';
  }
};

const getHeaderSubtitle = (step: 'filters' | 'results' | 'benchmark'): string => {
  switch (step) {
    case 'filters':
      return 'Select From The Options Below';
    case 'results':
      return 'Select Projects To Include In The Benchmark Analysis';
    case 'benchmark':
      return 'Compare And Analyse Project Cost Data';
    default:
      return 'Select The Options Below To Set Up Your Project Preparations.';
  }
};

const BenchmarkHeader: React.FC<BenchmarkHeaderProps> = ({ currentStep }) => {
  const currentStepNumber = getStepNumber(currentStep);
  const totalSteps = 2; // filters, results, benchmark

  return (
    <header className="benchmark-header">
      <img
        src="/icons/benchmarking.svg"
        alt="Benchmarking Logo"
        className="benchmark-header__logo"
      />
      <div className="benchmark-header__content">
        <h1 className="benchmark-header__title">{getHeaderTitle(currentStep)}</h1>
        <p className="benchmark-header__subtitle">{getHeaderSubtitle(currentStep)}</p>
      </div>
      <div className="benchmark-header__progress-bar">
        <BenchmarkProgress
          currentStepNumber={currentStepNumber}
          totalSteps={totalSteps}
          progressStartingText="Complete steps to proceed"
        />
      </div>
    </header>
  );
};

export default BenchmarkHeader;
