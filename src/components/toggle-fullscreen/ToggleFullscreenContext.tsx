import { createContext, useContext, useState } from 'react';

interface FullscreenContextType {
  isFullscreen: boolean;
  setFullscreen: (isFullscreen: boolean) => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export const FullscreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFullscreen, setFullscreen] = useState(false);
  // // console.log('FullscreenProvider: isFullscreen', isFullscreen);

  return (
    <FullscreenContext.Provider value={{ isFullscreen, setFullscreen }}>
      <div className={isFullscreen ? 'fullscreen--active-provider' : ''}>{children}</div>
    </FullscreenContext.Provider>
  );
};

export const useFullscreen = () => {
  const context = useContext(FullscreenContext);
  if (!context) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
};
