import React from 'react';

interface NoDataMessageProps {
  message: string;
  isLoading?: boolean;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ message, isLoading = false }) => {
  return (
    <div className="benchmark-table__no-data">
      {isLoading && (
        <div className="benchmark-table__loading-spinner"></div>
      )}
      <p className="benchmark-table__no-data-message">{message}</p>
    </div>
  );
};

export default NoDataMessage;
