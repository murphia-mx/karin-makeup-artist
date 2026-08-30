import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioItem } from "../../types";

interface Props {
  item: PortfolioItem;
  onClick: () => void;
}

export function PortfolioCard({ item, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        group
        relative
        block
        w-full
        aspect-[4/5]
        cursor-pointer
        overflow-hidden
        rounded-[22px]
        bg-[#eee9e8]
        text-left
        outline-none
        focus-visible:ring-2
        focus-visible:ring-[#ca6480]/50
        focus-visible:ring-offset-4
        focus-visible:ring-offset-[#fcfaf9]
      "
      style={{
        boxShadow: "0 8px 30px rgba(74,36,50,0.055)",
      }}
    >
      {/* ============================================================ */}
      {/* IMAGE                                                         */}
      {/* ============================================================ */}

      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-[1100ms]
            ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:scale-[1.035]
          "
        />
      </div>

      {/* ============================================================ */}
      {/* VERY SUBTLE IMAGE TREATMENT                                   */}
      {/* ============================================================ */}

      {/* Top readability — practically invisible */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-24
          opacity-0
          transition-opacity
          duration-700
          group-hover:opacity-100
        "
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,12,15,0.12), transparent)",
        }}
      />

      {/* Bottom readability */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[46%]
          opacity-90
          transition-opacity
          duration-700
          group-hover:opacity-100
        "
        style={{
          background:
            "linear-gradient(to top, rgba(28,18,22,0.68) 0%, rgba(28,18,22,0.24) 48%, transparent 100%)",
        }}
      />

      {/* ============================================================ */}
      {/* TOP LABEL                                                      */}
      {/* ============================================================ */}

      <div
        className="
          absolute
          left-5
          top-5
          flex
          items-center
          gap-2
          opacity-0
          transition-all
          duration-500
          ease-out
          group-hover:translate-y-0
          group-hover:opacity-100
          translate-y-1
        "
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />

        <span
          className="
            font-sans
            text-[8px]
            font-semibold
            uppercase
            tracking-[0.22em]
            text-white
          "
        >
          Ver trabajo
        </span>
      </div>

      {/* ============================================================ */}
      {/* ARROW                                                         */}
      {/* ============================================================ */}

      <div
        className="
          absolute
          right-5
          top-5
          flex
          h-9
          w-9
          translate-y-1
          items-center
          justify-center
          rounded-full
          border
          border-white/30
          bg-black/10
          text-white
          opacity-0
          backdrop-blur-md
          transition-all
          duration-500
          ease-out
          group-hover:translate-y-0
          group-hover:opacity-100
          group-hover:bg-white/15
          group-hover:border-white/50
        "
      >
        <ArrowUpRight
          className="
            h-[14px]
            w-[14px]
            transition-transform
            duration-500
            ease-out
            group-hover:translate-x-[1px]
            group-hover:-translate-y-[1px]
          "
        />
      </div>

      {/* ============================================================ */}
      {/* CONTENT                                                       */}
      {/* ============================================================ */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          z-10
          p-5
          sm:p-6
        "
      >
        {/* Category & Featured */}
        <motion.div
          initial={false}
          className="
            mb-2
            flex
            items-center
            gap-2
            transition-transform
            duration-500
            ease-out
            group-hover:-translate-y-1
          "
        >
          {(item.serviceType || item.category) && (
            <span className="flex items-center gap-1 font-sans text-[8px] font-semibold uppercase tracking-[0.24em] text-[rgb(210,110,135)] bg-white/95 px-2 py-1 rounded-sm shadow-sm">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="opacity-90">
                <circle cx="12" cy="12" r="6" />
              </svg>
              {item.serviceType || item.category}
            </span>
          )}
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={false}
          className="
            font-sans
            text-[20px]
            font-medium
            leading-[1.05]
            tracking-[-0.035em]
            text-white
            transition-transform
            duration-500
            ease-out
            group-hover:-translate-y-1
            sm:text-[22px]
          "
        >
          {item.title}
        </motion.h3>

        {/* Location / metadata */}
        <motion.div
          initial={false}
          className="
            mt-3
            flex
            items-center
            gap-2
            overflow-hidden
            transition-all
            duration-500
            ease-out
            group-hover:max-h-8
            group-hover:opacity-100
            max-h-0
            opacity-0
          "
        >
          <span
            className="
              font-sans
              text-[8px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-white/60
            "
          >
            Mérida
          </span>

          <span className="h-1 w-1 rounded-full bg-white/35" />

          <span
            className="
              font-sans
              text-[8px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-white/60
            "
          >
            Karin Makeup Artist
          </span>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* PREMIUM EDGE                                                  */}
      {/* ============================================================ */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-[22px]
          ring-1
          ring-inset
          ring-black/[0.07]
          transition-all
          duration-500
          group-hover:ring-white/20
        "
      />

      {/* ============================================================ */}
      {/* HOVER LIGHT                                                   */}
      {/* ============================================================ */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-white/[0.035]
          opacity-0
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
      />
    </motion.button>
  );
}
