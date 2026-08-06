export interface Tenant {
  id: string
  name: string
  slug: string
  active?: boolean
  logo?: string
  photos?: string[]
  description?: string
  phone?: string
  address?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  photo?: string
  role: string
  bio?: string
  tenant: Tenant
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
  user_id?: string
  last_visit?: string
  total_appointments?: number
}

export interface Service {
  id: string
  name: string
  price: string | number
  duration: number
  photos?: string[]
  active: boolean
}

export interface Appointment {
  id: string
  customer_id: string
  service_id: string
  start_date: string
  end_date: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW'
  customer: Customer
  service: Service
  user?: User
  tenant?: Tenant
}

export interface WorkingHour {
  day_of_week: number
  start_time: string
  end_time: string
  lunch_start?: string
  lunch_end?: string
  active: boolean
}

export interface BlockedSchedule {
  id: string
  start_date: string
  end_date: string
  reason?: string
}

export interface Barber {
  id: string
  name: string
  working_hours: WorkingHour[]
}

export interface Barbershop {
  id: string
  name: string
  slug: string
  services: Service[]
  users: Barber[]
  _count?: { services: number }
  created_at?: string
}

export interface DashboardStats {
  todayAppointments: Appointment[]
  nextAppointment: Appointment | null
  completedCount: number
  totalCount: number
  revenue: number
  chartData: { name: string; total: number }[]
}

export interface ServiceFormData {
  name: string
  price: string | number
  duration: string | number
  photos?: string[]
  active: boolean
}

export interface CustomerFormData {
  name: string
  phone: string
  email?: string
  notes?: string
}

export interface BlockedSchedule {
  id: string
  tenant_id: string
  start_date: string
  end_date: string
  reason?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
  tenant?: Tenant
}

export interface LoginFormData {
  email: string
  password?: string
}

export interface RegisterFormData {
  name: string
  email: string
  phone: string
  password: string
  tenantName: string
  tenantSlug: string
}