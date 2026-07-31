import { motion } from 'framer-motion';

export default function Loader({ label = 'Loading your workspace…' }) {
  return (
    <div className="loader-screen">
      <motion.img
        src="/edubia-logo.png"
        alt="Edubia"
        className="loader-logo"
        animate={{ y: [0, -10, 0], rotate: [0, -2, 2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="loader-dots"><span /><span /><span /></div>
      <p>{label}</p>
    </div>
  );
}
