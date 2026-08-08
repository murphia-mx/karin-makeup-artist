import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

import { fadeUpVariant, premiumTransition } from '../../../lib/framer/variants';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      transition={premiumTransition}
      className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-brand-border bg-brand-surface/50"
    >
      <div className="w-16 h-16 rounded-full bg-white shadow-[0_2px_15px_rgba(61,44,44,0.04)] border border-brand-border-light flex items-center justify-center text-brand-text-muted mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-brand-text mb-2">{title}</h3>
      <p className="text-brand-text-muted font-light max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};
