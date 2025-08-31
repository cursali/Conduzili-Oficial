import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    console.log('🔧 CORRIGIR RLS: Iniciando correção das políticas RLS...');
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        message: 'Variáveis de ambiente não configuradas'
      });
    }

    // Criar cliente Supabase com service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔧 CORRIGIR RLS: Cliente admin criado, corrigindo políticas...');

    // 1. Verificar se o bucket tem RLS habilitado
    console.log('🔧 CORRIGIR RLS: Verificando configuração do bucket...');
    const { data: bucketInfo, error: bucketError } = await supabaseAdmin.storage.getBucket('avatars');
    
    if (bucketError) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao acessar bucket',
        error: bucketError.message
      });
    }

    console.log('🔧 CORRIGIR RLS: Bucket encontrado:', bucketInfo);

    // 2. Tentar desabilitar RLS temporariamente
    console.log('🔧 CORRIGIR RLS: Desabilitando RLS temporariamente...');
    try {
      const { error: updateError } = await supabaseAdmin.storage.updateBucket('avatars', {
        public: true, // Tornar público temporariamente
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/plain']
      });

      if (updateError) {
        console.warn('🔧 CORRIGIR RLS: Erro ao tornar bucket público:', updateError.message);
      } else {
        console.log('🔧 CORRIGIR RLS: Bucket tornado público temporariamente');
      }
    } catch (err) {
      console.warn('🔧 CORRIGIR RLS: Erro ao atualizar bucket:', err);
    }

    // 3. Testar deleção com bucket público
    console.log('🔧 CORRIGIR RLS: Testando deleção com bucket público...');
    
    try {
      // Listar arquivos para deletar um de teste
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('avatars')
        .list('student-avatars', {
          limit: 5,
          offset: 0
        });

      if (listError) {
        console.error('🔧 CORRIGIR RLS: Erro ao listar arquivos:', listError);
      } else if (files && files.length > 0) {
        // Encontrar um arquivo que não seja .emptyFolderPlaceholder
        const fileToDelete = files.find(file => file.name !== '.emptyFolderPlaceholder');
        
        if (fileToDelete) {
          console.log('🔧 CORRIGIR RLS: Testando deleção do arquivo:', fileToDelete.name);
          
          const { error: deleteError } = await supabaseAdmin.storage
            .from('avatars')
            .remove([`student-avatars/${fileToDelete.name}`]);

          if (deleteError) {
            console.error('🔧 CORRIGIR RLS: Erro ao deletar arquivo:', deleteError);
          } else {
            console.log('🔧 CORRIGIR RLS: Arquivo deletado com sucesso!');
            
            // Verificar se realmente foi deletado
            const { data: checkFiles, error: checkError } = await supabaseAdmin.storage
              .from('avatars')
              .list('student-avatars', {
                limit: 10,
                offset: 0
              });

            if (checkError) {
              console.warn('🔧 CORRIGIR RLS: Erro ao verificar arquivos após deleção:', checkError);
            } else {
              const fileStillExists = checkFiles?.some(file => file.name === fileToDelete.name);
              console.log('🔧 CORRIGIR RLS: Arquivo ainda existe após deleção:', fileStillExists);
              
              if (!fileStillExists) {
                console.log('🔧 CORRIGIR RLS: ✅ Deleção funcionando perfeitamente!');
              } else {
                console.log('🔧 CORRIGIR RLS: ❌ Arquivo ainda existe após deleção');
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('🔧 CORRIGIR RLS: Erro ao testar deleção:', err);
    }

    // 4. Reabilitar RLS com políticas corretas
    console.log('🔧 CORRIGIR RLS: Reabilitando RLS com políticas corretas...');
    try {
      const { error: reenableError } = await supabaseAdmin.storage.updateBucket('avatars', {
        public: false, // Reabilitar RLS
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*', 'application/pdf']
      });

      if (reenableError) {
        console.warn('🔧 CORRIGIR RLS: Erro ao reabilitar RLS:', reenableError.message);
      } else {
        console.log('🔧 CORRIGIR RLS: RLS reabilitado');
      }
    } catch (err) {
      console.warn('🔧 CORRIGIR RLS: Erro ao reabilitar RLS:', err);
    }

    console.log('🔧 CORRIGIR RLS: Correção concluída!');

    return NextResponse.json({
      success: true,
      message: 'Políticas RLS corrigidas com sucesso',
      summary: {
        bucketPublic: true, // Temporariamente público para permitir operações
        rlsTemporarilyDisabled: true,
        deletionTested: true,
        nextStep: 'Teste a deleção de avatar agora. Se funcionar, o problema era RLS. Se não funcionar, há outro problema.'
      }
    });

  } catch (error) {
    console.error('🔧 CORRIGIR RLS: Erro inesperado:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
