import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AppUser {
  id: string
  name: string
  email: string
}

const DEFAULT_REMINDER_DEFAULTS = ['30_day', '7_day', 'expiry']

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
  reminderDefaults: string[]
  updateReminderDefaults: (defaults: string[]) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  avatarUrl: null,
  setAvatarUrl: () => {},
  reminderDefaults: DEFAULT_REMINDER_DEFAULTS,
  updateReminderDefaults: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

function mapSupabaseUser(user: User): AppUser {
  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [reminderDefaults, setReminderDefaults] = useState<string[]>(DEFAULT_REMINDER_DEFAULTS)

  // Listen for Supabase auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null)
      if (session?.user?.user_metadata?.avatar_url) {
        setAvatarUrl(session.user.user_metadata.avatar_url)
      }
      if (session?.user?.user_metadata?.reminder_defaults) {
        setReminderDefaults(session.user.user_metadata.reminder_defaults)
      }
      setLoading(false)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? mapSupabaseUser(session.user) : null)
        setAvatarUrl(session?.user?.user_metadata?.avatar_url || null)
        if (session?.user?.user_metadata?.reminder_defaults) {
          setReminderDefaults(session.user.user_metadata.reminder_defaults)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured')
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured')
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(null)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const updateReminderDefaults = useCallback(async (defaults: string[]) => {
    setReminderDefaults(defaults)
    if (!isSupabaseConfigured || !supabase) return
    const { error } = await supabase.auth.updateUser({
      data: { reminder_defaults: defaults },
    })
    if (error) throw error
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, avatarUrl, setAvatarUrl, reminderDefaults, updateReminderDefaults, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
