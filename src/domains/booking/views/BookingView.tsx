import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseAny as supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Upload, Calendar, Clock, MapPin, Sparkles, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicContent } from '../../content/hooks/usePublicContent';
import Navbar from '../../../landing/Navbar';
import Footer from '../../../landing/Footer';
import { Link } from 'react-router-dom';

export default function BookingView() {
  const { models } = usePublicContent();

  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    service_id: '',
    reservation_date: '',
    reservation_time: '',   // Opcional
    notes: '',
    requires_home_service: false,
    address: '',
  });

  // Estado de imagen
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar servicios activos
  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['active-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, short_name, price_from')
        .eq('active', true)
        .order('display_order');
      if (error) throw error;
      return data || [];
    }
  });

  // Limpiar URL de objeto cuando cambia la imagen
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen es demasiado pesada (máximo 5MB)');
        return;
      }
      // Revocar preview anterior si existe
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      // Crear preview local inmediata
      const objectUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(objectUrl);
      setUploadStatus('idle');
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setUploadStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getMinDate = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validar solo campos realmente obligatorios (hora es opcional)
    if (!form.client_name || !form.client_phone || !form.service_id || !form.reservation_date) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    if (form.requires_home_service && !form.address) {
      toast.error('Por favor, indica la dirección para el servicio a domicilio');
      return;
    }

    setIsSubmitting(true);
    let reference_image_url: string | null = null;
    let storage_path: string | null = null;

    try {
      // 1. Subir imagen si existe
      if (imageFile) {
        setUploadStatus('uploading');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        storage_path = fileName;

        const { error: uploadError } = await supabase.storage
          .from('reservations-assets')
          .upload(storage_path, imageFile, { upsert: false });

        if (uploadError) {
          setUploadStatus('error');
          throw new Error('Error al subir la imagen: ' + uploadError.message);
        }
        setUploadStatus('done');
        reference_image_url = `storage/v1/object/reservations-assets/${storage_path}`;
      }

      // 2. Llamar al RPC (p_reservation_time vacío = sin hora)
      const { error } = await supabase.rpc('submit_reservation', {
        p_client_name: form.client_name,
        p_client_phone: form.client_phone,
        p_client_email: form.client_email || null,
        p_service_id: form.service_id,
        p_reservation_date: form.reservation_date,
        p_reservation_time: form.reservation_time || null,  // NULL = sin hora
        p_notes: form.notes || null,
        p_requires_home_service: form.requires_home_service,
        p_address: form.address || null,
        p_reference_image_url: reference_image_url,
        p_storage_path: storage_path,
      });

      if (error) {
        if (error.message.includes('TIME_SLOT_UNAVAILABLE')) {
          throw new Error('Ese horario ya está reservado. Por favor elige otro.');
        }
        throw new Error(error.message);
      }

      // 3. Construir mensaje de WhatsApp — formato estructurado y limpio
      const selectedService = services.find((s: { id: string; name: string; price_from?: number }) => s.id === form.service_id);
      const serviceName = selectedService?.name ?? 'Servicio de maquillaje';

      // Bloque CLIENTA
      const clientaLines = [
        `👤 *CLIENTA*`,
        `Nombre: ${form.client_name}`,
        `📞 Teléfono: ${form.client_phone}`,
        ...(form.client_email?.trim() ? [`✉️ Correo: ${form.client_email.trim()}`] : []),
      ];

      // Bloque FECHA Y HORARIO
      const horarioLines = [
        `📅 *FECHA Y HORARIO*`,
        `Fecha: ${form.reservation_date}`,
        ...(form.reservation_time?.trim() ? [`Hora: ${form.reservation_time.trim()}`] : []),
      ];

      // Bloque DOMICILIO — solo si se requiere
      const domicilioLines = form.requires_home_service
        ? [
            `🏠 *SERVICIO A DOMICILIO*`,
            `Sí`,
            ...(form.address?.trim()
              ? [``, `📍 *DIRECCIÓN*`, form.address.trim()]
              : []),
          ]
        : [];

      // Bloque NOTAS — solo si existen
      const notasLines = form.notes?.trim()
        ? [`📝 *NOTAS*`, form.notes.trim()]
        : [];

      // Bloque IMAGEN — solo si se adjuntó
      const imagenLines = imageFile
        ? [`🖼️ *IMAGEN DE REFERENCIA*`, `Imagen de inspiración adjuntada al registrar`]
        : [];

      // Ensamblar mensaje completo — cada bloque separado por línea en blanco
      const bloques = [
        [`✨ *NUEVA SOLICITUD DE RESERVA*`],
        clientaLines,
        [`💄 *SERVICIO*`, serviceName],
        horarioLines,
        domicilioLines,
        notasLines,
        imagenLines,
        [
          `💰 *ANTICIPO*`,
          `Se requiere 50% de anticipo para asegurar la fecha y el servicio.`,
        ],
        [`────────────────────`],
        [`_Karin Makeup Artist_`],
      ].filter(bloque => bloque.length > 0);

      const mensaje = bloques.map(b => b.join('\n')).join('\n\n');

      // Número de Karin: se extrae del footer si viene de la DB, o se usa el fijo como fallback
      const KARIN_WHATSAPP = '529996445006';
      const rawPhone = (models?.landing?.footer?.social?.whatsapp ?? '').replace(/\D/g, '');
      const phone = rawPhone || KARIN_WHATSAPP;
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;

      toast.success('¡Reserva registrada con éxito!');
      window.location.href = waUrl;

    } catch (err: any) {
      if (uploadStatus === 'uploading') setUploadStatus('error');
      toast.error(err.message || 'Error al procesar la reserva. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCFB] font-sans flex flex-col">
      {models?.landing && <Navbar navbar={models.landing.navbar} />}

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-24 lg:py-32 relative z-10">

        {/* Header */}
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#7A6B67] hover:text-[#D26E87] mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-5xl font-medium text-[#3D2C2C] mb-4 font-display">Reserva tu Experiencia</h1>
          <p className="text-[#7A6B67] font-light text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Completa el siguiente formulario para solicitar tu cita. Estaré encantada de ser parte de tu momento especial.
          </p>
        </div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-[#EFE7E4] p-6 md:p-10 shadow-[0_20px_60px_rgba(61,44,44,0.04)]"
        >
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* 1. Datos Personales */}
            <section>
              <h3 className="text-xs font-semibold tracking-widest text-[#D26E87] uppercase mb-4 flex items-center gap-2">
                1. Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#7A6B67] mb-1.5">Nombre completo *</label>
                  <input
                    required
                    type="text"
                    value={form.client_name}
                    onChange={e => setForm({ ...form, client_name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm focus:outline-none focus:border-[#D26E87] focus:ring-1 focus:ring-[#D26E87] transition-all"
                    placeholder="Tu nombre y apellido"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#7A6B67] mb-1.5">Teléfono / WhatsApp *</label>
                  <input
                    required
                    type="tel"
                    value={form.client_phone}
                    onChange={e => setForm({ ...form, client_phone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm focus:outline-none focus:border-[#D26E87] focus:ring-1 focus:ring-[#D26E87] transition-all"
                    placeholder="+52 ..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-[#7A6B67] mb-1.5">Correo electrónico (Opcional)</label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={e => setForm({ ...form, client_email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm focus:outline-none focus:border-[#D26E87] focus:ring-1 focus:ring-[#D26E87] transition-all"
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#EFE7E4] to-transparent" />

            {/* 2. Servicio y Horario */}
            <section>
              <h3 className="text-xs font-semibold tracking-widest text-[#D26E87] uppercase mb-4 flex items-center gap-2">
                2. Servicio y Horario
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#7A6B67] mb-1.5">Servicio deseado *</label>
                  <div className="relative">
                    <select
                      required
                      value={form.service_id}
                      onChange={e => setForm({ ...form, service_id: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm focus:outline-none focus:border-[#D26E87] focus:ring-1 focus:ring-[#D26E87] transition-all appearance-none cursor-pointer"
                      disabled={loadingServices}
                    >
                      <option value="">Selecciona un servicio</option>
                      {services.map((s: { id: string; name: string; price_from?: number }) => (
                        <option key={s.id} value={s.id}>{s.name} {s.price_from ? `(Desde $${s.price_from})` : ''}</option>
                      ))}
                    </select>
                    <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D26E87] pointer-events-none opacity-50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#7A6B67] mb-1.5">Fecha de tu evento *</label>
                    <div className="relative">
                      <input
                        required
                        type="date"
                        min={getMinDate()}
                        value={form.reservation_date}
                        onChange={e => setForm({ ...form, reservation_date: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm focus:outline-none focus:border-[#D26E87] focus:ring-1 focus:ring-[#D26E87] transition-all"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6B67] pointer-events-none opacity-50" />
                    </div>
                  </div>
                  <div>
                    {/* Hora es OPCIONAL — sin required, sin asterisco */}
                    <label className="block text-xs text-[#7A6B67] mb-1.5">
                      Hora deseada <span className="text-[#C2B5B0]">(opcional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={form.reservation_time}
                        onChange={e => setForm({ ...form, reservation_time: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm focus:outline-none focus:border-[#D26E87] focus:ring-1 focus:ring-[#D26E87] transition-all"
                      />
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6B67] pointer-events-none opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Domicilio — checkbox con onChange funcional */}
                <div className="pt-2">
                  <label
                    className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-[#EFE7E4] bg-[#FDFBFB] hover:bg-[#fff5f7] transition-colors"
                    onClick={() => setForm(f => ({ ...f, requires_home_service: !f.requires_home_service }))}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${form.requires_home_service ? 'bg-[#D26E87] border-[#D26E87]' : 'border-[#C2B5B0] bg-white'}`}>
                      {form.requires_home_service && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#3D2C2C]">Requiero servicio a domicilio</span>
                      <p className="text-xs text-[#7A6B67] mt-0.5">El servicio se realizará en tu ubicación</p>
                    </div>
                  </label>
                </div>

                <AnimatePresence>
                  {form.requires_home_service && (
                    <motion.div
                      key="address"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2">
                        <label className="block text-xs text-[#7A6B67] mb-1.5">Dirección y Referencias *</label>
                        <div className="relative">
                          <textarea
                            required={form.requires_home_service}
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                            rows={2}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-[#D26E87]/30 rounded-xl text-sm focus:outline-none focus:border-[#D26E87] focus:ring-1 focus:ring-[#D26E87] transition-all resize-none shadow-[0_0_15px_rgba(210,110,135,0.05)]"
                            placeholder="Calle, Número, Colonia, Código Postal. Indicaciones adicionales..."
                          />
                          <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-[#D26E87]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#EFE7E4] to-transparent" />

            {/* 3. Detalles Adicionales */}
            <section>
              <h3 className="text-xs font-semibold tracking-widest text-[#D26E87] uppercase mb-4 flex items-center gap-2">
                3. Detalles Adicionales
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#7A6B67] mb-1.5">Notas adicionales</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#FDFBFB] border border-[#EFE7E4] rounded-xl text-sm focus:outline-none focus:border-[#D26E87] focus:ring-1 focus:ring-[#D26E87] transition-all resize-none"
                    placeholder="Cuéntame sobre alergias, preferencias especiales o cualquier detalle importante..."
                  />
                </div>

                {/* Imagen de referencia con preview */}
                <div>
                  <label className="block text-xs text-[#7A6B67] mb-1.5">Imagen de referencia (Opcional)</label>

                  <AnimatePresence mode="wait">
                    {imageFile && imagePreview ? (
                      /* Estado: imagen seleccionada — mostrar preview */
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="relative rounded-xl overflow-hidden border border-[#D26E87]/30 bg-[#FDFBFB]"
                      >
                        {/* Preview de imagen */}
                        <div className="relative w-full h-48 overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Vista previa de referencia"
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay con estado de subida al enviar */}
                          {uploadStatus === 'uploading' && (
                            <div className="absolute inset-0 bg-[#3D2C2C]/50 flex items-center justify-center">
                              <div className="flex items-center gap-2 text-white text-sm font-medium">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Subiendo imagen...
                              </div>
                            </div>
                          )}
                          {uploadStatus === 'done' && (
                            <div className="absolute inset-0 bg-green-900/40 flex items-center justify-center">
                              <div className="flex items-center gap-2 text-white text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Imagen subida
                              </div>
                            </div>
                          )}
                          {uploadStatus === 'error' && (
                            <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Error al subir</span>
                            </div>
                          )}
                        </div>

                        {/* Info + acciones */}
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-[#D26E87] flex-shrink-0" />
                            <span className="text-xs font-medium text-[#3D2C2C] truncate">{imageFile.name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs text-[#7A6B67] hover:text-[#D26E87] transition-colors"
                            >
                              Cambiar
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="p-1 rounded-full hover:bg-[#EFE7E4] transition-colors"
                              aria-label="Eliminar imagen"
                            >
                              <X className="w-3.5 h-3.5 text-[#7A6B67]" />
                            </button>
                          </div>
                        </div>

                        {/* Input oculto para cambiar */}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                        />
                      </motion.div>
                    ) : (
                      /* Estado: sin imagen — zona de drop/click */
                      <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-6 border-2 border-dashed border-[#EFE7E4] rounded-xl bg-[#FDFBFB] hover:bg-[#fff5f7] hover:border-[#D26E87]/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                      >
                        <Upload className="w-6 h-6 text-[#C2B5B0] mb-2 group-hover:text-[#D26E87] transition-colors" />
                        <span className="text-sm font-medium text-[#3D2C2C] mb-1">
                          Sube una foto de inspiración
                        </span>
                        <span className="text-xs text-[#7A6B67]">
                          JPG, PNG o WEBP (Máx. 5MB)
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* Aviso de Anticipo */}
            <div className="bg-[#fff5f7] border border-[#D26E87]/20 rounded-xl p-5 flex items-start gap-3">
              <div className="mt-0.5">
                <Sparkles className="w-4 h-4 text-[#D26E87]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#3D2C2C] mb-1">Importante</h4>
                <p className="text-xs text-[#7A6B67] leading-relaxed">
                  Para asegurar tu fecha y servicio se requiere un anticipo del 50%. La fecha queda sujeta a confirmación una vez recibido el anticipo por WhatsApp.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center h-14 bg-gradient-to-r from-[#D26E87] to-[#B8576F] hover:from-[#B8576F] hover:to-[#9F485C] text-white rounded-full font-medium text-sm tracking-wide shadow-[0_8px_25px_rgba(210,110,135,0.35)] transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadStatus === 'uploading' ? 'Subiendo imagen...' : 'Registrando reserva...'}
                </span>
              ) : (
                'Registrar reserva'
              )}
            </button>

          </form>
        </motion.div>
      </main>

      {models?.landing && <Footer footer={models.landing.footer} />}
    </div>
  );
}
