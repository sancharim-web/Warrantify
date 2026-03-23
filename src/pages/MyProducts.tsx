import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchWarranties } from '@/lib/data-provider'
import { enrichWarranty, CATEGORIES } from '@/lib/warranty-utils'
import { WarrantyCard } from '@/components/WarrantyCard'
import filterIcon from '@/assets/icons/filter.svg'

export function MyProducts() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: warranties = [], isLoading } = useQuery({
    queryKey: ['warranties'],
    queryFn: fetchWarranties,
  })

  const enriched = warranties.map(enrichWarranty)

  const filtered = selectedCategory
    ? enriched.filter((w) => w.category === selectedCategory)
    : enriched

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Title section */}
      <div className="flex items-center justify-between">
        <p className="font-medium text-[24px] text-black tracking-[-0.48px] py-[10px]">
          My Products
        </p>
        <div className="rounded-full w-[32px] h-[32px] flex items-center justify-center">
          <img src={filterIcon} alt="" className="w-[20px] h-[20px]" />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-[8px] flex-wrap">
        <FilterChip active={!selectedCategory} onClick={() => setSelectedCategory(null)}>All</FilterChip>
        {CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          >
            {cat}
          </FilterChip>
        ))}
      </div>

      {/* Product grid */}
      <div className="bg-inner rounded-[22px] py-[24px]">
        {isLoading ? (
          <div className="flex gap-[16px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[264px] h-[240px] bg-panel rounded-[12px] animate-pulse shrink-0" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-text-muted text-[15px] font-medium tracking-[-0.3px] py-12 text-center">
            {selectedCategory ? 'No products match your filters' : 'No products added yet'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-[16px]">
            {filtered.map((w) => (
              <WarrantyCard key={w.id} warranty={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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
