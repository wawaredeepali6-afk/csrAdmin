import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { database } from '../firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';
import './Common.css';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    contactPerson: '',
    email: '',
    phone: '',
    projectsCompleted: 0,
    status: 'active'
  });

  useEffect(() => {
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
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }

    // Validate phone number (10 digits)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      if (editingClient) {
        await update(ref(database, `clients/${editingClient.id}`), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        alert('Client updated successfully!');
      } else {
        await push(ref(database, 'clients'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
        alert('Client added successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      industry: client.industry,
      location: client.location,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      projectsCompleted: client.projectsCompleted,
      status: client.status
    });
    setShowModal(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      await remove(ref(database, `clients/${clientId}`));
      alert('Client deleted successfully!');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      location: '',
      contactPerson: '',
      email: '',
      phone: '',
      projectsCompleted: 0,
      status: 'active'
    });
    setEditingClient(null);
    setShowModal(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modern-page-container">
      {/* Header Section */}
      <div className="modern-header">
        <div className="header-left">
          <div className="page-icon">
            <Building2 size={24} />
          </div>
          <div>
            <h1>Clients Management</h1>
            <p className="subtitle">Manage your client database</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary-modern" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '32px' }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#e3f2fd', color: '#1a237e' }}>
            <Building2 size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Clients</p>
            <h3 className="metric-value">{clients.length}</h3>
            <span className="metric-change">All registered clients</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#e8f5e9', color: '#4caf50' }}>
            <Building2 size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Active Clients</p>
            <h3 className="metric-value">{clients.filter(c => c.status === 'active').length}</h3>
            <span className="metric-change">Currently active</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fff3e0', color: '#ff9800' }}>
            <Building2 size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Projects</p>
            <h3 className="metric-value">{clients.reduce((sum, c) => sum + (c.projectsCompleted || 0), 0)}</h3>
            <span className="metric-change">Projects completed</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-filter-bar">
        <div className="search-input-modern">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search clients by name, industry, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Modern Table */}
      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Projects</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td data-label="Client Name"><strong>{client.name}</strong></td>
                <td data-label="Industry">{client.industry}</td>
                <td data-label="Location">{client.location}</td>
                <td data-label="Contact Person">{client.contactPerson}</td>
                <td data-label="Email">{client.email}</td>
                <td data-label="Phone">{client.phone}</td>
                <td data-label="Projects">{client.projectsCompleted}</td>
                <td data-label="Status">
                  <span className={`status-pill ${client.status === 'active' ? 'status-success' : 'status-warning'}`}>
                    {client.status}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="action-buttons-modern">
                    <button className="action-icon-btn edit" onClick={() => handleEdit(client)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => handleDelete(client.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="empty-state-modern">
            <Building2 size={64} />
            <h3>No clients found</h3>
            <p>Add your first client to get started</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={resetForm} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter client name"
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Sugar Mills, Manufacturing"
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Contact person name"
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Phone (10 digits)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setFormData({ ...formData, phone: value });
                      }
                    }}
                    placeholder="1234567890"
                    maxLength="10"
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Projects Completed</label>
                  <input
                    type="number"
                    value={formData.projectsCompleted}
                    onChange={(e) => setFormData({ ...formData, projectsCompleted: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-modern"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer-modern">
                <button className="btn-cancel-modern" onClick={resetForm}>Cancel</button>
                <button className="btn-submit-modern" onClick={handleSubmit}>
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
