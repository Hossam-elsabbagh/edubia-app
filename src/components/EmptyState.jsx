import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function EmptyState({ title, message, action }) {
  return (
    <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <span className="empty-icon"><Sparkles size={22} /></span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </motion.div>
  );
}
