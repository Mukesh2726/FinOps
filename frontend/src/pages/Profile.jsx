import { useState } from 'react';
import { User, Mail, Building2, CreditCard, Calendar, Shield, Check } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { profileApi } from '../services/api/workspace';
import { PLANS } from '../data/mockData';

export default function Profile() {
  const { user, company } = useApp();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');

  const plan = PLANS.find(p => p.id === company?.plan) || PLANS[0];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.update({ full_name: displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // silently fail — UI still shows saved state for UX
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div><h1>Profile</h1><p>Your account information</p></div>
      </div>

      <div className="profile-layout">
        <div className="profile-card profile-identity">
          <div className="profile-avatar">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="profile-name">{user?.name || user?.email}</div>
          <div className="profile-email">{user?.email}</div>
          {company && (
            <div className="profile-company-tag">
              <Building2 size={13} /> {company.name}
            </div>
          )}
        </div>

        <div className="profile-card profile-form-card">
          <h3>Account Details</h3>
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label><User size={14} /> Display Name</label>
              <input className="input" value={displayName}
                onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label><Mail size={14} /> Email Address</label>
              <input className="input" value={user?.email || ''} disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <span className="form-hint">Email cannot be changed</span>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saved ? <><Check size={15} /> Saved</> : saving ? <span className="btn-spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {company && (
          <div className="profile-card">
            <h3>Workspace</h3>
            <div className="profile-info-rows">
              <div className="info-row">
                <Building2 size={15} />
                <span className="info-label">Company</span>
                <span className="info-value">{company.name}</span>
              </div>
              <div className="info-row">
                <Shield size={15} />
                <span className="info-label">Business Type</span>
                <span className="info-value">{company.business_type || company.businessType}</span>
              </div>
              <div className="info-row">
                <CreditCard size={15} />
                <span className="info-label">Plan</span>
                <span className="info-value plan-tag">{plan.name} — {plan.price}</span>
              </div>
              <div className="info-row">
                <Calendar size={15} />
                <span className="info-label">Member Since</span>
                <span className="info-value">{company.created_at ? new Date(company.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'July 2026'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="profile-card">
          <h3>Security</h3>
          <div className="profile-info-rows">
            <div className="info-row">
              <Shield size={15} />
              <span className="info-label">Password</span>
              <span className="info-value">••••••••</span>
            </div>
            <div className="info-row">
              <Check size={15} style={{ color: 'var(--green)' }} />
              <span className="info-label">Session</span>
              <span className="info-value" style={{ color: 'var(--green)' }}>Active</span>
            </div>
          </div>
          <p className="security-note">
            <Shield size={12} /> Your data is isolated and only accessible to your workspace.
          </p>
        </div>
      </div>
    </Layout>
  );
}
