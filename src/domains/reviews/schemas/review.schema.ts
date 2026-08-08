import { z } from 'zod';
import { reviewsConfig } from '../../../config/reviews.config';

// Expresión regular para validar que el texto contenga al menos algunas letras o números reales (evita "...", "   ", etc.)
const hasMeaningfulText = /[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]{2,}/;
const invalidPatterns = /^(id=|<script>|http|www)/i;

export const reviewSchema = z.object({
  service_id: z.string().uuid('Por favor, selecciona un servicio válido'),
  rating: z.number().min(1, 'Por favor, califica tu experiencia').max(5),
  review: z
    .string()
    .transform(val => val.trim().replace(/\s+/g, ' ')) // Limpia espacios repetidos y bordes
    .refine(val => hasMeaningfulText.test(val), { message: 'Por favor, escribe un testimonio válido' })
    .refine(val => !invalidPatterns.test(val), { message: 'El contenido no parece válido' })
    .pipe(
      z.string()
        .min(reviewsConfig.validation.minReviewLength, `Por favor cuéntanos un poco más (mínimo ${reviewsConfig.validation.minReviewLength} caracteres)`)
        .max(reviewsConfig.validation.maxReviewLength, `El texto es demasiado largo (máximo ${reviewsConfig.validation.maxReviewLength} caracteres)`)
    ),
  photo_url: z.string().optional().nullable(),
  client_name: z
    .string()
    .transform(val => val.trim().replace(/\s+/g, ' '))
    .refine(val => hasMeaningfulText.test(val), { message: 'Nombre inválido' })
    .pipe(
      z.string()
        .min(2, 'Por favor ingresa tu nombre')
        .max(reviewsConfig.validation.maxNameLength, 'El nombre es demasiado largo')
    ),
  city: z.string().optional().nullable(),
  invitation_id: z.string().optional().nullable(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
