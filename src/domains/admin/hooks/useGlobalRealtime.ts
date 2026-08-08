import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/observability/logger';
import { toast } from 'sonner';

// Debounce helper to prevent query invalidation storms
const useDebouncedInvalidate = () => {
  const queryClient = useQueryClient();
  const timeouts = useRef<Record<string, number | ReturnType<typeof setTimeout>>>({});

  return (queryKey: string[], delay: number = 300) => {
    const keyStr = JSON.stringify(queryKey);
    if (timeouts.current[keyStr]) {
      clearTimeout(timeouts.current[keyStr]);
    }
    timeouts.current[keyStr] = setTimeout(() => {
      logger.info(`Invalidating query: ${keyStr}`, { domain: 'ADMIN', action: 'realtime_invalidate' });
      queryClient.invalidateQueries({ queryKey });
      delete timeouts.current[keyStr];
    }, delay);
  };
};

export const useGlobalRealtime = () => {
  const queryClient = useQueryClient();
  const invalidate = useDebouncedInvalidate();

  useEffect(() => {
    const logCtx = { domain: 'ADMIN' as const, action: 'global_realtime_sync' };
    logger.info('Initializing Global Realtime Subscription', logCtx);

    const channel = supabase.channel('global-admin-changes')
      // 1. REVIEWS TABLE
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        (payload) => {
          logger.info('Realtime event: reviews', { ...logCtx, metadata: { payload } });
          
          if (payload.eventType === 'INSERT') {
            const clientName = (payload.new as any).client_name || 'Alguien';
            toast.success(`✨ ¡Nueva reseña de ${clientName}!`, {
              description: 'El tablero se ha actualizado automáticamente.',
              position: 'top-center'
            });
          }

          invalidate(['pendingReviews']);
          invalidate(['publicReviews']);
          invalidate(['dashboardKPIs']);
          invalidate(['ai-advisor', 'latest']);
          invalidate(['ai-executive-metrics']);
          invalidate(['ai-health-metrics']);
          invalidate(['recentActivity']);
        }
      )
      // 2. AI ADVISOR REPORTS TABLE
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_advisor_reports' },
        (payload) => {
          logger.info('Realtime event: ai_advisor_reports', { ...logCtx, metadata: { payload } });
          invalidate(['ai-advisor', 'latest']);
          invalidate(['recentActivity']);
        }
      )
      // 3. AI ANALYSIS TABLE
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_analysis' },
        (payload) => {
          logger.info('Realtime event: ai_analysis', { ...logCtx, metadata: { payload } });
          invalidate(['ai-health-metrics']);
          invalidate(['ai-executive-metrics']);
          invalidate(['recentActivity']);
        }
      )
      // 4. SYSTEM EVENTS TABLE
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_events' },
        (payload) => {
          logger.info('Realtime event: system_events', { ...logCtx, metadata: { payload } });
          invalidate(['recentActivity']);
        }
      )
      // 5. WORKSPACE CONFIG TABLE
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workspace_config' },
        (payload) => {
          logger.info('Realtime event: workspace_config', { ...logCtx, metadata: { payload } });
          invalidate(['workspace', 'config']);
        }
      )
      // 6. LANDING CONFIG TABLE
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'landing_config' },
        (payload) => {
          logger.info('Realtime event: landing_config', { ...logCtx, metadata: { payload } });
          invalidate(['landing', 'published']);
          invalidate(['landing', 'draft']);
        }
      )
      // 7. SERVICES TABLE (for workspace services view)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        (payload) => {
          logger.info('Realtime event: services', { ...logCtx, metadata: { payload } });
          invalidate(['workspace', 'services']);
        }
      )
      // CONNECTION STATE
      .subscribe((status) => {
        logger.info(`Realtime subscription status: ${status}`, logCtx);
        if (status === 'SUBSCRIBED') {
          // Si nos reconectamos después de una pérdida de red, revalidar todo suavemente
          queryClient.invalidateQueries();
        }
      });

    return () => {
      logger.info('Cleaning up Global Realtime Subscription', logCtx);
      supabase.removeChannel(channel);
    };
  }, [queryClient, invalidate]);
};
