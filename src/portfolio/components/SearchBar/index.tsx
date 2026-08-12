import { Search } from "lucide-react";

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PortfolioSearchBar({ searchQuery, onSearchChange }: Props) {
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="group relative w-full">
      <div
        className="
          relative
          flex
          h-[46px]
          w-full
          items-center
          overflow-hidden
          rounded-full
          border
          border-[#472332]/[0.11]
          bg-white
          transition-all
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          hover:-translate-y-[1px]
          hover:border-[#472332]/[0.18]
          hover:shadow-[0_8px_24px_rgba(74,36,50,0.07)]
          focus-within:-translate-y-[1px]
          focus-within:border-[#c96a84]/45
          focus-within:shadow-[0_10px_30px_rgba(74,36,50,0.09)]
        "
      >
        {/* ============================================================ */}
        {/* SEARCH ICON                                                   */}
        {/* ============================================================ */}

        <div
          className="
            flex
            h-full
            w-[48px]
            shrink-0
            items-center
            justify-center
            text-[#472332]/35
            transition-colors
            duration-300
            group-focus-within:text-[#c65f7c]
          "
        >
          <Search className="h-[17px] w-[17px]" strokeWidth={1.8} />
        </div>

        {/* ============================================================ */}
        {/* INPUT                                                         */}
        {/* ============================================================ */}

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar inspiración"
          aria-label="Buscar inspiración"
          className="
            h-full
            min-w-0
            flex-1
            bg-transparent
            pr-3
            font-sans
            text-[12px]
            font-medium
            tracking-[-0.01em]
            text-[#472332]
            outline-none
            placeholder:text-[#472332]/35
          "
        />

        {/* ============================================================ */}
        {/* CLEAR                                                         */}
        {/* ============================================================ */}

        {hasQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Limpiar búsqueda"
            className="
              mr-2
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#472332]/[0.06]
              font-sans
              text-[14px]
              leading-none
              text-[#472332]/45
              transition-all
              duration-200
              hover:bg-[#472332]/[0.1]
              hover:text-[#472332]
            "
          >
            ×
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* FOCUS ACCENT                                                  */}
      {/* ============================================================ */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/2
          h-[1px]
          w-0
          -translate-x-1/2
          rounded-full
          bg-[#c65f7c]
          opacity-0
          transition-all
          duration-400
          ease-[cubic-bezier(0.22,1,0.36,1)]
          group-focus-within:w-[45%]
          group-focus-within:opacity-70
        "
      />
    </div>
  );
}
