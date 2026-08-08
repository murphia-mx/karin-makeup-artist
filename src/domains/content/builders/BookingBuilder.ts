import type { WorkspaceConfig } from '../../workspace/types/WorkspaceConfig';
import type { BookingModel } from '../models/BookingModel';

export class BookingBuilder {
  static build(workspace: WorkspaceConfig): BookingModel {
    return {
      rules: {
        minAdvanceHours: workspace.booking_min_advance_hours || 24,
        bufferMinutes: workspace.booking_buffer_minutes || 30,
        cancellationHours: workspace.booking_cancellation_hours || 48,
      },
      schedule: workspace.schedule || {},
      contact: {
        whatsapp: workspace.whatsapp,
      },
    };
  }
}
