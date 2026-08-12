import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  ImagePlus,
  MapPin,
  MessageCircle,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import Navbar from "@/landing/Navbar";
import { usePublicContent } from "@/domains/content/hooks/usePublicContent";

/* -------------------------------------------------------------------------- */
/* CONFIG                                                                     */
/* -------------------------------------------------------------------------- */

const KARIN_WHATSAPP = "529996445006";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Service = {
  id: string;
  name: string;
  short_name?: string | null;
  slug?: string | null;
  description?: string | null;
  short_description?: string | null;
  price_from?: number | null;
  duration_minutes?: number | null;
  active?: boolean | null;
  show_in_landing?: boolean | null;
  display_order?: number | null;
};

type FormState = {
  client_name: string;
  client_phone: string;
  client_email: string;
  service_id: string;
  reservation_date: string;
  reservation_time: string;
  notes: string;
  requires_home_service: boolean;
  address: string;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatPrice(value?: number | null) {
  if (!value) return "A confirmar";
  return `$${Number(value).toLocaleString("es-MX")} MXN`;
}

function formatWhatsAppDate(value: string) {
  if (!value) return "Por confirmar";

  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatShortDate(value: string) {
  if (!value) return "Por seleccionar";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getMinDate() {
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - offset).toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function BookingView() {
  const { models } = usePublicContent();
  const landing = models?.landing;
  const [searchParams] = useSearchParams();

  const requestedServiceId = searchParams.get("service");

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [form, setForm] = useState<FormState>({
    client_name: "",
    client_phone: "",
    client_email: "",
    service_id: "",
    reservation_date: "",
    reservation_time: "",
    notes: "",
    requires_home_service: false,
    address: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ------------------------------------------------------------------------ */
  /* LOAD SERVICES                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      setLoadingServices(true);

      const { data, error } = await supabase
        .from("services")
        .select(
          `
            id,
            name,
            short_name,
            slug,
            description,
            short_description,
            price_from,
            duration_minutes,
            active,
            show_in_landing,
            display_order
          `,
        )
        .eq("active", true)
        .order("display_order", {
          ascending: true,
        });

      if (cancelled) return;

      if (error) {
        console.error("Error loading services:", error);
        toast.error("No se pudieron cargar los servicios.");
        setServices([]);
      } else {
        setServices((data ?? []) as Service[]);
      }

      setLoadingServices(false);
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* AUTO SELECT SERVICE                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!requestedServiceId || !services.length) return;

    const requestedService = services.find(
      (service) => service.id === requestedServiceId,
    );

    if (!requestedService) return;

    setForm((current) =>
      current.service_id === requestedService.id
        ? current
        : {
            ...current,
            service_id: requestedService.id,
          },
    );
  }, [requestedServiceId, services]);

  /* ------------------------------------------------------------------------ */
  /* IMAGE PREVIEW                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  /* ------------------------------------------------------------------------ */
  /* DERIVED                                                                  */
  /* ------------------------------------------------------------------------ */

  const selectedService = useMemo(
    () => services.find((service) => service.id === form.service_id) ?? null,
    [services, form.service_id],
  );

  const updateForm = (patch: Partial<FormState>) => {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  };

  const investment = selectedService?.price_from ?? null;

  /* ------------------------------------------------------------------------ */
  /* IMAGE HANDLING                                                           */
  /* ------------------------------------------------------------------------ */

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 5 MB.");
      return;
    }

    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ------------------------------------------------------------------------ */
  /* WHATSAPP MESSAGE                                                         */
  /* ------------------------------------------------------------------------ */

  const buildWhatsAppMessage = () => {
    /*
     * WhatsApp COPY
     * Los iconos se construyen en runtime para evitar que Windows/Git
     * conviertan emojis UTF-8 en el carácter de reemplazo "�".
     */
    const W = {
      sparkle: String.fromCodePoint(0x2728),
      person: String.fromCodePoint(0x1f464),
      phone: String.fromCodePoint(0x1f4f1),
      email: String.fromCodePoint(0x2709, 0xfe0f),
      makeup: String.fromCodePoint(0x1f484),
      calendar: String.fromCodePoint(0x1f4c5),
      clock: String.fromCodePoint(0x1f550),
      pin: String.fromCodePoint(0x1f4cd),
      home: String.fromCodePoint(0x1f3e0),
      notes: String.fromCodePoint(0x1f4dd),
      image: String.fromCodePoint(0x1f5bc, 0xfe0f),
      money: String.fromCodePoint(0x1f4b0),
    };

    const serviceName = selectedService?.name ?? "Servicio de maquillaje";

    const priceText = selectedService?.price_from
      ? `Desde ${formatPrice(selectedService.price_from)}`
      : "Precio a confirmar";

    const lines = [
      `${W.sparkle} *NUEVA SOLICITUD DE RESERVA*`,
      "",
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      `${W.person} *DATOS DE LA CLIENTA*`,
      `Nombre: ${form.client_name.trim()}`,
      `${W.phone} WhatsApp: ${form.client_phone.trim()}`,
      ...(form.client_email.trim()
        ? [`${W.email} Correo: ${form.client_email.trim()}`]
        : []),

      "",
      `${W.makeup} *SERVICIO SOLICITADO*`,
      serviceName,
      priceText,

      "",
      `${W.calendar} *FECHA Y HORARIO*`,
      `Fecha: ${formatWhatsAppDate(form.reservation_date)}`,
      `${W.clock} Hora: ${
        form.reservation_time.trim()
          ? form.reservation_time.trim()
          : "Por confirmar"
      }`,

      "",
      `${W.pin} *UBICACIÓN*`,
      form.requires_home_service
        ? `${W.home} Servicio a domicilio`
        : "En estudio / ubicación por confirmar",

      ...(form.requires_home_service && form.address.trim()
        ? [`${W.pin} Dirección: ${form.address.trim()}`]
        : []),

      ...(form.notes.trim()
        ? ["", `${W.notes} *NOTAS DE LA CLIENTA*`, form.notes.trim()]
        : []),

      ...(imageFile
        ? [
            "",
            `${W.image} *IMAGEN DE REFERENCIA*`,
            "La clienta adjuntó una imagen de inspiración.",
          ]
        : []),

      "",
      `${W.money} *ANTICIPO*`,
      "Se requiere un anticipo del 50% para asegurar la fecha y el servicio.",

      "",
      `${W.sparkle} *SIGUIENTE PASO*`,
      "La solicitud queda pendiente de confirmación.",
      "Karin se pondrá en contacto para confirmar disponibilidad y coordinar los detalles de la reserva.",

      "",
      "━━━━━━━━━━━━━━━━━━━━",
      "*Karin Makeup Artist*",
      "Belleza creada para hacerte sentir increíble. ♡",
    ];

    return lines.join("\n");
  };

  /* ------------------------------------------------------------------------ */
  /* SUBMIT                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const clientName = form.client_name.trim();
    const clientPhone = form.client_phone.trim();
    const clientEmail = form.client_email.trim();
    const address = form.address.trim();
    const notes = form.notes.trim();

    if (
      !clientName ||
      !clientPhone ||
      !form.service_id ||
      !form.reservation_date
    ) {
      toast.error("Completa tu nombre, WhatsApp, servicio y fecha.");
      return;
    }

    if (form.requires_home_service && !address) {
      toast.error("Indica la dirección para el servicio a domicilio.");
      return;
    }

    if (!selectedService) {
      toast.error("Selecciona un servicio válido.");
      return;
    }

    setIsSubmitting(true);

    let referenceImageUrl: string | null = null;
    let storagePath: string | null = null;

    try {
      /* IMAGE UPLOAD */

      if (imageFile) {
        const extension =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}-${Date.now()}.${extension}`;

        storagePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("reservations-assets")
          .upload(storagePath, imageFile, {
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          console.error(uploadError);
          throw new Error("No se pudo subir la imagen de referencia.");
        }

        const { data } = supabase.storage
          .from("reservations-assets")
          .getPublicUrl(storagePath);

        referenceImageUrl = data.publicUrl;
      }

      /* DATABASE */

      const { error } = await (supabase.rpc as any)("submit_reservation", {
        p_client_name: clientName,
        p_client_phone: clientPhone,
        p_client_email: clientEmail || null,
        p_service_id: form.service_id,
        p_reservation_date: form.reservation_date,
        p_reservation_time: form.reservation_time || null,
        p_notes: notes || null,
        p_requires_home_service: form.requires_home_service,
        p_address: address || null,
        p_reference_image_url: referenceImageUrl,
        p_storage_path: storagePath,
      });

      if (error) {
        console.error("Reservation error:", error);
        throw new Error(error.message || "No se pudo registrar la reserva.");
      }

      /* WHATSAPP */

      const message = buildWhatsAppMessage();

      const rawPhone = (
        models?.landing?.footer?.social?.whatsapp ?? ""
      ).replace(/\D/g, "");

      const phone = rawPhone || KARIN_WHATSAPP;

      if (!phone) {
        throw new Error("No se encontró el número de WhatsApp de Karin.");
      }

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
        message,
      )}`;

      toast.success("¡Solicitud registrada con éxito!");

      window.location.assign(whatsappUrl);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo completar la solicitud.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="booking-apple min-h-screen bg-[#fcfbfa] text-[#241d21]">
      {/* ORIGINAL NAVBAR — untouched */}
      <header className="booking-navbar">
        {landing && <Navbar navbar={landing.navbar} />}
      </header>

      <main className="booking-main mx-auto w-full max-w-[1280px] px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pt-12">
        {/* BACK TO HOME */}
        <div className="booking-back-row">
          <a
            href="/"
            className="booking-back-link"
            aria-label="Regresar al inicio"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
            <span>Regresar al inicio</span>
          </a>
        </div>

        {/* COMPACT INTRO */}
        <section className="booking-intro">
          <div className="booking-intro-meta">
            <span className="booking-intro-line" />
            <span>Reservaciones</span>
          </div>

          <div className="booking-intro-grid">
            <div>
              <h1 className="booking-intro-title">
                Una experiencia
                <br className="hidden sm:block" />
                <span> pensada para ti.</span>
              </h1>
            </div>

            <div className="booking-intro-copy">
              <p>
                Cuéntame los detalles de tu evento. Revisaré tu solicitud y me
                pondré en contacto contigo para confirmar disponibilidad.
              </p>

              <div className="booking-progress" aria-label="Proceso de reserva">
                <span className="booking-progress-active">01 Información</span>
                <i />
                <span>02 Agenda</span>
                <i />
                <span>03 Ubicación</span>
                <i />
                <span>04 Confirmación</span>
              </div>
            </div>
          </div>
        </section>

        <div className="booking-layout">
          {/* FORM */}
          <form
            id="booking-form"
            onSubmit={handleSubmit}
            className="booking-form"
          >
            {/* SERVICE */}
            <section className="booking-section">
              <div className="booking-section-header">
                <div className="booking-section-number">01</div>
                <div>
                  <p className="booking-section-kicker">Servicio</p>
                  <h2 className="booking-section-title">Elige lo esencial.</h2>
                </div>
              </div>

              <label htmlFor="booking-service" className="booking-label">
                Servicio deseado <span>*</span>
              </label>

              <div className="booking-select-shell">
                <select
                  id="booking-service"
                  required
                  value={form.service_id}
                  onChange={(event) =>
                    updateForm({ service_id: event.target.value })
                  }
                  disabled={loadingServices}
                  className="booking-select"
                >
                  <option value="">
                    {loadingServices
                      ? "Cargando servicios..."
                      : "Selecciona tu servicio"}
                  </option>

                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                      {service.price_from
                        ? ` · Desde ${formatPrice(service.price_from)}`
                        : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="booking-select-chevron" />
              </div>

              <div className="booking-selected-service">
                <div className="booking-selected-mark">
                  <Sparkles />
                </div>

                <div className="min-w-0">
                  <p>Servicio seleccionado</p>
                  <strong>
                    {selectedService?.name || "Selecciona un servicio"}
                  </strong>
                </div>

                <div className="booking-selected-price">
                  <p>Desde</p>
                  <strong>{formatPrice(investment)}</strong>
                </div>
              </div>
            </section>

            {/* PERSONAL DATA */}
            <section className="booking-section">
              <div className="booking-section-header">
                <div className="booking-section-number">02</div>
                <div>
                  <p className="booking-section-kicker">Información</p>
                  <h2 className="booking-section-title">Cuéntame sobre ti.</h2>
                </div>
              </div>

              <div className="booking-fields-grid">
                <div>
                  <label className="booking-label" htmlFor="client-name">
                    Nombre completo <span>*</span>
                  </label>
                  <div className="booking-input-shell">
                    <UserRound />
                    <input
                      id="client-name"
                      required
                      type="text"
                      value={form.client_name}
                      onChange={(event) =>
                        updateForm({ client_name: event.target.value })
                      }
                      placeholder="Tu nombre y apellido"
                      className="booking-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="booking-label" htmlFor="client-phone">
                    WhatsApp <span>*</span>
                  </label>
                  <div className="booking-input-shell">
                    <MessageCircle />
                    <input
                      id="client-phone"
                      required
                      type="tel"
                      value={form.client_phone}
                      onChange={(event) =>
                        updateForm({ client_phone: event.target.value })
                      }
                      placeholder="+52 ..."
                      className="booking-input"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="booking-label" htmlFor="client-email">
                    Correo electrónico
                  </label>
                  <div className="booking-input-shell">
                    <span className="booking-at">@</span>
                    <input
                      id="client-email"
                      type="email"
                      value={form.client_email}
                      onChange={(event) =>
                        updateForm({ client_email: event.target.value })
                      }
                      placeholder="correo@ejemplo.com"
                      className="booking-input"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* DATE / TIME */}
            <section className="booking-section">
              <div className="booking-section-header">
                <div className="booking-section-number">03</div>
                <div>
                  <p className="booking-section-kicker">Agenda</p>
                  <h2 className="booking-section-title">Elige cuándo.</h2>
                </div>
              </div>

              <div className="booking-fields-grid">
                <div>
                  <label className="booking-label" htmlFor="booking-date">
                    Fecha de tu evento <span>*</span>
                  </label>
                  <div className="booking-input-shell">
                    <CalendarDays />
                    <input
                      id="booking-date"
                      required
                      type="date"
                      min={getMinDate()}
                      value={form.reservation_date}
                      onChange={(event) =>
                        updateForm({
                          reservation_date: event.target.value,
                        })
                      }
                      className="booking-input booking-date-time"
                    />
                  </div>
                </div>

                <div>
                  <label className="booking-label" htmlFor="booking-time">
                    Hora deseada · opcional
                  </label>
                  <div className="booking-input-shell">
                    <Clock3 />
                    <input
                      id="booking-time"
                      type="time"
                      value={form.reservation_time}
                      onChange={(event) =>
                        updateForm({
                          reservation_time: event.target.value,
                        })
                      }
                      className="booking-input booking-date-time"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATION */}
            <section className="booking-section">
              <div className="booking-section-header">
                <div className="booking-section-number">04</div>
                <div>
                  <p className="booking-section-kicker">Ubicación</p>
                  <h2 className="booking-section-title">
                    Donde te resulte perfecto.
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateForm({
                    requires_home_service: !form.requires_home_service,
                  })
                }
                className={`booking-home-row ${
                  form.requires_home_service ? "booking-home-row-active" : ""
                }`}
              >
                <span
                  className={`booking-home-icon ${
                    form.requires_home_service ? "booking-home-icon-active" : ""
                  }`}
                >
                  <MapPin />
                </span>

                <span className="booking-home-copy">
                  <strong>Servicio a domicilio</strong>
                  <small>Llevaré la experiencia hasta tu ubicación.</small>
                </span>

                <span
                  className={`booking-switch ${
                    form.requires_home_service ? "booking-switch-active" : ""
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`booking-switch-knob ${
                      form.requires_home_service
                        ? "booking-switch-knob-active"
                        : ""
                    }`}
                  />
                </span>
              </button>

              {form.requires_home_service && (
                <div className="booking-address-wrap">
                  <label className="booking-label" htmlFor="booking-address">
                    Dirección y referencias <span>*</span>
                  </label>
                  <textarea
                    id="booking-address"
                    required
                    value={form.address}
                    onChange={(event) =>
                      updateForm({ address: event.target.value })
                    }
                    placeholder="Calle, número, fraccionamiento y referencias..."
                    className="booking-textarea"
                  />
                </div>
              )}
            </section>

            {/* DETAILS */}
            <section className="booking-section">
              <div className="booking-section-header">
                <div className="booking-section-number">05</div>
                <div>
                  <p className="booking-section-kicker">Detalles</p>
                  <h2 className="booking-section-title">Hazlo personal.</h2>
                </div>
              </div>

              <div>
                <label className="booking-label" htmlFor="booking-notes">
                  Notas para Karin
                </label>
                <textarea
                  id="booking-notes"
                  value={form.notes}
                  onChange={(event) =>
                    updateForm({ notes: event.target.value })
                  }
                  placeholder="Cuéntame cualquier petición, inspiración o detalle importante..."
                  className="booking-textarea booking-notes"
                />
              </div>

              <div className="booking-upload-block">
                <label className="booking-label">Imagen de inspiración</label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {!imageFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="booking-upload"
                  >
                    <span className="booking-upload-icon">
                      <Upload />
                    </span>

                    <span className="booking-upload-copy">
                      <strong>Agregar inspiración</strong>
                      <small>JPG, PNG o WEBP · máximo 5 MB</small>
                    </span>

                    <ArrowRight className="booking-upload-arrow" />
                  </button>
                ) : (
                  <div className="booking-upload-preview">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Vista previa de inspiración"
                      />
                    )}

                    <div className="booking-upload-preview-footer">
                      <div className="booking-file-name">
                        <ImagePlus />
                        <span>{imageFile.name}</span>
                      </div>

                      <button
                        type="button"
                        onClick={removeImage}
                        className="booking-remove"
                        aria-label="Eliminar imagen"
                      >
                        <X />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="booking-mobile-submit lg:hidden">
              <SubmitButton isSubmitting={isSubmitting} />
            </div>
          </form>

          {/* SUMMARY */}
          <aside className="booking-aside">
            <div className="booking-summary">
              <div className="booking-summary-header">
                <div className="booking-summary-eyebrow">
                  <span />
                  Resumen de tu reserva
                </div>

                <h2>
                  Tu reserva
                  <br />
                  <span>empieza aquí.</span>
                </h2>

                <p>
                  Una vez enviada, revisaré personalmente tu solicitud antes de
                  confirmar la fecha.
                </p>
              </div>

              <div className="booking-summary-content">
                <div className="booking-summary-service">
                  <div className="booking-summary-service-mark">
                    <Sparkles />
                  </div>

                  <div className="min-w-0">
                    <p>Servicio</p>
                    <strong>
                      {selectedService?.name || "Por seleccionar"}
                    </strong>
                  </div>
                </div>

                <div className="booking-summary-divider" />

                <SummaryItem
                  icon={<CalendarDays />}
                  label="Fecha"
                  value={
                    form.reservation_date
                      ? capitalize(formatShortDate(form.reservation_date))
                      : "Por seleccionar"
                  }
                />

                <SummaryItem
                  icon={<Clock3 />}
                  label="Hora"
                  value={form.reservation_time || "Por confirmar"}
                />

                <SummaryItem
                  icon={<MapPin />}
                  label="Ubicación"
                  value={
                    form.requires_home_service
                      ? "Servicio a domicilio"
                      : "Por confirmar"
                  }
                />

                <div className="booking-summary-price">
                  <span>Inversión</span>
                  <strong>{formatPrice(investment)}</strong>
                </div>

                <div className="booking-deposit">
                  <div className="booking-deposit-mark">
                    <Check />
                  </div>
                  <div>
                    <strong>Anticipo del 50%</strong>
                    <p>
                      La fecha queda sujeta a confirmación una vez recibido el
                      anticipo por WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="booking-whatsapp-note">
                  <MessageCircle />
                  <span>
                    Al enviar, la solicitud se registra y WhatsApp se abre para
                    continuar la atención personalizada.
                  </span>
                </div>

                <div className="hidden lg:block">
                  <SubmitButton isSubmitting={isSubmitting} />
                </div>
              </div>

              <div className="booking-summary-footer">
                <strong>Karin Makeup Artist</strong>
                <span>Atención completamente personalizada</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        .booking-apple {
          --rose: #cf6b86;
          --rose-dark: #b95772;
          --rose-soft: #f8e9ed;
          --rose-wash: #fff7f9;
          --ink: #251d21;
          --muted: #76676c;
          --muted-light: #9c8e93;
          --line: rgba(43, 29, 35, 0.095);
          --line-rose: rgba(207, 107, 134, 0.24);
          --white: #ffffff;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          letter-spacing: -0.01em;
        }

        .booking-apple,
        .booking-apple *,
        .booking-apple *::before,
        .booking-apple *::after {
          box-sizing: border-box;
        }

        .booking-apple button,
        .booking-apple input,
        .booking-apple textarea,
        .booking-apple select {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .booking-navbar {
          position: relative;
          z-index: 50;
          min-height: 76px;
          border-bottom: 1px solid rgba(43, 29, 35, 0.055);
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: saturate(180%) blur(24px);
          -webkit-backdrop-filter: saturate(180%) blur(24px);
        }

        .booking-main {
          position: relative;
          padding-top: 38px;
        }

        /* The original Navbar stays untouched. These scoped overrides only
           make it readable on the white booking surface. */
        

        .booking-back-row {
          display: flex;
          align-items: center;
          padding: 8px 0 0;
        }

        .booking-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #75666c;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .01em;
          text-decoration: none;
          transition: color .2s ease, transform .2s ease;
        }

        .booking-back-link:hover {
          color: var(--rose-dark);
          transform: translateX(-2px);
        }

        .booking-intro {
          padding: 30px 0 52px;
        }

        .booking-intro-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          color: var(--rose-dark);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .22em;
          line-height: 1;
          text-transform: uppercase;
        }

        .booking-intro-line {
          width: 34px;
          height: 1px;
          background: var(--rose);
        }

        .booking-intro-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(320px, .75fr);
          gap: 70px;
          align-items: end;
        }

        .booking-intro-title {
          max-width: 800px;
          margin: 0;
          color: var(--ink);
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: clamp(3rem, 6vw, 5.7rem);
          font-weight: 600;
          letter-spacing: -.065em;
          line-height: .96;
        }

        .booking-intro-title span {
          color: var(--rose);
        }

        .booking-intro-copy {
          max-width: 450px;
          padding-bottom: 3px;
        }

        .booking-intro-copy p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.75;
        }

        .booking-progress {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin-top: 25px;
          color: #a29499;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .booking-progress i {
          display: block;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #dfb3c0;
        }

        .booking-progress-active {
          color: var(--rose-dark);
        }

        .booking-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 365px;
          gap: 30px;
          align-items: start;
        }

        .booking-form {
          min-width: 0;
        }

        .booking-section {
          margin-bottom: 18px;
          padding: 31px 32px 34px;
          border: 1px solid var(--line);
          border-radius: 25px;
          background: rgba(255,255,255,.92);
          box-shadow:
            0 1px 0 rgba(255,255,255,.95) inset,
            0 14px 45px rgba(41, 27, 34, .028);
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        .booking-section:hover {
          border-color: rgba(207,107,134,.16);
          box-shadow:
            0 1px 0 rgba(255,255,255,.95) inset,
            0 18px 55px rgba(41, 27, 34, .045);
        }

        .booking-section-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 28px;
        }

        .booking-section-number {
          display: flex;
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(207,107,134,.18);
          border-radius: 50%;
          background: var(--rose-wash);
          color: var(--rose-dark);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .08em;
        }

        .booking-section-kicker {
          margin: 1px 0 0;
          color: var(--rose-dark);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .19em;
          line-height: 1;
          text-transform: uppercase;
        }

        .booking-section-title {
          margin: 8px 0 0;
          color: var(--ink);
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: clamp(24px, 2.5vw, 32px);
          font-weight: 600;
          letter-spacing: -.045em;
          line-height: 1.05;
        }

        .booking-label {
          display: block;
          margin-bottom: 10px;
          color: #74666b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .17em;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .booking-label span {
          color: var(--rose);
        }

        .booking-select-shell,
        .booking-input-shell {
          position: relative;
        }

        .booking-select {
          width: 100%;
          height: 60px;
          appearance: none;
          border: 1px solid rgba(43,29,35,.11);
          border-radius: 17px;
          outline: none;
          background: #fdfcfb;
          color: #32282c;
          padding: 0 54px 0 18px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;
        }

        .booking-select:hover {
          border-color: var(--line-rose);
          background: #fff;
        }

        .booking-select:focus {
          border-color: rgba(207,107,134,.65);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(207,107,134,.08);
        }

        .booking-select-chevron {
          position: absolute;
          top: 50%;
          right: 18px;
          width: 17px;
          height: 17px;
          transform: translateY(-50%);
          color: var(--rose);
          pointer-events: none;
        }

        .booking-selected-service {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 18px;
          padding: 16px 0 0;
          border-top: 1px solid rgba(43,29,35,.065);
        }

        .booking-selected-mark {
          display: flex;
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--rose-soft);
          color: var(--rose);
        }

        .booking-selected-mark svg {
          width: 16px;
          height: 16px;
        }

        .booking-selected-service p,
        .booking-selected-price p {
          margin: 0;
          color: var(--muted-light);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .booking-selected-service strong {
          display: block;
          margin-top: 4px;
          overflow: hidden;
          color: #34282d;
          font-size: 13px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .booking-selected-price {
          margin-left: auto;
          flex: 0 0 auto;
          text-align: right;
        }

        .booking-selected-price strong {
          display: block;
          margin-top: 4px;
          color: var(--rose);
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -.025em;
        }

        .booking-fields-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 23px 20px;
        }

        .booking-input-shell > svg {
          position: absolute;
          left: 17px;
          top: 50%;
          width: 16px;
          height: 16px;
          transform: translateY(-50%);
          color: var(--rose);
          pointer-events: none;
          z-index: 2;
        }

        .booking-at {
          position: absolute;
          left: 18px;
          top: 50%;
          z-index: 2;
          transform: translateY(-50%);
          color: var(--rose);
          font-size: 15px;
          font-weight: 600;
          pointer-events: none;
        }

        .booking-input {
          width: 100%;
          height: 60px;
          border: 1px solid rgba(43,29,35,.11);
          border-radius: 17px;
          outline: none;
          background: #fdfcfb;
          color: #30272b;
          padding: 0 17px 0 47px;
          font-size: 14px;
          font-weight: 500;
          transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;
        }

        .booking-input::placeholder,
        .booking-textarea::placeholder {
          color: #b3a8ac;
        }

        .booking-input:hover,
        .booking-textarea:hover {
          border-color: var(--line-rose);
          background: #fff;
        }

        .booking-input:focus,
        .booking-textarea:focus {
          border-color: rgba(207,107,134,.65);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(207,107,134,.08);
        }

        input[type="date"],
        input[type="time"] {
          color-scheme: light;
        }

        .booking-textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          border: 1px solid rgba(43,29,35,.11);
          border-radius: 17px;
          outline: none;
          background: #fdfcfb;
          color: #30272b;
          padding: 16px 17px;
          font-size: 14px;
          line-height: 1.7;
          transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;
        }

        .booking-notes {
          min-height: 145px;
        }

        .booking-home-row {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 14px;
          border: 1px solid rgba(43,29,35,.095);
          border-radius: 19px;
          background: #fdfcfb;
          padding: 14px;
          text-align: left;
          transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;
        }

        .booking-home-row:hover {
          border-color: var(--line-rose);
          background: #fff;
        }

        .booking-home-row-active {
          border-color: rgba(207,107,134,.35);
          background: #fff7f9;
          box-shadow: 0 12px 32px rgba(207,107,134,.07);
        }

        .booking-home-icon {
          display: flex;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff;
          color: var(--rose);
          box-shadow: 0 4px 16px rgba(43,29,35,.05);
        }

        .booking-home-icon svg {
          width: 17px;
          height: 17px;
        }

        .booking-home-icon-active {
          background: var(--rose);
          color: #fff;
          box-shadow: 0 9px 22px rgba(207,107,134,.23);
        }

        .booking-home-copy {
          min-width: 0;
          flex: 1;
        }

        .booking-home-copy strong {
          display: block;
          color: #33282d;
          font-size: 13px;
          font-weight: 600;
        }

        .booking-home-copy small {
          display: block;
          margin-top: 3px;
          color: #92858a;
          font-size: 11px;
          line-height: 1.5;
        }

        .booking-switch {
          position: relative;
          width: 45px;
          height: 27px;
          flex: 0 0 45px;
          border-radius: 999px;
          background: #dedadc;
          transition: background .2s ease;
        }

        .booking-switch-active {
          background: var(--rose);
        }

        .booking-switch-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 21px;
          height: 21px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 7px rgba(0,0,0,.16);
          transition: transform .2s cubic-bezier(.2,.8,.2,1);
        }

        .booking-switch-knob-active {
          transform: translateX(18px);
        }

        .booking-address-wrap {
          margin-top: 22px;
        }

        .booking-upload-block {
          margin-top: 26px;
        }

        .booking-upload {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 13px;
          border: 1px dashed rgba(207,107,134,.28);
          border-radius: 18px;
          background: #fff9fa;
          padding: 14px;
          text-align: left;
          transition: border-color .18s ease, background .18s ease, transform .18s ease;
        }

        .booking-upload:hover {
          border-color: rgba(207,107,134,.52);
          background: #fff6f8;
          transform: translateY(-1px);
        }

        .booking-upload-icon {
          display: flex;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #fff;
          color: var(--rose);
          box-shadow: 0 5px 16px rgba(43,29,35,.05);
        }

        .booking-upload-icon svg,
        .booking-upload-arrow {
          width: 17px;
          height: 17px;
        }

        .booking-upload-copy {
          min-width: 0;
        }

        .booking-upload-copy strong {
          display: block;
          color: #34282d;
          font-size: 13px;
          font-weight: 600;
        }

        .booking-upload-copy small {
          display: block;
          margin-top: 3px;
          color: #9c8e93;
          font-size: 10px;
        }

        .booking-upload-arrow {
          margin-left: auto;
          color: var(--rose);
        }

        .booking-upload-preview {
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: #fff;
        }

        .booking-upload-preview > img {
          display: block;
          width: 100%;
          height: 210px;
          object-fit: cover;
        }

        .booking-upload-preview-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 13px;
        }

        .booking-file-name {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 8px;
          color: #493b40;
          font-size: 11px;
          font-weight: 600;
        }

        .booking-file-name svg {
          width: 15px;
          height: 15px;
          flex: 0 0 15px;
          color: var(--rose);
        }

        .booking-file-name span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .booking-remove {
          display: flex;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line);
          border-radius: 50%;
          background: #fff;
          color: #75686d;
        }

        .booking-remove:hover {
          border-color: rgba(207,107,134,.35);
          color: var(--rose);
        }

        .booking-aside {
          position: relative;
          min-width: 0;
        }

        .booking-summary {
          position: sticky;
          top: 24px;
          overflow: hidden;
          border: 1px solid rgba(207,107,134,.17);
          border-radius: 25px;
          background: #fff;
          box-shadow:
            0 20px 70px rgba(43,29,35,.07),
            0 1px 0 rgba(255,255,255,.95) inset;
        }

        .booking-summary-header {
          padding: 28px 28px 25px;
          background:
            radial-gradient(circle at 100% 0%, rgba(207,107,134,.11), transparent 55%),
            #fffafb;
        }

        .booking-summary-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--rose-dark);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .booking-summary-eyebrow span {
          width: 20px;
          height: 1px;
          background: var(--rose);
        }

        .booking-summary-header h2 {
          margin: 19px 0 0;
          color: var(--ink);
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 31px;
          font-weight: 600;
          letter-spacing: -.05em;
          line-height: 1.02;
        }

        .booking-summary-header h2 span {
          color: var(--rose);
        }

        .booking-summary-header p {
          margin: 14px 0 0;
          color: #807277;
          font-size: 11px;
          line-height: 1.7;
        }

        .booking-summary-content {
          padding: 22px 28px 25px;
        }

        .booking-summary-service {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .booking-summary-service-mark {
          display: flex;
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: var(--rose-soft);
          color: var(--rose);
        }

        .booking-summary-service-mark svg {
          width: 16px;
          height: 16px;
        }

        .booking-summary-service p {
          margin: 0;
          color: #a28f95;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .booking-summary-service strong {
          display: block;
          margin-top: 4px;
          color: #34282d;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.35;
        }

        .booking-summary-divider {
          height: 1px;
          margin: 20px 0;
          background: rgba(43,29,35,.07);
        }

        .booking-summary-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 0;
        }

        .booking-summary-item-icon {
          display: flex;
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #faf7f7;
          color: var(--rose);
        }

        .booking-summary-item-icon svg {
          width: 14px;
          height: 14px;
        }

        .booking-summary-item p {
          margin: 0;
          color: #a28f95;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .booking-summary-item strong,
        .booking-summary-item > div > p + p {
          display: block;
        }

        .booking-summary-item > div:last-child > p:last-child {
          margin-top: 3px;
          overflow: hidden;
          color: #3c3035;
          font-size: 11px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .booking-summary-price {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 15px;
          margin-top: 14px;
          padding: 18px 0 3px;
          border-top: 1px solid rgba(43,29,35,.07);
        }

        .booking-summary-price span {
          color: #a08e94;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .booking-summary-price strong {
          color: var(--rose);
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -.04em;
        }

        .booking-deposit {
          display: flex;
          gap: 10px;
          margin-top: 18px;
          padding: 13px;
          border: 1px solid rgba(207,107,134,.11);
          border-radius: 16px;
          background: #fff7f9;
        }

        .booking-deposit-mark {
          display: flex;
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff;
          color: var(--rose);
        }

        .booking-deposit-mark svg {
          width: 14px;
          height: 14px;
        }

        .booking-deposit strong {
          display: block;
          color: #3d3035;
          font-size: 10px;
          font-weight: 700;
        }

        .booking-deposit p {
          margin: 4px 0 0;
          color: #8f7f84;
          font-size: 9px;
          line-height: 1.6;
        }

        .booking-whatsapp-note {
          display: flex;
          gap: 8px;
          margin-top: 13px;
          color: #918287;
          font-size: 9px;
          line-height: 1.6;
        }

        .booking-whatsapp-note svg {
          width: 15px;
          height: 15px;
          flex: 0 0 15px;
          color: var(--rose);
        }

        .booking-submit {
          display: flex;
          width: 100%;
          height: 57px;
          align-items: center;
          justify-content: space-between;
          margin-top: 19px;
          border: 0;
          border-radius: 999px;
          background: #2a2024;
          padding: 0 8px 0 20px;
          color: #fff;
          box-shadow: 0 14px 30px rgba(42,32,36,.17);
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .booking-submit:hover {
          background: #20181c;
          box-shadow: 0 18px 38px rgba(42,32,36,.23);
          transform: translateY(-1px);
        }

        .booking-submit:active {
          transform: translateY(0) scale(.99);
        }

        .booking-submit:disabled {
          cursor: not-allowed;
          opacity: .58;
          transform: none;
        }

        .booking-submit-text {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .booking-submit-arrow {
          display: flex;
          width: 41px;
          height: 41px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--rose);
        }

        .booking-submit-arrow svg {
          width: 16px;
          height: 16px;
        }

        .booking-summary-footer {
          border-top: 1px solid rgba(43,29,35,.065);
          padding: 17px 28px 19px;
        }

        .booking-summary-footer strong {
          display: block;
          color: #47383e;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .02em;
        }

        .booking-summary-footer span {
          display: block;
          margin-top: 4px;
          color: #a39499;
          font-size: 9px;
        }

        .booking-mobile-submit {
          padding-bottom: 10px;
        }

        @media (max-width: 1100px) {
          .booking-layout {
            grid-template-columns: minmax(0, 1fr) 330px;
          }

          .booking-intro-grid {
            gap: 45px;
          }
        }

        @media (max-width: 1023px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }

          .booking-aside {
            order: -1;
          }

          .booking-summary {
            position: relative;
            top: auto;
          }

          .booking-summary-header {
            padding: 24px 26px 21px;
          }

          .booking-summary-content {
            padding: 20px 26px 24px;
          }

          .booking-summary-footer {
            padding-left: 26px;
            padding-right: 26px;
          }
        }

        @media (max-width: 767px) {
          .booking-navbar {
            min-height: 68px;
          }

          .booking-main {
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-top: 88px !important;
          }

          .booking-back-row {
            padding-top: 4px;
          }

          .booking-intro {
            padding: 25px 2px 31px;
          }

          .booking-intro-meta {
            margin-bottom: 16px;
          }

          .booking-intro-grid {
            grid-template-columns: 1fr;
            gap: 17px;
          }

          .booking-intro-title {
            font-size: clamp(2.45rem, 12vw, 4rem);
            letter-spacing: -.065em;
          }

          .booking-intro-copy {
            max-width: none;
          }

          .booking-intro-copy p {
            font-size: 13px;
            line-height: 1.65;
          }

          .booking-progress {
            margin-top: 19px;
            gap: 7px;
            font-size: 7px;
          }

          .booking-section {
            margin-bottom: 13px;
            border-radius: 21px;
            padding: 23px 18px 25px;
          }

          .booking-section-header {
            gap: 11px;
            margin-bottom: 22px;
          }

          .booking-section-number {
            width: 31px;
            height: 31px;
            flex-basis: 31px;
            font-size: 8px;
          }

          .booking-section-title {
            font-size: 24px;
          }

          .booking-fields-grid {
            grid-template-columns: 1fr;
            gap: 19px;
          }

          .booking-selected-service {
            align-items: flex-start;
          }

          .booking-selected-price strong {
            font-size: 14px;
          }

          .booking-selected-service strong {
            white-space: normal;
          }

          .booking-input,
          .booking-select {
            height: 57px;
            border-radius: 15px;
          }

          .booking-home-row {
            border-radius: 17px;
          }

          .booking-upload-preview > img {
            height: 175px;
          }

          .booking-summary {
            border-radius: 21px;
          }

          .booking-summary-header h2 {
            font-size: 28px;
          }

          .booking-summary-content {
            padding: 19px 20px 22px;
          }

          .booking-summary-header {
            padding: 22px 20px 20px;
          }

          .booking-summary-footer {
            padding: 16px 20px 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUBCOMPONENTS                                                             */
/* -------------------------------------------------------------------------- */

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="booking-summary-item">
      <div className="booking-summary-item-icon">{icon}</div>

      <div className="min-w-0">
        <p className="m-0 text-[8px] font-bold uppercase tracking-[0.17em] text-[#a08089]">
          {label}
        </p>

        <p className="mt-1 truncate text-[12px] font-medium text-[#3c2a31]">
          {value}
        </p>
      </div>
    </div>
  );
}

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button
      type="submit"
      form="booking-form"
      disabled={isSubmitting}
      className="booking-submit group"
    >
      <span className="booking-submit-text">
        {isSubmitting ? "Procesando solicitud..." : "Solicitar mi reserva"}
      </span>

      <span className="booking-submit-arrow">
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}
