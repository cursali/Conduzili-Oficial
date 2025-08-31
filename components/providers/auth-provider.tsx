'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/hooks/useAuth'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  signIn: (credentials: { email: string; password: string }) => Promise<{ data: unknown; error: unknown }>
  signUp: (credentials: { email: string; password: string; full_name: string }) => Promise<{ data: unknown; error: unknown }>
  signInWithGoogle: () => Promise<{ data: unknown; error: unknown }>
  signOut: () => Promise<{ error: unknown }>
  resetPassword: (email: string) => Promise<{ data: unknown; error: unknown }>
  isAuthenticated: boolean
  fetchUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
} 