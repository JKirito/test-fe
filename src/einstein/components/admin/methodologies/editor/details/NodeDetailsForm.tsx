import React from 'react';
import { MethodologyNode } from '../../types';

interface NodeDetailsFormProps {
  node: Partial<MethodologyNode>;
  onNodeChange: (updatedNode: Partial<MethodologyNode>) => void;
  nodeType: 'regular' | 'step';
  onNodeTypeChange: (nodeType: 'regular' | 'step') => void;
}

const NodeDetailsForm: React.FC<NodeDetailsFormProps> = ({
  node,
  onNodeChange,
  nodeType,
  onNodeTypeChange,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onNodeChange({ ...node, [name]: value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onNodeChange({ ...node, [name]: value === '' ? undefined : parseInt(value, 10) });
  };

  return (
    <div className="bg-white rounded-8">
      <h3 className="text-xl font-medium mb-16 text-grayscale-950 font-rubik">Basic Information</h3>

      <div className="mb-16">
        <label htmlFor="name" className="block mb-6 font-medium text-grayscale-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={node.name || ''}
          onChange={handleInputChange}
          className="w-full px-12 py-8 border border-grayscale-300 rounded-4 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
        />
      </div>

      <div className="mb-16">
        <label htmlFor="order" className="block mb-6 font-medium text-grayscale-700">
          Order
        </label>
        <input
          type="number"
          id="order"
          name="order"
          min="0"
          value={node.order === undefined ? '' : node.order}
          onChange={handleNumberInputChange}
          className="w-full px-12 py-8 border border-grayscale-300 rounded-4 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
          placeholder="Position in the list (e.g., 0, 1, 2, ...)"
        />
        <small className="block mt-1 text-grayscale-500 text-sm">
          Lower numbers appear first in the list
        </small>
      </div>

      <div className="mb-16">
        <label htmlFor="description" className="block mb-6 font-medium text-grayscale-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={node.description || ''}
          onChange={handleInputChange}
          className="w-full px-12 py-8 border border-grayscale-300 rounded-4 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
          rows={4}
        />
      </div>

      <div className="mb-16">
        <label htmlFor="nextLevelName" className="block mb-6 font-medium text-grayscale-700">
          Next Level Name (optional)
        </label>
        <input
          type="text"
          id="nextLevelName"
          name="nextLevelName"
          value={node.nextLevelName || ''}
          onChange={handleInputChange}
          className="w-full px-12 py-8 border border-grayscale-300 rounded-4 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
          placeholder="e.g., Steps, Phases, Stages"
        />
      </div>

      <div className="mb-16">
        <label className="block mb-8 font-medium text-grayscale-950">Node Type</label>
        <div className="flex gap-24">
          <label className="flex items-center gap-6 cursor-pointer">
            <input
              type="radio"
              name="nodeType"
              value="regular"
              checked={nodeType === 'regular'}
              onChange={() => onNodeTypeChange('regular')}
              className="text-primary-500 focus:ring-primary-300"
            />
            <span className="text-grayscale-700">Regular Node</span>
          </label>
          <label className="flex items-center gap-6 cursor-pointer">
            <input
              type="radio"
              name="nodeType"
              value="step"
              checked={nodeType === 'step'}
              onChange={() => onNodeTypeChange('step')}
              className="text-primary-500 focus:ring-primary-300"
            />
            <span className="text-grayscale-700">Step Node</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsForm;
