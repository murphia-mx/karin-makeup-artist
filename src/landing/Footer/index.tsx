export default function Footer({ footer: model }: { footer?: any }) {
  const businessName = model?.businessName || "Karin";
  const businessDesc =
    model?.businessDescription ||
    "Especialista en maquillaje para novias, XV años y eventos especiales en Mérida, México.";
  const copyrightText =
    model?.copyrightText ||
    `© ${new Date().getFullYear()} Karin Makeup Artist. Todos los derechos reservados.`;

  const social = model?.social || {};
  const contact = model?.contact || {};

  const navLinks = [
    { label: "Inicio", href: "#" },
    { label: "Servicios", href: "#servicios" },
    { label: "Portafolio", href: "#portafolio" },
    { label: "Testimonios", href: "#testimonios" },
  ];

  return (
    <footer className="relative w-full bg-[rgb(30,12,22)] text-white overflow-hidden">
      {/* ── ORBES DECORATIVOS ── */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(198,130,145,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-[radial-gradient(ellipse,rgba(205,168,120,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* ── BORDE SUPERIOR — línea dorada sutil ── */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(198,130,145,0.4)] to-transparent" />

      <div className="w-full max-w-[1400px] mx-auto px-7 sm:px-12 lg:px-16">
        {/* ── ÁREA PRINCIPAL ── */}
        <div className="py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* BRAND — Col 5 */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Logotipo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10">
                <img
                  src="/logo/logo.png"
                  alt="Karin Makeup"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-white uppercase">
                  {businessName.split(" ")[0]}
                </span>
                <span className="font-sans text-[8px] font-medium tracking-[0.2em] text-[rgba(237,210,215,0.6)] uppercase mt-0.5">
                  Makeup Artist
                </span>
              </div>
            </div>

            {/* Headline brand */}
            <h3 className="font-display text-3xl sm:text-4xl md:text-[2.5rem] leading-[1.1] text-white font-light mb-5">
              Realzo tu belleza,{" "}
              <em className="italic text-[rgb(237,210,215)] not-italic font-light italic">
                creo tu mejor versión.
              </em>
            </h3>

            <p className="font-sans text-[12px] text-[rgba(255,248,252,0.50)] leading-[1.85] mb-8 max-w-[320px]">
              {businessDesc}
            </p>

            {/* Social */}
            <div className="flex gap-3">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-[rgba(237,210,215,0.2)] flex items-center justify-center text-[rgba(237,210,215,0.5)] hover:text-brand-primary hover:border-brand-primary transition-all duration-300"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full border border-[rgba(237,210,215,0.2)] flex items-center justify-center text-[rgba(237,210,215,0.5)] hover:text-brand-primary hover:border-brand-primary transition-all duration-300"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {social.whatsapp && (
                <a
                  href={social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full border border-[rgba(237,210,215,0.2)] flex items-center justify-center text-[rgba(237,210,215,0.5)] hover:text-brand-primary hover:border-brand-primary transition-all duration-300"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </a>
              )}
              {social.tiktok && (
                <a
                  href={`https://tiktok.com/@${social.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-full border border-[rgba(237,210,215,0.2)] flex items-center justify-center text-[rgba(237,210,215,0.5)] hover:text-brand-primary hover:border-brand-primary transition-all duration-300"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.17a8.18 8.18 0 0 0 4.78 1.52V7.24a4.85 4.85 0 0 1-1.01-.55z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* CONTACTO — Col 4 */}
          <div className="lg:col-span-4 flex flex-col">
            <h4 className="font-sans text-[9px] font-bold tracking-[0.3em] uppercase text-[rgba(237,210,215,0.5)] mb-7">
              Contacto
            </h4>
            <div className="flex flex-col gap-5">
              {contact.address && (
                <div className="flex gap-3.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-[rgba(198,130,145,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgb(198,130,145)"
                      strokeWidth="1.5"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <p className="font-sans text-[12px] text-[rgba(255,248,252,0.55)] leading-[1.7]">
                    {contact.address}
                  </p>
                </div>
              )}
              {contact.hours && (
                <div className="flex gap-3.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-[rgba(198,130,145,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgb(198,130,145)"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <p className="font-sans text-[12px] text-[rgba(255,248,252,0.55)] leading-[1.7]">
                    {contact.hours}
                  </p>
                </div>
              )}
              {!contact.address && !contact.hours && (
                <div className="flex gap-3.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-[rgba(198,130,145,0.15)] flex items-center justify-center shrink-0">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgb(198,130,145)"
                      strokeWidth="1.5"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <p className="font-sans text-[12px] text-[rgba(255,248,252,0.45)] leading-[1.7]">
                    Mérida, Yucatán, México
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NAVEGACIÓN — Col 3 */}
          <div className="lg:col-span-3 flex flex-col">
            <h4 className="font-sans text-[9px] font-bold tracking-[0.3em] uppercase text-[rgba(237,210,215,0.5)] mb-7">
              Explorar
            </h4>
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-sans text-[12px] text-[rgba(255,248,252,0.50)] hover:text-[rgb(237,210,215)] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-[1px] bg-brand-primary group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(237,210,215,0.15)] to-transparent" />
        <div className="pt-7 pb-[calc(env(safe-area-inset-bottom,0px)+28px)] sm:pb-7 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3 text-center sm:text-left">
          <p className="font-sans text-[9px] text-[rgba(255,248,252,0.28)] uppercase tracking-[0.15em] order-2 sm:order-1">
            {copyrightText}
          </p>
          <p className="font-sans text-[9px] text-[rgba(255,248,252,0.28)] uppercase tracking-[0.15em] order-1 sm:order-2">
            Diseño por{" "}
            <span className="text-[rgba(237,210,215,0.4)] font-semibold">
              Murphia
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
