import { CustomerRepository } from '../repositories/customer.repository'
import { AppError } from '../middlewares/error.middleware'
import { CreateCustomerDTO, UpdateCustomerDTO } from '../dtos/customer.dto'

const customerRepository = new CustomerRepository()

export class CustomerService {
  async list(tenantId: string, search?: string, filter?: string) {
    return customerRepository.findAll(tenantId, search, filter)
  }

  async getById(tenantId: string, id: string) {
    const customer = await customerRepository.findById(tenantId, id)
    if (!customer) throw new AppError('Cliente não encontrado', 404)
    return customer
  }

  async create(tenantId: string, data: CreateCustomerDTO) {
    const existing = await customerRepository.findByPhone(tenantId, data.phone)
    if (existing) throw new AppError('Telefone já cadastrado', 409)

    return customerRepository.create({
      ...data,
      tenant_id: tenantId,
    })
  }

  async update(tenantId: string, id: string, data: UpdateCustomerDTO) {
    if (data.phone) {
      const existing = await customerRepository.findByPhone(tenantId, data.phone)
      if (existing && existing.id !== id) {
        throw new AppError('Telefone já cadastrado em outro cliente', 409)
      }
    }

    const customer = await customerRepository.update(tenantId, id, data)
    if (!customer) throw new AppError('Cliente não encontrado', 404)
    return customer
  }

  async delete(tenantId: string, id: string) {
    const customer = await customerRepository.delete(tenantId, id)
    if (!customer) throw new AppError('Cliente não encontrado', 404)
  }
}
