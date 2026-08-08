import type { WorkspaceConfig } from '../../workspace/types/WorkspaceConfig';
import type { LandingConfig } from '../../workspace/types/LandingConfig';
import type { ServiceExtended } from '../../workspace/types/WorkspaceEntities';
import type { ValidationModel } from '../models/ValidationModel';

export class ContentValidator {
  static validate(
    workspace: WorkspaceConfig,
    landing: LandingConfig,
    services: ServiceExtended[],
    metrics: { rating: number; reviewCount: number }
  ): ValidationModel {
    const passed: ValidationModel['passed'] = [];
    const missing: ValidationModel['missing'] = [];
    let seoScore = 0;
    let conversionScore = 0;
    let trustScore = 0;
    let completenessScore = 0;

    // 1. Completeness & Basic Identity
    if (workspace.business_name) {
      completenessScore += 25;
      passed.push({ id: 'name', label: 'Nombre del negocio configurado', impact: 25 });
    } else {
      missing.push({ id: 'name', label: 'Falta el nombre del negocio', action: 'Agrega el nombre en Mi Negocio', impact: 25 });
    }

    if (workspace.tagline) {
      completenessScore += 15;
      passed.push({ id: 'tagline', label: 'Subtítulo configurado', impact: 15 });
    } else {
      missing.push({ id: 'tagline', label: 'Falta un subtítulo atractivo', action: 'Agrega un subtítulo en Mi Negocio', impact: 15 });
    }

    if (workspace.short_description) {
      completenessScore += 20;
      seoScore += 20;
      passed.push({ id: 'description', label: 'Descripción corta configurada', impact: 20 });
    } else {
      missing.push({ id: 'description', label: 'Falta la descripción del negocio', action: 'Agrega una descripción para mejorar el SEO y dar contexto a la IA', impact: 20 });
    }

    if (workspace.logo_url && workspace.cover_image_url) {
      completenessScore += 40;
      trustScore += 20;
      passed.push({ id: 'images', label: 'Imágenes principales configuradas', impact: 40 });
    } else {
      missing.push({ id: 'images', label: 'Faltan imágenes principales (Logo/Portada)', action: 'Sube tu logo y portada en Mi Negocio', impact: 40 });
    }

    // 2. SEO
    if ((workspace as any).city) {
      seoScore += 30;
      passed.push({ id: 'city', label: 'Ciudad configurada (SEO Local)', impact: 30 });
    } else {
      missing.push({ id: 'city', label: 'Falta configurar la ciudad', action: 'Configura tu ciudad para aparecer en búsquedas locales', impact: 30 });
    }

    if (landing.show_faq && landing.faq_items && landing.faq_items.length > 0) {
      seoScore += 20;
      conversionScore += 10;
      passed.push({ id: 'faq', label: 'Preguntas Frecuentes activas', impact: 20 });
    } else {
      missing.push({ id: 'faq', label: 'No hay preguntas frecuentes', action: 'Agrega FAQ en la Landing para generar Schema markup', impact: 20 });
    }

    if (workspace.story) {
      seoScore += 30;
      passed.push({ id: 'story', label: 'Historia configurada', impact: 30 });
    } else {
      missing.push({ id: 'story', label: 'Falta la historia del negocio', action: 'Agrega tu historia para mejorar el SEO Semántico', impact: 30 });
    }

    // 3. Conversion
    if (workspace.whatsapp) {
      conversionScore += 40;
      passed.push({ id: 'whatsapp', label: 'WhatsApp configurado', impact: 40 });
    } else {
      missing.push({ id: 'whatsapp', label: 'Falta medio de contacto', action: 'Agrega tu número de WhatsApp para recibir citas', impact: 40 });
    }

    const activeServices = services.filter(s => s.active);
    if (activeServices.length > 0) {
      conversionScore += 30;
      passed.push({ id: 'services', label: `Servicios activos (${activeServices.length})`, impact: 30 });
    } else {
      missing.push({ id: 'services', label: 'No hay servicios configurados', action: 'Crea al menos un servicio para mostrar en la landing', impact: 30 });
    }

    if (landing.cta_title || landing.cta_button_text) {
      conversionScore += 20;
      passed.push({ id: 'cta', label: 'CTA Final configurado', impact: 20 });
    } else {
      missing.push({ id: 'cta', label: 'Falta llamado a la acción final', action: 'Configura el bloque CTA en la Landing', impact: 20 });
    }

    // 4. Trust
    if (metrics.reviewCount >= 3) {
      trustScore += 50;
      passed.push({ id: 'reviews', label: 'Suficientes reseñas para generar confianza', impact: 50 });
    } else {
      missing.push({ id: 'reviews', label: 'Pocas reseñas', action: 'Solicita más reseñas a tus clientas', impact: 50 });
    }

    if (workspace.instagram_handle) {
      trustScore += 30;
      passed.push({ id: 'social', label: 'Redes sociales vinculadas', impact: 30 });
    } else {
      missing.push({ id: 'social', label: 'Falta vincular Instagram', action: 'Agrega tu usuario de Instagram', impact: 30 });
    }

    // Aggregate score calculation
    const totalScore = Math.round(
      (completenessScore * 0.25) + 
      (seoScore * 0.25) + 
      (conversionScore * 0.30) + 
      (trustScore * 0.20)
    );

    return {
      score: Math.min(totalScore, 100),
      passed,
      missing,
      categories: {
        seo: Math.min(seoScore, 100),
        conversion: Math.min(conversionScore, 100),
        trust: Math.min(trustScore, 100),
        completeness: Math.min(completenessScore, 100)
      }
    };
  }
}
