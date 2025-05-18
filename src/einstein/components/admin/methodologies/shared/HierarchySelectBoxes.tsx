import React from 'react';
import MultiSelectTag from '@/einstein/components/common/multiSelectTag/MultiSelectTag';
import { MethodologyNode } from '../types'; // Updated import path

interface HierarchySelectBoxesProps {
  parentId: string | null;
  level: number;
  methodologies: MethodologyNode[];
  selectedHierarchy: { [key: string]: string[] };

  onSelect: (parentId: string | null, values: string[]) => void;
}

const HierarchySelectBoxes: React.FC<HierarchySelectBoxesProps> = ({
  parentId,
  level,
  methodologies,
  selectedHierarchy,
  onSelect,
}) => {
  const getChildren = (parentId: string | null): MethodologyNode[] => {
    return methodologies.filter((methodology) => methodology.parentId === parentId) || [];
  };

  const children = getChildren(parentId);
  if (children.length === 0) return null;

  const parent = methodologies.find((methodology) => methodology._id === parentId);

  return (
    <div key={level} className="">
      <div className="text-base font-medium mb-4 text-gray-600">
        {parent
          ? parent.nodeType === 'step'
            ? `Steps under ${parent.name}`
            : `Options under ${parent.name}`
          : 'Service Lines'}
      </div>
      <MultiSelectTag
        label={`Level ${level + 1}`}
        options={children.map((child) => ({
          value: child._id,
          label: child.name,
        }))}
        selectedValues={selectedHierarchy[parentId || 'root'] || []}
        onChange={(values) => onSelect(parentId, values)}
      />
      {selectedHierarchy[parentId || 'root']?.map((selectedId) => (
        <HierarchySelectBoxes
          key={selectedId}
          parentId={selectedId}
          level={level + 1}
          methodologies={methodologies}
          selectedHierarchy={selectedHierarchy}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default HierarchySelectBoxes;
