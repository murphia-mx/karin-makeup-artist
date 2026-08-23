export interface PortfolioItem {
  id: string;
  title: string;
  category: "Novias" | "Social" | "XV Años" | "Graduación" | "Editorial" | "Artístico" | "Peinados";
  image: string;
  thumbnail?: string;
  featured: boolean;
  description: string;
  serviceType: string;
  duration: string;
  productsUsed?: string[];
  order: number;
  createdAt: string;
}

export type PortfolioCategory = "Todas" | "Novias" | "Social" | "XV Años" | "Graduación" | "Editorial" | "Artístico" | "Peinados";
