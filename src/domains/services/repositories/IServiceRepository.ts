import type { Service } from '../types/Service';

export interface IServiceRepository {
  /**
   * Retrieves all active services ordered by display_order.
   */
  getActiveServices(): Promise<Service[]>;

  /**
   * Retrieves a specific service by its ID.
   */
  getServiceById(id: string): Promise<Service | null>;

  /**
   * Retrieves a specific service by its slug.
   */
  getServiceBySlug(slug: string): Promise<Service | null>;
}
