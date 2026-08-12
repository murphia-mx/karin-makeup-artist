import type { PortfolioCategory } from "../../types";

const CATEGORIES: PortfolioCategory[] = [
  "Todas",
  "Novias",
  "Social",
  "XV Años",
  "Graduación",
  "Editorial",
  "Artístico",
];

interface Props {
  activeCategory: PortfolioCategory;
  onCategoryChange: (category: PortfolioCategory) => void;
}

export function PortfolioFilters({ activeCategory, onCategoryChange }: Props) {
  return (
    <div className="flex w-full items-center gap-3 overflow-x-auto py-1.5 scrollbar-none sm:flex-wrap">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`
              group
              relative
              flex
              min-h-[46px]
              shrink-0
              items-center
              justify-center
              rounded-full
              px-6
              sm:px-7
              font-sans
              text-[12px]
              font-medium
              tracking-[-0.01em]
              outline-none
              transition-all
              duration-300
              ease-[cubic-bezier(0.22,1,0.36,1)]
              focus-visible:ring-2
              focus-visible:ring-[#c96a84]/35
              focus-visible:ring-offset-2
              ${
                isActive
                  ? `
                    bg-[#472332]
                    text-white
                    shadow-[0_7px_22px_rgba(74,36,50,0.18)]
                    hover:-translate-y-[1px]
                    hover:bg-[#563040]
                    hover:shadow-[0_10px_28px_rgba(74,36,50,0.22)]
                  `
                  : `
                    border
                    border-[#472332]/[0.12]
                    bg-white
                    text-[#472332]/65
                    shadow-[0_2px_10px_rgba(74,36,50,0.035)]
                    hover:-translate-y-[2px]
                    hover:border-[#c96a84]/35
                    hover:bg-[#fffafb]
                    hover:text-[#472332]
                    hover:shadow-[0_8px_24px_rgba(74,36,50,0.09)]
                  `
              }
            `}
          >
            {/* Highlight interno del estado activo */}
            {isActive && (
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-[1px]
                  rounded-full
                  opacity-70
                "
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 55%)",
                }}
              />
            )}

            {/* Punto de estado */}
            {isActive && (
              <span
                className="
                  relative
                  z-10
                  mr-2
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[#e9a7b8]
                  shadow-[0_0_10px_rgba(233,167,184,0.45)]
                "
              />
            )}

            <span className="relative z-10 whitespace-nowrap">{category}</span>
          </button>
        );
      })}
    </div>
  );
}
