import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  GripVertical,
  Star,
  MoreHorizontal,
  Copy,
  Power,
  Image as ImageIcon,
  Trash2,
  Upload,
  Loader2,
  StarOff,
  Edit2,
  X,
} from "lucide-react";
import { supabaseAny as supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { GalleryBulkActions } from "../components/GalleryBulkActions";

// Types
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

// Helper seguro para imágenes
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

  // Arreglar URLs relativas de Vite si el valor crudo en BD incluye "public/"
  const formattedSrc = src?.startsWith("public/")
    ? `/${src.replace("public/", "")}`
    : src;

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-[#FDFBFB] border border-[#EFE7E4] ${className || ""}`}
      >
        <ImageIcon className="w-6 h-6 text-[#D26E87]/40" />
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

// Hook
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
      // Actualizar silenciosamente (o con toast ligero)
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
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
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
      toast.success(newActive ? "Proyecto público" : "Proyecto oculto");
    }
    setMenuOpen(false);
  };

  const toggleFavorite = async () => {
    try {
      const { data: _data, error } = await supabase.rpc(
        "toggle_gallery_favorite",
        {
          p_id: project.id,
          p_favorite: !project.is_favorite,
        },
      );
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
      toast.success(
        !project.is_favorite ? "Agregado a favoritos" : "Removido de favoritos",
      );
    } catch (error: any) {
      if (error.message.includes("MAX_FAVORITES_REACHED")) {
        toast.error(
          "Ya tienes 6 trabajos favoritos. Quita uno de los favoritos actuales para seleccionar otro.",
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
      storage_path: null, // No copiamos el archivo real de storage para evitar problemas al borrar uno
      active: false,
      is_favorite: false,
      display_order: project.display_order + 1,
    });

    if (error) {
      toast.error(`Error al duplicar: ${error.message}`);
    } else {
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
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

      toast.success("Proyecto eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
      setMenuOpen(false);
    } catch (err: any) {
      toast.error(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <motion.div
      layout
      className={`bg-admin-surface rounded-2xl border transition-all duration-300 shadow-[0_4px_20px_rgba(45,32,37,0.03)] ${
        selected
          ? "border-admin-accent-dark/50 ring-1 ring-admin-accent-dark/10"
          : "border-admin-neutral/40"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-5 sm:p-6">
        {/* Header mobile (Checkbox + Drag) */}
        <div className="flex sm:flex-col justify-between items-center sm:items-start shrink-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-5 h-5 sm:w-4 sm:h-4 rounded-md border-admin-neutral/50 text-admin-accent-dark focus:ring-admin-accent-dark focus:ring-offset-admin-surface cursor-pointer"
          />
          <div className="cursor-grab text-admin-text-muted/60 hover:text-admin-text-muted transition-colors sm:mt-3 p-2 -mr-2 sm:p-0 sm:mr-0 active:scale-95">
            <GripVertical className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>

        {/* Cover */}
        <div className="w-full sm:w-24 h-48 sm:h-28 rounded-[1rem] overflow-hidden bg-admin-surface-2 border border-admin-neutral/40 shrink-0 shadow-inner">
          <SafeImage
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-admin-text tracking-tight truncate">
                  {project.title}
                </h3>
              </div>
              <div className="mt-3 sm:mt-2.5 flex flex-wrap items-center gap-2">
                <select
                  value={project.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={isUpdatingCategory}
                  className="px-3 py-2 sm:py-1.5 text-[12px] font-bold uppercase tracking-widest bg-admin-surface-2 border border-admin-neutral/50 rounded-lg text-admin-text-muted hover:border-admin-neutral focus:outline-none focus:border-admin-accent-dark cursor-pointer disabled:opacity-50 transition-colors w-full sm:w-auto"
                >
                  <option value="Novias">Novias</option>
                  <option value="Social">Social</option>
                  <option value="Editorial">Editorial</option>
                  <option value="XV Años">XV Años</option>
                </select>
                {isUpdatingCategory && (
                  <span className="text-[10px] text-admin-text-muted animate-pulse">
                    Guardando...
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <span
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border flex items-center justify-center ${project.active ? "bg-admin-success/10 text-admin-success border-admin-success/20" : "bg-admin-surface-3 text-admin-text-muted border-admin-border"}`}
              >
                {project.active ? (
                  <span className="flex items-center gap-1">
                    <Power className="w-3 h-3" /> Público
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Power className="w-3 h-3 opacity-70" /> Oculto
                  </span>
                )}
              </span>

              {project.is_favorite && (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-[#FAF3D9] text-[#B38600] border border-[#F0E5BC] flex items-center justify-center">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Favorito
                </span>
              )}
            </div>
          </div>

          <p className="text-[13px] font-light text-admin-text-muted line-clamp-2 leading-relaxed mb-4 sm:mb-0">
            {project.description}
          </p>

          {/* Mobile Footer Actions (Always visible) */}
          <div className="flex sm:hidden items-center justify-between border-t border-admin-neutral/30 pt-4 mt-2">
            <button
              onClick={() => onEdit(project)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-admin-surface-2 border border-admin-neutral/40 hover:bg-admin-neutral/20 text-admin-text text-[13px] font-bold rounded-xl transition-colors min-h-[44px] flex-1 mr-2"
            >
              <Edit2 className="w-4 h-4" /> Editar
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-2 bg-admin-surface-2 border border-admin-neutral/40 hover:bg-admin-neutral/20 text-admin-text rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <MoreHorizontal className="w-5 h-5" strokeWidth={2} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 bottom-full mb-2 w-48 bg-admin-surface rounded-2xl shadow-xl border border-admin-neutral/50 overflow-hidden z-20 origin-bottom-right"
                  >
                    <div className="py-2">
                      <button
                        onClick={toggleActive}
                        className="w-full text-left px-4 py-3 min-h-[44px] text-[13px] font-medium text-admin-text hover:bg-admin-surface-2 flex items-center gap-3"
                      >
                        <Power className="w-4 h-4" />{" "}
                        {project.active ? "Ocultar proyecto" : "Hacer público"}
                      </button>
                      <button
                        onClick={toggleFavorite}
                        className="w-full text-left px-4 py-3 min-h-[44px] text-[13px] font-medium text-admin-text hover:bg-admin-surface-2 flex items-center gap-3"
                      >
                        {project.is_favorite ? (
                          <StarOff className="w-4 h-4" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                        {project.is_favorite
                          ? "Quitar de destacados"
                          : "Destacar (Top 6)"}
                      </button>
                      <button
                        onClick={duplicate}
                        className="w-full text-left px-4 py-3 min-h-[44px] text-[13px] font-medium text-admin-text hover:bg-admin-surface-2 flex items-center gap-3"
                      >
                        <Copy className="w-4 h-4" /> Duplicar
                      </button>
                      <div className="h-px bg-admin-neutral/40 my-1 mx-2" />
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-3 min-h-[44px] text-[13px] font-medium text-admin-error hover:bg-admin-error/5 flex items-center gap-3"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Desktop Quick Actions */}
        <div className="hidden sm:flex flex-col gap-2 shrink-0 border-l border-admin-neutral/30 pl-4 ml-2">
          <button
            onClick={() => onEdit(project)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 transition-colors"
          >
            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${menuOpen ? "bg-admin-surface-2 text-admin-text" : "text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2"}`}
            >
              <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-admin-surface rounded-2xl shadow-[0_8px_30px_rgba(45,32,37,0.12)] border border-admin-neutral/50 overflow-hidden z-20 origin-top-right"
                >
                  <div className="py-2">
                    <button
                      onClick={toggleActive}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-admin-text hover:bg-admin-surface-2 flex items-center gap-3"
                    >
                      <Power className="w-4 h-4 text-admin-text-muted" />{" "}
                      {project.active ? "Ocultar proyecto" : "Hacer público"}
                    </button>
                    <button
                      onClick={toggleFavorite}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-admin-text hover:bg-admin-surface-2 flex items-center gap-3"
                    >
                      {project.is_favorite ? (
                        <StarOff className="w-4 h-4 text-admin-text-muted" />
                      ) : (
                        <Star className="w-4 h-4 text-admin-text-muted" />
                      )}
                      {project.is_favorite
                        ? "Quitar de destacados"
                        : "Destacar (Top 6)"}
                    </button>
                    <button
                      onClick={duplicate}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-admin-text hover:bg-admin-surface-2 flex items-center gap-3"
                    >
                      <Copy className="w-4 h-4 text-admin-text-muted" />{" "}
                      Duplicar
                    </button>
                    <div className="h-px bg-admin-neutral/40 my-1 mx-2" />
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-admin-error hover:bg-admin-error/5 flex items-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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

  const inputClass =
    "w-full px-5 py-4 bg-admin-surface-2 border border-admin-neutral/50 rounded-2xl text-[15px] font-light text-admin-text focus:outline-none focus:border-admin-accent-dark transition-colors placeholder:text-admin-text-muted/50 appearance-none";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public-assets")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("public-assets").getPublicUrl(filePath);

      // Si había una imagen anterior en storage, la borramos para no dejar basura
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
      toast.success("Imagen subida");
    } catch (err: any) {
      toast.error(`Error al subir imagen: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const save = async () => {
    if (!form.title || !form.image_url) {
      toast.error("Título e imagen son requeridos");
      return;
    }

    setLoading(true);
    try {
      // Si estamos marcando como favorito, validamos primero
      if (form.is_favorite && !project.is_favorite) {
        const { count } = await supabase
          .from("gallery_projects")
          .select("id", { count: "exact", head: true })
          .eq("is_favorite", true)
          .neq("id", form.id || "00000000-0000-0000-0000-000000000000");

        if (count !== null && count >= 6) {
          toast.error(
            "Ya tienes 6 trabajos favoritos. Quita uno de los favoritos actuales para seleccionar otro.",
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

      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
      toast.success("Proyecto actualizado");
      onClose();
    } catch (err: any) {
      if (err.message?.includes("MAX_FAVORITES_REACHED")) {
        toast.error(
          "Ya tienes 6 trabajos favoritos. Quita uno para poder seleccionar este.",
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
        className="absolute inset-0 bg-admin-bg/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ x: "100%", opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0.5 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-lg bg-admin-surface h-full border-l border-admin-neutral/50 shadow-2xl flex flex-col font-admin-sans"
      >
        <div className="flex items-center justify-between p-7 border-b border-admin-neutral/40">
          <h2 className="text-2xl font-bold text-admin-text tracking-tight">
            Editar Proyecto
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors"
          >
            <Power className="w-5 h-5 rotate-45" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-8">
          {/* Cover Upload */}
          <section className="space-y-4">
            <h3 className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">
              Imagen
            </h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-32 h-40 rounded-2xl overflow-hidden bg-admin-surface-2 border border-admin-neutral/50 shrink-0 flex items-center justify-center relative group">
                {form.image_url ? (
                  <SafeImage
                    src={form.image_url}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon
                    className="w-8 h-8 text-admin-text-muted/50"
                    strokeWidth={1.5}
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-3 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <Upload
                        className="w-5 h-5 text-white"
                        strokeWidth={1.5}
                      />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-admin-text-muted leading-relaxed font-light mb-4">
                  Sube una imagen vertical de alta calidad. La imagen se
                  optimizará y guardará de manera segura.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </section>

          {/* Información Básica */}
          <section className="space-y-4">
            <h3 className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">
              Información
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">
                  Título del trabajo
                </label>
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej. Sofía & Andrés"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">
                  Categoría
                </label>
                <select
                  value={form.category || CATEGORIES[0]}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
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
                <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">
                  Descripción corta (opcional)
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Pequeño resumen del look..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </section>

          {/* Configuración */}
          <section className="space-y-4">
            <h3 className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em]">
              Estado
            </h3>
            <div className="space-y-4 pt-3">
              {[
                {
                  key: "active",
                  label: "Publicado",
                  desc: "El proyecto será visible públicamente",
                },
                {
                  key: "is_favorite",
                  label: "Favorito (Landing)",
                  desc: "Aparecerá en la sección de inicio (Máx. 6)",
                  icon: (
                    <Star
                      className="w-4 h-4 text-[#B89B2B] fill-[#B89B2B]"
                      strokeWidth={1.5}
                    />
                  ),
                },
              ].map(({ key, label, desc, icon }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3 border-b border-admin-neutral/40 last:border-0"
                >
                  <div>
                    <span className="text-[15px] text-admin-text font-medium flex items-center gap-2">
                      {icon} {label}
                    </span>
                    <p className="text-[12px] text-admin-text-muted/80 font-light mt-0.5">
                      {desc}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setForm((p) => ({ ...p, [key]: !(p as any)[key] }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${(form as any)[key] !== false ? "bg-admin-accent-dark" : "bg-admin-surface-2 border border-admin-neutral/50"}`}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${(form as any)[key] !== false ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-7 border-t border-admin-neutral/40 bg-admin-surface mt-auto">
          <div className="flex flex-col gap-3.5">
            <button
              onClick={save}
              disabled={loading || uploading}
              className="w-full py-4 bg-admin-text text-admin-bg text-[14px] font-medium rounded-[1.25rem] hover:bg-admin-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
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
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public-assets")
        .upload(filePath, f.file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("public-assets").getPublicUrl(filePath);

      const title = f.file.name.replace(/\.[^/.]+$/, "");

      const { error: dbError } = await supabase
        .from("gallery_projects")
        .insert({
          title: title,
          category: f.category,
          description: "",
          image_url: publicUrl,
          storage_path: filePath,
          active: globalActive,
          is_favorite: globalFavorite,
          display_order: 999,
        });

      if (dbError) throw dbError;

      return { ...f, status: "success" };
    } catch (err: any) {
      return { ...f, status: "error", errorMessage: err.message };
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
          .select("id", { count: "exact", head: true })
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

    queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
    queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
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
        className="absolute inset-0 bg-admin-bg/40 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-4xl bg-admin-surface sm:rounded-3xl shadow-[0_24px_80px_rgba(45,32,37,0.15)] overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh] font-admin-sans border-0 sm:border border-admin-neutral/40"
      >
        <div className="pt-[max(1.5rem,env(safe-area-inset-top))] px-7 pb-4 border-b border-admin-neutral/40 flex items-center justify-between shrink-0 bg-admin-surface">
          <div>
            <h2 className="text-2xl font-bold text-admin-text tracking-tight">
              Subida Masiva de Proyectos
            </h2>
            <p className="text-[14px] font-light text-admin-text-muted mt-1">
              Sube múltiples imágenes a la vez y aplícales la misma categoría.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 -mr-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors disabled:opacity-50 active:scale-95 shrink-0 self-start"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-7 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Controles Globales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-admin-surface-2 p-5 rounded-2xl border border-admin-neutral/50">
            <div>
              <label className="block text-[11px] font-bold text-admin-text-muted uppercase tracking-[0.15em] mb-3">
                Categoría Global
              </label>
              <select
                value={globalCategory}
                onChange={(e) => setGlobalCategory(e.target.value)}
                disabled={isUploading}
                className="w-full px-4 py-3 bg-admin-surface border border-admin-neutral/40 rounded-[1.25rem] text-[14px] text-admin-text focus:outline-none focus:border-admin-accent-dark disabled:opacity-50 appearance-none font-light"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={globalActive}
                  onChange={(e) => setGlobalActive(e.target.checked)}
                  disabled={isUploading}
                  className="w-5 h-5 rounded-md border-admin-neutral/50 text-admin-accent-dark focus:ring-admin-accent-dark focus:ring-offset-admin-surface-2"
                />
                <span className="text-[14px] font-medium text-admin-text">
                  Proyectos Públicos
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalFavorite}
                  onChange={(e) => setGlobalFavorite(e.target.checked)}
                  disabled={isUploading}
                  className="w-5 h-5 rounded-md border-admin-neutral/50 text-[#B89B2B] focus:ring-[#B89B2B] focus:ring-offset-admin-surface-2"
                />
                <span className="text-[14px] font-medium text-admin-text">
                  Destacar (Favoritos)
                </span>
              </label>
            </div>
          </div>

          {/* Área de Drag & Drop */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={isUploading ? undefined : onDrop}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${
              isUploading
                ? "opacity-50 border-admin-neutral/40 bg-admin-surface-2"
                : "border-admin-neutral hover:border-admin-accent-dark/50 hover:bg-admin-surface-2 cursor-pointer"
            }`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <Upload
              className="w-10 h-10 text-admin-accent-dark mx-auto mb-4"
              strokeWidth={1.5}
            />
            <p className="text-[16px] font-medium text-admin-text tracking-wide mb-1">
              Arrastra tus fotos aquí
            </p>
            <p className="text-[14px] font-light text-admin-text-muted mt-1">
              O haz clic para seleccionar (puedes elegir múltiples)
            </p>
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

          {/* Lista de Archivos */}
          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-admin-text tracking-wide uppercase">
                  Proyectos a crear ({files.length})
                </h3>
                {isUploading && (
                  <span className="text-[13px] font-bold text-admin-accent-dark">
                    {successfulCount} / {totalCount} subidas
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group bg-admin-surface border border-admin-neutral/40 rounded-2xl overflow-hidden aspect-[4/5] flex flex-col shadow-[0_4px_20px_rgba(45,32,37,0.03)]"
                  >
                    <img
                      src={file.previewUrl}
                      alt={file.file.name}
                      className="w-full h-3/4 object-cover"
                    />

                    <div className="flex-1 p-3 flex flex-col justify-between bg-admin-surface border-t border-admin-neutral/40">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[11px] font-medium text-admin-text truncate pr-2 tracking-wide"
                          title={file.file.name}
                        >
                          {file.file.name}
                        </span>
                        {file.status === "success" && (
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            title="Subido con éxito"
                          />
                        )}
                        {file.status === "error" && (
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-admin-error shrink-0"
                            title={`Error: ${file.errorMessage}`}
                          />
                        )}
                        {file.status === "uploading" && (
                          <Loader2 className="w-3.5 h-3.5 text-admin-accent-dark animate-spin shrink-0" />
                        )}
                        {file.status === "pending" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-admin-neutral/50 shrink-0" />
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
                        className="w-full px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase bg-admin-surface-2 border border-admin-neutral/50 rounded-lg text-admin-text-muted hover:border-admin-neutral focus:outline-none focus:border-admin-accent-dark disabled:opacity-50 cursor-pointer transition-colors"
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
                        className="absolute top-2 right-2 p-1.5 bg-admin-text/60 text-admin-bg rounded-full transition-all duration-300 hover:bg-admin-error hover:scale-110 backdrop-blur-md"
                        title="Quitar imagen"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-7 border-t border-admin-neutral/40 bg-admin-surface flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-full sm:w-auto px-7 py-3.5 sm:py-3 rounded-[1.25rem] text-[13px] font-bold text-admin-text-muted uppercase tracking-widest hover:bg-admin-surface-2 transition-colors disabled:opacity-50 min-h-[48px] sm:min-h-[44px]"
          >
            {allDone ? "Cerrar" : "Cancelar"}
          </button>

          {totalCount > 0 && !allDone && (
            <button
              onClick={startUpload}
              disabled={isUploading}
              className="w-full sm:w-auto px-7 py-3.5 sm:py-3 rounded-[1.25rem] text-[13px] font-bold text-admin-bg bg-admin-text hover:bg-admin-accent-dark uppercase tracking-widest transition-colors shadow-[0_8px_24px_rgba(45,32,37,0.15)] disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[44px] active:scale-[0.98]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Subir{" "}
                  {files.filter((f) => f.status !== "success").length} proyectos
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

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
        .update({ category: newCategory })
        .in("id", selectedIds);

      if (error) throw error;
      toast.success(`${selectedIds.length} proyectos categorizados`);
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkFavorite = async (favorite: boolean) => {
    if (selectedIds.length === 0) return;
    setBulkUpdating(true);
    try {
      if (favorite) {
        // Evaluate limit against current favorites that are NOT part of the current selection
        // because the currently selected items will just be set to true
        const { count, error: countError } = await supabase
          .from("gallery_projects")
          .select("id", { count: "exact", head: true })
          .eq("is_favorite", true)
          .not("id", "in", `(${selectedIds.join(",")})`);

        if (countError) throw countError;

        if ((count || 0) + selectedIds.length > 6) {
          toast.error(
            "No se pueden destacar estos proyectos. La Landing permite un máximo de 6 proyectos destacados y esta selección supera el límite.",
          );
          setBulkUpdating(false);
          return;
        }
      }

      const { error } = await supabase
        .from("gallery_projects")
        .update({ is_favorite: favorite })
        .in("id", selectedIds);

      if (error) throw error;
      toast.success(
        `${selectedIds.length} proyectos ${favorite ? "destacados" : "removidos de destacados"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
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
        .update({ active: publicVisible })
        .in("id", selectedIds);

      if (error) throw error;
      toast.success(
        `${selectedIds.length} proyectos marcados como ${publicVisible ? "públicos" : "ocultos"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
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
      // Optamos por un simple soft-delete o eliminación de base de datos de acuerdo a su uso normal
      // Acá eliminamos los proyectos masivamente
      const { error } = await supabase
        .from("gallery_projects")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;
      toast.success(`${selectedIds.length} proyectos eliminados`);
      queryClient.invalidateQueries({ queryKey: ["workspace", "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["landing_gallery"] });
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
        <Loader2 className="w-8 h-8 animate-spin text-[#D26E87]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-admin-text tracking-tight mb-2">
            Galería
          </h1>
          <p className="text-[15px] text-admin-text-muted font-light max-w-xl leading-relaxed">
            Administra tus trabajos, portafolio y los proyectos destacados de tu
            Landing Page.
          </p>
        </div>
        <button
          onClick={() => setEditingProject("mass-upload")}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-admin-text text-admin-bg text-[14px] font-medium rounded-2xl hover:bg-admin-accent-dark transition-all shadow-[0_8px_20px_rgba(45,32,37,0.15)] hover:shadow-[0_12px_25px_rgba(45,32,37,0.25)] hover:-translate-y-0.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar fotos</span>
        </button>
      </div>

      <div className="grid gap-4">
        {/* The GalleryBulkActions component will be rendered outside the grid flow */}

        {projects.map((project) => (
          <GalleryCard
            key={project.id}
            project={project}
            onEdit={setEditingProject}
            selected={selectedIds.includes(project.id)}
            onSelect={() => toggleSelect(project.id)}
          />
        ))}
        {projects.length === 0 && (
          <div className="text-center py-24 bg-admin-surface rounded-3xl border border-admin-neutral/40 border-dashed">
            <ImageIcon
              className="w-12 h-12 text-admin-text-muted/30 mx-auto mb-4"
              strokeWidth={1}
            />
            <p className="text-admin-text font-medium text-[16px] mb-2 tracking-wide">
              Tu galería está vacía
            </p>
            <p className="text-admin-text-muted text-[14px] font-light">
              Sube tu primer proyecto de maquillaje.
            </p>
          </div>
        )}
      </div>

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
