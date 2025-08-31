import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG AVATAR URL: Iniciando debug...');
    
    const body = await request.json();
    console.log('🔍 DEBUG AVATAR URL: Body completo recebido:', body);
    
    const { avatarUrl } = body;
    console.log('🔍 DEBUG AVATAR URL: avatarUrl extraída:', avatarUrl);
    
    if (!avatarUrl) {
      return NextResponse.json({
        success: false,
        message: 'Nenhuma URL recebida',
        body
      });
    }

    // Analisar a URL
    const urlAnalysis = {
      originalUrl: avatarUrl,
      length: avatarUrl.length,
      containsStorage: avatarUrl.includes('/storage/'),
      containsPublic: avatarUrl.includes('/public/'),
      containsAvatars: avatarUrl.includes('avatars/'),
      containsStudentAvatars: avatarUrl.includes('student-avatars/'),
      endsWithSvg: avatarUrl.endsWith('.svg'),
      endsWithJpg: avatarUrl.endsWith('.jpg'),
      endsWithPng: avatarUrl.endsWith('.png'),
      urlParts: avatarUrl.split('/'),
      lastPart: avatarUrl.split('/').pop()
    };

    // Tentar extrair caminho usando a lógica da API original
    let filePath = null;
    let extractionMethod = 'none';
    
    if (avatarUrl.includes('/storage/v1/object/public/')) {
      const urlParts = avatarUrl.split('/storage/v1/object/public/');
      if (urlParts.length === 2) {
        filePath = urlParts[1];
        extractionMethod = 'storage_public_split';
      }
    }
    
    if (!filePath && avatarUrl.includes('avatars/')) {
      filePath = avatarUrl;
      extractionMethod = 'avatars_contains';
    }
    
    if (!filePath) {
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName && fileName.includes('.')) {
        filePath = `avatars/${fileName}`;
        extractionMethod = 'filename_fallback';
      }
    }

    const result = {
      success: true,
      message: 'Debug concluído',
      urlAnalysis,
      extractionResult: {
        filePath,
        extractionMethod,
        extractionSuccess: !!filePath
      },
      recommendations: []
    };

    // Adicionar recomendações
    if (!filePath) {
      result.recommendations.push('❌ Falha na extração do caminho');
    } else {
      result.recommendations.push('✅ Caminho extraído com sucesso');
      
      // Verificar se o caminho parece correto
      if (!filePath.startsWith('avatars/')) {
        result.recommendations.push('⚠️ Caminho não começa com "avatars/"');
      }
      
      if (!filePath.includes('student-avatars/')) {
        result.recommendations.push('⚠️ Caminho não contém "student-avatars/"');
      }
    }

    console.log('🔍 DEBUG AVATAR URL: Resultado:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('🔍 DEBUG AVATAR URL: Erro inesperado:', error);
    
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
