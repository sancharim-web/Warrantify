import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { fetchWarranties, fetchReminders } from '@/lib/data-provider'
import { enrichWarranty } from '@/lib/warranty-utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export function Profile() {
  const { user, avatarUrl, setAvatarUrl } = useAuth()
  const [name, setName] = useState(user?.name || 'User')
  const [email, setEmail] = useState(user?.email || 'user@email.com')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const displayAvatar = pendingAvatar || avatarUrl

  const { data: warranties = [] } = useQuery({ queryKey: ['warranties'], queryFn: fetchWarranties })
  const { data: reminders = [] } = useQuery({ queryKey: ['reminders'], queryFn: fetchReminders })
  const enriched = warranties.map(enrichWarranty)
  const totalProducts = enriched.length
  const activeWarranties = enriched.filter((w) => w.status === 'active').length
  const expiringSoon = enriched.filter((w) => w.status === 'expiring_soon').length
  const remindersSent = reminders.length

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    const reader = new FileReader()
    reader.onload = () => setPendingAvatar(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleSaveAvatar() {
    if (!pendingAvatar) return
    setSavingAvatar(true)
    try {
      let savedUrl = pendingAvatar
      if (isSupabaseConfigured && supabase && pendingFile && user) {
        // Upload to Supabase Storage
        const ext = pendingFile.name.split('.').pop() || 'jpg'
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('warranty-docs')
          .upload(path, pendingFile, { upsert: true })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('warranty-docs')
          .getPublicUrl(path)
        savedUrl = urlData.publicUrl

        // Save URL in user_metadata so it loads on refresh
        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: savedUrl },
        })
        if (updateError) throw updateError
      }
      setAvatarUrl(savedUrl)
      setPendingAvatar(null)
      setPendingFile(null)
    } catch (err) {
      console.error('Failed to save avatar:', err)
    } finally {
      setSavingAvatar(false)
    }
  }

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Header */}
      <div className="flex-1 py-[10px]">
        <p className="font-medium text-[24px] text-text-primary tracking-[-0.48px]">Profile</p>
      </div>

      {/* Avatar & Name card */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[32px]">
        <div className="flex items-center gap-[24px]">
          {/* Avatar */}
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group shrink-0"
          >
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-btn-primary flex items-center justify-center">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[32px] font-medium text-white">{name[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 7V13M7 10H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </button>

          <div className="flex flex-col gap-[4px] flex-1 min-w-0">
            <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">{name}</p>
            <p className="font-medium text-[15px] text-text-muted tracking-[-0.3px]">{email}</p>
          </div>

          <div className="flex items-center gap-[8px] shrink-0">
            <button
              onClick={() => fileRef.current?.click()}
              className="px-[16px] py-[8px] rounded-[12px] bg-inner text-[13px] font-medium text-text-body tracking-[-0.26px] hover:opacity-80 transition-opacity"
            >
              Change photo
            </button>
            {pendingAvatar && (
              <button
                onClick={handleSaveAvatar}
                disabled={savingAvatar}
                className="flex items-center gap-[6px] px-[16px] py-[8px] rounded-[12px] bg-btn-primary text-white hover:opacity-90 transition-opacity"
              >
                {savingAvatar ? (
                  <div className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span className="font-medium text-[13px] tracking-[-0.26px]">
                  {savingAvatar ? 'Saving...' : 'Save'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[24px]">
        <div className="flex flex-col gap-[24px]">
          <div className="flex items-center justify-between">
            <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Personal Information</p>
          </div>

          <div className="flex flex-col">
            <EditableRow
              label="Full Name"
              value={name}
              editing={editing === 'name'}
              onEdit={() => setEditing('name')}
              onChange={setName}
              onSave={() => setEditing(null)}
            />
            <EditableRow
              label="Email Address"
              value={email}
              editing={editing === 'email'}
              onEdit={() => setEditing('email')}
              onChange={setEmail}
              onSave={() => setEditing(null)}
            />
            {(phone || editing === 'phone') && (
              <EditableRow
                label="Phone Number"
                value={phone}
                editing={editing === 'phone'}
                onEdit={() => setEditing('phone')}
                onChange={setPhone}
                onSave={() => setEditing(null)}
              />
            )}
            {(location || editing === 'location') && (
              <EditableRow
                label="Location"
                value={location}
                editing={editing === 'location'}
                onEdit={() => setEditing('location')}
                onChange={setLocation}
                onSave={() => setEditing(null)}
              />
            )}
            {!phone && !location && editing !== 'phone' && editing !== 'location' && (
              <div className="flex gap-[10px] pt-[8px]">
                <button
                  onClick={() => setEditing('phone')}
                  className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary/10 hover:bg-btn-primary/15 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3V11M3 7H11" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">Add phone</span>
                </button>
                <button
                  onClick={() => setEditing('location')}
                  className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary/10 hover:bg-btn-primary/15 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3V11M3 7H11" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">Add location</span>
                </button>
              </div>
            )}
            {phone && !location && editing !== 'location' && (
              <div className="pt-[8px]">
                <button
                  onClick={() => setEditing('location')}
                  className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary/10 hover:bg-btn-primary/15 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3V11M3 7H11" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">Add location</span>
                </button>
              </div>
            )}
            {!phone && location && editing !== 'phone' && (
              <div className="pt-[8px]">
                <button
                  onClick={() => setEditing('phone')}
                  className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] bg-btn-primary/10 hover:bg-btn-primary/15 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 3V11M3 7H11" stroke="#7d7086" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="font-medium text-[13px] text-btn-primary tracking-[-0.26px]">Add phone</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[24px]">
        <div className="flex flex-col gap-[24px]">
          <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Account Overview</p>
          <div className="flex gap-[16px]">
            <StatCard label="Products tracked" value={String(totalProducts)} />
            <StatCard label="Active warranties" value={String(activeWarranties)} />
            <StatCard label="Expiring soon" value={String(expiringSoon)} />
            <StatCard label="Reminders sent" value={String(remindersSent)} />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[24px]">
        <div className="flex flex-col gap-[24px]">
          <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Security</p>
          <div className="flex flex-col">
            <ActionRow
              label="Password"
              description="Last changed 30 days ago"
              actionLabel="Change password"
            />
            <ActionRow
              label="Two-factor authentication"
              description="Add an extra layer of security to your account"
              actionLabel="Enable"
            />
            <ActionRow
              label="Active sessions"
              description="1 active session on this device"
              actionLabel="Manage"
            />
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-panel rounded-[8px] px-[40px] py-[24px]">
        <div className="flex flex-col gap-[24px]">
          <p className="font-medium text-[20px] text-text-primary tracking-[-0.4px]">Danger Zone</p>
          <div className="flex flex-col">
            <div className="flex items-center justify-between py-[16px] border-b border-inner-border last:border-b-0">
              <div className="flex flex-col gap-[4px]">
                <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">Export data</p>
                <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Download all your warranty data as a CSV</p>
              </div>
              <button className="px-[16px] py-[8px] rounded-[12px] bg-inner text-[13px] font-medium text-text-body tracking-[-0.26px] hover:opacity-80 transition-opacity">
                Export
              </button>
            </div>
            <div className="flex items-center justify-between py-[16px]">
              <div className="flex flex-col gap-[4px]">
                <p className="font-medium text-[15px] text-status-expiring tracking-[-0.3px]">Delete account</p>
                <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Permanently delete your account and all data</p>
              </div>
              <button className="px-[16px] py-[8px] rounded-[12px] bg-status-expiring-bg text-[13px] font-medium text-status-expiring tracking-[-0.26px] hover:opacity-80 transition-opacity">
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditableRow({ label, value, editing, onEdit, onChange, onSave }: {
  label: string
  value: string
  editing: boolean
  onEdit: () => void
  onChange: (v: string) => void
  onSave: () => void
}) {
  return (
    <div className="flex items-center justify-between py-[16px] border-b border-inner-border last:border-b-0">
      <div className="flex flex-col gap-[4px] flex-1 min-w-0">
        <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">{label}</p>
        {editing ? (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') onSave() }}
            className="font-medium text-[15px] text-text-body tracking-[-0.3px] bg-inner rounded-[8px] px-[10px] py-[6px] outline-none w-full max-w-[400px]"
          />
        ) : (
          <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px] truncate">{value}</p>
        )}
      </div>
      {editing ? (
        <button
          onClick={onSave}
          className="px-[16px] py-[8px] rounded-[12px] bg-btn-primary text-[13px] font-medium text-white tracking-[-0.26px] hover:opacity-90 transition-opacity shrink-0"
        >
          Save
        </button>
      ) : (
        <button
          onClick={onEdit}
          className="px-[16px] py-[8px] rounded-[12px] bg-inner text-[13px] font-medium text-text-body tracking-[-0.26px] hover:opacity-80 transition-opacity shrink-0"
        >
          Edit
        </button>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-inner rounded-[12px] p-[20px] flex flex-col gap-[8px]">
      <p className="font-medium text-[28px] text-text-primary tracking-[-0.56px]">{value}</p>
      <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">{label}</p>
    </div>
  )
}

function ActionRow({ label, description, actionLabel }: { label: string; description: string; actionLabel: string }) {
  return (
    <div className="flex items-center justify-between py-[16px] border-b border-inner-border last:border-b-0">
      <div className="flex flex-col gap-[4px]">
        <p className="font-medium text-[15px] text-text-secondary tracking-[-0.3px]">{label}</p>
        <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">{description}</p>
      </div>
      <button className="px-[16px] py-[8px] rounded-[12px] bg-inner text-[13px] font-medium text-text-body tracking-[-0.26px] hover:opacity-80 transition-opacity shrink-0">
        {actionLabel}
      </button>
    </div>
  )
}
