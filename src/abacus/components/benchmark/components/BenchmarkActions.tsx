import React from 'react';

interface BenchmarkActionsProps {
  selectedCount: number;
  isBenchmarking: boolean;
  onGenerate: () => void;
  onBack: () => void;
}

const BenchmarkActions: React.FC<BenchmarkActionsProps> = ({
  selectedCount,
  isBenchmarking,
  onGenerate,
  onBack,
}) => {
  const isDisabled = selectedCount === 0 || isBenchmarking;

  return (
    <div className="benchmarkResults__actionsContainer">
      <div className="benchmarkResults__actionButtonsWrapper">
        {/* Back button */}
        <button
          onClick={onBack}
          disabled={isBenchmarking}
          className="benchmarkResults__button benchmarkResults__button--back"
          aria-disabled={isBenchmarking}
        >
          Back
        </button>

        {/* Generate Benchmark button */}
        <button
          onClick={onGenerate}
          disabled={isDisabled}
          className={`benchmarkResults__button benchmarkResults__button--submit ${
            isDisabled ? 'benchmarkResults__button--disabled' : ''
          }`}
          aria-disabled={isDisabled}
        >
          {isBenchmarking ? 'Generating...' : `Generate Benchmark`}
        </button>
      </div>
      {/* {selectedCount === 0 && !isBenchmarking && (
        <p className="benchmarkResults__actionsHint">
          Please select at least one project to generate a benchmark.
        </p>
      )} */}
    </div>
  );
};

export default BenchmarkActions;
