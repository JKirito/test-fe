// src/abacus/components/home/review/FileUploadReview.tsx
import React from 'react';
import { UploadValue, AttachmentValue } from './types';
import './FileUploadReview.scss'; // Import SCSS

interface FileUploadReviewProps {
  uploadEstimate?: UploadValue;
  attachments?: AttachmentValue[];
}

const getUploadDisplayText = (uploadData?: UploadValue) => {
  if (!uploadData) return 'Not provided';
  return uploadData.type === 'file'
    ? (uploadData.value as File).name
    : (uploadData.value as string);
};

const FileUploadReview: React.FC<FileUploadReviewProps> = ({ uploadEstimate, attachments }) => {
  if (!uploadEstimate && (!attachments || attachments.length === 0)) {
    return null; // Render nothing if no files are present
  }

  return (
    <div className="fileUploadReview">
      <h4 className="fileUploadReview__title">Uploaded Files</h4>
      <div className="fileUploadReview__row">
        {/* Template Section */}
        <div className="fileUploadReview__column">
          <div className="fileUploadReview__item">
            <span className="fileUploadReview__itemLabel">Template</span>
            <span className="fileUploadReview__itemValue">Download Template</span>
          </div>
        </div>

        {/* Estimate Section */}
        {uploadEstimate && (
          <div className="fileUploadReview__column">
            <div className="fileUploadReview__item">
              <span className="fileUploadReview__itemLabel">Estimate</span>
              <span className="fileUploadReview__itemValue">
                {getUploadDisplayText(uploadEstimate)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Attachments Section */}
      {attachments && attachments.length > 0 && (
        <div className="fileUploadReview__attachmentsSection">
          <h5 className="fileUploadReview__attachmentsTitle">Additional Attachments</h5>
          <div className="fileUploadReview__attachmentsList">
            {attachments.map((attachment, index) => (
              <div key={`review-attachment-${index}`} className="fileUploadReview__item">
                <span className="fileUploadReview__itemLabel">Attachment {index + 1}</span>
                <span className="fileUploadReview__itemValue">{attachment.value.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadReview;
