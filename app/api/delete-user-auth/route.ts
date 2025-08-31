import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 DELETE USER AUTH: Iniciando deleção de usuário do Auth...');
    
    const { userId } = await request.json();
    
    if (!userId) {
      console.error('🔐 DELETE USER AUTH: User ID não fornecido');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔐 DELETE USER AUTH: User ID recebido:', userId);

    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('🔐 DELETE USER AUTH: Variáveis de ambiente não configuradas');
      return NextResponse.json(
        { error: 'Environment variables not configured' },
        { status: 500 }
      );
    }

    // Criar cliente Supabase com service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    console.log('🔐 DELETE USER AUTH: Cliente Supabase criado, deletando usuário...');

    // Deletar usuário do Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('🔐 DELETE USER AUTH: Erro ao deletar usuário:', error);
      return NextResponse.json(
        { 
          success: false,
          error: error.message,
          details: error
        },
        { status: 500 }
      );
    }

    console.log('🔐 DELETE USER AUTH: Usuário deletado com sucesso do Auth');
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully from Auth'
    });

  } catch (error) {
    console.error('🔐 DELETE USER AUTH: Erro inesperado:', error);
    
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
