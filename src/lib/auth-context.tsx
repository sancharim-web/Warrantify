import { createContext, useContext, useState, useCallback } from 'react'

export interface DemoUser {
  id: string
  name: string
  email: string
  type: 'existing' | 'new'
}

const DEMO_USERS: Record<string, DemoUser> = {
  existing: {
    id: 'demo-user',
    name: 'Sasha',
    email: 'sasha@email.com',
    type: 'existing',
  },
  new: {
    id: 'new-user',
    name: '',
    email: '',
    type: 'new',
  },
}

interface AuthContextValue {
  user: DemoUser | null
  signInExisting: () => void
  signUpNew: (name: string, email: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  signInExisting: () => {},
  signUpNew: () => {},
  signOut: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null)

  const signInExisting = useCallback(() => {
    setUser(DEMO_USERS.existing)
  }, [])

  const signUpNew = useCallback((name: string, email: string) => {
    setUser({
      ...DEMO_USERS.new,
      name: name || 'User',
      email,
    })
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, signInExisting, signUpNew, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
