import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authApi } from '../services/api/auth';

export default function Auth({ mode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup, company } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await signup(email, password, name);
        navigate('/onboarding');
      } else {
        await login(email, password);
        navigate(company ? '/dashboard' : '/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => authApi.signInWithGoogle();

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb--1" />
      <div className="auth-orb auth-orb--2" />
      <div className="auth-card animate-in">
        <div className="auth-brand">
          <div className="brand-icon"><TrendingUp size={16} /></div>
          <span>FinOps</span>
        </div>
        <h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
        <p className="auth-sub">{mode === 'signup' ? 'Start your free 14-day trial' : 'Sign in to your workspace'}</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <input className="input" type="text" placeholder="Full name" value={name}
              onChange={e => setName(e.target.value)} required />
          )}
          <input className="input" type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required minLength={6} />
          <button type="submit" className="btn-primary btn-full btn-glow" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : (mode === 'signup' ? 'Create Account' : 'Sign In')}
          </button>
          <button type="button" className="btn-outline btn-full" onClick={handleGoogle}>
            Continue with Google
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={mode === 'signup' ? '/login' : '/signup'}>
            {mode === 'signup' ? 'Sign in' : 'Sign up free'}
          </Link>
        </p>
      </div>
    </div>
  );
}
