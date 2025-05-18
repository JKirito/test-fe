'use client';

import React from 'react';

interface NoDataMessageProps {
  message?: string;
  isPreview?: boolean;
}

export const NoDataMessage: React.FC<NoDataMessageProps> = ({
  message = 'No data available',
  isPreview = false,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full"
      style={{
        padding: '24px',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--e-grayscale-50)',
        borderRadius: '12px',
      }}
    >
      <svg
        width={isPreview ? '48' : '64'}
        height={isPreview ? '48' : '64'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--e-grayscale-400)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <p
        style={{
          marginTop: '16px',
          fontSize: isPreview ? '14px' : '16px',
          color: 'var(--e-grayscale-600)',
          textAlign: 'center',
          fontFamily: 'var(--e-font-family-rubik)',
        }}
      >
        {message}
      </p>
    </div>
  );
};
