import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Student, Profile } from '@/lib/supabase'

export interface StudentWithProfile extends Student {
  profile: Profile
}

export function useStudents() {
  const [students, setStudents] = useState<StudentWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar o usuário autenticado
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Usuário não autenticado')
        setLoading(false)
        return
      }

      // Buscar o perfil do usuário para obter o school_id
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !userProfile) {
        setError('Perfil do usuário não encontrado')
        setLoading(false)
        return
      }

      // Se o usuário é uma escola, buscar alunos da sua escola
      // Se o usuário é admin, buscar todos os alunos
      let schoolId = userProfile.school_id
      
      if (userProfile.role === 'admin') {
        // Admin pode ver todos os alunos
        schoolId = undefined
      }

      // Construir a query base
      let query = supabase
        .from('students')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('is_active', true)

      // Adicionar filtro por escola se não for admin
      if (schoolId) {
        query = query.eq('school_id', schoolId)
      }

      const { data, error: studentsError } = await query

      if (studentsError) {
        throw studentsError
      }

      // Transformar os dados para o formato esperado
      const studentsWithProfiles = data?.map(student => ({
        ...student,
        profile: student.profile as Profile
      })) || []

      setStudents(studentsWithProfiles)
    } catch (err) {
      console.error('Erro ao buscar alunos:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const refreshStudents = () => {
    fetchStudents()
  }

  return {
    students,
    loading,
    error,
    refreshStudents
  }
} 