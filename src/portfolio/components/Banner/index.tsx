import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function Banner() {
  return (
    <section className="relative w-full h-[420px] md:h-[480px] overflow-hidden flex items-center justify-center bg-[rgb(255,252,251)]">
      {/* ── FOTOGRAFÍA CON PARALLAX SUTIL (Sin filtros destructivos) ── */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 4, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=85&w=1600&auto=format&fit=crop"
          alt="Portfolio Background"
          className="w-full h-full object-cover object-[50%_40%]"
        />

        {/* Glow cálido sutil (iluminación tipo beauty campaign, no tinte morado) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(235,210,215,0.15)] to-transparent mix-blend-overlay" />
      </motion.div>

      {/* ── OVERLAYS PARA LEGIBILIDAD (Oscurecimiento delicado y transparente arriba para el Navbar) ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.15)] via-[rgba(0,0,0,0.25)] to-[rgba(0,0,0,0.5)]" />

      {/* Radial blur muy suave solo detrás del texto, sin alterar la foto entera */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[600px] h-[300px] bg-[rgba(30,15,20,0.25)] blur-[50px] rounded-full pointer-events-none" />

      {/* ── CONTENIDO ── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center text-center pt-[60px]">
        {/* Link sutil para regresar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute top-[80px] left-6 lg:left-12 hidden md:block"
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-medium text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Inicio
          </Link>
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="w-6 h-[1px] bg-[rgba(255,255,255,0.3)]" />
          <p className="font-sans text-[9px] uppercase tracking-[0.35em] font-bold text-[rgba(255,255,255,0.85)]">
            Nuestros Trabajos
          </p>
          <span className="w-6 h-[1px] bg-[rgba(255,255,255,0.3)]" />
        </motion.div>

        {/* Título Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="font-display text-[3.2rem] md:text-[4.5rem] text-white font-light tracking-tight mb-6 leading-[1.1] max-w-[750px]"
        >
          Galería de <br className="md:hidden" />
          <em className="italic text-transparent bg-clip-text bg-gradient-to-r from-[rgb(245,225,230)] to-[rgb(218,150,165)] drop-shadow-[0_2px_12px_rgba(218,150,165,0.25)]">
            Transformaciones
          </em>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="font-sans text-[14px] md:text-[15px] text-[rgba(255,255,255,0.85)] max-w-[540px] leading-[1.8] tracking-wide"
        >
          Cada rostro es un lienzo único. Explora nuestra colección de estilos
          diseñados para resaltar tu belleza más auténtica y elegante.
        </motion.p>
      </div>
    </section>
  );
}
