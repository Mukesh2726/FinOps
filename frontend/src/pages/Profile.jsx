import { useState } from 'react';
import { User, Mail, Building2, CreditCard, Calendar, Shield, Check, ArrowUpRight, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useApp } from '../context/useApp';
import { profileApi } from '../services/api/workspace';
import { useSubscription } from '../hooks/useSubscription';
import SubscriptionBadge from '../components/pricing/SubscriptionBadge';
import { formatUsage } from '../config/subscriptionPlans';

export default function Profile() {
  const { user, company } = useApp();
  const { currentPlan, subscription, usage, cancelSubscription } = useSubscription();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');

  const plan = currentPlan;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.update({ full_name: displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* silently fail */ }
    finally { setSaving(false); }
  };

  const initial = (user?.name || user?.email || 'U')[0].toUpperCase();

  return (
    <Layout>
      <div className="page-header">
        <div><h1>Profile</h1><p>Your account information and settings</p></div>
      </div>

      <div className="profile-layout">
        <motion.div className="profile-card profile-identity" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <div className="profile-avatar">{initial}</div>
          <div className="profile-name">{user?.name || user?.email}</div>
          <div className="profile-email">{user?.email}</div>
          {company && (
            <div className="profile-company-tag">
              <Building2 size={12} /> {company.name}
            </div>
          )}
          <div className="badge badge-primary" style={{ marginTop: 8 }}>{plan.name} Plan</div>
        </motion.div>

        <motion.div className="profile-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <h3>Account Details</h3>
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label><User size={13} /> Display Name</label>
              <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label><Mail size={13} /> Email Address</label>
              <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <span className="form-hint">Email cannot be changed</span>
            </div>
            <button type="submit" className="glow-btn glow-btn--primary glow-btn--md" disabled={saving}>
              {saved ? <><Check size={14} /> Saved</> : saving ? <span className="btn-spinner" /> : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {company && (
          <motion.div className="profile-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
            <h3>Workspace</h3>
            <div className="profile-info-rows">
              <div className="info-row">
                <Building2 size={14} />
                <span className="info-label">Company</span>
                <span className="info-value">{company.name}</span>
              </div>
              <div className="info-row">
                <Shield size={14} />
                <span className="info-label">Business Type</span>
                <span className="info-value">{company.business_type || company.businessType}</span>
              </div>
              <div className="info-row">
                <CreditCard size={14} />
                <span className="info-label">Plan</span>
                <span className="info-value plan-tag">{plan.name} — {plan.price}</span>
              </div>
              <div className="info-row">
                <Calendar size={14} />
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {company.created_at ? new Date(company.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'July 2026'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div className="profile-card subscription-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }}>
          <div className="subscription-card-header">
            <div><h3>Billing & Plan</h3><p className="subscription-card-sub">Your subscription and feature access</p></div>
            <SubscriptionBadge status={subscription?.status} />
          </div>
          <div className="billing-plan-row">
            <div><span className="summary-label">Current Plan</span><strong>{plan?.name}</strong></div>
            <div className="billing-price">{plan?.priceLabel}<span>/month</span></div>
          </div>
          <div className="profile-info-rows">
            <div className="info-row"><Calendar size={14} /><span className="info-label">Renews</span><span className="info-value">{subscription?.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Loading...'}</span></div>
            <div className="info-row"><Building2 size={14} /><span className="info-label">Companies</span><span className="info-value">{usage?.companies ? `${usage.companies.used} / ${formatUsage(usage.companies.limit)}` : 'Loading...'}</span></div>
            <div className="info-row"><User size={14} /><span className="info-label">Users</span><span className="info-value">{usage?.users ? `${usage.users.used} / ${formatUsage(usage.users.limit)}` : 'Loading...'}</span></div>
          </div>
          <div className="billing-features">{plan?.features.map(feature => <span key={feature}><Check size={13} />{feature}</span>)}</div>
          <div className="billing-actions">
            <button className="glow-btn glow-btn--primary glow-btn--sm" onClick={() => navigate('/pricing')}><ArrowUpRight size={14} /> Change Plan</button>
            <button className="glow-btn glow-btn--ghost glow-btn--sm" onClick={() => navigate('/pricing')}>Upgrade / Downgrade</button>
            {subscription?.active && <button className="glow-btn glow-btn--danger glow-btn--sm" onClick={cancelSubscription}><XCircle size={14} /> Cancel</button>}
          </div>
        </motion.div>

        <motion.div className="profile-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <h3>Security</h3>
          <div className="profile-info-rows">
            <div className="info-row">
              <Shield size={14} />
              <span className="info-label">Password</span>
              <span className="info-value">••••••••</span>
            </div>
            <div className="info-row">
              <Check size={14} style={{ color: 'var(--green)' }} />
              <span className="info-label">Session</span>
              <span className="info-value" style={{ color: 'var(--green)' }}>Active</span>
            </div>
          </div>
          <p className="security-note"><Shield size={11} /> Your data is isolated and only accessible to your workspace.</p>
        </motion.div>
      </div>
    </Layout>
  );
}
