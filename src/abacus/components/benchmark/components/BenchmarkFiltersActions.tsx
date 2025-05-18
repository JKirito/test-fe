import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BenchmarkFiltersActionsProps {
  isLoading: boolean;
  onGenerate: () => void;
}

const BenchmarkFiltersActions: React.FC<BenchmarkFiltersActionsProps> = ({
  isLoading,
  onGenerate,
}) => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/abacus-cost');
  };

  return (
    <div className="benchmarkFilters__actionsContainer">
      <div className="benchmarkFilters__actionButtonsWrapper">
        {/* Exit button */}
        <button
          onClick={handleExit}
          disabled={isLoading}
          className="benchmarkFilters__button benchmarkFilters__button--exit"
          aria-disabled={isLoading}
        >
          Exit
        </button>

        {/* Generate Results button */}
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className={`benchmarkFilters__button benchmarkFilters__button--submit ${
            isLoading ? 'benchmarkFilters__button--disabled' : ''
          }`}
        >
          {isLoading ? 'Generating Results...' : 'Generate Results'}
        </button>
      </div>
    </div>
  );
};

export default BenchmarkFiltersActions;
