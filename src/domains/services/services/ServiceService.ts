import type { IServiceRepository } from '../repositories/IServiceRepository';
import { SupabaseServiceRepository } from '../repositories/SupabaseServiceRepository';
import type { Service } from '../types/Service';

export class ServiceService {
  private repository: IServiceRepository;

  constructor(repository: IServiceRepository = new SupabaseServiceRepository()) {
    this.repository = repository;
  }

  async getActiveServices(): Promise<Service[]> {
    return this.repository.getActiveServices();
  }

  async getServiceById(id: string): Promise<Service | null> {
    return this.repository.getServiceById(id);
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    return this.repository.getServiceBySlug(slug);
  }
}
