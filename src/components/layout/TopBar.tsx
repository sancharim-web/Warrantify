import { Plus } from 'lucide-react'

interface TopBarProps {
  onNewProduct: () => void
}

export function TopBar({ onNewProduct }: TopBarProps) {
  return (
    <header className="flex items-center justify-between w-full">
      <p className="font-brand font-medium text-[32px] tracking-[-0.64px] text-text-primary">
        Warrantify
      </p>
      <div className="flex items-center gap-[24px]">
        <button
          onClick={onNewProduct}
          className="flex items-center gap-[8px] bg-btn-primary text-white font-medium text-[16px] tracking-[-0.32px] pl-[12px] pr-[16px] py-[12px] rounded-[12px] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          New product
        </button>
        <div className="w-[48px] h-[48px] rounded-[28px] bg-panel flex items-center justify-center">
          <div className="w-[42px] h-[42px] rounded-full bg-btn-primary text-white flex items-center justify-center text-sm font-medium">
            D
          </div>
        </div>
      </div>
    </header>
  )
}
