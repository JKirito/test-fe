import React from 'react';
import AdminSidebar from '../sidebar/AdminSidebar';
import '../sidebar/adminSidebar.scss';
import './adminLayout.scss';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/lib/store/store';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user?.roles.includes('ADMIN')) {
    return <Navigate to="/" />;
  }
  return (
    <div className="admin-layout">
      <div className="admin-layout-container">
        <AdminSidebar />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
