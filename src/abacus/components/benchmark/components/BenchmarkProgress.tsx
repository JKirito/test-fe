import { useEffect, useState } from 'react';
import './BenchmarkProgress.scss'; // Import the new SCSS file that we'll create next

export interface IBenchmarkProgress {
  currentStepNumber: number;
  totalSteps: number;
  progressStartingText?: string;
}

export function BenchmarkProgress({
  totalSteps,
  currentStepNumber,
  progressStartingText,
}: IBenchmarkProgress) {
  // Initialize state to 0 steps visually complete
  const [completedStepsVisual, setCompletedStepsVisual] = useState<number[]>([]);

  // Effect to handle visual updates based on currentStepNumber
  useEffect(() => {
    // Target number of visually completed steps is current step - 1
    const targetCompletedCount = Math.max(0, currentStepNumber - 1);

    setCompletedStepsVisual((prevSteps) => {
      const prevCompletedCount = prevSteps.length;

      if (targetCompletedCount > prevCompletedCount) {
        // Moving forward: fill steps up to the target count
        return Array.from({ length: targetCompletedCount }, (_, i) => i + 1); // Store 1-based numbers
      } else if (targetCompletedCount < prevCompletedCount) {
        // Moving backward: Animate fade-out
        const stepsToFade = prevSteps.slice(targetCompletedCount);

        stepsToFade.forEach((stepNumber) => {
          const fadingStep = document.querySelector(
            `.benchmark-progress-list__item:nth-child(${stepNumber})`
          );
          fadingStep?.classList.add('benchmark-progress-list__item--fade-out');
        });

        setTimeout(() => {
          // Update state after animation
          setCompletedStepsVisual((prev) => prev.filter((step) => step <= targetCompletedCount));
        }, 400);

        return prevSteps; // Return previous state until timeout updates
      }
      return prevSteps; // No change
    });
  }, [currentStepNumber]);

  // Determine text based on the actual current step number
  let progressText = progressStartingText || 'Select to start';
  if (currentStepNumber > 1 && currentStepNumber <= totalSteps) {
    progressText = 'Keep going';
  } else if (currentStepNumber > totalSteps) {
    // This state might occur briefly after final submission before navigation
    progressText = 'You are all set 🎉';
  }

  // Display number can reflect completed steps or current step, let's show completed
  const displayCompletedCount = completedStepsVisual.length;

  return (
    <div className="benchmark-progress">
      <ul className="benchmark-progress-list">
        {/* Use totalSteps for mapping */}
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => (
          <li
            key={`step-${stepNumber}`}
            // Check if the current stepNumber is included in the visual state
            className={`benchmark-progress-list__item e-br-32 ${
              completedStepsVisual.includes(stepNumber)
                ? 'benchmark-progress-list__item--active'
                : ''
            }`}
          ></li>
        ))}
      </ul>

      <div className="benchmark-progress-content">
        <span>{progressText}</span>
        <span>
          {/* Show completed count / total steps */}
          {displayCompletedCount}/{totalSteps}
        </span>
      </div>
    </div>
  );
}
