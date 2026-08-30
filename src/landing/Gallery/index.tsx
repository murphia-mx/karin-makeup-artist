import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface GalleryImage {
  id?: string;
  url: string;
  image?: string;
  alt?: string;
  category?: string;
  title?: string;
  description?: string;
}

interface GalleryProps {
  gallery?: {
    images?: GalleryImage[];
    isVisible?: boolean;
  };
}

export default function Gallery({ gallery }: GalleryProps) {
  const navigate = useNavigate();
  const images = gallery?.images ?? [];
  const total = images.length;

  if (!gallery?.isVisible || total === 0) {
    return null;
  }

  const getAspectClass = (index: number) => {
    const colPosition = index % 3;
    if (colPosition === 1) return "aspect-[4/5]";
    return "aspect-[4/5] sm:aspect-square md:aspect-[4/5] xl:aspect-[3/4]";
  };

  return (
    <section
      id="portafolio"
      className="relative w-full overflow-hidden py-16 md:py-20"
      style={{ backgroundColor: "rgb(255, 254, 253)" }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1300px] px-5 sm:px-8 lg:px-12 flex flex-col">
        
        {/* HEADER */}
        <div className="flex flex-col mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-4 md:mb-5">
              <div style={{ width: 24, height: 1.5, background: "rgba(210,110,135,0.8)" }} />
              <span className="font-sans font-semibold uppercase tracking-[0.25em]" style={{ fontSize: "10px", color: "rgb(210,110,135)" }}>
                Portafolio
              </span>
            </div>
            <h2 className="font-display font-light tracking-tight" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1.05, color: "rgb(74, 36, 50)" }}>
              Arte en cada <em className="italic" style={{ color: "rgb(210,110,135)" }}>detalle.</em>
            </h2>
          </motion.div>
        </div>

        {/* GRID SHOWCASE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-16">
          {images.map((item, index) => {
            const imageUrl = item.image || item.url;
            const category = item.category || "Editorial";
            const title = item.title;

            return (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="group flex flex-col cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#ca6480] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fffefd]"
                onClick={() => navigate(item.id ? `/portafolio?project=${item.id}` : '/portafolio')}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(item.id ? `/portafolio?project=${item.id}` : '/portafolio');
                }}
                role="button"
                aria-label={`Ver proyecto: ${title || category}`}
              >
                {/* IMAGE CONTAINER (Clean Photography) */}
                <div className={`relative w-full overflow-hidden bg-black/5 ${getAspectClass(index)}`}>
                  <img
                    src={imageUrl}
                    alt={item.alt || title || category}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-[center_20%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
                  />
                  
                  {/* Subtle translucent overlay on hover */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Desktop "Ver proyecto" Pill */}
                  <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white/95 backdrop-blur-sm px-6 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center gap-2 border border-white/50">
                      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[rgb(74,36,50)]">
                        Ver proyecto
                      </span>
                      <ArrowRight className="w-3 h-3 text-[rgb(74,36,50)] transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* METADATA (Clean text below image) */}
                <div className="mt-4 flex flex-col gap-0.5">
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-[rgb(210,110,135)]">
                    {category}
                  </span>
                  {title && (
                    <h3 className="font-display text-[1.25rem] md:text-[1.3rem] leading-tight text-[rgb(74,36,50)] font-medium">
                      {title}
                    </h3>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* SIMPLE CTA INFERIOR                                          */}
        {/* ============================================================ */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 md:mt-20 w-full flex justify-center"
        >
          <Link
            to="/portafolio"
            className="group inline-flex items-center gap-3 border border-[rgba(210,110,135,0.3)] px-7 py-3.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[rgb(210,110,135)] transition-all duration-300 hover:bg-[rgba(210,110,135,0.06)] hover:border-[rgba(210,110,135,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ca6480] focus-visible:ring-offset-2"
          >
            <span>Ver portafolio completo</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
