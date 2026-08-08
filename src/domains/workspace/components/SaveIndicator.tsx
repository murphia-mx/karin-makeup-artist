import { motion, AnimatePresence } from 'framer-motion';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  state: SaveState;
}

/**
 * Notion-style save indicator.
 * Aparece solo cuando hay actividad (saving/saved). En idle es invisible.
 */
export const SaveIndicator = ({ state }: SaveIndicatorProps) => {
  return (
    <AnimatePresence mode="wait">
      {state !== 'idle' && (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
        >
          {state === 'saving' && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-light text-[#7A6B67]">Guardando...</span>
            </>
          )}
          {state === 'saved' && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-light text-[#7A6B67]">Todos los cambios guardados</span>
            </>
          )}
          {state === 'error' && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-xs font-light text-red-500">Error al guardar</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
