import styles from './SidebarCard.module.scss';

interface SidebarCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SidebarCard = ({ className, children, style }: SidebarCardProps) => {
  return (
    <div className={`${styles.sidebarCard} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default SidebarCard;
