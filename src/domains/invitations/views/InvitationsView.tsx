import { useState } from 'react';
import { Plus } from 'lucide-react';
import { InvitationList } from '../components/InvitationList';
import { InvitationDetailsModal } from '../components/InvitationDetailsModal';
import { CreateInvitationModal } from '../components/CreateInvitationModal';
import { useInvitationsQuery } from '../hooks/useInvitationsQuery';
import { useCreateInvitation } from '../hooks/useCreateInvitation';
import { useServicesQuery } from '../hooks/useServicesQuery';
import type { Invitation } from '../types/Invitation';

export const InvitationsView = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<{
    id: string;
    url: string;
    clientName: string;
    serviceName: string;
    serviceDate: string;
    isNew?: boolean;
  } | null>(null);

  const { data: invitations = [], isLoading } = useInvitationsQuery();
  const { data: services } = useServicesQuery();
  const createMutation = useCreateInvitation();

  const handleCreate = async (payload: { clientName: string; serviceId: string; serviceDate: string }) => {
    try {
      setCreateError(null);
      const response = await createMutation.mutateAsync(payload);
      
      const serviceName = services?.find(s => s.id === payload.serviceId)?.name || 'Servicio';
      
      setSelectedInvitation({
        id: response.id,
        url: response.url,
        clientName: payload.clientName,
        serviceName,
        serviceDate: payload.serviceDate,
        isNew: true
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating invitation', error);
      setCreateError(error as Error);
    }
  };

  const handleOpenDetails = (invitation: Invitation) => {
    setSelectedInvitation({
      id: invitation.id,
      url: `${window.location.origin}/leave-review?token=${invitation.id}`,
      clientName: invitation.client_name,
      serviceName: invitation.service_name || 'Servicio General',
      serviceDate: invitation.service_date || invitation.created_at,
      isNew: false
    });
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[32px] font-display font-medium text-[#301C27] tracking-tight">
            Invitaciones
          </h1>
          <p className="text-[15px] font-light text-[#765E68] mt-1">
            Gestiona las invitaciones de reseña para tus clientas
          </p>
        </div>
        <button 
          onClick={() => {
            setCreateError(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#301C27] text-white rounded-xl font-medium tracking-wide hover:bg-[#4A2B3D] transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Nueva invitación
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#EBDDE2]/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-[#A8929D] font-light">
            Cargando invitaciones...
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#A8929D] font-light text-center">
            <div className="w-16 h-16 bg-[#FAF7F7] rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-[#EBDDE2]" />
            </div>
            <p>No has enviado ninguna invitación aún.</p>
            <p className="text-sm mt-1">Crea tu primera invitación para empezar.</p>
          </div>
        ) : (
          <InvitationList 
            invitations={invitations} 
            onOpenDetails={handleOpenDetails}
          />
        )}
      </div>

      <CreateInvitationModal 
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateError(null);
        }}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        error={createError}
      />

      {selectedInvitation && (
        <InvitationDetailsModal
          isOpen={!!selectedInvitation}
          onClose={() => setSelectedInvitation(null)}
          invitationUrl={selectedInvitation.url}
          clientName={selectedInvitation.clientName}
          serviceName={selectedInvitation.serviceName}
          serviceDate={selectedInvitation.serviceDate}
          isNew={selectedInvitation.isNew}
        />
      )}
    </div>
  );
};
