import { motion } from "framer-motion";

export function WhatsAppBanner() {
  const whatsappMessage =
    "Hola Karin, vi tu portafolio y me encantaría agendar una cita.";

  const whatsappUrl = `https://wa.me/529990000000?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  const bannerImage = "public/images/portfolio/portfolio-whatsapp.jpg";

  return (
    <section className="w-full bg-[#FCFBFA] px-5 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="mx-auto w-full max-w-[1180px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            group
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-[#472332]/[0.08]
            bg-[#F3ECEE]
            shadow-[0_16px_50px_rgba(74,36,50,0.07)]
          "
        >
          <div className="flex min-h-[300px] flex-col lg:flex-row">
            {/* =====================================================
                IMAGE
            ===================================================== */}

            <div
              className="
                relative
                h-[180px]
                w-full
                overflow-hidden

                sm:h-[210px]

                lg:h-auto
                lg:w-[35%]
              "
            >
              <img
                src={bannerImage}
                alt="Karin Makeup Artist"
                className="
                  h-full
                  w-full
                  object-cover
                  object-center
                  transition-transform
                  duration-[1200ms]
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  group-hover:scale-[1.025]
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#472332]/20
                  to-transparent
                  lg:bg-gradient-to-r
                  lg:from-transparent
                  lg:to-[#F3ECEE]
                "
              />
            </div>

            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div
              className="
                flex
                flex-1
                items-center
                justify-between
                gap-8
                px-7
                py-8

                sm:px-9
                sm:py-9

                lg:px-10
                lg:py-8

                xl:px-12
              "
            >
              {/* TEXT */}

              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="h-px w-6 bg-[#C96B85]" />

                  <span
                    className="
                      font-sans
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-[0.24em]
                      text-[#B64F70]
                    "
                  >
                    Agenda tu experiencia
                  </span>
                </div>

                <h2
                  className="
                    font-sans
                    text-[30px]
                    font-semibold
                    leading-[1]
                    tracking-[-0.055em]
                    text-[#472332]

                    sm:text-[34px]

                    lg:text-[38px]
                  "
                >
                  Tu próximo look.
                  <span className="text-[#C96B85]"> Tu momento.</span>
                </h2>

                <p
                  className="
                    mt-3
                    max-w-[480px]
                    font-sans
                    text-[12px]
                    leading-[1.65]
                    text-[#472332]/70

                    sm:text-[13px]
                  "
                >
                  Cuéntame qué tienes en mente y encontremos el maquillaje
                  perfecto para tu ocasión.
                </p>
              </div>

              {/* CTA */}

              <div className="shrink-0">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group/cta
                    flex
                    h-[50px]
                    w-[230px]
                    items-center
                    justify-between
                    rounded-full
                    bg-[#472332]
                    px-5

                    font-sans
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-white

                    shadow-[0_8px_24px_rgba(74,36,50,0.14)]

                    transition-all
                    duration-300
                    ease-[cubic-bezier(0.22,1,0.36,1)]

                    hover:-translate-y-0.5
                    hover:bg-[#562D3E]
                    hover:shadow-[0_12px_30px_rgba(74,36,50,0.18)]
                  "
                >
                  <span>Escribir por WhatsApp</span>

                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[#472332]

                      transition-transform
                      duration-300
                      group-hover/cta:scale-105
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="
                        h-[13px]
                        w-[13px]
                        transition-transform
                        duration-300
                        group-hover/cta:translate-x-0.5
                        group-hover/cta:-translate-y-0.5
                      "
                    >
                      <path d="M13 5h6v6" />
                      <path d="M19 5 10 14" />
                      <path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
                    </svg>
                  </span>
                </a>

                <p
                  className="
                    mt-2
                    text-center
                    font-sans
                    text-[7px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-[#472332]/45
                  "
                >
                  Atención personalizada
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
