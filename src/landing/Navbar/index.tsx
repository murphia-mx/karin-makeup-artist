import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ navbar }: { navbar?: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ── Enlaces Universales (Siempre hashes) ──
  const NAV_LINKS = [
    { label: "Servicios", href: "#servicios" },
    { label: "Portafolio", href: "#portafolio" },
    { label: "Testimonios", href: "#testimonios" },
  ];

  const ctaUrl = navbar?.cta?.actionUrl || "#contacto";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Transformar cuando el usuario scrollea entre 60 y 80px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 70);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ── Lógica de Navegación Universal ──
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
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

  // ── Framer Motion Variants para la Navbar (Cápsula Unificada) ──
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
      paddingTop: "max(env(safe-area-inset-top, 0px), 24px)",
      paddingBottom: "24px",
      paddingLeft: "32px",
      paddingRight: "32px",
    },
    innerPage: {
      y: 0,
      width: "100%",
      maxWidth: "100%",
      borderRadius: "0px",
      background: "rgba(255,255,255,0.88)",
      backdropFilter: "blur(20px) saturate(150%)",
      WebkitBackdropFilter: "blur(20px) saturate(150%)",
      border: "1px solid rgba(214,184,196,0.28)",
      borderLeft: "none",
      borderRight: "none",
      boxShadow: "0 1px 0 rgba(58,34,46,0.04)",
      paddingTop: "max(env(safe-area-inset-top, 0px), 18px)",
      paddingBottom: "18px",
      paddingLeft: "32px",
      paddingRight: "32px",
    },
    scrolled: {
      y: 18,
      width: "calc(100% - 40px)",
      maxWidth: "1280px",
      borderRadius: "26px",
      background: "rgba(255,250,252,0.82)",
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      border: "1px solid rgba(214,184,196,0.45)",
      boxShadow:
        "inset 0 1px 1px rgba(255,255,255,0.7), 0 12px 40px rgba(20,10,20,0.05), 0 4px 16px rgba(20,10,20,0.04)",
      paddingTop: "12px",
      paddingBottom: "12px",
      paddingLeft: "24px",
      paddingRight: "24px",
    },
    menuOpenTop: {
      y: "max(env(safe-area-inset-top, 0px), 12px)",
      width: "calc(100% - 32px)",
      maxWidth: "1280px",
      borderRadius: "32px",
      background: "rgba(255,250,252,0.12)", // Translúcido para ver el Hero
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow:
        "inset 0 1px 1px rgba(255,255,255,0.2), 0 24px 60px rgba(0,0,0,0.2)",
      paddingTop: "16px",
      paddingBottom: "28px", // Espacio inferior generoso para el menú
      paddingLeft: "24px",
      paddingRight: "24px",
    },
    menuOpenScrolled: {
      y: 18,
      width: "calc(100% - 40px)",
      maxWidth: "1280px",
      borderRadius: "32px",
      background: "rgba(255,250,252,0.92)", // Más opaco al scrollear
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      border: "1px solid rgba(214,184,196,0.45)",
      boxShadow:
        "inset 0 1px 1px rgba(255,255,255,0.7), 0 24px 60px rgba(20,10,20,0.15)",
      paddingTop: "16px",
      paddingBottom: "28px",
      paddingLeft: "24px",
      paddingRight: "24px",
    },
  };

  const isInnerPage = location.pathname !== "/";

  const currentVariant = menuOpen
    ? scrolled || isInnerPage
      ? "menuOpenScrolled"
      : "menuOpenTop"
    : scrolled
      ? "scrolled"
      : isInnerPage
        ? "innerPage"
        : "top";

  // Colores dinámicos. Nótese que NO forzamos el color por menuOpen, solo por scrolled.
  // Esto garantiza que la X se mantenga blanca en el Hero.
  const isLightNavbar = scrolled || isInnerPage;

  const logoColor = isLightNavbar ? "rgb(58,34,46)" : "rgb(255,252,251)";

  const navColor = isLightNavbar ? "rgb(89,74,82)" : "rgba(255,252,251,0.85)";

  const navHover = isLightNavbar ? "rgb(197,110,142)" : "rgb(255,252,251)";

  const mobileLinkColor = isLightNavbar ? "rgb(58,34,46)" : "rgb(255,252,251)";

  const btnHeight = scrolled ? "44px" : "48px";
  const btnPadding = scrolled ? "24px" : "32px";

  return (
    <>
      {/* ── OVERLAY DE FONDO (Dark blur sutil) ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-40 pointer-events-auto"
            style={{
              background: "rgba(20,10,15,0.25)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── WRAPPER PRINCIPAL (Contenedor para alinear al centro) ── */}
      <div className="fixed top-0 left-0 w-full z-50 flex flex-col items-center pointer-events-none">
        {/* ── LA NAVBAR UNIFICADA (Crece hacia abajo al abrirse) ── */}
        <motion.header
          layout
          initial="top"
          animate={currentVariant}
          whileHover={
            scrolled && !menuOpen
              ? {
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,0.7), 0 16px 48px rgba(20,10,20,0.07), 0 6px 20px rgba(20,10,20,0.05)",
                }
              : {}
          }
          variants={navContainerVariants}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
          className="pointer-events-auto flex flex-col w-full"
          style={{ transformOrigin: "top center" }}
        >
          {/* TOP ROW (Siempre visible) */}
          <div className="flex items-center justify-between w-full shrink-0">
            {/* LOGOTIPO */}
            <a
              href="/"
              onClick={(e) => handleNavClick(e, "/")}
              aria-label="Karin Makeup Artist"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                textDecoration: "none",
              }}
            >
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
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
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

            {/* NAVEGACIÓN DESKTOP */}
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
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = navHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = navColor;
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA DESKTOP */}
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

            {/* HAMBURGER MOBILE */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className="lg:hidden flex flex-col justify-center items-center gap-[6px] outline-none"
              style={{ width: 44, height: 44, zIndex: 60 }}
            >
              <span
                style={{
                  display: "block",
                  width: 22,
                  height: 1.5,
                  background: logoColor,
                  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transformOrigin: "center",
                  transform: menuOpen
                    ? "rotate(45deg) translate(5px, 5.5px)"
                    : "none",
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
                  transform: menuOpen
                    ? "rotate(-45deg) translate(5px, -5.5px)"
                    : "none",
                }}
              />
            </button>
          </div>

          {/* MENÚ DESPLEGABLE (Animación de altura + clip) */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col lg:hidden"
                style={{ overflow: "hidden" }} // Esto es la clave para la expansión limpia
              >
                <nav className="flex flex-col items-center gap-4 pt-10 pb-2 w-full">
                  {NAV_LINKS.map((link, i) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="relative group flex items-center justify-center w-full"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12.5px",
                        fontWeight: 500,
                        color: mobileLinkColor,
                        textDecoration: "none",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        height: "40px",
                      }}
                    >
                      {link.label}
                    </motion.a>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{
                      delay: NAV_LINKS.length * 0.04,
                      duration: 0.3,
                    }}
                    className="w-full flex justify-center mt-3"
                  >
                    <a
                      href={ctaUrl}
                      onClick={(e) => handleNavClick(e, ctaUrl)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "44px", // Elegante y compacto
                        paddingLeft: "28px",
                        paddingRight: "28px",
                        background: "#CF7F9B",
                        borderRadius: "9999px",
                        color: "white",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(207, 127, 155, 0.2)",
                      }}
                    >
                      Reservar mi cita
                    </a>
                  </motion.div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      </div>
    </>
  );
}
