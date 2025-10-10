import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, FileText, CreditCard, BarChart3 } from 'lucide-react';

export default function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    {
      path: '/home',
      icon: Home,
      label: 'خانه',
      exact: true
    },
    {
      path: '/carpets',
      icon: Package,
      label: 'فرش‌ها',
      exact: false
    },
    {
      path: '/invoices',
      icon: FileText,
      label: 'فاکتورها',
      exact: false
    },
    {
      path: '/checks',
      icon: CreditCard,
      label: 'چک‌ها',
      exact: false
    },
    {
      path: '/reports',
      icon: BarChart3,
      label: 'گزارشات',
      exact: false
    }
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
          >
            <Icon className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
