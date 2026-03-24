import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import filterIcon from '@/assets/icons/filter.svg'

const SCHEDULE_OPTIONS = [
  { id: '30_days', label: '30 days before' },
  { id: '7_days', label: '7 days before' },
  { id: '1_day', label: '1 days before' },
  { id: 'expiry', label: 'On expiry day' },
] as const

export function Notifications() {
  const { user } = useAuth()
  const initialEmail = user?.email ?? 'user@email.com'
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [dndEnabled, setDndEnabled] = useState(false)
  const [activeSchedule, setActiveSchedule] = useState<Set<string>>(
    new Set(['30_days', '7_days', 'expiry'])
  )
  const [fromTime, setFromTime] = useState('10:00')
  const [toTime, setToTime] = useState('08:00')
  const [email, setEmail] = useState(initialEmail)
  const [savedEmail, setSavedEmail] = useState(initialEmail)
  const [savingEmail, setSavingEmail] = useState(false)

  const emailChanged = email.trim() !== savedEmail

  async function handleSaveEmail() {
    setSavingEmail(true)
    // TODO: persist to user profile / Supabase when backend supports it
    await new Promise((r) => setTimeout(r, 400))
    setSavedEmail(email.trim())
    setSavingEmail(false)
  }

  function toggleSchedule(id: string) {
    setActiveSchedule((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1 py-[10px]">
          <p className="font-medium text-[24px] text-black tracking-[-0.48px]">Notifications</p>
        </div>
        <div className="rounded-full w-[32px] h-[32px] flex items-center justify-center">
          <img src={filterIcon} alt="" className="w-[20px] h-[20px]" />
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[24px]">
        <div className="flex flex-col gap-[24px]">
          <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Notification Channels</p>
          <div className="flex flex-col gap-[8px]">
            <ChannelRow
              title="Email Reminders"
              description="Receive warranty alerts at user@gmail.com"
              enabled={emailEnabled}
              onToggle={() => setEmailEnabled(!emailEnabled)}
            />
            <ChannelRow
              title="Push Notifications"
              description="Get alerts on you primary device"
              enabled={pushEnabled}
              onToggle={() => setPushEnabled(!pushEnabled)}
            />
          </div>
        </div>
      </div>

      {/* Reminder Schedule */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[24px]">
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[8px]">
            <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Reminder Schedule</p>
            <p className="font-medium text-[15px] text-text-muted tracking-[-0.3px]">
              Receive warranty alerts at user@gmail.com
            </p>
          </div>
          <div className="flex gap-[24px] flex-wrap">
            {SCHEDULE_OPTIONS.map((opt) => {
              const isActive = activeSchedule.has(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSchedule(opt.id)}
                  className={`flex gap-[7.5px] items-center justify-center px-[12px] py-[7.5px] rounded-[8px] text-[16px] font-medium tracking-[-0.32px] transition-colors ${
                    isActive
                      ? 'bg-chip-active text-white'
                      : 'bg-white text-text-chip'
                  }`}
                >
                  {isActive && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[24px]">
        <div className="flex flex-col gap-[24px]">
          <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Quiet Hours</p>
          <div className="flex flex-col gap-[8px]">
            {/* DND toggle */}
            <div className="flex items-start py-[12px]">
              <div className="flex-1 flex flex-col gap-[8px]">
                <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">Do not disturb</p>
                <p className="font-medium text-[15px] text-text-muted tracking-[-0.3px]">
                  Pause all notifications during specific hours
                </p>
              </div>
              <Toggle enabled={dndEnabled} onToggle={() => setDndEnabled(!dndEnabled)} />
            </div>

            {/* Time pickers */}
            <div className="flex gap-[16px] py-[12px]">
              <div className="flex-1 flex flex-col gap-[8px]">
                <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">From</p>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="bg-inner rounded-[8px] h-[35px] px-[12px] py-[7.5px] text-[16px] font-medium tracking-[-0.32px] text-black outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col gap-[8px]">
                <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">To</p>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="bg-inner rounded-[8px] h-[35px] px-[12px] py-[7.5px] text-[16px] font-medium tracking-[-0.32px] text-black outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Reference */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[24px]">
        <div className="flex flex-col gap-[16px]">
          <p className="font-medium text-[20px] text-black tracking-[-0.4px]">Email Reference</p>
          <div className="flex flex-col gap-[8px]">
            <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">Notification Email</p>
            <div className="flex gap-[10px] items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-inner rounded-[8px] h-[35px] px-[12px] py-[7.5px] text-[16px] font-medium tracking-[-0.32px] text-black outline-none"
              />
              {emailChanged && (
                <button
                  onClick={handleSaveEmail}
                  disabled={savingEmail || !email.trim()}
                  className="flex items-center gap-[6px] px-[16px] h-[35px] rounded-[8px] bg-btn-primary text-white hover:opacity-90 transition-opacity shrink-0"
                >
                  {savingEmail ? (
                    <div className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <span className="font-medium text-[13px] tracking-[-0.26px]">
                    {savingEmail ? 'Saving...' : 'Save'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChannelRow({ title, description, enabled, onToggle }: {
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-start py-[12px]">
      <div className="flex-1 flex flex-col gap-[8px]">
        <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">{title}</p>
        <p className="font-medium text-[15px] text-text-muted tracking-[-0.3px]">{description}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  )
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-[39px] h-[20px] rounded-full transition-colors ${
        enabled ? 'bg-[#9a917d]' : 'bg-[#d5d3db]'
      }`}
    >
      <div
        className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white transition-transform ${
          enabled ? 'left-[21px]' : 'left-[2px]'
        }`}
      />
    </button>
  )
}
