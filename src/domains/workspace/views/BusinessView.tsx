import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, Phone, Clock, RotateCcw, Palette } from 'lucide-react';
import { useWorkspaceConfig, useUpdateWorkspaceConfig, useRestoreWorkspaceConfig } from '../hooks/useWorkspaceConfig';
import { useAutoSave } from '../hooks/useAutoSave';
import { SaveIndicator } from '../components/SaveIndicator';
import { BRAND_COLOR_PALETTE } from '../types/WorkspaceConfig';
import type { WorkspaceConfig } from '../types/WorkspaceConfig';

const DAYS = [
  { key: 'mon', label: 'Lunes' },
  { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' },
];

const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="bg-white rounded-[1.5rem] border border-[#EFE7E4] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
    <div className="flex items-center gap-2 mb-6">
      <Icon className="w-4 h-4 text-[#D99AA8]" />
      <h2 className="text-sm font-medium text-[#3D2C2C] uppercase tracking-wider">{title}</h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div>
    <label className="block text-xs font-medium text-[#7A6B67] mb-1.5 uppercase tracking-wider">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-[#C2B5B0] mt-1">{hint}</p>}
  </div>
);

const inputClass = "w-full px-3.5 py-2.5 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm text-[#3D2C2C] placeholder:text-[#C2B5B0] focus:outline-none focus:border-[#D99AA8]/60 focus:ring-2 focus:ring-[#D99AA8]/10 transition-all duration-200 font-light";

export const BusinessView = () => {
  const { data: config, isLoading } = useWorkspaceConfig();
  const updateMutation = useUpdateWorkspaceConfig();
  const restoreMutation = useRestoreWorkspaceConfig();
  const [localConfig, setLocalConfig] = useState<Partial<WorkspaceConfig>>({});

  const handleMutate = useCallback(
    async (patch: Partial<WorkspaceConfig>) => {
      await updateMutation.mutateAsync(patch);
    },
    [updateMutation]
  );

  const { save, saveImmediate, saveState, showUndo, setShowUndo } = useAutoSave(handleMutate);

  const current = { ...config, ...localConfig } as WorkspaceConfig;

  const handleChange = (field: keyof WorkspaceConfig, value: unknown) => {
    const patch = { [field]: value } as Partial<WorkspaceConfig>;
    setLocalConfig((prev: Partial<WorkspaceConfig>) => ({ ...prev, ...patch }));
    save(patch);
  };

  const handleToggle = (field: keyof WorkspaceConfig, value: unknown) => {
    const patch = { [field]: value } as Partial<WorkspaceConfig>;
    setLocalConfig((prev: Partial<WorkspaceConfig>) => ({ ...prev, ...patch }));
    saveImmediate(patch);
  };

  const handleScheduleChange = (dayKey: string, field: 'open' | 'close' | 'active', value: string | boolean) => {
    const newSchedule = {
      ...(current.schedule || {}),
      [dayKey]: {
        ...((current.schedule || {})[dayKey] || { open: '09:00', close: '18:00', active: true }),
        [field]: value,
      },
    };
    setLocalConfig((prev: Partial<WorkspaceConfig>) => ({ ...prev, schedule: newSchedule }));
    save({ schedule: newSchedule });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-[1.5rem] border border-[#EFE7E4] p-6 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header con SaveIndicator */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-light text-[#3D2C2C]">Mi Negocio</h1>
          <p className="text-xs font-light text-[#7A6B67] mt-0.5">Toda la información de tu negocio en un solo lugar</p>
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator state={saveState} />
          {/* Undo button */}
          <AnimatePresence>
            {showUndo && config?.previous_snapshot && (
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                onClick={() => {
                  restoreMutation.mutate();
                  setShowUndo(false);
                }}
                className="flex items-center gap-1.5 text-xs text-[#7A6B67] hover:text-[#3D2C2C] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Deshacer
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SECCIÓN: Identidad */}
      <Section title="Identidad" icon={Building2}>
        <Field label="Nombre del negocio">
          <input
            type="text"
            className={inputClass}
            defaultValue={current.business_name || ''}
            placeholder="ej. Karin Makeup Artist"
            onChange={e => handleChange('business_name', e.target.value)}
          />
        </Field>

        <Field label="Subtítulo" hint="Máximo 80 caracteres">
          <input
            type="text"
            className={inputClass}
            defaultValue={current.tagline || ''}
            placeholder="ej. Maquillaje profesional para momentos especiales"
            maxLength={80}
            onChange={e => handleChange('tagline', e.target.value)}
          />
        </Field>

        <Field label="Descripción corta" hint="Máximo 200 caracteres. Aparece en la sección principal.">
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            defaultValue={current.short_description || ''}
            placeholder="Cuéntales a tus clientas qué haces y por qué eres especial..."
            maxLength={200}
            onChange={e => handleChange('short_description', e.target.value)}
          />
        </Field>

        <Field label="Historia" hint="Puedes usar **negrita**, *cursiva* y - listas. Solo texto.">
          <textarea
            className={`${inputClass} resize-none`}
            rows={5}
            defaultValue={current.story || ''}
            placeholder="Comparte tu historia. ¿Cuándo empezaste? ¿Qué te apasiona del maquillaje?..."
            onChange={e => handleChange('story', e.target.value)}
          />
        </Field>
      </Section>

      {/* SECCIÓN: Contacto y Ubicación */}
      <Section title="Contacto y Ubicación" icon={Phone}>
        <Field label="WhatsApp" hint="Solo los dígitos con código de país. ej. 5214421234567">
          <div className="flex">
            <span className="flex items-center px-3 bg-[#F3EDE8] border border-r-0 border-[#EFE7E4] rounded-l-xl text-xs text-[#7A6B67]">+</span>
            <input
              type="tel"
              className={`${inputClass} rounded-l-none`}
              defaultValue={current.whatsapp || ''}
              placeholder="5214421234567"
              onChange={e => handleChange('whatsapp', e.target.value)}
            />
          </div>
        </Field>

        <Field label="Dirección">
          <input
            type="text"
            className={inputClass}
            defaultValue={current.address || ''}
            placeholder="ej. Col. Centro, Aguascalientes"
            onChange={e => handleChange('address', e.target.value)}
          />
        </Field>

        <Field label="Mapa (URL de Google Maps embed)" hint="Busca tu negocio en Google Maps → Compartir → Insertar mapa → copia la URL.">
          <input
            type="url"
            className={inputClass}
            defaultValue={current.maps_embed_url || ''}
            placeholder="https://www.google.com/maps/embed?pb=..."
            onChange={e => handleChange('maps_embed_url', e.target.value)}
          />
        </Field>
      </Section>

      {/* SECCIÓN: Redes Sociales */}
      <Section title="Redes Sociales" icon={Globe}>
        <Field label="Instagram">
          <div className="flex">
            <span className="flex items-center px-3 bg-[#F3EDE8] border border-r-0 border-[#EFE7E4] rounded-l-xl text-xs text-[#7A6B67]">@</span>
            <input
              type="text"
              className={`${inputClass} rounded-l-none`}
              defaultValue={current.instagram_handle || ''}
              placeholder="karinmakeup"
              onChange={e => handleChange('instagram_handle', e.target.value)}
            />
          </div>
        </Field>

        <Field label="TikTok">
          <div className="flex">
            <span className="flex items-center px-3 bg-[#F3EDE8] border border-r-0 border-[#EFE7E4] rounded-l-xl text-xs text-[#7A6B67]">@</span>
            <input
              type="text"
              className={`${inputClass} rounded-l-none`}
              defaultValue={current.tiktok_handle || ''}
              placeholder="karinmakeup"
              onChange={e => handleChange('tiktok_handle', e.target.value)}
            />
          </div>
        </Field>

        <Field label="Facebook">
          <input
            type="url"
            className={inputClass}
            defaultValue={current.facebook_url || ''}
            placeholder="https://facebook.com/tu-pagina"
            onChange={e => handleChange('facebook_url', e.target.value)}
          />
        </Field>
      </Section>

      {/* SECCIÓN: Horarios */}
      <Section title="Horarios" icon={Clock}>
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const dayData = current.schedule?.[key] || { open: '09:00', close: '18:00', active: false };
            return (
              <div key={key} className="flex items-center gap-3">
                {/* Toggle ON/OFF */}
                <button
                  onClick={() => handleScheduleChange(key, 'active', !dayData.active)}
                  className={`
                    relative flex-shrink-0 w-8 h-4.5 rounded-full transition-colors duration-200
                    ${dayData.active ? 'bg-[#D99AA8]' : 'bg-[#EFE7E4]'}
                  `}
                >
                  <span className={`
                    absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200
                    ${dayData.active ? 'translate-x-3.5' : 'translate-x-0'}
                  `} />
                </button>

                <span className={`text-sm w-20 flex-shrink-0 ${dayData.active ? 'text-[#3D2C2C]' : 'text-[#C2B5B0]'} font-light`}>
                  {label}
                </span>

                {dayData.active && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      className="px-2.5 py-1.5 bg-[#FDFBFB] border border-[#EFE7E4] rounded-lg text-xs text-[#3D2C2C] focus:outline-none focus:border-[#D99AA8]/60 transition-colors"
                      value={dayData.open}
                      onChange={e => handleScheduleChange(key, 'open', e.target.value)}
                    />
                    <span className="text-xs text-[#C2B5B0]">a</span>
                    <input
                      type="time"
                      className="px-2.5 py-1.5 bg-[#FDFBFB] border border-[#EFE7E4] rounded-lg text-xs text-[#3D2C2C] focus:outline-none focus:border-[#D99AA8]/60 transition-colors"
                      value={dayData.close}
                      onChange={e => handleScheduleChange(key, 'close', e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* SECCIÓN: Colores */}
      <Section title="Colores de marca" icon={Palette}>
        <Field label="Color principal">
          <div className="flex flex-wrap gap-2 mt-1">
            {BRAND_COLOR_PALETTE.map(color => (
              <button
                key={color.slug}
                title={color.label}
                onClick={() => handleToggle('primary_color', color.slug)}
                className={`
                  w-7 h-7 rounded-full border-2 transition-all duration-150
                  ${current.primary_color === color.slug
                    ? 'border-[#3D2C2C] scale-110 shadow-md'
                    : 'border-transparent hover:scale-105'}
                `}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </Field>

        <Field label="Color secundario">
          <div className="flex flex-wrap gap-2 mt-1">
            {BRAND_COLOR_PALETTE.map(color => (
              <button
                key={color.slug}
                title={color.label}
                onClick={() => handleToggle('secondary_color', color.slug)}
                className={`
                  w-7 h-7 rounded-full border-2 transition-all duration-150
                  ${current.secondary_color === color.slug
                    ? 'border-[#3D2C2C] scale-110 shadow-md'
                    : 'border-transparent hover:scale-105'}
                `}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </Field>
      </Section>

      {/* Versión anterior */}
      {config?.previous_snapshot && config.snapshot_updated_at && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#FDFBFB] border border-[#EFE7E4] text-xs">
          <div className="flex items-center gap-1.5 text-[#7A6B67]">
            <Clock className="w-3 h-3" />
            <span>
              Última modificación: {new Date(config.snapshot_updated_at).toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          <button
            onClick={() => restoreMutation.mutate()}
            disabled={restoreMutation.isPending}
            className="text-[#D99AA8] hover:text-[#3D2C2C] font-medium transition-colors disabled:opacity-50"
          >
            Restaurar versión anterior
          </button>
        </div>
      )}
    </div>
  );
};
