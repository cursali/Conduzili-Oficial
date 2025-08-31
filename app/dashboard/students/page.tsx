'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import { Switch } from '@/components/ui/switch'
import { 
  IconUsers, 
  IconSearch, 
  IconFilter, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconMail, 
  IconPhone, 
  IconSchool, 
  IconUserCheck, 
  IconCalendar, 
  IconCreditCard,
  IconCircleCheck,
  IconClock,
  IconStar,
  IconTrophy,
  IconUser,

  IconDeviceFloppy,
  IconX,
  IconPhoto,
  IconCamera
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { deleteAvatarFromStorage } from '@/lib/delete-avatar'

interface Student {
  id: string
  profile_id: string
  status: string
  progress: number
  lessons_completed: number
  total_lessons: number
  enrollment_date: string
  payment_status: string
  access_status: string
  is_active: boolean
  student_name: string
  student_email: string
  student_phone: string
  student_avatar: string
  avatar_url?: string
  school_name: string
  instructor_id: string | null
  instructor_name: string | null
}

export default function StudentsPage() {
  const { profile } = useAuthContext()
  const { success, error, loading: showLoading, dismiss } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [licenseCategories, setLicenseCategories] = useState<Array<{id: string, name: string, code: string, description: string}>>([])
  const [instructors, setInstructors] = useState<Array<{id: string, name: string, email: string}>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  
  // Estados dos modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country_code: '+238',
    status: 'enrolled',
    payment_status: 'trial',
    access_status: 'active',
    instructor_id: 'none',
    avatar_url: '',
    license_category_id: '566b2f5b-470b-4249-8431-040ec631b62b',
    nameFocused: false,
    emailFocused: false
  })
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    fetchStudents()
    fetchLicenseCategories()
    fetchInstructors()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAddModalOpen) {
      resetForm()
    }
  }, [isAddModalOpen])

  const fetchLicenseCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('license_categories')
        .select('id, name, code, description')
        .order('name')

      if (error) throw error

      setLicenseCategories(data || [])
    } catch (err) {
      console.error('Erro ao buscar categorias de licença:', err)
      error('Erro ao carregar categorias de licença', 'Tente novamente ou entre em contato com o suporte.')
    }
  }

  const fetchInstructors = async () => {
    try {
      // Por enquanto, vamos criar instrutores de exemplo até ter dados reais
      const exampleInstructors = [
        { id: '1', name: 'João Silva', email: 'joao.silva@escola.com' },
        { id: '2', name: 'Maria Santos', email: 'maria.santos@escola.com' },
        { id: '3', name: 'Pedro Costa', email: 'pedro.costa@escola.com' }
      ]
      
      setInstructors(exampleInstructors)
    } catch (err) {
      console.error('Erro ao buscar instrutores:', err)
      error('Erro ao carregar instrutores', 'Tente novamente ou entre em contato com o suporte.')
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          id,
          status,
          progress,
          lessons_completed,
          total_lessons,
          enrollment_date,
          payment_status,
          access_status,
          is_active,
          profile_id,
          license_category_id,
          country_code
        `)
        // Mostrar todos os estudantes (ativos e inativos) para desenvolvimento

      if (fetchError) throw fetchError

      // Buscar dados dos perfis para cada estudante
      const studentsWithProfiles = await Promise.all(
        (data || []).map(async (student) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, email, phone, avatar_url')
            .eq('id', student.profile_id)
            .single()

          return {
            id: student.id,
            profile_id: student.profile_id,
            status: student.status,
            progress: student.progress || 0,
            lessons_completed: student.lessons_completed || 0,
            total_lessons: student.total_lessons || 35,
            enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
            payment_status: student.payment_status,
            access_status: student.access_status,
            is_active: student.is_active !== undefined ? student.is_active : true,
            student_name: profileData?.name || `Estudante ${student.id.slice(0, 8)}`,
            student_email: profileData?.email || 'Email não informado',
            student_phone: profileData?.phone || 'Telefone não informado',
            student_avatar: profileData?.avatar_url || '',
            avatar_url: profileData?.avatar_url || '',
            school_name: 'Escola não informada',
            instructor_id: null,
            instructor_name: null
          }
        })
      )

      setStudents(studentsWithProfiles)
    } catch (err) {
      console.error('Erro ao buscar estudantes:', err)
      error('Erro ao carregar alunos', 'Tente novamente ou entre em contato com o suporte.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'suspended': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'enrolled': return 'Matriculado'
      case 'in_progress': return 'Em Andamento'
      case 'approved': return 'Aprovado'
      case 'failed': return 'Reprovado'
      case 'suspended': return 'Suspenso'
      default: return status
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getPaymentStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'approved': return 'Aprovado'
      case 'failed': return 'Falhou'
      case 'refunded': return 'Reembolsado'
      case 'trial': return 'Período de Teste'
      default: return status
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || student.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStudentInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 dark:text-green-400'
    if (progress >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (progress >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Funções para gerenciar alunos
  const handleAddStudent = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      error('Por favor, preencha todos os campos obrigatórios.')
      return
    }

          const loadingToast = showLoading('Adicionando aluno...', 'Aguarde enquanto processamos sua solicitação.')

    try {
      // 1. Criar usuário no Supabase Auth via signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: '123456', // Senha padrão temporária
        options: {
          data: {
            name: formData.name,
            role: 'student'
          }
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário no Auth:', authError)
        error('Erro ao criar usuário de autenticação. Tente novamente.')
        return
      }

      if (!authData.user) {
        error('Erro ao criar usuário de autenticação.')
        return
      }

      const newUserId = authData.user.id

      // 2. Upload da imagem se existir
      let avatarUrl = formData.avatar_url
      if (avatarFile) {
        const uploadedUrl = await uploadAvatarToStorage()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      // 3. Criar o perfil na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId, // Usar o ID do usuário criado no Auth
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          avatar_url: avatarUrl,
          role: 'student',
          status: 'active'
        })
        .select()
        .single()

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        error('Erro ao criar perfil do aluno. Tente novamente.')
        return
      }

      // 4. Criar o estudante na tabela students
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          profile_id: newUserId,
          license_category_id: formData.license_category_id || null,
          payment_status: formData.payment_status,
          access_status: formData.access_status,
          country_code: formData.country_code,
          status: 'enrolled' // Usar 'enrolled' em vez de 'active'
        })
        .select()
        .single()

      if (studentError) {
        console.error('Erro ao criar estudante:', studentError)
        // Se falhar ao criar estudante, deletar perfil
        await supabase.from('profiles').delete().eq('id', newUserId)
        error('Erro ao criar aluno. Tente novamente.')
        return
      }

      success('Aluno adicionado com sucesso!')
      setIsAddModalOpen(false)
      resetForm()
      setAvatarFile(null)
      await fetchStudents()
      
      dismiss(loadingToast)
      success('Aluno adicionado com sucesso!', 'O novo aluno foi cadastrado no sistema.')
    } catch (err) {
      console.error('Erro ao adicionar estudante:', err)
      error('Erro ao adicionar aluno', 'Tente novamente ou entre em contato com o suporte.')
    }
  }

  const handleEditStudent = async () => {
    if (!selectedStudent) return

    try {
      const loadingToast = showLoading('Atualizando aluno...', 'Aguarde enquanto processamos sua solicitação.')
      
      // 1. Fazer upload da foto se houver nova
      let avatarUrl = formData.avatar_url
      if (avatarFile) {
        const uploadedUrl = await uploadAvatarToStorage()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }
      
      // 2. Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedStudent.profile_id)

      if (profileError) throw profileError

      // 3. Atualizar estudante
      const { error: studentError } = await supabase
        .from('students')
        .update({
          instructor_id: formData.instructor_id || null,
          status: formData.status,
          payment_status: formData.payment_status,
          access_status: formData.access_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedStudent.id)

      if (studentError) throw studentError

      // 4. Fechar modal e atualizar lista
      setIsEditModalOpen(false)
      resetForm()
      setAvatarFile(null)
      await fetchStudents()
      
      dismiss(loadingToast)
      success('Aluno atualizado com sucesso!', 'As informações foram salvas no sistema.')
    } catch (err) {
      console.error('Erro ao atualizar estudante:', err)
      error('Erro ao atualizar aluno', 'Tente novamente ou entre em contato com o suporte.')
    }
  }

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return

    try {
      const loadingToast = showLoading('Deletando aluno...', 'Aguarde enquanto processamos sua solicitação.')
      
      console.log('🗑️ DELETAR ALUNO: ==========================================')
      console.log('🗑️ DELETAR ALUNO: INICIANDO PROCESSO DE DELEÇÃO')
      console.log('🗑️ DELETAR ALUNO: ==========================================')
      console.log('🗑️ DELETAR ALUNO: selectedStudent ID:', selectedStudent.id)
      console.log('🗑️ DELETAR ALUNO: selectedStudent profile_id:', selectedStudent.profile_id)
      console.log('🗑️ DELETAR ALUNO: selectedStudent completo:', JSON.stringify(selectedStudent, null, 2))
      
      // 1. Deletar avatar do storage (se existir)
      console.log('🗑️ DELETAR ALUNO: ==========================================')
      console.log('🗑️ DELETAR ALUNO: ETAPA 1: VERIFICAÇÃO DO AVATAR')
      console.log('🗑️ DELETAR ALUNO: ==========================================')
      console.log('🗑️ DELETAR ALUNO: selectedStudent.avatar_url:', selectedStudent.avatar_url)
      console.log('🗑️ DELETAR ALUNO: selectedStudent.avatar_url type:', typeof selectedStudent.avatar_url)
      console.log('🗑️ DELETAR ALUNO: selectedStudent.avatar_url length:', selectedStudent.avatar_url?.length)
      console.log('🗑️ DELETAR ALUNO: selectedStudent.student_avatar:', selectedStudent.student_avatar)
      console.log('🗑️ DELETAR ALUNO: selectedStudent.student_avatar type:', typeof selectedStudent.student_avatar)
      console.log('🗑️ DELETAR ALUNO: selectedStudent.student_avatar length:', selectedStudent.student_avatar?.length)
      
      // Determinar qual URL usar para deletar o avatar
      const avatarUrlToDelete = selectedStudent.avatar_url || selectedStudent.student_avatar;
      console.log('🗑️ DELETAR ALUNO: URL escolhida para deleção:', avatarUrlToDelete)
      console.log('🗑️ DELETAR ALUNO: URL escolhida type:', typeof avatarUrlToDelete)
      console.log('🗑️ DELETAR ALUNO: URL escolhida length:', avatarUrlToDelete?.length)
      console.log('🗑️ DELETAR ALUNO: URL escolhida truthy:', !!avatarUrlToDelete)
      
      if (avatarUrlToDelete) {
        console.log('🗑️ DELETAR ALUNO: ==========================================')
        console.log('🗑️ DELETAR ALUNO: ETAPA 1.1: CHAMANDO API ADMIN PARA DELETAR AVATAR')
        console.log('🗑️ DELETAR ALUNO: ==========================================')
        console.log('🗑️ DELETAR ALUNO: Parâmetro passado para API admin:', avatarUrlToDelete)
        
        try {
          const response = await fetch('/api/delete-avatar-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ avatarUrl: avatarUrlToDelete })
          });

          const avatarResult = await response.json();
          console.log('🗑️ DELETAR ALUNO: Resposta da API admin:', response.status, avatarResult);
          
          if (response.ok && avatarResult.success) {
            console.log('🗑️ DELETAR ALUNO: ✅ Avatar deletado com sucesso via API admin:', avatarResult.message);
          } else {
            console.warn('🗑️ DELETAR ALUNO: ❌ Erro ao deletar avatar via API admin:', avatarResult.message);
          }
        } catch (apiError) {
          console.error('🗑️ DELETAR ALUNO: Erro ao chamar API admin:', apiError);
        }
      } else {
        console.log('🗑️ DELETAR ALUNO: ❌ Nenhum avatar para deletar - ambas as URLs estão vazias')
      }

      // 2. Deletar dados relacionados (categorias de licença, documentos, etc.)
      console.log('🗑️ DELETAR ALUNO: Deletando dados relacionados...')
      
      try {
        // Deletar categorias de licença
        await supabase.from('student_license_categories').delete().eq('student_id', selectedStudent.id)
        
        // Deletar documentos de matrícula
        const { data: docs } = await supabase.from('enrollment_documents').select('file_path').eq('student_id', selectedStudent.id)
        if (docs && docs.length > 0) {
          const paths = docs.map(d => d?.file_path).filter(p => typeof p === 'string' && p.length > 0)
          if (paths.length > 0) {
            await supabase.storage.from('enrollment-documents').remove(paths)
          }
          await supabase.from('enrollment_documents').delete().eq('student_id', selectedStudent.id)
        }
      } catch (relatedDataError) {
        console.warn('🗑️ DELETAR ALUNO: Erro ao deletar dados relacionados:', relatedDataError)
      }

      // 3. Deletar estudante da tabela students
      console.log('🗑️ DELETAR ALUNO: Deletando registro de estudante...')
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', selectedStudent.id)

      if (studentError) {
        console.error('🗑️ DELETAR ALUNO: Erro ao deletar estudante:', studentError)
        throw studentError
      }

      // 4. Deletar perfil do usuário da tabela profiles
      console.log('🗑️ DELETAR ALUNO: Deletando perfil...')
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedStudent.profile_id)

      if (profileError) {
        console.error('🗑️ DELETAR ALUNO: Erro ao deletar perfil:', profileError)
        // Se falhar ao deletar perfil, continuar mesmo assim
      }

      // 5. Deletar usuário do Supabase Auth via API Route simples
      console.log('🗑️ DELETAR ALUNO: Deletando usuário do Auth...')
      try {
        const response = await fetch('/api/delete-user-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: selectedStudent.profile_id })
        })

        const result = await response.json()
        console.log('🗑️ DELETAR ALUNO: Resposta da API Auth:', response.status, result)

        if (!response.ok) {
          console.warn('🗑️ DELETAR ALUNO: Usuário não foi deletado do Auth, mas dados foram removidos')
        } else {
          console.log('🗑️ DELETAR ALUNO: Usuário deletado com sucesso do Auth')
        }
      } catch (authErr) {
        console.warn('🗑️ DELETAR ALUNO: Erro ao deletar usuário do Auth:', authErr)
        // Se falhar ao deletar do Auth, continuar mesmo assim
      }

      // 6. Fechar modal e atualizar lista
      setIsDeleteModalOpen(false)
      setSelectedStudent(null)
      
      // 7. Atualizar a lista imediatamente
      await fetchStudents()
      
      dismiss(loadingToast)
      success('Aluno deletado com sucesso!', 'O aluno foi completamente removido do sistema, incluindo avatar, dados relacionados e conta de usuário.')
      
      console.log('🗑️ DELETAR ALUNO: Processo concluído com sucesso!')
      
    } catch (err) {
      console.error('🗑️ DELETAR ALUNO: Erro ao deletar estudante:', err)
      error('Erro ao deletar aluno', 'Tente novamente ou entre em contato com o suporte.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country_code: '+238',
      status: 'enrolled',
      payment_status: 'trial',
      access_status: 'active',
      instructor_id: 'none',
      avatar_url: '',
      license_category_id: '566b2f5b-470b-4249-8431-040ec631b62b',
      nameFocused: false,
      emailFocused: false
    })
    setAvatarFile(null)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    resetForm()
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    resetForm()
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedStudent(null)
  }

  const openEditModal = (student: Student) => {
    setSelectedStudent(student)
    setFormData({
      name: student.student_name,
      email: student.student_email,
      phone: student.student_phone,
      country_code: '+238', // Default para Cabo Verde
      status: student.status,
      payment_status: student.payment_status,
      access_status: student.access_status,
      instructor_id: student.instructor_id || 'none',
      avatar_url: student.student_avatar || '',
      license_category_id: '566b2f5b-470b-4249-8431-040ec631b62b',
      nameFocused: false,
      emailFocused: false
    })
    setAvatarFile(null)
    setIsEditModalOpen(true)
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tamanho do arquivo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      error('Arquivo muito grande. Tamanho máximo: 2MB')
      return
    }

    // Validar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      error('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Armazenar arquivo temporariamente
    setAvatarFile(file)
    
    // Criar URL temporária para preview
    const tempUrl = URL.createObjectURL(file)
    setFormData(prev => ({ ...prev, avatar_url: tempUrl }))
    
    success('Imagem selecionada!')  
  }

  const uploadAvatarToStorage = async (): Promise<string | null> => {
    if (!avatarFile) return null

    try {
      // Criar nome único para o arquivo
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `student-avatars/${fileName}`

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)

      if (uploadError) throw uploadError

      // Obter URL pública da imagem
      const { data: { publicUrl } } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Erro no upload da imagem:', err)
      error('Erro ao fazer upload da imagem. Tente novamente.')
      return null
    }
  }

  const openDeleteModal = (student: Student) => {
    setSelectedStudent(student)
    setIsDeleteModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando alunos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header da Página */}
      <div className="px-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Alunos</h1>
        <p className="text-muted-foreground">Visualize e gerencie todos os alunos da sua escola</p>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-6 max-w-[95%] mx-auto w-full">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <IconUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Alunos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <IconCircleCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {students.filter(s => s.status === 'approved').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Aprovados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <IconClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {students.filter(s => s.status === 'in_progress').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <IconTrophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length || 0)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Progresso Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="enrolled">Matriculado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="failed">Reprovado</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Pagamentos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                    <SelectItem value="trial">Período de Teste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen} modal={true}>
                <SheetTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <IconPlus className="w-4 h-4" />
                    Adicionar Aluno
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  className="w-full sm:max-w-2xl overflow-hidden [&>button]:hidden"
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                                     <SheetHeader className="pb-6">
                     <div className="flex items-center justify-between">
                       <div>
                                                   <SheetTitle>Adicionar Novo Aluno</SheetTitle>
                     <SheetDescription>
                            Preencha as informações para cadastrar um novo aluno no sistema.
                     </SheetDescription>
                       </div>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={handleCloseAddModal}
                         className="h-12 w-12 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                       >
                         <IconX className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                       </Button>
                     </div>
                   </SheetHeader>
                   
                   <div className="space-y-6 py-6 px-6 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                     <div className="space-y-4 flex flex-col items-center">
                       <Label htmlFor="avatar" className="flex items-center gap-2 text-xl font-semibold text-center">
                         <IconPhoto className="w-6 h-6 text-primary" />
                         Foto do Aluno
                       </Label>
                       <div className="flex flex-col items-center gap-6">
                         <div className="relative">
                           <Avatar className="w-32 h-32 border-3 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200 shadow-lg">
                             {formData.avatar_url ? (
                               <AvatarImage src={formData.avatar_url} alt="Foto do aluno" />
                             ) : (
                               <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
                                 <IconUser className="w-16 h-16" />
                               </AvatarFallback>
                             )}
                           </Avatar>
                           <Button
                             size="sm"
                             variant="outline"
                             className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-10 w-10 p-0 rounded-full bg-background border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200 shadow-lg"
                             onClick={() => document.getElementById('avatar-upload')?.click()}
                           >
                             <IconCamera className="w-5 h-5" />
                           </Button>
                         </div>
                         <div className="text-center">
                           <input
                             id="avatar-upload"
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onChange={handleAvatarUpload}
                           />
                         </div>
                       </div>
                     </div>
                     
                     <div className="relative">
                       <Input
                         id="name"
                         value={formData.name}
                         onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                         onFocus={() => setFormData(prev => ({ ...prev, nameFocused: true }))}
                         onBlur={() => setFormData(prev => ({ ...prev, nameFocused: false }))}
                         placeholder=" "
                         className="text-lg h-12 pl-12 peer"
                       />
                       <Label 
                         htmlFor="name" 
                         className={`absolute left-12 transition-all duration-200 ${
                           formData.name || formData.nameFocused 
                             ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                             : 'top-3 text-base text-muted-foreground'
                         }`}
                       >
                         Nome Completo *
                       </Label>
                       <IconUser className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                     </div>
                     
                     <div className="relative">
                       <Input
                         id="email"
                         type="email"
                         value={formData.email}
                         onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                         onFocus={() => setFormData(prev => ({ ...prev, emailFocused: true }))}
                         onBlur={() => setFormData(prev => ({ ...prev, emailFocused: false }))}
                         placeholder=" "
                         className="text-lg h-12 pl-12 peer"
                       />
                       <Label 
                         htmlFor="email" 
                         className={`absolute left-12 transition-all duration-200 ${
                           formData.email || formData.emailFocused 
                             ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                             : 'top-3 text-base text-muted-foreground'
                         }`}
                       >
                         Email *
                       </Label>
                       <IconMail className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                     </div>
                     
                     <div className="space-y-3">
                       <div className="flex gap-3">
                         <div className="w-1/2">
                           <Select value={formData.country_code || '+238'} onValueChange={(value) => setFormData(prev => ({ ...prev, country_code: value }))}>
                             <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="+238">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇨🇻</span>
                                   <span>+238 Cabo Verde</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="+55">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇧🇷</span>
                                   <span>+55 Brasil</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="+244">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇦🇴</span>
                                   <span>+244 Angola</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="+351">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇵🇹</span>
                                   <span>+351 Portugal</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="+258">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇲🇿</span>
                                   <span>+258 Moçambique</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="+245">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇬🇼</span>
                                   <span>+245 Guiné-Bissau</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="+239">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇸🇹</span>
                                   <span>+239 São Tomé e Príncipe</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="+670">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇹🇱</span>
                                   <span>+670 Timor-Leste</span>
                                 </div>
                               </SelectItem>
                               <SelectItem value="+86">
                                 <div className="flex items-center gap-3">
                                   <span className="text-2xl">🇲🇴</span>
                                   <span>+86 Macau</span>
                                 </div>
                               </SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <div className="relative w-1/2">
                           <Input
                             id="phone"
                             value={formData.phone}
                             onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                             placeholder="Digite o telefone"
                             className="w-full text-lg h-12 pl-12 border-2 focus:border-primary"
                           />
                           <IconPhone className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                         </div>
                       </div>
                     </div>
                     
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                         <Label htmlFor="license_category" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                           <IconSchool className="w-4 h-4" />
                           Categoria de Carta
                         </Label>
                         <Select value={formData.license_category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, license_category_id: value }))}>
                           <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                             <SelectValue placeholder="Selecione a categoria de carta" />
                           </SelectTrigger>
                           <SelectContent>
                             {licenseCategories.map((category) => (
                               <SelectItem key={category.id} value={category.id}>
                                 <div className="flex items-center gap-3">
                                   <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                     {category.code}
                                   </div>
                                   <span>{category.name}</span>
                                 </div>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                       
                       <div className="space-y-3">
                         <Label htmlFor="instructor" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                           <IconUser className="w-4 h-4" />
                           Instrutor
                         </Label>
                         <Select value={formData.instructor_id} onValueChange={(value) => setFormData(prev => ({ ...prev, instructor_id: value }))}>
                           <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                             <SelectValue placeholder="Selecione um instrutor (opcional)" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="none">Sem instrutor</SelectItem>
                             {instructors.map((instructor) => (
                               <SelectItem key={instructor.id} value={instructor.id}>
                                 <div className="flex items-center gap-3">
                                   <span>{instructor.name}</span>
                                   <span className="text-sm text-muted-foreground">({instructor.email})</span>
                                 </div>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                         <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                           <IconUserCheck className="w-4 h-4" />
                           Status
                         </Label>
                         <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                           <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="enrolled">Matriculado</SelectItem>
                             <SelectItem value="in_progress">Em Andamento</SelectItem>
                             <SelectItem value="approved">Aprovado</SelectItem>
                             <SelectItem value="failed">Reprovado</SelectItem>
                             <SelectItem value="suspended">Suspenso</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       
                       <div className="space-y-3">
                         <Label htmlFor="payment_status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                           <IconCreditCard className="w-4 h-4" />
                           Status de Pagamento
                         </Label>
                         <Select value={formData.payment_status} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_status: value }))}>
                           <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="pending">Pendente</SelectItem>
                             <SelectItem value="approved">Aprovado</SelectItem>
                             <SelectItem value="failed">Falhou</SelectItem>
                             <SelectItem value="refunded">Reembolsado</SelectItem>
                             <SelectItem value="trial">Período de Teste</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                     
                     <div className="space-y-3">
                       <Label htmlFor="access_status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                         <IconCircleCheck className="w-4 h-4" />
                         Status de Acesso
                       </Label>
                       <div className="flex items-center gap-3 p-4 border-2 border-muted rounded-lg bg-muted/20">
                         <Switch
                           id="access_status"
                           checked={formData.access_status === 'active'}
                           onCheckedChange={(checked) => setFormData(prev => ({ 
                             ...prev, 
                             access_status: checked ? 'active' : 'inactive' 
                           }))}
                         />
                         <span className="text-sm font-medium">
                           {formData.access_status === 'active' ? 'Ativo' : 'Inativo'}
                         </span>
                       </div>
                       </div>
                     </div>
                   
                   <SheetFooter className="pt-4 flex flex-row gap-4 justify-between items-center w-full">
                     <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex items-center gap-2 h-12 px-6 min-w-[140px] flex-shrink-0">
                       <IconX className="w-4 h-4" />
                       Cancelar
                     </Button>
                     <Button onClick={handleAddStudent} disabled={!formData.name || !formData.email} className="flex items-center gap-2 h-12 px-8 text-base flex-1">
                       <IconPlus className="w-5 h-5" />
                       Adicionar Aluno
                     </Button>
                   </SheetFooter>
                 </SheetContent>
               </Sheet>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Visualização */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="grid">Grade</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

                     {/* Tab: Visão Geral */}
           <TabsContent value="overview" className="mt-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={student.student_avatar || undefined} alt={student.student_name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                            {getStudentInitials(student.student_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{student.student_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{student.student_email}</p>
                        </div>
                      </div>
                                             <div className="flex gap-2">
                         <Button variant="ghost" size="sm">
                           <IconEye className="w-4 h-4" />
                         </Button>
                         <Button variant="ghost" size="sm" onClick={() => openEditModal(student)}>
                           <IconEdit className="w-4 h-4" />
                         </Button>
                       </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Status e Progresso */}
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusBadgeColor(student.status)}>
                        {getStatusDisplayName(student.status)}
                      </Badge>
                      <Badge className={getPaymentStatusBadgeColor(student.payment_status)}>
                        {getPaymentStatusDisplayName(student.payment_status)}
                      </Badge>
                    </div>

                    {/* Progresso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progresso do Curso</span>
                        <span className={`font-semibold ${getProgressColor(student.progress)}`}>
                          {student.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            student.progress >= 80 ? 'bg-green-500' :
                            student.progress >= 60 ? 'bg-yellow-500' :
                            student.progress >= 40 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {student.lessons_completed} de {student.total_lessons} aulas concluídas
                      </p>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <IconSchool className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Escola</p>
                        <p className="text-sm font-medium">{student.school_name}</p>
                      </div>
                      <div className="text-center">
                        <IconCalendar className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Matrícula</p>
                        <p className="text-sm font-medium">
                          {new Date(student.enrollment_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Instrutor */}
                    {student.instructor_name && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <IconUserCheck className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Instrutor:</p>
                        <p className="text-sm font-medium">{student.instructor_name}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

                     {/* Tab: Grade */}
           <TabsContent value="grid" className="mt-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={student.student_avatar || undefined} alt={student.student_name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-lg">
                        {getStudentInitials(student.student_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="font-semibold text-sm mb-1 truncate">{student.student_name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 truncate">{student.student_email}</p>
                    
                    <div className="space-y-2">
                      <Badge className={getStatusBadgeColor(student.status)}>
                        {getStatusDisplayName(student.status)}
                      </Badge>
                      
                      <div className="text-xs">
                        <span className={getProgressColor(student.progress)}>
                          {student.progress}% completo
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Lista */}
          <TabsContent value="list" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Aluno</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Progresso</th>
                        <th className="text-left p-4 font-medium">Pagamento</th>
                        <th className="text-left p-4 font-medium">Escola</th>
                        <th className="text-left p-4 font-medium">Instrutor</th>
                        <th className="text-left p-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={student.student_avatar || undefined} alt={student.student_name} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                  {getStudentInitials(student.student_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.student_name}</p>
                                <p className="text-sm text-muted-foreground">{student.student_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusBadgeColor(student.status)}>
                              {getStatusDisplayName(student.status)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    student.progress >= 80 ? 'bg-green-500' :
                                    student.progress >= 60 ? 'bg-yellow-500' :
                                    student.progress >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getPaymentStatusBadgeColor(student.payment_status)}>
                              {getPaymentStatusDisplayName(student.payment_status)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{student.school_name}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-muted-foreground">
                              {student.instructor_name || 'Não atribuído'}
                            </p>
                          </td>
                                                     <td className="p-4">
                             <div className="flex gap-2">
                               <Button variant="ghost" size="sm">
                                 <IconEye className="w-4 h-4" />
                               </Button>
                               <Button variant="ghost" size="sm" onClick={() => openEditModal(student)}>
                                 <IconEdit className="w-4 h-4" />
                               </Button>
                               <Button variant="ghost" size="sm" onClick={() => openDeleteModal(student)}>
                                 <IconTrash className="w-4 h-4" />
                               </Button>
                             </div>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mensagem quando não há alunos */}
        {filteredStudents.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <IconUsers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro aluno'
                }
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <IconPlus className="w-4 h-4 mr-0" />
                Adicionar Aluno
              </Button>
            </CardContent>
          </Card>
                 )}
       </div>

       {/* Modal de Edição */}
                     <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen} modal={true}>
                                     <SheetContent 
                     className="w-full sm:max-w-2xl overflow-hidden [&>button]:hidden"
                     onPointerDownOutside={(e) => e.preventDefault()}
                   >
           <SheetHeader className="pb-6">
             <div className="flex items-center justify-between">
               <div>
                 <SheetTitle>Editar Aluno</SheetTitle>
             <SheetDescription>
                   Atualize as informações do aluno selecionado.
             </SheetDescription>
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleCloseEditModal}
                 className="h-12 w-12 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors"
               >
                 <IconX className="h-6 w-6 text-blue-600 dark:text-blue-400" />
               </Button>
             </div>
           </SheetHeader>
           
           <div className="space-y-6 py-6 px-6 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
             <div className="space-y-4 flex flex-col items-center">
               <Label htmlFor="edit-avatar" className="flex items-center gap-2 text-xl font-semibold text-center">
                 <IconPhoto className="w-6 h-6 text-primary" />
                 Foto do Aluno
               </Label>
               <div className="flex flex-col items-center gap-6">
                 <div className="relative">
                   <Avatar className="w-32 h-32 border-3 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200 shadow-lg">
                     {formData.avatar_url ? (
                       <AvatarImage src={formData.avatar_url} alt="Foto do aluno" />
                     ) : (
                       <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
                         <IconUser className="w-16 h-16" />
                       </AvatarFallback>
                     )}
                   </Avatar>
                                        <Button
                       size="sm"
                       variant="outline"
                       className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-10 w-10 p-0 rounded-full bg-background border-2 border-primary hover:bg-primary hover:text-white transition-all duration-200 shadow-lg"
                       onClick={() => document.getElementById('edit-avatar-upload')?.click()}
                     >
                     <IconCamera className="w-5 h-5" />
                   </Button>
                 </div>
                 <div className="text-center">
                   <input
                     id="edit-avatar-upload"
                     type="file"
                     accept="image/*"
                     className="hidden"
                     onChange={handleAvatarUpload}
                   />
                 </div>
               </div>
             </div>
             
             <div className="relative">
               <Input
                 id="edit-name"
                 value={formData.name}
                 onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                 onFocus={() => setFormData(prev => ({ ...prev, nameFocused: true }))}
                 onBlur={() => setFormData(prev => ({ ...prev, nameFocused: false }))}
                 placeholder=" "
                 className="text-lg h-12 pl-12 peer"
               />
               <Label 
                 htmlFor="edit-name" 
                 className={`absolute left-12 transition-all duration-200 ${
                   formData.name || formData.nameFocused 
                     ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                     : 'top-3 text-base text-muted-foreground'
                 }`}
               >
                 Nome Completo *
               </Label>
               <IconUser className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
             </div>
             
             <div className="relative">
               <Input
                 id="edit-email"
                 type="email"
                 value={formData.email}
                 disabled
                 placeholder=" "
                 className="bg-muted text-lg h-12 pl-12 peer"
               />
               <Label 
                 htmlFor="edit-email" 
                 className={`absolute left-12 transition-all duration-200 ${
                   formData.email || formData.emailFocused 
                     ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                     : 'top-3 text-base text-muted-foreground'
                 }`}
               >
                 Email *
               </Label>
               <IconMail className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
               <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado</p>
             </div>
             
             <div className="relative">
               <div className="flex gap-3">
                 <div className="w-1/2">
                   <Select value={formData.country_code || '+238'} onValueChange={(value) => setFormData(prev => ({ ...prev, country_code: value }))}>
                     <SelectTrigger className="w-full !h-12 min-h-[48px]">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="+238">
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">🇨🇻</span>
                           <span>+238 Cabo Verde</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="+55">
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">🇧🇷</span>
                           <span>+55 Brasil</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="+244">
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">🇦🇴</span>
                           <span>+244 Angola</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="+351">
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">🇵🇹</span>
                           <span>+351 Portugal</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="+258">
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">🇲🇿</span>
                           <span>+258 Moçambique</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="+245">
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">🇬🇼</span>
                           <span>+245 Guiné-Bissau</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="+239">
                         <div className="flex items-center gap-3">
                           <span className="text-3xl">🇸🇹</span>
                           <span>+239 São Tomé e Príncipe</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="+670">
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">🇹🇱</span>
                           <span>+670 Timor-Leste</span>
                         </div>
                       </SelectItem>
                       <SelectItem value="+86">
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">🇲🇴</span>
                           <span>+86 Macau</span>
                         </div>
                       </SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="relative w-1/2">
                   <Input
                     id="edit-phone"
                     value={formData.phone}
                     onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                     placeholder=" "
                     className="w-full text-lg h-12 pl-12 peer"
                   />
                   <IconPhone className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                 </div>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                 <Label htmlFor="edit-license_category" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                   <IconSchool className="w-4 h-4" />
                   Categoria de Carta
                 </Label>
                 <Select value={formData.license_category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, license_category_id: value }))}>
                   <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                     <SelectValue placeholder="Selecione a categoria de carta" />
                   </SelectTrigger>
                   <SelectContent>
                     {licenseCategories.map((category) => (
                       <SelectItem key={category.id} value={category.id}>
                         <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                             {category.code}
                           </div>
                           <span>{category.name}</span>
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="space-y-3">
                 <Label htmlFor="edit-instructor" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                   <IconUser className="w-4 h-4" />
                   Instrutor
                 </Label>
                 <Select value={formData.instructor_id} onValueChange={(value) => setFormData(prev => ({ ...prev, instructor_id: value }))}>
                   <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                     <SelectValue placeholder="Selecione um instrutor (opcional)" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="none">Sem instrutor</SelectItem>
                     {instructors.map((instructor) => (
                       <SelectItem key={instructor.id} value={instructor.id}>
                         <div className="flex items-center gap-3">
                           <span>{instructor.name}</span>
                           <span className="text-sm text-muted-foreground">({instructor.email})</span>
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                 <Label htmlFor="edit-status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                   <IconUserCheck className="w-4 h-4" />
                   Status
                 </Label>
                 <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                   <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="enrolled">Matriculado</SelectItem>
                     <SelectItem value="in_progress">Em Andamento</SelectItem>
                     <SelectItem value="approved">Aprovado</SelectItem>
                     <SelectItem value="failed">Reprovado</SelectItem>
                     <SelectItem value="suspended">Suspenso</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               
               <div className="space-y-3">
                 <Label htmlFor="edit-payment_status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                   <IconCreditCard className="w-4 h-4" />
                   Status de Pagamento
                 </Label>
                 <Select value={formData.payment_status} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_status: value }))}>
                   <SelectTrigger className="w-full !h-12 border-2 focus:border-primary min-h-[48px]">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="pending">Pendente</SelectItem>
                     <SelectItem value="approved">Aprovado</SelectItem>
                     <SelectItem value="failed">Falhou</SelectItem>
                     <SelectItem value="refunded">Reembolsado</SelectItem>
                     <SelectItem value="trial">Período de Teste</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             
             <div className="space-y-3">
               <Label htmlFor="edit-access_status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                 <IconCircleCheck className="w-4 h-4" />
                 Status de Acesso
               </Label>
               <div className="flex items-center gap-3 p-4 border-2 border-muted rounded-lg bg-muted/20">
                 <Switch
                   id="edit-access_status"
                   checked={formData.access_status === 'active'}
                   onCheckedChange={(checked) => setFormData(prev => ({ 
                     ...prev, 
                     access_status: checked ? 'active' : 'inactive' 
                   }))}
                 />
                 <span className="text-sm font-medium">
                   {formData.access_status === 'active' ? 'Ativo' : 'Inativo'}
                 </span>
               </div>
             </div>
           </div>
           
           <SheetFooter className="pt-4 flex flex-row gap-4 justify-between items-center w-full">
             <Button variant="outline" onClick={handleCloseEditModal} className="flex items-center gap-2 h-12 px-6 min-w-[140px] flex-shrink-0">
               <IconX className="w-4 h-4" />
               Cancelar
             </Button>
             <Button onClick={handleEditStudent} disabled={!formData.name} className="flex items-center gap-2 h-12 px-8 text-base flex-1">
               <IconDeviceFloppy className="w-5 h-5" />
               Salvar Alterações
             </Button>
           </SheetFooter>
         </SheetContent>
       </Sheet>

       {/* Modal de Confirmação de Exclusão */}
               <Sheet open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} modal={true}>
         <SheetContent 
           className="w-full sm:max-w-md [&>button]:hidden"
           onPointerDownOutside={(e) => e.preventDefault()}
         >
           <SheetHeader className="pb-6">
             <div className="flex items-start justify-between">
               <div className="flex-1">
                 <SheetTitle className="text-red-600 dark:text-red-400">Confirmar Exclusão Permanente</SheetTitle>
             <SheetDescription className="pt-4">
                   Tem certeza que deseja deletar permanentemente o aluno <strong>{selectedStudent?.student_name}</strong>?
               <br />
               <br />
                   <span className="text-red-600 dark:text-red-400 font-semibold">⚠️ ATENÇÃO:</span> Esta ação é irreversível e irá deletar completamente todos os dados do aluno do sistema, incluindo perfil, progresso do curso, dados de matrícula e conta de usuário.
             </SheetDescription>
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleCloseDeleteModal}
                 className="h-12 w-12 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors flex-shrink-0 ml-4"
               >
                 <IconX className="h-6 w-6 text-blue-600 dark:text-blue-400" />
               </Button>
             </div>
           </SheetHeader>
           
           <SheetFooter className="flex flex-row gap-4 justify-between items-center pt-6 w-full">
             <Button variant="outline" onClick={handleCloseDeleteModal} className="flex items-center gap-2 h-12 px-6 min-w-[140px] flex-shrink-0">
               <IconX className="w-4 h-4" />
               Cancelar
             </Button>
             <Button onClick={handleDeleteStudent} className="bg-red-600 hover:bg-red-700 flex items-center gap-2 h-12 px-8 flex-1">
               <IconTrash className="w-5 h-5" />
               Sim, Deletar Aluno
             </Button>
           </SheetFooter>
         </SheetContent>
       </Sheet>
     </div>
   )
 }
