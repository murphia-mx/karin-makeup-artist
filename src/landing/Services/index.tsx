import { motion } from "framer-motion";

// Imágenes premium
const SERVICE_IMAGES: Record<string, string> = {
  novia: "public/images/portfolio/work3.jpeg",
  xv: "https://images.unsplash.com/photo-1629814696209-4f4faf2ab874?q=85&w=1000&auto=format&fit=crop&crop=faces",
  social:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=1000&auto=format&fit=crop",
  "fotos xv":
    "https://images.unsplash.com/photo-1512496015851-a1cbfd383921?q=85&w=1000&auto=format&fit=crop",
  "fotos xv acompañamiento":
    "https://images.unsplash.com/photo-1526413232644-8a40f4110398?q=85&w=1000&auto=format&fit=crop",
  graduacion:
    "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=85&w=1000&auto=format&fit=crop&crop=faces",
  artistico:
    "https://images.unsplash.com/photo-1509631179647-0c91af23f733?q=85&w=1000&auto=format&fit=crop",
  sesiones:
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=85&w=1000&auto=format&fit=crop",
  peinados:
    "https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=85&w=1000&auto=format&fit=crop",
};

const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=85&w=1000&auto=format&fit=crop";

function getServiceImage(searchKey: string): string {
  return SERVICE_IMAGES[searchKey] || DEFAULT_SERVICE_IMAGE;
}

const LUXURY_CONTENT: Record<
  string,
  { description: string; capsules: any[]; duration: string }
> = {
  novia: {
    description:
      "Diseñado para que luzcas impecable durante el día más importante de tu vida.",
    capsules: [
      {
        title: "Luminosidad eterna",
        subtitle: "Acabado fotográfico HD",
        icon: "sparkle",
      },
      {
        title: "Piel perfecta 16 h",
        subtitle: "Resistente a lágrimas y emociones",
        icon: "heart",
      },
    ],
    duration: "210 min",
  },
  social: {
    description:
      "Ideal para fiestas, eventos y celebraciones donde quieras destacar.",
    capsules: [
      {
        title: "Elegancia nocturna superior",
        subtitle: "Mirada y piel de lujo",
        icon: "moon",
      },
      {
        title: "Fijación absoluta",
        subtitle: "Intacto hasta el final",
        icon: "sparkle",
      },
    ],
    duration: "120 min",
  },
  xv: {
    description:
      "Un maquillaje fresco, elegante y resistente para disfrutar toda tu noche.",
    capsules: [
      {
        title: "Brillo juvenil y frescura",
        subtitle: "Resalta tu belleza natural",
        icon: "flower",
      },
      {
        title: "Larga duración garantizada",
        subtitle: "Disfruta sin preocuparte",
        icon: "sparkle",
      },
    ],
    duration: "120 min",
  },
  "fotos xv": {
    description: "Acabado profesional diseñado para cámaras, luces y video.",
    capsules: [
      {
        title: "Preparación e hidratación de la piel",
        subtitle: "Para un acabado natural y radiante.",
        icon: "sparkle",
      },
      {
        title: "Maquillaje especial para fotografía",
        subtitle: "Técnicas que favorecen la iluminación y la cámara.",
        icon: "camera",
      },
      {
        title: "Pestañas de tira y sellado profesional",
        subtitle: "Mayor definición y larga duración.",
        icon: "heart",
      },
    ],
    duration: "180 min",
  },
  "fotos xv acompañamiento": {
    description:
      "Retoques y cambios durante toda tu sesión para un resultado impecable.",
    capsules: [
      {
        title: "Maquillaje profesional fotográfico",
        subtitle: "Acabado perfecto para fotografía y video.",
        icon: "camera",
      },
      {
        title: "Acompañamiento en sesión",
        subtitle: "Retoques cuando sean necesarios.",
        icon: "lipstick",
      },
      {
        title: "Cambios de maquillaje (opcional)",
        subtitle: "Segundo look sin costo adicional.",
        icon: "sparkle",
      },
      {
        title: "Ajustes de labios, piel y pestañas",
        subtitle: "Cada fotografía debe verse impecable.",
        icon: "heart",
      },
    ],
    duration: "Variable",
  },
  graduacion: {
    description: "Luce radiante en cada fotografía, abrazo y celebración.",
    capsules: [
      {
        title: "Personalización total",
        subtitle: "Diseñado para tus facciones.",
        icon: "sparkle",
      },
      {
        title: "Duración garantizada",
        subtitle: "Piel perfecta por horas.",
        icon: "heart",
      },
    ],
    duration: "120 min",
  },
  artistico: {
    description:
      "Caracterización profesional para proyectos creativos y eventos especiales.",
    capsules: [
      {
        title: "Personalización total",
        subtitle: "Diseñado para tus facciones.",
        icon: "palette",
      },
      {
        title: "Productos profesionales",
        subtitle: "Body paint y efectos especiales.",
        icon: "sparkle",
      },
    ],
    duration: "220 min",
  },
  sesiones: {
    description: "Acabado profesional diseñado para cámaras, luces y video.",
    capsules: [
      {
        title: "Preparación para fotografía",
        subtitle: "Acabado optimizado para cámara.",
        icon: "camera",
      },
      {
        title: "Larga duración",
        subtitle: "Perfecto durante toda la sesión.",
        icon: "sparkle",
      },
    ],
    duration: "150 min",
  },
  peinados: {
    description: "El complemento perfecto para un look completo y armonioso.",
    capsules: [
      {
        title: "Personalización total",
        subtitle: "Peinado acorde a tu estilo.",
        icon: "scissors",
      },
      {
        title: "Acabado profesional",
        subtitle: "Diseñado para durar durante todo el evento.",
        icon: "sparkle",
      },
    ],
    duration: "180 min",
  },
};

const DEFAULT_CONTENT = {
  description:
    "Un servicio diseñado para revelar y elevar tu belleza más auténtica, cuidando cada detalle para brindarte una experiencia premium.",
  capsules: [
    {
      title: "Acabado premium",
      subtitle: "Técnica internacional",
      icon: "sparkle",
    },
    {
      title: "Larga duración",
      subtitle: "Piel perfecta por horas",
      icon: "heart",
    },
  ],
  duration: "Consultar",
};

const LuxuryIcons = {
  sparkle: (
    <svg
      width="15"
      height="15"
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
  heart: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  moon: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  flower: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  ),
  camera: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  lipstick: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 7V3h8v4M8 11h8M8 15h8M10 7v14M14 7v14M6 21h12" />
    </svg>
  ),
  palette: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" />
      <circle cx="17.5" cy="10.5" r=".5" />
      <circle cx="8.5" cy="7.5" r=".5" />
      <circle cx="6.5" cy="12.5" r=".5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.992 6.012 17.5 2 12 2z" />
    </svg>
  ),
  scissors: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
  clock: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const FINAL_SERVICES = {
  eyebrow: "Colección Exclusiva",
  title: "Servicios diseñados para",
  italicWord: "enamorar.",
  items: [
    {
      id: "1",
      searchKey: "novia",
      titleTop: "Maquillaje de",
      titleBottom: "Novia",
      price_from: 2100,
      is_featured: true,
    },
    {
      id: "2",
      searchKey: "social",
      titleTop: "Maquillaje",
      titleBottom: "Social",
      price_from: 800,
    },
    {
      id: "3",
      searchKey: "xv",
      titleTop: "Maquillaje para",
      titleBottom: "XV Años",
      price_from: 1000,
    },
    {
      id: "4",
      searchKey: "fotos xv",
      titleTop: "Sesión Fotográfica",
      titleBottom: "XV Años",
      price_from: 1200,
    },
    {
      id: "5",
      searchKey: "fotos xv acompañamiento",
      titleTop: "Sesión Fotográfica",
      titleBottom: "+ Acompañamiento",
      price_from: 1850,
    },
    {
      id: "6",
      searchKey: "graduacion",
      titleTop: "Maquillaje de",
      titleBottom: "Graduación",
      price_from: 700,
    },
    {
      id: "7",
      searchKey: "artistico",
      titleTop: "Maquillaje",
      titleBottom: "Artístico",
      price_from: 1200,
    },
    {
      id: "8",
      searchKey: "sesiones",
      titleTop: "Sesiones",
      titleBottom: "Fotográficas",
      price_from: 950,
    },
    {
      id: "9",
      searchKey: "peinados",
      titleTop: "Peinados y",
      titleBottom: "Estilismo",
      price_from: 600,
    },
  ],
};

export default function Services() {
  const data = FINAL_SERVICES;

  return (
    <section
      id="servicios"
      className="relative w-full py-28 md:py-36 overflow-hidden"
      style={{ backgroundColor: "rgb(255, 254, 253)" }}
    >
      <div
        className="absolute top-0 right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(235,168,185,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(235,168,185,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[1300px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col items-start text-left mb-16 md:mb-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center gap-4 mb-6"
          >
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
              {data.eyebrow}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 1,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="font-display font-light tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.4rem, 6.5vw, 4.5rem)",
              lineHeight: 1.05,
              color: "rgb(74, 36, 50)",
            }}
          >
            {data.title}{" "}
            <em className="italic" style={{ color: "rgb(210,110,135)" }}>
              {data.italicWord}
            </em>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-8 xl:gap-10 items-stretch">
          {data.items.map((service: any, index: number) => {
            const content =
              LUXURY_CONTENT[service.searchKey] || DEFAULT_CONTENT;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 1,
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 35px 70px rgba(210,110,135,0.18), inset 0 2px 10px rgba(255,255,255,0.9)",
                  borderColor: "rgba(235,168,185,0.55)",
                  transition: { duration: 0.4 }
                }}
                whileTap={{
                  scale: 0.98,
                  boxShadow: "0 10px 30px rgba(210,110,135,0.1), inset 0 2px 10px rgba(255,255,255,0.9)",
                  borderColor: "rgba(235,168,185,0.45)",
                  transition: { duration: 0.2 }
                }}
                className="group relative flex flex-col h-full bg-white overflow-hidden rounded-[16px]"
                style={{
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #fff7f9 100%)",
                  border: "1px solid rgba(235,168,185,0.3)",
                  boxShadow:
                    "0 10px 35px rgba(210,110,135,0.06), inset 0 2px 10px rgba(255,255,255,0.9)",
                }}
              >
                {/* 1. ZONA FOTOGRÁFICA */}
                <div className="relative w-full aspect-[16/11] overflow-hidden bg-[#fff5f7] flex-shrink-0">
                  <img
                    src={getServiceImage(service.searchKey)}
                    alt={`${service.titleTop} ${service.titleBottom}`}
                    className="w-full h-full object-cover object-[center_20%]"
                    style={{
                      transition:
                        "transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 25%)",
                    }}
                  />

                  {service.is_featured && (
                    <div className="absolute top-4 right-4 pointer-events-none">
                      <div
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,245,248,0.95) 100%)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,1)",
                          boxShadow: "0 4px 15px rgba(210,110,135,0.15)",
                        }}
                      >
                        <span className="text-[10px]">✨</span>
                        <span
                          className="font-sans text-[8.5px] font-bold tracking-[0.2em] uppercase"
                          style={{ color: "rgb(210,110,135)" }}
                        >
                          Favorito
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. CONTENIDO EDITORIAL */}
                <div className="flex flex-col flex-1 p-7 md:p-8 z-10 relative">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.9) 0%, transparent 60%)",
                    }}
                  />

                  <div className="relative h-full flex flex-col">
                    {/* TÍTULO EDITORIAL (Doble jerarquía, jamás se corta) */}
                    <div className="flex flex-col mb-4">
                      <span
                        className="font-display italic"
                        style={{
                          color: "rgb(74, 36, 50)", // Color vino
                          fontSize: "1.4rem",
                          lineHeight: 1.1,
                          fontWeight: 400,
                        }}
                      >
                        {service.titleTop}
                      </span>
                      <span
                        className="font-sans uppercase"
                        style={{
                          color: "rgb(210, 110, 135)", // Rosa elegante
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                          lineHeight: 1.2,
                          marginTop: "2px",
                        }}
                      >
                        {service.titleBottom}
                      </span>
                    </div>

                    <div
                      style={{
                        width: "20px",
                        height: "1.5px",
                        background: "rgb(210,110,135)",
                        marginBottom: "16px",
                        borderRadius: "2px",
                      }}
                    />

                    {/* DESCRIPCIÓN (Máximo 2 líneas garantizadas por copy) */}
                    <p
                      className="font-sans font-normal mb-8"
                      style={{
                        fontSize: "13.5px",
                        lineHeight: 1.6,
                        color: "rgba(74, 36, 50, 0.85)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {content.description}
                    </p>

                    {/* BENEFICIOS (Cápsulas) */}
                    <div className="flex flex-col gap-2.5 mb-8">
                      {content.capsules.map((capsule, cIndex) => (
                        <motion.div
                          key={cIndex}
                          className="flex items-center gap-3.5 p-3.5 rounded-xl"
                          whileHover={{
                            y: -1,
                            boxShadow: "0 6px 15px rgba(210,110,135,0.1)",
                            borderColor: "rgba(235,168,185,0.5)",
                          }}
                          whileTap={{
                            scale: 0.98,
                            boxShadow: "0 2px 8px rgba(210,110,135,0.05)",
                          }}
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,247,250,0.8) 100%)",
                            border: "1px solid rgba(235,168,185,0.3)",
                            boxShadow: "0 2px 12px rgba(210,110,135,0.04)",
                          }}
                        >
                          <div
                            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,1), rgba(252,242,245,1))",
                              color: "rgb(210,110,135)",
                              boxShadow: "0 2px 6px rgba(210,110,135,0.08)",
                              border: "1px solid rgba(235,168,185,0.2)",
                            }}
                          >
                            {/* @ts-ignore */}
                            {LuxuryIcons[capsule.icon] || LuxuryIcons.sparkle}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className="font-sans font-semibold"
                              style={{
                                fontSize: "12px",
                                letterSpacing: "0.01em",
                                color: "rgb(74, 36, 50)",
                              }}
                            >
                              {capsule.title}
                            </span>
                            <span
                              className="font-sans font-normal"
                              style={{
                                fontSize: "11px",
                                color: "rgba(74, 36, 50, 0.7)",
                                marginTop: "1px",
                              }}
                            >
                              {capsule.subtitle}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* ZONA DE CIERRE (mt-auto) */}
                    <div className="mt-auto flex flex-col relative z-10">
                      {/* PRECIO Y DURACIÓN */}
                      <div className="flex items-end justify-between mb-5">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className="font-sans font-semibold uppercase"
                            style={{
                              fontSize: "9.5px",
                              letterSpacing: "0.22em",
                              color: "rgb(210,110,135)",
                            }}
                          >
                            Inversión desde
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span
                              className="font-display"
                              style={{
                                fontSize: "2.6rem",
                                color: "rgb(74, 36, 50)",
                                fontWeight: 500,
                                letterSpacing: "-0.02em",
                                lineHeight: 1,
                              }}
                            >
                              {service.price_from
                                ? `$${service.price_from}`
                                : "Consultar"}
                            </span>
                            {service.price_from && (
                              <span
                                className="font-sans font-medium"
                                style={{
                                  fontSize: "10px",
                                  color: "rgba(74, 36, 50, 0.5)",
                                }}
                              >
                                MXN
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Duración */}
                        {content.duration && (
                          <div className="flex items-center gap-1.5 pb-1 opacity-75">
                            {LuxuryIcons.clock}
                            <span
                              className="font-sans font-medium"
                              style={{
                                fontSize: "11.5px",
                                color: "rgb(74, 36, 50)",
                              }}
                            >
                              {content.duration}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* BOTÓN CTA IMPOSIBLE DE IGNORAR */}
                      <div className="flex flex-col items-center">
                        <motion.a
                          href="#contacto"
                          className="group flex items-center justify-center w-full relative overflow-hidden"
                          whileHover={{
                            y: -2,
                            background: "linear-gradient(135deg, rgb(225,125,150) 0%, rgb(190,95,125) 100%)",
                            boxShadow: "0 12px 32px rgba(210,110,135,0.45), inset 0 1px 0 rgba(255,255,255,0.3)",
                          }}
                          whileTap={{
                            scale: 0.97,
                            background: "linear-gradient(135deg, rgb(200,100,125) 0%, rgb(165,70,100) 100%)",
                            boxShadow: "0 4px 16px rgba(210,110,135,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                          }}
                          style={{
                            height: "56px",
                            borderRadius: "10px",
                            background:
                              "linear-gradient(135deg, rgb(210,110,135) 0%, rgb(175,80,110) 100%)",
                            color: "rgb(255, 255, 255)",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            boxShadow:
                              "0 8px 24px rgba(210,110,135,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                            border: "1px solid rgba(225,125,150,0.5)",
                          }}
                        >
                          <span className="relative z-10 flex items-center gap-2.5">
                            Reservar experiencia
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="transition-transform duration-500 group-hover:translate-x-1.5"
                            >
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </span>
                        </motion.a>

                        <div className="flex items-center gap-1.5 mt-3.5 opacity-85">
                          <span className="text-[10.5px]">✨</span>
                          <span
                            className="font-sans font-semibold uppercase"
                            style={{
                              fontSize: "9.5px",
                              letterSpacing: "0.12em",
                              color: "rgba(74, 36, 50, 0.85)",
                            }}
                          >
                            Atención completamente personalizada
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
