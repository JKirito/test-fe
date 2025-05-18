import { useNavigate } from 'react-router-dom';
import './Abacus-cost-home.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

const Header = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="abacus-cost-home__header">
      <img
        src="/icons/abacus-cost.svg"
        alt="Galileo Logo"
        className="abacus-cost-home__header__logo"
      />
      <div className="abacus-cost-home__header__content">
        <h1 className="abacus-cost-home__header__title">
          Let's Get Started,{' '}
          <span className="e-heading-5 e-600 e-brand-title">
            {user?.name.split(' ')[0] || 'User'}
          </span>
        </h1>
        <p className="abacus-cost-home__header__subtitle">Select From The Options Below</p>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  onClick: () => void;
}

const Cards = ({ title, imageSrc, onClick, subtitle }: CardProps) => (
  <div className="abacus-cost-home__card" onClick={onClick}>
    <img src={imageSrc} alt={title} />
    <h2>{title}</h2>
    <span>{subtitle}</span>
  </div>
);

const AbacusCostHome: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.roles.includes('ADMIN');
  const navigate = useNavigate();
  return (
    <div className="abacus-cost-home">
      <Header />
      <div className="abacus-cost-home__cards-container">
        <Cards
          title="Search Our Database"
          subtitle="Search within a curated database of project costing information"
          imageSrc="/icons/satellite.svg"
          onClick={() => {
            navigate('/abacus-cost/search');
          }}
        />

        {isAdmin && (
          <Cards
            title="Add To Our Database"
            subtitle="Add new project cost estimation information to our database for approval"
            imageSrc="/icons/observatory.svg"
            onClick={() => {
              navigate('/abacus-cost/input');
            }}
          />
        )}
        <Cards
          title="Benchmark Cost Estimates"
          subtitle="Benchmark your cost estimates against our curated cost database"
          imageSrc="/icons/satellite2.svg"
          onClick={() => {
            navigate('/abacus-cost/benchmark');
          }}
        />
      </div>
    </div>
  );
};

export default AbacusCostHome;
