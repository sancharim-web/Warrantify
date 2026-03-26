import type { Warranty, Reminder } from '@/types'
import { addMonths, subMonths, subDays, format } from 'date-fns'

const today = new Date()

function makeWarranty(
  id: string,
  product_name: string,
  brand: string,
  category: Warranty['category'],
  purchaseMonthsAgo: number,
  warranty_months: number,
  extra?: Partial<Warranty>
): Warranty {
  const purchase_date = format(subMonths(today, purchaseMonthsAgo), 'yyyy-MM-dd')
  const expiry_date = format(addMonths(new Date(purchase_date), warranty_months), 'yyyy-MM-dd')
  return {
    id,
    user_id: 'demo-user',
    product_name,
    brand,
    category,
    purchase_date,
    warranty_months,
    expiry_date,
    serial_number: null,
    warranty_terms: null,
    brand_contact: null,
    notes: null,
    image_url: null,
    gallery_urls: [],
    reminder_config: { enabled: ['30_day', '7_day', 'expiry'], custom: [] },
    created_at: purchase_date,
    updated_at: purchase_date,
    trashed_at: null,
    documents: [],
    ...extra,
  }
}

export const dummyWarranties: Warranty[] = [
  makeWarranty('w1', 'MacBook Pro 16"', 'Apple', 'Electronics', 11, 12, {
    serial_number: 'C02ZX1ABCDEF',
    brand_contact: 'support.apple.com',
    notes: 'AppleCare+ eligible until next month',
    warranty_terms: '1 year limited hardware warranty covering manufacturing defects.',
  }),
  makeWarranty('w2', 'Samsung Washing Machine', 'Samsung', 'Appliances', 10, 24, {
    serial_number: 'WM-2024-98765',
    brand_contact: '1-800-SAMSUNG',
    warranty_terms: '2 year comprehensive warranty on all parts and labor.',
  }),
  makeWarranty('w3', 'Sony WH-1000XM5', 'Sony', 'Electronics', 11, 12, {
    serial_number: 'SN-WH5-44321',
    notes: 'Bought from Amazon, invoice in documents',
  }),
  makeWarranty('w4', 'LG OLED TV 55"', 'LG', 'Electronics', 6, 36, {
    serial_number: 'LG-OLED55-7890',
    brand_contact: 'lg.com/support',
    warranty_terms: '3 year panel warranty, 1 year parts and labor.',
  }),
  makeWarranty('w5', 'IKEA KALLAX Shelf', 'IKEA', 'Furniture', 3, 12, {
    notes: 'Living room shelf unit, keep receipt',
  }),
  makeWarranty('w6', 'Dyson V15 Detect', 'Dyson', 'Appliances', 2, 24, {
    serial_number: 'DYS-V15-55667',
    brand_contact: 'dyson.com/support',
    warranty_terms: '2 year warranty on machine, 5 year on motor.',
  }),
  makeWarranty('w7', 'Bosch Dishwasher', 'Bosch', 'Appliances', 23, 24, {
    serial_number: 'BSH-DW-11223',
    brand_contact: '1-800-944-2904',
    notes: 'Warranty expiring soon, consider extended coverage',
  }),
  makeWarranty('w8', 'Herman Miller Aeron Chair', 'Herman Miller', 'Furniture', 1, 144, {
    serial_number: 'HM-AERON-33445',
    warranty_terms: '12 year full warranty on all components.',
    notes: 'Home office chair',
  }),
  makeWarranty('w9', 'Michelin Tires (Set of 4)', 'Michelin', 'Automotive', 8, 60, {
    notes: 'Mileage warranty: 60,000 miles',
  }),
  makeWarranty('w10', 'Ring Video Doorbell', 'Ring', 'Electronics', 14, 12, {
    serial_number: 'RING-VD-99887',
    brand_contact: 'ring.com/support',
  }),
  makeWarranty('w11', 'Philips Air Purifier', 'Philips', 'Appliances', 13, 12, {
    serial_number: 'PH-AP-66554',
  }),
  makeWarranty('w12', 'Weber Gas Grill', 'Weber', 'Home & Garden', 5, 36, {
    serial_number: 'WBR-GG-22110',
    brand_contact: 'weber.com/support',
    warranty_terms: '3 year limited warranty against rust-through and burn-through.',
  }),
]

export const dummyReminders: Reminder[] = [
  {
    id: 'r1',
    warranty_id: 'w1',
    type: '30_day',
    sent_at: format(subDays(today, 5), 'yyyy-MM-dd'),
  },
  {
    id: 'r2',
    warranty_id: 'w3',
    type: '30_day',
    sent_at: format(subDays(today, 3), 'yyyy-MM-dd'),
  },
  {
    id: 'r3',
    warranty_id: 'w7',
    type: '30_day',
    sent_at: format(subDays(today, 15), 'yyyy-MM-dd'),
  },
  {
    id: 'r4',
    warranty_id: 'w7',
    type: '7_day',
    sent_at: format(subDays(today, 1), 'yyyy-MM-dd'),
  },
  {
    id: 'r5',
    warranty_id: 'w10',
    type: '30_day',
    sent_at: format(subDays(today, 45), 'yyyy-MM-dd'),
  },
  {
    id: 'r6',
    warranty_id: 'w10',
    type: '7_day',
    sent_at: format(subDays(today, 38), 'yyyy-MM-dd'),
  },
]
