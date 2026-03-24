import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWarrantyById, trashWarranty, uploadWarrantyImage, uploadGalleryImage, updateWarranty } from '@/lib/data-provider'
import { enrichWarranty, getStatusBadgeClasses, getExpiryTextColor, CATEGORIES } from '@/lib/warranty-utils'
import type { Warranty, Category } from '@/types'
import { format, subDays } from 'date-fns'
import backArrowIcon from '@/assets/icons/back-arrow.svg'
import shredderIcon from '@/assets/icons/shredder.svg'

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: warranty, isLoading } = useQuery({
    queryKey: ['warranty', productId],
    queryFn: () => fetchWarrantyById(productId!),
    enabled: !!productId,
  })

  const [editOpen, setEditOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: trashWarranty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] })
      queryClient.invalidateQueries({ queryKey: ['trashed-warranties'] })
      navigate('/shredder')
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-[24px] pt-[24px]">
        <div className="h-8 w-48 bg-placeholder rounded-[8px] animate-pulse" />
        <div className="h-[80px] bg-panel rounded-[8px] animate-pulse" />
        <div className="h-[400px] bg-panel rounded-[8px] animate-pulse" />
      </div>
    )
  }

  if (!warranty) {
    return (
      <div className="text-center py-16">
        <p className="text-[20px] font-medium tracking-[-0.4px]">Product not found</p>
        <Link to="/dashboard" className="inline-block mt-4 px-[12px] py-[7.5px] rounded-[8px] bg-inner text-text-chip text-[13px] font-medium tracking-[-0.26px]">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const enriched = enrichWarranty(warranty)

  function handleDelete() {
    deleteMutation.mutate(warranty!.id)
  }

  const badgeLabel = enriched.days_remaining === 0 ? 'Today'
    : enriched.status === 'active' ? 'Active'
    : enriched.status === 'expiring_soon' ? 'Expiring soon'
    : 'Expired'

  const hasImage = !!enriched.image_url
  const hasDocuments = !!(enriched.documents && enriched.documents.length > 0)
  const hasMedia = hasImage || hasDocuments

  return (
    <div className="flex flex-col gap-[24px] pt-[24px]">
      {/* Back link */}
      <Link to="/dashboard" className="flex gap-[10px] items-center w-fit">
        <img src={backArrowIcon} alt="" className="w-[20px] h-[20px] rotate-90" />
        <p className="font-medium text-[16px] text-black tracking-[-0.32px]">Back to dashboard</p>
      </Link>

      <div className="flex flex-col gap-[16px]">
        {/* Expiry status bar */}
        <div className="bg-panel rounded-[8px] px-[40px] py-[24px] flex items-start justify-between">
          <div className="flex gap-[16px] items-end">
            <div className="flex flex-col gap-[4px] font-medium">
              <p className="text-text-muted text-[16px] tracking-[-0.32px]">
                {enriched.status === 'expired' ? 'Expired on' : 'Expiring on'}
              </p>
              <p className={`text-[20px] tracking-[-0.4px] ${getExpiryTextColor(enriched.status)}`}>
                {format(new Date(enriched.expiry_date), "MMM d'' yyyy")}
              </p>
            </div>
            <span className={`px-[8px] py-[4px] rounded-[12px] text-[13px] font-medium tracking-[-0.26px] ${getStatusBadgeClasses(enriched.status)}`}>
              {badgeLabel}
            </span>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-[6px] px-[14px] py-[8px] rounded-[12px] bg-inner hover:bg-btn-primary/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="#7d7086" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M10 4L12 6" stroke="#7d7086" strokeWidth="1.2"/>
            </svg>
            <span className="font-medium text-[13px] text-text-body tracking-[-0.26px]">Edit</span>
          </button>
        </div>

        {/* Product Information */}
        <div className="bg-panel rounded-[8px] p-[40px] flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[20px]">
            <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Product Information</p>

            {/* Product name */}
            <DetailField label="Product" value={enriched.product_name} />

            {/* Two column attributes */}
            <div className="flex gap-[20px]">
              <div className="flex-1 flex flex-col gap-[16px]">
                <DetailField label="Brand" value={enriched.brand ?? '—'} />
                <DetailField label="Purchase Date" value={format(new Date(enriched.purchase_date), "MMM d'' yyyy")} />
                {enriched.serial_number && (
                  <DetailField label="Serial Number" value={enriched.serial_number.toUpperCase()} />
                )}
              </div>
              <div className="flex-1 flex flex-col gap-[16px]">
                <DetailField label="Category" value={enriched.category} />
                <DetailField label="Warranty Period" value={`${enriched.warranty_months} months`} />
              </div>
            </div>
          </div>

          {/* Warranty Terms */}
          {enriched.warranty_terms && (
            <div className="flex flex-col gap-[12px]">
              <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">Warranty Terms</p>
              <div className="bg-inner rounded-[8px] p-[16px]">
                <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px] leading-[1.6]">{enriched.warranty_terms}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {enriched.notes && (
            <div className="flex flex-col gap-[12px]">
              <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">Notes</p>
              <div className="bg-inner rounded-[8px] p-[16px]">
                <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px] leading-[1.6]">{enriched.notes}</p>
              </div>
            </div>
          )}

          {/* Media & Documents */}
          <MediaSection
            warrantyId={enriched.id}
            imageUrl={enriched.image_url}
            savedGalleryUrls={enriched.gallery_urls || []}
            documents={enriched.documents || []}
            hasMedia={hasMedia}
          />

          {/* Brand Contact */}
          {enriched.brand_contact && (
            <div className="flex flex-col gap-[16px]">
              <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Brand Contact</p>
              <div className="bg-inner rounded-[12px] p-[20px] flex items-center gap-[16px]">
                <div className="w-[40px] h-[40px] rounded-[10px] bg-btn-primary/10 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5.5C3 4.67 3.67 4 4.5 4H15.5C16.33 4 17 4.67 17 5.5V14.5C17 15.33 16.33 16 15.5 16H4.5C3.67 16 3 15.33 3 14.5V5.5Z" stroke="#7d7086" strokeWidth="1.3"/>
                    <path d="M3 6L10 11L17 6" stroke="#7d7086" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <p className="font-medium text-[15px] text-text-body tracking-[-0.3px]">{enriched.brand_contact}</p>
                  <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">Support contact</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Reminder Settings */}
        <ReminderSettingsSection expiryDate={enriched.expiry_date} status={enriched.status} />

        {/* Shred warranty */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-[10px] text-status-expiring bg-status-expiring-bg/50 hover:bg-status-expiring-bg transition-colors"
        >
          <img src={shredderIcon} alt="" className="w-[16px] h-[16px]" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(5043%) hue-rotate(348deg) brightness(89%) contrast(97%)' }} />
          <span className="font-medium text-[13px] tracking-[-0.26px]">Shred this warranty</span>
        </button>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <EditProductModal
          warranty={warranty}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false)
            queryClient.invalidateQueries({ queryKey: ['warranty', productId] })
            queryClient.invalidateQueries({ queryKey: ['warranties'] })
          }}
        />
      )}
    </div>
  )
}

// ─── Edit Product Modal ───────────────────────────────────

function EditProductModal({
  warranty,
  onClose,
  onSaved,
}: {
  warranty: Warranty
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    product_name: warranty.product_name,
    brand: warranty.brand || '',
    category: warranty.category as string,
    purchase_date: warranty.purchase_date,
    warranty_months: warranty.warranty_months,
    serial_number: warranty.serial_number || '',
    warranty_terms: warranty.warranty_terms || '',
    brand_contact: warranty.brand_contact || '',
    notes: warranty.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Check if anything changed
  const hasChanges =
    form.product_name !== warranty.product_name ||
    form.brand !== (warranty.brand || '') ||
    form.category !== warranty.category ||
    form.purchase_date !== warranty.purchase_date ||
    form.warranty_months !== warranty.warranty_months ||
    form.serial_number !== (warranty.serial_number || '') ||
    form.warranty_terms !== (warranty.warranty_terms || '') ||
    form.brand_contact !== (warranty.brand_contact || '') ||
    form.notes !== (warranty.notes || '')

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.product_name.trim()) {
      setError('Product name is required')
      return
    }
    if (!form.purchase_date) {
      setError('Purchase date is required')
      return
    }
    if (form.warranty_months < 1) {
      setError('Warranty period must be at least 1 month')
      return
    }

    setSaving(true)
    setError('')
    try {
      await updateWarranty(warranty.id, {
        product_name: form.product_name.trim(),
        brand: form.brand.trim() || undefined,
        category: form.category as Category,
        purchase_date: form.purchase_date,
        warranty_months: form.warranty_months,
        serial_number: form.serial_number.trim() || undefined,
        warranty_terms: form.warranty_terms.trim() || undefined,
        brand_contact: form.brand_contact.trim() || undefined,
        notes: form.notes.trim() || undefined,
      })
      onSaved()
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[8px]" onClick={onClose} />

      <div className="relative bg-white rounded-[20px] w-[560px] max-h-[90vh] shadow-[0px_4px_31.8px_0px_rgba(0,0,0,0.12)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[32px] pt-[28px] pb-[20px] border-b border-[#f0ede8]">
          <div className="flex flex-col gap-[4px]">
            <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Edit Product</p>
            <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Update warranty details</p>
          </div>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center hover:bg-inner transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="#9c9ba1" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-[32px] py-[24px] flex flex-col gap-[20px]">
          {/* Product Name */}
          <ModalField label="Product Name" required>
            <input
              value={form.product_name}
              onChange={(e) => updateField('product_name', e.target.value)}
              className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
            />
          </ModalField>

          {/* Brand & Category */}
          <div className="flex gap-[16px]">
            <ModalField label="Brand" className="flex-1">
              <input
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                placeholder="e.g. Apple, Samsung"
                className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
              />
            </ModalField>
            <ModalField label="Category" required className="flex-1">
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </ModalField>
          </div>

          {/* Purchase Date & Warranty Period */}
          <div className="flex gap-[16px]">
            <ModalField label="Purchase Date" required className="flex-1">
              <input
                type="date"
                value={form.purchase_date}
                onChange={(e) => updateField('purchase_date', e.target.value)}
                className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
              />
            </ModalField>
            <ModalField label="Warranty Period (months)" required className="flex-1">
              <input
                type="number"
                min="1"
                value={form.warranty_months}
                onChange={(e) => updateField('warranty_months', parseInt(e.target.value) || 1)}
                className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
              />
            </ModalField>
          </div>

          {/* Serial Number */}
          <ModalField label="Serial Number">
            <input
              value={form.serial_number}
              onChange={(e) => updateField('serial_number', e.target.value)}
              placeholder="Optional"
              className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
            />
          </ModalField>

          {/* Brand Contact */}
          <ModalField label="Brand Contact">
            <input
              value={form.brand_contact}
              onChange={(e) => updateField('brand_contact', e.target.value)}
              placeholder="Support phone or email"
              className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
            />
          </ModalField>

          {/* Warranty Terms */}
          <ModalField label="Warranty Terms">
            <textarea
              value={form.warranty_terms}
              onChange={(e) => updateField('warranty_terms', e.target.value)}
              placeholder="Coverage details, exclusions, etc."
              rows={3}
              className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow resize-none"
            />
          </ModalField>

          {/* Notes */}
          <ModalField label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any additional notes"
              rows={2}
              className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[15px] font-medium tracking-[-0.3px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow resize-none"
            />
          </ModalField>

          {error && (
            <p className="font-medium text-[13px] text-status-expiring tracking-[-0.26px]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[12px] px-[32px] py-[20px] border-t border-[#f0ede8]">
          <button
            onClick={onClose}
            className="px-[20px] py-[10px] rounded-[12px] bg-inner text-[14px] font-medium text-text-body tracking-[-0.28px] hover:opacity-80 transition-opacity"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-[20px] py-[10px] rounded-[12px] text-[14px] font-medium tracking-[-0.28px] transition-all ${
              hasChanges && !saving
                ? 'bg-btn-primary text-white hover:opacity-90'
                : 'bg-[#d4d2de] text-white cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-[6px]">
                <svg className="animate-spin w-[14px] h-[14px]" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round"/>
                </svg>
                Saving...
              </span>
            ) : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalField({ label, required, className, children }: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col gap-[6px] ${className || ''}`}>
      <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
        {label}{required && <span className="text-status-expiring ml-[2px]">*</span>}
      </p>
      {children}
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[6px] font-medium tracking-[-0.32px]">
      <p className="text-[14px] text-text-muted">{label}</p>
      <p className="text-[16px] text-text-secondary truncate">{value}</p>
    </div>
  )
}

// ─── Media Section ────────────────────────────────────────

function MediaSection({
  warrantyId,
  imageUrl,
  savedGalleryUrls,
  documents,
  hasMedia,
}: {
  warrantyId: string
  imageUrl: string | null
  savedGalleryUrls: string[]
  documents: { id: string; file_name: string; storage_path: string; file_type: string }[]
  hasMedia: boolean
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(imageUrl)
  const [galleryUrls, setGalleryUrls] = useState<string[]>(savedGalleryUrls)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lastSavedGallery, setLastSavedGallery] = useState<string[]>(savedGalleryUrls)
  const coverFileRef = useRef<HTMLInputElement>(null)
  const galleryFileRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const hasUnsavedImages = JSON.stringify(galleryUrls) !== JSON.stringify(lastSavedGallery)

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const url = await uploadWarrantyImage(warrantyId, file)
      setCoverUrl(url)
      setActiveIndex(0)
      queryClient.invalidateQueries({ queryKey: ['warranty', warrantyId] })
      queryClient.invalidateQueries({ queryKey: ['warranties'] })
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const url = await uploadGalleryImage(warrantyId, file)
      setGalleryUrls((prev) => [...prev, url])
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveGallery() {
    setSaving(true)
    try {
      await updateWarranty(warrantyId, { gallery_urls: galleryUrls })
      setLastSavedGallery(galleryUrls)
      queryClient.invalidateQueries({ queryKey: ['warranty', warrantyId] })
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const allImages: string[] = []
  if (coverUrl) allImages.push(coverUrl)
  allImages.push(...galleryUrls)

  const hasImages = allImages.length > 0

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Media & Documents</p>
        <div className="flex items-center gap-[8px]">
          <button
            onClick={() => coverFileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary/10 hover:bg-btn-primary/15 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 3V11M3 7H11" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">
              {coverUrl ? 'Change cover' : 'Add cover'}
            </span>
          </button>
          <button
            onClick={() => galleryFileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary/10 hover:bg-btn-primary/15 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="3" width="10" height="8" rx="2" stroke="#7d7086" strokeWidth="1.2"/>
              <path d="M4 9L6 7L7.5 8.5L9 6.5L11 9" stroke="#7d7086" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="5" cy="5.5" r="1" stroke="#7d7086" strokeWidth="1"/>
            </svg>
            <span className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">
              Add image
            </span>
          </button>
          {hasUnsavedImages && (
            <button
              onClick={handleSaveGallery}
              disabled={saving}
              className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary text-white hover:opacity-90 transition-opacity"
            >
              {saving ? (
                <div className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              <span className="font-medium text-[13px] tracking-[-0.26px]">
                {saving ? 'Saving...' : 'Save'}
              </span>
            </button>
          )}
        </div>
        <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        <input ref={galleryFileRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
      </div>

      {uploading && (
        <div className="bg-inner rounded-[12px] px-[16px] py-[10px] flex items-center gap-[10px]">
          <div className="w-[16px] h-[16px] border-2 border-btn-primary/30 border-t-btn-primary rounded-full animate-spin" />
          <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Uploading image...</p>
        </div>
      )}

      {!hasImages && documents.length === 0 && !hasMedia ? (
        <div className="bg-inner rounded-[12px] py-[40px] flex flex-col items-center gap-[12px]">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="6" y="6" width="28" height="28" rx="6" stroke="#d4d2de" strokeWidth="1.5" strokeDasharray="4 3"/>
            <path d="M15 22L18 19L21 22L25 18" stroke="#d4d2de" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="16" cy="15" r="2" stroke="#d4d2de" strokeWidth="1.5"/>
          </svg>
          <p className="font-medium text-[14px] text-text-muted tracking-[-0.28px]">No images yet</p>
          <button
            onClick={() => coverFileRef.current?.click()}
            className="font-medium text-[13px] text-btn-primary tracking-[-0.26px] hover:opacity-80 transition-opacity"
          >
            Upload a product image — it'll be the card cover
          </button>
        </div>
      ) : hasImages ? (
        <div className="flex flex-col gap-[24px]">
          {/* Main image viewer */}
          <button
            onClick={() => setPreviewIndex(activeIndex)}
            className="relative w-full aspect-[16/10] rounded-[16px] overflow-hidden bg-inner group cursor-pointer"
          >
            <img
              src={allImages[activeIndex]}
              alt={activeIndex === 0 && coverUrl ? 'Cover image' : `Image ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            {/* Image counter badge */}
            {allImages.length > 1 && (
              <div className="absolute top-[12px] right-[12px] bg-black/50 backdrop-blur-[8px] rounded-[8px] px-[10px] py-[4px]">
                <span className="text-white text-[12px] font-medium">{activeIndex + 1} / {allImages.length}</span>
              </div>
            )}
            {/* Cover badge */}
            {activeIndex === 0 && coverUrl && (
              <div className="absolute top-[12px] left-[12px] bg-white/90 backdrop-blur-[8px] rounded-[8px] px-[10px] py-[4px]">
                <span className="text-text-body text-[11px] font-semibold tracking-[-0.22px] uppercase">Cover</span>
              </div>
            )}
            {/* Expand icon */}
            <div className="absolute bottom-[12px] right-[12px] w-[32px] h-[32px] rounded-[8px] bg-black/40 backdrop-blur-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 2H14V6M6 14H2V10M14 2L9.5 6.5M2 14L6.5 9.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {/* Thumbnail carousel */}
          {allImages.length > 1 && (
            <div className="flex gap-[10px] overflow-x-auto pb-[2px]">
              {allImages.map((url, i) => {
                const isActive = activeIndex === i
                return (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative shrink-0 w-[64px] h-[64px] rounded-[10px] overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'ring-[2px] ring-btn-primary shadow-[0_2px_8px_rgba(125,112,134,0.25)]'
                        : 'ring-[1px] ring-black/[0.06] opacity-50 hover:opacity-90 hover:ring-black/[0.12]'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && coverUrl && isActive && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-[3px]">
                        <p className="text-white text-[7px] font-bold text-center uppercase tracking-[0.6px]">Cover</p>
                      </div>
                    )}
                  </button>
                )
              })}
              {/* Add more */}
              <button
                onClick={() => galleryFileRef.current?.click()}
                className="shrink-0 w-[64px] h-[64px] rounded-[10px] border-[1.5px] border-dashed border-[#d4d2de] flex flex-col items-center justify-center gap-[3px] hover:border-btn-primary/40 hover:bg-btn-primary/[0.04] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 5V11M5 8H11" stroke="#9c9ba1" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Document files */}
          {documents.length > 0 && (
            <div className="flex gap-[10px] flex-wrap">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-inner rounded-[10px] px-[14px] py-[10px] flex items-center gap-[10px]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 2.5H11L14 5.5V15.5H4V2.5Z" stroke="#7d7086" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M11 2.5V5.5H14" stroke="#7d7086" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M7 9H11M7 11.5H11" stroke="#7d7086" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <p className="font-medium text-[14px] text-text-secondary tracking-[-0.28px]">{doc.file_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : documents.length > 0 ? (
        <div className="flex gap-[10px] flex-wrap">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-inner rounded-[10px] px-[14px] py-[10px] flex items-center gap-[10px]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 2.5H11L14 5.5V15.5H4V2.5Z" stroke="#7d7086" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M11 2.5V5.5H14" stroke="#7d7086" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M7 9H11M7 11.5H11" stroke="#7d7086" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <p className="font-medium text-[14px] text-text-secondary tracking-[-0.28px]">{doc.file_name}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Fullscreen image preview modal */}
      {previewIndex !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={() => setPreviewIndex(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[8px]" />
          <div className="relative flex flex-col items-center gap-[24px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* Main preview image */}
            <div className="relative">
              <img
                src={allImages[previewIndex]}
                alt="Preview"
                className="max-w-[90vw] max-h-[70vh] rounded-[12px] object-contain"
              />
              {/* Close button */}
              <button
                onClick={() => setPreviewIndex(null)}
                className="absolute top-[12px] right-[12px] w-[36px] h-[36px] rounded-full bg-black/50 backdrop-blur-[8px] flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3L11 11M11 3L3 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {/* Nav arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setPreviewIndex((previewIndex - 1 + allImages.length) % allImages.length)}
                    className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full bg-black/40 backdrop-blur-[8px] flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 3L5 8L10 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setPreviewIndex((previewIndex + 1) % allImages.length)}
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full bg-black/40 backdrop-blur-[8px] flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3L11 8L6 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
            {/* Thumbnail strip in modal */}
            {allImages.length > 1 && (
              <div className="flex gap-[8px]">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewIndex(i)}
                    className={`shrink-0 w-[56px] h-[56px] rounded-[8px] overflow-hidden transition-all ${
                      previewIndex === i
                        ? 'ring-[2px] ring-white ring-offset-2 ring-offset-black/70'
                        : 'opacity-50 hover:opacity-90'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Image counter */}
            <p className="text-white/70 text-[13px] font-medium">{previewIndex + 1} of {allImages.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reminder Settings ────────────────────────────────────

interface ReminderOption {
  id: string
  label: string
  description: string
  daysBefore: number
}

const REMINDER_OPTIONS: ReminderOption[] = [
  { id: '30_day', label: '30 day reminder', description: 'Email notification 30 days before expiry', daysBefore: 30 },
  { id: '7_day', label: '7 day reminder', description: 'Email notification 7 days before expiry', daysBefore: 7 },
  { id: '1_day', label: '1 day reminder', description: 'Email notification 1 day before expiry', daysBefore: 1 },
  { id: 'expiry', label: 'Expiry day alert', description: 'Email notification on the day of expiry', daysBefore: 0 },
]

function ReminderSettingsSection({ expiryDate, status }: { expiryDate: string; status: string }) {
  const [enabledReminders, setEnabledReminders] = useState<Set<string>>(
    new Set(['30_day', '7_day', 'expiry'])
  )
  const [addOpen, setAddOpen] = useState(false)
  const [customDays, setCustomDays] = useState('')
  const [customReminders, setCustomReminders] = useState<{ id: string; label: string; daysBefore: number }[]>([])

  const expiry = new Date(expiryDate)
  const now = new Date()
  const isExpired = status === 'expired'

  function toggleReminder(id: string) {
    setEnabledReminders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addCustomReminder() {
    const days = parseInt(customDays)
    if (isNaN(days) || days < 1 || days > 365) return
    const id = `custom_${days}`
    if (enabledReminders.has(id) || REMINDER_OPTIONS.some((o) => o.daysBefore === days)) return
    setCustomReminders((prev) => [...prev, { id, label: `${days} day reminder`, daysBefore: days }])
    setEnabledReminders((prev) => new Set([...prev, id]))
    setCustomDays('')
    setAddOpen(false)
  }

  function removeCustom(id: string) {
    setCustomReminders((prev) => prev.filter((r) => r.id !== id))
    setEnabledReminders((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const allReminders = [
    ...REMINDER_OPTIONS.map((o) => ({ ...o, isCustom: false })),
    ...customReminders.map((o) => ({ ...o, description: `Custom reminder ${o.daysBefore} days before`, isCustom: true })),
  ].sort((a, b) => b.daysBefore - a.daysBefore)

  function getReminderStatus(daysBefore: number): 'sent' | 'upcoming' {
    const reminderDate = daysBefore === 0 ? expiry : subDays(expiry, daysBefore)
    if (isExpired) return 'sent'
    if (reminderDate <= now) return 'sent'
    return 'upcoming'
  }

  return (
    <div className="bg-panel rounded-[8px] px-[40px] py-[24px] flex flex-col gap-[20px]">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Reminder Settings</p>
        <button
          onClick={() => setAddOpen(!addOpen)}
          className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary/10 hover:bg-btn-primary/15 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3V11M3 7H11" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">Add reminder</span>
        </button>
      </div>

      {/* Add custom reminder */}
      {addOpen && (
        <div className="bg-inner rounded-[12px] p-[16px] flex flex-col gap-[12px]">
          <p className="font-medium text-[14px] text-text-body tracking-[-0.28px]">Add custom reminder</p>
          <div className="flex gap-[8px] items-center">
            <input
              type="number"
              min="1"
              max="365"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              placeholder="Days before expiry"
              className="flex-1 bg-white rounded-[8px] px-[12px] py-[8px] text-[14px] font-medium tracking-[-0.28px] text-text-body placeholder:text-text-muted/60 outline-none border border-[#e8e6ec] focus:border-btn-primary/40 transition-colors"
            />
            <button
              onClick={addCustomReminder}
              className="bg-btn-primary px-[16px] py-[8px] rounded-[8px] text-white text-[13px] font-medium tracking-[-0.26px] hover:opacity-90 transition-opacity"
            >
              Add
            </button>
            <button
              onClick={() => { setAddOpen(false); setCustomDays('') }}
              className="px-[12px] py-[8px] rounded-[8px] text-text-muted text-[13px] font-medium tracking-[-0.26px] hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reminder list */}
      <div className="flex flex-col gap-[12px]">
        {allReminders.map((reminder) => {
          const isEnabled = enabledReminders.has(reminder.id)
          const rStatus = isEnabled ? getReminderStatus(reminder.daysBefore) : 'upcoming'
          const reminderDate = reminder.daysBefore === 0
            ? format(expiry, "MMM d'' yyyy")
            : format(subDays(expiry, reminder.daysBefore), "MMM d'' yyyy")
          const isSent = rStatus === 'sent' && isEnabled

          return (
            <div key={reminder.id} className={`${isSent ? 'bg-reminder-sent-bg' : 'bg-inner'} rounded-[8px] p-[14px] flex items-center gap-[14px]`}>
              {/* Toggle */}
              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`w-[20px] h-[20px] rounded-[4px] shrink-0 flex items-center justify-center transition-colors ${
                  isEnabled
                    ? isSent ? 'bg-status-active' : 'bg-btn-primary'
                    : 'bg-[#d4d2de]'
                }`}
              >
                {isEnabled && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-[15px] tracking-[-0.3px] ${isEnabled ? 'text-text-body' : 'text-text-muted'}`}>
                  {reminder.label}
                </p>
                <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px] mt-[2px]">
                  {isEnabled ? reminderDate : reminder.description}
                </p>
              </div>

              {/* Status / Remove */}
              <div className="flex items-center gap-[8px] shrink-0">
                {isSent && (
                  <span className="font-medium text-[13px] text-status-active tracking-[-0.26px]">Sent!</span>
                )}
                {isEnabled && !isSent && (
                  <span className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Scheduled</span>
                )}
                {!isEnabled && (
                  <span className="font-medium text-[13px] text-text-muted/60 tracking-[-0.26px]">Off</span>
                )}
                {reminder.isCustom && (
                  <button
                    onClick={() => removeCustom(reminder.id)}
                    className="w-[20px] h-[20px] rounded-[4px] hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2L8 8M8 2L2 8" stroke="#9F8EAB" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Email delivery info */}
      <div className="flex items-center gap-[8px] pt-[4px]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="#9F8EAB" strokeWidth="1"/>
          <path d="M7 4.5V7.5" stroke="#9F8EAB" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="7" cy="9.5" r="0.5" fill="#9F8EAB"/>
        </svg>
        <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">
          Reminders are sent to your registered email address
        </p>
      </div>
    </div>
  )
}
