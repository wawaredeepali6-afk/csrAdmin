import React, { useState } from 'react';
import { Save, Building, Mail, Phone, MapPin } from 'lucide-react';
import './Common.css';

const Settings = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'CSR Industries',
    email: 'info@csrindustries.com',
    phone: '+91 98765 43210',
    address: 'Industrial Area, Phase 2, Mumbai, Maharashtra',
    taxId: 'GSTIN1234567890',
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Manage system configuration</p>
        </div>
      </div>

      <div className="card">
        <h3>Company Information</h3>
        <form onSubmit={handleSave} className="settings-form">
          <div className="form-group">
            <label><Building size={18} /> Company Name</label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Mail size={18} /> Email</label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label><Phone size={18} /> Phone</label>
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label><MapPin size={18} /> Address</label>
            <textarea
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Tax ID / GSTIN</label>
            <input
              type="text"
              value={companyInfo.taxId}
              onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
            />
          </div>

          <button type="submit" className="primary-btn">
            <Save size={20} />
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
