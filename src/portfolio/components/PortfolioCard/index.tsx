import { motion } from "framer-motion";
import type { PortfolioItem } from "../../types";

interface Props {
  item: PortfolioItem;
  onClick: () => void;
}

export function PortfolioCard({ item, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative w-full aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer block bg-[rgb(250,245,242)] shadow-[0_4px_20px_rgba(198,130,145,0.06)] hover:shadow-[0_12px_40px_rgba(198,130,145,0.2)] transition-shadow duration-500"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* ── IMAGEN PRINCIPAL ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
        />
      </div>

      {/* ── OVERLAY ROSADO ELEGANTE ── */}
      {/* Un overlay sutil constante para legibilidad que se intensifica a un rosa champagne en hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(74,36,50,0.5)] via-transparent to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(198,130,145,0.85)_0%,rgba(198,130,145,0.4)_40%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* ── BORDE ILUMINADO SUTIL EN HOVER ── */}
      <div className="absolute inset-0 border-[2px] border-[rgba(255,255,255,0.5)] opacity-0 group-hover:opacity-100 rounded-3xl pointer-events-none transition-opacity duration-500 mix-blend-overlay" />

      {/* ── INFORMACIÓN FLOTANTE ELEGANTE ── */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        
        {/* Línea decorativa */}
        <div className="w-8 h-[1px] bg-white/70 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />

        <h3 className="text-left font-display text-2xl text-white font-light tracking-wide drop-shadow-sm mb-1 opacity-90 group-hover:opacity-100">
          {item.title}
        </h3>
        
        <p className="text-left font-sans text-[10px] text-[rgba(255,255,255,0.9)] uppercase tracking-[0.2em] font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 delay-75 transform translate-y-2 group-hover:translate-y-0">
          {item.serviceType} <span className="mx-1 text-white/50">•</span> Mérida
        </p>

      </div>
    </motion.button>
  );
}
