// Placeholder views for remaining workspace sections
// These will be built out in subsequent phases

import { Construction } from 'lucide-react';

const PlaceholderView = ({ title, description }: { title: string; description: string }) => (
  <div className="max-w-2xl">
    <div className="mb-8">
      <h1 className="text-xl font-light text-[#3D2C2C]">{title}</h1>
      <p className="text-xs font-light text-[#7A6B67] mt-0.5">{description}</p>
    </div>
    <div className="bg-white rounded-[1.5rem] border border-dashed border-[#D99AA8]/30 p-16 text-center">
      <Construction className="w-8 h-8 mx-auto mb-3 text-[#C2B5B0]" />
      <p className="text-sm font-medium text-[#3D2C2C]">En construcción</p>
      <p className="text-xs font-light text-[#7A6B67] mt-1">Esta sección estará disponible próximamente.</p>
    </div>
  </div>
);

export const GalleryView = () => (
  <PlaceholderView title="Galería" description="Tus mejores trabajos, organizados por categoría" />
);

export const AppearanceView = () => (
  <PlaceholderView title="Apariencia" description="Tema claro u oscuro, colores de marca" />
);

export const PromotionsView = () => (
  <PlaceholderView title="Promociones" description="Crea y activa ofertas especiales" />
);

export const BookingsView = () => (
  <PlaceholderView title="Reservas" description="Horarios, descansos y disponibilidad" />
);

export const ReviewSettingsView = () => (
  <PlaceholderView title="Reseñas" description="Cómo se muestran las opiniones de tus clientes" />
);

export const SeoView = () => (
  <PlaceholderView title="SEO" description="Título, descripción e imagen para buscadores" />
);

export const DomainView = () => (
  <PlaceholderView title="Dominio" description="Conecta tu dominio personalizado" />
);
