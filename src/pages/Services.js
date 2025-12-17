import React, { useState, useEffect } from 'react';
import { Plus, Search, Wrench, User, X, Edit2, Trash2 } from 'lucide-react';
import { database } from '../firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';
import './Common.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    equipment: '',
    issue: '',
    engineer: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    priority: 'Medium'
  });

  useEffect(() => {
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
    });
  }, []);

  const handleSubmit = async () => {
    if (!formData.customer || !formData.equipment) {
      alert('Please fill in required fields');
      return;
    }

    try {
      if (editingService) {
        await update(ref(database, `services/${editingService.id}`), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        alert('Service request updated successfully!');
      } else {
        await push(ref(database, 'services'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        alert('Service request created successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service request');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      customer: service.customer,
      equipment: service.equipment,
      issue: service.issue,
      engineer: service.engineer,
      status: service.status,
      date: service.date,
      priority: service.priority || 'Medium'
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service request?')) return;

    try {
      await remove(ref(database, `services/${serviceId}`));
      alert('Service request deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service request');
    }
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      equipment: '',
      issue: '',
      engineer: '',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      priority: 'Medium'
    });
    setEditingService(null);
    setShowModal(false);
  };

  const filteredServices = services.filter(service =>
    (statusFilter === 'All' || service.status === statusFilter) &&
    (service.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
     service.equipment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusClass = (status) => {
    const statusMap = {
      'Pending': 'badge-warning',
      'In Progress': 'badge-info',
      'Completed': 'badge-success'
    };
    return statusMap[status] || 'badge-default';
  };

  const stats = {
    total: services.length,
    pending: services.filter(s => s.status === 'Pending').length,
    inProgress: services.filter(s => s.status === 'In Progress').length,
    completed: services.filter(s => s.status === 'Completed').length
  };

  return (
    <div className="modern-page-container">
      {/* Header Section */}
      <div className="modern-header">
        <div className="header-left">
          <div className="page-icon">
            <Wrench size={24} />
          </div>
          <div>
            <h1>Service Management</h1>
            <p className="subtitle">Track after-sales service requests</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary-modern" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            New Service Request
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '32px' }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#e3f2fd', color: '#1a237e' }}>
            <Wrench size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Requests</p>
            <h3 className="metric-value">{stats.total}</h3>
            <span className="metric-change">All service requests</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fff3e0', color: '#ff9800' }}>
            <Wrench size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Pending</p>
            <h3 className="metric-value">{stats.pending}</h3>
            <span className="metric-change">Awaiting action</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#e1f5fe', color: '#2196f3' }}>
            <Wrench size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">In Progress</p>
            <h3 className="metric-value">{stats.inProgress}</h3>
            <span className="metric-change">Currently working</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#e8f5e9', color: '#4caf50' }}>
            <Wrench size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Completed</p>
            <h3 className="metric-value">{stats.completed}</h3>
            <span className="metric-change">Successfully done</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-modern">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search service requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <select 
            className="filter-btn"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', cursor: 'pointer' }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Modern Table */}
      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Equipment</th>
              <th>Issue</th>
              <th>Engineer</th>
              <th>Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(service => (
              <tr key={service.id}>
                <td data-label="Customer"><strong>{service.customer}</strong></td>
                <td data-label="Equipment">
                  <div className="product-cell">
                    <Wrench size={18} />
                    <span>{service.equipment}</span>
                  </div>
                </td>
                <td data-label="Issue">{service.issue}</td>
                <td data-label="Engineer">
                  <div className="product-cell">
                    <User size={18} />
                    <span>{service.engineer || 'Unassigned'}</span>
                  </div>
                </td>
                <td data-label="Date">{service.date}</td>
                <td data-label="Priority">
                  <span className={`status-pill ${service.priority === 'High' ? 'status-danger' : service.priority === 'Medium' ? 'status-warning' : 'status-info'}`}>
                    {service.priority}
                  </span>
                </td>
                <td data-label="Status">
                  <span className={`status-pill ${service.status === 'Completed' ? 'status-success' : service.status === 'In Progress' ? 'status-info' : 'status-warning'}`}>
                    {service.status}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="action-buttons-modern">
                    <button className="action-icon-btn edit" onClick={() => handleEdit(service)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => handleDelete(service.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredServices.length === 0 && (
          <div className="empty-state-modern">
            <Wrench size={64} />
            <h3>No service requests found</h3>
            <p>Create your first service request to get started</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service Request' : 'New Service Request'}</h2>
              <button onClick={resetForm} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="Enter customer name"
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Equipment *</label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    placeholder="Enter equipment name"
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-group-modern">
                <label>Issue Description</label>
                <textarea
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="Describe the issue"
                  rows="4"
                  className="input-modern"
                />
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Assigned Engineer</label>
                  <input
                    type="text"
                    value={formData.engineer}
                    onChange={(e) => setFormData({ ...formData, engineer: e.target.value })}
                    placeholder="Engineer name"
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-modern"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-modern"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer-modern">
                <button className="btn-cancel-modern" onClick={resetForm}>Cancel</button>
                <button className="btn-submit-modern" onClick={handleSubmit}>
                  {editingService ? 'Update Service Request' : 'Create Service Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
