import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InvitationService } from '../services/InvitationService';
import type { CreateInvitationPayload } from '../types/Invitation';

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvitationPayload) => InvitationService.generateInvitationLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
};
