import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Clock, Star } from "lucide-react";
import type { PortfolioItem } from "../../types";

interface Props {
  items: PortfolioItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PortfolioLightbox({ items, currentIndex, onClose, onNavigate }: Props) {
  if (currentIndex === null) return null;
  const item = items[currentIndex];
  
  const whatsappUrl = `https://wa.me/529990000000?text=Hola%20Karin,%20me%20encant%C3%B3%20el%20look%20"${encodeURIComponent(item.title)}"%20del%20portafolio%20y%20quiero%20agendar%20una%20cita.`;

  return (
    <AnimatePresence>
      {currentIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
        >
          {/* Backdrop con Blur y Tinte Rosado */}
          <div 
            className="absolute inset-0 bg-[rgba(255,252,251,0.85)] backdrop-blur-xl"
            onClick={onClose}
          />
          
          <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(198,130,145,0.05)] to-transparent pointer-events-none" />

          {/* Botón Cerrar Flotante */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[110] w-12 h-12 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-[rgb(74,36,50)] shadow-[0_4px_12px_rgba(198,130,145,0.1)] hover:shadow-[0_8px_24px_rgba(198,130,145,0.2)] transition-all duration-300"
          >
            <X strokeWidth={1.5} className="w-5 h-5" />
          </button>

          {/* Contenedor Principal (Tarjeta Dividida) */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 w-full max-w-[1200px] h-[90vh] md:h-[80vh] bg-white rounded-[2rem] shadow-[0_24px_80px_rgba(74,36,50,0.12)] overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* IZQUIERDA: Fotografía Enorme */}
            <div className="relative w-full md:w-[55%] lg:w-[60%] h-[50%] md:h-full bg-[rgb(250,245,242)]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={item.id}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.4 }}
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Navegación superpuesta */}
              <div className="absolute inset-y-0 left-4 flex items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + items.length) % items.length); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-[rgb(74,36,50)] hover:bg-white hover:text-[rgb(198,130,145)] shadow-lg transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-4 flex items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % items.length); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-[rgb(74,36,50)] hover:bg-white hover:text-[rgb(198,130,145)] shadow-lg transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DERECHA: Información y CTA */}
            <div className="relative w-full md:w-[45%] lg:w-[40%] h-[50%] md:h-full p-8 lg:p-12 flex flex-col overflow-y-auto bg-white">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex flex-col h-full"
                >
                  {/* Categoría o Tipo de Servicio */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[rgba(198,130,145,0.1)] text-[rgb(198,130,145)] text-[9px] uppercase tracking-[0.2em] font-bold rounded-full">
                      {item.category}
                    </span>
                    {item.featured && (
                      <span className="flex items-center gap-1 text-[rgb(218,165,32)] text-[9px] uppercase tracking-wider font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        Destacado
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-4xl lg:text-5xl text-[rgb(74,36,50)] leading-[1.1] tracking-tight mb-6">
                    {item.title}
                  </h2>

                  <p className="font-sans text-[13px] leading-relaxed text-[rgba(74,36,50,0.7)] mb-8">
                    {item.description}
                  </p>

                  {/* Detalles Técnicos */}
                  <div className="grid grid-cols-2 gap-4 mb-10 pt-6 border-t border-[rgba(198,130,145,0.15)]">
                    <div>
                      <span className="block font-sans text-[9px] uppercase tracking-widest text-[rgba(74,36,50,0.4)] mb-1">Servicio</span>
                      <span className="font-sans text-[11px] font-medium text-[rgb(74,36,50)]">{item.serviceType}</span>
                    </div>
                    <div>
                      <span className="block font-sans text-[9px] uppercase tracking-widest text-[rgba(74,36,50,0.4)] mb-1">Duración</span>
                      <span className="flex items-center gap-1.5 font-sans text-[11px] font-medium text-[rgb(74,36,50)]">
                        <Clock className="w-3.5 h-3.5 text-[rgb(198,130,145)]" />
                        {item.duration}
                      </span>
                    </div>
                  </div>

                  {/* CTA Principal */}
                  <div className="mt-auto pt-6">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-center w-full h-[54px] rounded-full bg-[rgb(198,130,145)] text-white font-sans text-[11px] font-bold tracking-[0.15em] uppercase overflow-hidden shadow-[0_8px_24px_rgba(198,130,145,0.3)] transition-all duration-400 hover:shadow-[0_12px_32px_rgba(198,130,145,0.5)] hover:-translate-y-1"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      Agendar este look
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
