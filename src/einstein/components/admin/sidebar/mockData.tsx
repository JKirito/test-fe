import { User, BarChart2, Settings, BookOpen } from 'lucide-react';
export const sidebarItems = [
  {
    title: 'Overview',
    icon: <BarChart2 className="w-5 h-5" />,
    href: '/admin',
  },
  {
    title: 'User Management',
    icon: <User className="w-5 h-5" />,
    href: '/admin/users',
  },
  {
    title: 'Methodologies',
    icon: <BookOpen className="w-5 h-5" />,
    href: '/admin/methodologies',
  },
  {
    title: 'How To',
    icon: <BookOpen className="w-5 h-5" />,
    href: '/admin/how-to',
  },
  {
    title: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    href: '/admin/settings',
  },
];
