'use client';
import { motion } from 'framer-motion';

export default function BounceInTop({ children }) {
  return (
    <motion.div
      initial={{ y: -200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 10,
      }}
    >
      {children}
    </motion.div>
  );
}
