import Navbar from "./Navbar";
import Hero from "./Hero";
import Services from "./Services";
import Gallery from "./Gallery";
import { ReviewsSection } from "../domains/reviews/components/ReviewsSection";
import CTA from "./CTA";
import Footer from "./Footer";
import { usePublicContent } from "../domains/content/hooks/usePublicContent";
import { Loader2 } from "lucide-react";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Landing() {
  const { models, isLoading, error } = usePublicContent();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150); // delay corto para asegurar que el DOM ha montado
    }
  }, [location]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-brand-bg flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <span className="mt-4 font-sans text-[10px] tracking-[0.3em] uppercase text-brand-text/50">
          Cargando Experiencia
        </span>
      </div>
    );
  }

  if (error || !models) {
    return (
      <div className="w-full min-h-screen bg-brand-bg flex flex-col items-center justify-center">
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-error">
          Error al cargar contenido
        </span>
      </div>
    );
  }

  const { landing } = models;

  return (
    <main className="bg-brand-bg text-brand-text selection:bg-brand-accent/30 min-h-[100dvh]">
      <Navbar navbar={landing.navbar} />
      <Hero hero={landing.hero} />
      <Services />
      <Gallery gallery={landing.gallery} />
      <ReviewsSection testimonials={landing.testimonials} />
      <CTA cta={landing.cta} />
      <Footer footer={landing.footer} />
    </main>
  );
}
