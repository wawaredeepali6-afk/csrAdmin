import React from 'react';
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import './Common.css';

const Analytics = () => {
  const monthlyRevenue = [
    { month: 'Jun \'14', revenue: 100000, customers: 25 },
    { month: 'Jul \'14', revenue: 130000, customers: 60 },
    { month: 'Aug \'14', revenue: 165000, customers: 70 },
    { month: 'Sep \'14', revenue: 195000, customers: 100 },
    { month: 'Oct \'14', revenue: 165000, customers: 110 },
    { month: 'Nov \'14', revenue: 155000, customers: 100 },
    { month: 'Dec \'14', revenue: 185000, customers: 165 },
    { month: 'Jan \'15', revenue: 230000, customers: 195 },
    { month: 'Feb \'15', revenue: 245000, customers: 385 },
    { month: 'Mar \'15', revenue: 265000, customers: 410 },
    { month: 'Apr \'15', revenue: 305000, customers: 480 },
    { month: 'May \'15', revenue: 340000, customers: 560 },
  ];

  const projectStatusData = [
    { status: 'Planning', count: 20, value: 0.2 },
    { status: 'Ongoing', count: 100, value: 1.0 },
    { status: 'Completed', count: 65, value: 0.65 },
    { status: 'On Hold', count: 15, value: 0.15 },
  ];

  const topProducts = [
    { name: 'Juice Heater', sales: 45 },
    { name: 'Belt Conveyor', sales: 38 },
    { name: 'Storage Tank', sales: 32 },
    { name: 'Cane Carrier', sales: 28 },
    { name: 'Pump Seals', sales: 22 },
  ];

  const COLORS = ['#16c79a', '#3498db', '#f39c12', '#9b59b6', '#e74c3c'];

  return (
    <div className="modern-page-container">
      {/* Header Section */}
      <div className="modern-header">
        <div className="header-left">
          <div className="page-icon" style={{ background: '#6c5ce7' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h1>Analytics & Reports</h1>
            <p className="subtitle">Business insights and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="metrics-section">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#d4f4dd', color: '#16c79a' }}>
              <DollarSign size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Revenue</p>
              <h3 className="metric-value">₹32.8L</h3>
              <span className="metric-change">+18% from last quarter</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#dbeafe', color: '#3498db' }}>
              <Package size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Products Sold</p>
              <h3 className="metric-value">248</h3>
              <span className="metric-change">+12% from last quarter</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#fef3c7', color: '#f39c12' }}>
              <TrendingUp size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Avg Order Value</p>
              <h3 className="metric-value">₹1.32L</h3>
              <span className="metric-change">+8% from last quarter</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#ede9fe', color: '#9b59b6' }}>
              <Users size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Active Customers</p>
              <h3 className="metric-value">89</h3>
              <span className="metric-change">+15% from last quarter</span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue by Number of New Customers by Date</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyRevenue}>
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
                  if (name === 'Revenue') return `₹${value.toLocaleString()}`;
                  return value;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  if (value === 'customers') return 'Sum of Number of Records of Plan';
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Project Status Distribution</h3>
            <span style={{ color: '#999', fontSize: '14px' }}>Current overview</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={projectStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="status" 
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
      </div>

      <div className="card">
        <h3>Top Selling Products</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#16c79a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
