# Configuração de Autenticação Supabase

## 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Obter Credenciais do Supabase

1. Acesse o [painel do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto "Conduzili Novo"
3. Vá para **Project Settings** > **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Configurar Autenticação com Google

### 3.1 Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google+ API**
4. Vá para **APIs & Services** > **Credentials**
5. Clique em **Create Credentials** > **OAuth 2.0 Client IDs**
6. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (para desenvolvimento)

### 3.2 Supabase
1. No painel do Supabase, vá para **Authentication** > **Providers**
2. Ative **Google**
3. Adicione:
   - **Client ID**: do Google Cloud Console
   - **Client Secret**: do Google Cloud Console

## 4. Configurar Políticas de Segurança (RLS)

### 4.1 Habilitar RLS nas tabelas
```sql
-- Exemplo para tabela de usuários
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Criar política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own data" ON auth.users
  FOR SELECT USING (auth.uid() = id);
```

### 4.2 Políticas para tabelas do Conduzili
```sql
-- Exemplo para tabela de estudantes
ALTER TABLE estudantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view students" ON estudantes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM instrutores 
      WHERE instrutores.id = auth.uid() 
      AND instrutores.escola_id = estudantes.escola_id
    )
  );
```

## 5. Testar o Sistema

1. **Iniciar o projeto**:
   ```bash
   npm run dev
   ```

2. **Acessar**:
   - `http://localhost:3000` → redireciona para `/login`
   - `http://localhost:3000/login` → página de login
   - `http://localhost:3000/dashboard` → protegido, requer login

3. **Funcionalidades**:
   - ✅ Login com email/senha
   - ✅ Cadastro de nova conta
   - ✅ Login com Google
   - ✅ Proteção de rotas
   - ✅ Logout
   - ✅ Redirecionamento automático

## 6. Estrutura de Arquivos Criados

```
├── lib/
│   └── supabase.ts              # Cliente Supabase
├── hooks/
│   └── useAuth.ts               # Hook de autenticação
├── components/
│   ├── providers/
│   │   └── auth-provider.tsx    # Contexto de autenticação
│   ├── auth-guard.tsx           # Proteção de rotas
│   └── site-header.tsx          # Header com logout
├── app/
│   ├── login/
│   │   └── page.tsx             # Página de login
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx         # Callback OAuth
│   ├── dashboard/
│   │   └── page.tsx             # Dashboard protegido
│   ├── page.tsx                 # Redirecionamento automático
│   └── layout.tsx               # Layout com AuthProvider
└── supabase-auth-setup.md       # Esta documentação
```

## 7. Próximos Passos

- [ ] Configurar variáveis de ambiente
- [ ] Configurar Google OAuth no Supabase
- [ ] Testar login/cadastro
- [ ] Configurar políticas RLS
- [ ] Personalizar mensagens de erro
- [ ] Adicionar validação de formulários
- [ ] Implementar recuperação de senha
- [ ] Adicionar verificação de email

## 8. Solução de Problemas

### Erro: "Invalid API key"
- Verifique se as variáveis de ambiente estão corretas
- Reinicie o servidor após alterar o `.env.local`

### Erro: "Google OAuth failed"
- Verifique se o Google OAuth está configurado no Supabase
- Confirme se as URIs de redirecionamento estão corretas

### Erro: "Route not found"
- Verifique se todos os arquivos foram criados
- Confirme se as importações estão corretas 