import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface GalleryImage {
  id?: string;
  url: string;
  alt?: string;
  category?: string;
  title?: string;
}

interface GalleryProps {
  gallery?: {
    images?: GalleryImage[];
    isVisible?: boolean;
  };
}

const swipeConfidenceThreshold = 7000;

function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

export default function Gallery({ gallery }: GalleryProps) {
  const images = gallery?.images ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const total = images.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;

    setDirection(1);
    setCurrentIndex((current) => (current + 1) % total);
  }, [total]);

  const previousSlide = useCallback(() => {
    if (total <= 1) return;

    setDirection(-1);
    setCurrentIndex((current) => (current - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex) return;

      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  /*
   * Mantiene el índice válido si cambia la galería
   * desde el CMS.
   */
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, total]);

  /*
   * Teclado
   */
  useEffect(() => {
    if (total <= 1) return;

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        previousSlide();
      }

      if (event.key === "ArrowRight") {
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [nextSlide, previousSlide, total]);

  /*
   * Autoplay muy suave.
   */
  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const interval = window.setInterval(() => {
      nextSlide();
    }, 6500);

    return () => {
      window.clearInterval(interval);
    };
  }, [isHovered, nextSlide, total]);

  if (!gallery?.isVisible || total === 0) {
    return null;
  }

  const current = images[currentIndex];

  const currentNumber = String(currentIndex + 1).padStart(2, "0");
  const totalNumber = String(total).padStart(2, "0");

  const title = current.title || current.category || "Maquillaje profesional";

  const category = current.category || "Trabajo editorial";

  return (
    <section
      id="portafolio"
      className="relative w-full overflow-hidden py-28 md:py-36"
      style={{
        background: "linear-gradient(180deg, #fffefd 0%, #fffafb 100%)",
      }}
    >
      {/* Luz ambiental extremadamente sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-72 top-10 h-[650px] w-[650px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(210,110,135,0.045) 0%, transparent 70%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-80 bottom-0 h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(235,168,185,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1300px] px-5 sm:px-8 lg:px-12">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              margin: "-100px",
            }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="mb-5 flex items-center gap-4"
          >
            <span
              className="block"
              style={{
                width: 24,
                height: 1.5,
                background: "rgb(210,110,135)",
              }}
            />

            <span
              className="font-sans font-semibold uppercase"
              style={{
                fontSize: "10px",
                letterSpacing: "0.25em",
                color: "rgb(210,110,135)",
              }}
            >
              Portafolio
            </span>
          </motion.div>

          <div className="flex items-end justify-between gap-8">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                margin: "-100px",
              }}
              transition={{
                duration: 0.9,
                delay: 0.04,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="font-display font-light tracking-tight"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                lineHeight: 1.04,
                color: "rgb(74,36,50)",
              }}
            >
              Arte en cada{" "}
              <em
                className="italic"
                style={{
                  color: "rgb(210,110,135)",
                }}
              >
                detalle.
              </em>
            </motion.h2>

            {/* CONTADOR EDITORIAL */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: 0.15,
              }}
              className="hidden shrink-0 items-end gap-4 pb-2 sm:flex"
            >
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-sans font-medium"
                    style={{
                      fontSize: "18px",
                      lineHeight: 1,
                      color: "rgb(210,110,135)",
                    }}
                  >
                    {currentNumber}
                  </span>

                  <span
                    className="font-sans"
                    style={{
                      fontSize: "11px",
                      color: "rgba(74,36,50,0.32)",
                    }}
                  >
                    / {totalNumber}
                  </span>
                </div>

                <div
                  className="mt-3 overflow-hidden"
                  style={{
                    width: 76,
                    height: 1,
                    background: "rgba(210,110,135,0.14)",
                  }}
                >
                  <motion.div
                    animate={{
                      width: `${((currentIndex + 1) / total) * 100}%`,
                    }}
                    transition={{
                      duration: 0.55,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    style={{
                      height: "100%",
                      background: "rgb(210,110,135)",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* =====================================================
            CARRUSEL
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
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
            duration: 0.9,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative"
        >
          <div
            className="relative overflow-hidden rounded-[20px] md:rounded-[24px]"
            style={{
              height: "clamp(300px, 38vw, 445px)",
              background: "#f8eef1",
              border: "1px solid rgba(210,110,135,0.16)",
              boxShadow: "0 24px 65px rgba(74,36,50,0.075)",
            }}
          >
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.img
                key={`${current.id ?? current.url}-${currentIndex}`}
                src={current.url}
                alt={current.alt || title}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({
                    x: dir > 0 ? 45 : -45,
                    opacity: 0,
                    scale: 1.025,
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                  },
                  exit: (dir: number) => ({
                    x: dir > 0 ? -45 : 45,
                    opacity: 0,
                    scale: 1.005,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: {
                    type: "spring",
                    stiffness: 280,
                    damping: 32,
                  },
                  opacity: {
                    duration: 0.35,
                  },
                  scale: {
                    duration: 0.7,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                }}
                drag="x"
                dragConstraints={{
                  left: 0,
                  right: 0,
                }}
                dragElastic={0.8}
                onDragEnd={(_, info) => {
                  const swipe = swipePower(info.offset.x, info.velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    nextSlide();
                  } else if (swipe > swipeConfidenceThreshold) {
                    previousSlide();
                  }
                }}
                className="absolute inset-0 h-full w-full cursor-grab select-none object-cover object-center active:cursor-grabbing"
                draggable={false}
              />
            </AnimatePresence>

            {/* OVERLAY */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(74,36,50,0.01) 35%, rgba(74,36,50,0.04) 52%, rgba(74,36,50,0.48) 100%)",
              }}
            />

            {/* TINT ROSA */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(210,110,135,0.035), transparent 35%, transparent 70%, rgba(210,110,135,0.045))",
              }}
            />

            {/* INFORMACIÓN SOBRE LA FOTO */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="absolute bottom-7 left-7 right-7 md:bottom-8 md:left-8 md:right-8"
              >
                <span
                  className="mb-2.5 block font-sans font-semibold uppercase"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.24em",
                    color: "rgba(255,240,244,0.92)",
                  }}
                >
                  {category}
                </span>

                <div className="flex items-end gap-4">
                  <h3
                    className="font-display font-light"
                    style={{
                      fontSize: "clamp(1.55rem, 3vw, 2.35rem)",
                      lineHeight: 1.05,
                      color: "#ffffff",
                    }}
                  >
                    {title}
                  </h3>

                  <span
                    className="mb-1.5 hidden h-px w-12 sm:block"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* PAGINACIÓN SOBRE LA IMAGEN */}
            {total > 1 && (
              <div className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-1 sm:flex">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Ver trabajo ${index + 1}`}
                    onClick={() => goToSlide(index)}
                    className="flex h-5 items-center px-1"
                  >
                    <span
                      className="block rounded-full transition-all duration-500"
                      style={{
                        width: index === currentIndex ? 24 : 6,
                        height: 2,
                        background:
                          index === currentIndex
                            ? "#ffffff"
                            : "rgba(255,255,255,0.42)",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===================================================
              FLECHA ANTERIOR
          ==================================================== */}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={previousSlide}
                aria-label="Trabajo anterior"
                className="group absolute left-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 md:-left-5"
                style={{
                  background: "rgba(255,253,253,0.96)",
                  border: "1px solid rgba(210,110,135,0.22)",
                  color: "rgb(74,36,50)",
                  boxShadow: "0 8px 25px rgba(74,36,50,0.10)",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "rgb(210,110,135)";
                  event.currentTarget.style.color = "#ffffff";
                  event.currentTarget.style.borderColor = "rgb(210,110,135)";
                  event.currentTarget.style.boxShadow =
                    "0 10px 28px rgba(210,110,135,0.24)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background =
                    "rgba(255,253,253,0.96)";
                  event.currentTarget.style.color = "rgb(74,36,50)";
                  event.currentTarget.style.borderColor =
                    "rgba(210,110,135,0.22)";
                  event.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(74,36,50,0.10)";
                }}
              >
                <ChevronLeft className="h-[17px] w-[17px]" strokeWidth={1.4} />
              </button>

              {/* FLECHA SIGUIENTE */}
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Siguiente trabajo"
                className="group absolute right-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 md:-right-5"
                style={{
                  background: "rgb(210,110,135)",
                  border: "1px solid rgb(210,110,135)",
                  color: "#ffffff",
                  boxShadow: "0 10px 30px rgba(210,110,135,0.24)",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "rgb(190,88,117)";
                  event.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(210,110,135,0.32)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "rgb(210,110,135)";
                  event.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(210,110,135,0.24)";
                }}
              >
                <ChevronRight className="h-[17px] w-[17px]" strokeWidth={1.4} />
              </button>
            </>
          )}
        </motion.div>

        {/* =====================================================
            CAPTION EDITORIAL
        ====================================================== */}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
            transition={{
              duration: 0.35,
            }}
            className="mt-5 border-b pb-6 md:mt-6 md:pb-7"
            style={{
              borderColor: "rgba(210,110,135,0.20)",
            }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              {/* INFO */}

              <div className="flex items-center gap-4 md:gap-7">
                <span
                  className="font-sans font-semibold uppercase"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.22em",
                    color: "rgb(210,110,135)",
                  }}
                >
                  {category}
                </span>

                <span
                  className="h-4 w-px"
                  style={{
                    background: "rgba(210,110,135,0.25)",
                  }}
                />

                <span
                  className="font-display font-light"
                  style={{
                    fontSize: "clamp(1rem, 2vw, 1.25rem)",
                    lineHeight: 1,
                    color: "rgb(74,36,50)",
                  }}
                >
                  {title}
                </span>
              </div>

              {/* CTA EDITORIAL */}
              <Link
                to="/portafolio"
                className="group relative flex w-fit items-center gap-3 py-2"
              >
                <span
                  className="font-sans font-semibold uppercase"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    color: "rgb(74,36,50)",
                  }}
                >
                  Ver todos los trabajos
                </span>

                <ArrowRight
                  className="h-[15px] w-[15px] transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={1.4}
                  style={{
                    color: "rgb(210,110,135)",
                  }}
                />

                {/* Línea de hover */}
                <span
                  className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-400 group-hover:scale-x-100"
                  style={{
                    background: "rgb(210,110,135)",
                  }}
                />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* =====================================================
            MOBILE COUNTER
        ====================================================== */}

        {total > 1 && (
          <div className="mt-5 flex items-center justify-between sm:hidden">
            <div className="flex items-baseline gap-2">
              <span
                className="font-sans font-medium"
                style={{
                  fontSize: "17px",
                  color: "rgb(210,110,135)",
                }}
              >
                {currentNumber}
              </span>

              <span
                className="font-sans"
                style={{
                  fontSize: "10px",
                  color: "rgba(74,36,50,0.4)",
                }}
              >
                / {totalNumber}
              </span>
            </div>

            <span
              className="font-sans uppercase"
              style={{
                fontSize: "8px",
                letterSpacing: "0.18em",
                color: "rgba(210,110,135,0.65)",
              }}
            >
              Desliza para explorar
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
