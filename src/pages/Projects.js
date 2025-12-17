import React, { useState, useEffect } from 'react';
import { FolderKanban, Search, Filter, Plus, Clock, CheckCircle, AlertCircle, Pause, X, Edit2, Trash2 } from 'lucide-react';
import { database } from '../firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';
import './Common.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: 'planning',
    progress: 0,
    startDate: '',
    deadline: '',
    budget: ''
  });

  useEffect(() => {
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
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'planning': return <Clock size={16} />;
      case 'ongoing': return <AlertCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'on-hold': return <Pause size={16} />;
      default: return null;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.client) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const projectData = {
        ...formData,
        progress: parseInt(formData.progress) || 0
      };

      if (editingProject) {
        await update(ref(database, `projects/${editingProject.id}`), {
          ...projectData,
          updatedAt: new Date().toISOString()
        });
        alert('Project updated successfully!');
      } else {
        await push(ref(database, 'projects'), {
          ...projectData,
          createdAt: new Date().toISOString()
        });
        alert('Project added successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      client: project.client,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate,
      deadline: project.deadline,
      budget: project.budget
    });
    setShowModal(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await remove(ref(database, `projects/${projectId}`));
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      client: '',
      status: 'planning',
      progress: 0,
      startDate: '',
      deadline: '',
      budget: ''
    });
    setEditingProject(null);
    setShowModal(false);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    ongoing: projects.filter(p => p.status === 'ongoing').length,
    completed: projects.filter(p => p.status === 'completed').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
  };

  return (
    <div className="modern-page-container">
      {/* Header Section */}
      <div className="modern-header">
        <div className="header-left">
          <div className="page-icon">
            <FolderKanban size={24} />
          </div>
          <div>
            <h1>Projects Management</h1>
            <p className="subtitle">Track and manage all industrial projects</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary-modern" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="metrics-section">
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#e3f2fd', color: '#1a237e' }}>
              <FolderKanban size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Projects</p>
              <h3 className="metric-value">{statusCounts.all}</h3>
              <span className="metric-change">All projects</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#e1f5fe', color: '#2196f3' }}>
              <Clock size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Planning</p>
              <h3 className="metric-value">{statusCounts.planning}</h3>
              <span className="metric-change">In planning phase</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#fff3e0', color: '#ff9800' }}>
              <AlertCircle size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Ongoing</p>
              <h3 className="metric-value">{statusCounts.ongoing}</h3>
              <span className="metric-change">Currently active</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#e8f5e9', color: '#4caf50' }}>
              <CheckCircle size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Completed</p>
              <h3 className="metric-value">{statusCounts.completed}</h3>
              <span className="metric-change">Successfully done</span>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#ffebee', color: '#f44336' }}>
              <Pause size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">On Hold</p>
              <h3 className="metric-value">{statusCounts['on-hold']}</h3>
              <span className="metric-change">Temporarily paused</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-modern">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search projects by name or client..."
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
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <div>
                <h3>{project.name}</h3>
                <p className="project-id">{project.client}</p>
              </div>
              <span className={`status-badge ${project.status}`}>
                {getStatusIcon(project.status)}
                {project.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="project-info">
              <div className="info-row">
                <span className="label">Budget:</span>
                <span className="value">₹{project.budget}</span>
              </div>
              <div className="info-row">
                <span className="label">Start Date:</span>
                <span className="value">{project.startDate}</span>
              </div>
              <div className="info-row">
                <span className="label">Deadline:</span>
                <span className="value">{project.deadline}</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span>Progress</span>
                <span className="progress-value">{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${project.progress}%`,
                    backgroundColor: project.status === 'completed' ? '#4caf50' : 
                                   project.status === 'ongoing' ? '#ff9800' : 
                                   project.status === 'on-hold' ? '#f44336' : '#2196f3'
                  }}
                />
              </div>
            </div>

            <div className="project-actions">
              <button className="action-btn" onClick={() => handleEdit(project)}>
                <Edit2 size={16} /> Edit
              </button>
              <button className="action-btn secondary" onClick={() => handleDelete(project.id)}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <FolderKanban size={64} />
          <h3>No projects found</h3>
          <p>Add your first project to get started</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={resetForm} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group-modern">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  className="input-modern"
                />
              </div>
              
              <div className="form-group-modern">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Enter client name"
                  className="input-modern"
                />
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-modern"
                  >
                    <option value="planning">Planning</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>Progress (%)</label>
                  <input
                    type="number"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    min="0"
                    max="100"
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="input-modern"
                  />
                </div>
              </div>
              
              <div className="form-group-modern">
                <label>Budget (₹)</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g., 45,00,000"
                  className="input-modern"
                />
              </div>
              
              <div className="modal-footer-modern">
                <button className="btn-cancel-modern" onClick={resetForm}>Cancel</button>
                <button className="btn-submit-modern" onClick={handleSubmit}>
                  {editingProject ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
