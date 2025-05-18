import React from 'react';

interface DocumentTypeSelectorProps {
  documentType: 'framework' | 'template' | 'example';

  onChange: (value: 'framework' | 'template' | 'example') => void;
}

const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({ documentType, onChange }) => {
  return (
    <div className="mt-6">
      <div className="text-base font-medium text-gray-600 mb-2">Type of Document</div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="framework"
            checked={documentType === 'framework'}
            onChange={() => onChange('framework')}
          />
          Framework
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="template"
            checked={documentType === 'template'}
            onChange={() => onChange('template')}
          />
          Template
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="example"
            checked={documentType === 'example'}
            onChange={() => onChange('example')}
          />
          Best Practice Examples
        </label>
      </div>
    </div>
  );
};

export default DocumentTypeSelector;
