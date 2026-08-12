import type { WorkspaceConfig } from "../../workspace/types/WorkspaceConfig";
import type { LandingConfig } from "../../workspace/types/LandingConfig";
import type { ServiceExtended } from "../../workspace/types/WorkspaceEntities";
import type { LandingViewModel } from "../models/LandingViewModel";

export class LandingBuilder {
  static build(
    workspace: WorkspaceConfig,
    landing: LandingConfig,
    services: ServiceExtended[],
    gallery: { id: string; url: string; image: string; alt: string; category?: string; title?: string; description?: string }[],
    reviews: any[],
    metrics: { rating: number; reviewCount: number },
  ): LandingViewModel {
    // Intelligent Fallbacks
    const fallbackTitle = "Tu belleza en manos expertas.";
    const fallbackSubtitle =
      "Maquillaje profesional diseñado para resaltar tu esencia en cada momento especial.";
    const defaultCover =
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop";
    const activeServices = services.filter(
      (s) => s.active && s.show_in_landing,
    );
    const mainServiceCategory =
      activeServices.length > 0
        ? activeServices[0].category.toLowerCase()
        : "belleza";
    const fallbackDescription = `Especialista en ${mainServiceCategory} y cuidado de la piel. Trabajamos juntas para crear el look perfecto que te haga sentir segura y radiante.`;

    const galleryModel = {
      images: gallery,
      isVisible: gallery.length > 0 && landing.show_gallery,
    };

    // 1. Hero Model
    const hero = {
      title: landing.hero_title || workspace.business_name || fallbackTitle,
      subtitle: landing.hero_subtitle || workspace.tagline || fallbackSubtitle,
      description: workspace.short_description || fallbackDescription,
      image:
        landing.hero_image_url || workspace.cover_image_url || defaultCover,
      cta: {
        text: landing.hero_cta_text || "AGENDAR CITA",
        actionUrl: "/reservar",
      },
      badge: workspace.business_name || "Makeup Artist",
      rating: workspace.show_rating_landing ? metrics.rating : 5.0,
      reviewCount: workspace.show_review_count ? metrics.reviewCount : 0,
    };

    // 2. Navbar Model
    const navbar = {
      logo: workspace.logo_url,
      businessName: workspace.business_name || "Mi Negocio",
      businessSubtitle: workspace.tagline || "Makeup Artist",
      cta: {
        text: "AGENDAR CITA",
        actionUrl: "/reservar",
      },
    };

    // 3. Footer Model
    const footer = {
      businessName: workspace.business_name || "Mi Negocio",
      businessDescription: workspace.short_description || fallbackDescription,
      social: {
        whatsapp: workspace.whatsapp
          ? `https://wa.me/${workspace.whatsapp}`
          : "",
        instagram: workspace.instagram_handle
          ? `https://instagram.com/${workspace.instagram_handle}`
          : "",
        facebook: workspace.facebook_url || "",
        tiktok: workspace.tiktok_handle
          ? `https://tiktok.com/@${workspace.tiktok_handle}`
          : "",
      },
      contact: {
        email: "",
        address: workspace.address || "Ubicación no configurada",
        hours:
          workspace.schedule && Object.keys(workspace.schedule).length > 0
            ? Object.entries(workspace.schedule)
                .filter(([, data]) => data.active)
                .map(([day, data]) => `${day}: ${data.open} - ${data.close}`)
                .join(" | ")
            : "Con cita previa",
      },
      copyrightText:
        landing.footer_credits ||
        `© ${new Date().getFullYear()} ${workspace.business_name || "Mi Negocio"}. Todos los derechos reservados.`,
    };

    // 4. CTA Final Model
    const cta = {
      eyebrow: "+ Agenda tu cita",
      titlePart1: landing.cta_title
        ? landing.cta_title.split(" ")[0]
        : "¿Lista para sentirte",
      titlePart2:
        landing.cta_title && landing.cta_title.split(" ").length > 1
          ? landing.cta_title.split(" ").slice(1).join(" ")
          : "más hermosa que nunca?",
      description: workspace.short_description || fallbackDescription,
      buttonText: landing.cta_button_text || "Agendar mi cita",
      actionUrl: "/reservar",
      image: workspace.cover_image_url || defaultCover,
      isVisible: true, // Always show CTA, even without whatsapp, it directs to contact section
    };

    // 5. Services Model
    const servicesModel = {
      eyebrow: "Experiencias de autor",
      title: "Servicios de",
      italicWord: "Maquillaje",
      description: workspace.tagline || "Diseñados para ti",
      items: activeServices,
      isVisible: activeServices.length > 0 && landing.show_services,
    };

    // 6. FAQ Model
    const faqItems = landing.faq_items || [];
    const faq = {
      items: faqItems.map((item) => ({
        question: item.q,
        answer: item.a,
      })),
      isVisible: faqItems.length > 0 && landing.show_faq,
    };

    // 8. Testimonials Model
    const featuredReviews = reviews.filter((r) =>
      landing.featured_review_ids?.includes(r.id),
    );

    const testimonialsModel = {
      eyebrow: "CLIENTAS FELICES",
      title: "Lo que cuentan",
      italicWord: "de su experiencia.",
      featuredReviews:
        featuredReviews.length > 0
          ? featuredReviews
          : reviews.length > 0
            ? [reviews[0]]
            : [],
      allReviews: reviews, // Todas las reseñas aprobadas
      isVisible: reviews.length > 0 && landing.show_testimonials,
    };

    return {
      hero,
      navbar,
      footer,
      cta,
      services: servicesModel,
      gallery: galleryModel,
      faq,
      testimonials: testimonialsModel,
    };
  }
}
