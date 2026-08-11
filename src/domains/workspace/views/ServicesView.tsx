import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, GripVertical, Star, Copy, Power,
  Image as ImageIcon, Trash2, Upload, Edit2, X
} from 'lucide-react';
import { REVIEW_STATUS } from '../../reviews/types/Review';
import { supabaseAny as supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import type { ServiceExtended } from '../types/WorkspaceEntities';

// Hook de servicios con stats
const useServicesWithStats = () => {
  return useQuery({
    queryKey: ['workspace', 'services'],
    queryFn: async (): Promise<ServiceExtended[]> => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          id, name, slug, short_name, description, short_description, price_from, duration_minutes,
          category, show_in_landing, accepts_bookings, active, display_order, cover_image,
          landing_title_top, landing_title_bottom, features,
          reviews!service_id(
            rating,
            status
          )
        `)
        .order('display_order', { ascending: true });

      if (error) throw new Error(error.message);

      return (data || []).map((s: any) => {
        const approvedReviews = (s.reviews || []).filter((r: any) => r.status === REVIEW_STATUS.APPROVED);
        const avgRating = approvedReviews.length
          ? approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / approvedReviews.length
          : 0;

        return {
          ...s,
          reviews: undefined,
          _stats: {
            review_count: approvedReviews.length,
            average_rating: Math.round(avgRating * 10) / 10,
            is_top_rated: avgRating >= 4.8 && approvedReviews.length >= 3,
          },
        } as ServiceExtended;
      });
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Chip de estado
const ServiceStatusBadge = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase ${
    active ? 'bg-admin-accent-soft/30 text-admin-accent-dark border border-admin-accent-soft/50' : 'bg-admin-surface-2 text-admin-text-muted border border-admin-neutral/40'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-admin-accent-dark' : 'bg-admin-text-muted/50'}`} />
    {active ? 'Activo' : 'Oculto'}
  </span>
);

// Tarjeta de servicio
const ServiceCard = ({ service, onEdit }: { service: ServiceExtended; onEdit: (s: ServiceExtended) => void }) => {
  const queryClient = useQueryClient();

  const toggleActive = async () => {
    const newActive = !service.active;
    const { error } = await supabase
      .from('services')
      .update({ active: newActive, show_in_landing: newActive } as unknown as Record<string, unknown>)
      .eq('id', service.id);
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['landing_services'] });
      toast.success(newActive ? 'Servicio activado' : 'Servicio ocultado');
    }
  };

  const duplicate = async () => {
    const { error } = await supabase
      .from('services')
      .insert({
        name: `${service.name} (copia)`,
        slug: `${service.slug}-copy-${Date.now()}`,
        description: service.description,
        short_description: service.short_description,
        category: service.category,
        price_from: service.price_from,
        duration_minutes: service.duration_minutes,
        landing_title_top: service.landing_title_top,
        landing_title_bottom: service.landing_title_bottom,
        cover_image: service.cover_image,
        features: service.features,
        show_in_landing: false,
        accepts_bookings: service.accepts_bookings,
        active: false,
        display_order: service.display_order + 1,
      } as unknown as Record<string, unknown>);
    if (error) {
      toast.error(`Error al duplicar: ${error.message}`);
    } else {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
      toast.success('Servicio duplicado');
    }
  };

  const handleDelete = async () => {
    const confirmHard = window.confirm("¿Eliminar servicio?\n\nEsta acción eliminará este servicio permanentemente. Las invitaciones y reseñas históricas relacionadas no deben romperse.");
    if (!confirmHard) {
      return;
    }

    try {
      // Validar claves foráneas reales
      const { count: reviewCount } = await supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('service_id', service.id);
      const { count: invCount } = await supabase.from('review_invitations').select('id', { count: 'exact', head: true }).eq('service_id', service.id);
      
      let bkCount = 0;
      try {
        const { count } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('service_id', service.id);
        bkCount = count || 0;
      } catch (e) { /* ignore */ }

      if ((reviewCount && reviewCount > 0) || (invCount && invCount > 0) || bkCount > 0) {
        const hide = window.confirm("Este servicio tiene información histórica asociada (reseñas, invitaciones o reservas) y no puede eliminarse permanentemente.\n\n¿Deseas ocultarlo para retirarlo de la Landing?");
        if (hide) {
          await supabase.from('services').update({ active: false, show_in_landing: false } as unknown as Record<string, unknown>).eq('id', service.id);
          toast.success("Servicio ocultado exitosamente");
          queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
          queryClient.invalidateQueries({ queryKey: ['landing_services'] });
        }
        return;
      }

      // Si no hay dependencias, eliminar físicamente
      const { error } = await supabase.from('services').delete().eq('id', service.id);
      if (error) throw error;
      
      toast.success("Servicio eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['landing_services'] });
    } catch (err: any) {
      toast.error(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <motion.div
      layout
      className="bg-admin-surface rounded-2xl border border-admin-neutral/40 p-5 sm:p-6 shadow-[0_4px_20px_rgba(45,32,37,0.03)] hover:border-admin-neutral hover:shadow-[0_8px_30px_rgba(45,32,37,0.08)] transition-all duration-300 group"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Drag handle (visual) */}
          <div className="cursor-grab opacity-30 md:opacity-20 group-hover:opacity-60 transition-opacity p-2 -ml-2 active:scale-95 shrink-0">
            <GripVertical className="w-5 h-5 text-admin-text-muted" strokeWidth={1.5} />
          </div>
          <div className="md:hidden">
            <ServiceStatusBadge active={service.active} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[17px] font-bold text-admin-text tracking-tight">{service.name}</h3>
                {service._stats?.is_top_rated && (
                  <span className="text-[10px] font-bold tracking-[0.2em] px-2.5 py-1 rounded-full bg-[#FAF3D9]/50 text-[#B89B2B] border border-[#FAF3D9] uppercase flex items-center gap-1.5 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-[#B89B2B]" strokeWidth={1.5} /> Estrella
                  </span>
                )}
              </div>
              {service.short_description && (
                <p className="text-[14px] font-light text-admin-text-muted mt-1.5 line-clamp-2">
                  {service.short_description}
                </p>
              )}
            </div>
            <div className="hidden md:block">
              <ServiceStatusBadge active={service.active} />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-admin-text-muted font-light mt-3">
            {service.price_from && (
              <span className="font-medium text-admin-text">
                ${service.price_from.toLocaleString('es-MX')}
              </span>
            )}
            {service.duration_minutes && (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-admin-neutral" />
                {service.duration_minutes} min
              </span>
            )}
            {service._stats && service._stats.review_count > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-admin-neutral" />
                <Star className="w-3.5 h-3.5 text-admin-accent-dark fill-admin-accent-dark/20" strokeWidth={1.5} />
                <span className="font-medium text-admin-text">{service._stats.average_rating}</span>
                <span>({service._stats.review_count})</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions - ALWAYS VISIBLE */}
        <div className="flex items-center justify-between md:justify-end gap-2 mt-4 md:mt-0 md:ml-auto md:pl-4 shrink-0 border-t border-admin-border/50 md:border-t-0 md:border-l pt-4 md:pt-0">
          <button
            onClick={() => onEdit(service)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-admin-text/5 hover:bg-admin-text/10 text-[13px] font-bold text-admin-text transition-colors min-h-[44px] flex-1 md:flex-none"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" strokeWidth={2} />
            <span>Editar</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={duplicate}
              className="flex items-center justify-center w-[44px] h-[44px] rounded-xl hover:bg-admin-surface-2 text-admin-text-muted hover:text-admin-text transition-colors active:scale-95"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={toggleActive}
              className="flex items-center justify-center w-[44px] h-[44px] rounded-xl hover:bg-admin-surface-2 text-admin-text-muted hover:text-admin-text transition-colors active:scale-95"
              title={service.active ? 'Ocultar' : 'Mostrar'}
            >
              <Power className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center w-[44px] h-[44px] rounded-xl hover:bg-admin-error/10 text-admin-text-muted hover:text-admin-error transition-colors active:scale-95"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ServiceSlideOver = ({
  service,
  onClose,
}: {
  service: ServiceExtended | 'new';
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const isNew = service === 'new';
  const initial = isNew ? {} as Partial<ServiceExtended> : { ...(service as ServiceExtended) };

  const [form, setForm] = useState<Partial<ServiceExtended>>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Features state
  const [features, setFeatures] = useState<Array<{title: string, subtitle: string, icon: string}>>(() => {
    if (Array.isArray(initial.features)) return initial.features;
    if (typeof initial.features === 'string') {
      try { return JSON.parse(initial.features); } catch (e) { return []; }
    }
    return [];
  });

  const PREDEFINED_BENEFITS = [
    'Preparación de piel',
    'Productos de alta gama',
    'Fijación extra duración',
    'Acabado fotográfico HD',
    'Prueba previa',
    'Pestañas',
    'Kit de retoque',
    'Correcciones durante el servicio'
  ];

  const handlePasteBenefits = (e: React.ClipboardEvent<HTMLInputElement>, index?: number) => {
    const pastedText = e.clipboardData.getData('text');
    if (!pastedText.includes('\n')) return; // Allow normal paste if single line
    
    e.preventDefault();
    const lines = pastedText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length > 0) {
      const newFeatures = lines.map(line => ({ title: line, subtitle: '', icon: 'sparkle' }));
      const currentTitles = new Set(features.map(f => f.title.toLowerCase()));
      const uniqueNew = newFeatures.filter(f => !currentTitles.has(f.title.toLowerCase()));
      
      if (index !== undefined && features[index].title === '') {
        // Replace empty current input if pasting into it
        const nextFeatures = [...features];
        nextFeatures.splice(index, 1, ...uniqueNew);
        setFeatures(nextFeatures);
      } else {
        setFeatures([...features, ...uniqueNew]);
      }
    }
  };

  const addPredefined = (title: string) => {
    if (!features.some(f => f.title.toLowerCase() === title.toLowerCase())) {
      setFeatures([...features, { title, subtitle: '', icon: 'sparkle' }]);
    }
  };

  const addEmptyFeature = () => {
    setFeatures([...features, { title: '', subtitle: '', icon: 'sparkle' }]);
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newFeatures = [...features];
      [newFeatures[index - 1], newFeatures[index]] = [newFeatures[index], newFeatures[index - 1]];
      setFeatures(newFeatures);
    } else if (direction === 'down' && index < features.length - 1) {
      const newFeatures = [...features];
      [newFeatures[index + 1], newFeatures[index]] = [newFeatures[index], newFeatures[index + 1]];
      setFeatures(newFeatures);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(`services/${fileName}`, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(`services/${fileName}`);
        
      setForm(p => ({ ...p, cover_image: publicUrl }));
      toast.success('Imagen subida correctamente');
    } catch (err: any) {
      toast.error(`Error al subir imagen: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    const confirmHard = window.confirm("¿Estás seguro de eliminar este servicio de forma permanente?");
    if (!confirmHard) return;

    try {
      // Check dependencies
      const s = service as ServiceExtended;
      const { count: reviewCount } = await supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('service_id', s.id);
      const { count: invCount } = await supabase.from('review_invitations').select('id', { count: 'exact', head: true }).eq('service_id', s.id);
      
      let bkCount = 0;
      try {
        const { count } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('service_id', s.id);
        bkCount = count || 0;
      } catch (e) { /* ignore */ }

      if ((reviewCount && reviewCount > 0) || (invCount && invCount > 0) || bkCount > 0) {
        const hide = window.confirm("Este servicio tiene historial asociado (reseñas, invitaciones o reservas) y no puede eliminarse permanentemente. ¿Deseas desactivarlo (ocultarlo de la Landing) en su lugar?");
        if (hide) {
          await supabase.from('services').update({ active: false, show_in_landing: false } as unknown as Record<string, unknown>).eq('id', s.id);
          toast.success("Servicio ocultado exitosamente");
          queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
          queryClient.invalidateQueries({ queryKey: ['landing_services'] });
          onClose();
        }
        return;
      }

      const { error } = await supabase.from('services').delete().eq('id', s.id);
      if (error) throw error;
      
      toast.success("Servicio eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['landing_services'] });
      onClose();
    } catch (err: any) {
      toast.error(`Error al eliminar: ${err.message}`);
    }
  };

  const handleSave = async (createAnother = false) => {
    setIsSaving(true);
    try {

      if (isNew) {
        const { error } = await supabase.from('services').insert({
          name: form.name || 'Nuevo servicio',
          slug: (form.name || 'nuevo-servicio').toLowerCase().replace(/\s+/g, '-'),
          description: form.description,
          short_description: form.short_description,
          price_from: form.price_from,
          duration_minutes: form.duration_minutes,
          category: form.category || 'general',
          show_in_landing: form.show_in_landing ?? true,
          accepts_bookings: form.accepts_bookings ?? true,
          landing_title_top: form.landing_title_top,
          landing_title_bottom: form.landing_title_bottom,
          cover_image: form.cover_image,
          features: features,
          active: true,
          display_order: 999,
        } as unknown as Record<string, unknown>);
        if (error) throw error;
        toast.success('Servicio creado');
        
        queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
        queryClient.invalidateQueries({ queryKey: ['landing_services'] });
        
        if (createAnother) {
          setForm(p => ({ category: p.category })); // Mantener solo categoría
          setFeatures([]);
        } else {
          onClose();
        }
      } else {
        const s = service as ServiceExtended;
        const { error } = await supabase.from('services').update({
          name: form.name,
          description: form.description,
          short_description: form.short_description,
          price_from: form.price_from,
          duration_minutes: form.duration_minutes,
          category: form.category,
          show_in_landing: form.show_in_landing,
          accepts_bookings: form.accepts_bookings,
          landing_title_top: form.landing_title_top,
          landing_title_bottom: form.landing_title_bottom,
          cover_image: form.cover_image,
          features: features,
        } as unknown as Record<string, unknown>).eq('id', s.id);
        if (error) throw error;
        toast.success('Servicio actualizado');
        
        queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
        queryClient.invalidateQueries({ queryKey: ['landing_services'] });
        onClose();
      }
    } catch (err: any) {
      toast.error(`Error al guardar: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-5 py-4 bg-admin-surface-2 border border-admin-neutral/50 rounded-2xl text-[15px] font-light text-admin-text focus:outline-none focus:border-admin-accent-dark transition-colors placeholder:text-admin-text-muted/50 appearance-none";

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-admin-bg/40 backdrop-blur-md z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 h-[100dvh] w-full max-w-lg bg-admin-surface border-l border-admin-neutral/50 shadow-2xl z-[70] flex flex-col font-admin-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between pt-[max(1.5rem,env(safe-area-inset-top))] px-7 pb-4 border-b border-admin-neutral/40 shrink-0">
          <h2 className="text-2xl font-bold text-admin-text tracking-tight">
            {isNew ? 'Nuevo servicio' : 'Editar servicio'}
          </h2>
          <button onClick={onClose} className="p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-7 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div>
            <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Nombre interno</label>
            <input type="text" className={inputClass} value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="ej. Maquillaje de novia" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Título (Landing)</label>
              <input type="text" className={inputClass} value={form.landing_title_top || ''} onChange={e => setForm(p => ({ ...p, landing_title_top: e.target.value }))} placeholder="Maquillaje de" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Subtítulo (Landing)</label>
              <input type="text" className={inputClass} value={form.landing_title_bottom || ''} onChange={e => setForm(p => ({ ...p, landing_title_bottom: e.target.value }))} placeholder="Novia" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Descripción corta</label>
            <input type="text" className={inputClass} value={form.short_description || ''} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))} placeholder="Una línea que aparece en la landing" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Descripción completa</label>
            <textarea className={`${inputClass} resize-none`} rows={4} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe el servicio con detalle..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Precio desde ($)</label>
              <input type="number" className={inputClass} value={form.price_from || ''} onChange={e => setForm(p => ({ ...p, price_from: Number(e.target.value) }))} placeholder="800" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Duración (min)</label>
              <select className={inputClass} value={form.duration_minutes || ''} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))}>
                <option value="">Sin definir</option>
                <option value="30">30 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
                <option value="180">3 horas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Imagen de Portada</label>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
              {form.cover_image ? (
                <div className="relative group rounded-2xl overflow-hidden border border-admin-neutral/50 w-full sm:w-32 h-32 sm:h-20 flex-shrink-0">
                  <img src={form.cover_image} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setForm(p => ({ ...p, cover_image: '' }))} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full sm:w-32 h-32 sm:h-20 rounded-2xl border border-dashed border-admin-neutral/50 bg-admin-surface-2 flex flex-col items-center justify-center text-admin-text-muted flex-shrink-0">
                  <ImageIcon className="w-5 h-5 mb-1 opacity-50" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sin imagen</span>
                </div>
              )}
              
              <div className="flex-1 flex flex-col justify-center gap-2 h-auto sm:h-20 w-full">
                <label className="relative flex items-center justify-center gap-2 px-5 py-4 sm:py-3 bg-admin-surface-2 border border-admin-neutral/40 rounded-[1.25rem] text-[14px] text-admin-text font-medium hover:bg-admin-surface hover:border-admin-neutral cursor-pointer transition-colors shadow-sm">
                  {isUploading ? (
                    <span className="animate-pulse">Subiendo...</span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-admin-accent-dark" strokeWidth={1.5} />
                      Seleccionar imagen
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                </label>
                <p className="text-[11px] text-admin-text-muted/80 leading-tight">
                  Sube una imagen para la galería de la landing page.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">Lo que incluye</label>
              <p className="text-[12px] text-admin-text-muted/80 font-light">Agrega beneficios o pega una lista de texto con múltiples líneas.</p>
            </div>
            
            <div className="space-y-3 mb-5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3 group">
                  <div className="flex flex-col gap-1 opacity-100 sm:opacity-60 transition-opacity">
                    <button onClick={() => moveFeature(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-admin-surface-2 rounded-lg disabled:opacity-30 text-admin-text-muted transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => moveFeature(idx, 'down')} disabled={idx === features.length - 1} className="p-1 hover:bg-admin-surface-2 rounded-lg disabled:opacity-30 text-admin-text-muted transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  <input 
                    type="text"
                    className="flex-1 px-4 py-3 sm:py-3 bg-admin-surface-2 border border-admin-neutral/40 rounded-xl text-[14px] text-admin-text focus:outline-none focus:border-admin-accent-dark transition-all font-light min-w-0"
                    placeholder="Ej. Preparación de piel"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[idx].title = e.target.value;
                      setFeatures(newFeatures);
                    }}
                    onPaste={(e) => handlePasteBenefits(e, idx)}
                  />
                  <button
                    onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                    className="p-2 sm:p-2.5 text-admin-text-muted/50 hover:text-admin-error hover:bg-admin-error/5 rounded-xl transition-colors shrink-0"
                    title="Eliminar beneficio"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              
              {features.length === 0 && (
                <div className="text-center py-8 border border-dashed border-admin-neutral/50 rounded-2xl bg-admin-surface-2 text-admin-text-muted">
                  <p className="text-[14px] font-light">No hay beneficios agregados.</p>
                </div>
              )}
            </div>

            <button 
              onClick={addEmptyFeature}
              className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-3 sm:p-0 sm:bg-transparent bg-admin-surface-2 rounded-xl text-[12px] font-bold text-admin-accent-dark hover:text-admin-text uppercase tracking-widest transition-colors mb-5"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} /> Agregar beneficio
            </button>

            <div className="mt-5 pt-4 border-t border-admin-neutral/40">
              <span className="block text-[11px] font-bold text-admin-text-muted/70 mb-3 uppercase tracking-[0.15em]">Sugerencias rápidas</span>
              <div className="flex flex-wrap gap-2.5">
                {PREDEFINED_BENEFITS.map(title => {
                  const exists = features.some(f => f.title.toLowerCase() === title.toLowerCase());
                  if (exists) return null;
                  return (
                    <button
                      key={title}
                      onClick={() => addPredefined(title)}
                      className="px-3 py-1.5 text-[12px] font-medium bg-admin-surface-2 border border-admin-neutral/50 rounded-full text-admin-text-muted hover:border-admin-accent-dark hover:text-admin-accent-dark transition-colors"
                    >
                      + {title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">Categoría</label>
            <select className={inputClass} value={form.category || 'general'} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="general">General</option>
              <option value="novias">Novias</option>
              <option value="graduaciones">Graduaciones</option>
              <option value="social">Social</option>
              <option value="editorial">Editorial</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-3">
            {[
              { key: 'show_in_landing', label: 'Aparece en la landing' },
              { key: 'accepts_bookings', label: 'Acepta reservas' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-admin-neutral/40 last:border-0">
                <span className="text-[15px] text-admin-text font-medium">{label}</span>
                <button
                  onClick={() => setForm(p => ({ ...p, [key]: !(p as any)[key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${(form as any)[key] !== false ? 'bg-admin-accent-dark' : 'bg-admin-surface-2 border border-admin-neutral/50'}`}
                >
                  <span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${(form as any)[key] !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-7 border-t border-admin-neutral/40 bg-admin-surface mt-auto shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-3.5">
            {isNew ? (
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="w-full py-4 bg-admin-surface-2 border border-admin-neutral/50 text-admin-text text-[14px] font-medium rounded-[1.25rem] hover:bg-admin-surface hover:border-admin-neutral transition-colors disabled:opacity-50"
                >
                  {isSaving ? '...' : 'Guardar y otro'}
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="w-full py-4 bg-admin-text text-admin-bg text-[14px] font-medium rounded-[1.25rem] hover:bg-admin-accent-dark transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Crear'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="w-full py-4 bg-admin-text text-admin-bg text-[14px] font-medium rounded-[1.25rem] hover:bg-admin-accent-dark transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            )}
            
            {!isNew && (
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-transparent border border-admin-error/20 text-admin-error text-[14px] font-medium rounded-[1.25rem] hover:bg-admin-error/5 hover:border-admin-error/30 transition-colors"
              >
                Eliminar servicio
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Vista principal de Servicios
export const ServicesView = () => {
  const { data: services, isLoading } = useServicesWithStats();
  const [editingService, setEditingService] = useState<ServiceExtended | 'new' | null>(null);

  const active = services?.filter(s => s.active) || [];
  const hidden = services?.filter(s => !s.active) || [];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-admin-text tracking-tight">Servicios</h1>
          <p className="text-[14px] font-light text-admin-text-muted mt-1.5">
            {active.length} activo{active.length !== 1 ? 's' : ''}{hidden.length > 0 ? `, ${hidden.length} oculto${hidden.length !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button
          onClick={() => setEditingService('new')}
          className="flex items-center gap-2.5 px-5 py-3.5 bg-admin-text text-admin-bg text-[14px] font-medium rounded-[1.25rem] hover:bg-admin-accent-dark hover:shadow-[0_4px_16px_rgba(45,32,37,0.15)] transition-all"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          Nuevo servicio
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-admin-surface rounded-2xl border border-admin-neutral/40 p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {services?.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={setEditingService}
            />
          ))}
          {(!services || services.length === 0) && (
            <div className="text-center py-24 bg-admin-surface rounded-2xl border border-dashed border-admin-neutral/50 text-admin-text-muted">
              <Scissors className="w-10 h-10 mx-auto mb-4 opacity-50" />
              <p className="text-[16px] font-medium text-admin-text mb-1">Aún no tienes servicios</p>
              <p className="text-[14px] font-light">Crea tu primer servicio para que aparezca en tu landing.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {editingService !== null && (
          <ServiceSlideOver
            service={editingService}
            onClose={() => setEditingService(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Necesario para la referencia en ServiceCard
const Scissors = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 4.011m0 0l2.077-4.01M13.461 13.148a3 3 0 11-5.196 3 3 3 0 015.196-3z" />
  </svg>
);
