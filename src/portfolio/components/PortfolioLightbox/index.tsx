import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowUpRight, Star } from "lucide-react";
import type { PortfolioItem } from "../../types";

interface Props {
  items: PortfolioItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PortfolioLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: Props) {
  if (currentIndex === null) return null;

  const item = items[currentIndex];

  if (!item) return null;

  const previousIndex = (currentIndex - 1 + items.length) % items.length;

  const nextIndex = (currentIndex + 1) % items.length;

  const whatsappMessage = `Hola Karin, me encantó el look "${item.title}" del portafolio y quiero agendar una cita.`;

  const whatsappUrl = `https://wa.me/529990000000?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  return (
    <AnimatePresence>
      {currentIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            fixed inset-0 z-[100]
            bg-[#FCFBFA]
            text-[#472332]
            overflow-hidden
          "
        >
          {/* =========================================================
              BACKGROUND
          ========================================================= */}

          <div className="absolute inset-0 bg-[#FCFBFA]" onClick={onClose} />

          {/* =========================================================
              TOP BAR
          ========================================================= */}

          <header
            className="
              absolute
              inset-x-0
              top-0
              z-[120]
              flex
              items-center
              justify-between
              px-5
              py-5
              sm:px-8
              lg:px-10
              xl:px-12
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                  h-[5px]
                  w-[5px]
                  shrink-0
                  rounded-full
                  bg-[#D26E87]
                "
              />

              <span
                className="
                  font-sans
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.20em]
                  text-[#472332]
                "
              >
                Portafolio
              </span>

              <span
                className="
                  text-[#472332]/30
                  text-sm
                "
              >
                /
              </span>

              <span
                className="
                  font-sans
                  text-[10px]
                  font-medium
                  tracking-[0.12em]
                  text-[#472332]/55
                  tabular-nums
                "
              >
                {String(currentIndex + 1).padStart(2, "0")}
                {" / "}
                {String(items.length).padStart(2, "0")}
              </span>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar portafolio"
              className="
                group
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-[#472332]/15
                bg-white
                text-[#472332]/70
                shadow-[0_4px_18px_rgba(74,36,50,0.06)]
                transition-all
                duration-300
                hover:border-[#472332]/30
                hover:text-[#472332]
                hover:shadow-[0_8px_25px_rgba(74,36,50,0.10)]
                active:scale-95
              "
            >
              <X
                className="
                  h-[17px]
                  w-[17px]
                  transition-transform
                  duration-300
                  group-hover:rotate-90
                "
                strokeWidth={1.5}
              />
            </button>
          </header>

          {/* =========================================================
              MAIN
          ========================================================= */}

          <motion.main
            initial={{
              opacity: 0,
              scale: 0.99,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.99,
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              z-10
              flex
              h-full
              w-full
              flex-col
              overflow-y-auto
              px-5
              pb-8
              pt-[78px]

              sm:px-8
              sm:pt-[86px]

              lg:mx-auto
              lg:max-w-[1500px]
              lg:flex-row
              lg:items-center
              lg:gap-12
              lg:overflow-hidden
              lg:px-12
              lg:pb-0
              lg:pt-0

              xl:gap-20
              xl:px-16
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* =====================================================
                IMAGE
            ===================================================== */}

            <section
              className="
                relative
                flex
                min-h-[52vh]
                w-full
                flex-1
                items-center
                justify-center

                sm:min-h-[58vh]

                lg:h-[82vh]
                lg:min-h-0
                lg:w-[58%]

                xl:w-[60%]
              "
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  initial={{
                    opacity: 0,
                    scale: 0.985,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.985,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                  "
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    className="
                      max-h-[56vh]
                      max-w-[88%]
                      object-contain
                      select-none
                      shadow-[0_20px_60px_rgba(74,36,50,0.12)]

                      sm:max-h-[64vh]
                      sm:max-w-[80%]

                      lg:max-h-[80vh]
                      lg:max-w-full
                    "
                  />
                </motion.div>
              </AnimatePresence>

              {/* ===================================================
                  PREVIOUS
              =================================================== */}

              {items.length > 1 && (
                <button
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={(event) => {
                    event.stopPropagation();
                    onNavigate(previousIndex);
                  }}
                  className="
                    group
                    absolute
                    left-0
                    top-1/2
                    flex
                    h-11
                    w-11
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#472332]/15
                    bg-white
                    text-[#472332]/65
                    shadow-[0_4px_18px_rgba(74,36,50,0.06)]
                    transition-all
                    duration-300

                    hover:border-[#472332]/30
                    hover:text-[#472332]
                    hover:shadow-[0_8px_25px_rgba(74,36,50,0.10)]

                    active:scale-95

                    sm:left-1

                    lg:left-0
                    lg:-translate-x-1/2
                  "
                >
                  <ChevronLeft
                    className="
                      h-[18px]
                      w-[18px]
                      transition-transform
                      duration-300
                      group-hover:-translate-x-0.5
                    "
                    strokeWidth={1.5}
                  />
                </button>
              )}

              {/* ===================================================
                  NEXT
              =================================================== */}

              {items.length > 1 && (
                <button
                  type="button"
                  aria-label="Siguiente imagen"
                  onClick={(event) => {
                    event.stopPropagation();
                    onNavigate(nextIndex);
                  }}
                  className="
                    group
                    absolute
                    right-0
                    top-1/2
                    flex
                    h-11
                    w-11
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#472332]/15
                    bg-white
                    text-[#472332]/65
                    shadow-[0_4px_18px_rgba(74,36,50,0.06)]
                    transition-all
                    duration-300

                    hover:border-[#472332]/30
                    hover:text-[#472332]
                    hover:shadow-[0_8px_25px_rgba(74,36,50,0.10)]

                    active:scale-95

                    sm:right-1

                    lg:right-0
                    lg:translate-x-1/2
                  "
                >
                  <ChevronRight
                    className="
                      h-[18px]
                      w-[18px]
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                    "
                    strokeWidth={1.5}
                  />
                </button>
              )}
            </section>

            {/* =========================================================
                INFORMATION
            ========================================================= */}

            <aside
              className="
                flex
                w-full
                shrink-0
                flex-col
                justify-center
                pb-3
                pt-7

                sm:pt-9

                lg:w-[42%]
                lg:max-w-[510px]
                lg:pb-0
                lg:pt-0

                xl:w-[40%]
              "
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  initial={{
                    opacity: 0,
                    x: 12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -12,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {/* =================================================
                      CATEGORY
                  ================================================= */}

                  <div
                    className="
                      mb-5
                      flex
                      flex-wrap
                      items-center
                      gap-3
                    "
                  >
                    <span
                      className="
                        h-px
                        w-7
                        bg-[#D26E87]
                      "
                    />

                    <span
                      className="
                        font-sans
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-[#B64F70]
                      "
                    >
                      {item.category}
                    </span>

                    {item.featured && (
                      <>
                        <span
                          className="
                            h-1
                            w-1
                            rounded-full
                            bg-[#472332]/35
                          "
                        />

                        <span
                          className="
                            flex
                            items-center
                            gap-1.5
                            font-sans
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.15em]
                            text-[#472332]/70
                          "
                        >
                          <Star className="h-3 w-3" strokeWidth={1.5} />
                          Destacado
                        </span>
                      </>
                    )}
                  </div>

                  {/* =================================================
                      TITLE
                  ================================================= */}

                  <h2
                    className="
                      max-w-[500px]
                      font-sans
                      text-[clamp(2.75rem,5vw,4.75rem)]
                      font-semibold
                      leading-[0.94]
                      tracking-[-0.065em]
                      text-[#472332]
                    "
                  >
                    {item.title}
                  </h2>

                  {/* =================================================
                      DESCRIPTION
                  ================================================= */}

                  {item.description && (
                    <p
                      className="
                        mt-6
                        max-w-[420px]
                        font-sans
                        text-[15px]
                        font-normal
                        leading-[1.7]
                        text-[#472332]/80

                        sm:text-[16px]
                      "
                    >
                      {item.description}
                    </p>
                  )}

                  {/* =================================================
                      DIVIDER
                  ================================================= */}

                  <div
                    className="
                      my-8
                      h-px
                      w-full
                      bg-[#472332]/15

                      sm:my-9
                    "
                  />

                  {/* =================================================
                      METADATA
                  ================================================= */}

                  <div className="space-y-5">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-8
                      "
                    >
                      <span
                        className="
                          font-sans
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.20em]
                          text-[#472332]/55
                        "
                      >
                        Servicio
                      </span>

                      <span
                        className="
                          font-sans
                          text-[14px]
                          font-semibold
                          text-[#472332]
                        "
                      >
                        {item.serviceType || "Make Up"}
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-8
                      "
                    >
                      <span
                        className="
                          font-sans
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.20em]
                          text-[#472332]/55
                        "
                      >
                        Ubicación
                      </span>

                      <span
                        className="
                          font-sans
                          text-[14px]
                          font-semibold
                          text-[#472332]
                        "
                      >
                        Mérida
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      CTA
                  ================================================= */}

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      mt-9
                      flex
                      h-[58px]
                      w-full
                      items-center
                      justify-between
                      rounded-full
                      bg-[#472332]
                      px-6

                      font-sans
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-white

                      shadow-[0_10px_30px_rgba(74,36,50,0.14)]

                      transition-all
                      duration-300

                      hover:-translate-y-0.5
                      hover:bg-[#562C3D]
                      hover:shadow-[0_14px_35px_rgba(74,36,50,0.18)]

                      active:translate-y-0
                    "
                  >
                    <span>Agendar este look</span>

                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-[#472332]
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      "
                    >
                      <ArrowUpRight
                        className="
                          h-4
                          w-4
                          transition-transform
                          duration-300
                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                        strokeWidth={1.7}
                      />
                    </span>
                  </a>

                  {/* =================================================
                      MICROCOPY
                  ================================================= */}

                  <p
                    className="
                      mt-4
                      text-center
                      font-sans
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-[0.18em]
                      text-[#472332]/55
                    "
                  >
                    Consulta disponibilidad con Karin
                  </p>
                </motion.div>
              </AnimatePresence>
            </aside>
          </motion.main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
