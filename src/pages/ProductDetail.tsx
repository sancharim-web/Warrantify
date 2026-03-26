import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWarrantyById, trashWarranty, uploadWarrantyImage, uploadGalleryImage, updateWarranty } from '@/lib/data-provider'
import { enrichWarranty, getStatusBadgeClasses, getExpiryTextColor, CATEGORIES } from '@/lib/warranty-utils'
import type { Warranty, Category } from '@/types'
import { format, subDays } from 'date-fns'

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

  const badgeLabel = enriched.status === 'active' ? 'Active'
    : enriched.status === 'expiring_soon'
      ? (enriched.days_remaining === 0 ? 'Today' : 'Expiring soon')
    : 'Expired'

  const hasImage = !!enriched.image_url
  const hasDocuments = !!(enriched.documents && enriched.documents.length > 0)
  const hasMedia = hasImage || hasDocuments

  return (
    <div className="flex flex-col gap-[24px] pt-[24px]">
      {/* Back link */}
      <Link to="/dashboard" className="flex gap-[10px] items-center w-fit text-text-primary">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="font-medium text-[16px] tracking-[-0.32px]">Back to dashboard</p>
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
            <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Product Information</p>

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
              <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Brand Contact</p>
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
        <ReminderSettingsSection
          warrantyId={enriched.id}
          expiryDate={enriched.expiry_date}
          status={enriched.status}
          reminderConfig={enriched.reminder_config}
        />

        {/* Shred warranty */}
        <button
          onClick={handleDelete}
          className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-[10px] text-status-expiring bg-status-expiring-bg/50 hover:bg-status-expiring-bg transition-colors self-start"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M3 6H13M5 6V4H11V6M4 6V13H12V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 8.5V10.5M9.5 8.5V10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
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

      <div className="relative bg-panel rounded-[20px] w-[560px] max-h-[90vh] shadow-[0px_4px_31.8px_0px_rgba(0,0,0,0.12)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[32px] pt-[28px] pb-[20px] border-b border-inner-border">
          <div className="flex flex-col gap-[4px]">
            <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Edit Product</p>
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
        <div className="flex items-center justify-end gap-[12px] px-[32px] py-[20px] border-t border-inner-border">
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

  function handleRemoveImage(index: number) {
    const isCover = coverUrl && index === 0
    if (isCover) {
      if (!window.confirm('Remove the cover image?')) return
      // Promote first gallery image to cover if available
      if (galleryUrls.length > 0) {
        const newCover = galleryUrls[0]
        const remainingGallery = galleryUrls.slice(1)
        setCoverUrl(newCover)
        setGalleryUrls(remainingGallery)
        setLastSavedGallery(remainingGallery)
        updateWarranty(warrantyId, { image_url: newCover, gallery_urls: remainingGallery }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['warranty', warrantyId] })
          queryClient.invalidateQueries({ queryKey: ['warranties'] })
        })
      } else {
        setCoverUrl(null)
        updateWarranty(warrantyId, { image_url: '' }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['warranty', warrantyId] })
          queryClient.invalidateQueries({ queryKey: ['warranties'] })
        })
      }
    } else {
      const galleryIndex = coverUrl ? index - 1 : index
      const updated = galleryUrls.filter((_, i) => i !== galleryIndex)
      setGalleryUrls(updated)
      setLastSavedGallery(updated)
      updateWarranty(warrantyId, { gallery_urls: updated }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['warranty', warrantyId] })
      })
    }
  }

  const allImages: string[] = []
  if (coverUrl) allImages.push(coverUrl)
  allImages.push(...galleryUrls)

  const hasImages = allImages.length > 0

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Media & Documents</p>
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
              <div className="absolute top-[12px] left-[12px] bg-panel/90 backdrop-blur-[8px] rounded-[8px] px-[10px] py-[4px]">
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
              {/* Top-right actions */}
              <div className="absolute top-[12px] right-[12px] flex items-center gap-[8px]">
                <button
                  onClick={() => {
                    const idx = previewIndex!
                    handleRemoveImage(idx)
                    // Navigate to prev image or close if none left
                    const remaining = allImages.length - 1
                    if (remaining === 0) {
                      setPreviewIndex(null)
                    } else {
                      setPreviewIndex(Math.min(idx, remaining - 1))
                    }
                    setActiveIndex(0)
                  }}
                  className="h-[36px] px-[14px] rounded-full bg-red-500/80 backdrop-blur-[8px] flex items-center gap-[6px] hover:bg-red-500 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 3.5H11.5M5.5 3.5V2.5H8.5V3.5M4 3.5V12H10V3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6V9.5M8 6V9.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-white text-[12px] font-medium">Remove</span>
                </button>
                <button
                  onClick={() => setPreviewIndex(null)}
                  className="w-[36px] h-[36px] rounded-full bg-black/50 backdrop-blur-[8px] flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 3L11 11M11 3L3 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
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

function formatDaysLabel(totalDays: number): string {
  if (totalDays >= 365 && totalDays % 365 === 0) {
    const y = totalDays / 365
    return `${y} ${y === 1 ? 'year' : 'years'} reminder`
  }
  if (totalDays >= 30 && totalDays % 30 === 0) {
    const m = totalDays / 30
    return `${m} ${m === 1 ? 'month' : 'months'} reminder`
  }
  const parts: string[] = []
  let remaining = totalDays
  if (remaining >= 365) {
    const y = Math.floor(remaining / 365)
    parts.push(`${y}y`)
    remaining %= 365
  }
  if (remaining >= 30) {
    const m = Math.floor(remaining / 30)
    parts.push(`${m}m`)
    remaining %= 30
  }
  if (remaining > 0 || parts.length === 0) {
    parts.push(`${remaining}d`)
  }
  return `${parts.join(' ')} reminder`
}

function computeTotalDays(years: string, months: string, days: string): number {
  return (parseInt(years) || 0) * 365 + (parseInt(months) || 0) * 30 + (parseInt(days) || 0)
}

function decomposeDays(totalDays: number): { years: string; months: string; days: string } {
  let remaining = totalDays
  const years = Math.floor(remaining / 365)
  remaining %= 365
  const months = Math.floor(remaining / 30)
  remaining %= 30
  return {
    years: years > 0 ? String(years) : '',
    months: months > 0 ? String(months) : '',
    days: remaining > 0 ? String(remaining) : '',
  }
}

function ReminderSettingsSection({ warrantyId, expiryDate, status, reminderConfig }: {
  warrantyId: string
  expiryDate: string
  status: string
  reminderConfig: import('@/types').ReminderConfig | null
}) {
  const queryClient = useQueryClient()
  const defaultConfig = reminderConfig || { enabled: ['30_day', '7_day', 'expiry'], custom: [] }

  const [enabledReminders, setEnabledReminders] = useState<Set<string>>(
    new Set([...defaultConfig.enabled, ...defaultConfig.custom.map((d) => `custom_${d}`)])
  )
  const [addOpen, setAddOpen] = useState(false)
  const [addYears, setAddYears] = useState('')
  const [addMonthsVal, setAddMonthsVal] = useState('')
  const [addDays, setAddDays] = useState('')
  const [customReminders, setCustomReminders] = useState<{ id: string; label: string; daysBefore: number }[]>(
    defaultConfig.custom.map((d) => ({ id: `custom_${d}`, label: formatDaysLabel(d), daysBefore: d }))
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editYears, setEditYears] = useState('')
  const [editMonthsVal, setEditMonthsVal] = useState('')
  const [editDaysVal, setEditDaysVal] = useState('')

  const expiry = new Date(expiryDate)
  const now = new Date()
  const isExpired = status === 'expired'

  function persistConfig(enabled: Set<string>, customs: { id: string; daysBefore: number }[]) {
    const standardEnabled = [...enabled].filter((id) => !id.startsWith('custom_'))
    const customDaysArr = customs.filter((c) => enabled.has(c.id)).map((c) => c.daysBefore)
    const config = { enabled: standardEnabled, custom: customDaysArr }
    updateWarranty(warrantyId, { reminder_config: config }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['warranty', warrantyId] })
    })
  }

  function toggleReminder(id: string) {
    setEnabledReminders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      persistConfig(next, customReminders)
      return next
    })
  }

  function addCustomReminder() {
    const totalDays = computeTotalDays(addYears, addMonthsVal, addDays)
    if (totalDays < 1) return
    const id = `custom_${totalDays}`
    if (enabledReminders.has(id) || REMINDER_OPTIONS.some((o) => o.daysBefore === totalDays)) return
    const newCustom = { id, label: formatDaysLabel(totalDays), daysBefore: totalDays }
    const updatedCustoms = [...customReminders, newCustom]
    setCustomReminders(updatedCustoms)
    setEnabledReminders((prev) => {
      const next = new Set([...prev, id])
      persistConfig(next, updatedCustoms)
      return next
    })
    setAddYears('')
    setAddMonthsVal('')
    setAddDays('')
    setAddOpen(false)
  }

  function removeCustom(id: string) {
    const updatedCustoms = customReminders.filter((r) => r.id !== id)
    setCustomReminders(updatedCustoms)
    setEnabledReminders((prev) => {
      const next = new Set(prev)
      next.delete(id)
      persistConfig(next, updatedCustoms)
      return next
    })
  }

  function saveEditReminder(oldId: string) {
    const totalDays = computeTotalDays(editYears, editMonthsVal, editDaysVal)
    if (totalDays < 1) return
    const newId = `custom_${totalDays}`
    const updatedCustoms = customReminders.map((r) =>
      r.id === oldId ? { id: newId, label: formatDaysLabel(totalDays), daysBefore: totalDays } : r
    )
    setCustomReminders(updatedCustoms)
    setEnabledReminders((prev) => {
      const next = new Set(prev)
      next.delete(oldId)
      next.add(newId)
      persistConfig(next, updatedCustoms)
      return next
    })
    setEditingId(null)
    setEditYears('')
    setEditMonthsVal('')
    setEditDaysVal('')
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
        <div className="flex flex-col gap-[4px]">
          <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Reminder Settings</p>
          <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
            Configure when you want to be notified about this warranty
          </p>
        </div>
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
        <div className="rounded-[10px] border border-btn-primary/20 bg-btn-primary/[0.03] p-[16px]">
          <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px] mb-[12px]">Remind me before expiry</p>
          <div className="flex items-center gap-[8px] flex-wrap">
            <DurationInput label="Years" value={addYears} onChange={setAddYears} placeholder="0" />
            <DurationInput label="Months" value={addMonthsVal} onChange={setAddMonthsVal} placeholder="0" />
            <DurationInput label="Days" value={addDays} onChange={setAddDays} placeholder="0" autoFocus />
            <div className="flex-1" />
            <button
              onClick={addCustomReminder}
              disabled={computeTotalDays(addYears, addMonthsVal, addDays) < 1}
              className="bg-btn-primary px-[16px] py-[8px] rounded-[8px] text-white text-[13px] font-medium tracking-[-0.26px] hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
            >
              Add
            </button>
            <button
              onClick={() => { setAddOpen(false); setAddYears(''); setAddMonthsVal(''); setAddDays('') }}
              className="text-text-muted text-[13px] font-medium tracking-[-0.26px] hover:text-text-body transition-colors shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reminder list */}
      <div className="flex flex-col gap-[8px]">
        {allReminders.map((reminder) => {
          const isEnabled = enabledReminders.has(reminder.id)
          const rStatus = isEnabled ? getReminderStatus(reminder.daysBefore) : 'upcoming'
          const reminderDate = reminder.daysBefore === 0
            ? format(expiry, "MMM d'' yyyy")
            : format(subDays(expiry, reminder.daysBefore), "MMM d'' yyyy")
          const isSent = rStatus === 'sent' && isEnabled
          const isEditing = editingId === reminder.id

          return (
            <div key={reminder.id} className={`rounded-[10px] p-[16px] flex flex-col gap-[12px] transition-colors ${
              isSent ? 'bg-reminder-sent-bg border border-status-active/15' : 'bg-inner'
            }`}>
              {/* Main row */}
              <div className="flex items-center gap-[14px]">
                {/* Toggle checkbox */}
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className={`w-[22px] h-[22px] rounded-[5px] shrink-0 flex items-center justify-center transition-all ${
                    isEnabled
                      ? isSent ? 'bg-status-active shadow-[0_1px_3px_rgba(46,125,50,0.25)]' : 'bg-btn-primary shadow-[0_1px_3px_rgba(125,112,134,0.25)]'
                      : 'bg-[#d4d2de] hover:bg-[#c5c3cd]'
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

                {/* Status badge */}
                <div className="flex items-center gap-[8px] shrink-0">
                  {isSent && (
                    <span className="flex items-center gap-[4px] px-[8px] py-[3px] rounded-[6px] bg-status-active/10 font-medium text-[12px] text-status-active tracking-[-0.24px]">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Sent
                    </span>
                  )}
                  {isEnabled && !isSent && (
                    <span className="flex items-center gap-[4px] px-[8px] py-[3px] rounded-[6px] bg-btn-primary/8 font-medium text-[12px] text-text-muted tracking-[-0.24px]">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1"/>
                        <path d="M5 3V5L6.5 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                      Scheduled
                    </span>
                  )}
                  {!isEnabled && (
                    <span className="px-[8px] py-[3px] rounded-[6px] bg-[#e8e6ec] font-medium text-[12px] text-text-muted/60 tracking-[-0.24px]">
                      Off
                    </span>
                  )}
                </div>
              </div>

              {/* Edit inline form for custom reminders */}
              {isEditing && (
                <div className="flex gap-[8px] items-center pl-[36px] flex-wrap">
                  <DurationInput label="Years" value={editYears} onChange={setEditYears} placeholder="0" small />
                  <DurationInput label="Months" value={editMonthsVal} onChange={setEditMonthsVal} placeholder="0" small />
                  <DurationInput label="Days" value={editDaysVal} onChange={setEditDaysVal} placeholder="0" small autoFocus />
                  <button
                    onClick={() => saveEditReminder(reminder.id)}
                    disabled={computeTotalDays(editYears, editMonthsVal, editDaysVal) < 1}
                    className="px-[12px] py-[6px] rounded-[8px] bg-btn-primary text-white text-[12px] font-medium tracking-[-0.24px] hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditYears(''); setEditMonthsVal(''); setEditDaysVal('') }}
                    className="px-[10px] py-[6px] rounded-[8px] text-text-muted text-[12px] font-medium tracking-[-0.24px] hover:bg-panel transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Action buttons for custom reminders */}
              {reminder.isCustom && !isEditing && (
                <div className="flex items-center gap-[8px] pl-[36px]">
                  <button
                    onClick={() => {
                      setEditingId(reminder.id)
                      const d = decomposeDays(reminder.daysBefore)
                      setEditYears(d.years)
                      setEditMonthsVal(d.months)
                      setEditDaysVal(d.days)
                    }}
                    className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[6px] hover:bg-panel/80 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M8 2L10 4M1.5 10.5L2 8L8.5 1.5L10.5 3.5L4 10L1.5 10.5Z" stroke="#9F8EAB" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">Edit</span>
                  </button>
                  <button
                    onClick={() => removeCustom(reminder.id)}
                    className="flex items-center gap-[5px] px-[10px] py-[5px] rounded-[6px] hover:bg-status-expiring-bg transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 3H10M4.5 3V2H7.5V3M3.5 3V10.5H8.5V3" stroke="#c94040" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.5 5.5V8M6.5 5.5V8" stroke="#c94040" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                    <span className="font-medium text-[12px] text-status-expiring tracking-[-0.24px]">Remove</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Email delivery info */}
      <div className="flex items-center gap-[8px] px-[4px]">
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

function DurationInput({ label, value, onChange, placeholder, autoFocus, small }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
  small?: boolean
}) {
  return (
    <div className="flex flex-col gap-[4px]">
      <p className={`font-medium text-text-muted tracking-[-0.24px] ${small ? 'text-[10px]' : 'text-[11px]'}`}>{label}</p>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`bg-panel rounded-[8px] text-center font-medium text-text-body placeholder:text-text-muted/40 outline-none border border-inner-border focus:border-btn-primary/40 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
          small ? 'w-[52px] px-[8px] py-[5px] text-[13px] tracking-[-0.26px]' : 'w-[60px] px-[10px] py-[8px] text-[15px] tracking-[-0.3px]'
        }`}
      />
    </div>
  )
}
