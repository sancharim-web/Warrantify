import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja'

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Espanol',
  fr: 'Francais',
  de: 'Deutsch',
  ja: 'Japanese',
}

export function Settings() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState<Language>('en')
  const [defaultReminders, setDefaultReminders] = useState({
    thirtyDay: true,
    sevenDay: true,
    oneDay: false,
    expiryDay: true,
  })
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [autoDelete, setAutoDelete] = useState(30)
  const [currency, setCurrency] = useState('INR')
  const [dateFormat, setDateFormat] = useState('MMM d, yyyy')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-[32px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-medium text-[24px] text-text-primary tracking-[-0.48px]">Settings</p>
        <button
          onClick={handleSave}
          className={`px-[20px] py-[10px] rounded-[10px] text-[14px] font-medium tracking-[-0.28px] transition-all ${
            saved
              ? 'bg-status-active text-white'
              : 'bg-btn-primary text-white hover:opacity-90'
          }`}
        >
          {saved ? (
            <span className="flex items-center gap-[6px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7L5.5 9.5L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved
            </span>
          ) : 'Save changes'}
        </button>
      </div>

      {/* General */}
      <SettingsSection title="General" description="Basic application preferences">
        <SettingsRow label="Theme" description="Choose your preferred appearance">
          <div className="flex gap-[8px]">
            {(['light', 'dark', 'system'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-[14px] py-[8px] rounded-[8px] text-[13px] font-medium tracking-[-0.26px] capitalize transition-colors ${
                  theme === t
                    ? 'bg-btn-primary text-white'
                    : 'bg-inner text-text-secondary hover:bg-inner'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </SettingsRow>

        <SettingsRow label="Language" description="Select your preferred language">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-inner rounded-[8px] px-[12px] py-[8px] text-[14px] font-medium tracking-[-0.28px] text-text-body outline-none border border-transparent focus:border-btn-primary/30 transition-colors cursor-pointer"
          >
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
              <option key={l} value={l}>{LANGUAGE_LABELS[l]}</option>
            ))}
          </select>
        </SettingsRow>

        <SettingsRow label="Date format" description="How dates are displayed throughout the app">
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="bg-inner rounded-[8px] px-[12px] py-[8px] text-[14px] font-medium tracking-[-0.28px] text-text-body outline-none border border-transparent focus:border-btn-primary/30 transition-colors cursor-pointer"
          >
            <option value="MMM d, yyyy">Mar 23, 2026</option>
            <option value="dd/MM/yyyy">23/03/2026</option>
            <option value="MM/dd/yyyy">03/23/2026</option>
            <option value="yyyy-MM-dd">2026-03-23</option>
          </select>
        </SettingsRow>

        <SettingsRow label="Currency" description="Default currency for product values">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-inner rounded-[8px] px-[12px] py-[8px] text-[14px] font-medium tracking-[-0.28px] text-text-body outline-none border border-transparent focus:border-btn-primary/30 transition-colors cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (&#8364;)</option>
            <option value="GBP">GBP (&#163;)</option>
            <option value="INR">INR (&#8377;)</option>
            <option value="JPY">JPY (&#165;)</option>
          </select>
        </SettingsRow>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" description="Configure how and when you receive alerts">
        <SettingsRow label="Email notifications" description="Receive warranty reminders via email">
          <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
        </SettingsRow>

        <SettingsRow label="Push notifications" description="Browser push notifications for reminders">
          <Toggle checked={pushNotifications} onChange={setPushNotifications} />
        </SettingsRow>

        <SettingsRow label="Weekly digest" description="Receive a weekly summary of upcoming expiries">
          <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
        </SettingsRow>
      </SettingsSection>

      {/* Default Reminders */}
      <SettingsSection title="Default Reminders" description="Automatically set these reminders for new products">
        <SettingsRow label="30 days before" description="Email reminder 30 days before expiry">
          <Toggle checked={defaultReminders.thirtyDay} onChange={(v) => setDefaultReminders((p) => ({ ...p, thirtyDay: v }))} />
        </SettingsRow>
        <SettingsRow label="7 days before" description="Email reminder 7 days before expiry">
          <Toggle checked={defaultReminders.sevenDay} onChange={(v) => setDefaultReminders((p) => ({ ...p, sevenDay: v }))} />
        </SettingsRow>
        <SettingsRow label="1 day before" description="Email reminder 1 day before expiry">
          <Toggle checked={defaultReminders.oneDay} onChange={(v) => setDefaultReminders((p) => ({ ...p, oneDay: v }))} />
        </SettingsRow>
        <SettingsRow label="On expiry day" description="Alert on the day the warranty expires">
          <Toggle checked={defaultReminders.expiryDay} onChange={(v) => setDefaultReminders((p) => ({ ...p, expiryDay: v }))} />
        </SettingsRow>
      </SettingsSection>

      {/* Data & Storage */}
      <SettingsSection title="Data & Storage" description="Manage your data and storage settings">
        <SettingsRow label="Auto-delete trashed items" description="Permanently delete items in Shredder after">
          <select
            value={autoDelete}
            onChange={(e) => setAutoDelete(Number(e.target.value))}
            className="bg-inner rounded-[8px] px-[12px] py-[8px] text-[14px] font-medium tracking-[-0.28px] text-text-body outline-none border border-transparent focus:border-btn-primary/30 transition-colors cursor-pointer"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={0}>Never</option>
          </select>
        </SettingsRow>

        <SettingsRow label="Export data" description="Download all your warranties as a CSV file">
          <button className="px-[14px] py-[8px] rounded-[8px] bg-inner text-[13px] font-medium tracking-[-0.26px] text-text-secondary hover:bg-inner transition-colors">
            Export CSV
          </button>
        </SettingsRow>

        <SettingsRow label="Import data" description="Import warranties from a CSV or JSON file">
          <button className="px-[14px] py-[8px] rounded-[8px] bg-inner text-[13px] font-medium tracking-[-0.26px] text-text-secondary hover:bg-inner transition-colors">
            Import
          </button>
        </SettingsRow>
      </SettingsSection>

      {/* Account */}
      <SettingsSection title="Account" description="Manage your account settings">
        <SettingsRow label="Email address" description="Your registered email for reminders and login">
          <p className="font-medium text-[14px] text-text-body tracking-[-0.28px]">{user?.email || 'user@email.com'}</p>
        </SettingsRow>

        <SettingsRow label="Change password" description="Update your account password">
          <button className="px-[14px] py-[8px] rounded-[8px] bg-inner text-[13px] font-medium tracking-[-0.26px] text-text-secondary hover:bg-inner transition-colors">
            Change
          </button>
        </SettingsRow>

        <SettingsRow label="Two-factor authentication" description="Add an extra layer of security to your account">
          <button className="px-[14px] py-[8px] rounded-[8px] bg-inner text-[13px] font-medium tracking-[-0.26px] text-text-secondary hover:bg-inner transition-colors">
            Enable
          </button>
        </SettingsRow>
      </SettingsSection>

      {/* Danger zone */}
      <div className="bg-panel rounded-[12px] p-[24px] flex flex-col gap-[16px] border border-status-expiring-bg">
        <div className="flex flex-col gap-[4px]">
          <p className="font-medium text-[18px] text-status-expiring tracking-[-0.36px]">Danger Zone</p>
          <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Irreversible actions that affect your account</p>
        </div>
        <div className="flex gap-[12px]">
          <button className="px-[14px] py-[8px] rounded-[8px] border border-status-expiring text-[13px] font-medium tracking-[-0.26px] text-status-expiring hover:bg-status-expiring/5 transition-colors">
            Delete all warranties
          </button>
          <button className="px-[14px] py-[8px] rounded-[8px] bg-status-expiring text-[13px] font-medium tracking-[-0.26px] text-white hover:opacity-90 transition-opacity">
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Shared components ──────────────────────────────────── */

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-panel rounded-[12px] p-[24px] flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[4px]">
        <p className="font-medium text-[18px] text-text-primary tracking-[-0.36px]">{title}</p>
        <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">{description}</p>
      </div>
      <div className="flex flex-col gap-[0px] divide-y divide-inner-border">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-[14px] gap-[24px]">
      <div className="flex flex-col gap-[2px] min-w-0">
        <p className="font-medium text-[15px] text-text-body tracking-[-0.3px]">{label}</p>
        <p className="font-medium text-[12px] text-text-muted tracking-[-0.24px]">{description}</p>
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-[44px] h-[24px] rounded-full transition-colors relative ${
        checked ? 'bg-btn-primary' : 'bg-[#d4d2de]'
      }`}
    >
      <div
        className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}
