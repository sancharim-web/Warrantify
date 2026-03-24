import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import type { WarrantyWithStatus } from '@/types'
import { getExpiryTextColor } from '@/lib/warranty-utils'

interface WarrantyCardProps {
  warranty: WarrantyWithStatus
}

function getStatusBadge(status: string, daysRemaining: number) {
  switch (status) {
    case 'active':
      return { label: 'Active', bg: 'bg-status-active-bg', text: 'text-status-active' }
    case 'expiring_soon':
      return {
        label: daysRemaining === 0 ? 'Today' : 'Today',
        bg: 'bg-status-expiring-bg',
        text: 'text-status-expiring',
      }
    case 'expired':
      return { label: 'Inactive', bg: 'bg-status-expired-bg', text: 'text-status-expired' }
    default:
      return { label: 'Active', bg: 'bg-status-active-bg', text: 'text-status-active' }
  }
}

export function WarrantyCard({ warranty }: WarrantyCardProps) {
  const navigate = useNavigate()
  const isExpired = warranty.status === 'expired'
  const badge = getStatusBadge(warranty.status, warranty.days_remaining)

  const expiryLabel = isExpired
    ? 'Expiring on'
    : warranty.status === 'expiring_soon'
      ? 'Expiring on'
      : 'Expiring in'

  const expiryValue = isExpired
    ? format(new Date(warranty.expiry_date), "MMM d'' yyyy")
    : warranty.days_remaining === 0
      ? "Today"
      : warranty.status === 'expiring_soon'
        ? format(new Date(warranty.expiry_date), "MMM d'' yyyy")
        : `${warranty.days_remaining} days`

  return (
    <div
      onClick={() => navigate(`/myproducts/${warranty.id}`)}
      className={`bg-card-bg flex flex-col gap-[12px] p-[12px] rounded-[12px] w-[264px] shrink-0 cursor-pointer ${isExpired ? 'opacity-65' : ''}`}
    >
      {/* Image */}
      {(warranty.image_url || (warranty.gallery_urls && warranty.gallery_urls.length > 0)) ? (
        <img src={warranty.image_url || warranty.gallery_urls![0]} alt={warranty.product_name} className="h-[118px] rounded-[8px] w-full object-cover" />
      ) : (
        <div className="bg-placeholder h-[118px] rounded-[8px] w-full" />
      )}

      {/* Card details */}
      <div className="flex flex-col gap-[16px]">
        {/* Brand & Product name */}
        <div className="flex flex-col gap-[2px]">
          <p className="font-medium text-[12px] text-text-brand tracking-[-0.24px] truncate">
            {warranty.brand || warranty.category}
          </p>
          <p className="font-medium text-[16px] text-text-body tracking-[-0.32px] truncate">
            {warranty.product_name}
          </p>
        </div>

        {/* Expiry & Status */}
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-col gap-[2px] font-medium text-[12px] tracking-[-0.24px]">
            <p className="text-text-brand truncate">{expiryLabel}</p>
            <p className={getExpiryTextColor(warranty.status)}>{expiryValue}</p>
          </div>
          <span className={`px-[6px] py-[2px] rounded-[12px] text-[12px] font-medium tracking-[-0.24px] whitespace-nowrap ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
      </div>
    </div>
  )
}
