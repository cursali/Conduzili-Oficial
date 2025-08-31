import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('🔍 DIAGNÓSTICO PROFUNDO: Iniciando análise completa...');
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        message: 'Variáveis de ambiente não configuradas',
        missing: {
          supabaseUrl: !supabaseUrl,
          serviceRoleKey: !serviceRoleKey
        }
      });
    }

    // Criar cliente Supabase com service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔍 DIAGNÓSTICO PROFUNDO: Cliente admin criado, iniciando análise...');

    const diagnostics = {
      environment: {
        supabaseUrl: supabaseUrl ? '✅ Configurado' : '❌ Não configurado',
        serviceRoleKey: serviceRoleKey ? '✅ Configurado' : '❌ Não configurado',
        keyLength: serviceRoleKey?.length || 0
      },
      bucket: {},
      policies: {},
      permissions: {
        list: {},
        upload: {},
        error: {}
      },
      testDeletion: {},
      normalClient: {}
    };

    // 1. ANALISAR BUCKET
    console.log('🔍 DIAGNÓSTICO PROFUNDO: Analisando bucket avatars...');
    try {
      const { data: bucketInfo, error: bucketError } = await supabaseAdmin.storage.getBucket('avatars');
      
      if (bucketError) {
        diagnostics.bucket = {
          exists: false,
          error: bucketError.message,
          status: '❌ Erro ao acessar bucket'
        };
      } else {
        diagnostics.bucket = {
          exists: true,
          name: bucketInfo.name,
          public: bucketInfo.public,
          fileSizeLimit: bucketInfo.file_size_limit,
          allowedMimeTypes: bucketInfo.allowed_mime_types,
          status: '✅ Bucket acessível'
        };
      }
    } catch (err) {
      diagnostics.bucket = {
        exists: false,
        error: err instanceof Error ? err.message : String(err),
        status: '❌ Exceção ao acessar bucket'
      };
    }

    // 2. ANALISAR POLÍTICAS RLS
    console.log('🔍 DIAGNÓSTICO PROFUNDO: Analisando políticas RLS...');
    try {
      const { data: policies, error: policiesError } = await supabaseAdmin
        .from('storage.policies')
        .select('*')
        .eq('bucket_id', 'avatars');

      if (policiesError) {
        diagnostics.policies = {
          error: policiesError.message,
          status: '❌ Erro ao listar políticas'
        };
      } else {
        diagnostics.policies = {
          count: policies?.length || 0,
          policies: policies || [],
          status: '✅ Políticas listadas'
        };
      }
    } catch (err) {
      diagnostics.policies = {
        error: err instanceof Error ? err.message : String(err),
        status: '❌ Exceção ao listar políticas'
      };
    }

    // 3. ANALISAR PERMISSÕES
    console.log('🔍 DIAGNÓSTICO PROFUNDO: Analisando permissões...');
    try {
      // Listar arquivos
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('avatars')
        .list('student-avatars', {
          limit: 10,
          offset: 0
        });

      if (listError) {
        diagnostics.permissions.list = {
          error: listError.message,
          status: '❌ Erro ao listar arquivos'
        };
      } else {
        diagnostics.permissions.list = {
          success: true,
          fileCount: files?.length || 0,
          files: files || [],
          status: '✅ Listagem funcionando'
        };
      }

      // Testar upload
      const testContent = `test-${Date.now()}`;
      const testFileName = `debug-test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(`student-avatars/${testFileName}`, testContent, {
          contentType: 'text/plain'
        });

      if (uploadError) {
        diagnostics.permissions.upload = {
          error: uploadError.message,
          status: '❌ Erro ao fazer upload'
        };
      } else {
        diagnostics.permissions.upload = {
          success: true,
          file: uploadData,
          status: '✅ Upload funcionando'
        };

        // Testar deleção do arquivo de teste
        console.log('🔍 DIAGNÓSTICO PROFUNDO: Testando deleção do arquivo de teste...');
        const { error: deleteError } = await supabaseAdmin.storage
          .from('avatars')
          .remove([`student-avatars/${testFileName}`]);

        if (deleteError) {
          diagnostics.testDeletion = {
            error: deleteError.message,
            status: '❌ Erro ao deletar arquivo de teste',
            details: deleteError
          };
        } else {
          // Verificar se realmente foi deletado
          const { data: checkFiles, error: checkError } = await supabaseAdmin.storage
            .from('avatars')
            .list('student-avatars', {
              limit: 10,
              offset: 0
            });

          if (checkError) {
            diagnostics.testDeletion = {
              error: checkError.message,
              status: '⚠️ Arquivo deletado mas erro ao verificar',
              details: checkError
            };
          } else {
            const fileStillExists = checkFiles?.some(file => file.name === testFileName);
            diagnostics.testDeletion = {
              success: !fileStillExists,
              fileStillExists,
              status: fileStillExists ? '❌ Arquivo ainda existe após deleção' : '✅ Arquivo deletado com sucesso',
              checkFiles: checkFiles || []
            };
          }
        }
      }

    } catch (err) {
      diagnostics.permissions.error = {
        error: err instanceof Error ? err.message : String(err),
        status: '❌ Exceção ao testar permissões'
      };
    }

    // 4. ANALISAR CLIENTE NORMAL (sem service role)
    console.log('🔍 DIAGNÓSTICO PROFUNDO: Analisando cliente normal...');
    try {
      const { supabase } = await import('@/lib/supabase');
      const supabaseNormal = supabase;
      
      // Testar listagem com cliente normal
      const { data: normalFiles, error: normalListError } = await supabaseNormal.storage
        .from('avatars')
        .list('student-avatars', {
          limit: 5,
          offset: 0
        });

      if (normalListError) {
        diagnostics.normalClient = {
          listError: normalListError.message,
          status: '❌ Cliente normal não consegue listar'
        };
      } else {
        diagnostics.normalClient = {
          listSuccess: true,
          fileCount: normalFiles?.length || 0,
          status: '✅ Cliente normal consegue listar'
        };
      }

    } catch (err) {
      diagnostics.normalClient = {
        error: err instanceof Error ? err.message : String(err),
        status: '❌ Exceção ao testar cliente normal'
      };
    }

    console.log('🔍 DIAGNÓSTICO PROFUNDO: Análise concluída!');

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico profundo concluído',
      timestamp: new Date().toISOString(),
      diagnostics
    });

  } catch (error) {
    console.error('🔍 DIAGNÓSTICO PROFUNDO: Erro inesperado:', error);
    
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
