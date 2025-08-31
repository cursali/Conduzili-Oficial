import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('💥 FORCE DELETE AVATAR: Iniciando deleção forçada...');
    
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json({
        success: false,
        message: 'File path is required'
      });
    }

    console.log('💥 FORCE DELETE AVATAR: Deletando arquivo:', filePath);

    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        message: 'Environment variables not configured'
      });
    }

    // Criar cliente Supabase com service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // 1. Verificar se arquivo existe ANTES da deleção
    console.log('💥 FORCE DELETE AVATAR: Verificando arquivo ANTES da deleção...');
    const { data: filesBefore, error: listBeforeError } = await supabaseAdmin.storage
      .from('avatars')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        limit: 100,
        offset: 0
      });

    if (listBeforeError) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao listar arquivos antes da deleção',
        error: listBeforeError.message
      });
    }

    const fileName = filePath.split('/').pop();
    const fileExistsBefore = filesBefore?.some(file => file.name === fileName);
    
    console.log('💥 FORCE DELETE AVATAR: Arquivo existe antes da deleção:', fileExistsBefore);
    console.log('💥 FORCE DELETE AVATAR: Arquivos antes:', filesBefore?.map(f => f.name) || []);

    if (!fileExistsBefore) {
      return NextResponse.json({
        success: true,
        message: 'Arquivo já não existe',
        filePath,
        fileExistsBefore: false
      });
    }

    // 2. DELETAR o arquivo
    console.log('💥 FORCE DELETE AVATAR: Deletando arquivo...');
    const { error: deleteError } = await supabaseAdmin.storage
      .from('avatars')
      .remove([filePath]);

    if (deleteError) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao deletar arquivo',
        error: deleteError.message,
        filePath
      });
    }

    console.log('💥 FORCE DELETE AVATAR: Arquivo deletado, aguardando 2 segundos...');

    // 3. Aguardar um pouco para sincronização
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Verificar se arquivo existe DEPOIS da deleção
    console.log('💥 FORCE DELETE AVATAR: Verificando arquivo DEPOIS da deleção...');
    const { data: filesAfter, error: listAfterError } = await supabaseAdmin.storage
      .from('avatars')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        limit: 100,
        offset: 0
      });

    if (listAfterError) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao listar arquivos após deleção',
        error: listAfterError.message,
        filePath
      });
    }

    const fileExistsAfter = filesAfter?.some(file => file.name === fileName);
    
    console.log('💥 FORCE DELETE AVATAR: Arquivo existe após deleção:', fileExistsAfter);
    console.log('💥 FORCE DELETE AVATAR: Arquivos após:', filesAfter?.map(f => f.name) || []);

    // 5. Tentar download para confirmar
    console.log('💥 FORCE DELETE AVATAR: Tentando download para confirmar...');
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('avatars')
      .download(filePath);

    const downloadWorks = !downloadError && fileData;
    console.log('💥 FORCE DELETE AVATAR: Download funciona:', downloadWorks);

    const result = {
      success: true,
      message: fileExistsAfter ? 'Arquivo ainda existe após deleção' : 'Arquivo deletado com sucesso',
      filePath,
      fileName,
      before: {
        fileExists: fileExistsBefore,
        files: filesBefore?.map(f => f.name) || []
      },
      after: {
        fileExists: fileExistsAfter,
        files: filesAfter?.map(f => f.name) || []
      },
      download: {
        works: downloadWorks,
        error: downloadError?.message || null
      },
      deletionSuccessful: !fileExistsAfter && !downloadWorks
    };

    console.log('💥 FORCE DELETE AVATAR: Resultado:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 FORCE DELETE AVATAR: Erro inesperado:', error);
    
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
