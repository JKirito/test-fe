import React from 'react';

interface ResizablePaneDividerProps {
  onResize: (deltaX: number) => void;
}

const ResizablePaneDivider: React.FC<ResizablePaneDividerProps> = ({ onResize }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const lastPositionRef = React.useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPositionRef.current = e.clientX;
    e.preventDefault(); // Prevent text selection
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (isDragging && lastPositionRef.current !== null) {
        const deltaX = e.clientX - lastPositionRef.current;
        if (deltaX !== 0) {
          onResize(deltaX);
          lastPositionRef.current = e.clientX;
        }
      }
    },
    [isDragging, onResize]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    lastPositionRef.current = null;
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Change cursor for the whole document while dragging
      document.body.style.cursor = 'col-resize';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Reset cursor
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`
        w-2 hover:w-3 h-full
        bg-gray-200 hover:bg-teal-500 
        transition-all duration-150 
        cursor-col-resize 
        select-none touch-none 
        flex items-center justify-center
        ${isDragging ? 'bg-teal-500 w-3' : ''}
      `}
      onMouseDown={handleMouseDown}
      aria-label="Resize panels"
      role="separator"
      title="Drag to resize panels"
    >
      {/* Optional: Drag handle indicator */}
      <div className="h-8 flex flex-col justify-center items-center space-y-1 opacity-50">
        <div className="w-0.5 h-1 bg-gray-600 rounded-full"></div>
        <div className="w-0.5 h-1 bg-gray-600 rounded-full"></div>
        <div className="w-0.5 h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );
};

export default ResizablePaneDivider;
