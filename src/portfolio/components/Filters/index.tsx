import type { PortfolioCategory } from "../../types";

const CATEGORIES: PortfolioCategory[] = [
  "Todas", "Novias", "Social", "XV Años", "Graduación", "Editorial", "Artístico"
];

interface Props {
  activeCategory: PortfolioCategory;
  onCategoryChange: (category: PortfolioCategory) => void;
}

export function PortfolioFilters({ activeCategory, onCategoryChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-4">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              relative px-6 md:px-8 py-3 rounded-full font-sans text-[11px] md:text-[12px] font-medium tracking-[0.1em] transition-all duration-400
              ${isActive 
                ? "text-white shadow-[0_8px_20px_rgba(198,130,145,0.3)] -translate-y-[2px]" 
                : "text-[rgba(74,36,50,0.7)] hover:text-[rgb(74,36,50)] bg-white border border-[rgba(198,130,145,0.25)] shadow-[0_2px_8px_rgba(198,130,145,0.04)] hover:shadow-[0_6px_16px_rgba(198,130,145,0.1)] hover:border-[rgba(198,130,145,0.4)]"
              }
            `}
          >
            {/* Fondo activo (Gradiente rosa elegante, no neón) */}
            {isActive && (
              <span className="absolute inset-0 bg-gradient-to-r from-[rgb(218,150,165)] to-[rgb(198,130,145)] rounded-full -z-10" />
            )}
            
            {cat}
          </button>
        );
      })}
    </div>
  );
}
