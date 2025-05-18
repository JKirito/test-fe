import React, { useRef, useEffect, useCallback, useState, memo } from 'react';

interface DraggableOverlayProps {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  dragHandleSelector: string; // CSS selector for the element(s) that trigger drag
  className?: string;
  style?: React.CSSProperties;
  boundaryPadding?: number; // Optional padding from viewport edges
}

const DraggableOverlay: React.FC<DraggableOverlayProps> = memo(
  ({
    children,
    initialPosition = { x: 100, y: 100 }, // Default initial position
    dragHandleSelector,
    className = '',
    style = {},
    boundaryPadding = 10, // Default padding
  }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    // Use ref for drag state to avoid re-renders during drag, improving performance
    const dragStateRef = useRef({
      isDragging: false,
      // Store start mouse position relative to overlay top-left corner
      startX: 0,
      startY: 0,
      // Store current overlay top-left position
      currentX: initialPosition.x,
      currentY: initialPosition.y,
    });

    // State to force re-render for style application after initial position sync
    const [position, setPosition] = useState({ x: initialPosition.x, y: initialPosition.y });

    // Update position if initialPosition prop changes and not currently dragging
    useEffect(() => {
      if (!dragStateRef.current.isDragging) {
        dragStateRef.current.currentX = initialPosition.x;
        dragStateRef.current.currentY = initialPosition.y;
        setPosition({ x: initialPosition.x, y: initialPosition.y }); // Trigger style update
      }
    }, [initialPosition]);

    const handleMouseMove = useCallback(
      (event: MouseEvent) => {
        if (!dragStateRef.current.isDragging || !overlayRef.current) return;

        const newX = event.clientX - dragStateRef.current.startX;
        const newY = event.clientY - dragStateRef.current.startY;

        // Constrain to window bounds with padding
        const rect = overlayRef.current.getBoundingClientRect();
        // Use current dimensions if available, otherwise estimate (might be slightly off on first move)
        const overlayWidth = rect.width || 300; // Estimate width if rect not ready
        const overlayHeight = rect.height || 200; // Estimate height

        const maxX = window.innerWidth - overlayWidth - boundaryPadding;
        const maxY = window.innerHeight - overlayHeight - boundaryPadding;

        const constrainedX = Math.min(Math.max(newX, boundaryPadding), maxX);
        const constrainedY = Math.min(Math.max(newY, boundaryPadding), maxY);

        // Update ref directly for performance
        dragStateRef.current.currentX = constrainedX;
        dragStateRef.current.currentY = constrainedY;

        // Apply transform directly to the DOM element
        overlayRef.current.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
      },
      [boundaryPadding]
    );

    const handleMouseUp = useCallback(() => {
      if (!dragStateRef.current.isDragging) return;

      dragStateRef.current.isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Optional: Add transition back if needed, or manage via CSS classes toggled here
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'transform 0.1s ease-out'; // Example
      }
      // // console.log('Drag ended at:', {
      //   x: dragStateRef.current.currentX,
      //   y: dragStateRef.current.currentY,
      // });
    }, [handleMouseMove]);

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      // Check if the click target or its parent matches the drag handle selector
      const targetElement = event.target as HTMLElement;
      if (!targetElement.closest(dragHandleSelector)) {
        return; // Don't drag if click wasn't on the handle
      }

      // Prevent default text selection behavior
      event.preventDefault();

      if (overlayRef.current) {
        // Remove transition during drag for smoother movement
        overlayRef.current.style.transition = 'none';
      }

      // Calculate starting offset from the current position
      dragStateRef.current.startX = event.clientX - dragStateRef.current.currentX;
      dragStateRef.current.startY = event.clientY - dragStateRef.current.currentY;
      dragStateRef.current.isDragging = true;

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    // Cleanup listeners on unmount
    useEffect(() => {
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [handleMouseMove, handleMouseUp]);

    return (
      <div
        ref={overlayRef}
        className={className} // Apply className passed from parent
        style={{
          ...style, // Apply style passed from parent
          position: 'fixed', // Base style
          top: 0, // Base style
          left: 0, // Base style
          transform: `translate(${position.x}px, ${position.y}px)`, // Apply position via transform
          cursor: dragStateRef.current.isDragging ? 'grabbing' : 'default', // Optional: change cursor
          willChange: 'transform', // Performance hint
          touchAction: 'none', // Prevent page scroll on touch devices
        }}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    );
  }
);

export default DraggableOverlay;
