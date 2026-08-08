import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ navbar }: { navbar?: any }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ── Enlaces Universales (Siempre hashes) ──
  const NAV_LINKS = [
    { label: "Servicios",    href: "#servicios" },
    { label: "Portafolio",   href: "#portafolio" },
    { label: "Testimonios",  href: "#testimonios" },
  ];

  const ctaUrl = navbar?.cta?.actionUrl || "#contacto";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Transformar cuando el usuario scrollea entre 60 y 80px
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 70));

  // ── Lógica de Navegación Universal ──
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);

    if (href.startsWith("http") || href.startsWith("mailto:")) {
      window.open(href, "_blank");
      return;
    }

    if (href === "/") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }

    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate(`/${href}`);
      } else {
        const id = href.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
        }
      }
    } else {
      navigate(href);
    }
  };

  // ── Framer Motion Variants para el Navbar (Efecto Floating Apple) ──
  const navContainerVariants = {
    top: {
      y: 0,
      width: "100%",
      maxWidth: "100%",
      borderRadius: "0px",
      background: "rgba(255, 255, 255, 0)",
      backdropFilter: "blur(0px) saturate(100%)",
      WebkitBackdropFilter: "blur(0px) saturate(100%)",
      border: "1px solid rgba(255,255,255,0)",
      boxShadow: "inset 0 0px 0px rgba(255,255,255,0), 0 0px 0px rgba(0,0,0,0)",
      paddingTop: "24px",
      paddingBottom: "24px",
      paddingLeft: "32px",
      paddingRight: "32px",
    },
    scrolled: {
      y: 18,
      width: "calc(100% - 40px)",
      maxWidth: "1280px",
      borderRadius: "26px",
      background: "rgba(255,250,252,0.82)", // Blanco translúcido premium
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      border: "1px solid rgba(214,184,196,0.45)", // Borde elegantísimo casi invisible
      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7), 0 12px 40px rgba(20,10,20,0.05), 0 4px 16px rgba(20,10,20,0.04)", // Sombra premium + Highlight superior
      paddingTop: "12px",
      paddingBottom: "12px",
      paddingLeft: "24px",
      paddingRight: "24px",
    }
  };

  const logoColor = scrolled ? "rgb(58,34,46)" : "rgb(255,252,251)";
  const navColor  = scrolled ? "rgb(89,74,82)" : "rgba(255,252,251,0.85)";
  const navHover  = scrolled ? "rgb(197,110,142)" : "rgb(255,252,251)";
  
  // Botón Hero Style: Modificado al flotar para ser más refinado
  const btnHeight = scrolled ? "44px" : "48px";
  const btnPadding = scrolled ? "24px" : "32px";

  return (
    <>
      {/* Wrapper fijo invisible para contener el navbar y centrarlo */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <motion.header
          initial="top"
          animate={scrolled ? "scrolled" : "top"}
          whileHover={scrolled ? { boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7), 0 16px 48px rgba(20,10,20,0.07), 0 6px 20px rgba(20,10,20,0.05)" } : {}}
          variants={navContainerVariants}
          transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
          className="pointer-events-auto flex items-center justify-between"
          style={{ transformOrigin: "top center" }}
        >
          {/* ── LOGOTIPO ── */}
          <a
            href="/"
            onClick={(e) => handleNavClick(e, "/")}
            aria-label="Karin Makeup Artist"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {/* Isotipo */}
            <div style={{ width: 44, height: 44, flexShrink: 0 }}>
              <img
                src="/logo/logo.png"
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transition: "opacity 0.4s ease",
                }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>

            {/* Wordmark */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                className="font-sans font-semibold uppercase"
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.25em",
                  color: logoColor,
                  transition: "color 0.4s ease",
                  lineHeight: 1,
                }}
              >
                Karin Makeup Artist
              </span>
            </div>
          </a>

          {/* ── NAVEGACIÓN DESKTOP ── */}
          <nav
            className="hidden lg:flex items-center"
            style={{ gap: "40px" }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: scrolled ? "0.15em" : "0.2em",
                  textTransform: "uppercase",
                  color: navColor,
                  textDecoration: "none",
                  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  paddingBottom: "2px",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = navHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = navColor; }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ── CTA DESKTOP (Botón Hero) ── */}
          <div className="hidden lg:flex items-center">
            <a
              href={ctaUrl}
              onClick={(e) => handleNavClick(e, ctaUrl)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: btnHeight,
                paddingLeft: btnPadding,
                paddingRight: btnPadding,
                background: "#CF7F9B",
                borderRadius: "9999px",
                color: "white",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.03em",
                textDecoration: "none",
                transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                boxShadow: "0 4px 12px rgba(0,0,0,0)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#C56E8E";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 24px rgba(197, 110, 142, 0.3)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#CF7F9B";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              Reservar mi cita
            </a>
          </div>

          {/* ── HAMBURGER MOBILE ── */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="lg:hidden flex flex-col justify-center items-center gap-[5px]"
            style={{ width: 36, height: 36 }}
          >
            <span
              style={{
                display: "block",
                width: 22,
                height: 1.5,
                background: logoColor,
                transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transformOrigin: "center",
                transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: 16,
                height: 1.5,
                background: logoColor,
                transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                width: 22,
                height: 1.5,
                background: logoColor,
                transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transformOrigin: "center",
                transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none",
              }}
            />
          </button>
        </motion.header>
      </div>

      {/* ── MENÚ MOBILE ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              background: "rgb(28,14,22)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Orbe decorativo */}
            <div
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 420,
                height: 420,
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse, rgba(198,130,145,0.14) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, position: "relative", zIndex: 1 }}>
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 + 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2.5rem",
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "rgba(255,252,251,0.9)",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgb(237,210,215)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,252,251,0.9)"; }}
                >
                  {link.label}
                </motion.a>
              ))}

              {/* CTA mobile */}
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.07 + 0.25, duration: 0.5 }}
                href={ctaUrl}
                onClick={(e) => handleNavClick(e, ctaUrl)}
                style={{
                  marginTop: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 48,
                  paddingLeft: 32,
                  paddingRight: 32,
                  background: "#CF7F9B",
                  borderRadius: "9999px",
                  color: "white",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  textDecoration: "none",
                }}
              >
                Reservar mi cita
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
