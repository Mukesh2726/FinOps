import { useNavigate } from 'react-router-dom';
import { TrendingUp, Zap, Shield, BarChart3, FileText, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const features = [
  { icon: Brain, title: 'AI Categorization', desc: 'Automatically categorize transactions with 95%+ accuracy', color: 'purple' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards with revenue, expense, and profit insights', color: 'blue' },
  { icon: FileText, title: 'Auto Reports', desc: 'P&L, Balance Sheet, and Cash Flow generated instantly', color: 'green' },
  { icon: Shield, title: 'Anomaly Detection', desc: 'AI flags duplicates, unusual spending, and missing receipts', color: 'red' },
  { icon: Zap, title: 'Smart Extraction', desc: 'Extract data from invoices, receipts, and bank statements', color: 'yellow' },
  { icon: TrendingUp, title: 'Growth Insights', desc: 'Track revenue trends and profitability over time', color: 'cyan' },
];

function FeatureCard({ icon: Icon, title, desc, color, index }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={`feature-card feature-card--${color} ${visible ? 'animate-in' : 'pre-animate'}`}
      style={{ transitionDelay: `${index * 80}ms` }}>
      <div className={`feature-icon feature-icon--${color}`}><Icon size={22} /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [heroRef, heroVisible] = useInView(0.05);
  const [statsRef, statsVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="brand"><TrendingUp size={24} /><span>FinOps</span></div>
        <div className="header-actions">
          <button onClick={() => navigate('/login')} className="btn-ghost">Sign In</button>
          <button onClick={() => navigate('/signup')} className="btn-primary">Get Started Free</button>
        </div>
      </header>

      <section className="hero-section" ref={heroRef}>
        <div className="hero-orb hero-orb--1" />
        <div className="hero-orb hero-orb--2" />
        <div className="hero-orb hero-orb--3" />
        <div className={`hero-inner ${heroVisible ? 'animate-in' : 'pre-animate'}`}>
          <div className="hero-badge"><Sparkles size={13} />AI-Powered Bookkeeping</div>
          <h1 className="hero-title">Your finances,<br /><span className="gradient-text">on autopilot</span></h1>
          <p className="hero-sub">Upload bank statements, invoices, and receipts. Our AI organizes everything, categorizes transactions, and generates financial reports — no accounting knowledge needed.</p>
          <div className="hero-actions">
            <button onClick={() => navigate('/signup')} className="btn-primary btn-lg btn-glow">
              Start for Free <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} className="btn-outline btn-lg">View Demo</button>
          </div>
        </div>
        <div ref={statsRef} className={`hero-stats ${statsVisible ? 'animate-in' : 'pre-animate'}`}>
          <div className="stat"><strong>10,000+</strong><span>Businesses</span></div>
          <div className="stat-divider" />
          <div className="stat"><strong>98%</strong><span>AI Accuracy</span></div>
          <div className="stat-divider" />
          <div className="stat"><strong>5 min</strong><span>Setup Time</span></div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-label">Features</div>
        <h2>Everything you need to manage your finances</h2>
        <div className="features-grid">
          {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
        </div>
      </section>

      <section ref={ctaRef} className={`cta-section ${ctaVisible ? 'animate-in' : 'pre-animate'}`}>
        <div className="cta-orb" />
        <div className="section-label">Get Started</div>
        <h2>Ready to automate your bookkeeping?</h2>
        <p>Join thousands of businesses saving hours every week</p>
        <button onClick={() => navigate('/signup')} className="btn-primary btn-lg btn-glow">
          Get Started — It's Free <ArrowRight size={16} />
        </button>
      </section>

      <footer className="landing-footer">
        <span>© 2026 FinOps. Built for small businesses.</span>
      </footer>
    </div>
  );
}
