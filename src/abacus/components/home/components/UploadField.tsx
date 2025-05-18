import React from 'react';
import { Download, Upload, X } from 'lucide-react';
import './UploadField.scss';

interface UploadFieldProps {
  type: 'upload' | 'download';
  text: string;
  onClick?: () => void;
  onRemove?: () => void;
  displayText?: string;
  containerClassName?: string;
  inputClassName?: string;
  required?: boolean;
}

export const UploadField: React.FC<UploadFieldProps> = ({
  type,
  text,
  onClick,
  onRemove,
  displayText,
  containerClassName,
  inputClassName,
  required,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.();
  };

  const buttonClasses = `upload-field__button ${inputClassName || ''}`.trim();
  const containerClasses = `upload-field ${containerClassName || ''}`.trim();

  if (type === 'download') {
    return (
      <div className={containerClasses}>
        <button type="button" className={buttonClasses}>
          <span className="upload-field__content-wrapper">
            {text}
            <Download className="upload-field__icon" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <button type="button" onClick={handleClick} className={buttonClasses}>
        <span className="upload-field__content-wrapper">
          {displayText || text}
          {required && <span className="upload-field__required-indicator">*</span>}
        </span>
        <span className="upload-field__content-wrapper">
          <Upload className="upload-field__icon" />
          {displayText && onRemove && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleRemove}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleRemove(e as unknown as React.MouseEvent);
                }
              }}
              className="upload-field__remove-button"
              title="Remove file"
            >
              <X className="upload-field__remove-icon" />
            </div>
          )}
        </span>
      </button>
    </div>
  );
};
