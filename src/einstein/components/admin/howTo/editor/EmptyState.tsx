import React from 'react';
import { Info } from 'lucide-react';

/**
 * EmptyState component shown when no How-To item is selected
 */
const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="p-6 rounded-lg max-w-md">
        <Info className="h-10 w-10 text-titlePrimaryBlue mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-titlePrimaryBlue mb-2">No How-To Selected</h2>
        <p className="text-gray-600 mb-4">
          Select a how-to item from the list on the left to view or edit its details.
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
