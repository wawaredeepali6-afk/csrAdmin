import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FolderKanban, Building2, Image, 
  Wrench, BarChart3, Settings, LogOut, Menu, X 
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/clients', icon: Building2, label: 'Clients' },
    { path: '/gallery', icon: Image, label: 'Gallery' },
    { path: '/services', icon: Wrench, label: 'Services' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <Building2 size={28} />
            <div className="brand-text">
              <h2>CSR Industries</h2>
              <p>Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="main-content">
        <header className="header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="header-right">
            <span className="company-name">CSR Industries</span>
            <span className="user-name">Admin User</span>
          </div>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
