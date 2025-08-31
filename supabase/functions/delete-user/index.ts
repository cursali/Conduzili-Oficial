// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 EDGE FUNCTION: Iniciando...');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🚀 EDGE FUNCTION: Respondendo OPTIONS');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 EDGE FUNCTION: Processando requisição POST');
    
    // Verificar autorização
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('🚀 EDGE FUNCTION: Header de autorização inválido');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar chave anônima
    const providedKey = authHeader.replace('Bearer ', '');
    const expectedKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!expectedKey || providedKey !== expectedKey) {
      console.error('🚀 EDGE FUNCTION: Chave de autorização inválida');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🚀 EDGE FUNCTION: Autorização válida, processando dados...');
    
    // Obter dados da requisição
    const { userId, deleteType = 'user' } = await req.json();
    console.log('🚀 EDGE FUNCTION: User ID:', userId, 'Tipo:', deleteType);

    if (!userId) {
      console.error('🚀 EDGE FUNCTION: User ID não fornecido');
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🚀 EDGE FUNCTION: Supabase URL:', supabaseUrl ? '✅ Configurada' : '❌ NÃO configurada');
    console.log('🚀 EDGE FUNCTION: Service Role Key:', serviceRoleKey ? '✅ Configurada' : '❌ NÃO configurada');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('🚀 EDGE FUNCTION: Variáveis de ambiente não configuradas');
      return new Response(
        JSON.stringify({ error: 'Environment variables not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🚀 EDGE FUNCTION: Criando cliente Supabase...');
    
    // Criar cliente Supabase
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🚀 EDGE FUNCTION: Cliente criado, iniciando deleção...');

    let results = {
      avatarDeleted: false,
      relatedDataDeleted: false,
      authDeleted: false,
      details: {}
    };

    // 1. Buscar e deletar avatar
    try {
      console.log('🚀 EDGE FUNCTION: Buscando avatar...');
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profileData?.avatar_url) {
        console.log('🚀 EDGE FUNCTION: Avatar encontrado, deletando...');
        
        // Extrair caminho do arquivo
        let filePath = null;
        if (profileData.avatar_url.includes('/storage/v1/object/public/')) {
          const urlParts = profileData.avatar_url.split('/storage/v1/object/public/');
          if (urlParts.length === 2) {
            filePath = urlParts[1];
          }
        }
        
        if (filePath) {
          const { error: storageError } = await supabaseClient.storage
            .from('avatars')
            .remove([filePath]);
          
          if (!storageError) {
            console.log('🚀 EDGE FUNCTION: Avatar deletado com sucesso');
            results.avatarDeleted = true;
          } else {
            console.warn('🚀 EDGE FUNCTION: Erro ao deletar avatar:', storageError);
          }
        }
      }
    } catch (avatarError) {
      console.warn('🚀 EDGE FUNCTION: Erro ao processar avatar:', avatarError);
    }

    // 2. Deletar dados relacionados
    try {
      console.log('🚀 EDGE FUNCTION: Deletando dados relacionados...');
      
      if (deleteType === 'student' || deleteType === 'user') {
        const { data: studentData } = await supabaseClient
          .from('students')
          .select('id')
          .eq('profile_id', userId)
          .single();

        if (studentData) {
          console.log('🚀 EDGE FUNCTION: Deletando dados de estudante...');
          
          // Deletar categorias de licença
          await supabaseClient.from('student_license_categories').delete().eq('student_id', studentData.id);
          
          // Deletar documentos de matrícula
          const { data: docs } = await supabaseClient.from('enrollment_documents').select('file_path').eq('student_id', studentData.id);
          if (docs && docs.length > 0) {
            const paths = docs.map(d => d?.file_path).filter(p => typeof p === 'string' && p.length > 0);
            if (paths.length > 0) {
              await supabaseClient.storage.from('enrollment-documents').remove(paths);
            }
            await supabaseClient.from('enrollment_documents').delete().eq('student_id', studentData.id);
          }
          
          // Deletar estudante
          await supabaseClient.from('students').delete().eq('id', studentData.id);
          
          results.relatedDataDeleted = true;
          results.details.studentDataDeleted = true;
        }
      }

      if (deleteType === 'instructor' || deleteType === 'user') {
        const { data: instructorData } = await supabaseClient
          .from('instructors')
          .select('id')
          .eq('profile_id', userId)
          .single();

        if (instructorData) {
          console.log('🚀 EDGE FUNCTION: Deletando dados de instrutor...');
          
          // Deletar especialidades
          await supabaseClient.from('instructor_specialties').delete().eq('instructor_id', instructorData.id);
          
          // Deletar instrutor
          await supabaseClient.from('instructors').delete().eq('id', instructorData.id);
          
          results.relatedDataDeleted = true;
          results.details.instructorDataDeleted = true;
        }
      }
    } catch (relatedDataError) {
      console.warn('🚀 EDGE FUNCTION: Erro ao deletar dados relacionados:', relatedDataError);
    }

    // 3. Deletar usuário do Auth
    try {
      console.log('🚀 EDGE FUNCTION: Deletando usuário do Auth...');
      const { error } = await supabaseClient.auth.admin.deleteUser(userId);

      if (error) {
        console.error('🚀 EDGE FUNCTION: Erro ao deletar usuário do Auth:', error);
        return new Response(
          JSON.stringify({ 
            error: error.message,
            avatarDeleted: results.avatarDeleted,
            relatedDataDeleted: results.relatedDataDeleted,
            authDeleted: false,
            partial: true,
            details: results.details
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('🚀 EDGE FUNCTION: Usuário deletado com sucesso do Auth');
      results.authDeleted = true;

    } catch (authError) {
      console.error('🚀 EDGE FUNCTION: Erro ao deletar usuário do Auth:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao deletar usuário do Auth',
          avatarDeleted: results.avatarDeleted,
          relatedDataDeleted: results.relatedDataDeleted,
          authDeleted: false,
          partial: true,
          details: results.details
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 4. Retornar sucesso
    console.log('🚀 EDGE FUNCTION: Operação concluída com sucesso!');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User deleted successfully',
        avatarDeleted: results.avatarDeleted,
        relatedDataDeleted: results.relatedDataDeleted,
        authDeleted: results.authDeleted,
        details: results.details
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('🚀 EDGE FUNCTION: Erro inesperado:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'Erro interno do servidor',
        avatarDeleted: false,
        relatedDataDeleted: false,
        authDeleted: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
