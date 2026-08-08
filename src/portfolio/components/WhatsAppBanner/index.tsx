import { motion } from "framer-motion";

export function WhatsAppBanner() {
  const whatsappUrl = "https://wa.me/529990000000?text=Hola%20Karin,%20vi%20tu%20portafolio%20y%20me%20encantar%C3%ADa%20agendar%20una%20cita.";

  return (
    <section className="w-full py-16 md:py-20 relative overflow-hidden bg-[rgb(255,252,251)]">
      {/* Luces y brillos rosados de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(198,130,145,0.08)_0%,transparent_70%)] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[800px] mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="inline-block px-3 py-1 mb-6 rounded-full bg-[rgba(198,130,145,0.1)] border border-[rgba(198,130,145,0.2)] text-[rgb(175,100,118)] text-[9px] font-bold uppercase tracking-[0.25em]">
            Tu turno de brillar
          </span>

          <h2 className="font-display text-3xl md:text-4xl text-[rgb(74,36,50)] mb-4">
            ¿Te gustó algún <em className="italic text-[rgb(198,130,145)]">estilo?</em>
          </h2>

          <p className="font-sans text-[13px] md:text-[14px] text-[rgba(74,36,50,0.65)] max-w-[450px] mx-auto leading-relaxed mb-8">
            Agenda tu cita y recreemos un look pensado especialmente para resaltar tus facciones y personalidad.
          </p>

          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-3 h-[50px] px-8 rounded-full bg-[rgb(198,130,145)] text-white font-sans text-[11px] font-bold tracking-[0.15em] uppercase overflow-hidden shadow-[0_8px_24px_rgba(198,130,145,0.35)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(198,130,145,0.5)] hover:-translate-y-1"
          >
            {/* Brillo en hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            
            Escribir por WhatsApp
            <svg 
              className="w-4 h-4 group-hover:scale-110 transition-transform" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
