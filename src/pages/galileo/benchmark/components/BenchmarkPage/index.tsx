import React, { useState } from 'react';
import { BenchmarkStoreProvider } from '../../store';
import FilterSidebar from '../FilterSidebar';
import ViewManager from '../ViewManager';
import GalileoHeader from './GalileoHeader';
import './BenchmarkPage.scss';

const BenchmarkPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BenchmarkStoreProvider>
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
    </BenchmarkStoreProvider>
  );
};

export default React.memo(BenchmarkPage);
