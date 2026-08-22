import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Zap, Shield, BarChart3, FileText, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';

const features = [
  { icon: Brain, title: 'AI Categorization', desc: 'Automatically categorize transactions with 95%+ accuracy using advanced ML models.', color: 'purple' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards with revenue, expense, and profit insights updated instantly.', color: 'blue' },
  { icon: FileText, title: 'Auto Reports', desc: 'P&L, Balance Sheet, and Cash Flow generated automatically from your data.', color: 'green' },
  { icon: Shield, title: 'Anomaly Detection', desc: 'AI flags duplicates, unusual spending patterns, and missing receipts.', color: 'red' },
  { icon: Zap, title: 'Smart Extraction', desc: 'Extract structured data from invoices, receipts, and bank statements instantly.', color: 'yellow' },
  { icon: TrendingUp, title: 'Growth Insights', desc: 'Track revenue trends and profitability over time with predictive analytics.', color: 'cyan' },
];

function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });
      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="hero-particles" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }} />;
}

function FeatureCard({ icon: Icon, title, desc, color, index }) {
  const [ref, visible] = useInView();
  return (
    <motion.div
      ref={ref}
      className={`feature-card feature-card--${color}`}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <div className={`feature-icon`}><Icon size={22} /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function Landing() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [ctaRef, ctaVisible] = useInView();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing">
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><TrendingUp size={16} /></div>
          <span>FinOps</span>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/login')} className="glow-btn glow-btn--ghost glow-btn--sm">Sign In</button>
          <button onClick={() => navigate('/signup')} className="glow-btn glow-btn--primary glow-btn--sm">Get Started Free</button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-gradient-bg" />
        <div className="hero-orb hero-orb--1" />
        <div className="hero-orb hero-orb--2" />
        <div className="hero-orb hero-orb--3" />
        <Particles />

        {/* Video background — falls back gracefully if missing */}
        <video
          ref={videoRef}
          className="hero-video-bg"
          autoPlay muted loop playsInline
          onError={e => { e.target.style.display = 'none'; }}
        >
          <source src="/assets/videos/hero-finance.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />

        <motion.div
          className="hero-content"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <div className="hero-badge"><Sparkles size={13} /> AI-Powered Financial Intelligence</div>
          </motion.div>
          <motion.h1 className="hero-title" variants={fadeUp} transition={{ duration: 0.5 }}>
            Turn Financial Data Into<br /><span className="gradient-text">Intelligent Decisions.</span>
          </motion.h1>
          <motion.p className="hero-sub" variants={fadeUp} transition={{ duration: 0.5 }}>
            AI-powered financial intelligence that automatically understands your documents, categorizes transactions, detects anomalies and generates actionable business insights.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeUp} transition={{ duration: 0.5 }}>
            <button onClick={() => navigate('/signup')} className="glow-btn glow-btn--primary glow-btn--lg">
              Start Free <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} className="glow-btn glow-btn--outline glow-btn--lg">
              Explore Dashboard
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="stat"><strong>10,000+</strong><span>Businesses</span></div>
          <div className="stat-divider" />
          <div className="stat"><strong>98%</strong><span>AI Accuracy</span></div>
          <div className="stat-divider" />
          <div className="stat"><strong>5 min</strong><span>Setup Time</span></div>
          <div className="stat-divider" />
          <div className="stat"><strong>₹2Cr+</strong><span>Processed</span></div>
        </motion.div>
      </section>

      <section className="features-section">
        <span className="section-label">Features</span>
        <h2>Everything you need to manage your finances</h2>
        <div className="features-grid">
          {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
        </div>
      </section>

      <motion.section
        ref={ctaRef}
        className="cta-section"
        initial={{ opacity: 0, y: 30 }}
        animate={ctaVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="cta-orb" />
        <span className="section-label">Get Started</span>
        <h2>Ready to automate your bookkeeping?</h2>
        <p>Join thousands of businesses saving hours every week with AI-powered finance.</p>
        <button onClick={() => navigate('/signup')} className="glow-btn glow-btn--primary glow-btn--lg">
          Get Started — It's Free <ArrowRight size={16} />
        </button>
      </motion.section>

      <footer className="landing-footer">
        <span>© 2026 FinOps. AI-powered financial intelligence.</span>
      </footer>
    </div>
  );
}
