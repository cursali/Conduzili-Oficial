'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthContext } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { IconUser, IconMail, IconPhone, IconEdit, IconDeviceFloppy, IconX, IconCamera, IconTrash } from '@tabler/icons-react'

export default function ProfilePage() {
  const { user, profile, profileLoading, fetchUserProfile } = useAuthContext()
  const { success, error, loading: showLoading, dismiss } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    role: profile?.role || 'admin'
  })

  // Atualizar formData quando profile mudar
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || 'admin'
      })
    }
  }, [profile])
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <IconUser className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Perfil não encontrado</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      const updateData: {
        name: string;
        phone: string;
        updated_at: string;
        role?: string;
      } = {
        name: formData.name,
        phone: formData.phone,
        updated_at: new Date().toISOString()
      }
      
      // Não permitir que admins alterem seu próprio role
      if (profile.role !== 'admin') {
        updateData.role = formData.role
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) throw updateError

      await fetchUserProfile()
      setIsEditing(false)
      success('Perfil atualizado com sucesso!', 'Suas informações foram salvas.')
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      error('Erro ao salvar perfil', 'Tente novamente ou entre em contato com o suporte.')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      role: profile?.role || 'admin'
    })
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageUpload = async (file: File) => {
    if (!user) return

    setIsUploading(true)
    const loadingToast = showLoading('Fazendo upload da imagem...', 'Aguarde enquanto processamos sua foto.')
    
    try {
      // 1. Deletar imagem antiga se existir
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldPath}`])
        }
      }

      // 2. Upload da nova imagem
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 3. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 4. Atualizar perfil no banco
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // 5. Atualizar contexto local
      await fetchUserProfile()

      // 6. Fechar toast de loading e mostrar sucesso
      dismiss(loadingToast)
      success('Foto de perfil atualizada!', 'Sua nova foto foi salva com sucesso.')
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      dismiss(loadingToast)
      error('Erro ao fazer upload da imagem', 'Verifique o formato e tamanho do arquivo e tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!user || !profile.avatar_url) return

    const loadingToast = showLoading('Removendo foto de perfil...', 'Aguarde enquanto processamos sua solicitação.')

    try {
      // 1. Deletar do storage
      const oldPath = profile.avatar_url.split('/').pop()
      if (oldPath) {
        await supabase.storage
          .from('avatars')
          .remove([`avatars/${oldPath}`])
      }

      // 2. Atualizar perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // 3. Atualizar contexto local
      await fetchUserProfile()

      // 4. Fechar toast de loading e mostrar sucesso
      dismiss(loadingToast)
      success('Foto de perfil removida!', 'Sua foto foi removida com sucesso.')
    } catch (err) {
      console.error('Erro ao remover imagem:', err)
      dismiss(loadingToast)
      error('Erro ao remover imagem', 'Tente novamente ou entre em contato com o suporte.')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      case 'school': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'instructor': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'student': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'super_admin': return 'Super Administrador'
      case 'school': return 'Escola'
      case 'instructor': return 'Instrutor'
      case 'student': return 'Estudante'
      case 'employee': return 'Funcionário'
      default: return role
    }
  }

  const userInitials = profile.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header da Página */}
      <div className="px-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e foto de perfil</p>
      </div>

      {/* Conteúdo Principal - Cada card em uma linha */}
      <div className="px-6 max-w-4xl mx-auto w-full">
        {/* Card da Foto de Perfil */}
        <Card className="mb-6">
          <CardContent className="text-center">
            <div className="relative inline-block">
              <Avatar className="w-32 h-32 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              {/* Botão de upload sobreposto */}
              <div className="absolute -bottom-2 -right-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full w-12 h-12 p-0 bg-background shadow-lg border-border"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <IconCamera className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 mt-6 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <IconCamera className="w-5 h-5" />
                {isUploading ? 'Fazendo Upload...' : 'Alterar Foto'}
              </Button>
              
              {profile.avatar_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2"
                >
                  <IconTrash className="w-5 h-5" />
                  Remover
                </Button>
              )}
            </div>

            {/* Input de arquivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleImageUpload(file)
                  e.target.value = '' // Reset input
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Card de Informações Pessoais */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações básicas
                  {profile.role === 'admin' && ' (exceto o tipo de usuário)'}
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <IconX className="w-5 h-5" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <IconEdit className="w-5 h-5" />
                    Editar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">Nome Completo</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-lg"
                  />
                ) : (
                  <p className="text-foreground font-medium text-lg">{profile.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">Email</Label>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <IconMail className="w-6 h-6 text-muted-foreground" />
                  <span className="text-lg">{profile.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium">Telefone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Digite seu telefone"
                    className="text-lg"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <IconPhone className="w-6 h-6 text-muted-foreground" />
                    <span className="text-lg">{profile.phone || 'Não informado'}</span>
                  </div>
                )}
              </div>

              {/* Função */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Função no Sistema</Label>
                {isEditing && profile.role !== 'admin' ? (
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="super_admin">Super Administrador</SelectItem>
                      <SelectItem value="school">Escola</SelectItem>
                      <SelectItem value="instructor">Instrutor</SelectItem>
                      <SelectItem value="student">Estudante</SelectItem>
                      <SelectItem value="employee">Funcionário</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={`${getRoleBadgeColor(profile.role)} text-base font-medium px-4 py-2`}>
                    {getRoleDisplayName(profile.role)}
                  </Badge>
                )}
                {profile.role === 'admin' && (
                  <p className="text-xs text-muted-foreground">O tipo de usuário administrador não pode ser alterado</p>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            {isEditing && (
              <div className="flex gap-4 pt-6 justify-center">
                <Button onClick={handleSave} className="flex items-center gap-2 px-8 py-3">
                  <IconDeviceFloppy className="w-5 h-5" />
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={handleCancel} className="px-8 py-3">
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Estatísticas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estatísticas da Conta</CardTitle>
            <CardDescription>
              Visão geral da sua atividade no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconUser className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">365</p>
                <p className="text-base text-muted-foreground">Dias ativo</p>
              </div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconMail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">98%</p>
                <p className="text-base text-muted-foreground">Taxa de sucesso</p>
              </div>
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconPhone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">12</p>
                <p className="text-base text-muted-foreground">Escolas gerenciadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status da Conta</CardTitle>
            <CardDescription>
              Informações sobre o status da sua conta no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IconUser className="w-6 h-6 text-muted-foreground" />
                  <span className="text-base font-medium text-foreground">Status</span>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 px-3 py-1">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IconMail className="w-6 h-6 text-muted-foreground" />
                  <span className="text-base font-medium text-foreground">Verificado</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 px-3 py-1">Sim</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IconPhone className="w-6 h-6 text-muted-foreground" />
                  <span className="text-base font-medium text-foreground">Último Login</span>
                </div>
                <span className="text-base text-foreground">Hoje, 14:30</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 