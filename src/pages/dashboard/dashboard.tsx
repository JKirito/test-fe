import './dashboard.scss';
import { DashboardCard } from './components/dashboard-card/dashboard-card';
// import { Header } from '../../einstein/components/common/header/header';
import { Background } from '../../shared/background/background';
import { DashboardCards } from './dashboard.model';
import { useNavigate } from 'react-router';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleClick = (path: string) => {
    // console.log('path', path);
    navigate(path);
  };

  return (
    <div className="dashboard e-pd-40 e-margin-centered">
      <Background />
      {/* <Header /> */}
      <div className="page-heading">
        <div className="page-heading__container">
          <div className="page-heading__container-title e-heading-title">
            <h1 className="e-heading-4 e-600 e-no-selection">
              Welcome,{' '}
              <span className="e-heading-4 e-600 e-brand-title e-accent-title">
                {user?.name.split(' ')[0] || 'User'}
              </span>
              {/* <span className="e-heading-4 e-600 e-accent-title"> 👋</span> */}
            </h1>
            {/* <p className="e-body-4 e-left e-no-selection">Select From The Options Below</p> */}
          </div>
        </div>
      </div>
      <div className="dashboard-cards e-mg-t-48">
        {DashboardCards.map((card, index) => (
          <DashboardCard
            onClick={() => handleClick(card.navLink)}
            key={index}
            path={card.path}
            navLink={card.navLink}
            title={card.title}
            subtitle={card.subtitle}
          />
        ))}
      </div>
    </div>
  );
}
