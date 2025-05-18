import { cn } from '@/lib/utils/tailwind';
import './adminSidebarItems.scss';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

const SidebarItem = ({ icon, title, isActive, onClick, isCollapsed }: SidebarItemProps) => (
  <div className={cn('sidebar-item')}>
    <button
      onClick={onClick}
      className={cn(
        'sidebar-item-button',
        isActive && 'active',
        isCollapsed && 'sidebar-item-collapsed'
      )}
    >
      <div className="icon">{icon}</div>
      {!isCollapsed && <span className="title">{title}</span>}
      {isCollapsed && <span className="tooltip">{title}</span>}
    </button>
  </div>
);

export default SidebarItem;
