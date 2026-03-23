import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-context'
import { setActiveDemoUser } from '@/lib/data-provider'

interface SignUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignUpModal({ open, onOpenChange }: SignUpModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { signUpNew } = useAuth()

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setActiveDemoUser('new')
      signUpNew(name.trim(), email.trim())
      queryClient.invalidateQueries()
      setLoading(false)
      onOpenChange(false)
      navigate('/dashboard')
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[8px]"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative bg-white rounded-[20px] w-[440px] p-[32px] shadow-[0px_4px_31.8px_0px_rgba(0,0,0,0.12)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-[28px]">
          {/* Header */}
          <div className="flex flex-col gap-[8px] items-center">
            <div className="flex items-center gap-[8px] mb-[4px]">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-btn-primary flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L11.5 6.5L16 7.5L12.5 11L13.5 16L9 13.5L4.5 16L5.5 11L2 7.5L6.5 6.5L9 2Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-brand font-medium text-[22px] text-black tracking-[-0.44px]">Warrantify</p>
            </div>
            <p className="font-medium text-[24px] text-black tracking-[-0.48px]">Create your account</p>
            <p className="font-medium text-[14px] text-text-muted tracking-[-0.28px]">Start tracking your warranties for free</p>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Full name</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-inner rounded-[10px] px-[14px] py-[12px] text-[15px] font-medium tracking-[-0.3px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-inner rounded-[10px] px-[14px] py-[12px] text-[15px] font-medium tracking-[-0.3px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <p className="font-medium text-[13px] text-text-muted tracking-[-0.26px]">Password</p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-inner rounded-[10px] px-[14px] py-[12px] pr-[44px] text-[15px] font-medium tracking-[-0.3px] text-text-body placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-btn-primary/30 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 9C2 9 4.5 4 9 4C13.5 4 16 9 16 9C16 9 13.5 14 9 14C4.5 14 2 9 2 9Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M2 9C2 9 4.5 4 9 4C13.5 4 16 9 16 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M3 15L15 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-medium text-[13px] text-status-expiring tracking-[-0.26px]">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-[12px]">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-btn-primary py-[12px] rounded-[12px] text-white text-[16px] font-medium tracking-[-0.32px] hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-[8px]">
                  <svg className="animate-spin w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round"/>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
            <p className="text-center font-medium text-[13px] text-text-muted tracking-[-0.26px]">
              By signing up, you agree to our{' '}
              <span className="text-btn-primary">Terms</span> and{' '}
              <span className="text-btn-primary">Privacy Policy</span>
            </p>
          </div>
        </form>

        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-[16px] right-[16px] w-[28px] h-[28px] rounded-[8px] flex items-center justify-center hover:bg-inner transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="#9c9ba1" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
