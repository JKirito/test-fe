'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import './SegmentedMenu.scss';

export interface SegmentedControlItem {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  items: SegmentedControlItem[];
  defaultActiveId?: string;
  onChange?: (item: SegmentedControlItem) => void;
  className?: string;
  fullWidth?: boolean; // Control whether the menu takes full width
}

export function SegmentedMenu({
  items,
  defaultActiveId,
  onChange,
  className,
  fullWidth = true, // Default to full width
}: SegmentedControlProps) {
  const [activeId, setActiveId] = useState<string>(
    defaultActiveId || (items.length > 0 ? items[0].id : '')
  );

  // Create refs for the container and buttons
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // State for the background position and size
  const [backgroundStyle, setBackgroundStyle] = useState({
    width: 0,
    height: 0,
    transform: 'translateX(0)',
  });

  // Function to update background position
  const updateBackgroundPosition = useCallback(() => {
    const activeButton = buttonRefs.current[activeId];
    if (activeButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setBackgroundStyle({
        width: buttonRect.width,
        height: buttonRect.height,
        transform: `translateX(${buttonRect.left - containerRect.left}px)`,
      });
    }
  }, [activeId]);

  // Update background position when activeId changes or on resize
  useEffect(() => {
    // Initial update with a small delay to ensure DOM is rendered
    const initialUpdateTimeout = setTimeout(() => {
      updateBackgroundPosition();
    }, 50);

    // Add resize listener
    const resizeObserver = new ResizeObserver(() => {
      updateBackgroundPosition();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      clearTimeout(initialUpdateTimeout);
      resizeObserver.disconnect();
    };
  }, [activeId, updateBackgroundPosition]);

  const handleItemClick = (item: SegmentedControlItem) => {
    setActiveId(item.id);
    onChange?.(item);
  };

  const containerClasses =
    `segmented-menu ${fullWidth ? 'segmented-menu--full-width' : ''} ${className || ''}`.trim();

  return (
    <div className={containerClasses} ref={containerRef}>
      {/* Sliding background */}
      <div
        className="segmented-menu__background"
        style={{
          width: `${backgroundStyle.width}px`,
          height: `${backgroundStyle.height}px`,
          transform: backgroundStyle.transform,
        }}
      />

      {/* Menu items */}
      {items.map((item) => {
        return (
          <button
            key={item.id}
            ref={(el) => (buttonRefs.current[item.id] = el)}
            type="button"
            onClick={() => handleItemClick(item)}
            className={`segmented-menu__button ${activeId === item.id ? 'segmented-menu__button--active' : ''}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
