# Configuração Segura do Supabase para Deletar Usuários

## 🛡️ Arquitetura Segura

Esta implementação usa **Edge Functions do Supabase** para manter as chaves sensíveis seguras:

- ✅ **Service Role Key**: Fica apenas no ambiente Deno do Supabase
- ✅ **Frontend**: Nunca tem acesso a chaves administrativas
- ✅ **API Route**: Redireciona para a Edge Function com autenticação
- ✅ **Edge Function**: Executa operações administrativas com Service Role
- ✅ **Segurança**: Máxima proteção das credenciais sensíveis

## Variáveis de Ambiente Necessárias

### 1. Frontend (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Edge Function
```bash
# No dashboard do Supabase > Settings > Edge Functions
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Como Configurar

### 1. Frontend (.env.local)
1. **Acesse o Dashboard do Supabase**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Vá para Settings > API**
   - No menu lateral, clique em "Settings"
   - Clique em "API"

3. **Copie as Variáveis**
   - **Project URL**: Use para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key**: Use para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Edge Function (Dashboard do Supabase) ⚠️ CRÍTICO
1. **Vá para Edge Functions**
   - No menu lateral, clique em "Edge Functions"

2. **Selecione a função `delete-user`**
   - Clique na função para abrir as configurações

3. **Configure as Variáveis de Ambiente**
   - Clique em "Settings" da função
   - **ADICIONE OBRIGATORIAMENTE**:
     - `SUPABASE_URL`: Sua URL do projeto (ex: https://gjrkdidbkkefkkefgnaktsvy.supabase.co)
     - `SUPABASE_SERVICE_ROLE_KEY`: Sua chave service role (para deletar usuários)
     - `SUPABASE_ANON_KEY`: Sua chave anônima (para autenticação da API)

4. **Verifique se as variáveis estão ativas**
   - As variáveis devem aparecer como "Active" na lista
   - Se não estiverem, clique em "Redeploy" na função

## ⚠️ IMPORTANTE

- **NUNCA** compartilhe ou commite o `SUPABASE_SERVICE_ROLE_KEY`
- **Service Role Key**: Fica apenas no ambiente Deno do Supabase (seguro)
- **Frontend**: Nunca deve ter acesso a chaves administrativas
- **Segurança**: Edge Functions isolam as credenciais sensíveis

## Teste da Funcionalidade

Após configurar as variáveis:

1. Reinicie o servidor Next.js
2. Tente deletar um aluno
3. Verifique os logs no console do navegador
4. Verifique os logs no terminal do servidor

## Troubleshooting

### Erro 401 - Unauthorized
Se você receber o erro "401 Unauthorized":

1. **Verifique as variáveis da Edge Function**:
   - Vá para Edge Functions > delete-user > Settings
   - Confirme que `SUPABASE_ANON_KEY` está configurada
   - Confirme que `SUPABASE_SERVICE_ROLE_KEY` está configurada
   - Confirme que `SUPABASE_URL` está configurada

2. **Redeploy a função**:
   - Após configurar as variáveis, clique em "Redeploy"
   - Aguarde a função ficar "Active" novamente

3. **Verifique os logs**:
   - Console do navegador e terminal
   - Logs da Edge Function no dashboard do Supabase

### Outros Problemas
Se ainda não funcionar:

1. **Verifique os logs**: Console do navegador e terminal
2. **Confirme as variáveis**: Verifique se estão sendo carregadas
3. **Teste a API**: Use Postman ou similar para testar `/api/delete-user`
4. **Permissões**: Confirme que o service role key tem permissões de admin
