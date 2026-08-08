import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CustomRatingProps {
  value: number;
  onChange: (value: number) => void;
  onHoverChange?: (value: number | null) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomRating = ({ value, onChange, onHoverChange, readOnly = false, size = 'md' }: CustomRatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const dimensions = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverValue(index);
      onHoverChange?.(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
      onHoverChange?.(null);
    }
  };

  const handleClick = (index: number) => {
    if (!readOnly) onChange(index);
  };

  return (
    <div className="flex items-center gap-2" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue ?? value) >= star;

        return (
          <motion.button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            disabled={readOnly}
            className={twMerge(
              'relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-text rounded-full transition-transform',
              !readOnly && 'hover:scale-110'
            )}
            whileTap={!readOnly ? { scale: 0.9 } : undefined}
          >
            {/* Background outline star */}
            <Star
              strokeWidth={1}
              className={clsx(
                dimensions[size],
                'text-[#D1D1D6] transition-colors duration-300',
                isFilled && 'text-transparent'
              )}
            />

            {/* Filled animated star */}
            <AnimatePresence>
              {isFilled && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0, rotate: 45 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute inset-0"
                >
                  <Star
                    className={clsx(
                      dimensions[size],
                      'fill-[#3A2A31] text-[#3A2A31]'
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
};
