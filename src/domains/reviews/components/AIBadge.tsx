import { BrainCircuit } from 'lucide-react';

export const AIBadge = () => {
  return (
    <div 
      className="flex items-center gap-1.5 bg-gradient-to-r from-[#F4E8E9] to-[#FDFBFB] text-[#D99AA8] px-3 py-1.5 rounded-full text-xs font-medium border border-[#D99AA8]/30 shadow-sm"
      title="Análisis procesado automáticamente para resumir lo más importante"
    >
      <BrainCircuit className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Análisis inteligente</span>
    </div>
  );
};
