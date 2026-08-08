import { motion } from "framer-motion";
import { fadeUp } from "@config/animations";

export interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  italicWord?: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeader({ eyebrow, title, italicWord, description, align = "left" }: SectionHeaderProps) {
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUp}
      className={`flex flex-col gap-6 mb-16 lg:mb-24 ${align === "center" ? "items-center text-center" : "items-start text-left"}`}
    >
      {/* Eyebrow con la identidad visual unificada */}
      <div className={`flex items-center gap-4 ${align === "center" ? "justify-center" : ""}`}>
        {align === "center" && <div className="w-8 h-[1px] bg-brand-border hidden sm:block"></div>}
        <span className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-brand-text-muted">
          {eyebrow}
        </span>
        <div className="w-12 h-[1px] bg-brand-border"></div>
      </div>
      
      {/* Título unificado */}
      <h2 className="font-display text-[2.25rem] leading-[1.1] sm:text-5xl lg:text-[4rem] lg:leading-[1.05] tracking-tight text-brand-text max-w-3xl">
        {title}{" "}
        {italicWord && <span className="italic text-brand-primary font-light">{italicWord}</span>}
      </h2>
      
      {/* Descripción opcional */}
      {description && (
        <p className="font-sans text-[13px] md:text-sm leading-[2.2] text-brand-text-muted max-w-2xl mt-2">
          {description}
        </p>
      )}
    </motion.div>
  );
}
