import { useState, useMemo } from "react";
import type { PortfolioCategory } from "./types";
import { Banner } from "./components/Banner";
import { PortfolioFilters } from "./components/Filters";
import { PortfolioSearchBar } from "./components/SearchBar";
import { PortfolioGrid } from "./components/PortfolioGrid";
import { PortfolioLightbox } from "./components/PortfolioLightbox";
import { WhatsAppBanner } from "./components/WhatsAppBanner";
import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";
import { usePublicContent } from "../domains/content/hooks/usePublicContent";
import { useQuery } from "@tanstack/react-query";
import { supabaseAny as supabase } from "../lib/supabase";

export default function PortfolioPage() {
  const { data: dbItems = [] } = useQuery({
    queryKey: ['public_portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_projects')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });
      if (error) throw new Error(error.message);
      
      // Mapear los datos de Supabase a la estructura que espera el PortfolioGrid
      return (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        image: p.image_url,
        featured: p.is_favorite,
        description: p.description || '',
        serviceType: p.category, // fallback for search
        order: p.display_order,
        createdAt: p.created_at
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
  const { models } = usePublicContent();
  const landing = models?.landing;

  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filtrado en tiempo real
  const filteredItems = useMemo(() => {
    return dbItems.filter((item: any) => {
      // 1. Filtro por categoría
      if (activeCategory !== "Todas" && item.category !== activeCategory) {
        return false;
      }
      
      // 2. Filtro por búsqueda
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchService = item.serviceType.toLowerCase().includes(query);
        const matchCategory = item.category.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        
        if (!matchTitle && !matchService && !matchCategory && !matchDesc) {
          return false;
        }
      }
      
      return true;
    }).sort((a: any, b: any) => a.order - b.order); // Mantener el orden curado
  }, [activeCategory, searchQuery, dbItems]);

  return (
    <div className="min-h-screen bg-[rgb(255,252,251)] font-sans text-[rgb(74,36,50)]">
      {/* Navbar de la Landing para consistencia */}
      <Navbar navbar={landing?.navbar} />

      {/* Banner Elegante (reemplaza al Hero gigante) */}
      <Banner />
      
      <section className="w-full py-16 lg:py-24 relative overflow-hidden">
        {/* Glows Decorativos de Fondo */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(198,130,145,0.06)_0%,transparent_60%)] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(218,150,165,0.04)_0%,transparent_60%)] translate-x-1/3 pointer-events-none" />
        
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
          
          {/* Cabecera del Grid (Estilo Beauty Studio) */}
          <div className="w-full mb-12">
            <div className="mb-8 text-center md:text-left">
              <h2 className="font-display text-3xl md:text-4xl text-[rgb(74,36,50)] font-light tracking-tight mb-2">
                Explora por <em className="italic text-[rgb(198,130,145)]">categoría</em>
              </h2>
              <p className="font-sans text-[13px] md:text-[14px] text-[rgba(74,36,50,0.6)] font-medium">
                Encuentra inspiración para cada ocasión.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="w-full lg:w-auto">
                <PortfolioFilters 
                  activeCategory={activeCategory} 
                  onCategoryChange={setActiveCategory} 
                />
              </div>
              <div className="w-full lg:w-72 shrink-0">
                <PortfolioSearchBar 
                  searchQuery={searchQuery} 
                  onSearchChange={setSearchQuery} 
                />
              </div>
            </div>
          </div>

          {/* Grid de Resultados Simétrico */}
          {filteredItems.length > 0 ? (
            <PortfolioGrid 
              items={filteredItems} 
              onItemClick={(item) => {
                const idx = filteredItems.findIndex((i: any) => i.id === item.id);
                setLightboxIndex(idx);
              }} 
            />
          ) : (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-[rgba(198,130,145,0.1)] shadow-[0_4px_24px_rgba(198,130,145,0.05)]">
              <span className="text-3xl mb-4">✨</span>
              <h3 className="font-display text-2xl mb-2 text-[rgb(74,36,50)]">
                No encontramos estilos
              </h3>
              <p className="text-[13px] text-[rgba(74,36,50,0.6)]">
                Intenta buscar con otros términos o cambia la categoría.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Banner Femenino de WhatsApp para Conversión */}
      <WhatsAppBanner />

      {/* Footer de la Landing */}
      <Footer footer={landing?.footer} />

      {/* Lightbox inmersivo espectacular */}
      <PortfolioLightbox 
        items={filteredItems}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
