import React from 'react';
import { HowToItem } from '@/lib/store/features/howto/howtoSlice';

interface HowToItemsProps {
  howTos: HowToItem[];
  onSelect: (howTo: HowToItem) => void;
  depth?: number;
}

/**
 * Component for displaying a list of HowTo items with recursive rendering for nested items
 */
const HowToItems: React.FC<HowToItemsProps> = ({ howTos, onSelect, depth = 0 }) => {
  if (!howTos || howTos.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {howTos.map((howTo) => (
        <div key={howTo._id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div
            onClick={() => onSelect(howTo)}
            className="p-4 cursor-pointer hover:bg-gray-50"
            style={{ paddingLeft: `${depth * 16 + 16}px` }}
          >
            <h3 className="text-lg font-medium text-titlePrimaryBlue">{howTo.title}</h3>
            {howTo.description && <p className="text-sm text-gray-600">{howTo.description}</p>}
          </div>

          {/* Recursively render children with increased depth */}
          {howTo.children && howTo.children.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50">
              <HowToItems howTos={howTo.children} onSelect={onSelect} depth={depth + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HowToItems;
