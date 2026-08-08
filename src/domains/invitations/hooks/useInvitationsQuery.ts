import { useQuery } from '@tanstack/react-query';
import { InvitationService } from '../services/InvitationService';

export const useInvitationsQuery = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => InvitationService.getInvitations(),
  });
};
