import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ServiceExtended } from "../../domains/workspace/types/WorkspaceEntities";

/* -------------------------------------------------------------------------- */
/* SERVICE MEDIA                                                              */
/* -------------------------------------------------------------------------- */

const SERVICE_IMAGES: Record<string, string> = {
  novia: "/images/services/novia.jpg",

  xv: "/images/services/xv.jpg",

  social: "/images/services/social.jpg",

  "fotos xv": "/images/services/fotos-xv.jpg",

  "fotos xv acompañamiento": "/images/services/fotos-acompañamiento.jpg",

  graduacion: "/images/services/graduacion.jpg",

  artistico: "/images/services/artistico.jpg",

  sesiones: "/images/services/sesion-fotografica.jpg",

  peinados: "/images/services/peinados.jpg",
};

const DEFAULT_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=85&w=1400&auto=format&fit=crop";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeAssetUrl(url?: string | null) {
  if (!url) return "";

  return url.startsWith("public/") ? `/${url.slice(7)}` : url;
}

function normalizeKey(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveServiceKey(service: Partial<ServiceExtended>) {
  const text = normalizeKey(
    [
      service.category,
      service.slug,
      service.name,
      service.short_name,
      service.landing_title_top,
      service.landing_title_bottom,
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (text.includes("acompanamiento") && text.includes("xv")) {
    return "fotos xv acompañamiento";
  }

  if (text.includes("sesion") && text.includes("xv")) {
    return "fotos xv";
  }

  if (text.includes("novia")) {
    return "novia";
  }

  if (text.includes("social")) {
    return "social";
  }

  if (text.includes("gradu")) {
    return "graduacion";
  }

  if (text.includes("artist")) {
    return "artistico";
  }

  if (text.includes("peinado") || text.includes("estilismo")) {
    return "peinados";
  }

  if (text.includes("sesion") || text.includes("fotograf")) {
    return "sesiones";
  }

  if (text.includes("xv")) {
    return "xv";
  }

  return normalizeKey(service.slug) || "default";
}

function getServiceImage(service: any) {
  return (
    SERVICE_IMAGES[service.searchKey] ||
    normalizeAssetUrl(service.cover_image) ||
    DEFAULT_SERVICE_IMAGE
  );
}

/* -------------------------------------------------------------------------- */
/* NAVIGATION LABELS                                                          */
/* -------------------------------------------------------------------------- */

function getNavigationLabel(service: any, searchKey: string) {
  const labels: Record<string, string> = {
    novia: "Novia",
    social: "Social",
    xv: "XV Años",
    "fotos xv": "Sesión de Fotos XV",
    "fotos xv acompañamiento": "Sesión + Acompañamiento",
    graduacion: "Graduaciones",
    artistico: "Artístico",
    sesiones: "Sesiones Fotográficas",
    peinados: "Estilismo",
  };

  return labels[searchKey] || service.short_name || service.name || "Servicio";
}

/* -------------------------------------------------------------------------- */
/* FALLBACK CONTENT                                                           */
/* -------------------------------------------------------------------------- */

const LUXURY_CONTENT: Record<
  string,
  {
    description: string;
    duration: string;
  }
> = {
  novia: {
    description:
      "Diseñado para que luzcas impecable durante el día más importante de tu vida.",
    duration: "210 min",
  },

  social: {
    description:
      "Ideal para fiestas, eventos y celebraciones donde quieras destacar.",
    duration: "120 min",
  },

  xv: {
    description:
      "Un maquillaje fresco, elegante y resistente para disfrutar toda tu noche.",
    duration: "120 min",
  },

  "fotos xv": {
    description: "Acabado profesional diseñado para cámaras, luces y video.",
    duration: "180 min",
  },

  "fotos xv acompañamiento": {
    description:
      "Retoques y cambios durante toda tu sesión para un resultado impecable.",
    duration: "Variable",
  },

  graduacion: {
    description: "Luce radiante en cada fotografía, abrazo y celebración.",
    duration: "120 min",
  },

  artistico: {
    description:
      "Caracterización profesional para proyectos creativos y eventos especiales.",
    duration: "220 min",
  },

  sesiones: {
    description: "Acabado profesional diseñado para cámaras, luces y video.",
    duration: "150 min",
  },

  peinados: {
    description: "El complemento perfecto para un look completo y armonioso.",
    duration: "180 min",
  },
};

const DEFAULT_CONTENT = {
  description:
    "Un servicio diseñado para revelar y elevar tu belleza más auténtica, cuidando cada detalle para brindarte una experiencia premium.",
  duration: "Consultar",
};

/* -------------------------------------------------------------------------- */
/* SERVICE ITEM TYPE                                                          */
/* -------------------------------------------------------------------------- */

interface ServiceItem {
  id: string;
  searchKey: string;
  navigationLabel: string;

  titleTop: string;
  titleBottom: string;

  price_from?: number | null;
  is_featured?: boolean;

  category?: string | null;
  short_description?: string | null;
  description?: string | null;

  features?: unknown[] | null;
  duration_minutes?: number | null;

  active?: boolean;
  show_in_landing?: boolean;

  [key: string]: unknown;
}

interface ServicesProps {
  services?: ServiceExtended[];
}

/* -------------------------------------------------------------------------- */
/* FALLBACK SERVICES                                                          */
/* -------------------------------------------------------------------------- */

const FINAL_SERVICES: ServiceItem[] = [
  {
    id: "1",
    searchKey: "novia",
    navigationLabel: "Novia",
    titleTop: "Maquillaje de",
    titleBottom: "Novia",
    price_from: 2100,
    is_featured: true,
  },

  {
    id: "2",
    searchKey: "social",
    navigationLabel: "Social",
    titleTop: "Maquillaje",
    titleBottom: "Social",
    price_from: 800,
  },

  {
    id: "3",
    searchKey: "xv",
    navigationLabel: "XV Años",
    titleTop: "Maquillaje para",
    titleBottom: "XV Años",
    price_from: 1000,
  },

  {
    id: "4",
    searchKey: "fotos xv",
    navigationLabel: "Sesión de Fotos XV",
    titleTop: "Sesión Fotográfica",
    titleBottom: "XV Años",
    price_from: 1200,
  },

  {
    id: "5",
    searchKey: "fotos xv acompañamiento",
    navigationLabel: "Sesión + Acompañamiento",
    titleTop: "Sesión Fotográfica",
    titleBottom: "+ Acompañamiento",
    price_from: 1850,
  },

  {
    id: "6",
    searchKey: "graduacion",
    navigationLabel: "Graduaciones",
    titleTop: "Maquillaje de",
    titleBottom: "Graduación",
    price_from: 700,
  },

  {
    id: "7",
    searchKey: "artistico",
    navigationLabel: "Artístico",
    titleTop: "Maquillaje",
    titleBottom: "Artístico",
    price_from: 1200,
  },

  {
    id: "8",
    searchKey: "sesiones",
    navigationLabel: "Sesiones Fotográficas",
    titleTop: "Sesiones",
    titleBottom: "Fotográficas",
    price_from: 950,
  },

  {
    id: "9",
    searchKey: "peinados",
    navigationLabel: "Estilismo",
    titleTop: "Peinados y",
    titleBottom: "Estilismo",
    price_from: 600,
  },
];

function Arrow({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`pointer-events-none ${
        direction === "left" ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* SERVICES                                                                   */
/* -------------------------------------------------------------------------- */

export default function Services({ services = [] }: ServicesProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  /* Navegación horizontal */
  const navigationRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* CMS SERVICES                                                             */
  /* ------------------------------------------------------------------------ */

  const items = useMemo<ServiceItem[]>(() => {
    const cmsServices = services
      .filter(
        (service) =>
          service.active !== false && service.show_in_landing !== false,
      )
      .map((service) => {
        const searchKey = resolveServiceKey(service);

        return {
          ...service,

          id: service.id,

          searchKey,

          navigationLabel: getNavigationLabel(service, searchKey),

          titleTop:
            service.landing_title_top || service.short_name || service.name,

          titleBottom: service.landing_title_bottom || "",

          price_from: service.price_from,

          is_featured: service.featured,
        };
      });

    return cmsServices.length ? cmsServices : FINAL_SERVICES;
  }, [services]);

  /* ------------------------------------------------------------------------ */
  /* SAFE INDEX                                                               */
  /* ------------------------------------------------------------------------ */

  const safeIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));

  const service = items[safeIndex];

  const content = LUXURY_CONTENT[service?.searchKey] || DEFAULT_CONTENT;

  /* ------------------------------------------------------------------------ */
  /* NAVIGATION SCROLL STATE                                                  */
  /* ------------------------------------------------------------------------ */

  const updateScrollState = useCallback(() => {
    const element = navigationRef.current;

    if (!element) return;

    const maxScroll = element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 4);

    setCanScrollRight(element.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();

    const element = navigationRef.current;

    if (!element) return;

    const handleScroll = () => {
      updateScrollState();
    };

    const handleResize = () => {
      updateScrollState();
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    window.addEventListener("resize", handleResize);

    return () => {
      element.removeEventListener("scroll", handleScroll);

      window.removeEventListener("resize", handleResize);
    };
  }, [items.length, updateScrollState]);

  /* ------------------------------------------------------------------------ */
  /* KEEP ACTIVE SERVICE VISIBLE                                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const container = navigationRef.current;

    if (!container) return;

    const activeButton = container.querySelector<HTMLElement>(
      `[data-service-index="${safeIndex}"]`,
    );

    if (!activeButton) return;

    // Move only the Services navigation. Do not use scrollIntoView(),
    // because it can also scroll the document horizontally.
    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    const leftOverflow = buttonRect.left - containerRect.left;
    const rightOverflow = buttonRect.right - containerRect.right;

    if (leftOverflow < 0) {
      container.scrollBy({
        left: leftOverflow - 24,
        behavior: "smooth",
      });
    } else if (rightOverflow > 0) {
      container.scrollBy({
        left: rightOverflow + 24,
        behavior: "smooth",
      });
    }

    window.setTimeout(updateScrollState, 350);
  }, [safeIndex, updateScrollState]);

  /* ------------------------------------------------------------------------ */
  /* NAVIGATION SCROLL                                                        */
  /* ------------------------------------------------------------------------ */

  const scrollNavigation = (direction: "left" | "right") => {
    const element = navigationRef.current;

    if (!element) return;

    const amount = Math.max(element.clientWidth * 0.72, 280);

    element.scrollBy({
      left: direction === "right" ? amount : -amount,

      behavior: "smooth",
    });
  };

  /* ------------------------------------------------------------------------ */
  /* MOUSE WHEEL → HORIZONTAL SCROLL                                          */
  /* ------------------------------------------------------------------------ */

  const handleNavigationWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const element = navigationRef.current;

    if (!element) return;

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    if (maxScrollLeft <= 0) {
      return;
    }

    const currentScrollLeft = element.scrollLeft;
    const delta = event.deltaY;

    const movingRight = delta > 0;
    const movingLeft = delta < 0;

    const canMoveRight = currentScrollLeft < maxScrollLeft - 1;
    const canMoveLeft = currentScrollLeft > 1;

    // Consume the wheel only while the Services bar can move horizontally.
    // At either edge, release the event so the page keeps normal vertical
    // scrolling instead of appearing to move sideways.
    if ((movingRight && canMoveRight) || (movingLeft && canMoveLeft)) {
      event.preventDefault();

      element.scrollLeft = Math.max(
        0,
        Math.min(maxScrollLeft, currentScrollLeft + delta),
      );

      updateScrollState();
    }
  };

  /* ------------------------------------------------------------------------ */
  /* SERVICE CONTROLS                                                         */
  /* ------------------------------------------------------------------------ */

  const next = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };

  const previous = () => {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  /* ------------------------------------------------------------------------ */
  /* EMPTY STATE                                                              */
  /* ------------------------------------------------------------------------ */

  if (!service) return null;

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section
      id="servicios"
      className="relative w-full max-w-full overflow-x-clip overflow-y-visible bg-[#fffefd] py-24 md:py-32"
    >
      {/* Ambientación rosa */}
      <div
        className="pointer-events-none absolute -right-56 top-16 h-[620px] w-[620px] rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(210,110,135,0.075) 0%, rgba(210,110,135,0) 68%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1300px] px-5 sm:px-8 lg:px-12">
        {/* ------------------------------------------------------------------ */}
        {/* HEADER                                                             */}
        {/* ------------------------------------------------------------------ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-100px",
          }}
          transition={{
            duration: 0.8,
          }}
          className="mb-10 flex flex-col gap-7 md:mb-12 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <div className="mb-5 flex items-center gap-4">
              <span
                className="h-px w-6"
                style={{
                  backgroundColor: "rgb(210,110,135)",
                }}
              />

              <span
                className="font-sans font-semibold uppercase"
                style={{
                  color: "rgb(210,110,135)",
                  fontSize: 10,
                  letterSpacing: "0.28em",
                }}
              >
                Servicios
              </span>
            </div>

            <h2
              className="font-display font-light tracking-[-0.035em]"
              style={{
                color: "rgb(74,36,50)",
                fontSize: "clamp(2.7rem, 5.8vw, 4.8rem)",
                lineHeight: 0.98,
              }}
            >
              Experiencias creadas
              <br />
              <em
                style={{
                  color: "rgb(210,110,135)",
                }}
              >
                para ti.
              </em>
            </h2>
          </div>

          {/* Contador general */}
        </motion.div>

        {/* ================================================================== */}
        {/* SERVICE NAVIGATION                                                 */}
        {/* ================================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.7,
            delay: 0.08,
          }}
          className="mb-10"
        >
          {/* Navigation header */}
          <div className="mb-5 flex items-end justify-between gap-6">
            <div>
              <span
                className="font-sans font-semibold uppercase"
                style={{
                  color: "rgb(210,110,135)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                }}
              >
                Explora
              </span>

              <p
                className="mt-2 font-display"
                style={{
                  color: "rgb(74,36,50)",
                  fontSize: "clamp(1.45rem, 2.4vw, 2rem)",
                  lineHeight: 1.05,
                }}
              >
                Todos nuestros servicios
              </p>
            </div>

            {/* Desktop helper */}
            <div className="hidden items-center gap-4 sm:flex">
              <span
                className="font-sans uppercase"
                style={{
                  color: "rgba(74,36,50,0.52)",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                }}
              >
                Selecciona un servicio
              </span>
            </div>
          </div>

          {/* Navigation shell */}
          <div className="relative">
            {/* Left fade */}
            <motion.div
              animate={{
                opacity: canScrollLeft ? 1 : 0,
              }}
              className="pointer-events-none absolute left-0 top-0 z-20 h-full w-16"
              style={{
                background:
                  "linear-gradient(90deg, #fffefd 5%, rgba(255,254,253,0) 100%)",
              }}
            />

            {/* Right fade */}
            <motion.div
              animate={{
                opacity: canScrollRight ? 1 : 0,
              }}
              className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16"
              style={{
                background:
                  "linear-gradient(270deg, #fffefd 5%, rgba(255,254,253,0) 100%)",
              }}
            />

            {/* Left scroll button */}
            <motion.button
              type="button"
              aria-label="Ver servicios anteriores"
              onClick={() => scrollNavigation("left")}
              animate={{
                opacity: canScrollLeft ? 1 : 0,
                scale: canScrollLeft ? 1 : 0.9,
              }}
              className="absolute left-0 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 text-[rgb(74,36,50)] shadow-[0_8px_25px_rgba(74,36,50,0.08)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[rgb(74,36,50)] hover:shadow-[0_12px_30px_rgba(74,36,50,0.14)] sm:flex"
              style={{
                borderColor: "rgba(74,36,50,0.14)",
                color: "rgb(74,36,50)",
              }}
            >
              <Arrow direction="left" />
            </motion.button>

            {/* Right scroll button */}
            <motion.button
              type="button"
              aria-label="Ver más servicios"
              onClick={() => scrollNavigation("right")}
              animate={{
                opacity: canScrollRight ? 1 : 0,
                scale: canScrollRight ? 1 : 0.9,
              }}
              className="absolute right-0 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 text-[rgb(74,36,50)] shadow-[0_8px_25px_rgba(74,36,50,0.08)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[rgb(74,36,50)] hover:shadow-[0_12px_30px_rgba(74,36,50,0.14)] sm:flex"
              style={{
                borderColor: "rgba(74,36,50,0.14)",
                color: "rgb(74,36,50)",
              }}
            >
              <Arrow />
            </motion.button>

            {/* Horizontal navigation */}
            <div
              ref={navigationRef}
              onWheel={handleNavigationWheel}
              className="flex min-w-0 max-w-full items-stretch gap-2 overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                overscrollBehaviorX: "contain",
                overscrollBehaviorY: "auto",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
              }}
            >
              {items.map((item, index) => {
                const isActive = index === safeIndex;

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    data-service-index={index}
                    onClick={() => setActiveIndex(index)}
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="group relative flex min-h-[62px] shrink-0 items-center gap-3 rounded-[16px] px-5 text-left transition-all duration-300"
                    style={{
                      backgroundColor: isActive
                        ? "#d95f86"
                        : "rgba(255,255,255,0.88)",

                      border: `1px solid ${
                        isActive ? "#ccc" : "rgba(74,36,50,0.16)"
                      }`,

                      boxShadow: isActive
                        ? "0 12px 28px rgba(74,36,50,0.14)"
                        : "0 4px 14px rgba(74,36,50,0.025)",
                    }}
                  >
                    {/* Label */}
                    <span
                      className="font-sans"
                      style={{
                        color: isActive ? "#fff" : "rgb(74,36,50)",

                        fontSize: 11,

                        fontWeight: 600,

                        letterSpacing: "0.035em",

                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.navigationLabel}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.span
                        layoutId="service-active-indicator"
                        className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full"
                        style={{
                          backgroundColor: "rgb(210,110,135)",
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Navigation progress */}
          <div className="mt-3 flex items-center gap-3">
            <div
              className="h-[2px] flex-1 overflow-hidden rounded-full"
              style={{
                backgroundColor: "rgba(74,36,50,0.08)",
              }}
            >
              <motion.div
                animate={{
                  width: `${((safeIndex + 1) / items.length) * 100}%`,
                }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: "rgb(210,110,135)",
                }}
              />
            </div>

            <span
              className="shrink-0 font-sans font-semibold"
              style={{
                color: "rgba(74,36,50,0.62)",
                fontSize: 14,
              }}
            >
              {safeIndex + 1} de {items.length}
            </span>
          </div>

          {/* Mobile discovery hint */}
          <div className="mt-3 flex items-center justify-between sm:hidden">
            <span
              className="font-sans uppercase"
              style={{
                color: "rgba(74,36,50,0.48)",
                fontSize: 8.5,
                fontWeight: 600,
                letterSpacing: "0.13em",
              }}
            >
              Desliza para explorar
            </span>

            <span
              className="flex items-center gap-2 font-sans uppercase"
              style={{
                color: "rgb(210,110,135)",
                fontSize: 8.5,
                fontWeight: 600,
                letterSpacing: "0.13em",
              }}
            >
              Más servicios
              <Arrow />
            </span>
          </div>
        </motion.div>

        {/* ================================================================== */}
        {/* FEATURED SERVICE STAGE                                             */}
        {/* ================================================================== */}

        <div className="relative">
          <div
            className="overflow-hidden rounded-[26px] border"
            style={{
              borderColor: "rgba(210,110,135,0.18)",

              backgroundColor: "#f8f2f3",

              boxShadow: "0 24px 70px rgba(74,36,50,0.07)",
            }}
          >
            <div className="grid lg:grid-cols-[1.18fr_0.82fr]">
              {/* ============================================================ */}
              {/* IMAGE                                                        */}
              {/* ============================================================ */}

              <div className="group relative min-h-[390px] overflow-hidden md:min-h-[510px] lg:min-h-[590px]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${service.id}-image`}
                    src={getServiceImage(service)}
                    alt={`${service.titleTop} ${service.titleBottom}`}
                    initial={{
                      opacity: 0,
                      scale: 1.035,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.65,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </AnimatePresence>

                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(42,20,28,0.02) 35%, rgba(42,20,28,0.58) 100%)",
                  }}
                />

                {/* Image copy */}
                <div className="absolute bottom-7 left-7 right-7 md:bottom-9 md:left-9">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${service.id}-image-copy`}
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                      }}
                      transition={{
                        duration: 0.45,
                      }}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span
                          className="h-px w-7"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.8)",
                          }}
                        />

                        <span
                          className="font-sans font-semibold uppercase"
                          style={{
                            color: "rgba(255,255,255,0.88)",
                            fontSize: 9,
                            letterSpacing: "0.24em",
                          }}
                        >
                          {service.category || "Experiencia Karin"}
                        </span>
                      </div>

                      <h3
                        className="font-display font-light"
                        style={{
                          color: "#fff",
                          fontSize: "clamp(2rem, 4vw, 3.5rem)",
                          lineHeight: 0.98,
                          letterSpacing: "-0.025em",
                        }}
                      >
                        {service.titleTop}

                        {service.titleBottom && (
                          <>
                            <br />

                            <em>{service.titleBottom}</em>
                          </>
                        )}
                      </h3>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Featured badge */}
                {service.is_featured && (
                  <div className="absolute right-6 top-6">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans font-semibold uppercase"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.9)",

                        color: "rgb(180,78,106)",

                        fontSize: 8.5,

                        letterSpacing: "0.18em",

                        backdropFilter: "blur(12px)",

                        boxShadow: "0 8px 25px rgba(30,10,18,0.12)",
                      }}
                    >
                      <span>✦</span>
                      Selección Karin
                    </span>
                  </div>
                )}

                {/* Carousel controls — ultra-minimal Apple-style */}
                <div className="absolute bottom-7 right-7 z-30 flex items-center gap-2 md:bottom-9 md:right-9">
                  {/* Previous */}
                  <button
                    type="button"
                    onClick={previous}
                    aria-label="Servicio anterior"
                    className="
      group relative
      flex h-11 w-11 items-center justify-center
      rounded-full
      overflow-hidden
      text-[#2c292b]
      transition-all duration-500
      ease-[cubic-bezier(0.22,1,0.36,1)]
      hover:scale-[1.045]
      active:scale-[0.96]
      sm:h-12 sm:w-12
    "
                    style={{
                      background: "rgba(255,255,255,0.72)",
                      boxShadow:
                        "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    }}
                  >
                    {/* subtle material highlight */}
                    <span
                      className="
        pointer-events-none
        absolute inset-0
        rounded-full
        opacity-0
        transition-opacity duration-500
        group-hover:opacity-100
      "
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(255,255,255,0.42), rgba(255,255,255,0.08))",
                      }}
                    />

                    <span className="relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-[2px]">
                      <Arrow direction="left" />
                    </span>
                  </button>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Siguiente servicio"
                    className="
      group relative
      flex h-11 w-11 items-center justify-center
      rounded-full
      overflow-hidden
      text-[#2c292b]
      transition-all duration-500
      ease-[cubic-bezier(0.22,1,0.36,1)]
      hover:scale-[1.045]
      active:scale-[0.96]
      sm:h-12 sm:w-12
    "
                    style={{
                      background: "rgba(255,255,255,0.72)",
                      boxShadow:
                        "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.08)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    }}
                  >
                    {/* subtle material highlight */}
                    <span
                      className="
        pointer-events-none
        absolute inset-0
        rounded-full
        opacity-0
        transition-opacity duration-500
        group-hover:opacity-100
      "
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(255,255,255,0.42), rgba(255,255,255,0.08))",
                      }}
                    />

                    <span className="relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]">
                      <Arrow />
                    </span>
                  </button>
                </div>
              </div>

              {/* ============================================================ */}
              {/* INFORMATION                                                  */}
              {/* ============================================================ */}

              <div className="flex flex-col justify-between bg-[#fffafb] p-7 md:p-10 lg:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={service.id}
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -10,
                    }}
                    transition={{
                      duration: 0.45,
                    }}
                    className="flex h-full flex-col"
                  >
                    <div>
                      <span
                        className="font-sans font-semibold uppercase"
                        style={{
                          color: "rgb(210,110,135)",

                          fontSize: 9,

                          letterSpacing: "0.25em",
                        }}
                      >
                        {service.category || "Servicio"}
                      </span>

                      <h4
                        className="mt-4 font-display font-light"
                        style={{
                          color: "rgb(74,36,50)",

                          fontSize: "clamp(2rem, 3.4vw, 3.15rem)",

                          lineHeight: 0.98,

                          letterSpacing: "-0.025em",
                        }}
                      >
                        {service.titleTop}

                        {service.titleBottom && (
                          <>
                            <br />

                            <em
                              style={{
                                color: "rgb(210,110,135)",
                              }}
                            >
                              {service.titleBottom}
                            </em>
                          </>
                        )}
                      </h4>

                      <div
                        className="my-7 h-px w-full"
                        style={{
                          backgroundColor: "rgba(74,36,50,0.1)",
                        }}
                      />

                      <p
                        className="max-w-[430px] font-sans"
                        style={{
                          color: "rgba(74,36,50,0.72)",

                          fontSize: 14,

                          lineHeight: 1.75,
                        }}
                      >
                        {service.short_description ||
                          service.description ||
                          content.description}
                      </p>

                      {/* ==================================================== */}
                      {/* WHAT IS INCLUDED                                     */}
                      {/* ==================================================== */}

                      <div className="mt-8">
                        <span
                          className="font-sans font-semibold uppercase"
                          style={{
                            color: "rgba(74,36,50,0.48)",

                            fontSize: 9,

                            letterSpacing: "0.18em",
                          }}
                        >
                          Incluye
                        </span>

                        <div className="mt-4 space-y-4">
                          {(Array.isArray(service.features) &&
                          service.features.length
                            ? service.features
                            : []
                          ).map((feature: any, index: number) => {
                            const title =
                              typeof feature === "string"
                                ? feature
                                : feature?.title ||
                                  feature?.name ||
                                  feature?.label ||
                                  "";

                            if (!title) {
                              return null;
                            }

                            return (
                              <div
                                key={`${service.id}-feature-${index}`}
                                className="flex items-start gap-4"
                              >
                                <span
                                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: "rgb(210,110,135)",
                                  }}
                                />

                                <span
                                  className="font-sans"
                                  style={{
                                    color: "rgb(74,36,50)",
                                    fontSize: 12.5,
                                    lineHeight: 1.45,
                                  }}
                                >
                                  {title}
                                </span>
                              </div>
                            );
                          })}

                          {/* Fallback */}
                          {!(
                            Array.isArray(service.features) &&
                            service.features.length
                          ) && (
                            <>
                              <div className="flex items-start gap-4">
                                <span
                                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: "rgb(210,110,135)",
                                  }}
                                />

                                <span
                                  className="font-sans"
                                  style={{
                                    color: "rgb(74,36,50)",
                                    fontSize: 12.5,
                                  }}
                                >
                                  Acabado premium
                                </span>
                              </div>

                              <div className="flex items-start gap-4">
                                <span
                                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: "rgb(210,110,135)",
                                  }}
                                />

                                <span
                                  className="font-sans"
                                  style={{
                                    color: "rgb(74,36,50)",
                                    fontSize: 12.5,
                                  }}
                                >
                                  Técnica profesional
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ====================================================== */}
                    {/* SERVICE FOOTER                                        */}
                    {/* ====================================================== */}

                    <div className="mt-10">
                      <div className="mb-6 flex items-end justify-between gap-5">
                        <div>
                          <span
                            className="font-sans font-semibold uppercase"
                            style={{
                              color: "rgba(74,36,50,0.45)",

                              fontSize: 8.5,

                              letterSpacing: "0.2em",
                            }}
                          >
                            Inversión desde
                          </span>

                          <div className="mt-1 flex items-baseline gap-2">
                            <span
                              className="font-display"
                              style={{
                                color: "rgb(74,36,50)",

                                fontSize: "clamp(2rem, 4vw, 2.8rem)",

                                lineHeight: 1,
                              }}
                            >
                              {service.price_from
                                ? `$${Number(service.price_from).toLocaleString(
                                    "es-MX",
                                  )}`
                                : "Consultar"}
                            </span>

                            {service.price_from && (
                              <span
                                className="font-sans"
                                style={{
                                  color: "rgba(74,36,50,0.42)",

                                  fontSize: 9,

                                  letterSpacing: "0.12em",
                                }}
                              >
                                MXN
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className="font-sans font-semibold uppercase"
                            style={{
                              color: "rgba(74,36,50,0.38)",

                              fontSize: 8.5,

                              letterSpacing: "0.18em",
                            }}
                          >
                            Duración
                          </span>

                          <div
                            className="mt-1 font-sans"
                            style={{
                              color: "rgb(74,36,50)",
                              fontSize: 11,
                            }}
                          >
                            {service.duration_minutes
                              ? `${service.duration_minutes} min`
                              : content.duration}
                          </div>
                        </div>
                      </div>

                      {/* CTA — Apple inspired */}
                      <a
                        href={`/reservar?service=${encodeURIComponent(service.id)}`}
                        className="
    group relative
    flex h-[56px] w-full
    items-center justify-center
    overflow-hidden
    rounded-full
    px-7

    bg-gradient-to-r
from-[#9E3F61]
via-[#B84F72]
to-[#8F3456]
    text-white

    font-admin-sans
    text-[14px]
    font-medium
    tracking-[-0.01em]

    transition-all
    duration-500
    ease-[cubic-bezier(0.22,1,0.36,1)]

    hover:-translate-y-[2px]
    hover:shadow-[0_16px_36px_rgba(74,23,43,0.28)]

    active:translate-y-0
    active:scale-[0.985]
  "
                      >
                        {/* Reflejo sutil */}
                        <span
                          aria-hidden="true"
                          className="
      pointer-events-none
      absolute inset-0
      rounded-full
      opacity-0
      transition-opacity
      duration-500
      group-hover:opacity-100
    "
                          style={{
                            background:
                              "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 42%, rgba(255,255,255,0.07) 100%)",
                          }}
                        />

                        {/* Contenido */}
                        <span className="relative z-10 flex items-center gap-2">
                          <span>Cotizar</span>

                          <span
                            className="
        flex items-center
        transition-transform
        duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
        group-hover:translate-x-1
      "
                          >
                            <Arrow />
                          </span>
                        </span>
                      </a>

                      <div className="mt-4 text-center">
                        <span
                          className="font-sans uppercase"
                          style={{
                            color: "rgb(74,36,50)",

                            fontSize: 9,

                            letterSpacing: "0.18em",
                          }}
                        >
                          Atención completamente personalizada
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* CTA SECONDARY                                                     */}
          {/* ================================================================ */}

          <div
            className="mt-8 flex items-center justify-between border-t pt-6"
            style={{
              borderColor: "rgba(74,36,50,0.12)",
            }}
          >
            <a
              href="#servicios"
              className="group ml-auto flex items-center gap-3 font-sans font-semibold uppercase"
              style={{
                color: "rgb(74,36,50)",
                fontSize: 10,
                letterSpacing: "0.16em",
              }}
            >
              Ver todos los servicios
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                style={{
                  color: "rgb(210,110,135)",
                }}
              >
                <Arrow />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
