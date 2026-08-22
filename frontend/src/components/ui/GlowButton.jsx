import { motion } from 'framer-motion';

export default function GlowButton({ children, onClick, variant = 'primary', size = 'md', disabled = false, type = 'button', className = '' }) {
  const base = `glow-btn glow-btn--${variant} glow-btn--${size} ${className}`;
  return (
    <motion.button
      type={type}
      className={base}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  );
}
