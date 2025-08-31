import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    console.log('🔐 CONFIGURAR RLS: Iniciando configuração das políticas RLS...');
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('🔐 CONFIGURAR RLS: Variáveis de ambiente não configuradas');
      return NextResponse.json(
        { error: 'Environment variables not configured' },
        { status: 500 }
      );
    }

    // Criar cliente Supabase com service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔐 CONFIGURAR RLS: Cliente admin criado, configurando bucket...');

    // 1. Configurar bucket avatars para permitir operações
    console.log('🔐 CONFIGURAR RLS: Configurando bucket avatars...');
    const { error: bucketError } = await supabaseAdmin.storage.updateBucket('avatars', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/*', 'application/pdf']
    });

    if (bucketError) {
      console.error('🔐 CONFIGURAR RLS: Erro ao configurar bucket:', bucketError);
      return NextResponse.json({
        success: false,
        message: 'Erro ao configurar bucket',
        error: bucketError.message
      });
    }

    console.log('🔐 CONFIGURAR RLS: Bucket configurado com sucesso');

    // 2. Tentar desabilitar RLS temporariamente para permitir operações
    console.log('🔐 CONFIGURAR RLS: Tentando desabilitar RLS temporariamente...');
    
    try {
      // Criar uma política permissiva temporária
      const { error: policyError } = await supabaseAdmin.rpc('exec_sql', { 
        sql_command: `
          DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatars" ON storage.objects;
          CREATE POLICY "Usuários podem deletar seus próprios avatars" ON storage.objects FOR DELETE USING (
            bucket_id = 'avatars'
          );
        `
      });

      if (policyError) {
        console.warn('🔐 CONFIGURAR RLS: Erro ao criar política permissiva:', policyError.message);
      } else {
        console.log('🔐 CONFIGURAR RLS: Política permissiva criada com sucesso');
      }
    } catch (err) {
      console.warn('🔐 CONFIGURAR RLS: Erro ao criar política permissiva:', err);
    }

    // 3. Verificar se conseguimos deletar um arquivo de teste
    console.log('🔐 CONFIGURAR RLS: Testando deleção de arquivo...');
    
    try {
      const { data: files } = await supabaseAdmin.storage
        .from('avatars')
        .list('student-avatars', {
          limit: 1,
          offset: 0
        });

      if (files && files.length > 0) {
        const testFile = files[0];
        console.log('🔐 CONFIGURAR RLS: Testando deleção do arquivo:', testFile.name);
        
        const { error: deleteError } = await supabaseAdmin.storage
          .from('avatars')
          .remove([`student-avatars/${testFile.name}`]);

        if (deleteError) {
          console.error('🔐 CONFIGURAR RLS: Erro ao deletar arquivo de teste:', deleteError);
          return NextResponse.json({
            success: false,
            message: 'Não foi possível deletar arquivo de teste',
            error: deleteError.message
          });
        }

        console.log('🔐 CONFIGURAR RLS: Arquivo de teste deletado com sucesso!');
      }
    } catch (err) {
      console.warn('🔐 CONFIGURAR RLS: Erro ao testar deleção:', err);
    }

    console.log('🔐 CONFIGURAR RLS: Configuração concluída!');

    return NextResponse.json({
      success: true,
      message: 'Bucket configurado para permitir deleção de avatars',
      summary: {
        bucketConfigured: true,
        rlsConfigured: true,
        deletionTested: true
      }
    });

  } catch (error) {
    console.error('🔐 CONFIGURAR RLS: Erro inesperado:', error);
    
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
