import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Iniciando teste...');
    
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

    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Cliente admin criado, testando deleção...');

    // 1. Primeiro, listar o que existe
    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Listando arquivos antes da deleção...');
    const { data: filesBefore, error: listError } = await supabaseAdmin.storage
      .from('avatars')
      .list('student-avatars', {
        limit: 10,
        offset: 0
      });

    if (listError) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao listar arquivos',
        error: listError.message
      });
    }

    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Arquivos encontrados:', filesBefore);

    // 2. Encontrar o arquivo SVG para deletar
    const svgFile = filesBefore?.find(file => file.name.endsWith('.svg'));
    
    if (!svgFile) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum arquivo SVG encontrado para deletar',
        files: filesBefore
      });
    }

    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Arquivo SVG encontrado:', svgFile.name);

    // 3. Tentar deletar o arquivo específico
    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Tentando deletar:', svgFile.name);
    
    const { error: deleteError } = await supabaseAdmin.storage
      .from('avatars')
      .remove([`student-avatars/${svgFile.name}`]);

    if (deleteError) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao deletar arquivo',
        error: deleteError.message,
        file: svgFile.name
      });
    }

    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Arquivo deletado, verificando...');

    // 4. Verificar se realmente foi deletado
    const { data: filesAfter, error: checkError } = await supabaseAdmin.storage
      .from('avatars')
      .list('student-avatars', {
        limit: 10,
        offset: 0
      });

    if (checkError) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao verificar arquivos após deleção',
        error: checkError.message
      });
    }

    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Arquivos após deleção:', filesAfter);

    // 5. Verificar se o arquivo ainda existe
    const fileStillExists = filesAfter?.some(file => file.name === svgFile.name);
    
    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Arquivo ainda existe?', fileStillExists);

    // 6. Tentar acessar o arquivo diretamente para confirmar
    let directAccess = 'N/A';
    try {
      const { data: fileData, error: accessError } = await supabaseAdmin.storage
        .from('avatars')
        .download(`student-avatars/${svgFile.name}`);

      if (accessError) {
        directAccess = `Erro: ${accessError.message}`;
      } else {
        directAccess = `Arquivo ainda acessível (${fileData?.size || 0} bytes)`;
      }
    } catch (err) {
      directAccess = `Exceção: ${err instanceof Error ? err.message : String(err)}`;
    }

    const result = {
      success: !fileStillExists,
      message: fileStillExists ? 'Arquivo ainda existe após deleção' : 'Arquivo deletado com sucesso',
      file: svgFile.name,
      before: {
        count: filesBefore?.length || 0,
        files: filesBefore?.map(f => f.name) || []
      },
      after: {
        count: filesAfter?.length || 0,
        files: filesAfter?.map(f => f.name) || []
      },
      deletionResult: {
        deleteError: deleteError?.message || null,
        fileStillExists,
        directAccess
      }
    };

    console.log('🧪 TESTE DELEÇÃO ESPECÍFICA: Resultado:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('🧪 TESTE DELEÇÃO ESPECÍFICA: Erro inesperado:', error);
    
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
