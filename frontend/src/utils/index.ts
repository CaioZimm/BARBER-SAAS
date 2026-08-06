import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (cleaned.length === 10) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return phone
}

export function applyPhoneMask(value: string) {
  const v = value.replace(/\D/g, '').slice(0, 11)
  if (v.length <= 2) return v
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
}