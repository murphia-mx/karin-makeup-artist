import { useState, useCallback, useRef } from 'react';
import type { WorkspaceConfig } from '../types/WorkspaceConfig';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Hook que gestiona el estado de auto-guardado con debounce y Notion-style indicator.
 * También expone la lógica de "undo" post-guardado.
 */
export const useAutoSave = (
  mutate: (patch: Partial<WorkspaceConfig>) => Promise<void>
) => {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [showUndo, setShowUndo] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (patch: Partial<WorkspaceConfig>, delay = 1500) => {
      setSaveState('saving');
      setShowUndo(false);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        try {
          await mutate(patch);
          setSaveState('saved');
          setShowUndo(true);

          // Ocultar "saved" después de 3 segundos
          if (savedTimer.current) clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => setSaveState('idle'), 3000);

          // Ocultar undo después de 8 segundos
          if (undoTimer.current) clearTimeout(undoTimer.current);
          undoTimer.current = setTimeout(() => setShowUndo(false), 8000);
        } catch {
          setSaveState('error');
          if (savedTimer.current) clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => setSaveState('idle'), 5000);
        }
      }, delay);
    },
    [mutate]
  );

  const saveImmediate = useCallback(
    async (patch: Partial<WorkspaceConfig>) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSaveState('saving');
      setShowUndo(false);
      try {
        await mutate(patch);
        setSaveState('saved');
        setShowUndo(true);
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaveState('idle'), 3000);
        if (undoTimer.current) clearTimeout(undoTimer.current);
        undoTimer.current = setTimeout(() => setShowUndo(false), 8000);
      } catch {
        setSaveState('error');
      }
    },
    [mutate]
  );

  return { save, saveImmediate, saveState, showUndo, setShowUndo };
};
