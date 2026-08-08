import type { PortfolioItem } from "../types";

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: "p_1",
    title: "Sofía & Andrés",
    category: "Novias",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=85&w=1200&auto=format&fit=crop",
    featured: true,
    description: "Un look nupcial clásico enfocado en resaltar la luminosidad natural de la piel. Larga duración diseñada para resistir emociones intensas y más de 12 horas de celebración continua.",
    serviceType: "Maquillaje de Novia",
    duration: "210 min",
    productsUsed: ["Dior Backstage Foundation", "Charlotte Tilbury Flawless Filter", "Huda Beauty Nude Palette"],
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "p_2",
    title: "Gala de Noche",
    category: "Social",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=85&w=1200&auto=format&fit=crop",
    featured: true,
    description: "Maquillaje de noche con protagonismo en la mirada. Smokey eyes sutil en tonos tierra y labios nude para un equilibrio perfecto y sofisticado.",
    serviceType: "Maquillaje Social",
    duration: "120 min",
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "p_3",
    title: "Sesión XV Años",
    category: "XV Años",
    image: "https://images.unsplash.com/photo-1629814696209-4f4faf2ab874?q=85&w=1200&auto=format&fit=crop",
    featured: false,
    description: "Un maquillaje fresco, juvenil y luminoso, diseñado específicamente para fotografía en exteriores y luz natural.",
    serviceType: "Maquillaje para Sesión XV",
    duration: "180 min",
    order: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: "p_4",
    title: "Portada Editorial",
    category: "Editorial",
    image: "https://images.unsplash.com/photo-1512496015851-a1cbfd383921?q=85&w=1200&auto=format&fit=crop",
    featured: true,
    description: "Trabajo conceptual de alta costura para luces de estudio. Piel extremadamente jugosa y labios definidos con alta saturación.",
    serviceType: "Maquillaje Editorial",
    duration: "150 min",
    order: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: "p_5",
    title: "Graduación Elegante",
    category: "Graduación",
    image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=85&w=1200&auto=format&fit=crop",
    featured: false,
    description: "Soft glam resistente para disfrutar toda la noche. Piel perfecta, contorno suave y fijación absoluta.",
    serviceType: "Maquillaje para Graduación",
    duration: "120 min",
    order: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: "p_6",
    title: "Social Glamour",
    category: "Social",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=85&w=1200&auto=format&fit=crop",
    featured: false,
    description: "Piel aterciopelada y delineado gráfico para un look contemporáneo, ideal para eventos de etiqueta.",
    serviceType: "Maquillaje Social",
    duration: "120 min",
    order: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: "p_7",
    title: "Novia Romántica",
    category: "Novias",
    image: "https://images.unsplash.com/photo-1526413232644-8a40f4110398?q=85&w=1200&auto=format&fit=crop",
    featured: true,
    description: "Estilos suaves y románticos, con tonos rosados y champagne que resaltan la delicadeza facial.",
    serviceType: "Maquillaje de Novia",
    duration: "210 min",
    order: 7,
    createdAt: new Date().toISOString()
  },
  {
    id: "p_8",
    title: "Caracterización",
    category: "Artístico",
    image: "https://images.unsplash.com/photo-1509631179647-0c91af23f733?q=85&w=1200&auto=format&fit=crop",
    featured: false,
    description: "Maquillaje artístico con aplicaciones y pedrería para eventos temáticos o proyectos creativos especiales.",
    serviceType: "Maquillaje Artístico",
    duration: "220 min",
    order: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: "p_9",
    title: "Editorial Beauty",
    category: "Editorial",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=85&w=1200&auto=format&fit=crop",
    featured: false,
    description: "Texturas hiperrealistas y piel brillante. Diseño orientado completamente al impacto visual fotográfico.",
    serviceType: "Sesión Fotográfica",
    duration: "150 min",
    order: 9,
    createdAt: new Date().toISOString()
  }
];
