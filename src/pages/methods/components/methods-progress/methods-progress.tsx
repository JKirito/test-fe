import { useEffect, useState } from 'react';
import './methods-progress.scss';

export interface IMethodsProgress {
  currentProgress: number;
  progressCount: number;
  progressStartingText?: string;
}

export function MethodsProgress({
  progressCount,
  currentProgress,
  progressStartingText,
}: IMethodsProgress) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);

  useEffect(() => {
    setCompletedSteps((prevSteps) => {
      if (currentProgress > prevSteps.length) {
        return Array.from({ length: currentProgress }, (_, i) => i);
      } else if (currentProgress < prevSteps.length) {
        const lastStepIndex = prevSteps.length - 1;
        const fadingStep = document.querySelector(
          `.methods-progress-list__item:nth-child(${lastStepIndex + 1})`
        );

        if (fadingStep) {
          fadingStep.classList.add('methods-progress-list__item--fade-out');

          setTimeout(() => {
            setCompletedSteps((prev) => prev.slice(0, -(completedSteps.length - 1)));
          }, 400);
          return prevSteps;
        } else {
          return prevSteps.slice(0, -1);
        }
      }
      return prevSteps;
    });
  }, [completedSteps.length, currentProgress]);

  return (
    <div className="methods-progress">
      <ul className="methods-progress-list">
        {Array.from({ length: progressCount }, (_, i) => i).map((item, index) => (
          <li
            key={item}
            className={`methods-progress-list__item e-br-32 ${
              completedSteps.includes(index) ? 'methods-progress-list__item--active' : ''
            }`}
          ></li>
        ))}
      </ul>

      <div className="methods-progress-content">
        <span>
          {completedSteps.length === progressCount
            ? 'You are all set 🎉'
            : completedSteps.length === 0
              ? progressStartingText || 'Select to start'
              : 'Keep going'}
        </span>
        <span>
          {completedSteps.length}/{progressCount}
        </span>
      </div>
    </div>
  );
}
