import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { useQueryClient } from '@tanstack/react-query'
import newProductIcon from '@/assets/icons/new-product.svg'
import searchIcon from '@/assets/icons/search.svg'
import homeIcon from '@/assets/icons/home.svg'
import mailIcon from '@/assets/icons/mail.svg'
import notificationsIcon from '@/assets/icons/notifications.svg'
import settingsIcon from '@/assets/icons/settings.svg'
import shredderIcon from '@/assets/icons/shredder.svg'

interface SidebarProps {
  onNewProduct: () => void
}

const menuItems = [
  { to: '/dashboard', icon: homeIcon, label: 'Home' },
  { to: '/mailreminders', icon: mailIcon, label: 'Mail reminders' },
  { to: '/notifications', icon: notificationsIcon, label: 'Notifications' },
  { to: '/settings', icon: settingsIcon, label: 'Settings' },
  { to: '/shredder', icon: shredderIcon, label: 'Shredder' },
]

export function Sidebar({ onNewProduct }: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, avatarUrl, signOut } = useAuth()
  const queryClient = useQueryClient()

  const userName = user?.name || 'User'
  const userEmail = user?.email || 'user@email.com'
  const userInitial = userName[0]?.toLowerCase() || 'u'

  useEffect(() => {
    if (!profileOpen) return
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [profileOpen])

  return (
    <aside className="bg-panel flex flex-col p-[40px] self-stretch shrink-0">
      <div className="flex flex-col gap-[24px] w-[163px]">
        {/* Profile dropdown */}
        <div ref={profileRef} className="relative w-full">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-[9px] w-full rounded-[8px] hover:opacity-80 transition-opacity"
          >
            <div className="w-[28px] h-[28px] rounded-full bg-btn-primary overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[12px] font-medium text-white">{userInitial}</span>
              )}
            </div>
            <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px] flex-1 text-left">{userName}</p>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`}
            >
              <path d="M4 6L8 10L12 6" stroke="#9F8EAB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute top-[40px] left-0 w-[200px] bg-panel rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] py-[8px] z-50">
              <div className="px-[16px] py-[12px] border-b border-inner-border">
                <p className="font-medium text-[14px] text-text-body tracking-[-0.28px]">{userName}</p>
                <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">{userEmail}</p>
              </div>
              <div className="py-[4px]">
                <ProfileMenuItem icon="profile" label="Profile" onClick={() => { setProfileOpen(false); navigate('/profile') }} />
                <ProfileMenuItem icon="preferences" label="Preferences" onClick={() => { setProfileOpen(false); navigate('/notifications') }} />
                <ProfileMenuItem icon="help" label="Help & Support" />
              </div>
              <div className="border-t border-inner-border py-[4px]">
                <ProfileMenuItem icon="logout" label="Sign out" danger onClick={async () => { setProfileOpen(false); await signOut(); queryClient.invalidateQueries(); navigate('/') }} />
              </div>
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-[4px]">
          {/* New Product action */}
          <button
            onClick={onNewProduct}
            className="flex gap-[9px] items-center px-[8px] py-[4px] w-full text-left rounded-[8px] transition-colors hover:bg-sidebar-active/20 group"
          >
            <img src={newProductIcon} alt="" className="w-[20px] h-[20px]" />
            <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">New Product</p>
          </button>

          {/* Search link */}
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex gap-[9px] items-center px-[8px] py-[4px] w-full rounded-[8px] transition-colors ${
                isActive ? 'bg-sidebar-active' : 'hover:bg-sidebar-active/20'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <img src={searchIcon} alt="" className={`w-[20px] h-[20px] ${isActive ? 'brightness-0 invert' : ''}`} />
                <p className={`font-medium text-[15px] tracking-[-0.3px] ${isActive ? 'text-white' : 'text-text-secondary'}`}>Search</p>
              </>
            )}
          </NavLink>

          {/* Nav links */}
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex gap-[9px] items-center px-[8px] py-[4px] w-full rounded-[8px] transition-colors ${
                  isActive
                    ? 'bg-sidebar-active'
                    : 'hover:bg-sidebar-active/20'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img src={item.icon} alt="" className={`w-[20px] h-[20px] ${isActive ? 'brightness-0 invert' : ''}`} />
                  <p className={`font-medium text-[15px] tracking-[-0.3px] ${isActive ? 'text-white' : 'text-text-secondary'}`}>
                    {item.label}
                  </p>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

function ProfileMenuItem({ icon, label, danger, onClick }: { icon: string; label: string; danger?: boolean; onClick?: () => void }) {
  const iconSvg = {
    profile: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M3 13.5C3 11.2909 4.79086 9.5 7 9.5H9C11.2091 9.5 13 11.2909 13 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    preferences: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 2V4M8 12V14M2 8H4M12 8H14M3.75 3.75L5.17 5.17M10.83 10.83L12.25 12.25M12.25 3.75L10.83 5.17M5.17 10.83L3.75 12.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    help: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6 6.5C6 5.67 6.67 5 7.5 5H8.5C9.33 5 10 5.67 10 6.5C10 7.33 9.33 8 8.5 8H8V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="8" cy="11" r="0.6" fill="currentColor"/>
      </svg>
    ),
    logout: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M10 11L13 8L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  }[icon]

  return (
    <button
      onClick={onClick}
      className={`w-full flex gap-[10px] items-center px-[16px] py-[8px] text-left transition-colors hover:bg-inner ${
        danger ? 'text-status-expiring' : 'text-text-secondary'
      }`}
    >
      <span className="w-[16px] h-[16px]">{iconSvg}</span>
      <p className="font-medium text-[13px] tracking-[-0.26px]">{label}</p>
    </button>
  )
}
