import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './adminSidebar.scss';
import SidebarItem from './AdminSidebarItems';
import { sidebarItems } from './mockData';
import { Menu } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-header">
        <h2 className={isCollapsed ? 'hidden' : ''}>Admin Portal</h2>
        <button onClick={toggleCollapse}>
          <Menu className="w-24 h-24" />
        </button>
      </div>
      <nav className="admin-sidebar-nav">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
            isActive={location.pathname === item.href}
            onClick={() => handleNavigation(item.href)}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
