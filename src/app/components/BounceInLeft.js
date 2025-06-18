'use client';
import { motion } from 'framer-motion';

export default function BounceInLeft({ children }) {
  return (
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
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
