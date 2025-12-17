import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FolderKanban, Building2, Image, 
  Wrench, BarChart3, Settings, LogOut, Menu, X, MoreVertical 
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleMenuClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="layout">
      {/* Overlay for mobile */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
      
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <Building2 size={28} />
            <div className="brand-text">
              <h2>CSR Industries</h2>
              <p>Admin Panel</p>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={handleMenuClick}
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
          <div className="header-left">
            <button 
              className="menu-toggle" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                <span>A</span>
              </div>
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
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
