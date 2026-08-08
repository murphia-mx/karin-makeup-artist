# Implementación del Módulo de Moderación

## 1. Repositorios y Modelos (Data Layer)
- `[x]` Crear `src/domains/admin/repositories/ISystemRepository.ts`
- `[x]` Crear `src/domains/admin/repositories/SupabaseSystemRepository.ts`
- `[x]` Extender `SupabaseReviewRepository.ts` con queries de paginación/filtros (`getModerationReviews`).
- `[x]` Verificar `database.types.ts` para `audit_logs` y `system_events`.

## 2. Lógica de Negocio (Business Layer)
- `[x]` Crear `src/domains/moderation/services/ModerationService.ts`
  - `[x]` `approveReview`
  - `[x]` `rejectReview`
  - `[x]` `replyToReview`
  - `[x]` `toggleFeaturedStatus`
  - `[x]` Integración automática con `audit_logs` y `system_events`.

## 3. Estado Local y Sincronización (React Query)
- `[x]` Crear `src/domains/moderation/hooks/useModerationQuery.ts` (Listado con filtros y paginación)
- `[x]` Crear `src/domains/moderation/hooks/useModeration.ts` (Mutaciones Optimistic UI puras vía `setQueryData`).

## 4. Componentes UI y Vistas
- `[x]` Eliminar placeholder en `App.tsx` y rutear a `ModerationView.tsx`.
- `[x]` Crear `ModerationView.tsx` (Layout, Tabs, Search, Filters).
- `[x]` Crear `ModerationCard.tsx` (Card premium con info detallada y botones de acción).
- `[x]` Crear `ModerationHeader.tsx` (Filtros y buscador integrados).

## 5. Auditoría y UX
- `[x]` Garantizar Skeletons (`DashboardSkeleton` reutilizado temporalmente para unificar).
- `[x]` Botones deshabilitados durante mutación (A través de la prop `isPending` de las mutaciones).
- `[x]` Toasts de éxito y error implementados con Sonner.
- `[x]` Invalidación selectiva de queries y Optmistic UI.

## 6. Pruebas y Validación E2E
- `[x]` `npm run build` sin errores TypeScript.
- `[x]` Corregir `LogContext` y tipado de `system_events` (Resuelto con casteos correctos para Supabase).
- `[x]` Validar estructura de Auth (Delegado al usuario en navegador para token JWT).
