import { ServiceRepository } from '../repositories/service.repository'
import { AppError } from '../middlewares/error.middleware'
import { CreateServiceDTO, UpdateServiceDTO } from '../dtos/service.dto'

const serviceRepository = new ServiceRepository()

export class ServiceService {
  async list(tenantId: string) {
    return serviceRepository.findAll(tenantId)
  }

  async getById(tenantId: string, id: string) {
    const service = await serviceRepository.findById(tenantId, id)
    if (!service) throw new AppError('Serviço não encontrado', 404)
    return service
  }

  async create(tenantId: string, data: CreateServiceDTO) {
    return serviceRepository.create({
      ...data,
      tenant_id: tenantId,
    })
  }

  async update(tenantId: string, id: string, data: UpdateServiceDTO) {
    const service = await serviceRepository.update(tenantId, id, data)
    if (!service) throw new AppError('Serviço não encontrado', 404)
    return service
  }

  async delete(tenantId: string, id: string) {
    const service = await serviceRepository.delete(tenantId, id)
    if (!service) throw new AppError('Serviço não encontrado', 404)
  }
}
