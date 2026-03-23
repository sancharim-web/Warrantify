import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { fetchReminders, fetchWarranties } from '@/lib/data-provider'
import { enrichWarranty, getStatusBadgeClasses, getExpiryTextColor } from '@/lib/warranty-utils'
import { format } from 'date-fns'
import type { Reminder, Warranty, WarrantyWithStatus } from '@/types'
import filterIcon from '@/assets/icons/filter.svg'

type SortOption = 'expiry_asc' | 'expiry_desc' | 'name_asc' | 'name_desc' | 'recent'

const SORT_LABELS: Record<SortOption, string> = {
  expiry_asc: 'Expiry (soonest first)',
  expiry_desc: 'Expiry (latest first)',
  name_asc: 'Name (A-Z)',
  name_desc: 'Name (Z-A)',
  recent: 'Recently added',
}

export function MailReminders() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('expiry_asc')
  const [filterOpen, setFilterOpen] = useState(false)
  const [addReminderOpen, setAddReminderOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
  })

  const { data: allWarranties = [] } = useQuery({
    queryKey: ['warranties'],
    queryFn: fetchWarranties,
  })

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filterOpen])

  // Group reminders by warranty
  const grouped = reminders.reduce<Record<string, { warranty?: Warranty; reminders: (typeof reminders)[number][] }>>((acc, r) => {
    const key = r.warranty_id
    if (!acc[key]) acc[key] = { warranty: r.warranty, reminders: [] }
    acc[key].reminders.push(r)
    return acc
  }, {})

  const groupedList = Object.entries(grouped)
    .filter(([, g]) => !!g.warranty)
    .map(([id, g]) => ({ id, warranty: g.warranty!, enriched: enrichWarranty(g.warranty!), reminders: g.reminders }))
    .sort((a, b) => {
      switch (sortBy) {
        case 'expiry_asc':
          return a.enriched.days_remaining - b.enriched.days_remaining
        case 'expiry_desc':
          return b.enriched.days_remaining - a.enriched.days_remaining
        case 'name_asc':
          return a.enriched.product_name.localeCompare(b.enriched.product_name)
        case 'name_desc':
          return b.enriched.product_name.localeCompare(a.enriched.product_name)
        case 'recent':
          return new Date(b.enriched.created_at).getTime() - new Date(a.enriched.created_at).getTime()
      }
    })

  const activeId = selectedId ?? groupedList[0]?.id
  const selectedGroup = groupedList.find((g) => g.id === activeId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-[20px]">
        <div className="h-10 w-48 bg-inner rounded-[12px] animate-pulse" />
        <div className="flex gap-[16px]">
          <div className="w-[264px] shrink-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[130px] bg-panel rounded-[12px] animate-pulse mb-4" />
            ))}
          </div>
          <div className="flex-1 flex flex-col gap-[16px]">
            <div className="bg-panel rounded-[8px] h-[400px] animate-pulse" />
            <div className="bg-panel rounded-[8px] h-[200px] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 py-[10px]">
          <p className="font-medium text-[24px] text-black tracking-[-0.48px]">Mail reminders</p>
        </div>
        {/* Add reminder button */}
        <button
          onClick={() => setAddReminderOpen(true)}
          className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary/10 hover:bg-btn-primary/15 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3V11M3 7H11" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">Add reminder</span>
        </button>
        {/* Filter dropdown */}
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="rounded-full w-[32px] h-[32px] flex items-center justify-center hover:bg-inner transition-colors"
          >
            <img src={filterIcon} alt="" className="w-[20px] h-[20px]" />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-[40px] bg-panel rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] py-[8px] w-[220px] z-50">
              <p className="px-[16px] py-[8px] text-[12px] font-medium text-text-muted tracking-[-0.24px] uppercase">
                Sort by
              </p>
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); setFilterOpen(false) }}
                  className={`w-full text-left px-[16px] py-[10px] text-[14px] font-medium tracking-[-0.28px] transition-colors hover:bg-inner ${
                    sortBy === key ? 'text-btn-primary' : 'text-text-secondary'
                  }`}
                >
                  {SORT_LABELS[key]}
                  {sortBy === key && (
                    <span className="float-right">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-[8px] items-start">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-[12px] py-[7.5px] rounded-[8px] text-[13px] font-medium tracking-[-0.26px] capitalize transition-colors ${
              filter === f ? 'bg-chip-active text-white' : 'bg-chip-inactive text-text-chip hover:opacity-80'
            }`}
          >
            {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
          </button>
        ))}
      </div>

      {/* Content */}
      {groupedList.length === 0 ? (
        <div className="bg-inner rounded-[22px] py-[60px] px-[40px] flex flex-col items-center gap-[20px]">
          <div className="w-[64px] h-[64px] rounded-[16px] bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="6" width="22" height="16" rx="3" stroke="#d4d2de" strokeWidth="1.5"/>
              <path d="M3 9L14 16L25 9" stroke="#d4d2de" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col items-center gap-[8px]">
            <p className="text-text-body text-[16px] font-medium tracking-[-0.32px]">No reminders yet</p>
            <p className="text-text-muted text-[13px] font-medium tracking-[-0.26px] text-center max-w-[320px]">
              Add products with warranties to automatically receive email reminders before they expire
            </p>
          </div>
          {allWarranties.length > 0 ? (
            <button
              onClick={() => setAddReminderOpen(true)}
              className="bg-btn-primary px-[20px] py-[10px] rounded-[10px] text-white text-[14px] font-medium tracking-[-0.28px] hover:opacity-90 transition-opacity flex items-center gap-[6px]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 3V11M3 7H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Set up reminders
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-btn-primary px-[20px] py-[10px] rounded-[10px] text-white text-[14px] font-medium tracking-[-0.28px] hover:opacity-90 transition-opacity flex items-center gap-[6px]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 3V11M3 7H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add your first product
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-[16px] items-start">
          {/* Left: product card column */}
          <div className="bg-inner rounded-[22px] w-[264px] shrink-0 flex flex-col gap-[16px]">
            {groupedList.map(({ id, enriched }) => {
              const isSelected = id === activeId
              return (
                <ReminderCard
                  key={id}
                  enriched={enriched}
                  isSelected={isSelected}
                  onClick={() => setSelectedId(id)}
                />
              )
            })}
          </div>

          {/* Right: detail panel */}
          {selectedGroup && (
            <div className="flex-1 flex flex-col gap-[16px] min-w-0">
              <DetailCard enriched={selectedGroup.enriched} warranty={selectedGroup.warranty} />
              <HistoryCard enriched={selectedGroup.enriched} reminders={selectedGroup.reminders} />
            </div>
          )}
        </div>
      )}

      {/* Add Reminder Modal */}
      {addReminderOpen && (
        <AddReminderModal
          warranties={allWarranties.filter((w) => !w.trashed_at)}
          onClose={() => setAddReminderOpen(false)}
          onSelectProduct={(id) => {
            setAddReminderOpen(false)
            navigate(`/myproducts/${id}`)
          }}
        />
      )}
    </div>
  )
}

/* ── Add Reminder Modal ───────────────────────────────────── */

function AddReminderModal({
  warranties,
  onClose,
  onSelectProduct,
}: {
  warranties: Warranty[]
  onClose: () => void
  onSelectProduct: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const enrichedList = warranties.map(enrichWarranty)
  const filtered = search.trim()
    ? enrichedList.filter((w) =>
        w.product_name.toLowerCase().includes(search.toLowerCase()) ||
        (w.brand?.toLowerCase().includes(search.toLowerCase()))
      )
    : enrichedList

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[8px]" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] w-[480px] max-h-[560px] shadow-[0px_4px_31.8px_0px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-[24px] pt-[24px] pb-[16px] flex flex-col gap-[16px]">
          <div className="flex items-center justify-between">
            <p className="font-medium text-[18px] text-black tracking-[-0.36px]">Set up reminders</p>
            <button onClick={onClose} className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center hover:bg-inner transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="#9c9ba1" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
            Select a product to configure its reminder settings
          </p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-inner rounded-[10px] px-[14px] py-[10px] text-[14px] font-medium tracking-[-0.28px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
          />
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto px-[24px] pb-[24px]">
          {filtered.length === 0 ? (
            <div className="py-[32px] text-center">
              <p className="text-text-muted text-[14px] font-medium tracking-[-0.28px]">No products found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[8px]">
              {filtered.map((w) => (
                <button
                  key={w.id}
                  onClick={() => onSelectProduct(w.id)}
                  className="w-full text-left bg-inner hover:bg-[#eae8e3] rounded-[10px] p-[14px] flex items-center gap-[12px] transition-colors"
                >
                  {w.image_url ? (
                    <img src={w.image_url} alt="" className="w-[40px] h-[40px] rounded-[8px] object-cover shrink-0" />
                  ) : (
                    <div className="w-[40px] h-[40px] rounded-[8px] bg-placeholder shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[13px] text-text-brand tracking-[-0.26px]">{w.brand || w.category}</p>
                    <p className="font-medium text-[15px] text-text-body tracking-[-0.3px] truncate">{w.product_name}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-[2px]">
                    <span className={`px-[6px] py-[1px] rounded-[8px] text-[11px] font-medium tracking-[-0.22px] ${getStatusBadgeClasses(w.status)}`}>
                      {w.status === 'active' ? 'Active' : w.status === 'expired' ? 'Expired' : 'Expiring'}
                    </span>
                    <span className="font-medium text-[11px] text-text-muted tracking-[-0.22px]">
                      {w.days_remaining} days
                    </span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                    <path d="M5 3L9 7L5 11" stroke="#9F8EAB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Left panel card ──────────────────────────────────────── */

function ReminderCard({ enriched, isSelected, onClick }: { enriched: WarrantyWithStatus; isSelected: boolean; onClick: () => void }) {
  const expiryLabel = enriched.status === 'active' ? 'Expiring in' : 'Expiring on'
  const expiryValue = enriched.status === 'active'
    ? `${enriched.days_remaining} days`
    : format(new Date(enriched.expiry_date), "MMM dd'' yyyy")
  const badgeLabel = enriched.days_remaining === 0 ? 'Today' : enriched.status === 'active' ? 'Active' : enriched.status === 'expired' ? 'Inactive' : 'Today'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-[24px] rounded-[12px] bg-panel flex flex-col gap-[16px] transition-colors ${
        isSelected ? 'border border-[#9a917d]' : ''
      }`}
    >
      <div className="flex flex-col gap-[2px]">
        <p className="font-medium text-[12px] leading-tight text-text-brand tracking-[-0.24px] truncate">
          {enriched.brand || enriched.category}
        </p>
        <p className="font-medium text-[16px] leading-tight text-text-body tracking-[-0.32px] truncate">
          {enriched.product_name}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 flex flex-col gap-[2px] font-medium text-[12px] leading-tight tracking-[-0.24px]">
          <p className="text-text-brand truncate">{expiryLabel}</p>
          <p className={getExpiryTextColor(enriched.status)}>{expiryValue}</p>
        </div>
        <span className={`px-[6px] py-[2px] rounded-[12px] text-[12px] font-medium tracking-[-0.24px] whitespace-nowrap ${getStatusBadgeClasses(enriched.status)}`}>
          {badgeLabel}
        </span>
      </div>
    </button>
  )
}

/* ── Right panel: Product Details card ────────────────────── */

function DetailCard({ enriched, warranty }: { enriched: WarrantyWithStatus; warranty: Warranty }) {
  const isExpiringToday = enriched.status === 'expiring_soon' && enriched.days_remaining === 0
  const badgeLabel = enriched.days_remaining === 0 ? 'Today' : enriched.status === 'active' ? 'Active' : enriched.status === 'expired' ? 'Inactive' : 'Today'

  return (
    <div className="bg-panel rounded-[8px] p-[40px] flex flex-col gap-[24px] overflow-hidden">
      {/* Title */}
      <p className="font-medium text-[20px] text-black tracking-[-0.4px]">
        {isExpiringToday ? 'Warranty Expires Today!' : enriched.status === 'expired' ? 'Warranty Expired' : 'Warranty Reminder'}
      </p>

      {/* Expiry info */}
      <div className="flex items-end gap-[16px]">
        <div className="flex flex-col gap-[4px]">
          <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">
            {enriched.status === 'expired' ? 'Expired on' : 'Expiring on'}
          </p>
          <p className={`font-medium text-[20px] tracking-[-0.4px] ${getExpiryTextColor(enriched.status)}`}>
            {format(new Date(enriched.expiry_date), "MMM dd'' yyyy")}
          </p>
        </div>
        <span className={`px-[8px] py-[4px] rounded-[12px] text-[13px] font-medium tracking-[-0.26px] ${getStatusBadgeClasses(enriched.status)}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Warning section */}
      {(enriched.status === 'expiring_soon' || enriched.status === 'expired') && (
        <div className="bg-alert-bg rounded-[8px] p-[16px] flex flex-col gap-[8px]">
          <p className="font-medium text-[13px] text-black tracking-[-0.26px]">
            {enriched.status === 'expired' ? 'Warranty Has Expired' : 'Immediate Action Required'}
          </p>
          <p className="font-medium text-[13px] text-alert-text tracking-[-0.26px]">
            {enriched.status === 'expired'
              ? `Your warranty for the ${warranty.product_name} has expired. Any repairs or replacements are no longer covered.`
              : `Your warranty for the ${warranty.product_name} expires ${enriched.days_remaining === 0 ? 'today' : `in ${enriched.days_remaining} days`}. If you're experiencing any issues with this product, contact the manufacturer immediately.`}
          </p>
        </div>
      )}

      {/* Product Information */}
      <div className="flex flex-col gap-[16px]">
        <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Product Information</p>

        <div className="flex flex-col gap-[8px]">
          <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">Product</p>
          <p className="font-medium text-[16px] text-text-secondary tracking-[-0.32px] truncate">{warranty.product_name}</p>
        </div>

        <div className="flex gap-[20px]">
          <div className="flex-1 flex flex-col gap-[16px]">
            <InfoField label="Brand" value={warranty.brand ?? '—'} />
            <InfoField label="Purchase Date" value={format(new Date(warranty.purchase_date), "MMM dd'' yyyy")} />
            {warranty.serial_number && <InfoField label="Serial Number" value={warranty.serial_number} uppercase />}
          </div>
          <div className="flex-1 flex flex-col gap-[16px]">
            <InfoField label="Category" value={warranty.category} />
            <InfoField label="Warranty Period" value={`${warranty.warranty_months} months`} />
            <InfoField label="Reminders Enabled" value="Notify me 30 days before" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Right panel: Reminder History card ───────────────────── */

function HistoryCard({ enriched, reminders }: { enriched: WarrantyWithStatus; reminders: Reminder[] }) {
  return (
    <div className="bg-panel rounded-[8px] px-[40px] py-[24px] flex flex-col gap-[24px] overflow-hidden">
      <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Reminder History</p>
      <div className="flex flex-col gap-[8px]">
        {[...reminders]
          .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime())
          .map((r) => (
            <div key={r.id} className="flex gap-[16px] items-start p-[12px]">
              <div className="w-[20px] h-[20px] rounded-[4px] bg-status-active flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col gap-[8px]">
                <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">
                  {r.type === '30_day' ? '30 day reminder sent' : '7 day Reminder sent'}
                </p>
                <p className="font-medium text-[15px] text-text-muted tracking-[-0.3px]">
                  Email sent to user@email.com
                </p>
                <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
                  {format(new Date(r.sent_at), "MMM dd'' yyyy")}
                </p>
              </div>
            </div>
          ))}

        {/* Expiry event */}
        {(enriched.status === 'expired' || (enriched.status === 'expiring_soon' && enriched.days_remaining === 0)) && (
          <div className="flex gap-[16px] items-start p-[12px]">
            <div className="w-[20px] h-[20px] rounded-[4px] bg-status-expiring flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 3V6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="6" cy="9" r="0.75" fill="white"/>
              </svg>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="font-medium text-[15px] text-status-expiring tracking-[-0.3px]">Warranty expires</p>
              <p className="font-medium text-[15px] text-text-muted tracking-[-0.3px]">Coverage period ends today</p>
              <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
                {format(new Date(enriched.expiry_date), "MMM dd'' yyyy")} - Now
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Shared helpers ───────────────────────────────────────── */

function InfoField({ label, value, uppercase }: { label: string; value: string; uppercase?: boolean }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">{label}</p>
      <p className={`font-medium text-[16px] text-text-secondary tracking-[-0.32px] truncate ${uppercase ? 'uppercase' : ''}`}>{value}</p>
    </div>
  )
}
