import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 VERIFICAR ARQUIVO: Iniciando verificação...');
    
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json({
        success: false,
        message: 'File path is required'
      });
    }

    console.log('🔍 VERIFICAR ARQUIVO: Verificando arquivo:', filePath);

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

    // 1. Tentar fazer download do arquivo
    console.log('🔍 VERIFICAR ARQUIVO: Tentando download...');
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('avatars')
      .download(filePath);

    if (downloadError) {
      console.log('🔍 VERIFICAR ARQUIVO: Download falhou:', downloadError.message);
      
      // 2. Se download falhar, listar o diretório para ver se o arquivo aparece
      const directoryPath = filePath.split('/').slice(0, -1).join('/');
      const fileName = filePath.split('/').pop();
      
      console.log('🔍 VERIFICAR ARQUIVO: Listando diretório:', directoryPath);
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('avatars')
        .list(directoryPath, {
          limit: 100,
          offset: 0
        });

      if (listError) {
        return NextResponse.json({
          success: false,
          message: 'Erro ao listar diretório',
          error: listError.message,
          filePath,
          directoryPath
        });
      }

      const fileStillExists = files?.some(file => file.name === fileName);
      
      return NextResponse.json({
        success: true,
        fileExists: fileStillExists,
        message: fileStillExists ? 'Arquivo encontrado na listagem' : 'Arquivo não encontrado na listagem',
        filePath,
        directoryPath,
        fileName,
        downloadError: downloadError.message,
        filesInDirectory: files?.map(f => f.name) || [],
        fileStillExists
      });

    } else {
      // 3. Se download funcionar, arquivo existe
      console.log('🔍 VERIFICAR ARQUIVO: Download funcionou, arquivo existe');
      
      return NextResponse.json({
        success: true,
        fileExists: true,
        message: 'Arquivo existe e pode ser baixado',
        filePath,
        fileSize: fileData?.size || 0,
        fileType: fileData?.type || 'unknown'
      });
    }

  } catch (error) {
    console.error('🔍 VERIFICAR ARQUIVO: Erro inesperado:', error);
    
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
