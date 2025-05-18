import { Link } from 'react-router-dom';

interface ActionCardProps {
  href: string;
  icon: React.ReactNode;
  header: string;
  description: string;
  className?: string;
}

const ActionCard = ({ href, icon, header, description, className }: ActionCardProps) => (
  <Link
    to={href}
    className={`relative flex items-start p-4 md:p-6 bg-activeOrange rounded-3xl shadow-md hover:shadow-lg transition-shadow cursor-pointer min-h-[184px] min-w-[300px]`}
  >
    {/* Icon and header positioned absolutely */}
    <div className="absolute top-6 left-6 flex">
      <div className="flex-shrink-0 mr-6">{icon}</div>
      <h2 className="text-lg md:text-xl font-bold text-titlePrimaryBlue">{header}</h2>
    </div>

    {/* Description centered in card */}
    <div className="w-full h-full flex items-center justify-center">
      <p
        className={`text-base text-black  font-light font-poppins text-left max-w-[80%] ml-[28px] ${className}`}
      >
        {description}
      </p>
    </div>
  </Link>
);

export default ActionCard;
