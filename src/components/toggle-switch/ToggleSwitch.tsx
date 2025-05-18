// src/components/toggle-switch/ToggleSwitch.tsx
import React from 'react';
import './ToggleSwitch.scss';

interface ToggleSwitchProps {
  /** Unique identifier for the toggle switch, used for associating label */
  id: string;
  /** Current state of the toggle (true for on, false for off) */
  isOn: boolean;
  /** Callback function triggered when the toggle state changes */
  onToggle: (newState: boolean) => void;
  /** Optional label text to display next to the toggle */
  label?: string;
  /** Optional flag to disable the toggle switch */
  disabled?: boolean;
  /** Optional CSS class name for custom styling */
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  isOn,
  onToggle,
  label,
  disabled = false,
  className = '',
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onToggle(!isOn);
    }
  };

  const toggleClasses = [
    'toggle-switch',
    isOn ? 'toggle-switch--on' : 'toggle-switch--off',
    disabled ? 'toggle-switch--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="toggle-switch-container">
      {label && (
        <label htmlFor={id} className="toggle-switch-label">
          {label}
        </label>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={isOn}
        onClick={handleToggle}
        className={toggleClasses}
        disabled={disabled}
        type="button" // Explicitly set type to prevent form submission if used within a form
      >
        <span className="toggle-switch__track">
          <span className="toggle-switch__knob" />
        </span>
      </button>
    </div>
  );
};

export default ToggleSwitch;
