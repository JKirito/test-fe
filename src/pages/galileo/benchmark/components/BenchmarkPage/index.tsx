import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BenchmarkFiltersProvider } from '../../context/BenchmarkFiltersContext';
import FilterSidebar from '../FilterSidebar';
import ViewManager from '../ViewManager';
import GalileoHeader from './GalileoHeader';
import './BenchmarkPage.scss';

const BenchmarkPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.toString()) {
      // console.log('URL parameters detected:', {
      //   filters: searchParams.get('filters'),
      //   deselected: searchParams.get('deselected'),
      // });
    }
  }, [searchParams]);

  return (
    <BenchmarkFiltersProvider>
      <div className="benchmark-page">
        <GalileoHeader />
        <div className="benchmark-page__content">
          <FilterSidebar onCollapseChange={setSidebarCollapsed} />
          <div
            className="benchmark-page__main"
            style={{
              marginLeft: sidebarCollapsed ? '80px' : '368px',
            }}
          >
            <ViewManager />
          </div>
        </div>
      </div>
    </BenchmarkFiltersProvider>
  );
};

export default BenchmarkPage;
