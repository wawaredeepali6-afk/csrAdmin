import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Users, FileText, TrendingUp, AlertCircle, ChevronRight, BarChart3, Building2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend } from 'recharts';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Products
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
    });

    // Fetch Projects
    const projectsRef = ref(database, 'projects');
    onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProjects(projectList);
      } else {
        setProjects([]);
      }
    });

    // Fetch Clients
    const clientsRef = ref(database, 'clients');
    onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const clientList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setClients(clientList);
      } else {
        setClients([]);
      }
    });

    // Fetch Services
    const servicesRef = ref(database, 'services');
    onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const serviceList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setServices(serviceList);
      } else {
        setServices([]);
      }
      setLoading(false);
    });
  }, []);

  // Calculate dynamic stats
  const activeProjects = projects.filter(p => p.status === 'ongoing').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pendingServices = services.filter(s => s.status === 'Pending').length;

  const stats = [
    { 
      icon: FileText, 
      label: 'Total Projects', 
      value: projects.length.toString(), 
      change: `${activeProjects} Active`, 
      color: '#1a237e',
      bgColor: '#e3f2fd'
    },
    { 
      icon: Package, 
      label: 'Products', 
      value: products.length.toString(), 
      change: `${products.filter(p => p.stock > 0).length} In Stock`, 
      color: '#ff9800',
      bgColor: '#fff3e0'
    },
    { 
      icon: Building2, 
      label: 'Clients', 
      value: clients.length.toString(), 
      change: `${activeClients} Active`, 
      color: '#4caf50',
      bgColor: '#e8f5e9'
    },
    { 
      icon: ShoppingCart, 
      label: 'Service Requests', 
      value: services.length.toString(), 
      change: `${pendingServices} Pending`, 
      color: '#2196f3',
      bgColor: '#e1f5fe'
    },
  ];

  // Generate dynamic project status data
  const projectStatusData = [
    { name: 'Planning', count: projects.filter(p => p.status === 'planning').length, value: 0.2 },
    { name: 'Ongoing', count: projects.filter(p => p.status === 'ongoing').length, value: 1.0 },
    { name: 'Completed', count: projects.filter(p => p.status === 'completed').length, value: 0.65 },
    { name: 'On Hold', count: projects.filter(p => p.status === 'on-hold').length, value: 0.15 },
  ].filter(item => item.count > 0);

  // Dynamic category data from products
  const getCategoryData = () => {
    const categories = {};
    products.forEach(product => {
      if (categories[product.category]) {
        categories[product.category]++;
      } else {
        categories[product.category] = 1;
      }
    });
    
    return Object.keys(categories).map(key => ({
      name: key,
      orders: categories[key]
    })).sort((a, b) => b.orders - a.orders).slice(0, 5);
  };

  // Get low stock items dynamically
  const lowStockItems = products
    .filter(p => p.stock <= p.minStock)
    .slice(0, 5);

  // Get recent projects
  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-modern">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <button className="view-analytics-btn" onClick={() => navigate('/analytics')}>
          View Full Analytics
          <ChevronRight size={16} />
        </button>
      </div>
      
      {/* Key Metrics Section */}
      <div className="metrics-section">
        <h2 className="section-title-modern">
          <TrendingUp size={20} />
          Key Metrics
        </h2>
        <div className="metrics-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="metric-card">
                <div className="metric-icon" style={{ background: stat.bgColor, color: stat.color }}>
                  <Icon size={24} />
                </div>
                <div className="metric-content">
                  <p className="metric-label">{stat.label}</p>
                  <h3 className="metric-value">{stat.value}</h3>
                  <span className="metric-change">{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <h2 className="section-title-modern">
          <BarChart3 size={20} />
          Performance Analytics
        </h2>
        <div className="charts-grid-modern">
          <div className="chart-card-modern">
            <div className="chart-header">
              <h3>Project Status Distribution</h3>
              <span className="chart-period">Current overview</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Project Count', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Status Value', angle: 90, position: 'insideRight' }}
                  domain={[0, 1]}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="count" 
                  fill="#19a89d" 
                  name="Project Count"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ff8c42" 
                  strokeWidth={3}
                  name="Status Value"
                  dot={{ fill: '#ff8c42', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card-modern">
            <div className="chart-header">
              <h3>Products by Category</h3>
              <span className="chart-period">Current inventory</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCategoryData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="recent-section">
        <div className="section-header-modern">
          <h2 className="section-title-modern">
            <FileText size={20} />
            Recent Projects
          </h2>
          <button className="view-all-link" onClick={() => navigate('/projects')}>
            View All
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="table-card-modern">
          {recentProjects.length > 0 ? (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id} onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }}>
                    <td><strong>{project.name}</strong></td>
                    <td>{project.client}</td>
                    <td>
                      <span className={`status-pill status-${project.status}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <div className="progress-mini">
                        <div className="progress-bar-mini" style={{ width: `${project.progress}%` }}></div>
                        <span className="progress-text">{project.progress}%</span>
                      </div>
                    </td>
                    <td><strong>₹{project.budget}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state-small">
              <FileText size={48} />
              <p>No projects yet. Create your first project!</p>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      {lowStockItems.length > 0 && (
        <div className="alerts-section">
          <div className="section-header-modern">
            <h2 className="section-title-modern">
              <AlertCircle size={20} />
              Low Stock Alerts
            </h2>
            <button className="view-all-link" onClick={() => navigate('/products')}>
              View All Products
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="alerts-grid">
            {lowStockItems.map((item) => (
              <div key={item.id} className="alert-card-modern" onClick={() => navigate('/products')}>
                <div className="alert-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="alert-content">
                  <h4>{item.name}</h4>
                  <p>Current: {item.stock} | Min: {item.minStock}</p>
                </div>
                <span className="alert-badge-modern">Low Stock</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
