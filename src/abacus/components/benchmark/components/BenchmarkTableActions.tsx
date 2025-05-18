import React from 'react';

interface BenchmarkTableActionsProps {
  onBackToProjects: () => void;
}

const BenchmarkTableActions: React.FC<BenchmarkTableActionsProps> = ({ onBackToProjects }) => {
  return (
    <div className="benchmarkResults__actionsContainer">
      <div className="benchmarkResults__actionButtonsWrapper benchmarkResults__actionButtonsWrapper--fullWidth">
        <button
          onClick={onBackToProjects}
          className="benchmarkResults__button benchmarkResults__button--submit benchmarkResults__button--fullWidth"
        >
          Back to Project Selection
        </button>
      </div>
    </div>
  );
};

export default BenchmarkTableActions;
