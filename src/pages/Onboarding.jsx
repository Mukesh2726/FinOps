import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BUSINESS_TYPES, PLANS } from '../data/mockData';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [plan, setPlan] = useState('growth');
  const { setupCompany } = useApp();
  const navigate = useNavigate();

  const handleFinish = () => {
    setupCompany({ name: companyName, businessType, plan });
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-steps">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>{step > s ? <Check size={12} /> : s}</div>
          ))}
        </div>

        {step === 1 && (
          <div className="onboarding-section">
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
            <button className="btn-primary btn-full" disabled={!companyName || !businessType}
              onClick={() => setStep(2)}>Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-section">
            <h2>Choose your plan</h2>
            <p>Start free, upgrade anytime</p>
            <div className="plans-grid">
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)}
                  className={`plan-card ${plan === p.id ? 'selected' : ''}`}>
                  {p.id === 'growth' && <div className="plan-badge">Popular</div>}
                  <h3>{p.name}</h3>
                  <div className="plan-price">{p.price}</div>
                  <ul>{p.features.map(f => <li key={f}><Check size={14} />{f}</li>)}</ul>
                </div>
              ))}
            </div>
            <div className="onboarding-nav">
              <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" onClick={() => setStep(3)}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-section center">
            <div className="success-icon"><Check size={32} /></div>
            <h2>You're all set!</h2>
            <p>Your workspace <strong>{companyName}</strong> is ready.<br />
              Chart of accounts loaded for <strong>{businessType}</strong>.</p>
            <button className="btn-primary btn-lg" onClick={handleFinish}>Go to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}
