import React from 'react';
import { BenchmarkProvider, useBenchmark } from './BenchmarkContext';
import BenchmarkFilters from './components/BenchmarkFilters';
import BenchmarkResults from './components/BenchmarkResults';
import BenchmarkView from './components/BenchmarkView';
import BenchmarkHeader from './components/BenchmarkHeader';
import './BenchmarkContent.scss';

const BenchmarkSteps: React.FC = () => {
  const { state } = useBenchmark();

  // Determine the class for the main content area
  const mainContentClass = `benchmarkContent__main ${
    state.currentStep !== 'filters' ? 'benchmarkContent__main--fullWidth' : ''
  }`.trim();

  // Determine the class for the top-level container
  const topLevelContainerClass = `benchmarkContent benchmark-home ${
    state.currentStep !== 'filters' ? 'benchmark-home--limitedWidth' : ''
  }`.trim();

  return (
    <div className={topLevelContainerClass}>
      <BenchmarkHeader currentStep={state.currentStep} />
      <main className={mainContentClass}>
        {state.currentStep === 'filters' && <BenchmarkFilters />}
        {state.currentStep === 'results' && <BenchmarkResults />}
        {state.currentStep === 'benchmark' && <BenchmarkView />}
      </main>
    </div>
  );
};

const BenchmarkContent: React.FC = () => {
  return (
    <BenchmarkProvider>
      <BenchmarkSteps />
    </BenchmarkProvider>
  );
};

export default BenchmarkContent;
