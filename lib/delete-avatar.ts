import { supabase } from '@/lib/supabase';

export interface DeleteAvatarResult {
  success: boolean;
  message: string;
  filePath?: string;
}

export async function deleteAvatarFromStorage(avatarUrl: string): Promise<DeleteAvatarResult> {
  try {
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: FUNÇÃO INICIADA');
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: Parâmetro recebido:', avatarUrl);
    console.log('🗑️ DELETAR AVATAR: Tipo do parâmetro:', typeof avatarUrl);
    console.log('🗑️ DELETAR AVATAR: Comprimento do parâmetro:', avatarUrl?.length);
    console.log('🗑️ DELETAR AVATAR: Parâmetro é truthy:', !!avatarUrl);
    
    if (!avatarUrl) {
      console.warn('🗑️ DELETAR AVATAR: ❌ URL do avatar não fornecida');
      return {
        success: false,
        message: 'URL do avatar não fornecida'
      };
    }

    // Extrair o caminho do arquivo da URL
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: ETAPA 1: EXTRAÇÃO DO CAMINHO DO ARQUIVO');
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    
    let filePath = null;
    
    // Tentar extrair pelo formato de URL pública padrão do Supabase Storage
    console.log('🗑️ DELETAR AVATAR: Verificando se contém /storage/v1/object/public/');
    console.log('🗑️ DELETAR AVATAR: Resultado do includes:', avatarUrl.includes('/storage/v1/object/public/'));
    
    if (avatarUrl.includes('/storage/v1/object/public/')) {
      const urlParts = avatarUrl.split('/storage/v1/object/public/');
      console.log('🗑️ DELETAR AVATAR: Partes da URL após split:', urlParts);
      console.log('🗑️ DELETAR AVATAR: Número de partes:', urlParts.length);
      
      if (urlParts.length === 2) {
        filePath = urlParts[1];
        console.log('🗑️ DELETAR AVATAR: ✅ Caminho extraído pela URL pública:', filePath);
      } else {
        console.log('🗑️ DELETAR AVATAR: ❌ URL não tem formato esperado (2 partes)');
      }
    } else {
      console.log('🗑️ DELETAR AVATAR: URL não contém /storage/v1/object/public/');
    }
    
    // Se não conseguiu extrair pela URL, tentar pelo nome do arquivo diretamente
    if (!filePath) {
      console.log('🗑️ DELETAR AVATAR: Tentando extração direta...');
      console.log('🗑️ DELETAR AVATAR: Verificando se contém avatars/:', avatarUrl.includes('avatars/'));
      
      if (avatarUrl.includes('avatars/')) {
        filePath = avatarUrl;
        console.log('🗑️ DELETAR AVATAR: ✅ Caminho extraído diretamente:', filePath);
      } else {
        console.log('🗑️ DELETAR AVATAR: ❌ URL não contém avatars/');
      }
    }
    
    // Se ainda não conseguiu, tentar extrair o nome do arquivo da URL
    if (!filePath) {
      console.log('🗑️ DELETAR AVATAR: Tentando extração pelo nome do arquivo...');
      const urlParts = avatarUrl.split('/');
      console.log('🗑️ DELETAR AVATAR: Partes da URL:', urlParts);
      const fileName = urlParts[urlParts.length - 1];
      console.log('🗑️ DELETAR AVATAR: Nome do arquivo extraído:', fileName);
      console.log('🗑️ DELETAR AVATAR: Nome contém extensão:', fileName && fileName.includes('.'));
      
      if (fileName && fileName.includes('.')) {
        filePath = `avatars/${fileName}`;
        console.log('🗑️ DELETAR AVATAR: ✅ Caminho extraído pelo nome do arquivo:', filePath);
      } else {
        console.log('🗑️ DELETAR AVATAR: ❌ Nome do arquivo não contém extensão válida');
      }
    }

    if (!filePath) {
      console.log('🗑️ DELETAR AVATAR: ==========================================');
      console.log('🗑️ DELETAR AVATAR: ❌ FALHA NA EXTRAÇÃO DO CAMINHO');
      console.log('🗑️ DELETAR AVATAR: ==========================================');
      console.log('🗑️ DELETAR AVATAR: URL original:', avatarUrl);
      console.log('🗑️ DELETAR AVATAR: Partes da URL:', avatarUrl.split('/'));
      console.log('🗑️ DELETAR AVATAR: filePath final:', filePath);
      return {
        success: false,
        message: 'Não foi possível extrair o caminho do arquivo do avatar'
      };
    }

    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: ✅ CAMINHO EXTRAÍDO COM SUCESSO');
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: Caminho do arquivo extraído:', filePath);
    console.log('🗑️ DELETAR AVATAR: Tipo do caminho:', typeof filePath);
    console.log('🗑️ DELETAR AVATAR: Comprimento do caminho:', filePath.length);

    // Deletar do bucket 'avatars'
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: ETAPA 2: CHAMANDO SUPABASE STORAGE');
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: Bucket:', 'avatars');
    console.log('🗑️ DELETAR AVATAR: Arquivo(s) a deletar:', [filePath]);
    console.log('🗑️ DELETAR AVATAR: Chamando supabase.storage.remove...');
    
    const { error, data } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    console.log('🗑️ DELETAR AVATAR: Resposta completa do supabase.storage.remove:');
    console.log('🗑️ DELETAR AVATAR: error:', error);
    console.log('🗑️ DELETAR AVATAR: data:', data);

    if (error) {
      console.log('🗑️ DELETAR AVATAR: ==========================================');
      console.log('🗑️ DELETAR AVATAR: ❌ ERRO NO SUPABASE STORAGE');
      console.log('🗑️ DELETAR AVATAR: ==========================================');
      console.error('🗑️ DELETAR AVATAR: Erro completo:', error);
      console.log('🗑️ DELETAR AVATAR: Mensagem de erro:', error.message);


      return {
        success: false,
        message: `Erro ao deletar avatar: ${error.message}`,
        filePath
      };
    }

    // Verificar se o arquivo realmente foi deletado
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: ETAPA 3: VERIFICAÇÃO PÓS-DELEÇÃO');
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    
    try {
      console.log('🗑️ DELETAR AVATAR: Verificando se arquivo ainda existe...');
      const { data: checkData, error: checkError } = await supabase.storage
        .from('avatars')
        .list(filePath.split('/').slice(0, -1).join('/'), {
          limit: 100,
          offset: 0
        });

      if (checkError) {
        console.log('🗑️ DELETAR AVATAR: Erro ao verificar arquivo:', checkError);
      } else {
        const fileName = filePath.split('/').pop();
        const fileStillExists = checkData?.some(file => file.name === fileName);
        console.log('🗑️ DELETAR AVATAR: Arquivos na pasta após deleção:', checkData);
        console.log('🗑️ DELETAR AVATAR: Nome do arquivo procurado:', fileName);
        console.log('🗑️ DELETAR AVATAR: Arquivo ainda existe após deleção:', fileStillExists);
        
        if (fileStillExists) {
          console.log('🗑️ DELETAR AVATAR: ⚠️ ATENÇÃO: Arquivo ainda existe após deleção!');
        }
      }
    } catch (checkErr) {
      console.log('🗑️ DELETAR AVATAR: Erro ao verificar arquivo pós-deleção:', checkErr);
    }

    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: ✅ SUCESSO NA DELEÇÃO');
    console.log('🗑️ DELETAR AVATAR: ==========================================');
    console.log('🗑️ DELETAR AVATAR: Arquivo deletado com sucesso do storage');
    console.log('🗑️ DELETAR AVATAR: Caminho deletado:', filePath);
    
    return {
      success: true,
      message: 'Avatar deletado com sucesso do storage',
      filePath
    };

  } catch (error) {
    console.error('🗑️ DELETAR AVATAR: Erro inesperado:', error);
    return {
      success: false,
      message: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
