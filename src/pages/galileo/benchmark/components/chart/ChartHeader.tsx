import React from 'react';
import './ChartHeader.scss';

interface ChartHeaderProps {
  title: string;
  description?: string;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, description }) => {
  return (
    <div className="chart-header">
      <h1 className="chart-header__title">{title}</h1>
      {description && <p className="chart-header__description">{description}</p>}
    </div>
  );
};

export default ChartHeader;
