import { TicketPlus } from 'lucide-react';

interface EmptyInvitationsProps {
  onCreateClick: () => void;
}

export const EmptyInvitations = ({ onCreateClick }: EmptyInvitationsProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-32 bg-[#FAF7F7] rounded-[2rem] border border-[#EBDDE2]/50 border-dashed">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#EBDDE2]/30">
        <TicketPlus className="w-8 h-8 text-[#EBDDE2]" />
      </div>
      <h3 className="text-2xl font-display font-medium text-[#301C27] mb-3 text-center px-4">
        Convierte una buena experiencia en una historia que tus clientas quieran compartir.
      </h3>
      <p className="text-[#765E68] font-light text-center max-w-lg leading-relaxed mb-8 px-4">
        Genera tu primera invitación y envía un enlace directo o un código QR para recibir una reseña.
      </p>
      
      <button 
        onClick={onCreateClick}
        className="px-8 py-3.5 bg-[#301C27] text-white font-medium rounded-full hover:bg-[#CF7F9B] transition-colors shadow-sm"
      >
        Crear primera invitación
      </button>
    </div>
  );
};
