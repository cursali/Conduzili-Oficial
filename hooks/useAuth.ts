'use client'

import { useEffect, useState } from 'react'
import { supabase, type AuthUser, type LoginCredentials, type SignUpCredentials } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

// Interface para o perfil do usuário
export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    // Obter sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Buscar perfil do usuário quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchUserProfile()
    } else {
      setProfile(null)
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        // Se não encontrar perfil, criar um básico com os dados do auth
        setProfile({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          role: 'student',
          avatar_url: user.user_metadata?.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at
        })
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const signIn = async ({ email, password }: LoginCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signUp = async ({ email, password, full_name }: SignUpCredentials) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
          }
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    user,
    session,
    profile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    fetchUserProfile
  }
} 