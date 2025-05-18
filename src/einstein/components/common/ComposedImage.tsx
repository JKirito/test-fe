import React from 'react';

interface ComposedLogoProps {
  logoUrl: string;
}

const ComposedLogo: React.FC<ComposedLogoProps> = ({ logoUrl }) => {
  const isTestEnv = window.Cypress;
  const backgroundPath = isTestEnv
    ? '/__cypress/src/einstein_background.png'
    : '/einstein_background.png';

  return (
    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
      <img
        src={backgroundPath}
        alt="Background"
        className="object-contain absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      <img
        src={logoUrl}
        alt="Logo"
        className="object-contain absolute"
        style={{
          width: '75%',
          height: '75%',
          top: '50%',
          left: '53%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
};

export default ComposedLogo;
