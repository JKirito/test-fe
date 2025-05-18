import './dashboard-card.scss';

export interface IDashboardCard {
  path: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
  navLink: string;
}

export function DashboardCard({ path, title, subtitle, onClick }: IDashboardCard) {
  return (
    <div onClick={onClick} className="dashboard-card e-pd-24 e-br-24 e-crs-pointer">
      <img className="dashboard-card-icon" src={`/icons/${path}.svg`} alt="" />
      <div className="dashboard-card-title e-heading-6 e-700">{title}</div>
      <div className="dashboard-card-subtitle e-body-4 e-grayscale-500">{subtitle}</div>
    </div>
  );
}
