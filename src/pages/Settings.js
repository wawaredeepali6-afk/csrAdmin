import React, { useState } from 'react';
import { Save, Building, Mail, Phone, MapPin } from 'lucide-react';
import './Common.css';

const Settings = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'CSR Industries',
    email: 'info@csrindustries.com',
    phone: '9876543210',
    address: 'Industrial Area, Phase 2, Mumbai, Maharashtra',
    taxId: 'GSTIN1234567890',
  });

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setCompanyInfo({...companyInfo, phone: value});
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validation
    if (!companyInfo.name.trim()) {
      alert('Please enter company name');
      return;
    }
    
    if (!companyInfo.email.trim()) {
      alert('Please enter email address');
      return;
    }
    
    if (companyInfo.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (!companyInfo.address.trim()) {
      alert('Please enter address');
      return;
    }
    
    alert('Settings saved successfully!');
  };

  return (
    <div className="modern-page-container">
      {/* Header Section */}
      <div className="modern-header">
        <div className="header-left">
          <div className="page-icon" style={{ background: '#6c5ce7' }}>
            <Building size={24} />
          </div>
          <div>
            <h1>Company Information</h1>
            <p className="subtitle">Manage your company settings and information</p>
          </div>
        </div>
      </div>

      {/* Settings Form Card */}
      <div className="settings-card-modern">
        <form onSubmit={handleSave}>
          {/* Company Name - Full Width */}
          <div className="form-group-modern">
            <label>
              <Building size={16} />
              Company Name *
            </label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
              placeholder="Enter company name"
              className="input-modern"
              required
            />
          </div>

          {/* Email and Phone - Two Columns */}
          <div className="form-row-modern">
            <div className="form-group-modern">
              <label>
                <Mail size={16} />
                Email *
              </label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                placeholder="company@example.com"
                className="input-modern"
                required
              />
            </div>
            <div className="form-group-modern">
              <label>
                <Phone size={16} />
                Phone (10 digits)
              </label>
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                maxLength="10"
                className="input-modern"
              />
              <small style={{ fontSize: '12px', color: '#999', marginTop: '4px', display: 'block' }}>
                {companyInfo.phone.length}/10 digits
              </small>
            </div>
          </div>

          {/* Address - Full Width */}
          <div className="form-group-modern">
            <label>
              <MapPin size={16} />
              Address *
            </label>
            <textarea
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
              placeholder="Enter complete address"
              rows="4"
              className="input-modern"
              required
            />
          </div>

          {/* Tax ID - Full Width */}
          <div className="form-group-modern">
            <label>Tax ID / GSTIN</label>
            <input
              type="text"
              value={companyInfo.taxId}
              onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
              placeholder="GSTIN1234567890"
              className="input-modern"
            />
          </div>

          {/* Save Button */}
          <div className="form-actions-modern">
            <button type="submit" className="btn-submit-modern" style={{ width: 'auto', padding: '12px 32px' }}>
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
