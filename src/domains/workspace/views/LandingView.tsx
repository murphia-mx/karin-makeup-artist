import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Monitor, Tablet, Smartphone, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import {
  useLandingPublished,
  useLandingDraft,
  useUpdateLandingDraft,
  usePublishLanding,
  hasUnpublishedChanges,
} from '../hooks/useLandingConfig';
import { computeLandingChangelog } from '../types/LandingConfig';
import type { LandingConfig, FaqItem } from '../types/LandingConfig';

// ─── Componentes internos ────────────────────────────────────

const inputClass = "w-full px-3.5 py-2.5 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm text-[#3D2C2C] placeholder:text-[#C2B5B0] focus:outline-none focus:border-[#D99AA8]/60 focus:ring-2 focus:ring-[#D99AA8]/10 transition-all font-light";

const SectionAccordion = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-[1.5rem] border border-[#EFE7E4] shadow-[0_4px_20px_rgba(0,0,0,0.01)] overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-6 hover:bg-[#FDFBFB] transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-[#3D2C2C]">{title}</span>
      </div>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-[#C2B5B0]" />
      ) : (
        <ChevronDown className="w-4 h-4 text-[#C2B5B0]" />
      )}
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 space-y-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Toggle = ({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm font-light text-[#3D2C2C]">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-[#D99AA8]' : 'bg-[#EFE7E4]'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  </div>
);

// FAQ Editor
const FaqEditor = ({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}) => {
  const addItem = () => {
    onChange([...items, { id: crypto.randomUUID(), q: '', a: '', order: items.length }]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: 'q' | 'a', value: string) => {
    onChange(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="bg-[#FDFBFB] rounded-xl border border-[#EFE7E4] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#C2B5B0] uppercase tracking-wider">Pregunta {idx + 1}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
            >
              Eliminar
            </button>
          </div>
          <input
            type="text"
            placeholder="¿Cuál es la pregunta?"
            className={inputClass}
            value={item.q}
            onChange={e => updateItem(item.id, 'q', e.target.value)}
          />
          <textarea
            placeholder="La respuesta..."
            rows={2}
            className={`${inputClass} resize-none`}
            value={item.a}
            onChange={e => updateItem(item.id, 'a', e.target.value)}
          />
        </div>
      ))}
      {items.length < 10 && (
        <button
          onClick={addItem}
          className="w-full py-2.5 border border-dashed border-[#D99AA8]/40 text-[#D99AA8] text-xs rounded-xl hover:bg-[#FDF8F8] transition-colors"
        >
          + Agregar pregunta
        </button>
      )}
    </div>
  );
};

// Preview modal
const PreviewModal = ({ onClose }: { onClose: () => void }) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const widths = {
    desktop: 'w-full',
    tablet:  'w-[768px]',
    mobile:  'w-[375px]',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="fixed inset-4 z-50 bg-[#F5F0E8] rounded-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Preview toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#EFE7E4]">
          <span className="text-sm font-medium text-[#3D2C2C]">Vista previa</span>
          <div className="flex items-center gap-1 bg-[#F3EDE8] rounded-lg p-1">
            {([
              { key: 'desktop', icon: Monitor },
              { key: 'tablet', icon: Tablet },
              { key: 'mobile', icon: Smartphone },
            ] as const).map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewport(key)}
                className={`p-2 rounded-md transition-all ${viewport === key ? 'bg-white shadow-sm text-[#3D2C2C]' : 'text-[#7A6B67] hover:text-[#3D2C2C]'}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-sm text-[#7A6B67] hover:text-[#3D2C2C] transition-colors">
            Cerrar
          </button>
        </div>

        {/* iframe area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div className={`${widths[viewport]} h-full transition-all duration-300 bg-white rounded-xl overflow-hidden shadow-2xl`}>
            <iframe
              src="/"
              className="w-full h-full border-0"
              title="Vista previa de la landing"
            />
          </div>
        </div>

        <div className="px-6 py-3 bg-white border-t border-[#EFE7E4] text-center">
          <p className="text-xs text-[#7A6B67] font-light">
            Esta es una vista de solo lectura. Los cambios publicados aparecerán aquí.
          </p>
        </div>
      </motion.div>
    </>
  );
};

// Modal de confirmación de publicación
const PublishConfirmModal = ({
  changelog,
  onPublish,
  onClose,
  isPublishing,
}: {
  changelog: ReturnType<typeof computeLandingChangelog>;
  onPublish: () => void;
  onClose: () => void;
  isPublishing: boolean;
}) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl border border-[#EFE7E4] shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-6">
        <h2 className="text-base font-medium text-[#3D2C2C] mb-1">Publicar cambios</h2>
        <p className="text-xs font-light text-[#7A6B67] mb-5">
          Los siguientes cambios serán visibles para tus clientes:
        </p>

        <div className="space-y-2 mb-6">
          {changelog.map((item: ReturnType<typeof computeLandingChangelog>[0], i: number) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-base">{item.icon}</span>
              <span className="text-[#3D2C2C] font-light">{item.description}</span>
            </div>
          ))}
          {changelog.length === 0 && (
            <p className="text-xs text-[#C2B5B0] text-center py-4">No hay cambios detectados.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#EFE7E4] rounded-xl text-sm text-[#7A6B67] hover:bg-[#FDFBFB] transition-colors">
            Cancelar
          </button>
          <button
            onClick={onPublish}
            disabled={isPublishing || changelog.length === 0}
            className="flex-1 py-3 bg-[#3D2C2C] text-white text-sm font-medium rounded-xl hover:bg-[#5A4A4A] transition-colors disabled:opacity-40"
          >
            {isPublishing ? 'Publicando...' : 'Publicar cambios'}
          </button>
        </div>
      </div>
    </motion.div>
  </>
);

// ─── Vista Principal ─────────────────────────────────────────

export const LandingView = () => {
  const { data: published } = useLandingPublished();
  const { data: draft } = useLandingDraft();
  const updateDraft = useUpdateLandingDraft();
  const publishLanding = usePublishLanding();

  const [openSection, setOpenSection] = useState<string | null>('hero');
  const [showPreview, setShowPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const isDirty = hasUnpublishedChanges(published, draft);
  const changelog = published && draft ? computeLandingChangelog(published, draft) : [];

  const updateField = (patch: Partial<LandingConfig>) => {
    updateDraft.mutate(patch);
  };

  const toggle = (section: string) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-light text-[#3D2C2C]">Landing</h1>
          <p className="text-xs font-light text-[#7A6B67] mt-0.5">El contenido de tu página pública</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EFE7E4] text-xs text-[#7A6B67] hover:bg-[#FDFBFB] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Vista previa
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={!isDirty}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              isDirty
                ? 'bg-[#3D2C2C] text-white hover:bg-[#5A4A4A]'
                : 'bg-[#F3EDE8] text-[#C2B5B0] cursor-not-allowed'
            }`}
          >
            Publicar cambios
          </button>
        </div>
      </div>

      {/* Draft Banner */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs font-light text-amber-700">
                {changelog.length} cambio{changelog.length !== 1 ? 's' : ''} sin publicar — tus clientes aún no los ven.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Acordeón de secciones */}
      <div className="space-y-3">
        {/* Hero */}
        <SectionAccordion title="Hero" icon="✦" isOpen={openSection === 'hero'} onToggle={() => toggle('hero')}>
          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Título principal</label>
            <input type="text" className={inputClass} maxLength={60}
              defaultValue={draft?.hero_title || ''}
              onBlur={e => updateField({ hero_title: e.target.value })}
              placeholder="ej. Maquillaje que te hace brillar" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Subtítulo</label>
            <input type="text" className={inputClass} maxLength={120}
              defaultValue={draft?.hero_subtitle || ''}
              onBlur={e => updateField({ hero_subtitle: e.target.value })}
              placeholder="ej. Para tu boda, graduación o sesión especial" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Texto del botón</label>
            <input type="text" className={inputClass} maxLength={30}
              defaultValue={draft?.hero_cta_text || ''}
              onBlur={e => updateField({ hero_cta_text: e.target.value })}
              placeholder="Agenda tu cita" />
          </div>
        </SectionAccordion>

        {/* Servicios */}
        <SectionAccordion title="Servicios destacados" icon="✂️" isOpen={openSection === 'services'} onToggle={() => toggle('services')}>
          <Toggle value={draft?.show_services ?? true} onChange={v => updateField({ show_services: v })} label="Mostrar sección en la landing" />
          <p className="text-xs text-[#7A6B67] font-light">
            Puedes seleccionar qué servicios aparecen en el módulo de Servicios (máx. 3).
          </p>
        </SectionAccordion>

        {/* Testimonios */}
        <SectionAccordion title="Testimonios" icon="⭐" isOpen={openSection === 'testimonials'} onToggle={() => toggle('testimonials')}>
          <Toggle value={draft?.show_testimonials ?? true} onChange={v => updateField({ show_testimonials: v })} label="Mostrar sección en la landing" />
        </SectionAccordion>

        {/* Galería */}
        <SectionAccordion title="Galería" icon="🖼" isOpen={openSection === 'gallery'} onToggle={() => toggle('gallery')}>
          <Toggle value={draft?.show_gallery ?? true} onChange={v => updateField({ show_gallery: v })} label="Mostrar galería en la landing" />
        </SectionAccordion>

        {/* FAQ */}
        <SectionAccordion title="Preguntas frecuentes" icon="💬" isOpen={openSection === 'faq'} onToggle={() => toggle('faq')}>
          <Toggle value={draft?.show_faq ?? true} onChange={v => updateField({ show_faq: v })} label="Mostrar sección FAQ" />
          {(draft?.show_faq ?? true) && (
            <FaqEditor
              items={draft?.faq_items || []}
              onChange={items => updateField({ faq_items: items })}
            />
          )}
        </SectionAccordion>

        {/* CTA Final */}
        <SectionAccordion title="CTA Final" icon="🎯" isOpen={openSection === 'cta'} onToggle={() => toggle('cta')}>
          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Texto principal</label>
            <input type="text" className={inputClass} maxLength={60}
              defaultValue={draft?.cta_title || ''}
              onBlur={e => updateField({ cta_title: e.target.value })}
              placeholder="ej. ¿Lista para lucir increíble?" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Texto del botón</label>
            <input type="text" className={inputClass} maxLength={30}
              defaultValue={draft?.cta_button_text || ''}
              onBlur={e => updateField({ cta_button_text: e.target.value })}
              placeholder="Reservar ahora" />
          </div>
        </SectionAccordion>

        {/* Footer */}
        <SectionAccordion title="Footer" icon="📄" isOpen={openSection === 'footer'} onToggle={() => toggle('footer')}>
          <div>
            <label className="block text-xs font-medium text-[#7A6B67] uppercase tracking-wider mb-1.5">Texto de créditos</label>
            <input type="text" className={inputClass} maxLength={80}
              defaultValue={draft?.footer_credits || ''}
              onBlur={e => updateField({ footer_credits: e.target.value })}
              placeholder="ej. © 2026 Karin Makeup Artist. Todos los derechos reservados." />
          </div>
          <Toggle value={draft?.show_social_footer ?? true} onChange={v => updateField({ show_social_footer: v })} label="Mostrar redes sociales en el footer" />
        </SectionAccordion>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}
        {showPublishModal && (
          <PublishConfirmModal
            changelog={changelog}
            onPublish={() => {
              publishLanding.mutate();
              setShowPublishModal(false);
            }}
            onClose={() => setShowPublishModal(false)}
            isPublishing={publishLanding.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
