import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 DELETE AVATAR ADMIN: Iniciando deleção com service role...');
    
    const { avatarUrl } = await request.json();
    
    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      );
    }

    console.log('🔐 DELETE AVATAR ADMIN: URL recebida:', avatarUrl);

    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('🔐 DELETE AVATAR ADMIN: Variáveis de ambiente não configuradas');
      return NextResponse.json(
        { error: 'Environment variables not configured' },
        { status: 500 }
      );
    }

    // Criar cliente Supabase com service role key (contorna RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔐 DELETE AVATAR ADMIN: Cliente admin criado, extraindo caminho do arquivo...');

    // Extrair o caminho do arquivo da URL
    let filePath = null;
    
    if (avatarUrl.includes('/storage/v1/object/public/')) {
      const urlParts = avatarUrl.split('/storage/v1/object/public/');
      if (urlParts.length === 2) {
        filePath = urlParts[1];
      }
    }
    
    if (!filePath && avatarUrl.includes('avatars/')) {
      filePath = avatarUrl;
    }
    
    if (!filePath) {
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName && fileName.includes('.')) {
        filePath = `avatars/${fileName}`;
      }
    }

    if (!filePath) {
      console.error('🔐 DELETE AVATAR ADMIN: Não foi possível extrair o caminho do arquivo');
      return NextResponse.json({
        success: false,
        message: 'Não foi possível extrair o caminho do arquivo do avatar'
      });
    }

    console.log('🔐 DELETE AVATAR ADMIN: Caminho extraído:', filePath);

    // Deletar usando o cliente admin (contorna RLS)
    console.log('🔐 DELETE AVATAR ADMIN: Deletando arquivo com cliente admin...');
    const { error } = await supabaseAdmin.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('🔐 DELETE AVATAR ADMIN: Erro ao deletar:', error);
      return NextResponse.json({
        success: false,
        message: `Erro ao deletar avatar: ${error.message}`,
        filePath
      });
    }

    console.log('🔐 DELETE AVATAR ADMIN: Arquivo deletado com sucesso!');

    // Verificar se realmente foi deletado
    console.log('🔐 DELETE AVATAR ADMIN: Verificando se arquivo foi realmente deletado...');
    
    // Extrair o diretório pai para listar
    const directoryPath = filePath.split('/').slice(0, -1).join('/');
    const fileName = filePath.split('/').pop();
    
    console.log('🔐 DELETE AVATAR ADMIN: Diretório para verificar:', directoryPath);
    console.log('🔐 DELETE AVATAR ADMIN: Nome do arquivo para verificar:', fileName);
    
    const { data: checkFiles, error: checkError } = await supabaseAdmin.storage
      .from('avatars')
      .list(directoryPath, {
        limit: 100,
        offset: 0
      });

    console.log('🔐 DELETE AVATAR ADMIN: Resposta da verificação:');
    console.log('🔐 DELETE AVATAR ADMIN: - checkError:', checkError);
    console.log('🔐 DELETE AVATAR ADMIN: - checkFiles:', checkFiles);

    if (checkError) {
      console.warn('🔐 DELETE AVATAR ADMIN: Erro ao verificar arquivos após deleção:', checkError);
      // Se não conseguir verificar, retornar erro para não mentir sobre o sucesso
      return NextResponse.json({
        success: false,
        message: 'Erro ao verificar se arquivo foi deletado',
        filePath,
        verificationError: checkError.message
      });
    } else {
      const fileStillExists = checkFiles?.some(file => file.name === fileName);
      console.log('🔐 DELETE AVATAR ADMIN: Arquivo ainda existe após deleção:', fileStillExists);
      
      if (fileStillExists) {
        console.warn('🔐 DELETE AVATAR ADMIN: ⚠️ Arquivo ainda existe após deleção!');
        return NextResponse.json({
          success: false,
          message: 'Arquivo não foi realmente deletado',
          filePath,
          fileStillExists: true,
          remainingFiles: checkFiles?.map(f => f.name) || []
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar deletado com sucesso do storage (via admin)',
      filePath
    });

  } catch (error) {
    console.error('🔐 DELETE AVATAR ADMIN: Erro inesperado:', error);
    
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
