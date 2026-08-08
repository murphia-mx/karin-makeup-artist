import { motion } from "framer-motion";

export default function CTA({ cta: model }: { cta?: any }) {
  const ctaUrl = model?.actionUrl || "#contacto";

  return (
    <section className="relative w-full py-32 md:py-48 flex items-center justify-center overflow-hidden bg-[#2A1B23]">
      
      {/* ── IMAGEN DE FONDO (Abstracta, minimalista, zoom imperceptible) ── */}
      <motion.div 
        className="absolute inset-0 z-0 w-full h-[110%]"
      >
        <motion.img
          src="/cta-minimal.jpg"
          alt="Experiencia Minimalista Karin Makeup"
          className="w-full h-full object-cover"
          animate={{ scale: [1, 1.02] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        />
      </motion.div>

      {/* ── OVERLAYS LIGEROS (Respetando la textura de la foto) ── */}
      
      {/* Capa 1: Oscurecimiento muy sutil para garantizar legibilidad sin matar la foto */}
      <div className="absolute inset-0 z-0 bg-[#2A1B23] mix-blend-multiply opacity-40 pointer-events-none" />

      {/* Capa 2: Resplandor cálido súper tenue desde el centro */}
      <div 
        className="absolute inset-0 z-0 mix-blend-screen pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(214,134,170,0.15) 0%, transparent 60%)" }}
      />

      {/* ── CONTENIDO APPLE / FRAMER STYLE ── */}
      <div className="relative z-10 w-full max-w-[600px] mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-4"
        >
          <span 
            className="font-sans font-medium uppercase tracking-[0.2em] text-[rgba(255,252,251,0.65)]"
            style={{ fontSize: "11px" }}
          >
            El siguiente paso
          </span>
        </motion.div>

        {/* Título limpio y contemporáneo */}
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-sans font-medium tracking-tight text-white mb-6"
          style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.15 }}
        >
          Reserva cuando estés lista.
        </motion.h2>

        {/* Texto descriptivo relajante */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-sans font-light text-[rgba(255,252,251,0.7)] mb-12"
          style={{ fontSize: "15px", maxWidth: "480px", lineHeight: 1.7 }}
        >
          Cada maquillaje está diseñado para que disfrutes tu evento sintiéndote segura, cómoda y completamente tú.
        </motion.p>

        {/* Botón Exactamente Igual al Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <a
            href={ctaUrl}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "54px",
              paddingLeft: "36px",
              paddingRight: "36px",
              background: "#CF7F9B",
              borderRadius: "9999px",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              textDecoration: "none",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#C56E8E";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 24px rgba(197, 110, 142, 0.35)";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#CF7F9B";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 12px rgba(0,0,0,0)";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            Reservar mi cita
          </a>
        </motion.div>
      </div>
    </section>
  );
}
