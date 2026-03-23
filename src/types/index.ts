export type Category =
  | 'Electronics'
  | 'Appliances'
  | 'Furniture'
  | 'Automotive'
  | 'Home & Garden'
  | 'Other'

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired'

export type ReminderType = '30_day' | '7_day'

export interface Warranty {
  id: string
  user_id: string
  product_name: string
  brand: string | null
  category: Category
  purchase_date: string
  warranty_months: number
  expiry_date: string
  serial_number: string | null
  warranty_terms: string | null
  brand_contact: string | null
  notes: string | null
  created_at: string
  updated_at: string
  image_url: string | null
  trashed_at: string | null
  documents?: Document[]
}

export interface Document {
  id: string
  warranty_id: string
  file_name: string
  storage_path: string
  file_type: string
  uploaded_at: string
}

export interface Reminder {
  id: string
  warranty_id: string
  type: ReminderType
  sent_at: string
  warranty?: Warranty
}

export interface WarrantyWithStatus extends Warranty {
  status: WarrantyStatus
  days_remaining: number
}

export interface CreateWarrantyInput {
  product_name: string
  brand?: string
  category: Category
  purchase_date: string
  warranty_months: number
  serial_number?: string
  warranty_terms?: string
  brand_contact?: string
  notes?: string
  image_url?: string
}
