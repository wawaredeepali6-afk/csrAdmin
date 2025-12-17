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
      change: `All In Stock`, 
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

  // Low stock feature removed since stock management is disabled
  const lowStockItems = [];

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
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Revenue by Number of New Customers by Date</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={[
                { month: 'Jan', revenue: 100000, customers: 25 },
                { month: 'Feb', revenue: 130000, customers: 60 },
                { month: 'Mar', revenue: 165000, customers: 70 },
                { month: 'Apr', revenue: 195000, customers: 100 },
                { month: 'May', revenue: 165000, customers: 110 },
                { month: 'Jun', revenue: 185000, customers: 165 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Customer Creation Date', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'New Customers', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Sum of Revenue', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return `₹${value.toLocaleString()}`;
                    return value;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    if (value === 'customers') return 'Sum of Number of Records';
                    if (value === 'revenue') return 'Sum of Revenue';
                    return value;
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="customers" 
                  fill="#19a89d" 
                  name="customers"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ff8c42" 
                  strokeWidth={3}
                  name="revenue"
                  dot={{ fill: '#ff8c42', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Products by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCategoryData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#16c79a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="recent-section">
        <div className="section-header-modern">
          <h2 className="section-title-modern">
            <ShoppingCart size={20} />
            Recent Orders
          </h2>
          <button className="view-all-link" onClick={() => navigate('/products')}>
            View All Orders
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="table-card-modern">
          {products.length > 0 ? (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((product, index) => (
                  <tr key={product.id} onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>
                    <td><strong>ORD-{String(index + 1).padStart(3, '0')}</strong></td>
                    <td>Customer {index + 1}</td>
                    <td>{product.name}</td>
                    <td>
                      <span className={`status-pill ${product.status === 'In Stock' ? 'status-success' : 'status-warning'}`}>
                        {product.status === 'In Stock' ? 'Delivered' : 'Pending'}
                      </span>
                    </td>
                    <td><strong>₹{product.price}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state-small">
              <ShoppingCart size={48} />
              <p>No orders yet!</p>
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
