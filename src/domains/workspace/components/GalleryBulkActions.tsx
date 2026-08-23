import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Star, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
  "Novias",
  "Social",
  "XV Años",
  "Editorial",
  "Graduación",
  "Artístico",
  "Peinados",
];

interface GalleryBulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  onCategoryChange: (cat: string) => Promise<void>;
  onToggleFavorite: (favorite: boolean) => Promise<void>;
  onToggleVisibility: (publicVisible: boolean) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const GalleryBulkActions = ({
  selectedCount,
  onClear,
  onCategoryChange,
  onToggleFavorite,
  onToggleVisibility,
  onDelete,
}: GalleryBulkActionsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try {
      await action();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      handleAction(() => onCategoryChange(e.target.value));
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-max z-[100] px-4 sm:px-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0 pointer-events-none"
        >
          <div className="bg-admin-surface/90 backdrop-blur-xl border border-admin-neutral/50 sm:rounded-[2rem] rounded-t-3xl shadow-[0_20px_60px_rgba(45,32,37,0.15)] flex flex-col sm:flex-row items-center gap-2 sm:gap-6 p-4 sm:py-3 sm:px-6 pointer-events-auto font-admin-sans w-full">
            {/* Header: Count & Clear */}
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 sm:border-r border-admin-neutral/40 sm:pr-6">
              <span className="text-[14px] font-bold text-admin-text tracking-wide uppercase flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-admin-text text-admin-bg flex items-center justify-center text-[10px]">
                  {selectedCount}
                </span>
                Seleccionados
              </span>
              <button
                onClick={onClear}
                disabled={isProcessing}
                className="p-2 -mr-2 sm:mr-0 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface-2 rounded-full transition-colors active:scale-95"
                title="Limpiar selección"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Actions */}
            {!showDeleteConfirm ? (
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                {/* Category Dropdown */}
                <div className="col-span-2 sm:col-span-1">
                  <select
                    value=""
                    onChange={handleCategoryChange}
                    disabled={isProcessing}
                    className="w-full sm:w-36 px-4 py-2.5 min-h-[44px] text-[13px] font-medium bg-admin-surface-2 border border-admin-neutral/50 rounded-xl text-admin-text focus:outline-none focus:border-admin-accent-dark disabled:opacity-50 cursor-pointer transition-colors appearance-none text-center"
                  >
                    <option value="" disabled>
                      Categoría...
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 col-span-2 sm:col-span-1 justify-between sm:justify-start">
                  <button
                    onClick={() => handleAction(() => onToggleFavorite(true))}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-4 rounded-xl text-[12px] font-bold uppercase tracking-wider text-[#B89B2B] bg-[#FAF3D9]/50 hover:bg-[#FAF3D9] transition-colors border border-transparent disabled:opacity-50 active:scale-95"
                    title="Destacar"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span className="sm:hidden">Destacar</span>
                  </button>

                  <button
                    onClick={() => handleAction(() => onToggleVisibility(true))}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-4 rounded-xl text-[12px] font-bold uppercase tracking-wider text-admin-text bg-admin-surface-2 hover:bg-admin-neutral/30 transition-colors border border-admin-neutral/50 disabled:opacity-50 active:scale-95"
                    title="Hacer Público"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="sm:hidden">Público</span>
                  </button>

                  <button
                    onClick={() =>
                      handleAction(() => onToggleVisibility(false))
                    }
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-4 rounded-xl text-[12px] font-bold uppercase tracking-wider text-admin-text-muted bg-admin-surface-2 hover:bg-admin-neutral/30 transition-colors border border-admin-neutral/50 disabled:opacity-50 active:scale-95"
                    title="Ocultar"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span className="sm:hidden">Ocultar</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-4 rounded-xl text-[12px] font-bold uppercase tracking-wider text-admin-error bg-admin-error/10 hover:bg-admin-error hover:text-white transition-colors border border-transparent disabled:opacity-50 ml-auto sm:ml-2 active:scale-95"
                    title="Eliminar seleccionados"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden">Borrar</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 bg-admin-error/10 p-2 sm:p-1 rounded-xl border border-admin-error/20">
                <span className="text-[12px] font-medium text-admin-error px-2 text-center sm:text-left min-h-[44px] sm:min-h-0 flex items-center">
                  ¿Eliminar {selectedCount} proyectos?
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none px-4 min-h-[44px] rounded-lg text-[12px] font-bold uppercase tracking-wider text-admin-text bg-admin-surface hover:bg-admin-surface-2 transition-colors border border-admin-neutral/50 disabled:opacity-50 active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      await handleAction(onDelete);
                      setShowDeleteConfirm(false);
                    }}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none px-4 min-h-[44px] rounded-lg text-[12px] font-bold uppercase tracking-wider text-white bg-admin-error hover:bg-admin-error/90 transition-colors border border-transparent disabled:opacity-50 flex items-center justify-center active:scale-95"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirmar"
                    )}
                  </button>
                </div>
              </div>
            )}

            {isProcessing && !showDeleteConfirm && (
              <div className="absolute inset-0 bg-admin-surface/50 backdrop-blur-sm rounded-t-3xl sm:rounded-[2rem] flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-admin-accent-dark" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
