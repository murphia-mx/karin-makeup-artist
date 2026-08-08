import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAny as supabase } from '../../../lib/supabase';
import { logger } from '../../../lib/observability/logger';
import { toast } from 'sonner';
import type { WorkspaceConfig, CompletionItem } from '../types/WorkspaceConfig';

const LOG = { domain: 'ADMIN' as const, action: 'workspace_config' };
const QUERY_KEY = ['workspace', 'config'] as const;

// -------------------------------------------------------
// QUERY: cargar la configuración
// -------------------------------------------------------
export const useWorkspaceConfig = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<WorkspaceConfig> => {
      const { data, error } = await supabase
        .from('workspace_config')
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return data as WorkspaceConfig;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// -------------------------------------------------------
// MUTATION: guardar cambios con snapshot para undo
// -------------------------------------------------------
export const useUpdateWorkspaceConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<WorkspaceConfig>) => {
      // Primero obtenemos el estado actual para guardarlo como snapshot (undo)
      const current = queryClient.getQueryData<WorkspaceConfig>(QUERY_KEY);
      if (!current) throw new Error('No config loaded');

      const { error } = await supabase
        .from('workspace_config')
        .update({
          ...(patch as Record<string, unknown>),
          previous_snapshot: current as unknown as Record<string, unknown>,
          snapshot_updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('id', current.id);

      if (error) throw new Error(error.message);
      logger.info('workspace_config updated', LOG);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: Error) => {
      logger.error(error, LOG);
      toast.error('No se pudo guardar el cambio');
    },
  });
};

// -------------------------------------------------------
// MUTATION: restaurar la versión anterior (undo)
// -------------------------------------------------------
export const useRestoreWorkspaceConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const current = queryClient.getQueryData<WorkspaceConfig>(QUERY_KEY);
      if (!current?.previous_snapshot) throw new Error('No hay versión anterior');

      const { error } = await supabase
        .from('workspace_config')
        .update({
          ...(current.previous_snapshot as unknown as Record<string, unknown>),
          previous_snapshot: null,
          snapshot_updated_at: null,
        } as Record<string, unknown>)
        .eq('id', current.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Versión anterior restaurada');
    },
    onError: (error: Error) => {
      logger.error(error, LOG);
      toast.error('No se pudo restaurar la versión anterior');
    },
  });
};

// -------------------------------------------------------
// HOOK DERIVADO: progreso de completitud del perfil
// -------------------------------------------------------
export const useWorkspaceCompletion = (config?: WorkspaceConfig): CompletionItem[] => {
  if (!config) return [];

  const items: CompletionItem[] = [
    { field: 'business_name',     label: 'Nombre del negocio',       href: '/admin/workspace/business', completed: !!config.business_name },
    { field: 'tagline',           label: 'Subtítulo',                 href: '/admin/workspace/business', completed: !!config.tagline },
    { field: 'short_description', label: 'Descripción corta',         href: '/admin/workspace/business', completed: !!config.short_description },
    { field: 'story',             label: 'Historia del negocio',      href: '/admin/workspace/business', completed: !!config.story },
    { field: 'logo_url',          label: 'Subir un logo',             href: '/admin/workspace/business', completed: !!config.logo_url },
    { field: 'cover_image_url',   label: 'Foto de portada',           href: '/admin/workspace/business', completed: !!config.cover_image_url },
    { field: 'whatsapp',          label: 'Número de WhatsApp',        href: '/admin/workspace/business', completed: !!config.whatsapp },
    { field: 'address',           label: 'Dirección del negocio',     href: '/admin/workspace/business', completed: !!config.address },
    { field: 'instagram_handle',  label: 'Agregar Instagram',         href: '/admin/workspace/business', completed: !!config.instagram_handle },
    { field: 'seo_title',         label: 'Título para Google',        href: '/admin/workspace/seo',      completed: !!config.seo_title },
    { field: 'seo_description',   label: 'Descripción para Google',   href: '/admin/workspace/seo',      completed: !!config.seo_description },
  ];

  return items;
};

export const computeCompletionPercent = (items: CompletionItem[]): number => {
  if (!items.length) return 0;
  return Math.round((items.filter(i => i.completed).length / items.length) * 100);
};
