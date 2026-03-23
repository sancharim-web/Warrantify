import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchWarranties } from '@/lib/data-provider'
import { enrichWarranty, getStatusBadgeClasses, getExpiryTextColor, CATEGORIES } from '@/lib/warranty-utils'
import { format } from 'date-fns'
import type { WarrantyWithStatus } from '@/types'
import searchIcon from '@/assets/icons/search.svg'

export function Search() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: warranties = [], isLoading } = useQuery({
    queryKey: ['warranties'],
    queryFn: fetchWarranties,
  })

  const enriched = warranties.map(enrichWarranty)

  const filtered = enriched.filter((w) => {
    const q = query.toLowerCase()
    const matchesQuery =
      !q ||
      w.product_name.toLowerCase().includes(q) ||
      (w.brand && w.brand.toLowerCase().includes(q)) ||
      w.category.toLowerCase().includes(q) ||
      (w.serial_number && w.serial_number.toLowerCase().includes(q))
    const matchesCategory = !selectedCategory || w.category === selectedCategory
    return matchesQuery && matchesCategory
  })

  const grouped = {
    active: filtered.filter((w) => w.status === 'active' || w.status === 'expiring_soon'),
    expired: filtered.filter((w) => w.status === 'expired'),
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-[20px]">
        <div className="h-10 w-48 bg-inner rounded-[12px] animate-pulse" />
        <div className="h-[56px] bg-panel rounded-[12px] animate-pulse" />
        <div className="h-[400px] bg-inner rounded-[22px] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Header */}
      <div className="flex-1 py-[10px]">
        <p className="font-medium text-[24px] text-black tracking-[-0.48px]">Search</p>
      </div>

      {/* Search input */}
      <div className="bg-panel flex items-center gap-[12px] px-[16px] py-[14px] rounded-[12px]">
        <img src={searchIcon} alt="" className="w-[20px] h-[20px] opacity-50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product name, brand, category, or serial number..."
          autoFocus
          className="font-medium text-[16px] text-text-body tracking-[-0.32px] placeholder:text-text-muted bg-transparent outline-none flex-1 min-w-0"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-text-muted hover:text-text-body transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-[8px] items-start flex-wrap">
        <FilterTab active={!selectedCategory} onClick={() => setSelectedCategory(null)}>
          All
        </FilterTab>
        {CATEGORIES.map((cat) => (
          <FilterTab
            key={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          >
            {cat}
          </FilterTab>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-inner rounded-[22px] py-[60px] flex flex-col items-center gap-[12px]">
          <img src={searchIcon} alt="" className="w-[40px] h-[40px] opacity-20" />
          <p className="font-medium text-[16px] text-text-muted tracking-[-0.32px]">
            {query ? 'No results found' : 'Start typing to search'}
          </p>
          {query && (
            <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
              Try a different search term or category
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-[16px]">
          {/* Results count */}
          <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            {query && <> for "<span className="text-text-body">{query}</span>"</>}
          </p>

          {/* Active results */}
          {grouped.active.length > 0 && (
            <ResultSection title="Active Warranties" items={grouped.active} />
          )}

          {/* Expired results */}
          {grouped.expired.length > 0 && (
            <ResultSection title="Expired Warranties" items={grouped.expired} />
          )}
        </div>
      )}
    </div>
  )
}

function ResultSection({ title, items }: { title: string; items: WarrantyWithStatus[] }) {
  return (
    <div className="bg-inner rounded-[22px] py-[24px] flex flex-col gap-[16px]">
      <p className="font-medium text-[20px] text-black tracking-[-0.4px]">{title}</p>
      <div className="flex flex-col">
        {items.map((w) => (
          <SearchResultRow key={w.id} warranty={w} />
        ))}
      </div>
    </div>
  )
}

function SearchResultRow({ warranty }: { warranty: WarrantyWithStatus }) {
  const expiryLabel = warranty.status === 'expired' ? 'Expired on' : 'Expiring on'
  const badgeLabel = warranty.days_remaining === 0 ? 'Today'
    : warranty.status === 'active' ? 'Active'
    : warranty.status === 'expired' ? 'Inactive' : 'Today'

  return (
    <Link
      to={`/myproducts/${warranty.id}`}
      className="flex items-center gap-[20px] px-[20px] py-[16px] rounded-[12px] hover:bg-panel transition-colors"
    >
      {/* Product info */}
      <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
        <p className="font-medium text-[12px] text-text-brand tracking-[-0.24px] truncate">
          {warranty.brand || warranty.category}
        </p>
        <p className="font-medium text-[16px] text-text-body tracking-[-0.32px] truncate">
          {warranty.product_name}
        </p>
      </div>

      {/* Category */}
      <div className="w-[120px] shrink-0">
        <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px] truncate">
          {warranty.category}
        </p>
      </div>

      {/* Expiry */}
      <div className="w-[140px] shrink-0 flex flex-col gap-[2px]">
        <p className="font-medium text-[12px] text-text-brand tracking-[-0.24px]">{expiryLabel}</p>
        <p className={`font-medium text-[13px] tracking-[-0.26px] ${getExpiryTextColor(warranty.status)}`}>
          {format(new Date(warranty.expiry_date), "MMM dd'' yyyy")}
        </p>
      </div>

      {/* Status badge */}
      <span className={`px-[6px] py-[2px] rounded-[12px] text-[12px] font-medium tracking-[-0.24px] whitespace-nowrap ${getStatusBadgeClasses(warranty.status)}`}>
        {badgeLabel}
      </span>
    </Link>
  )
}

function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-[12px] py-[7.5px] rounded-[8px] text-[13px] font-medium tracking-[-0.26px] transition-colors ${
        active
          ? 'bg-chip-active text-white'
          : 'bg-chip-inactive text-text-chip hover:opacity-80'
      }`}
    >
      {children}
    </button>
  )
}
