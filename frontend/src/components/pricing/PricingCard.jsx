import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SubscriptionBadge from './SubscriptionBadge';

export default function PricingCard({ plan, currentPlanId, onSelect, loading }) {
  const isCurrent = currentPlanId === plan.id;
  return (
    <motion.article
      className={`pricing-card ${plan.recommended ? 'pricing-card--recommended' : ''} ${isCurrent ? 'pricing-card--current' : ''}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {plan.recommended && <div className="pricing-recommended">Recommended</div>}
      <div className="pricing-card-top">
        <div>
          <span className="pricing-kicker">{plan.id}</span>
          <h2>{plan.name}</h2>
        </div>
        {isCurrent && <SubscriptionBadge />}
      </div>
      <p className="pricing-description">{plan.description}</p>
      <div className="pricing-price"><strong>{plan.priceLabel}</strong><span>/month</span></div>
      <div className="pricing-divider" />
      <ul className="pricing-features">
        {plan.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}
      </ul>
      <button
        className={`glow-btn ${isCurrent ? 'glow-btn--ghost' : 'glow-btn--primary'} glow-btn--full glow-btn--md`}
        onClick={() => onSelect(plan.id)}
        disabled={isCurrent || loading}
      >
        {loading ? <span className="btn-spinner" /> : isCurrent ? 'Current Plan' : 'Choose Plan'}
        {!isCurrent && !loading && <ArrowRight size={15} />}
      </button>
    </motion.article>
  );
}
