import { parseISO, addMinutes, isWithinInterval } from 'date-fns'
import { AppointmentRepository } from '../repositories/appointment.repository'
import { ServiceRepository } from '../repositories/service.repository'
import { CustomerRepository } from '../repositories/customer.repository'
import { UserRepository } from '../repositories/user.repository'
import { WorkingHoursRepository, BlockedScheduleRepository } from '../repositories/schedule.repository'
import { AppError } from '../middlewares/error.middleware'
import { CreateAppointmentDTO, UpdateAppointmentDTO, PublicBookingDTO } from '../dtos/appointment.dto'

const appointmentRepository = new AppointmentRepository()
const serviceRepository = new ServiceRepository()
const customerRepository = new CustomerRepository()
const userRepository = new UserRepository()
const workingHoursRepository = new WorkingHoursRepository()
const blockedScheduleRepository = new BlockedScheduleRepository()

export class AppointmentService {

  async list(tenantId: string, userId: string, date?: string) {
    let start, end
    if (date) {
      const day = parseISO(date)
      start = new Date(day.setHours(0, 0, 0, 0))
      end = new Date(day.setHours(23, 59, 59, 999))
    }
    return appointmentRepository.findAll(tenantId, userId, start, end)
  }

  async getById(tenantId: string, id: string) {
    const appointment = await appointmentRepository.findById(tenantId, id)
    if (!appointment) throw new AppError('Agendamento não encontrado', 404)
    return appointment
  }

  async create(tenantId: string, userId: string, data: CreateAppointmentDTO) {
    const service = await serviceRepository.findById(tenantId, data.serviceId)
    if (!service || !service.active) throw new AppError('Serviço não encontrado ou inativo', 404)

    const customer = await customerRepository.findById(tenantId, data.customerId)
    if (!customer) throw new AppError('Cliente não encontrado', 404)

    const startDate = parseISO(data.startDate)
    const endDate = addMinutes(startDate, service.duration)

    const conflict = await appointmentRepository.hasConflict(userId, startDate, endDate)
    if (conflict) throw new AppError('Horário indisponível. Existe um conflito de agendamento.', 409)

    return appointmentRepository.create({
      tenant_id: tenantId,
      user_id: userId,
      customer_id: data.customerId,
      service_id: data.serviceId,
      start_date: startDate,
      end_date: endDate,
    })
  }

  async update(tenantId: string, userId: string, id: string, data: UpdateAppointmentDTO) {
    const appointment = await this.getById(tenantId, id)

    if (data.status) {
      if (['COMPLETED', 'CANCELED', 'NO_SHOW'].includes(data.status)) {
        return appointmentRepository.update(tenantId, id, { status: data.status })
      }
    }

    if (data.startDate) {
      const startDate = parseISO(data.startDate)
      const endDate = addMinutes(startDate, appointment.service.duration)

      const conflict = await appointmentRepository.hasConflict(userId, startDate, endDate, id)
      if (conflict) throw new AppError('Horário não disponível.', 409)

      return appointmentRepository.update(tenantId, id, {
        start_date: startDate,
        end_date: endDate,
        status: 'SCHEDULED',
      })
    }

    return appointment
  }

  async cancel(tenantId: string, id: string) {
    const appointment = await appointmentRepository.update(tenantId, id, { status: 'CANCELED' })
    if (!appointment) throw new AppError('Agendamento não encontrado', 404)
    return appointment
  }

  /** Retorna os horários disponíveis para um dia específico (usado no painel público) */
  async getAvailableSlots(tenantId: string, date: string) {
    const day = parseISO(date)
    const dayOfWeek = day.getDay()

    // Busca o primeiro barbeiro ativo do tenant (MVP: barbeiro único)
    const user = await userRepository.findFirst({ where: { tenant_id: tenantId, role: 'BARBER' } })
    if (!user) throw new AppError('Nenhum profissional disponível', 404)

    const workingHours = await workingHoursRepository.findFirst({
      where: { user_id: user.id, day_of_week: dayOfWeek, active: true },
    })
    if (!workingHours) return []

    // Agendamentos do dia
    const start = new Date(day); start.setHours(0, 0, 0, 0)
    const end = new Date(day); end.setHours(23, 59, 59, 999)
    const appointments = await appointmentRepository.findAll(tenantId, user.id, start, end)

    // Bloqueios do dia
    const blocked = await blockedScheduleRepository.findMany({
      where: { user_id: user.id, start_date: { lte: end }, end_date: { gte: start } },
    })

    // Gera slots de 30 min
    const slots: string[] = []
    const [startH, startM] = workingHours.start_time.split(':').map(Number)
    const [endH, endM] = workingHours.end_time.split(':').map(Number)
    let current = new Date(day); current.setHours(startH, startM, 0, 0)
    const dayEnd = new Date(day); dayEnd.setHours(endH, endM, 0, 0)

    while (current < dayEnd) {
      const slotEnd = addMinutes(current, 30)
      const isBusy = appointments.some((a) =>
        isWithinInterval(current, { start: a.start_date, end: a.end_date })
      )
      const isBlocked = blocked.some((b) =>
        isWithinInterval(current, { start: b.start_date, end: b.end_date })
      )
      const isLunch =
        workingHours.lunch_start && workingHours.lunch_end
          ? isWithinInterval(current, {
              start: (() => { const d = new Date(day); const [h, m] = workingHours.lunch_start!.split(':').map(Number); d.setHours(h, m, 0, 0); return d })(),
              end: (() => { const d = new Date(day); const [h, m] = workingHours.lunch_end!.split(':').map(Number); d.setHours(h, m, 0, 0); return d })(),
            })
          : false
      const isPast = current < new Date()

      if (!isBusy && !isBlocked && !isLunch && !isPast) {
        slots.push(current.toISOString())
      }
      current = slotEnd
    }

    return slots
  }

  /** Agendamento público (sem autenticação) */
  async publicBook(tenantId: string, data: PublicBookingDTO) {
    const user = await userRepository.findFirst({ where: { tenant_id: tenantId, role: 'BARBER' } })
    if (!user) throw new AppError('Nenhum profissional disponível', 404)

    const service = await serviceRepository.findById(tenantId, data.serviceId)
    if (!service || !service.active) throw new AppError('Serviço não encontrado', 404)

    // Upsert customer por telefone
    let customer = await customerRepository.findByPhone(tenantId, data.phone)
    if (!customer) {
      customer = await customerRepository.create({ tenant_id: tenantId, name: data.name, phone: data.phone })
    }

    const startDate = parseISO(data.startDate)
    const endDate = addMinutes(startDate, service.duration)

    const conflict = await appointmentRepository.hasConflict(user.id, startDate, endDate)
    if (conflict) throw new AppError('Horário não disponível. Por favor, escolha outro.', 409)

    return appointmentRepository.create({
      tenant_id: tenantId,
      user_id: user.id,
      customer_id: customer.id,
      service_id: data.serviceId,
      start_date: startDate,
      end_date: endDate,
    })
  }

  async getDashboardStats(tenantId: string, userId: string) {
    const today = new Date()
    const startOfToday = new Date(today); startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today); endOfToday.setHours(23, 59, 59, 999)

    // Lógica para o Gráfico (Últimos 7 dias)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const stats = await appointmentRepository.findDashboardStats(tenantId, userId, startOfToday, endOfToday, sevenDaysAgo)
    const todayAppointments = stats.todayAppointments as any[]
    const pastWeekAppointments = stats.pastWeekAppointments as any[]

    // Construir array com os últimos 7 dias garantindo ordem e zeros nos dias sem faturamento
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const chartData = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999)

      const dayTotal = pastWeekAppointments
        .filter(a => a.start_date >= dayStart && a.start_date <= dayEnd)
        .reduce((sum, a) => sum + Number(a.service.price), 0)

      chartData.push({
        name: i === 0 ? 'Hoje' : days[date.getDay()],
        total: dayTotal
      })
    }

    const now = new Date()
    const nextAppointment = todayAppointments.find((a: any) => a.start_date > now && a.status === 'SCHEDULED')
    const completed = todayAppointments.filter((a: any) => a.status === 'COMPLETED')
    const revenue = completed.reduce((sum: number, a: any) => sum + Number(a.service.price), 0)

    return {
      todayAppointments,
      nextAppointment: nextAppointment || null,
      completedCount: completed.length,
      totalCount: todayAppointments.length,
      revenue,
      chartData,
    }
  }
}
