import { motion, AnimatePresence } from "framer-motion";
import type { PortfolioItem } from "../../types";
import { PortfolioCard } from "../PortfolioCard";

interface Props {
  items: PortfolioItem[];
  onItemClick: (item: PortfolioItem) => void;
}

export function PortfolioGrid({ items, onItemClick }: Props) {
  return (
    <div className="w-full">
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.5, 
                delay: Math.min(i * 0.05, 0.3),
                ease: [0.25, 0.46, 0.45, 0.94] 
              }}
              className="w-full"
            >
              <PortfolioCard item={item} onClick={() => onItemClick(item)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
