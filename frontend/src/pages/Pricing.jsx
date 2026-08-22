import { useState } from 'react';
import { Check, CreditCard, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import PricingCard from '../components/pricing/PricingCard';
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans';
import { useSubscription } from '../hooks/useSubscription';

export default function Pricing() {
  const { currentPlan, selectPlan } = useSubscription();
  const [selecting, setSelecting] = useState(null);
  const [message, setMessage] = useState('');

  const handleSelect = async (planId) => {
    setSelecting(planId);
    setMessage('');
    try {
      await selectPlan(planId);
      setMessage('Plan updated successfully. Payment will be connected through the backend.');
    } catch (error) {
      setMessage(error.message || 'Unable to update plan.');
    } finally {
      setSelecting(null);
    }
  };

  return (
    <Layout>
      <div className="pricing-page">
        <motion.div className="page-header pricing-header" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <div className="ai-badge"><CreditCard size={12} /> Billing & Plans</div>
            <h1>Choose the plan that fits your next chapter</h1>
            <p>Simple monthly plans with the financial intelligence your team needs.</p>
          </div>
        </motion.div>
        {message && <div className="pricing-message"><Check size={15} />{message}</div>}
        <div className="pricing-grid">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <PricingCard plan={plan} currentPlanId={currentPlan?.id} onSelect={handleSelect} loading={selecting === plan.id} />
            </motion.div>
          ))}
        </div>
        <div className="pricing-trust"><ShieldCheck size={16} /><span>Payments are handled securely by the FinOps backend. No payment details are stored in this frontend.</span></div>
      </div>
    </Layout>
  );
}
