import React from 'react';

// Logo Component
export const Logo: React.FC = () => (
  <div className="absolute -top-24 flex flex-col items-center">
    <img src="/einstein-logo.png" alt="Einstein Logo" className="h-40 mb-1" />
    <h1 className="text-4xl font-bold text-blue-600 mb-4">Einstein</h1>
  </div>
);
