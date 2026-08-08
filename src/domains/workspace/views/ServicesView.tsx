import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, GripVertical, Star, MoreHorizontal, Eye, Copy, Power 
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
          *,
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
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
    active ? 'bg-emerald-50 text-emerald-600' : 'bg-[#F3EDE8] text-[#7A6B67]'
  }`}>
    <span className={`w-1 h-1 rounded-full ${active ? 'bg-emerald-500' : 'bg-[#C2B5B0]'}`} />
    {active ? 'Activo' : 'Oculto'}
  </span>
);

// Tarjeta de servicio
const ServiceCard = ({ service, onEdit }: { service: ServiceExtended; onEdit: (s: ServiceExtended) => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const toggleActive = async () => {
    const { error } = await supabase
      .from('services')
      .update({ active: !service.active } as unknown as Record<string, unknown>)
      .eq('id', service.id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
      toast.success(service.active ? 'Servicio ocultado' : 'Servicio activado');
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
        active: false,
        display_order: service.display_order + 1,
      } as unknown as Record<string, unknown>);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
      toast.success('Servicio duplicado');
    }
    setMenuOpen(false);
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-[1.5rem] border border-[#EFE7E4] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_48px_rgba(61,44,44,0.06)] transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        {/* Drag handle (visual) */}
        <div className="mt-1 cursor-grab opacity-20 group-hover:opacity-60 transition-opacity">
          <GripVertical className="w-4 h-4 text-[#7A6B67]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-[#3D2C2C]">{service.name}</h3>
                {service._stats?.is_top_rated && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    ⭐ Estrella
                  </span>
                )}
              </div>
              {service.short_description && (
                <p className="text-xs font-light text-[#7A6B67] mt-0.5 line-clamp-1">
                  {service.short_description}
                </p>
              )}
            </div>
            <ServiceStatusBadge active={service.active} />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-[#7A6B67] font-light">
            {service.price_from && (
              <span className="font-medium text-[#3D2C2C]">
                ${service.price_from.toLocaleString('es-MX')}
              </span>
            )}
            {service.duration_minutes && (
              <span>{service.duration_minutes} min</span>
            )}
            {service._stats && service._stats.review_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{service._stats.average_rating}</span>
                <span className="text-[#C2B5B0]">({service._stats.review_count})</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(service)}
            className="p-2 rounded-lg hover:bg-[#FDFBFB] text-[#7A6B67] hover:text-[#3D2C2C] transition-colors"
            title="Editar"
          >
            <span className="text-xs">Editar</span>
          </button>

          {/* Context menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-[#FDFBFB] text-[#7A6B67] hover:text-[#3D2C2C] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-[#EFE7E4] shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-20 overflow-hidden"
                  >
                    <button
                      onClick={() => { onEdit(service); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#3D2C2C] hover:bg-[#FDFBFB] transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Editar
                    </button>
                    <button
                      onClick={duplicate}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#3D2C2C] hover:bg-[#FDFBFB] transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Duplicar
                    </button>
                    <div className="border-t border-[#EFE7E4]" />
                    <button
                      onClick={() => { toggleActive(); setMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#7A6B67] hover:bg-[#FDFBFB] transition-colors"
                    >
                      <Power className="w-3 h-3" />
                      {service.active ? 'Ocultar servicio' : 'Activar servicio'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Formulario de servicio en slide-over
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isNew) {
        await supabase.from('services').insert({
          name: form.name || 'Nuevo servicio',
          slug: (form.name || 'nuevo-servicio').toLowerCase().replace(/\s+/g, '-'),
          description: form.description,
          short_description: form.short_description,
          price_from: form.price_from,
          duration_minutes: form.duration_minutes,
          category: form.category || 'general',
          show_in_landing: form.show_in_landing ?? true,
          accepts_bookings: form.accepts_bookings ?? true,
          active: true,
          display_order: 999,
        } as unknown as Record<string, unknown>);
        toast.success('Servicio creado');
      } else {
        const s = service as ServiceExtended;
        await supabase.from('services').update({
          name: form.name,
          description: form.description,
          short_description: form.short_description,
          price_from: form.price_from,
          duration_minutes: form.duration_minutes,
          category: form.category,
          show_in_landing: form.show_in_landing,
          accepts_bookings: form.accepts_bookings,
        } as unknown as Record<string, unknown>).eq('id', s.id);
        toast.success('Servicio actualizado');
      }
      queryClient.invalidateQueries({ queryKey: ['workspace', 'services'] });
      onClose();
    } catch {
      toast.error('Error al guardar el servicio');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm text-[#3D2C2C] placeholder:text-[#C2B5B0] focus:outline-none focus:border-[#D99AA8]/60 focus:ring-2 focus:ring-[#D99AA8]/10 transition-all font-light";

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-[#EFE7E4] shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EFE7E4]">
          <h2 className="text-base font-medium text-[#3D2C2C]">
            {isNew ? 'Nuevo servicio' : 'Editar servicio'}
          </h2>
          <button onClick={onClose} className="text-sm text-[#7A6B67] hover:text-[#3D2C2C] transition-colors">
            Cancelar
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Nombre</label>
            <input type="text" className={inputClass} value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="ej. Maquillaje de novia" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Descripción corta</label>
            <input type="text" className={inputClass} value={form.short_description || ''} onChange={e => setForm(p => ({ ...p, short_description: e.target.value }))} placeholder="Una línea que aparece en la landing" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Descripción completa</label>
            <textarea className={`${inputClass} resize-none`} rows={4} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe el servicio con detalle..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Precio desde ($)</label>
              <input type="number" className={inputClass} value={form.price_from || ''} onChange={e => setForm(p => ({ ...p, price_from: Number(e.target.value) }))} placeholder="800" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Duración (min)</label>
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
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Categoría</label>
            <select className={inputClass} value={form.category || 'general'} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="general">General</option>
              <option value="novias">Novias</option>
              <option value="graduaciones">Graduaciones</option>
              <option value="social">Social</option>
              <option value="editorial">Editorial</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            {[
              { key: 'show_in_landing', label: 'Aparece en la landing' },
              { key: 'accepts_bookings', label: 'Acepta reservas' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-[#F3EDE8]">
                <span className="text-sm text-[#3D2C2C] font-light">{label}</span>
                <button
                  onClick={() => setForm(p => ({ ...p, [key]: !(p as any)[key] }))}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${(form as any)[key] !== false ? 'bg-[#D99AA8]' : 'bg-[#EFE7E4]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${(form as any)[key] !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#EFE7E4]">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-[#3D2C2C] text-white text-sm font-medium rounded-xl hover:bg-[#5A4A4A] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : isNew ? 'Crear servicio' : 'Guardar cambios'}
          </button>
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
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light text-[#3D2C2C]">Servicios</h1>
          <p className="text-xs font-light text-[#7A6B67] mt-0.5">
            {active.length} activo{active.length !== 1 ? 's' : ''}{hidden.length > 0 ? `, ${hidden.length} oculto${hidden.length !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button
          onClick={() => setEditingService('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3D2C2C] text-white text-sm font-medium rounded-xl hover:bg-[#5A4A4A] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-[#EFE7E4] p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {services?.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={setEditingService}
            />
          ))}
          {(!services || services.length === 0) && (
            <div className="text-center py-16 text-[#7A6B67] font-light">
              <Scissors className="w-8 h-8 mx-auto mb-3 text-[#C2B5B0]" />
              <p className="text-sm">Aún no tienes servicios.</p>
              <p className="text-xs mt-1">Crea tu primer servicio para que aparezca en tu landing.</p>
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
