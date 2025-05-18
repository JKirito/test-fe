import React from 'react';
import './ToggleFullscreen.scss';
import { Maximize2, Minimize2 } from 'lucide-react';
import { FullscreenProvider, useFullscreen } from './ToggleFullscreenContext';

interface FullscreenContainerProps {
  children: React.ReactNode;
}

const ToggleFullscreenInner: React.FC<FullscreenContainerProps> = ({ children }) => {
  const { isFullscreen, setFullscreen } = useFullscreen();
  // // console.log('ToggleFullscreenInner: isFullscreen', isFullscreen);
  return (
    <div className={`fullscreen ${isFullscreen ? 'fullscreen--active' : ''}`}>
      <div className="fullscreen__backdrop"></div>
      <button className="fullscreen__toggle" onClick={() => setFullscreen(!isFullscreen)}>
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>
      <div className="fullscreen__content">{children}</div>
    </div>
  );
};

const ToggleFullscreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FullscreenProvider>
      <ToggleFullscreenInner>{children}</ToggleFullscreenInner>
    </FullscreenProvider>
  );
};

export default ToggleFullscreen;
