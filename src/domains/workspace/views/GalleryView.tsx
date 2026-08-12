import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  GripVertical,
  Star,
  MoreHorizontal,
  Copy,
  Image as ImageIcon,
  Trash2,
  Upload,
  Loader2,
  StarOff,
  Edit2,
  X,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Images,
} from "lucide-react";
import { supabaseAny as supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { GalleryBulkActions } from "../components/GalleryBulkActions";

// ============================================================
// TYPES
// ============================================================

export interface GalleryProject {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  storage_path: string | null;
  active: boolean;
  is_favorite: boolean;
  display_order: number;
}

const CATEGORIES = [
  "Novias",
  "Social",
  "XV Años",
  "Editorial",
  "Graduación",
  "Artístico",
];

// ============================================================
// SAFE IMAGE
// ============================================================

const SafeImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [error, setError] = useState(false);

  const formattedSrc = src?.startsWith("public/")
    ? `/${src.replace("public/", "")}`
    : src;

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-[#FCF8F9] border border-[#F0E5E8] ${className || ""}`}
      >
        <ImageIcon className="w-7 h-7 text-[#D26E87]/35" strokeWidth={1.4} />
      </div>
    );
  }

  return (
    <img
      src={formattedSrc}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

// ============================================================
// QUERY
// ============================================================

const useGalleryAdmin = () => {
  return useQuery({
    queryKey: ["workspace", "gallery"],
    queryFn: async (): Promise<GalleryProject[]> => {
      const { data, error } = await supabase
        .from("gallery_projects")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw new Error(error.message);

      return data || [];
    },
    staleTime: 1000 * 60 * 2,
  });
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ active }: { active: boolean }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5
        rounded-full
        text-[10px]
        font-bold
        uppercase
        tracking-[0.14em]
        border
        whitespace-nowrap
        ${
          active
            ? "bg-[#EEF8F4] text-[#28785C] border-[#CDE9DD]"
            : "bg-[#F7F4F5] text-admin-text-muted border-admin-neutral/50"
        }
      `}
    >
      {active ? (
        <>
          <Eye className="w-3 h-3" strokeWidth={2} />
          Público
        </>
      ) : (
        <>
          <EyeOff className="w-3 h-3" strokeWidth={2} />
          Oculto
        </>
      )}
    </span>
  );
};

// ============================================================
// GALLERY CARD
// ============================================================

const GalleryCard = ({
  project,
  onEdit,
  selected,
  onSelect,
}: {
  project: GalleryProject;
  onEdit: (p: GalleryProject) => void;
  selected: boolean;
  onSelect: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const queryClient = useQueryClient();

  const handleCategoryChange = async (newCategory: string) => {
    setIsUpdatingCategory(true);

    try {
      const { error } = await supabase
        .from("gallery_projects")
        .update({ category: newCategory })
        .eq("id", project.id);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      toast.success("Categoría actualizada");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const toggleActive = async () => {
    const newActive = !project.active;

    const { error } = await supabase
      .from("gallery_projects")
      .update({ active: newActive })
      .eq("id", project.id);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      toast.success(newActive ? "Proyecto publicado" : "Proyecto oculto");
    }

    setMenuOpen(false);
  };

  const toggleFavorite = async () => {
    try {
      const { error } = await supabase.rpc("toggle_gallery_favorite", {
        p_id: project.id,
        p_favorite: !project.is_favorite,
      });

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      toast.success(
        !project.is_favorite
          ? "Proyecto agregado a destacados"
          : "Proyecto removido de destacados",
      );
    } catch (error: any) {
      if (error.message.includes("MAX_FAVORITES_REACHED")) {
        toast.error(
          "Ya tienes 6 trabajos destacados. Quita uno para seleccionar otro.",
        );
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }

    setMenuOpen(false);
  };

  const duplicate = async () => {
    const { error } = await supabase.from("gallery_projects").insert({
      title: `${project.title} (copia)`,
      category: project.category,
      description: project.description,
      image_url: project.image_url,
      storage_path: null,
      active: false,
      is_favorite: false,
      display_order: project.display_order + 1,
    });

    if (error) {
      toast.error(`Error al duplicar: ${error.message}`);
    } else {
      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      toast.success("Proyecto duplicado");
    }

    setMenuOpen(false);
  };

  const handleDelete = async () => {
    const confirmHard = window.confirm(
      "¿Eliminar proyecto?\n\nEsta acción eliminará permanentemente este trabajo del portafolio.",
    );

    if (!confirmHard) {
      setMenuOpen(false);
      return;
    }

    try {
      if (project.storage_path) {
        await supabase.storage
          .from("public-assets")
          .remove([project.storage_path]);
      }

      const { error } = await supabase
        .from("gallery_projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Proyecto eliminado");

      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      setMenuOpen(false);
    } catch (err: any) {
      toast.error(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex items-stretch gap-3 sm:gap-4"
    >
      {/* ========================================================
          LEFT ACTION RAIL
          ======================================================== */}

      <div className="w-9 sm:w-10 shrink-0 flex flex-col items-center justify-center gap-4">
        {/* Selection */}

        <button
          type="button"
          onClick={onSelect}
          aria-label={
            selected ? "Deseleccionar proyecto" : "Seleccionar proyecto"
          }
          className={`
            relative w-7 h-7 sm:w-8 sm:h-8
            rounded-lg
            border
            flex items-center justify-center
            transition-all duration-200
            ${
              selected
                ? "bg-[#D26E87] border-[#D26E87] shadow-[0_5px_16px_rgba(210,110,135,0.25)]"
                : "bg-admin-surface border-admin-neutral/60 hover:border-[#D26E87]/50 hover:bg-[#FFF8FA]"
            }
          `}
        >
          {selected && (
            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
          )}
        </button>

        {/* Drag */}

        <div
          className="
            w-8 h-8
            rounded-lg
            flex items-center justify-center
            text-admin-text-muted/35
            group-hover:text-admin-text-muted/65
            hover:bg-admin-surface-2
            cursor-grab
            active:cursor-grabbing
            transition-all
          "
          title="Arrastrar para reordenar"
        >
          <GripVertical className="w-4 h-4" strokeWidth={1.6} />
        </div>
      </div>

      {/* ========================================================
          MAIN CARD
          ======================================================== */}

      <div
        className={`
          relative flex-1 min-w-0
          overflow-visible
          rounded-[24px]
          border
          bg-admin-surface
          transition-all duration-300
          ${
            selected
              ? "border-[#D26E87]/45 ring-4 ring-[#D26E87]/[0.06] shadow-[0_12px_35px_rgba(210,110,135,0.08)]"
              : "border-admin-neutral/45 shadow-[0_4px_20px_rgba(45,32,37,0.025)] hover:border-[#D26E87]/25 hover:shadow-[0_12px_35px_rgba(45,32,37,0.06)]"
          }
        `}
      >
        <div className="flex flex-col lg:flex-row min-h-[190px]">
          {/* ====================================================
              IMAGE
              ==================================================== */}

          <div
            className="
              relative
              w-full
              lg:w-[190px]
              xl:w-[205px]
              shrink-0
              aspect-[4/3]
              lg:aspect-auto
              lg:min-h-[190px]
              overflow-hidden
              rounded-t-[23px]
              lg:rounded-l-[23px]
              lg:rounded-tr-none
              bg-admin-surface-2
            "
          >
            <SafeImage
              src={project.image_url}
              alt={project.title}
              className="
                w-full
                h-full
                object-cover
                transition-transform
                duration-700
                ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:scale-[1.035]
              "
            />

            {/* subtle image gradient */}

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Featured badge */}

            {project.is_favorite && (
              <div
                className="
                  absolute
                  left-3
                  bottom-3
                  inline-flex
                  items-center
                  gap-1.5
                  px-3
                  py-1.5
                  rounded-full
                  bg-white/95
                  backdrop-blur-md
                  shadow-[0_5px_18px_rgba(45,32,37,0.14)]
                  text-[#9C6E00]
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                "
              >
                <Star className="w-3 h-3 fill-current" strokeWidth={1.8} />
                Destacado
              </div>
            )}

            {!project.active && (
              <div
                className="
                  absolute
                  top-3
                  left-3
                  px-2.5
                  py-1
                  rounded-full
                  bg-black/55
                  backdrop-blur-md
                  text-white
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                "
              >
                Oculto
              </div>
            )}
          </div>

          {/* ====================================================
              CONTENT
              ==================================================== */}

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="p-5 sm:p-6 lg:p-7 flex-1">
              {/* Top */}

              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <h3
                      className="
                        text-[19px]
                        sm:text-[20px]
                        font-semibold
                        text-admin-text
                        tracking-[-0.02em]
                        truncate
                      "
                    >
                      {project.title}
                    </h3>

                    {project.is_favorite && (
                      <Star
                        className="w-4 h-4 shrink-0 text-[#B28A12] fill-[#B28A12]"
                        strokeWidth={1.8}
                      />
                    )}
                  </div>

                  {/* Category */}

                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={project.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      disabled={isUpdatingCategory}
                      className="
                        appearance-none
                        min-w-[125px]
                        px-3.5
                        py-2
                        pr-8
                        rounded-full
                        bg-[#FBEFF3]
                        border
                        border-[#F1DCE3]
                        text-[#754457]
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        outline-none
                        cursor-pointer
                        transition-all
                        hover:border-[#D26E87]/40
                        focus:border-[#D26E87]
                        disabled:opacity-50
                        bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23754457%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')]
                        bg-no-repeat
                        bg-[right_10px_center]
                      "
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {isUpdatingCategory && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D26E87]" />
                    )}
                  </div>
                </div>

                {/* Status */}

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge active={project.active} />

                  {project.is_favorite && (
                    <span
                      className="
                        hidden sm:inline-flex
                        items-center
                        gap-1.5
                        px-3
                        py-1.5
                        rounded-full
                        bg-[#FFF8E4]
                        border
                        border-[#F0E2B5]
                        text-[#9B7710]
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.13em]
                      "
                    >
                      <Star
                        className="w-3 h-3 fill-current"
                        strokeWidth={1.8}
                      />
                      Top 6
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}

              <p
                className="
                  mt-5
                  text-[13px]
                  sm:text-[14px]
                  leading-relaxed
                  text-admin-text-muted
                  font-light
                  max-w-2xl
                  line-clamp-2
                "
              >
                {project.description || "Sin descripción agregada."}
              </p>
            </div>

            {/* Bottom action bar */}

            <div
              className="
                px-5
                sm:px-6
                lg:px-7
                py-4
                border-t
                border-admin-neutral/35
                flex
                flex-wrap
                items-center
                justify-between
                gap-3
              "
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(project)}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    h-10
                    rounded-full
                    bg-admin-text
                    text-admin-bg
                    text-[12px]
                    font-semibold
                    tracking-wide
                    transition-all
                    hover:bg-admin-accent-dark
                    hover:-translate-y-0.5
                    hover:shadow-[0_8px_20px_rgba(45,32,37,0.15)]
                    active:scale-[0.98]
                  "
                >
                  <Edit2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                  Editar
                </button>

                <button
                  onClick={toggleFavorite}
                  className={`
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    h-10
                    rounded-full
                    text-[12px]
                    font-semibold
                    tracking-wide
                    transition-all
                    active:scale-[0.98]
                    ${
                      project.is_favorite
                        ? "bg-[#FFF7DC] border border-[#EEDC9B] text-[#94710A] hover:bg-[#FFF2C7]"
                        : "bg-admin-surface-2 border border-admin-neutral/45 text-admin-text-muted hover:text-admin-text hover:border-admin-neutral"
                    }
                  `}
                >
                  {project.is_favorite ? (
                    <>
                      <StarOff className="w-3.5 h-3.5" strokeWidth={1.8} />
                      Quitar destacado
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5" strokeWidth={1.8} />
                      Destacar
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  aria-label="Más opciones"
                  className={`
                    w-10 h-10
                    rounded-full
                    flex
                    items-center
                    justify-center
                    transition-all
                    ${
                      menuOpen
                        ? "bg-admin-surface-2 text-admin-text"
                        : "text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2"
                    }
                  `}
                >
                  <MoreHorizontal className="w-5 h-5" strokeWidth={1.7} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 5,
                        scale: 0.97,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: 5,
                        scale: 0.97,
                      }}
                      transition={{
                        duration: 0.18,
                      }}
                      className="
                        absolute
                        right-0
                        bottom-full
                        mb-2
                        w-52
                        bg-admin-surface
                        rounded-2xl
                        shadow-[0_18px_55px_rgba(45,32,37,0.16)]
                        border
                        border-admin-neutral/50
                        overflow-hidden
                        z-50
                        origin-bottom-right
                      "
                    >
                      <div className="p-1.5">
                        <button
                          onClick={toggleActive}
                          className="
                            w-full
                            text-left
                            px-3.5
                            py-3
                            rounded-xl
                            text-[13px]
                            font-medium
                            text-admin-text
                            hover:bg-admin-surface-2
                            flex
                            items-center
                            gap-3
                            transition-colors
                          "
                        >
                          {project.active ? (
                            <EyeOff className="w-4 h-4 text-admin-text-muted" />
                          ) : (
                            <Eye className="w-4 h-4 text-admin-text-muted" />
                          )}

                          {project.active
                            ? "Ocultar proyecto"
                            : "Hacer público"}
                        </button>

                        <button
                          onClick={duplicate}
                          className="
                            w-full
                            text-left
                            px-3.5
                            py-3
                            rounded-xl
                            text-[13px]
                            font-medium
                            text-admin-text
                            hover:bg-admin-surface-2
                            flex
                            items-center
                            gap-3
                            transition-colors
                          "
                        >
                          <Copy className="w-4 h-4 text-admin-text-muted" />
                          Duplicar
                        </button>

                        <div className="h-px bg-admin-neutral/40 my-1" />

                        <button
                          onClick={handleDelete}
                          className="
                            w-full
                            text-left
                            px-3.5
                            py-3
                            rounded-xl
                            text-[13px]
                            font-medium
                            text-admin-error
                            hover:bg-admin-error/5
                            flex
                            items-center
                            gap-3
                            transition-colors
                          "
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar proyecto
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// EDIT SLIDE OVER
// ============================================================

const GallerySlideOver = ({
  project,
  onClose,
}: {
  project: GalleryProject;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const initial = { ...(project as GalleryProject) };

  const [form, setForm] = useState<Partial<GalleryProject>>(initial);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputClass = `
    w-full
    px-5
    py-4
    bg-admin-surface-2
    border
    border-admin-neutral/50
    rounded-2xl
    text-[15px]
    font-light
    text-admin-text
    focus:outline-none
    focus:border-admin-accent-dark
    focus:ring-4
    focus:ring-admin-accent-dark/5
    transition-all
    placeholder:text-admin-text-muted/50
    appearance-none
  `;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();

      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;

      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public-assets")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("public-assets").getPublicUrl(filePath);

      if (form.storage_path) {
        await supabase.storage
          .from("public-assets")
          .remove([form.storage_path]);
      }

      setForm((prev) => ({
        ...prev,
        image_url: publicUrl,
        storage_path: filePath,
      }));

      toast.success("Imagen actualizada");
    } catch (err: any) {
      toast.error(`Error al subir imagen: ${err.message}`);
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const save = async () => {
    if (!form.title || !form.image_url) {
      toast.error("Título e imagen son requeridos");
      return;
    }

    setLoading(true);

    try {
      if (form.is_favorite && !project.is_favorite) {
        const { count } = await supabase
          .from("gallery_projects")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("is_favorite", true)
          .neq("id", form.id || "00000000-0000-0000-0000-000000000000");

        if (count !== null && count >= 6) {
          toast.error(
            "Ya tienes 6 trabajos destacados. Quita uno para poder seleccionar este.",
          );

          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from("gallery_projects")
        .update({
          title: form.title,
          category: form.category,
          description: form.description,
          image_url: form.image_url,
          storage_path: form.storage_path,
          active: form.active,
          is_favorite: form.is_favorite,
        })
        .eq("id", form.id);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      toast.success("Proyecto actualizado");

      onClose();
    } catch (err: any) {
      if (err.message?.includes("MAX_FAVORITES_REACHED")) {
        toast.error(
          "Ya tienes 6 trabajos destacados. Quita uno para poder seleccionar este.",
        );
      } else {
        toast.error(`Error al guardar: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-admin-bg/45 backdrop-blur-md"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "spring",
          damping: 28,
          stiffness: 300,
        }}
        className="
          relative
          w-full
          max-w-xl
          bg-admin-surface
          h-full
          border-l
          border-admin-neutral/50
          shadow-[-20px_0_70px_rgba(45,32,37,0.12)]
          flex
          flex-col
          font-admin-sans
        "
      >
        {/* Header */}

        <div className="px-6 sm:px-8 py-6 border-b border-admin-neutral/40 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D26E87]">
              Galería
            </span>

            <h2 className="text-2xl font-semibold text-admin-text tracking-tight mt-1">
              Editar proyecto
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              w-10
              h-10
              flex
              items-center
              justify-center
              rounded-full
              text-admin-text-muted
              hover:text-admin-text
              hover:bg-admin-surface-2
              transition-all
            "
          >
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-9">
          {/* Image */}

          <section className="space-y-4">
            <div>
              <h3 className="text-[12px] font-bold text-admin-text uppercase tracking-[0.14em]">
                Imagen
              </h3>

              <p className="text-[12px] text-admin-text-muted mt-1">
                Utiliza una fotografía vertical de buena calidad.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="relative w-36 h-44 rounded-[22px] overflow-hidden bg-admin-surface-2 border border-admin-neutral/50 shrink-0 group shadow-sm">
                {form.image_url ? (
                  <SafeImage
                    src={form.image_url}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-admin-text-muted/40" />
                )}

                <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="
                      w-11
                      h-11
                      rounded-full
                      bg-white
                      text-admin-text
                      flex
                      items-center
                      justify-center
                      shadow-lg
                    "
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[13px] text-admin-text-muted leading-relaxed font-light">
                  La imagen se almacenará en el sistema y se utilizará tanto en
                  la galería como en el portafolio público.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="
                    mt-5
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    h-10
                    rounded-full
                    border
                    border-admin-neutral/50
                    text-[12px]
                    font-semibold
                    text-admin-text
                    hover:bg-admin-surface-2
                    transition-colors
                  "
                >
                  <Upload className="w-3.5 h-3.5" />
                  Cambiar imagen
                </button>
              </div>
            </div>
          </section>

          {/* Information */}

          <section className="space-y-5">
            <div>
              <h3 className="text-[12px] font-bold text-admin-text uppercase tracking-[0.14em]">
                Información
              </h3>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.13em] mb-2.5">
                Título del trabajo
              </label>

              <input
                type="text"
                value={form.title || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="Ej. Look Glam"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.13em] mb-2.5">
                Categoría
              </label>

              <select
                value={form.category || CATEGORIES[0]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.13em] mb-2.5">
                Descripción
              </label>

              <textarea
                value={form.description || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="Describe brevemente este look..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
          </section>

          {/* Status */}

          <section className="space-y-4">
            <div>
              <h3 className="text-[12px] font-bold text-admin-text uppercase tracking-[0.14em]">
                Visibilidad
              </h3>
            </div>

            <div className="rounded-[22px] border border-admin-neutral/40 overflow-hidden">
              {[
                {
                  key: "active",
                  label: "Publicado",
                  desc: "El proyecto será visible en el portafolio público.",
                  icon: form.active ? (
                    <Eye className="w-4 h-4 text-[#28785C]" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-admin-text-muted" />
                  ),
                },
                {
                  key: "is_favorite",
                  label: "Destacado",
                  desc: "Aparecerá entre los protagonistas de la Landing. Máximo 6.",
                  icon: (
                    <Star
                      className="w-4 h-4 text-[#B28A12] fill-[#B28A12]"
                      strokeWidth={1.5}
                    />
                  ),
                },
              ].map(({ key, label, desc, icon }, index) => (
                <div
                  key={key}
                  className={`
                    flex
                    items-center
                    justify-between
                    gap-5
                    px-5
                    py-5
                    ${index === 0 ? "border-b border-admin-neutral/35" : ""}
                  `}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-admin-surface-2 flex items-center justify-center shrink-0">
                      {icon}
                    </div>

                    <div>
                      <span className="text-[14px] text-admin-text font-semibold">
                        {label}
                      </span>

                      <p className="text-[12px] text-admin-text-muted font-light mt-0.5 max-w-sm">
                        {desc}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        [key]: !(p as any)[key],
                      }))
                    }
                    className={`
                      relative
                      w-11
                      h-6
                      rounded-full
                      shrink-0
                      transition-colors
                      ${
                        (form as any)[key] !== false
                          ? "bg-admin-accent-dark"
                          : "bg-admin-surface-2 border border-admin-neutral/50"
                      }
                    `}
                  >
                    <span
                      className={`
                        absolute
                        top-[2px]
                        left-[2px]
                        w-5
                        h-5
                        rounded-full
                        bg-white
                        shadow-sm
                        transition-transform
                        ${
                          (form as any)[key] !== false
                            ? "translate-x-5"
                            : "translate-x-0"
                        }
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}

        <div className="p-5 sm:p-7 border-t border-admin-neutral/40 bg-admin-surface shrink-0">
          <button
            onClick={save}
            disabled={loading || uploading}
            className="
              w-full
              h-13
              py-4
              bg-admin-text
              text-admin-bg
              text-[13px]
              font-semibold
              rounded-2xl
              hover:bg-admin-accent-dark
              transition-all
              disabled:opacity-50
              shadow-[0_8px_25px_rgba(45,32,37,0.12)]
              hover:shadow-[0_12px_30px_rgba(45,32,37,0.18)]
            "
          >
            {loading ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// MASS UPLOAD
// ============================================================

interface UploadFile {
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
  category: string;
}

const GalleryMassUploadModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [globalCategory, setGlobalCategory] = useState(CATEGORIES[0]);
  const [globalActive, setGlobalActive] = useState(true);
  const [globalFavorite, setGlobalFavorite] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | File[]) => {
    const newUploadFiles: UploadFile[] = Array.from(newFiles).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
      category: globalCategory,
    }));

    setFiles((prev) => [...prev, ...newUploadFiles]);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.dataTransfer.files?.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];

      URL.revokeObjectURL(updated[index].previewUrl);

      updated.splice(index, 1);

      return updated;
    });
  };

  const uploadFile = async (f: UploadFile): Promise<UploadFile> => {
    try {
      const fileExt = f.file.name.split(".").pop();

      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;

      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public-assets")
        .upload(filePath, f.file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("public-assets").getPublicUrl(filePath);

      const title = f.file.name.replace(/\.[^/.]+$/, "");

      const { error: dbError } = await supabase
        .from("gallery_projects")
        .insert({
          title,
          category: f.category,
          description: "",
          image_url: publicUrl,
          storage_path: filePath,
          active: globalActive,
          is_favorite: globalFavorite,
          display_order: 999,
        });

      if (dbError) throw dbError;

      return {
        ...f,
        status: "success",
      };
    } catch (err: any) {
      return {
        ...f,
        status: "error",
        errorMessage: err.message,
      };
    }
  };

  const startUpload = async () => {
    if (globalFavorite) {
      const pendingFavorites = files.filter(
        (f) => f.status === "pending" || f.status === "error",
      ).length;

      if (pendingFavorites > 0) {
        const { count } = await supabase
          .from("gallery_projects")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("is_favorite", true);

        if (count !== null && count + pendingFavorites > 6) {
          toast.error(
            `No puedes subir ${pendingFavorites} favoritos. Ya tienes ${count} destacados (Límite: 6).`,
          );

          return;
        }
      }
    }

    setIsUploading(true);

    const pendingIndexes = files
      .map((f, i) => (f.status === "pending" || f.status === "error" ? i : -1))
      .filter((i) => i !== -1);

    const BATCH_SIZE = 3;

    for (let i = 0; i < pendingIndexes.length; i += BATCH_SIZE) {
      const batch = pendingIndexes.slice(i, i + BATCH_SIZE);

      setFiles((prev) => {
        const next = [...prev];

        batch.forEach((idx) => (next[idx].status = "uploading"));

        return next;
      });

      const results = await Promise.all(
        batch.map((idx) => uploadFile(files[idx])),
      );

      setFiles((prev) => {
        const next = [...prev];

        batch.forEach((idx, localI) => {
          next[idx] = results[localI];
        });

        return next;
      });
    }

    queryClient.invalidateQueries({
      queryKey: ["workspace", "gallery"],
    });

    queryClient.invalidateQueries({
      queryKey: ["landing_gallery"],
    });

    setIsUploading(false);
  };

  const successfulCount = files.filter((f) => f.status === "success").length;

  const totalCount = files.length;

  const allDone =
    totalCount > 0 &&
    files.every((f) => f.status === "success" || f.status === "error");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isUploading ? undefined : onClose}
        className="absolute inset-0 bg-admin-bg/45 backdrop-blur-md"
      />

      <motion.div
        initial={{
          scale: 0.97,
          opacity: 0,
          y: 10,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
        }}
        exit={{
          scale: 0.97,
          opacity: 0,
          y: 10,
        }}
        className="
          relative
          w-full
          max-w-5xl
          bg-admin-surface
          sm:rounded-[28px]
          shadow-[0_30px_100px_rgba(45,32,37,0.18)]
          overflow-hidden
          flex
          flex-col
          h-[100dvh]
          sm:h-auto
          sm:max-h-[92vh]
          font-admin-sans
          border
          border-admin-neutral/40
        "
      >
        {/* Header */}

        <div className="px-6 sm:px-8 py-6 border-b border-admin-neutral/40 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-[#FBE8EE] flex items-center justify-center">
                <Images
                  className="w-3.5 h-3.5 text-[#D26E87]"
                  strokeWidth={1.8}
                />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D26E87]">
                Galería
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-admin-text tracking-tight">
              Subir proyectos
            </h2>

            <p className="text-[13px] font-light text-admin-text-muted mt-1">
              Agrega varios trabajos de maquillaje en una sola operación.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="
              w-10
              h-10
              rounded-full
              flex
              items-center
              justify-center
              text-admin-text-muted
              hover:text-admin-text
              hover:bg-admin-surface-2
              transition-all
              disabled:opacity-50
            "
          >
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col gap-7">
          {/* Global controls */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-4
              p-5
              rounded-[22px]
              bg-[#FCF8F9]
              border
              border-[#F0E5E8]
            "
          >
            <div>
              <label className="block text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-2.5">
                Categoría
              </label>

              <select
                value={globalCategory}
                onChange={(e) => setGlobalCategory(e.target.value)}
                disabled={isUploading}
                className="
                  w-full
                  px-4
                  py-3
                  bg-white
                  border
                  border-admin-neutral/40
                  rounded-2xl
                  text-[13px]
                  text-admin-text
                  focus:outline-none
                  focus:border-[#D26E87]
                  transition-colors
                  font-medium
                "
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <label
              className="
                flex
                items-center
                gap-3
                p-3
                rounded-2xl
                hover:bg-white
                cursor-pointer
                transition-colors
              "
            >
              <input
                type="checkbox"
                checked={globalActive}
                onChange={(e) => setGlobalActive(e.target.checked)}
                disabled={isUploading}
                className="
                  w-5
                  h-5
                  rounded-md
                  border-admin-neutral/50
                  text-admin-accent-dark
                  focus:ring-admin-accent-dark
                "
              />

              <div>
                <span className="text-[13px] font-semibold text-admin-text">
                  Publicar automáticamente
                </span>

                <p className="text-[11px] text-admin-text-muted mt-0.5">
                  Visible en el portafolio
                </p>
              </div>
            </label>

            <label
              className="
                flex
                items-center
                gap-3
                p-3
                rounded-2xl
                hover:bg-white
                cursor-pointer
                transition-colors
              "
            >
              <input
                type="checkbox"
                checked={globalFavorite}
                onChange={(e) => setGlobalFavorite(e.target.checked)}
                disabled={isUploading}
                className="
                  w-5
                  h-5
                  rounded-md
                  border-[#E8D9A5]
                  text-[#B28A12]
                  focus:ring-[#B28A12]
                "
              />

              <div>
                <span className="text-[13px] font-semibold text-admin-text flex items-center gap-1.5">
                  Destacar
                  <Star className="w-3 h-3 text-[#B28A12] fill-[#B28A12]" />
                </span>

                <p className="text-[11px] text-admin-text-muted mt-0.5">
                  Máximo 6 protagonistas
                </p>
              </div>
            </label>
          </div>

          {/* Dropzone */}

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={isUploading ? undefined : onDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative
              border
              rounded-[24px]
              px-6
              py-12
              text-center
              transition-all
              duration-300
              ${
                isUploading
                  ? "opacity-50 border-admin-neutral/40 bg-admin-surface-2"
                  : "border-dashed border-[#E5D2D9] bg-[#FEFAFB] hover:border-[#D26E87]/50 hover:bg-[#FFF8FA] cursor-pointer"
              }
            `}
          >
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-white border border-[#F0E1E6] shadow-[0_8px_25px_rgba(210,110,135,0.08)] flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#D26E87]" strokeWidth={1.5} />
            </div>

            <p className="text-[15px] font-semibold text-admin-text mb-1">
              Arrastra tus fotos aquí
            </p>

            <p className="text-[13px] font-light text-admin-text-muted">
              o haz clic para seleccionar varias imágenes
            </p>

            <span className="inline-block mt-4 text-[10px] uppercase tracking-[0.15em] font-bold text-[#D26E87]">
              JPG · PNG · WEBP
            </span>

            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={isUploading}
            />
          </div>

          {/* Files */}

          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-admin-text">
                    Proyectos preparados
                  </h3>

                  <p className="text-[12px] text-admin-text-muted mt-0.5">
                    {files.length} {files.length === 1 ? "imagen" : "imágenes"}{" "}
                    seleccionadas
                  </p>
                </div>

                {isUploading && (
                  <span className="px-3 py-1.5 rounded-full bg-[#FBE8EE] text-[#D26E87] text-[10px] font-bold uppercase tracking-[0.12em]">
                    {successfulCount} / {totalCount}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="
                      relative
                      group
                      bg-admin-surface
                      border
                      border-admin-neutral/40
                      rounded-[20px]
                      overflow-hidden
                      aspect-[4/5]
                      shadow-[0_4px_20px_rgba(45,32,37,0.03)]
                    "
                  >
                    <img
                      src={file.previewUrl}
                      alt={file.file.name}
                      className="
                        w-full
                        h-[68%]
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-[1.03]
                      "
                    />

                    <div className="absolute inset-x-0 bottom-0 h-[32%] bg-admin-surface border-t border-admin-neutral/35 p-3 flex flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-semibold text-admin-text truncate"
                          title={file.file.name}
                        >
                          {file.file.name}
                        </span>

                        {file.status === "success" && (
                          <div className="w-5 h-5 rounded-full bg-[#E8F7F0] flex items-center justify-center shrink-0">
                            <Check
                              className="w-3 h-3 text-[#28785C]"
                              strokeWidth={2.5}
                            />
                          </div>
                        )}

                        {file.status === "error" && (
                          <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                            <X
                              className="w-3 h-3 text-admin-error"
                              strokeWidth={2}
                            />
                          </div>
                        )}

                        {file.status === "uploading" && (
                          <Loader2 className="w-4 h-4 text-[#D26E87] animate-spin shrink-0" />
                        )}
                      </div>

                      <select
                        value={file.category}
                        onChange={(e) => {
                          const newCat = e.target.value;

                          setFiles((prev) => {
                            const updated = [...prev];

                            updated[idx].category = newCat;

                            return updated;
                          });
                        }}
                        disabled={isUploading || file.status === "success"}
                        className="
                          w-full
                          px-2.5
                          py-1.5
                          text-[9px]
                          font-bold
                          tracking-[0.12em]
                          uppercase
                          bg-admin-surface-2
                          border
                          border-admin-neutral/50
                          rounded-lg
                          text-admin-text-muted
                          focus:outline-none
                          focus:border-[#D26E87]
                          disabled:opacity-50
                        "
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!isUploading && file.status !== "success" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="
                            absolute
                            top-2
                            right-2
                            w-8
                            h-8
                            rounded-full
                            bg-black/55
                            backdrop-blur-md
                            text-white
                            flex
                            items-center
                            justify-center
                            opacity-0
                            group-hover:opacity-100
                            hover:bg-admin-error
                            transition-all
                          "
                        title="Quitar imagen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="p-4 sm:p-6 border-t border-admin-neutral/40 bg-admin-surface flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="
              w-full
              sm:w-auto
              px-6
              h-12
              rounded-full
              text-[12px]
              font-semibold
              text-admin-text-muted
              hover:text-admin-text
              hover:bg-admin-surface-2
              transition-colors
              disabled:opacity-50
            "
          >
            {allDone ? "Cerrar" : "Cancelar"}
          </button>

          {totalCount > 0 && !allDone && (
            <button
              onClick={startUpload}
              disabled={isUploading}
              className="
                  w-full
                  sm:w-auto
                  px-7
                  h-12
                  rounded-full
                  text-[12px]
                  font-bold
                  text-admin-bg
                  bg-admin-text
                  hover:bg-admin-accent-dark
                  uppercase
                  tracking-[0.1em]
                  transition-all
                  shadow-[0_8px_24px_rgba(45,32,37,0.14)]
                  disabled:opacity-50
                  flex
                  items-center
                  justify-center
                  gap-2
                "
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Subir {
                    files.filter((f) => f.status !== "success").length
                  }{" "}
                  proyectos
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// GALLERY VIEW
// ============================================================

export const GalleryView = () => {
  const { data: projects = [], isLoading } = useGalleryAdmin();

  const queryClient = useQueryClient();

  const [editingProject, setEditingProject] = useState<
    GalleryProject | "mass-upload" | null
  >(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [, setBulkUpdating] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkCategoryChange = async (newCategory: string) => {
    if (selectedIds.length === 0) return;

    setBulkUpdating(true);

    try {
      const { error } = await supabase
        .from("gallery_projects")
        .update({
          category: newCategory,
        })
        .in("id", selectedIds);

      if (error) throw error;

      toast.success(`${selectedIds.length} proyectos categorizados`);

      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      setSelectedIds([]);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkFavorite = async () => {
    if (selectedIds.length === 0) return;

    setBulkUpdating(true);

    try {
      // Obtener únicamente los proyectos actualmente seleccionados
      const selectedProjects = projects.filter((project) =>
        selectedIds.includes(project.id),
      );

      // Si TODOS están destacados → quitar destacado a todos.
      // Si hay al menos uno que NO está destacado → destacar todos.
      const allAreFavorite =
        selectedProjects.length > 0 &&
        selectedProjects.every((project) => project.is_favorite);

      const nextFavorite = !allAreFavorite;

      // Si vamos a destacar, validar límite de 6
      if (nextFavorite) {
        const currentlyFavoriteOutsideSelection = projects.filter(
          (project) => project.is_favorite && !selectedIds.includes(project.id),
        ).length;

        const availableSlots = 6 - currentlyFavoriteOutsideSelection;

        if (selectedIds.length > availableSlots) {
          toast.error(
            `No se pueden destacar todos. Solo hay ${availableSlots} espacio${
              availableSlots === 1 ? "" : "s"
            } disponible${
              availableSlots === 1 ? "" : "s"
            } de los 6 destacados.`,
          );

          setBulkUpdating(false);
          return;
        }
      }

      const { error } = await supabase
        .from("gallery_projects")
        .update({
          is_favorite: nextFavorite,
        })
        .in("id", selectedIds);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      toast.success(
        nextFavorite
          ? `${selectedIds.length} ${
              selectedIds.length === 1
                ? "proyecto destacado"
                : "proyectos destacados"
            }`
          : `${selectedIds.length} ${
              selectedIds.length === 1
                ? "proyecto removido de destacados"
                : "proyectos removidos de destacados"
            }`,
      );

      setSelectedIds([]);
    } catch (err: any) {
      if (err.message?.includes("MAX_FAVORITES_REACHED")) {
        toast.error("La Landing permite un máximo de 6 proyectos destacados.");
      } else {
        toast.error(`Error: ${err.message}`);
      }
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkVisibility = async (publicVisible: boolean) => {
    if (selectedIds.length === 0) return;

    setBulkUpdating(true);

    try {
      const { error } = await supabase
        .from("gallery_projects")
        .update({
          active: publicVisible,
        })
        .in("id", selectedIds);

      if (error) throw error;

      toast.success(
        `${selectedIds.length} proyectos marcados como ${
          publicVisible ? "públicos" : "ocultos"
        }`,
      );

      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      setSelectedIds([]);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setBulkUpdating(true);

    try {
      const { error } = await supabase
        .from("gallery_projects")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      toast.success(`${selectedIds.length} proyectos eliminados`);

      queryClient.invalidateQueries({
        queryKey: ["workspace", "gallery"],
      });

      queryClient.invalidateQueries({
        queryKey: ["landing_gallery"],
      });

      setSelectedIds([]);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setBulkUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#FBE8EE] flex items-center justify-center">
            <Loader2
              className="w-5 h-5 animate-spin text-[#D26E87]"
              strokeWidth={1.8}
            />
          </div>

          <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-admin-text-muted">
            Cargando galería
          </span>
        </div>
      </div>
    );
  }

  const featuredProjects = projects.filter((project) => project.is_favorite);

  const regularProjects = projects.filter((project) => !project.is_favorite);

  const featuredCount = featuredProjects.length;

  return (
    <div className="max-w-6xl mx-auto pb-28">
      {/* ========================================================
          PAGE HEADER
          ======================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#D26E87] shadow-[0_0_0_5px_rgba(210,110,135,0.08)]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D26E87]">
              Workspace
            </span>
          </div>

          <h1 className="text-[34px] sm:text-[40px] font-semibold text-admin-text tracking-[-0.04em] leading-none">
            Galería
          </h1>

          <p className="text-[14px] sm:text-[15px] text-admin-text-muted font-light max-w-2xl leading-relaxed mt-3">
            Organiza tus trabajos, controla su visibilidad y decide cuáles
            merecen aparecer como protagonistas en tu Landing Page.
          </p>
        </div>

        <button
          onClick={() => setEditingProject("mass-upload")}
          className="
            group
            inline-flex
            items-center
            justify-center
            gap-2.5
            px-6
            h-12
            rounded-full
            bg-admin-text
            text-admin-bg
            text-[12px]
            font-semibold
            tracking-wide
            shadow-[0_10px_28px_rgba(45,32,37,0.13)]
            hover:bg-admin-accent-dark
            hover:-translate-y-0.5
            hover:shadow-[0_14px_34px_rgba(45,32,37,0.18)]
            transition-all
            shrink-0
          "
        >
          <Plus
            className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300"
            strokeWidth={1.8}
          />
          Agregar fotos
        </button>
      </div>

      {/* ========================================================
          GLOBAL SUMMARY
          ======================================================== */}

      {projects.length > 0 && (
        <div
          className="
            grid
            grid-cols-2
            sm:grid-cols-3
            gap-3
            mb-10
          "
        >
          <div className="rounded-[20px] border border-admin-neutral/40 bg-admin-surface px-5 py-4">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-admin-text-muted">
              Total
            </span>

            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-semibold text-admin-text tracking-tight">
                {projects.length}
              </span>

              <span className="text-[11px] text-admin-text-muted mb-1">
                trabajos
              </span>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#F0DCE3] bg-[#FFF9FB] px-5 py-4">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#B83265]">
              Destacados
            </span>

            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-semibold text-admin-text tracking-tight">
                {featuredCount}
              </span>

              <span className="text-[11px] text-admin-text-muted mb-1">
                / 6 disponibles
              </span>
            </div>
          </div>

          <div className="hidden sm:block rounded-[20px] border border-[#DDECE5] bg-[#FAFDFC] px-5 py-4">
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#28785C]">
              Públicos
            </span>

            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-semibold text-admin-text tracking-tight">
                {projects.filter((project) => project.active).length}
              </span>

              <span className="text-[11px] text-admin-text-muted mb-1">
                visibles
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONTENT
          ======================================================== */}

      {projects.length === 0 ? (
        <div
          className="
            rounded-[28px]
            border
            border-dashed
            border-admin-neutral/50
            bg-admin-surface
            py-24
            px-6
            text-center
          "
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FBE8EE] flex items-center justify-center mb-5">
            <ImageIcon className="w-7 h-7 text-[#D26E87]" strokeWidth={1.4} />
          </div>

          <h2 className="text-[19px] font-semibold text-admin-text tracking-tight">
            Tu galería está vacía
          </h2>

          <p className="text-[13px] text-admin-text-muted font-light mt-2 max-w-md mx-auto leading-relaxed">
            Sube tus primeros trabajos para comenzar a construir el portafolio
            de Karin Makeup Artist.
          </p>

          <button
            onClick={() => setEditingProject("mass-upload")}
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              px-5
              h-11
              rounded-full
              bg-admin-text
              text-admin-bg
              text-[12px]
              font-semibold
              hover:bg-admin-accent-dark
              transition-all
            "
          >
            <Plus className="w-4 h-4" />
            Subir primer proyecto
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* ====================================================
              FEATURED
              ==================================================== */}

          {featuredProjects.length > 0 && (
            <section>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FBE8EE] flex items-center justify-center">
                      <Star
                        className="w-4 h-4 text-[#B83265] fill-[#B83265]"
                        strokeWidth={1.8}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[19px] font-semibold text-admin-text tracking-tight">
                          Destacados
                        </h2>

                        <Sparkles
                          className="w-3.5 h-3.5 text-[#D26E87]"
                          strokeWidth={1.8}
                        />
                      </div>

                      <p className="text-[12px] text-admin-text-muted font-light mt-0.5">
                        Los protagonistas de tu Landing Page.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-3.5
                    py-2
                    rounded-full
                    bg-[#FFF8FA]
                    border
                    border-[#EFC8D4]
                    self-start
                    sm:self-auto
                  "
                >
                  <Star className="w-3 h-3 text-[#B83265] fill-[#B83265]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B83265]">
                    {featuredCount} / 6 ocupados
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {featuredProjects.map((project) => (
                    <GalleryCard
                      key={project.id}
                      project={project}
                      onEdit={setEditingProject}
                      selected={selectedIds.includes(project.id)}
                      onSelect={() => toggleSelect(project.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* ====================================================
              ALL PROJECTS
              ==================================================== */}

          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-admin-surface-2 border border-admin-neutral/40 flex items-center justify-center">
                    <Images
                      className="w-4 h-4 text-admin-text-muted"
                      strokeWidth={1.6}
                    />
                  </div>

                  <div>
                    <h2 className="text-[19px] font-semibold text-admin-text tracking-tight">
                      Todos los trabajos
                    </h2>

                    <p className="text-[12px] text-admin-text-muted font-light mt-0.5">
                      Biblioteca completa de proyectos.
                    </p>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-admin-text-muted">
                {regularProjects.length}{" "}
                {regularProjects.length === 1 ? "trabajo" : "trabajos"}
              </span>
            </div>

            {regularProjects.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {regularProjects.map((project) => (
                    <GalleryCard
                      key={project.id}
                      project={project}
                      onEdit={setEditingProject}
                      selected={selectedIds.includes(project.id)}
                      onSelect={() => toggleSelect(project.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div
                className="
                  rounded-[24px]
                  border
                  border-dashed
                  border-admin-neutral/45
                  bg-admin-surface
                  py-16
                  px-6
                  text-center
                "
              >
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#FFF8FA] flex items-center justify-center mb-4">
                  <Star
                    className="w-5 h-5 text-[#D26E87]/60"
                    strokeWidth={1.5}
                  />
                </div>

                <p className="text-[15px] font-semibold text-admin-text">
                  Todos tus trabajos están destacados
                </p>

                <p className="text-[12px] text-admin-text-muted font-light mt-1.5 max-w-sm mx-auto">
                  Quita un trabajo de destacados para que vuelva a aparecer en
                  esta biblioteca.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================
          MODALS
          ======================================================== */}

      <AnimatePresence>
        {editingProject === "mass-upload" && (
          <GalleryMassUploadModal onClose={() => setEditingProject(null)} />
        )}

        {editingProject && editingProject !== "mass-upload" && (
          <GallerySlideOver
            project={editingProject as GalleryProject}
            onClose={() => setEditingProject(null)}
          />
        )}
      </AnimatePresence>

      {/* ========================================================
          BULK ACTIONS
          ======================================================== */}

      <GalleryBulkActions
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onCategoryChange={handleBulkCategoryChange}
        onToggleFavorite={handleBulkFavorite}
        onToggleVisibility={handleBulkVisibility}
        onDelete={handleBulkDelete}
      />
    </div>
  );
};
