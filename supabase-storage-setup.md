# Configuração do Supabase Storage para Avatares

## 1. Criar Bucket de Avatares

### No Dashboard do Supabase:
1. Acesse **Storage** no menu lateral
2. Clique em **"New Bucket"**
3. Configure o bucket:
   - **Name**: `avatars`
   - **Public**: ✅ Marque como público
   - **File size limit**: `5 MB` (ou o limite desejado)
   - **Allowed MIME types**: `image/*`

## 2. Configurar Políticas de Segurança (RLS)

### Política para Upload:
```sql
-- Permitir que usuários autenticados façam upload de suas próprias imagens
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Política para Visualização:
```sql
-- Permitir que todos vejam as imagens de avatar (bucket público)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### Política para Atualização:
```sql
-- Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Política para Exclusão:
```sql
-- Permitir que usuários excluam suas próprias imagens
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. Estrutura de Pastas

O bucket `avatars` deve ter a seguinte estrutura:
```
avatars/
├── avatars/
│   ├── user-id-1-timestamp.jpg
│   ├── user-id-2-timestamp.png
│   └── ...
```

## 4. Configurações Adicionais

### CORS (se necessário):
```sql
-- Configurar CORS para permitir uploads do frontend
INSERT INTO storage.cors (bucket_id, allowed_origins, allowed_methods, allowed_headers, max_age_seconds)
VALUES (
  'avatars',
  ARRAY['http://localhost:3000', 'https://yourdomain.com'],
  ARRAY['GET', 'POST', 'PUT', 'DELETE'],
  ARRAY['*'],
  3600
);
```

## 5. Teste da Configuração

1. **Upload de imagem**: Deve funcionar para usuários autenticados
2. **Visualização**: Imagens devem ser acessíveis publicamente
3. **Atualização**: Usuários devem conseguir trocar suas fotos
4. **Exclusão**: Usuários devem conseguir remover suas fotos
5. **Segurança**: Usuários não devem conseguir acessar fotos de outros usuários

## 6. Monitoramento

- Verifique os logs de storage no dashboard do Supabase
- Monitore o uso de espaço do bucket
- Configure alertas para uso excessivo de storage
- Faça backup regular das imagens importantes

## 7. Otimizações Recomendadas

- **Compressão**: Implementar compressão de imagem no frontend
- **Redimensionamento**: Redimensionar imagens para tamanhos padrão
- **Cache**: Configurar cache adequado para as imagens
- **CDN**: Considerar usar CDN para melhor performances 