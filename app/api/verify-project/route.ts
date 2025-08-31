import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('🔍 VERIFICAR PROJETO: Iniciando verificação...');
    
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('🔍 VERIFICAR PROJETO: Variáveis encontradas:');
    console.log('🔍 VERIFICAR PROJETO: URL:', supabaseUrl);
    console.log('🔍 VERIFICAR PROJETO: Service Role Key (primeiros 20 chars):', serviceRoleKey?.substring(0, 20) + '...');
    console.log('🔍 VERIFICAR PROJETO: Anon Key (primeiros 20 chars):', anonKey?.substring(0, 20) + '...');

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

    console.log('🔍 VERIFICAR PROJETO: Cliente admin criado, verificando projeto...');

    // 1. Verificar informações do projeto
    const projectInfo = {
      url: supabaseUrl,
      projectId: supabaseUrl.split('//')[1]?.split('.')[0] || 'N/A',
      timestamp: new Date().toISOString()
    };

    // 2. Verificar se conseguimos acessar o bucket
    let bucketAccess = {};
    try {
      const { data: bucketInfo, error: bucketError } = await supabaseAdmin.storage.getBucket('avatars');
      
      if (bucketError) {
        bucketAccess = {
          accessible: false,
          error: bucketError.message,
          status: '❌ Erro ao acessar bucket'
        };
      } else {
        bucketAccess = {
          accessible: true,
          name: bucketInfo.name,
          public: bucketInfo.public,
          fileSizeLimit: bucketInfo.file_size_limit,
          allowedMimeTypes: bucketInfo.allowed_mime_types,
          status: '✅ Bucket acessível'
        };
      }
    } catch (err) {
      bucketAccess = {
        accessible: false,
        error: err instanceof Error ? err.message : String(err),
        status: '❌ Exceção ao acessar bucket'
      };
    }

    // 3. Listar TODOS os buckets disponíveis
    let allBuckets = {};
    try {
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
      
      if (bucketsError) {
        allBuckets = {
          error: bucketsError.message,
          status: '❌ Erro ao listar buckets'
        };
      } else {
        allBuckets = {
          count: buckets?.length || 0,
          buckets: buckets?.map(b => ({
            name: b.name,
            public: b.public,
            fileSizeLimit: b.file_size_limit
          })) || [],
          status: '✅ Buckets listados'
        };
      }
    } catch (err) {
      allBuckets = {
        error: err instanceof Error ? err.message : String(err),
        status: '❌ Exceção ao listar buckets'
      };
    }

    // 4. Listar arquivos em diferentes pastas para ver o que realmente existe
    let fileListing = {};
    try {
      // Tentar listar em diferentes pastas
      const folders = ['', 'student-avatars', 'avatars', 'profiles', 'users'];
      
      for (const folder of folders) {
        try {
          const { data: files, error: listError } = await supabaseAdmin.storage
            .from('avatars')
            .list(folder, {
              limit: 20,
              offset: 0
            });

          if (!listError && files && files.length > 0) {
            fileListing[folder] = {
              count: files.length,
              files: files.map(f => ({
                name: f.name,
                size: f.metadata?.size || 0,
                updated: f.updated_at
              }))
            };
          }
        } catch (folderErr) {
          // Ignorar erros de pastas que não existem
        }
      }
    } catch (err) {
      fileListing = {
        error: err instanceof Error ? err.message : String(err),
        status: '❌ Exceção ao listar arquivos'
      };
    }

    // 5. Verificar se conseguimos fazer uma operação básica
    let basicOperation: {
      upload?: boolean;
      delete?: boolean;
      error?: string;
      deleteError?: string;
      file?: unknown;
      status?: string;
    } = {};
    try {
      // Tentar criar um arquivo de teste
      const testContent = `test-${Date.now()}`;
      const testFileName = `project-verify-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(`test/${testFileName}`, testContent, {
          contentType: 'text/plain'
        });

      if (uploadError) {
        basicOperation = {
          upload: false,
          error: uploadError.message,
          status: '❌ Upload falhou'
        };
      } else {
        basicOperation = {
          upload: true,
          file: uploadData,
          status: '✅ Upload funcionando'
        };

        // Deletar o arquivo de teste
        const { error: deleteError } = await supabaseAdmin.storage
          .from('avatars')
          .remove([`test/${testFileName}`]);

        if (deleteError) {
          basicOperation.delete = false;
          basicOperation.deleteError = deleteError.message;
        } else {
          basicOperation.delete = true;
        }
      }
    } catch (err) {
      basicOperation = {
        error: err instanceof Error ? err.message : String(err),
        status: '❌ Exceção ao testar operações básicas'
      };
    }

    console.log('🔍 VERIFICAR PROJETO: Verificação concluída!');

    return NextResponse.json({
      success: true,
      message: 'Verificação do projeto concluída',
      timestamp: new Date().toISOString(),
      projectInfo,
      bucketAccess,
      allBuckets,
      fileListing,
      basicOperation,
      summary: 'Esta verificação mostra exatamente qual projeto Supabase está sendo usado e o que está acessível'
    });

  } catch (error) {
    console.error('🔍 VERIFICAR PROJETO: Erro inesperado:', error);
    
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
