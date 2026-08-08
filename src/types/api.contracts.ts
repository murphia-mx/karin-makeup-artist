/**
 * Enterprise API Contracts
 * Strictly typed responses to ensure front-end and back-end consistency.
 */

export interface SuccessResponse<T> {
  data: T;
  status: 'success';
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, any>;
  status: 'error';
  timestamp: string;
}

export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

export interface RealtimeEvent<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
  timestamp: string;
}

export interface ValidationError extends ErrorResponse {
  validationErrors: { field: string; message: string }[];
}
