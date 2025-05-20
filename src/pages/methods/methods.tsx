import './methods.scss';
import { useState } from 'react';
import { useAppSelector } from '@/lib/store/store';
import { MethodsHeader } from './components/methods-header/methods-header';
import { MethodsContent } from './components/methods-content/methods-content';

export default function Methods() {
  const [currentProgress, setProgress] = useState<number>(0);
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const { user } = useAppSelector((state) => state.auth);
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  const handleMaxDepthChange = (depth: number) => {
    setMaxDepth(depth);
  };

  const handleProgressChange = (progress: number) => {
    setProgress(progress);
  };

  return (
    <div className="methods e-pd-40 e-margin-centered">
      <MethodsHeader firstName={firstName} maxDepth={maxDepth} currentProgress={currentProgress} />
      <MethodsContent
        onProgressChange={handleProgressChange}
        onMaxDepthChange={handleMaxDepthChange}
      />
    </div>
  );
}
