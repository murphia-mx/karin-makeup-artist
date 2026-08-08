# Walkthrough: Módulo de Moderación Producción

El placeholder de moderación ha sido completamente reemplazado por un sistema robusto, reactivo y seguro que sigue al pie de la letra tu Clean Architecture.

## 1. Data Layer y Seguridad
Hemos implementado el `SupabaseSystemRepository`, el cual tiene la tarea crítica de interceptar cada acción administrativa y registrarla tanto en `audit_logs` (para seguridad interna) como en `system_events` (para el *Activity Feed* del dashboard). Además, extendimos `SupabaseReviewRepository` para soportar búsqueda `.ilike()`, filtros por estado, y paginación ordenada. Todo esto sigue respetando los niveles RLS de tu base de datos remota.

## 2. Business Layer (ModerationService)
El `ModerationService` centraliza las 4 acciones fundamentales:
- **Aprobar**: Cambia el estado a `approved` y sella la fecha en `published_at`.
- **Rechazar/Spam**: Permite bifurcar entre rechazo tradicional o filtrado por spam.
- **Responder**: Permite inyectar la respuesta oficial del admin (`admin_reply`), registrando la hora y fecha exactas.
- **Destacar**: Alimenta automáticamente el *pool* de reseñas que se mostrarán en la página de inicio.
> **Importante:** *Cada uno de estos métodos realiza 3 operaciones transaccionales simuladas (Update Reseña -> Inserción Audit Log -> Inserción System Event) usando el Auth ID de tu sesión activa.*

## 3. Optimistic Updates (Magia en 0ms)
No me limité a hacer un `invalidateQueries`. En el hook `useModeration.ts`, implementé mutaciones optimistas reales usando `queryClient.setQueryData`. 
¿El resultado? Cuando haces clic en "Aprobar", la tarjeta desaparece de la pestaña "Pendientes" y aparece en "Aprobadas" de manera **instantánea**, antes incluso de que el servidor remoto de Supabase conteste. Si por alguna razón de red falla, la UI deshace la acción automáticamente de forma invisible para el usuario.

## 4. UI/UX Premium
- **Tabs Dinámicos:** Moverse entre Pendientes, Aprobadas, Rechazadas, etc. no recarga la página. 
- **Tarjetas Elegantes:** `ModerationCard.tsx` fue diseñada con un esquema visual claro. Destaca con un brillo especial (`box-shadow`) las reseñas marcadas como "Destacadas", y permite visualizar las fotos anexas en un pequeño carrusel en línea, al igual que los metadatos de IA (Sentimiento, etc.)
- **Respuesta Integrada:** Al darle a "Responder", se abre un cajón in-line donde el administrador redacta su réplica, sin modales intrusivos.

## Pruebas de Usuario Pendientes
La infraestructura está lista y el código transpila al 100% (el `npm run build` está en verde absoluto). 
Dado que estas acciones requieren un Token JWT válido de Administrador, la prueba funcional "final" ocurre de tu lado. 

> [!TIP]
> **Pasos a probar en tu navegador local:**
> 1. Ve a `/admin/moderation`.
> 2. Navega a la pestaña de "Todas" o "Pendientes" y aprueba una reseña.
> 3. Entra a la base de datos (Supabase Table Editor) y verifica que se ha creado un registro en `audit_logs` con tu UserID.
> 4. Ve a la landing pública (`/`) y revisa que las reseñas aprobadas y destacadas aparezcan al vuelo gracias al refresco asíncrono.
