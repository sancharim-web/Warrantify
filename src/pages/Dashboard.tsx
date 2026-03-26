import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { fetchWarranties } from '@/lib/data-provider'
import { enrichWarranty, CATEGORIES } from '@/lib/warranty-utils'
import { WarrantyCard } from '@/components/WarrantyCard'
import { useAuth } from '@/lib/auth-context'
import type { WarrantyWithStatus } from '@/types'
import addCircleIcon from '@/assets/icons/add-circle.svg'
import filterIcon from '@/assets/icons/filter.svg'

type SortOption = 'expiry_asc' | 'expiry_desc' | 'name_asc' | 'name_desc' | 'recent'

const SORT_LABELS: Record<SortOption, string> = {
  expiry_asc: 'Expiry (soonest first)',
  expiry_desc: 'Expiry (latest first)',
  name_asc: 'Name (A-Z)',
  name_desc: 'Name (Z-A)',
  recent: 'Recently added',
}

export function Dashboard() {
  const { onNewProduct, onNewProductWithName } = useOutletContext<{ onNewProduct: () => void; onNewProductWithName: (name: string) => void; onOpenAttachment: () => void }>()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('expiry_asc')
  const [filterOpen, setFilterOpen] = useState(false)
  const [heroInput, setHeroInput] = useState('')
  const filterRef = useRef<HTMLDivElement>(null)

  const { data: warranties = [], isLoading } = useQuery({
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

  const enriched = warranties.map(enrichWarranty)

  const filtered = selectedCategory
    ? enriched.filter((w) => w.category === selectedCategory)
    : enriched

  function sortWarranties(items: WarrantyWithStatus[]): WarrantyWithStatus[] {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'expiry_asc':
          return a.days_remaining - b.days_remaining
        case 'expiry_desc':
          return b.days_remaining - a.days_remaining
        case 'name_asc':
          return a.product_name.localeCompare(b.product_name)
        case 'name_desc':
          return b.product_name.localeCompare(a.product_name)
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }

  const active = sortWarranties(
    filtered.filter((w) => w.status === 'active' || w.status === 'expiring_soon')
  )
  const expired = sortWarranties(
    filtered.filter((w) => w.status === 'expired')
  )

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-[40px]">
      {/* Hero — greeting + search bar */}
      <div className="flex flex-col gap-[32px] items-center">
        <p className="font-brand font-medium text-[32px] text-text-primary text-center tracking-[-0.64px] w-full">
          Hello {user?.name || 'there'}!
        </p>
        <form
          className="bg-panel flex items-center justify-between px-[16px] py-[12px] rounded-[12px] w-full"
          onSubmit={(e) => {
            e.preventDefault()
            const name = heroInput.trim()
            if (name) {
              onNewProductWithName(name)
              setHeroInput('')
            } else {
              onNewProduct()
            }
          }}
        >
          <input
            value={heroInput}
            onChange={(e) => setHeroInput(e.target.value)}
            placeholder="Add a new product..."
            className="font-medium text-[16px] text-text-body tracking-[-0.32px] placeholder:text-text-secondary bg-transparent outline-none flex-1 min-w-0"
          />
          <div className="flex gap-[8px] items-center shrink-0">
            <button type="submit" className="bg-btn-primary rounded-full w-[32px] h-[32px] flex items-center justify-center hover:opacity-90 transition-opacity">
              <img src={addCircleIcon} alt="" className="w-[20px] h-[20px] brightness-0 invert" />
            </button>
          </div>
        </form>
      </div>

      {/* Main Section */}
      {enriched.length === 0 ? (
        <EmptyDashboard onNewProduct={onNewProduct} />
      ) : (
        <div className="flex flex-col gap-[20px]">
          {/* Dashboard header */}
          <div className="flex items-center justify-between">
            <div className="flex-1 py-[10px]">
              <p className="font-medium text-[24px] text-text-primary tracking-[-0.48px]">
                Dashboard
              </p>
            </div>
            <div className="flex gap-[12px] items-center">
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
          </div>

          {/* Filter tabs */}
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

          {/* Product sections */}
          <div className="flex flex-col gap-[24px]">
            <WarrantySection title="Active Warranties" items={active} />
            {expired.length > 0 && (
              <WarrantySection title="Expired Warranties" items={expired} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
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

function WarrantySection({ title, items }: { title: string; items: WarrantyWithStatus[] }) {
  return (
    <div className="flex flex-col gap-[24px]">
      <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">{title}</p>
      {items.length === 0 ? (
        <p className="text-text-muted text-[15px] font-medium tracking-[-0.3px] py-8 text-center">
          No warranties in this section
        </p>
      ) : (
        <div className="flex flex-wrap gap-[16px] items-center">
          {items.map((w) => (
            <WarrantyCard key={w.id} warranty={w} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyDashboard({ onNewProduct }: { onNewProduct: () => void }) {
  return (
    <div className="flex flex-col items-center gap-[40px] py-[20px]">
      {/* Onboarding illustration */}
      <div className="relative w-full max-w-[480px]">
        {/* Decorative shapes */}
        <div className="absolute -top-[12px] left-[40px] w-[48px] h-[48px] rounded-[12px] bg-[#cde9d9] rotate-12 opacity-40" />
        <div className="absolute -top-[8px] right-[60px] w-[36px] h-[36px] rounded-full bg-[#ffd6d6] opacity-35" />
        <div className="absolute bottom-[20px] left-[20px] w-[28px] h-[28px] rounded-[8px] bg-sidebar-active/20 -rotate-6" />

        <div className="bg-panel rounded-[20px] shadow-[0_4px_30px_rgba(125,112,134,0.1)] p-[32px] flex flex-col items-center gap-[24px]">
          {/* Animated arrow pointing to search bar above */}
          <div className="flex flex-col items-center gap-[4px] animate-bounce" style={{ animationDuration: '2s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 12L12 5L19 12" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">Type a product name above</span>
          </div>

          {/* Step-by-step mini guide */}
          <div className="w-full flex flex-col gap-[16px]">
            {/* Step 1 */}
            <div className="flex items-center gap-[14px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-btn-primary/10 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4V16M4 10H16" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="font-medium text-[14px] text-text-body tracking-[-0.28px]">Add your first product</span>
                <span className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">Type a name and fill in warranty details</span>
              </div>
            </div>

            {/* Connector */}
            <div className="ml-[19px] w-[2px] h-[12px] bg-inner-border rounded-full" />

            {/* Step 2 */}
            <div className="flex items-center gap-[14px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#cde9d9]/40 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="5" width="14" height="10" rx="2" stroke="#7d7086" strokeWidth="1.3"/>
                  <path d="M3 7.5L10 12L17 7.5" stroke="#7d7086" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="font-medium text-[14px] text-text-body tracking-[-0.28px]">Get expiry reminders</span>
                <span className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">We'll email you before warranties expire</span>
              </div>
            </div>

            {/* Connector */}
            <div className="ml-[19px] w-[2px] h-[12px] bg-inner-border rounded-full" />

            {/* Step 3 */}
            <div className="flex items-center gap-[14px]">
              <div className="w-[40px] h-[40px] rounded-[10px] bg-[#ffd6d6]/40 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3L5 5.5V10C5 13.3 7.15 16.2 10 17C12.85 16.2 15 13.3 15 10V5.5L10 3Z" stroke="#7d7086" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M7.5 10L9 11.5L12.5 8" stroke="#7d7086" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="font-medium text-[14px] text-text-body tracking-[-0.28px]">Claim with confidence</span>
                <span className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">All your docs and details in one place</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onNewProduct}
            className="bg-btn-primary px-[24px] py-[12px] rounded-[12px] text-white text-[15px] font-medium tracking-[-0.3px] hover:opacity-90 transition-opacity flex items-center gap-[8px]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add your first product
          </button>
        </div>
      </div>

      {/* Dashboard section label */}
      <div className="w-full">
        <p className="font-medium text-[24px] text-text-primary tracking-[-0.48px]">Dashboard</p>
        <div className="mt-[20px] bg-inner rounded-[22px] py-[48px] flex flex-col items-center gap-[12px]">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="8" width="32" height="32" rx="8" stroke="#d4d2de" strokeWidth="1.5" strokeDasharray="4 3"/>
            <path d="M24 18V30M18 24H30" stroke="#d4d2de" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-text-muted text-[15px] font-medium tracking-[-0.3px]">
            No warranties yet
          </p>
          <p className="text-text-muted text-[13px] font-medium tracking-[-0.26px] max-w-[280px] text-center">
            Add your first product using the search bar above to start tracking warranties
          </p>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-[40px]">
      <div className="flex flex-col gap-[32px] items-center">
        <div className="h-10 w-48 bg-placeholder rounded-xl animate-pulse" />
        <div className="h-14 w-full bg-panel rounded-[12px] animate-pulse" />
      </div>
      <div className="flex flex-col gap-[24px]">
        {[1, 2].map((i) => (
          <div key={i} className="bg-inner rounded-[22px] py-[24px] flex flex-col gap-[24px]">
            <div className="h-7 w-40 bg-placeholder rounded-lg animate-pulse" />
            <div className="flex gap-[16px]">
              {[1, 2, 3].map((j) => (
                <div key={j} className="w-[264px] h-[240px] bg-panel rounded-[12px] animate-pulse shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
