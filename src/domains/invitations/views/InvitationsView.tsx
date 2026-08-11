import { useState } from 'react';
import { Plus, Send } from 'lucide-react';
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
      
      const serviceName = (services as any[])?.find((s: any) => s.id === payload.serviceId)?.name || 'Servicio';
      
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
    <div className="max-w-5xl mx-auto font-admin-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-admin-text mb-4 tracking-tight leading-tight">
            Invitaciones
          </h1>
          <p className="text-[17px] font-light text-admin-text-muted tracking-wide">
            Gestiona las invitaciones de reseña para tus clientas
          </p>
        </div>
        <button 
          onClick={() => {
            setCreateError(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-3 px-7 py-3.5 bg-admin-text text-admin-bg rounded-2xl text-[14px] font-medium tracking-wide hover:bg-admin-accent-dark transition-all shadow-[0_4px_16px_rgba(45,32,37,0.15)] self-start sm:self-auto group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
          Nueva invitación
        </button>
      </div>

      <div className="bg-admin-surface rounded-[2.5rem] border border-admin-neutral/40 shadow-[0_8px_30px_rgba(45,32,37,0.03)] p-6 md:p-8 min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-admin-text-muted font-light tracking-wide">
            Cargando invitaciones...
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-admin-text-muted font-light text-center border border-admin-neutral/40 border-dashed rounded-[2rem] bg-admin-surface-2/30">
            <div className="w-20 h-20 bg-admin-surface rounded-full flex items-center justify-center mb-6 shadow-sm border border-admin-neutral/40">
              <Send className="w-8 h-8 text-admin-neutral" strokeWidth={1.5} />
            </div>
            <p className="text-[17px] text-admin-text font-medium mb-2 tracking-wide">No has enviado ninguna invitación aún</p>
            <p className="text-[15px] font-light">Crea tu primera invitación para empezar.</p>
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
