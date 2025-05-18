import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBenchmark } from '../../store';
import styles from './GalileoHeader.module.scss';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';

const GalileoHeader: React.FC = () => {
  const navigate = useNavigate();

  const {
    hasAppliedFilters,
    currentView,
    setCurrentView,
    showChartsWithoutFilters,
    setShowChartsWithoutFilters,
  } = useBenchmark();

  const user = useSelector((state: RootState) => state.auth.user);

  const handleToggleView = () => {
    if (currentView === 'table') {
      // If we're in table view, switch to chart view
      setShowChartsWithoutFilters(!hasAppliedFilters);
      setCurrentView('chart');
    } else {
      // If we're in chart view, switch to table view
      setCurrentView('table');
    }
  };

  return (
    <header className={styles.galileoHeader}>
      <img src="/icons/galileo.svg" alt="Galileo Logo" className={styles.logo} />
      <div className={styles.content}>
        <h1 className={styles.title}>
          Let's Get Started,{' '}
          <span className="e-heading-5 e-600 e-brand-title">
            {user?.name.split(' ')[0] || 'User'}
          </span>
        </h1>
        <p className={styles.subtitle}>Select From The Options Below</p>
      </div>
      <div className="e-btn-group e-btn-group--equal ">
        <button onClick={() => navigate('/galileo/search')} className="e-btn-reset e-btn-outline">
          Switch To Analytics
        </button>
        <button onClick={handleToggleView} className="e-btn-apply">
          {currentView === 'chart' && (hasAppliedFilters || showChartsWithoutFilters)
            ? 'View Data'
            : 'Generate Charts'}
        </button>
      </div>
    </header>
  );
};

export default GalileoHeader;
