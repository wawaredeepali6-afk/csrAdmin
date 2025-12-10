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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <Building2 size={32} />
            Clients Management
          </h1>
          <p className="page-subtitle">Manage your client database</p>
        </div>
        <button className="primary-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Add Client
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-box" style={{ borderLeftColor: '#1a237e' }}>
          <h3>{clients.length}</h3>
          <p>Total Clients</p>
        </div>
        <div className="stat-box" style={{ borderLeftColor: '#4caf50' }}>
          <h3>{clients.filter(c => c.status === 'active').length}</h3>
          <p>Active Clients</p>
        </div>
        <div className="stat-box" style={{ borderLeftColor: '#ff9800' }}>
          <h3>{clients.reduce((sum, c) => sum + (c.projectsCompleted || 0), 0)}</h3>
          <p>Total Projects</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search clients by name, industry, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <table className="data-table">
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
                <td><strong>{client.name}</strong></td>
                <td>{client.industry}</td>
                <td>{client.location}</td>
                <td>{client.contactPerson}</td>
                <td>{client.email}</td>
                <td>{client.phone}</td>
                <td>{client.projectsCompleted}</td>
                <td>
                  <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {client.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => handleEdit(client)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(client.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredClients.length === 0 && (
        <div className="empty-state">
          <Building2 size={64} />
          <h3>No clients found</h3>
          <p>Add your first client to get started</p>
        </div>
      )}

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
