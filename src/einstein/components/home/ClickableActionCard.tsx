import { Link } from 'react-router-dom';

interface ClickableActionCardProps {
  href: string;
  icon: React.ReactNode;
  header: string;
  description: string;
  onClick?: () => void;
}

const ClickableActionCard = ({
  href,
  icon,
  header,
  description,
  onClick,
}: ClickableActionCardProps) => (
  <div
    onClick={onClick}
    className="flex items-start p-4 md:p-6 bg-activeOrange rounded-3xl shadow-md hover:shadow-lg transition-shadow cursor-pointer min-h-[184px]"
  >
    {/* Icon column - vertically centered with header */}
    <div className="flex-shrink-0 mr-6 mt-[6px]">{icon}</div>

    {/* Content column */}
    <div className="flex flex-col">
      <Link to={href}>
        <h2 className="text-lg md:text-xl font-bold text-titlePrimaryBlue mt-[5px]">{header}</h2>
      </Link>
      <p className="text-base text-black font-light mt-3 font-poppins">{description}</p>
    </div>
  </div>
);

export default ClickableActionCard;
