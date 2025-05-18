import React from 'react';

const TBHLogo: React.FC = () => {
  return (
    <div className="fixed bottom-16 right-16 z-50">
      <img
        src="/TBH_logo.svg"
        alt="TBH Logo"
        className="w-48 h-auto opacity-100 hover:opacity-100 transition-opacity"
      />
    </div>
  );
};

export default TBHLogo;
