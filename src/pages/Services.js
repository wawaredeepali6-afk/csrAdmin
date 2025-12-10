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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <Wrench size={32} />
            Service Management
          </h1>
          <p className="page-subtitle">Track after-sales service requests</p>
        </div>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          New Service Request
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-box" style={{ borderLeftColor: '#1a237e' }}>
          <h3>{stats.total}</h3>
          <p>Total Requests</p>
        </div>
        <div className="stat-box" style={{ borderLeftColor: '#ff9800' }}>
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-box" style={{ borderLeftColor: '#2196f3' }}>
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-box" style={{ borderLeftColor: '#4caf50' }}>
          <h3>{stats.completed}</h3>
          <p>Completed</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search service requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
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
                <td><strong>{service.customer}</strong></td>
                <td>
                  <div className="product-cell">
                    <Wrench size={18} />
                    <span>{service.equipment}</span>
                  </div>
                </td>
                <td>{service.issue}</td>
                <td>
                  <div className="product-cell">
                    <User size={18} />
                    <span>{service.engineer || 'Unassigned'}</span>
                  </div>
                </td>
                <td>{service.date}</td>
                <td>
                  <span className={`badge ${service.priority === 'High' ? 'badge-danger' : service.priority === 'Medium' ? 'badge-warning' : 'badge-info'}`}>
                    {service.priority}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusClass(service.status)}`}>
                    {service.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => handleEdit(service)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(service.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredServices.length === 0 && (
        <div className="empty-state">
          <Wrench size={64} />
          <h3>No service requests found</h3>
          <p>Create your first service request to get started</p>
        </div>
      )}

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
