import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para autenticação
export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends LoginCredentials {
  full_name: string
}

// Tipos baseados nas suas tabelas
export interface Profile {
  id: string
  email: string
  name: string
  role: 'admin' | 'school' | 'instructor' | 'student' | 'employee' | 'cozinheiro(a)' | 'mecanico' | 'secretária'
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  school_id?: string
  status: 'active' | 'inactive' | 'pending_first_login'
}

export interface School {
  id: string
  name: string
  phone: string
  email: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  subscription_plan: 'basic' | 'premium' | 'enterprise'
  students_count: number
  instructors_count: number
  country: string
  ddi: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  profile_id: string
  school_id: string
  instructor_id?: string
  status: 'enrolled' | 'in_progress' | 'approved' | 'failed' | 'suspended'
  progress: number
  lessons_completed: number
  total_lessons: number
  enrollment_date: string
  payment_status: 'pending' | 'approved' | 'failed' | 'refunded' | 'trial'
  access_status: 'active' | 'inactive'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Instructor {
  id: string
  profile_id: string
  school_id: string
  license?: string
  specialties?: string[]
  students_count: number
  rating: number
  is_active: boolean
  hired_date: string
  status: 'invited' | 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  student_id: string
  instructor_id: string
  type: 'theoretical' | 'practical' | 'simulation'
  scheduled_date: string
  duration: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  rating?: number
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  title: string
  description?: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  time_limit: number
  passing_score: number
  is_active: boolean
  school_id: string
  test_number?: number
  created_at: string
  updated_at: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: string
  answers: Record<string, unknown>
  score: number
  percentage: number
  time_spent: number
  status: 'in_progress' | 'completed' | 'abandoned'
  started_at: string
  completed_at?: string
}

export interface Payment {
  id: string
  school_id: string
  student_id: string
  amount: number
  type: 'subscription' | 'enrollment' | 'lesson' | 'test' | 'exam'
  status: 'pending' | 'approved' | 'failed' | 'refunded' | 'trial'
  method: 'vint24' | 'credit_card' | 'debit_card' | 'stripe'
  due_date: string
  paid_date?: string
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  type: string
  condition: Record<string, unknown>
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  is_active: boolean
  created_at: string
}

export interface TrafficSign {
  id: string
  code: string
  name: string
  description?: string
  svg_url?: string
  is_global: boolean
  school_id?: string
  category_id?: string
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
} 