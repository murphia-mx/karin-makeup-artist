import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { PortfolioCategory } from "./types";

import { Banner } from "./components/Banner";
import { PortfolioFilters } from "./components/Filters";
import { PortfolioSearchBar } from "./components/SearchBar";
import { PortfolioGrid } from "./components/PortfolioGrid";
import { PortfolioLightbox } from "./components/PortfolioLightbox";

import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";
import { usePublicContent } from "../domains/content/hooks/usePublicContent";

export default function PortfolioPage() {
  const { models } = usePublicContent();
  const location = useLocation();

  const landing = models?.landing;
  const dbItems = models?.fullGallery || [];

  const [activeCategory, setActiveCategory] =
    useState<PortfolioCategory>("Todas");

  const [searchQuery, setSearchQuery] = useState("");

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /* ====================================================================== */
  /* FILTERING                                                              */
  /* ====================================================================== */

  const filteredItems = useMemo(() => {
    return dbItems
      .filter((item: any) => {
        /* Category */
        if (activeCategory !== "Todas" && item.category !== activeCategory) {
          return false;
        }

        /* Search */
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase().trim();

          const matchTitle = item.title?.toLowerCase().includes(query);

          const matchService = item.serviceType?.toLowerCase().includes(query);

          const matchCategory = item.category?.toLowerCase().includes(query);

          const matchDesc = item.description?.toLowerCase().includes(query);

          if (!matchTitle && !matchService && !matchCategory && !matchDesc) {
            return false;
          }
        }

        return true;
      })
      .sort((a: any, b: any) => a.order - b.order);
  }, [activeCategory, searchQuery, dbItems]);

  // Open project from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('project');
    if (projectId && filteredItems.length > 0) {
      const idx = filteredItems.findIndex((i: any) => i.id === projectId);
      if (idx !== -1) {
        setLightboxIndex(idx);
      }
    }
  }, [location.search, filteredItems]);

  /* ====================================================================== */
  /* PAGINATION                                                             */
  /* ====================================================================== */

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  /* ====================================================================== */
  /* UI                                                                     */
  /* ====================================================================== */

  return (
    <div
      className="
        min-h-screen
        bg-[#fcfaf9]
        font-sans
        text-[#472332]
      "
    >
      {/* ================================================================== */}
      {/* NAVBAR                                                             */}
      {/* ================================================================== */}

      <Navbar navbar={landing?.navbar} />

      {/* ================================================================== */}
      {/* COMPACT PORTFOLIO INTRO                                            */}
      {/* ================================================================== */}

      <Banner />

      {/* ================================================================== */}
      {/* PORTFOLIO                                                          */}
      {/* ================================================================== */}

      <main className="relative overflow-hidden">
        {/* Very subtle ambient light */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-[260px]
            top-[280px]
            h-[520px]
            w-[520px]
            rounded-full
            opacity-60
          "
          style={{
            background:
              "radial-gradient(circle, rgba(210,110,135,0.055) 0%, rgba(210,110,135,0) 70%)",
          }}
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-[280px]
            top-[700px]
            h-[520px]
            w-[520px]
            rounded-full
            opacity-40
          "
          style={{
            background:
              "radial-gradient(circle, rgba(210,110,135,0.045) 0%, rgba(210,110,135,0) 70%)",
          }}
        />

        <section
          className="
            relative
            mx-auto
            w-full
            max-w-[1440px]
            px-6
            pb-24
            sm:px-8
            lg:px-12
          "
        >
          {/* ============================================================ */}
          {/* SECTION HEADER                                                */}
          {/* ============================================================ */}

          <div className="mb-9 pt-6 sm:pt-8 lg:pt-10">
            <div
              className="
                flex
                flex-col
                gap-7
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              {/* Heading */}
              <div className="max-w-[600px]">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="h-px w-7"
                    style={{
                      backgroundColor: "rgb(202,100,128)",
                    }}
                  />

                  <span
                    className="
                      font-sans
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-[0.26em]
                    "
                    style={{
                      color: "rgb(176,78,103)",
                    }}
                  >
                    Selección editorial
                  </span>
                </div>

                <h2
                  className="
                    font-sans
                    text-[clamp(2rem,4vw,3.25rem)]
                    font-medium
                    leading-[0.95]
                    tracking-[-0.055em]
                    text-[#472332]
                  "
                >
                  Explora el trabajo.
                </h2>

                <p
                  className="
                    mt-4
                    max-w-[470px]
                    font-sans
                    text-[12px]
                    leading-[1.7]
                    text-[#472332]/50
                    sm:text-[13px]
                  "
                >
                  Una colección de maquillajes creados para distintos estilos,
                  ocasiones y personalidades.
                </p>
              </div>

              {/* Counter */}
              <div
                className="
                  flex
                  items-end
                  gap-3
                  lg:pb-1
                "
              >
                <span
                  className="
                    font-sans
                    text-[2rem]
                    font-medium
                    leading-none
                    tracking-[-0.05em]
                    text-[#472332]
                  "
                >
                  {filteredItems.length.toString().padStart(2, "0")}
                </span>

                <span
                  className="
                    mb-[2px]
                    font-sans
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-[#472332]/35
                  "
                >
                  trabajos
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CONTROLS                                                      */}
          {/* ============================================================ */}

          <div
            className="
              border-y
              border-[#472332]/[0.09]
              py-4
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                xl:flex-row
                xl:items-center
                xl:justify-between
              "
            >
              {/* Categories */}
              <div
                className="
                  min-w-0
                  overflow-x-auto
                  scrollbar-none
                "
              >
                <PortfolioFilters
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>

              {/* Search */}
              <div
                className="
                  w-full
                  shrink-0
                  xl:w-[270px]
                "
              >
                <PortfolioSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ACTIVE STATE                                                   */}
          {/* ============================================================ */}

          {(activeCategory !== "Todas" || searchQuery.trim() !== "") && (
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                py-5
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                  "
                  style={{
                    backgroundColor: "rgb(202,100,128)",
                  }}
                />

                <span
                  className="
                    font-sans
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-[#472332]/45
                  "
                >
                  {activeCategory !== "Todas"
                    ? activeCategory
                    : "Todos los trabajos"}
                </span>

                {searchQuery.trim() && (
                  <>
                    <span className="text-[#472332]/20">·</span>

                    <span
                      className="
                        max-w-[180px]
                        truncate
                        font-sans
                        text-[9px]
                        text-[#472332]/40
                      "
                    >
                      “{searchQuery.trim()}”
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("Todas");
                  setSearchQuery("");
                }}
                className="
                  font-sans
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.15em]
                  text-[#472332]/40
                  transition-colors
                  duration-300
                  hover:text-[#ca6480]
                "
              >
                Limpiar
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* GRID                                                          */}
          {/* ============================================================ */}

          <div
            className={
              activeCategory === "Todas" && searchQuery.trim() === ""
                ? "pt-8"
                : "pt-1"
            }
          >
            {paginatedItems.length > 0 ? (
              <>
                <PortfolioGrid
                  items={paginatedItems}
                  onItemClick={(item) => {
                    const idx = filteredItems.findIndex(
                      (i: any) => i.id === item.id,
                    );
                    setLightboxIndex(idx);
                  }}
                />
                
                {/* ============================================================ */}
                {/* PAGINACIÓN EDITORIAL                                           */}
                {/* ============================================================ */}
                {totalPages > 1 && (
                  <div className="mt-20 flex flex-col items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="group flex h-9 w-9 items-center justify-center rounded-full border border-[#472332]/10 bg-transparent text-[#472332] transition-all hover:border-[#ca6480] hover:text-[#ca6480] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <span className="text-lg leading-none mb-1">‹</span>
                      </button>
                      
                      <div className="flex items-center gap-1 mx-2">
                        {getPageNumbers(currentPage, totalPages).map((page, idx) => {
                          if (page === "...") {
                            return (
                              <span key={`dots-${idx}`} className="px-2 text-[#472332]/40 text-xs">
                                ...
                              </span>
                            );
                          }
                          
                          const isCurrent = page === currentPage;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page as number)}
                              className={`
                                flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium transition-all
                                ${
                                  isCurrent 
                                    ? "bg-[#ca6480] text-white shadow-sm" 
                                    : "bg-transparent text-[#472332]/70 hover:bg-[#ca6480]/10 hover:text-[#472332]"
                                }
                              `}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="group flex h-9 w-9 items-center justify-center rounded-full border border-[#472332]/10 bg-transparent text-[#472332] transition-all hover:border-[#ca6480] hover:text-[#ca6480] disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <span className="text-lg leading-none mb-1">›</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="
                  flex
                  min-h-[360px]
                  flex-col
                  items-center
                  justify-center
                  border-y
                  border-[#472332]/[0.08]
                  text-center
                "
              >
                <div
                  className="
                    mb-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#f7e8ec]
                  "
                >
                  <span
                    className="
                      font-sans
                      text-[14px]
                      text-[#ca6480]
                    "
                  >
                    —
                  </span>
                </div>

                <h3
                  className="
                    font-sans
                    text-[18px]
                    font-medium
                    tracking-[-0.03em]
                    text-[#472332]
                  "
                >
                  No encontramos resultados.
                </h3>

                <p
                  className="
                    mt-2
                    max-w-[330px]
                    font-sans
                    text-[12px]
                    leading-[1.6]
                    text-[#472332]/45
                  "
                >
                  Prueba con otra búsqueda o selecciona una categoría diferente.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("Todas");
                    setSearchQuery("");
                  }}
                  className="
                    mt-6
                    font-sans
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#ca6480]
                    transition-colors
                    duration-300
                    hover:text-[#472332]
                  "
                >
                  Ver todos los trabajos
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ================================================================== */}
      {/* FOOTER                                                            */}
      {/* ================================================================== */}

      <Footer footer={landing?.footer} />

      {/* ================================================================== */}
      {/* LIGHTBOX                                                          */}
      {/* ================================================================== */}

      <PortfolioLightbox
        items={filteredItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
