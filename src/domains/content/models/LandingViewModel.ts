import type { ServiceExtended } from '../../workspace/types/WorkspaceEntities';

export interface HeroModel {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: {
    text: string;
    actionUrl: string;
  };
  badge?: string;
  rating: number;
  reviewCount: number;
}

export interface NavbarModel {
  logo: string | null;
  businessName: string;
  businessSubtitle: string;
  cta: {
    text: string;
    actionUrl: string;
  };
}

export interface FooterModel {
  businessName: string;
  businessDescription: string;
  social: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  contact: {
    email: string;
    address: string;
    hours: string;
  };
  copyrightText: string;
}

export interface CtaModel {
  eyebrow: string;
  titlePart1: string;
  titlePart2: string; // The italic part
  description: string;
  buttonText: string;
  actionUrl: string;
  image: string;
  isVisible: boolean;
}

export interface ServicesModel {
  eyebrow: string;
  title: string;
  italicWord: string;
  description: string;
  items: ServiceExtended[];
  isVisible: boolean;
}

export interface GalleryModel {
  images: { url: string; alt: string; category?: string }[];
  isVisible: boolean;
}

export interface FaqModel {
  items: { question: string; answer: string }[];
  isVisible: boolean;
}

export interface TestimonialsModel {
  eyebrow: string;
  title: string;
  italicWord: string;
  featuredReviews: any[];
  allReviews: any[];
  isVisible: boolean;
}

export interface LandingViewModel {
  hero: HeroModel;
  navbar: NavbarModel;
  footer: FooterModel;
  cta: CtaModel;
  services: ServicesModel;
  gallery: GalleryModel;
  faq: FaqModel;
  testimonials: TestimonialsModel;
}
