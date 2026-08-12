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
        className="
          grid
          w-full
          grid-cols-1
          gap-x-5
          gap-y-8
          sm:grid-cols-2
          sm:gap-x-6
          sm:gap-y-10
          lg:grid-cols-3
          lg:gap-x-7
          lg:gap-y-12
        "
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 8,
              }}
              transition={{
                layout: {
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                },
                opacity: {
                  duration: 0.35,
                  delay: Math.min(index * 0.035, 0.18),
                },
                y: {
                  duration: 0.55,
                  delay: Math.min(index * 0.035, 0.18),
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              className="min-w-0"
            >
              <PortfolioCard item={item} onClick={() => onItemClick(item)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
