import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=80&auto=format&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=80&auto=format&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=80&auto=format&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=80&auto=format&fit=crop&crop=faces",
];

export default function Hero({ hero }: { hero?: any }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax elegante: imagen sube 15% más lento que el scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const contentFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const ctaText = hero?.cta?.text || "Agendar mi cita";
  const ctaAction = hero?.cta?.actionUrl || "#contacto";
  const rating = (hero?.rating ?? 5.0) as number;
  const reviewCount = (hero?.reviewCount ?? 0) as number;
  const image = "/images/hero/banner.png";

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative w-full h-[100dvh] min-h-[600px] md:min-h-[680px] overflow-hidden"
      style={{ background: "rgb(30, 18, 26)" }}
    >
      {/* ─────────────────────────────────────────────
          CAPA 1 — FOTOGRAFÍA
          ───────────────────────────────────────────── */}
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-0 w-full h-[115%] -top-[7.5%]"
      >
        <motion.img
          src={image}
          alt="Karin Makeup Artist"
          className="w-full h-full object-cover object-[75%_20%] md:object-[60%_15%]"
          fetchPriority="high"
          decoding="async"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 30, ease: "easeInOut", repeat: Infinity }}
        />
      </motion.div>

      {/* ─────────────────────────────────────────────
          CAPA 2 — OVERLAYS DE DIRECCIÓN DE ARTE
          ───────────────────────────────────────────── */}

      {/* Sistema de Iluminación Editorial Multi-Capa */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            /* Capa 4: Viñeteado sutil para profundidad */
            radial-gradient(
              circle at 50% 50%,
              rgba(0,0,0,0) 60%,
              rgba(24,12,18,0.4) 150%
            ),
            /* Capa 3: Luz cálida cremosa para dar volumen */
            radial-gradient(
              circle at 25% 45%,
              rgba(242,216,224,0.15) 0%,
              rgba(242,216,224,0) 50%
            ),
            /* Capa 1: Base oscura (Deep Mauve) para legibilidad, anclada a la izquierda */
            linear-gradient(
              90deg,
              rgba(54,20,38,0.96) 0%,
              rgba(76,30,54,0.85) 25%,
              rgba(96,40,70,0.55) 48%,
              rgba(96,40,70,0) 68%
            ),
            /* Capa 2: Tinte Blush transparente extendido */
            linear-gradient(
              90deg,
              rgba(196,118,156,0.35) 0%,
              rgba(196,118,156,0.25) 35%,
              rgba(196,118,156,0.10) 60%,
              rgba(196,118,156,0) 75%
            )
          `,
        }}
      />

      {/* Gradiente inferior — fusión suave con la siguiente sección */}
      <div
        className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgb(252,248,246) 0%, rgba(252,248,246,0.6) 40%, rgba(252,248,246,0) 100%)",
        }}
      />

      {/* Gradiente superior — espacio para navbar */}
      <div
        className="absolute top-0 left-0 right-0 h-36 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(22,10,18,0.55) 0%, rgba(22,10,18,0) 100%)",
        }}
      />

      {/* ─────────────────────────────────────────────
          CAPA 3 — CONTENIDO TIPOGRÁFICO
          
          Máx dos líneas en el headline.
          Tipografía con jerarquía real.
          Espacio generoso entre cada elemento.
          ───────────────────────────────────────────── */}
      <motion.div
        style={{ y: contentY, opacity: contentFade }}
        className="absolute inset-0 flex items-center pt-[calc(env(safe-area-inset-top,0px)+60px)] md:pt-0"
      >
        <div
          className="
            w-full
            max-w-[1500px] mx-auto
            px-7 sm:px-12 md:px-16 lg:px-20 xl:px-28
          "
        >
          {/* Contenedor de texto — alineado al tercio izquierdo */}
          <div className="max-w-[520px] lg:max-w-[560px]">
            {/* ── EYEBROW ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2,
              }}
              className="inline-flex items-center gap-3.5 px-5 py-2 rounded-full mb-8 backdrop-blur-md border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] transition-colors duration-300 cursor-default shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            >
              <div
                className="shrink-0 rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: "rgba(237, 210, 215, 0.9)",
                  boxShadow: "0 0 10px rgba(237,210,215,0.6)",
                }}
              />
              <span
                className="font-sans font-medium uppercase"
                style={{
                  fontSize: "clamp(8.5px, 2.5vw, 9.5px)",
                  letterSpacing: "0.28em",
                  color: "rgba(237, 210, 215, 0.95)",
                }}
              >
                Makeup Artist · Mérida
              </span>
            </motion.div>

            {/* ── HEADLINE — Máximo 2 líneas ── */}
            <h1
              className="font-display font-light tracking-tight mb-7"
              style={{ lineHeight: 1.05 }}
            >
              {/* Línea 1 — blanco limpio */}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.35,
                }}
                className="block"
                style={{
                  fontSize: "clamp(2.1rem, 7vw, 3.2rem)",
                  color: "rgba(255, 252, 251, 0.98)",
                }}
              >
                Realzo tu belleza, creo tu
              </motion.span>
              {/* Línea 2 — blush rosado, itálica */}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.45,
                }}
                className="block italic pr-4"
                style={{
                  fontSize: "clamp(2.1rem, 7.5vw, 3.2rem)",
                  color: "rgb(237, 210, 215)",
                }}
              >
                mejor versión.
              </motion.span>
            </h1>

            {/* ── DESCRIPCIÓN ── */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.55,
              }}
              className="font-sans font-light leading-[1.75] mb-12 md:mb-12"
              style={{
                fontSize: "clamp(13.5px, 3.5vw, 14.5px)",
                color: "rgba(255, 252, 251, 0.95)",
                maxWidth: "340px",
              }}
            >
              Especialista en novias, XV años y eventos. Cada look diseñado para
              revelar tu esencia más auténtica.
            </motion.p>

            {/* ── CTAs ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.7,
              }}
              className="flex items-center gap-7 mb-12"
            >
              {/* Botón primario — premium, Apple-style */}
              <a
                href={ctaAction}
                className="group relative overflow-hidden"
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
                {ctaText}
              </a>

              {/* Link secundario — sutil, elegante */}
              <a
                href="#portafolio"
                className="group flex items-center gap-2"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(237, 210, 215, 0.95)",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255, 255, 255, 1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(237, 210, 215, 0.95)";
                }}
              >
                Ver portafolio
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "transform 0.3s ease" }}
                  className="group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>

            {/* ── SOCIAL PROOF ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.9,
              }}
              className="flex items-center gap-4"
            >
              {/* Avatares */}
              <div className="flex -space-x-2 shrink-0">
                {AVATAR_URLS.map((url, i) => (
                  <div
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "1.5px solid rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <img
                      src={url}
                      alt={`Clienta ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* Separador vertical */}
              <div
                style={{
                  width: 1,
                  height: 32,
                  background: "rgba(237, 210, 215, 0.2)",
                  flexShrink: 0,
                }}
              />

              {/* Texto */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="#F6C75A"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                  <span
                    className="font-sans ml-1"
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    {rating.toFixed(1)}
                  </span>
                </div>
                <span
                  className="font-sans font-semibold uppercase"
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.05em",
                    color: "#FFFFFF",
                  }}
                >
                  {reviewCount > 0
                    ? `+${reviewCount} clientas felices`
                    : "Clientas satisfechas"}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────
          CAPA 4 — SCROLL INDICATOR (bottom center)
          ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-20"
      >
        <div
          style={{
            width: 1,
            height: 36,
            background:
              "linear-gradient(to bottom, rgba(237,210,215,0.6) 0%, rgba(237,210,215,0) 100%)",
          }}
        />
        <span
          className="font-sans uppercase"
          style={{
            fontSize: "7px",
            letterSpacing: "0.35em",
            color: "rgba(237, 210, 215, 0.4)",
          }}
        >
          Descubrir
        </span>
      </motion.div>
    </section>
  );
}
