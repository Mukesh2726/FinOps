import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, glow = false, style = {}, onClick }) {
  return (
    <motion.div
      className={`glass-card ${glow ? 'glass-card--glow' : ''} ${className}`}
      style={style}
      onClick={onClick}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 32px rgba(99,102,241,0.15)' } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
