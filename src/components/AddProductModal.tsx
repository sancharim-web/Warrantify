import { useState, useEffect } from 'react'
import { CATEGORIES } from '@/lib/warranty-utils'
import type { CreateWarrantyInput } from '@/types'
import type { AttachmentFile } from '@/components/AttachmentModal'

interface AddProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateWarrantyInput) => void
  initialProductName?: string
  attachments?: AttachmentFile[]
  onOpenAttachment?: () => void
}

const initialForm: CreateWarrantyInput = {
  product_name: '',
  brand: '',
  category: 'Electronics',
  purchase_date: '',
  warranty_months: 12,
  serial_number: '',
  warranty_terms: '',
  brand_contact: '',
  notes: '',
}

type EntryMethod = 'manual' | 'upload' | 'scan'

export function AddProductModal({ open, onOpenChange, onSubmit, initialProductName, attachments = [], onOpenAttachment }: AddProductModalProps) {
  const [form, setForm] = useState<CreateWarrantyInput>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [method, setMethod] = useState<EntryMethod>('manual')

  useEffect(() => {
    if (open) {
      setForm({ ...initialForm, product_name: initialProductName ?? '' })
      setErrors({})
      setMethod('manual')
    }
  }, [open, initialProductName])

  if (!open) return null

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.product_name.trim()) errs.product_name = 'Product name is required'
    if (!form.purchase_date) errs.purchase_date = 'Purchase date is required'
    if (!form.warranty_months || form.warranty_months < 1) errs.warranty_months = 'Must be at least 1 month'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form)
    onOpenChange(false)
  }

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-[rgba(244,244,244,0.05)] backdrop-blur-[10px]"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[20px] w-[731px] max-h-[90vh] overflow-y-auto p-[24px] shadow-[0px_4px_31.8px_0px_rgba(0,0,0,0.12)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[32px]">
            {/* Header */}
            <div className="flex flex-col gap-[16px]">
              <p className="font-medium text-[24px] text-black tracking-[-0.48px]">New Product</p>

              {/* Method selection */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
                  How would you like to add this?
                </p>
                <div className="flex gap-[12px]">
                  <button
                    type="button"
                    onClick={() => setMethod('manual')}
                    className={`flex-1 px-[12px] py-[7.5px] rounded-[8px] text-[13px] font-medium tracking-[-0.26px] transition-colors ${
                      method === 'manual'
                        ? 'bg-[#706478] text-white'
                        : 'bg-inner text-[#706478] opacity-50'
                    }`}
                  >
                    Manual Entry (default)
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex-1 px-[12px] py-[7.5px] rounded-[8px] text-[13px] font-medium tracking-[-0.26px] bg-inner text-[#706478] opacity-50 cursor-not-allowed"
                  >
                    Upload (Coming Soon)
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex-1 px-[12px] py-[7.5px] rounded-[8px] text-[13px] font-medium tracking-[-0.26px] bg-inner text-[#706478] opacity-50 cursor-not-allowed"
                  >
                    Scan (Coming Soon)
                  </button>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-[16px]">
              {/* Product Name - full width */}
              <ModalField label="Product Name" error={errors.product_name}>
                <input
                  value={form.product_name}
                  onChange={(e) => update('product_name', e.target.value)}
                  placeholder="e.g. MacBook Pro 16"
                  className="w-full bg-inner rounded-[8px] p-[10px] text-[13px] font-medium tracking-[-0.26px] text-text-body placeholder:text-text-muted outline-none"
                />
              </ModalField>

              {/* Two-column fields */}
              <div className="flex gap-[16px]">
                {/* Left column */}
                <div className="flex-1 flex flex-col gap-[16px]">
                  <ModalField label="Brand">
                    <input
                      value={form.brand}
                      onChange={(e) => update('brand', e.target.value)}
                      placeholder="e.g. Apple"
                      className="w-full bg-inner rounded-[8px] p-[10px] text-[13px] font-medium tracking-[-0.26px] text-text-body placeholder:text-text-muted outline-none"
                    />
                  </ModalField>

                  <ModalField label="Purchase Date" error={errors.purchase_date}>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.purchase_date}
                        onChange={(e) => update('purchase_date', e.target.value)}
                        className="w-full bg-inner rounded-[8px] p-[10px] pr-[32px] text-[13px] font-medium tracking-[-0.26px] text-text-body outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-[32px] [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#584f5e" strokeWidth="1.2"/>
                        <path d="M2 6.5H14" stroke="#584f5e" strokeWidth="1.2"/>
                        <path d="M5.5 1.5V4" stroke="#584f5e" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M10.5 1.5V4" stroke="#584f5e" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </ModalField>

                  <ModalField label="Serial Number">
                    <input
                      value={form.serial_number}
                      onChange={(e) => update('serial_number', e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-inner rounded-[8px] p-[10px] text-[13px] font-medium tracking-[-0.26px] text-text-body uppercase placeholder:normal-case placeholder:text-text-muted outline-none"
                    />
                  </ModalField>
                </div>

                {/* Right column */}
                <div className="flex-1 flex flex-col gap-[16px]">
                  <ModalField label="Category">
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => update('category', e.target.value)}
                        className="w-full bg-inner rounded-[8px] p-[10px] pr-[32px] text-[13px] font-medium tracking-[-0.26px] text-text-body outline-none appearance-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="#584f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </ModalField>

                  <ModalField label="Warranty Period" error={errors.warranty_months}>
                    <input
                      type="number"
                      min={1}
                      value={form.warranty_months}
                      onChange={(e) => update('warranty_months', parseInt(e.target.value) || 0)}
                      className="w-full bg-inner rounded-[8px] p-[10px] text-[13px] font-medium tracking-[-0.26px] text-text-body outline-none"
                    />
                  </ModalField>

                  <ModalField label="Reminders Enabled">
                    <div className="relative w-full bg-inner rounded-[8px] p-[10px] pr-[32px] text-[13px] font-medium tracking-[-0.26px] text-text-body">
                      Notify me 30 days before
                      <svg className="absolute right-[10px] top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="#584f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </ModalField>
                </div>
              </div>

              {/* Upload section */}
              <ModalField label="Upload Warranty Card / Receipt">
                {attachments.length === 0 ? (
                  <button
                    type="button"
                    onClick={onOpenAttachment}
                    className="w-full border-[1.5px] border-dashed border-[#d4d2de] rounded-[12px] py-[32px] flex flex-col items-center gap-[10px] hover:border-btn-primary/50 hover:bg-btn-primary/[0.03] transition-colors group"
                  >
                    <div className="w-[44px] h-[44px] rounded-[12px] bg-inner flex items-center justify-center group-hover:bg-btn-primary/10 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4V10M10 10V16M10 10H16M10 10H4" stroke="#9c9ba1" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="flex flex-col items-center gap-[2px]">
                      <p className="font-medium text-[13px] text-text-body tracking-[-0.26px]">Click to upload</p>
                      <p className="font-medium text-[11px] text-text-muted tracking-[-0.22px]">JPG, PNG, or PDF up to 10MB</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex gap-[10px] flex-wrap">
                      {attachments.filter((f) => f.type === 'image').map((f) => (
                        <div key={f.id} className="relative w-[100px] h-[100px] rounded-[10px] overflow-hidden shrink-0 group">
                          <img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-[6px] py-[5px]">
                            <p className="text-white text-[10px] font-medium truncate">{f.name}</p>
                          </div>
                        </div>
                      ))}
                      {attachments.filter((f) => f.type === 'document').map((f) => (
                        <div key={f.id} className="flex flex-col items-center justify-center gap-[6px] w-[100px] h-[100px] bg-inner rounded-[10px] shrink-0">
                          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                            <path d="M4 2H9L12 5V14H4V2Z" stroke="#706478" strokeWidth="1.2" strokeLinejoin="round"/>
                            <path d="M9 2V5H12" stroke="#706478" strokeWidth="1.2" strokeLinejoin="round"/>
                            <path d="M6 8H10M6 10.5H10" stroke="#706478" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          <p className="font-medium text-[10px] text-text-muted tracking-[-0.2px] truncate max-w-[80px] px-[4px]">{f.name}</p>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={onOpenAttachment}
                        className="shrink-0 w-[100px] h-[100px] rounded-[10px] border-[1.5px] border-dashed border-[#d4d2de] flex flex-col items-center justify-center gap-[4px] hover:border-btn-primary/50 hover:bg-btn-primary/[0.03] transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M9 4V14M4 9H14" stroke="#9c9ba1" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                        <span className="text-[10px] font-medium text-text-muted">Add more</span>
                      </button>
                    </div>
                  </div>
                )}
              </ModalField>

              {/* Notes */}
              <ModalField label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full bg-inner rounded-[8px] p-[10px] text-[13px] font-medium tracking-[-0.26px] text-text-body placeholder:text-text-muted outline-none resize-none"
                />
              </ModalField>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-text-muted text-[16px] font-medium tracking-[-0.32px] underline cursor-pointer">
              Learn more
            </p>
            <div className="flex gap-[16px] items-center">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-[12px] rounded-[12px] text-text-muted text-[16px] font-medium tracking-[-0.32px] hover:opacity-80"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-btn-primary px-[16px] py-[12px] rounded-[12px] text-white text-[16px] font-medium tracking-[-0.32px] hover:opacity-90"
              >
                Save product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="font-medium text-[12px] text-[#a8a8a8] tracking-[-0.24px]">{label}</p>
      {children}
      {error && <p className="text-status-expiring text-[12px] font-medium">{error}</p>}
    </div>
  )
}
