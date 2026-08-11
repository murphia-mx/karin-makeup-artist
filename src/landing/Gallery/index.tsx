import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useQuery } from '@tanstack/react-query';
import { supabaseAny as supabase } from '../../lib/supabase';

// Hook para leer la galería
const useLandingGallery = () => {
  return useQuery({
    queryKey: ['landing_gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_projects')
        .select('*')
        .eq('active', true)
        .eq('is_favorite', true)
        .order('display_order', { ascending: true })
        .limit(6);
      
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

const LuxuryIcons = {
  sparkle: (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

export default function Gallery({}: { gallery?: any }) {
  const { data: dbGallery } = useLandingGallery();
  
  // Usar los de BD si hay, sino fallback vacío para no romper la UI (o skeleton)
  const displayImages = dbGallery && dbGallery.length > 0 ? dbGallery : [];

  return (
    <section
      id="portafolio"
      className="w-full py-28 md:py-36 overflow-hidden relative"
      style={{ backgroundColor: "rgb(255, 254, 253)" }}
    >
      {/* ── BACKGROUND ORBS (Reflejos rosados MUY sutiles) ── */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(235,168,185,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[1300px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {/* ── HEADER EDITORIAL ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 md:mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                style={{
                  width: 24,
                  height: 1.5,
                  background: "rgba(210,110,135,0.8)",
                }}
              />
              <span
                className="font-sans font-semibold uppercase tracking-[0.25em]"
                style={{ fontSize: "10px", color: "rgb(210,110,135)" }}
              >
                Colección Exclusiva
              </span>
            </div>

            <h2
              className="font-display font-light tracking-tight"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                lineHeight: 1.05,
                color: "rgb(74, 36, 50)",
              }}
            >
              Arte en cada{" "}
              <em className="italic" style={{ color: "rgb(210,110,135)" }}>
                detalle.
              </em>
            </h2>
          </motion.div>

          {/* CTA SUPERIOR QUE LLEVA A LA PÁGINA INDEPENDIENTE */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/portafolio"
              className="group flex items-center justify-center gap-3 px-6 md:px-8 h-[48px] md:h-[50px] rounded-full transition-all duration-500 overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(135deg, rgb(210,110,135) 0%, rgb(175,80,110) 100%)",
                boxShadow:
                  "0 8px 24px rgba(210,110,135,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <span
                className="relative z-10 font-sans font-bold uppercase tracking-[0.18em]"
                style={{ fontSize: "10.5px", color: "#ffffff" }}
              >
                Descubrir Portafolio Completo
              </span>
              <ArrowRight
                className="relative z-10 w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5 text-white"
                strokeWidth={2}
              />
            </Link>
          </motion.div>
        </div>

        {/* ── MASONRY SNEAK PEEK (6 fotos máximo) ── */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8">
          {displayImages.map((img: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 1,
                delay: (index % 3) * 0.1, // Stagger effect
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              whileHover={{
                y: -4,
                boxShadow: "0 25px 60px rgba(210,110,135,0.15), inset 0 2px 10px rgba(255,255,255,0.9)",
                borderColor: "rgba(235,168,185,0.5)",
                transition: { duration: 0.4 }
              }}
              whileTap={{
                scale: 0.98,
                boxShadow: "0 10px 30px rgba(210,110,135,0.1), inset 0 2px 10px rgba(255,255,255,0.9)",
                borderColor: "rgba(235,168,185,0.45)",
                transition: { duration: 0.2 }
              }}
              className="break-inside-avoid relative overflow-hidden group rounded-[16px]"
              style={{
                border: "1px solid rgba(235,168,185,0.25)",
                boxShadow:
                  "0 10px 35px rgba(210,110,135,0.06), inset 0 2px 10px rgba(255,255,255,0.9)",
                background: "linear-gradient(145deg, #ffffff 0%, #fff7f9 100%)",
                transform: "translateZ(0)",
              }}
            >
              <Link
                to="/portafolio"
                className="block relative w-full h-full overflow-hidden bg-[#fff5f7] rounded-[15px]"
              >
                <img
                  src={img.image_url}
                  alt={img.title || img.category || "Maquillaje Karin"}
                  className="w-full h-auto block"
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                />

                {/* OVERLAY EDITORIAL DE HOVER (Teasers) */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none flex flex-col justify-end p-6"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255,248,250,0.96) 0%, rgba(255,255,255,0.1) 65%, transparent 100%)",
                  }}
                >
                  <div className="transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100 ease-out flex flex-col items-center text-center pb-2">
                    <div
                      style={{ color: "rgb(210,110,135)", marginBottom: "8px" }}
                    >
                      {LuxuryIcons.sparkle}
                    </div>
                    <span
                      className="block font-sans font-bold uppercase tracking-[0.2em]"
                      style={{
                        fontSize: "10px",
                        color: "rgb(210,110,135)",
                        marginBottom: "6px",
                      }}
                    >
                      {img.category}
                    </span>
                    <span className="font-sans text-[10px] font-semibold tracking-widest text-[rgb(74,36,50)] uppercase opacity-70">
                      Explorar galería →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA INFERIOR PARA MÓVILES */}
        <div className="mt-12 flex justify-center lg:hidden">
          <Link
            to="/portafolio"
            className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[rgb(210,110,135)] border-b border-[rgba(210,110,135,0.4)] pb-1"
          >
            Ver todas las transformaciones →
          </Link>
        </div>
      </div>
    </section>
  );
}
