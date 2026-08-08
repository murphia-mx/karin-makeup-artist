export interface BookingModel {
  rules: {
    minAdvanceHours: number;
    bufferMinutes: number;
    cancellationHours: number;
  };
  schedule: Record<string, { open: string; close: string; active: boolean }>;
  contact: {
    whatsapp: string | null;
  };
}
