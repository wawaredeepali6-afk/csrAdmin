import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, Eye } from 'lucide-react';
import './Common.css';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 1, name: 'ABC Sugar Mills', email: 'contact@abcsugar.com', phone: '+91 98765 43210', orders: 12, totalSpent: '₹28,50,000' },
    { id: 2, name: 'XYZ Industries', email: 'info@xyzind.com', phone: '+91 98765 43211', orders: 8, totalSpent: '₹15,20,000' },
    { id: 3, name: 'PQR Ltd', email: 'sales@pqr.com', phone: '+91 98765 43212', orders: 15, totalSpent: '₹42,30,000' },
    { id: 4, name: 'LMN Sugar Co', email: 'contact@lmnsugar.com', phone: '+91 98765 43213', orders: 6, totalSpent: '₹18,90,000' },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <p className="page-subtitle">Manage your customer database</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td><strong>{customer.name}</strong></td>
                <td>
                  <div className="contact-cell">
                    <div className="contact-item">
                      <Mail size={16} />
                      <span>{customer.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={16} />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </td>
                <td>{customer.orders} orders</td>
                <td><strong>{customer.totalSpent}</strong></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon"><Eye size={18} /></button>
                    <button className="btn-icon"><Mail size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
