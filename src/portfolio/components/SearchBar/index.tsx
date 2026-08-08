import { Search } from "lucide-react";

interface Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PortfolioSearchBar({ searchQuery, onSearchChange }: Props) {
  return (
    <div className="relative group w-full">
      <div className="relative bg-white rounded-full flex items-center p-1.5 border border-[rgba(198,130,145,0.25)] shadow-[0_2px_8px_rgba(198,130,145,0.04)] transition-all duration-400 group-hover:shadow-[0_6px_16px_rgba(198,130,145,0.1)] group-hover:border-[rgba(198,130,145,0.4)] focus-within:shadow-[0_8px_20px_rgba(198,130,145,0.15)] focus-within:border-[rgb(198,130,145)] focus-within:-translate-y-[2px]">
        
        <div className="pl-4 pr-3 text-[rgba(198,130,145,0.6)] group-focus-within:text-[rgb(198,130,145)] transition-colors duration-400">
          <Search className="w-4 h-4" strokeWidth={2} />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar inspiración..."
          className="w-full bg-transparent py-2.5 pr-4 font-sans text-[12px] text-[rgb(74,36,50)] placeholder:text-[rgba(74,36,50,0.4)] font-medium tracking-wide focus:outline-none"
        />
      </div>
    </div>
  );
}
