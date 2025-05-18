import React from 'react';
import { HomeProgress } from './components/HomeProgress';
import './Header.scss';

// Define props for Header
interface HeaderProps {
  currentStepNumber: number;
  totalSteps: number;
  // Add other props if the Header needs them
}

const Header: React.FC<HeaderProps> = ({ currentStepNumber, totalSteps }) => {
  return (
    <header className="abacus-header">
      <img src="/icons/abacus-cost.svg" alt="Abacus Logo" className="abacus-header__logo" />
      <div className="abacus-header__content">
        <h1 className="abacus-header__title">Add To Our Database</h1>
        <p className="abacus-header__subtitle">Select From The Options Below</p>
      </div>
      <div className="abacus-header__progress-bar">
        <HomeProgress
          currentStepNumber={currentStepNumber}
          totalSteps={totalSteps}
          progressStartingText="Complete steps to proceed"
        />
      </div>
      {/* Add any other header elements here */}
      {/* <div className="header__actions">...</div> */}
    </header>
  );
};

export default Header;
