"use client";

import { motion } from "framer-motion";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function BlurFade({ children, className, delay = 0, duration = 0.3 }: BlurFadeProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
