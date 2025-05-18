import React from 'react';
import './pills.scss';

type PillType = 'regular' | 'removable';

type PillStatus = 'idle' | 'hover_and_pressed' | 'focused' | 'disabled';

interface PillProps {
  label: string;
  type?: PillType;
  status?: PillStatus;
  disabled?: boolean;
  onClick?: () => void;
}

export const Pill: React.FC<PillProps> = ({ label, type, status, disabled, onClick }) => {
  return (
    <div className={`pill-container`}>
      <div className={`pill-container__pill ${disabled ? 'disabled' : ''}`}>
        <div className="pill">{label}</div>
        <img src="/icons/close.svg" alt="" onClick={onClick} />
      </div>
    </div>
  );
};
