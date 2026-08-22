import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/useApp';
import { BUSINESS_TYPES } from '../data/mockData';
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [plan, setPlan] = useState('growth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setupCompany, selectPlan } = useApp();
  const navigate = useNavigate();

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      await setupCompany({ name: companyName, business_type: businessType, plan });
      await selectPlan(plan);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />
      <motion.div className="onboarding-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          <div className="brand-icon"><TrendingUp size={16} /></div>
          <span style={{ color: 'var(--white)', fontWeight: 700, fontSize: '1.1rem' }}>FinOps</span>
        </div>

        <div className="onboarding-steps">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot-nav ${step >= s ? 'active' : ''}`}>
              {step > s ? <Check size={13} /> : s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" className="onboarding-section"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2>Create your workspace</h2>
              <p>Tell us about your business</p>
              <input className="input" placeholder="Company name" value={companyName}
                onChange={e => setCompanyName(e.target.value)} />
              <div className="business-types">
                {BUSINESS_TYPES.map(type => (
                  <button key={type} onClick={() => setBusinessType(type)}
                    className={`type-btn ${businessType === type ? 'selected' : ''}`}>{type}</button>
                ))}
              </div>
              <button className="glow-btn glow-btn--primary glow-btn--full glow-btn--md"
                disabled={!companyName || !businessType} onClick={() => setStep(2)}>Continue</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" className="onboarding-section"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2>Choose your plan</h2>
              <p>Start free, upgrade anytime</p>
              <div className="plans-grid">
                {SUBSCRIPTION_PLANS.map(p => (
                  <div key={p.id} onClick={() => setPlan(p.id)} className={`plan-card ${plan === p.id ? 'selected' : ''}`}>
                    {p.recommended && <div className="plan-badge">Recommended</div>}
                    <h3>{p.name}</h3>
                    <div className="plan-price">{p.priceLabel}<span>/month</span></div>
                    <ul>{p.features.map(f => <li key={f}><Check size={13} />{f}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="onboarding-nav">
                <button className="glow-btn glow-btn--ghost glow-btn--sm" onClick={() => setStep(1)}>Back</button>
                <button className="glow-btn glow-btn--primary glow-btn--sm" onClick={() => setStep(3)}>Continue</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" className="onboarding-section center"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <div className="success-icon"><Check size={32} /></div>
              <h2>You're all set!</h2>
              <p>Your workspace <strong style={{ color: 'var(--white)' }}>{companyName}</strong> is ready.<br />
                Upload your first bank statement to start generating real financial insights.</p>
              {error && <div className="auth-error">{error}</div>}
              <button className="glow-btn glow-btn--primary glow-btn--lg" onClick={handleFinish} disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Go to Dashboard'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
