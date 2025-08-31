# Configuração do Supabase para Conduzili

## 🔧 Configuração Necessária

Para conectar o dashboard com seu projeto Supabase, siga estes passos:

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://gjrkdidbkkefgnaktsvy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# App Configuration
NEXT_PUBLIC_APP_NAME=Conduzili
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Obter Credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto "Conduzili Novo"
4. Vá para **Settings** > **API**
5. Copie:
   - **Project URL**: `https://gjrkdidbkkefgnaktsvy.supabase.co`
   - **anon public**: Sua chave anônima

### 3. Estrutura das Tabelas

O dashboard está configurado para trabalhar com as seguintes tabelas:

- `profiles` - Perfis de usuários
- `schools` - Escolas de direção
- `students` - Estudantes matriculados
- `instructors` - Instrutores
- `lessons` - Aulas agendadas
- `quizzes` - Testes disponíveis
- `quiz_attempts` - Tentativas de teste
- `payments` - Pagamentos
- `achievements` - Conquistas
- `traffic_signs` - Sinais de trânsito

### 4. Testar a Conexão

Após configurar as variáveis de ambiente:

1. Reinicie o servidor: `npm run dev`
2. Acesse o dashboard: `http://localhost:3000/dashboard`
3. Verifique se não há erros de conexão no console

### 5. Próximos Passos

- [ ] Implementar autenticação real
- [ ] Conectar com dados reais do banco
- [ ] Implementar operações CRUD
- [ ] Adicionar notificações em tempo real

## 📊 Dados Atuais

O dashboard está funcionando com dados mockados que refletem a estrutura real das suas tabelas. Para usar dados reais, você precisará:

1. Implementar as queries do Supabase
2. Substituir os dados mockados por chamadas à API
3. Adicionar tratamento de erros
4. Implementar cache e otimizações

## 🚀 Suporte

Para dúvidas sobre a configuração, consulte a documentação do Supabase ou entre em contato com a equipe de desenvolvimento. 