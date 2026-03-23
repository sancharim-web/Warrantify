import { differenceInDays } from 'date-fns'
import type { Warranty, WarrantyStatus, WarrantyWithStatus } from '@/types'

export function getWarrantyStatus(expiry_date: string): { status: WarrantyStatus; days_remaining: number } {
  const days_remaining = differenceInDays(new Date(expiry_date), new Date())
  let status: WarrantyStatus = 'active'
  if (days_remaining < 0) {
    status = 'expired'
  } else if (days_remaining <= 30) {
    status = 'expiring_soon'
  }
  return { status, days_remaining }
}

export function enrichWarranty(warranty: Warranty): WarrantyWithStatus {
  const { status, days_remaining } = getWarrantyStatus(warranty.expiry_date)
  return { ...warranty, status, days_remaining }
}

export function getStatusBadgeClasses(status: WarrantyStatus): string {
  switch (status) {
    case 'active':
      return 'bg-status-active-bg text-status-active'
    case 'expiring_soon':
      return 'bg-status-expiring-bg text-status-expiring'
    case 'expired':
      return 'bg-status-expired-bg text-status-expired'
  }
}

export function getStatusLabel(status: WarrantyStatus): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'expiring_soon':
      return 'Today'
    case 'expired':
      return 'Inactive'
  }
}

export function getExpiryTextColor(status: WarrantyStatus): string {
  switch (status) {
    case 'active':
      return 'text-text-body'
    case 'expiring_soon':
      return 'text-status-expiring'
    case 'expired':
      return 'text-text-body'
  }
}

export const CATEGORIES = [
  'Electronics',
  'Appliances',
  'Furniture',
  'Automotive',
  'Home & Garden',
  'Other',
] as const
