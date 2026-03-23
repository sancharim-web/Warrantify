import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWarrantyById, trashWarranty } from '@/lib/data-provider'
import { enrichWarranty, getStatusBadgeClasses, getExpiryTextColor } from '@/lib/warranty-utils'
import { format, subDays } from 'date-fns'
import backArrowIcon from '@/assets/icons/back-arrow.svg'
import deleteIcon from '@/assets/icons/delete.svg'
import imageFileIcon from '@/assets/icons/image-file.svg'
import docFileIcon from '@/assets/icons/doc-file.svg'

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: warranty, isLoading } = useQuery({
    queryKey: ['warranty', productId],
    queryFn: () => fetchWarrantyById(productId!),
    enabled: !!productId,
  })

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
    : enriched.status === 'expiring_soon' ? 'Today'
    : 'Inactive'

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
                {enriched.status === 'expired' ? 'Expired' : 'Expiring on'}
              </p>
              <p className={`text-[20px] tracking-[-0.4px] ${getExpiryTextColor(enriched.status)}`}>
                {enriched.status === 'expired'
                  ? format(new Date(enriched.expiry_date), "MMM d'' yyyy")
                  : format(new Date(enriched.expiry_date), "MMM d'' yyyy")}
              </p>
            </div>
            <span className={`px-[8px] py-[4px] rounded-[12px] text-[13px] font-medium tracking-[-0.26px] ${getStatusBadgeClasses(enriched.status)}`}>
              {badgeLabel}
            </span>
          </div>
          <button onClick={handleDelete} className="p-[8px] rounded-[12px] hover:bg-inner transition-colors">
            <img src={deleteIcon} alt="Delete" className="w-[24px] h-[24px]" />
          </button>
        </div>

        {/* Product Information */}
        <div className="bg-panel rounded-[8px] p-[40px] flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[16px]">
              <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Product Information</p>

              {/* Product name */}
              <DetailField label="Product" value={enriched.product_name} />

              {/* Two column attributes */}
              <div className="flex gap-[20px]">
                <div className="flex-1 flex flex-col gap-[16px]">
                  <DetailField label="Brand" value={enriched.brand ?? '—'} />
                  <DetailField label="Purchase Date" value={format(new Date(enriched.purchase_date), "MMM d'' yyyy")} />
                  <DetailField label="Serial Number" value={enriched.serial_number?.toUpperCase() ?? '—'} />
                </div>
                <div className="flex-1 flex flex-col gap-[16px]">
                  <DetailField label="Category" value={enriched.category} />
                  <DetailField label="Warranty Period" value={`${enriched.warranty_months} months`} />
                  <DetailField label="Reminders Enabled" value="Notify me 30 days before" />
                </div>
              </div>
            </div>

            {/* Notes */}
            {enriched.notes && (
              <div className="flex flex-col gap-[12px]">
                <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">Notes</p>
                <div className="bg-inner rounded-[8px] p-[12px]">
                  <p className="font-medium text-[16px] text-text-secondary tracking-[-0.32px]">{enriched.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Media */}
          <div className="flex flex-col gap-[20px]">
            <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Media</p>
            {enriched.image_url && (
              <div className="bg-inner rounded-[8px] p-[12px] flex gap-[16px]">
                <img src={enriched.image_url} alt={enriched.product_name} className="w-[160px] h-[100px] rounded-[8px] object-cover" />
              </div>
            )}
            <div className="flex gap-[16px] flex-wrap">
              <div className="bg-inner flex gap-[10px] items-center p-[12px] rounded-[8px]">
                <img src={imageFileIcon} alt="" className="w-[20px] h-[20px]" />
                <p className="font-medium text-[16px] text-text-secondary tracking-[-0.32px]">
                  {enriched.image_url ? 'Product Image' : 'Product.JPEG'}
                </p>
              </div>
              <div className="bg-inner flex gap-[10px] items-center p-[12px] rounded-[8px]">
                <img src={docFileIcon} alt="" className="w-[20px] h-[20px]" />
                <p className="font-medium text-[16px] text-text-secondary tracking-[-0.32px]">View Warranty Card</p>
              </div>
              <div className="bg-inner flex items-center p-[12px] rounded-[8px] cursor-pointer hover:opacity-80 transition-opacity">
                <p className="font-medium text-[16px] text-text-secondary tracking-[-0.32px]">Add more</p>
              </div>
            </div>
          </div>

          {/* Brand Contact */}
          {enriched.brand_contact && (
            <div className="flex flex-col gap-[20px]">
              <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Brand Contact</p>
              <div className="flex gap-[12px]">
                <div className="flex-1 flex flex-col gap-[12px]">
                  <DetailField label="Support" value={enriched.brand_contact} />
                  <DetailField label="Email" value="—" />
                </div>
                <div className="flex-1">
                  <DetailField label="Website" value="—" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reminder Settings */}
        <ReminderSettingsSection expiryDate={enriched.expiry_date} status={enriched.status} />
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[8px] font-medium text-[16px] tracking-[-0.32px]">
      <p className="text-text-muted">{label}</p>
      <p className="text-text-secondary truncate">{value}</p>
    </div>
  )
}

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

  function getReminderStatus(daysBefore: number): 'sent' | 'pending' | 'upcoming' {
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
