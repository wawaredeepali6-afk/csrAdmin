import React, { useState } from 'react';
import { Plus, Search, Eye, Send, CheckCircle, XCircle } from 'lucide-react';
import './Common.css';

const Quotations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const quotations = [
    { id: 'QUO-001', customer: 'ABC Sugar Mills', date: '2024-12-01', amount: '₹2,50,000', status: 'Sent', validUntil: '2024-12-31' },
    { id: 'QUO-002', customer: 'XYZ Industries', date: '2024-12-03', amount: '₹1,80,000', status: 'Accepted', validUntil: '2024-12-30' },
    { id: 'QUO-003', customer: 'PQR Ltd', date: '2024-12-05', amount: '₹3,20,000', status: 'Pending', validUntil: '2025-01-05' },
    { id: 'QUO-004', customer: 'LMN Sugar Co', date: '2024-11-28', amount: '₹4,50,000', status: 'Rejected', validUntil: '2024-12-28' },
  ];

  const filteredQuotations = quotations.filter(quote =>
    (statusFilter === 'All' || quote.status === statusFilter) &&
    (quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     quote.customer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusClass = (status) => {
    const statusMap = {
      'Pending': 'badge-warning',
      'Sent': 'badge-info',
      'Accepted': 'badge-success',
      'Rejected': 'badge-danger'
    };
    return statusMap[status] || 'badge-default';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Quotations</h1>
          <p className="page-subtitle">Manage quotations and proposals</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Create Quotation
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Sent">Sent</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quotation ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.map(quote => (
              <tr key={quote.id}>
                <td><strong>{quote.id}</strong></td>
                <td>{quote.customer}</td>
                <td>{quote.date}</td>
                <td><strong>{quote.amount}</strong></td>
                <td>{quote.validUntil}</td>
                <td>
                  <span className={`badge ${getStatusClass(quote.status)}`}>
                    {quote.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon"><Eye size={18} /></button>
                    <button className="btn-icon"><Send size={18} /></button>
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

export default Quotations;
