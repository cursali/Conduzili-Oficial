'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/useToast';
import { Search, Plus, Edit, Trash2, User, Star, Users, Award } from 'lucide-react';
import { IconPhoto, IconCamera, IconMail, IconPhone, IconSchool, IconX, IconUser } from '@tabler/icons-react';

// Interface para o instrutor
interface Instructor {
  id: string;
  profile_id: string;
  school_id: string;
  license: string;
  functions: string[];
  students_count: number;
  rating: number;
  is_active: boolean;
  hired_date: string;
  status: string;
  auth_user_id: string;
  // Campos do perfil (via join)
  instructor_name?: string;
  instructor_email?: string;
  instructor_phone?: string;
  instructor_avatar?: string;
  avatar_url?: string;
}

// Interface para o formulário
interface InstructorFormData {
  name: string;
  email: string;
  phone: string;
  license: string;
  function: 'theoretical' | 'practical' | 'both';
  status: boolean;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [formData, setFormData] = useState<InstructorFormData>({
    name: '',
    email: '',
    phone: '',
    license: '',
    function: 'theoretical',
    status: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const toast = useToast();

  // Buscar instrutores
  const fetchInstructors = useCallback(async () => {
    try {
      console.log('🔍 Buscando instrutores...');
      setLoading(true);
      
      // Buscar instrutores com dados do perfil
      const { data: instructorsData, error: instructorsError } = await supabase
        .from('instructors')
        .select(`
          *,
          profiles!instructors_profile_id_fkey (
            name,
            email,
            phone,
            avatar_url
          )
        `);

      console.log('📊 Dados brutos recebidos:', instructorsData);
      console.log('❌ Erro (se houver):', instructorsError);

      if (instructorsError) {
        console.error('Erro ao buscar instrutores:', instructorsError);
        toast.error('Falha ao carregar instrutores');
        return;
      }

      // Mapear dados para o formato da interface
      const mappedInstructors = instructorsData?.map(instructor => ({
        ...instructor,
        instructor_name: instructor.profiles?.name,
        instructor_email: instructor.profiles?.email,
        instructor_phone: instructor.profiles?.phone,
        instructor_avatar: instructor.profiles?.avatar_url,
        avatar_url: instructor.profiles?.avatar_url
      })) || [];

      console.log('✅ Instrutores mapeados:', mappedInstructors);
      setInstructors(mappedInstructors);
    } catch (error) {
      console.error('Erro ao buscar instrutores:', error);
      toast.error('Falha ao carregar instrutores');
    } finally {
      console.log('🏁 Finalizando busca de instrutores');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, []);

  // Filtrar instrutores por termo de busca
  const filteredInstructors = instructors.filter(instructor =>
    instructor.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.instructor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.license.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      license: '',
      function: 'theoretical',
      status: true
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  // Abrir modal de edição
  const openEditModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setFormData({
      name: instructor.instructor_name || '',
      email: instructor.instructor_email || '',
      phone: instructor.instructor_phone || '',
      license: instructor.license || '',
      function: instructor.functions?.includes('theoretical') ? 'theoretical' : 
                instructor.functions?.includes('practical') ? 'practical' : 
                instructor.functions?.includes('both') ? 'both' : 'theoretical',
      status: instructor.status === 'active'
    });
    setImagePreview(instructor.instructor_avatar || '');
    setIsEditModalOpen(true);
  };

  // Abrir modal de exclusão
  const openDeleteModal = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsDeleteModalOpen(true);
  };

  // Fechar modais
  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedInstructor(null);
    resetForm();
  };

  // Selecionar imagem
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Atualizar função


  // Adicionar instrutor
  const handleAddInstructor = async () => {
    try {
      if (!formData.name || !formData.email || !formData.license) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // 1. Criar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'instructor',
          status: 'active'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        toast.error('Falha ao criar perfil do instrutor');
        return;
      }

      // 2. Upload da imagem se selecionada
      let avatarUrl = '';
      if (selectedImage) {
        const fileName = `${Date.now()}-${selectedImage.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`instructor-avatars/${fileName}`, selectedImage);

        if (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(`instructor-avatars/${fileName}`);
          avatarUrl = urlData.publicUrl;
        }
      }

      // 3. Atualizar perfil com avatar
      if (avatarUrl) {
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', profileData.id);
      }

      // 4. Criar instrutor
      const { error: instructorError } = await supabase
        .from('instructors')
        .insert({
          profile_id: profileData.id,
          license: formData.license,
          functions: [formData.function],
          status: formData.status ? 'active' : 'inactive',
          is_active: true
        });

      if (instructorError) {
        console.error('Erro ao criar instrutor:', instructorError);
        toast.error('Falha ao criar instrutor');
        return;
      }

              toast.success('Instrutor criado com sucesso!');

      closeModals();
      fetchInstructors();
    } catch (error) {
      console.error('Erro ao criar instrutor:', error);
      toast.error('Falha ao criar instrutor');
    }
  };

  // Editar instrutor
  const handleEditInstructor = async () => {
    if (!selectedInstructor) return;

    try {
      // 1. Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
        .eq('id', selectedInstructor.profile_id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        toast.error('Falha ao atualizar perfil do instrutor');
        return;
      }

      // 2. Upload da nova imagem se selecionada
      if (selectedImage) {
        const fileName = `${Date.now()}-${selectedImage.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`instructor-avatars/${fileName}`, selectedImage);

        if (uploadError) {
          console.error('Erro ao fazer upload da imagem:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(`instructor-avatars/${fileName}`);
          
          // Atualizar perfil com nova imagem
          await supabase
            .from('profiles')
            .update({ avatar_url: urlData.publicUrl })
            .eq('id', selectedInstructor.profile_id);
        }
      }

      // 3. Atualizar instrutor
      const { error: instructorError } = await supabase
        .from('instructors')
        .update({
          license: formData.license,
          functions: [formData.function],
          status: formData.status ? 'active' : 'inactive'
        })
        .eq('id', selectedInstructor.id);

      if (instructorError) {
        console.error('Erro ao atualizar instrutor:', instructorError);
        toast.error('Falha ao atualizar instrutor');
        return;
      }

      toast.success('Instrutor atualizado com sucesso!');

      closeModals();
      fetchInstructors();
    } catch (error) {
      console.error('Erro ao atualizar instrutor:', error);
      toast.error('Falha ao atualizar instrutor');
    }
  };

  // Deletar instrutor
  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return;

    try {
      // 1. Deletar avatar se existir
      if (selectedInstructor.avatar_url) {
        try {
          const response = await fetch('/api/delete-avatar-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ avatarUrl: selectedInstructor.avatar_url })
          });

          if (response.ok) {
            console.log('Avatar deletado com sucesso');
          }
        } catch (error) {
          console.warn('Erro ao deletar avatar:', error);
        }
      }

      // 2. Deletar dados relacionados
      try {
        // Deletar aulas
        await supabase.from('lessons').delete().eq('instructor_id', selectedInstructor.id);
        
        // Deletar classes
        await supabase.from('classes').delete().eq('instructor_id', selectedInstructor.id);
        
        // Deletar funções (não há tabela separada para funções)
      } catch (relatedDataError) {
        console.warn('Erro ao deletar dados relacionados:', relatedDataError);
      }

      // 3. Deletar instrutor
      const { error: instructorError } = await supabase
        .from('instructors')
        .delete()
        .eq('id', selectedInstructor.id);

      if (instructorError) {
        console.error('Erro ao deletar instrutor:', instructorError);
        throw instructorError;
      }

      // 4. Deletar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedInstructor.profile_id);

      if (profileError) {
        console.warn('Erro ao deletar perfil:', profileError);
      }

      // 5. Deletar usuário do Auth se existir
      if (selectedInstructor.auth_user_id) {
        try {
          const response = await fetch('/api/delete-user-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: selectedInstructor.auth_user_id })
          });

          if (response.ok) {
            console.log('Usuário deletado do Auth com sucesso');
          }
        } catch (authErr) {
          console.warn('Erro ao deletar usuário do Auth:', authErr);
        }
      }

      toast.success('Instrutor deletado com sucesso!');

      closeModals();
      fetchInstructors();
    } catch (error) {
      console.error('Erro ao deletar instrutor:', error);
      toast.error('Falha ao deletar instrutor');
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Carregando instrutores...</p>
        </div>
      </div>
    );
  }

  // Se não há instrutores, mostrar mensagem
  if (instructors.length === 0) {
    return (
      <div className="flex flex-col gap-6 py-6">
        {/* Header da Página */}
        <div className="px-6 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Instrutores</h1>
          <p className="text-muted-foreground">Gerencie os instrutores da sua escola de condução</p>
        </div>

        {/* Conteúdo Principal */}
        <div className="px-6 max-w-[95%] mx-auto w-full">
          {/* Mensagem de estado vazio */}
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum instrutor encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando seu primeiro instrutor
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-0" />
                Adicionar Instrutor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal de Adicionar Instrutor */}
        <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen} modal={true}>
          <SheetContent 
            className="w-full sm:max-w-2xl overflow-hidden [&>button]:hidden"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <SheetHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle>Adicionar Novo Instrutor</SheetTitle>
                  <SheetDescription>
                    Preencha as informações para cadastrar um novo instrutor no sistema.
                  </SheetDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-12 w-12 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                >
                  <IconX className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </Button>
              </div>
            </SheetHeader>
            <div className="space-y-6 py-6 px-6 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              <form onSubmit={(e) => { e.preventDefault(); handleAddInstructor(); }}>
                <div className="space-y-6">
                  {/* Campo de Foto */}
                  <div className="space-y-4 flex flex-col items-center">
                    <Label htmlFor="avatar" className="flex items-center gap-2 text-xl font-semibold text-center">
                      <IconPhoto className="w-6 h-6 text-primary" />
                      Foto do Instrutor
                    </Label>
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <Avatar className="w-32 h-32 border-3 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200 shadow-lg">
                          {imagePreview ? (
                            <AvatarImage src={imagePreview} alt="Foto do instrutor" />
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
                          onChange={handleImageSelect}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nome */}
                  <div className="relative">
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder=" "
                      className="text-lg h-12 pl-12 peer"
                    />
                    <Label 
                      htmlFor="name" 
                      className="absolute left-12 top-3 text-base text-muted-foreground"
                    >
                      Nome Completo *
                    </Label>
                    <IconUser className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder=" "
                      className="text-lg h-12 pl-12 peer"
                    />
                    <Label 
                      htmlFor="email" 
                      className="absolute left-12 top-3 text-base text-muted-foreground"
                    >
                      Email *
                    </Label>
                    <IconMail className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                  </div>

                  {/* Telefone */}
                  <div className="relative">
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder=" "
                      className="text-lg h-12 pl-12 peer"
                    />
                    <Label 
                      htmlFor="phone" 
                      className="absolute left-12 top-3 text-base text-muted-foreground"
                    >
                      Telefone
                    </Label>
                    <IconPhone className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                  </div>

                  {/* Licença */}
                  <div className="relative">
                    <Input
                      id="license"
                      value={formData.license}
                      onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                      placeholder=" "
                      className="text-lg h-12 pl-12 peer"
                    />
                    <Label 
                      htmlFor="license" 
                      className="absolute left-12 top-3 text-base text-muted-foreground"
                    >
                      Número da Licença *
                    </Label>
                    <IconSchool className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                  </div>

                  {/* Funções */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Funções
                    </Label>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="theoretical"
                          name="function"
                          value="theoretical"
                          checked={formData.function === 'theoretical'}
                          onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                          className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                        />
                        <Label htmlFor="theoretical" className="text-sm font-medium text-foreground cursor-pointer">
                          Aula teórica
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="practical"
                          name="function"
                          value="practical"
                          checked={formData.function === 'practical'}
                          onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                          className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                        />
                        <Label htmlFor="practical" className="text-sm font-medium text-foreground cursor-pointer">
                          Aula prática
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="both"
                          name="function"
                          value="both"
                          checked={formData.function === 'both'}
                          onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                          className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                        />
                        <Label htmlFor="both" className="text-sm font-medium text-foreground cursor-pointer">
                          Aula teórica e prática
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Status
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="status"
                        checked={formData.status}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                      />
                      <Label htmlFor="status" className="text-sm font-medium">
                        {formData.status ? 'Ativo' : 'Inativo'}
                      </Label>
                    </div>
                  </div>
                </div>

                <SheetFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    Adicionar Instrutor
                  </Button>
                </SheetFooter>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header da Página */}
      <div className="px-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Instrutores</h1>
        <p className="text-muted-foreground">Gerencie os instrutores da sua escola de condução</p>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-6 max-w-[95%] mx-auto w-full">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{instructors.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Instrutores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {instructors.filter(i => i.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Instrutores Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {instructors.length > 0 
                      ? (instructors.reduce((acc, i) => acc + (i.rating || 0), 0) / instructors.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Média de Avaliação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {instructors.reduce((acc, i) => acc + (i.students_count || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total de Estudantes</p>
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar instrutores por nome, email ou licença..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Instrutor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mensagem quando não há instrutores */}
        {filteredInstructors.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum instrutor encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro instrutor'
                }
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-0" />
                Adicionar Instrutor
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Grid de Instrutores */}
        {filteredInstructors.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredInstructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={instructor.instructor_avatar} alt={instructor.instructor_name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                          {instructor.instructor_name?.charAt(0) || 'I'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{instructor.instructor_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{instructor.instructor_email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(instructor)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteModal(instructor)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Status e Licença */}
                  <div className="flex items-center justify-between">
                    <Badge className={instructor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {instructor.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {instructor.license}
                    </Badge>
                  </div>

                  {/* Funções */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>Funções:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {instructor.functions?.includes('theoretical') && (
                        <Badge variant="secondary" className="text-xs">
                          Aula teórica
                        </Badge>
                      )}
                      {instructor.functions?.includes('practical') && (
                        <Badge variant="secondary" className="text-xs">
                          Aula prática
                        </Badge>
                      )}
                      {instructor.functions?.includes('both') && (
                        <Badge variant="secondary" className="text-xs">
                          Aula teórica e prática
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <Star className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Avaliação</p>
                      <p className="text-sm font-medium">{instructor.rating || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Estudantes</p>
                      <p className="text-sm font-medium">{instructor.students_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Adicionar Instrutor */}
        <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen} modal={true}>
          <SheetContent 
            className="w-full sm:max-w-2xl overflow-hidden [&>button]:hidden"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <SheetHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle>Adicionar Novo Instrutor</SheetTitle>
                  <SheetDescription>
                    Preencha as informações para cadastrar um novo instrutor no sistema.
                  </SheetDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModals}
                  className="h-12 w-12 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                >
                  <span className="sr-only">Fechar</span>
                  <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">×</span>
                </Button>
              </div>
            </SheetHeader>
            
            <div className="space-y-6 py-6 px-6 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              <div className="space-y-4 flex flex-col items-center">
                <Label htmlFor="avatar" className="flex items-center gap-2 text-xl font-semibold text-center">
                  <IconPhoto className="w-6 h-6 text-primary" />
                  Foto do Instrutor
                </Label>
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-3 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200 shadow-lg">
                      {imagePreview ? (
                        <AvatarImage src={imagePreview} alt="Foto do instrutor" />
                      ) : (
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
                          <User className="w-16 h-16" />
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
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div className="relative">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder=" "
                  className="text-lg h-12 pl-12 peer"
                />
                <Label 
                  htmlFor="name" 
                  className={`absolute left-12 transition-all duration-200 ${
                    formData.name 
                      ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                      : 'top-3 text-base text-muted-foreground'
                  }`}
                >
                  Nome Completo *
                </Label>
                <User className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
              </div>
              
              {/* Email */}
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder=" "
                  className="text-lg h-12 pl-12 peer"
                />
                <Label 
                  htmlFor="email" 
                  className={`absolute left-12 transition-all duration-200 ${
                    formData.email 
                      ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                      : 'top-3 text-base text-muted-foreground'
                  }`}
                >
                  Email *
                </Label>
                <IconMail className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
              </div>
              
              {/* Telefone */}
              <div className="relative">
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder=" "
                  className="text-lg h-12 pl-12 peer"
                />
                <Label 
                  htmlFor="phone" 
                  className={`absolute left-12 transition-all duration-200 ${
                    formData.phone 
                      ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                      : 'top-3 text-base text-muted-foreground'
                  }`}
                >
                  Telefone
                </Label>
                <IconPhone className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
              </div>
              
              {/* Licença */}
              <div className="relative">
                <Input
                  id="license"
                  value={formData.license}
                  onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                  placeholder=" "
                  className="text-lg h-12 pl-12 peer"
                />
                <Label 
                  htmlFor="license" 
                  className={`absolute left-12 transition-all duration-200 ${
                    formData.license 
                      ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                      : 'top-3 text-base text-muted-foreground'
                  }`}
                >
                  Número da Licença *
                </Label>
                <IconSchool className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
              </div>

              {/* Funções */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Award className="w-4 h-4" />
                  Funções
                </Label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="theoretical"
                      name="function"
                      value="theoretical"
                      checked={formData.function === 'theoretical'}
                      onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                      className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                    />
                    <Label htmlFor="theoretical" className="text-sm font-medium text-foreground cursor-pointer">
                      Aula teórica
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="practical"
                      name="function"
                      value="practical"
                      checked={formData.function === 'practical'}
                      onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                      className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                    />
                    <Label htmlFor="practical" className="text-sm font-medium text-foreground cursor-pointer">
                      Aula prática
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="both"
                      name="function"
                      value="both"
                      checked={formData.function === 'both'}
                      onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                      className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                    />
                    <Label htmlFor="both" className="text-sm font-medium text-foreground cursor-pointer">
                      Aula teórica e prática
                    </Label>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className="text-primary">⚡</span>
                  Status
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                  />
                  <Label htmlFor="status" className="text-sm font-medium">
                    {formData.status ? 'Ativo' : 'Inativo'}
                  </Label>
                </div>
              </div>
            </div>
            
            <SheetFooter className="pt-4 flex flex-row gap-4 justify-between items-center w-full">
              <Button variant="outline" onClick={closeModals} className="flex items-center gap-2 h-12 px-6 min-w-[140px] flex-shrink-0">
                <span>✕</span>
                Cancelar
              </Button>
              <Button onClick={handleAddInstructor} disabled={!formData.name || !formData.email || !formData.license} className="flex items-center gap-2 h-12 px-8 text-base flex-1">
                <Plus className="w-5 h-5" />
                Adicionar Instrutor
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Modal Editar Instrutor */}
        <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen} modal={true}>
          <SheetContent 
            className="w-full sm:max-w-2xl overflow-hidden [&>button]:hidden"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <SheetHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle>Editar Instrutor</SheetTitle>
                  <SheetDescription>
                    Atualize as informações do instrutor selecionado.
                  </SheetDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModals}
                  className="h-12 w-12 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                >
                  <span className="sr-only">Fechar</span>
                  <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">×</span>
                </Button>
              </div>
            </SheetHeader>
            
            <div className="space-y-6 py-6 px-6 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              <div className="space-y-4 flex flex-col items-center">
                <Label htmlFor="edit-avatar" className="flex items-center gap-2 text-xl font-semibold text-center">
                  <IconPhoto className="w-6 h-6 text-primary" />
                  Foto do Instrutor
                </Label>
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-3 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200 shadow-lg">
                      {imagePreview ? (
                        <AvatarImage src={imagePreview} alt="Foto do instrutor" />
                      ) : (
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary">
                          <User className="w-16 h-16" />
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
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div className="relative">
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder=" "
                  className="text-lg h-12 pl-12 peer"
                />
                <Label 
                  htmlFor="edit-name" 
                  className={`absolute left-12 transition-all duration-200 ${
                    formData.name 
                      ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                      : 'top-3 text-base text-muted-foreground'
                  }`}
                >
                  Nome Completo *
                </Label>
                <User className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
              </div>
              
              {/* Email */}
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
                    formData.email 
                      ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                      : 'top-3 text-base text-muted-foreground'
                  }`}
                >
                  Email *
                </Label>
                <IconMail className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado</p>
              </div>
              
              {/* Telefone */}
              <div className="relative">
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder=" "
                  className="text-lg h-12 pl-12 peer"
                />
                <Label 
                  htmlFor="edit-phone" 
                  className={`absolute left-12 transition-all duration-200 ${
                    formData.phone 
                      ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                      : 'top-3 text-base text-muted-foreground'
                  }`}
                >
                  Telefone
                </Label>
                <IconPhone className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
              </div>
              
              {/* Licença */}
              <div className="relative">
                <Input
                  id="edit-license"
                  value={formData.license}
                  onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                  placeholder=" "
                  className="text-lg h-12 pl-12 peer"
                />
                <Label 
                  htmlFor="edit-license" 
                  className={`absolute left-12 transition-all duration-200 ${
                    formData.license 
                      ? '-top-2 text-sm bg-background px-2 text-muted-foreground' 
                      : 'top-3 text-base text-muted-foreground'
                  }`}
                >
                  Número da Licença *
                </Label>
                <IconSchool className="absolute left-3 top-3 w-6 h-6 text-muted-foreground" />
              </div>

              {/* Funções */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Award className="w-4 h-4" />
                  Funções
                </Label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="edit-theoretical"
                      name="edit-function"
                      value="theoretical"
                      checked={formData.function === 'theoretical'}
                      onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                      className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                    />
                    <Label htmlFor="edit-theoretical" className="text-sm font-medium text-foreground cursor-pointer">
                      Aula teórica
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="edit-practical"
                      name="edit-function"
                      value="practical"
                      checked={formData.function === 'practical'}
                      onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                      className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                    />
                    <Label htmlFor="edit-practical" className="text-sm font-medium text-foreground cursor-pointer">
                      Aula prática
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="edit-both"
                      name="edit-function"
                      value="both"
                      checked={formData.function === 'both'}
                      onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value as 'theoretical' | 'practical' | 'both' }))}
                      className="w-4 h-4 text-primary bg-background border-2 border-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                    />
                    <Label htmlFor="edit-both" className="text-sm font-medium text-foreground cursor-pointer">
                      Aula teórica e prática
                    </Label>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <Label htmlFor="edit-status" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span className="text-primary">⚡</span>
                  Status
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-status"
                    checked={formData.status}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked }))}
                  />
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    {formData.status ? 'Ativo' : 'Inativo'}
                  </Label>
                </div>
              </div>
            </div>
            
            <SheetFooter className="pt-4 flex flex-row gap-4 justify-between items-center w-full">
              <Button variant="outline" onClick={closeModals} className="flex items-center gap-2 h-12 px-6 min-w-[140px] flex-shrink-0">
                <span>✕</span>
                Cancelar
              </Button>
              <Button onClick={handleEditInstructor} disabled={!formData.name || !formData.license} className="flex items-center gap-2 h-12 px-8 text-base flex-1">
                <span>💾</span>
                Salvar Alterações
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Modal Confirmar Exclusão */}
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
                    Tem certeza que deseja deletar permanentemente o instrutor <strong>{selectedInstructor?.instructor_name}</strong>?
                    <br />
                    <br />
                    <span className="text-red-600 dark:text-red-400 font-semibold">⚠️ ATENÇÃO:</span> Esta ação é irreversível e irá deletar completamente todos os dados do instrutor do sistema, incluindo perfil, aulas, classes e conta de usuário.
                  </SheetDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModals}
                  className="h-12 w-12 p-0 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors flex-shrink-0 ml-4"
                >
                  <span className="sr-only">Fechar</span>
                  <span className="text-blue-600 dark:text-blue-400 text-lg font-bold">×</span>
                </Button>
              </div>
            </SheetHeader>
            
            <SheetFooter className="flex flex-row gap-4 justify-between items-center pt-6 w-full">
              <Button variant="outline" onClick={closeModals} className="flex items-center gap-2 h-12 px-6 min-w-[140px] flex-shrink-0">
                <span>✕</span>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteInstructor}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2 h-12 px-8 flex-1"
              >
                <Trash2 className="w-5 h-5" />
                Sim, Deletar Instrutor
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
