import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTrashedWarranties, restoreWarranty, permanentlyDeleteWarranty } from '@/lib/data-provider'
import { enrichWarranty, getStatusBadgeClasses, getExpiryTextColor } from '@/lib/warranty-utils'
import { format } from 'date-fns'
import type { WarrantyWithStatus } from '@/types'
import shredderIcon from '@/assets/icons/shredder.svg'

export function Shredder() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: trashed = [], isLoading } = useQuery({
    queryKey: ['trashed-warranties'],
    queryFn: fetchTrashedWarranties,
  })

  const restoreMutation = useMutation({
    mutationFn: restoreWarranty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashed-warranties'] })
      queryClient.invalidateQueries({ queryKey: ['warranties'] })
      setSelectedId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteWarranty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashed-warranties'] })
      setSelectedId(null)
    },
  })

  const enriched = trashed.map(enrichWarranty)
  const selected = enriched.find((w) => w.id === (selectedId ?? enriched[0]?.id))

  function handlePermanentDelete(id: string) {
    if (window.confirm('Permanently delete this product? This cannot be undone.')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-[20px]">
        <div className="h-10 w-48 bg-inner rounded-[12px] animate-pulse" />
        <div className="bg-inner rounded-[22px] py-[24px] px-[24px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[80px] bg-panel rounded-[12px] animate-pulse mb-4" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 py-[10px]">
          <p className="font-medium text-[24px] text-black tracking-[-0.48px]">Shredder</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-panel rounded-[8px] px-[24px] py-[16px] flex items-center gap-[12px]">
        <img src={shredderIcon} alt="" className="w-[20px] h-[20px]" />
        <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
          Deleted products are kept here for 30 days before being permanently removed.
        </p>
      </div>

      {/* Content */}
      {enriched.length === 0 ? (
        <div className="bg-inner rounded-[22px] py-[60px] flex flex-col items-center gap-[12px]">
          <img src={shredderIcon} alt="" className="w-[40px] h-[40px] opacity-30" />
          <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">No deleted products</p>
          <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
            Products you delete will appear here
          </p>
        </div>
      ) : (
        <div className="flex gap-[16px] items-start">
          {/* Left: trashed items list */}
          <div className="bg-inner rounded-[22px] flex flex-col w-[264px] shrink-0 gap-[16px]">
            {enriched.map((w) => {
              const isSelected = w.id === (selectedId ?? enriched[0]?.id)
              return (
                <TrashedCard
                  key={w.id}
                  warranty={w}
                  isSelected={isSelected}
                  onClick={() => setSelectedId(w.id)}
                />
              )
            })}
          </div>

          {/* Right: detail panel */}
          {selected && (
            <div className="flex-1 flex flex-col gap-[16px] min-w-0">
              {/* Product details */}
              <div className="bg-panel rounded-[8px] p-[40px] flex flex-col gap-[24px] overflow-hidden">
                <p className="font-medium text-[20px] text-black tracking-[-0.4px]">
                  {selected.product_name}
                </p>

                {/* Trashed date */}
                <div className="bg-[#fff3e0] rounded-[8px] p-[16px] flex flex-col gap-[8px]">
                  <p className="font-medium text-[13px] text-black tracking-[-0.26px]">
                    Moved to Shredder
                  </p>
                  <p className="font-medium text-[13px] text-alert-text tracking-[-0.26px]">
                    This product was deleted on {selected.trashed_at ? format(new Date(selected.trashed_at), "MMM dd'' yyyy") : '—'}.
                    You can restore it or permanently delete it.
                  </p>
                </div>

                {/* Expiry info */}
                <div className="flex items-end gap-[16px]">
                  <div className="flex flex-col gap-[4px]">
                    <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">
                      {selected.status === 'expired' ? 'Expired on' : 'Expiring on'}
                    </p>
                    <p className={`font-medium text-[20px] tracking-[-0.4px] ${getExpiryTextColor(selected.status)}`}>
                      {format(new Date(selected.expiry_date), "MMM dd'' yyyy")}
                    </p>
                  </div>
                  <span className={`px-[8px] py-[4px] rounded-[12px] text-[13px] font-medium tracking-[-0.26px] ${getStatusBadgeClasses(selected.status)}`}>
                    {selected.days_remaining === 0 ? 'Today' : selected.status === 'active' ? 'Active' : selected.status === 'expired' ? 'Inactive' : 'Today'}
                  </span>
                </div>

                {/* Product Information */}
                <div className="flex flex-col gap-[16px]">
                  <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Product Information</p>
                  <div className="flex gap-[20px]">
                    <div className="flex-1 flex flex-col gap-[16px]">
                      <DetailField label="Brand" value={selected.brand ?? '—'} />
                      <DetailField label="Purchase Date" value={format(new Date(selected.purchase_date), "MMM dd'' yyyy")} />
                      {selected.serial_number && <DetailField label="Serial Number" value={selected.serial_number} uppercase />}
                    </div>
                    <div className="flex-1 flex flex-col gap-[16px]">
                      <DetailField label="Category" value={selected.category} />
                      <DetailField label="Warranty Period" value={`${selected.warranty_months} months`} />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-[12px] pt-[8px]">
                  <button
                    onClick={() => restoreMutation.mutate(selected.id)}
                    disabled={restoreMutation.isPending}
                    className="flex items-center gap-[8px] bg-btn-primary px-[20px] py-[12px] rounded-[12px] text-white text-[15px] font-medium tracking-[-0.3px] hover:opacity-90 transition-opacity"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8C2 4.69 4.69 2 8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                      <path d="M2 5V8H5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {restoreMutation.isPending ? 'Recovering...' : 'Recover warranty'}
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(selected.id)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-[8px] px-[20px] py-[12px] rounded-[12px] border border-status-expiring/30 text-status-expiring text-[15px] font-medium tracking-[-0.3px] hover:bg-status-expiring-bg transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4H13M6 4V3H10V4M5 4V13H11V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 7V10.5M9 7V10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete permanently'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TrashedCard({ warranty, isSelected, onClick }: { warranty: WarrantyWithStatus; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-[20px] py-[14px] rounded-[12px] bg-panel flex flex-col gap-[10px] transition-colors opacity-65 ${
        isSelected ? 'border border-[#9a917d]' : ''
      }`}
    >
      <div className="flex flex-col gap-[2px]">
        <p className="font-medium text-[12px] leading-tight text-text-brand tracking-[-0.24px] truncate">
          {warranty.brand || warranty.category}
        </p>
        <p className="font-medium text-[16px] leading-tight text-text-body tracking-[-0.32px] truncate">
          {warranty.product_name}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 flex flex-col gap-[2px] font-medium text-[12px] leading-tight tracking-[-0.24px]">
          <p className="text-text-brand truncate">Deleted on</p>
          <p className="text-text-body">
            {warranty.trashed_at ? format(new Date(warranty.trashed_at), "MMM dd'' yyyy") : '—'}
          </p>
        </div>
        <span className="px-[6px] py-[2px] rounded-[12px] text-[12px] font-medium tracking-[-0.24px] whitespace-nowrap bg-status-expired-bg text-status-expired">
          Deleted
        </span>
      </div>
    </button>
  )
}

function DetailField({ label, value, uppercase }: { label: string; value: string; uppercase?: boolean }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">{label}</p>
      <p className={`font-medium text-[16px] text-text-secondary tracking-[-0.32px] truncate ${uppercase ? 'uppercase' : ''}`}>{value}</p>
    </div>
  )
}
