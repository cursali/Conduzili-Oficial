# Dashboard Conduzili

Dashboard administrativo adaptado para o projeto Conduzili, uma plataforma de ensino de direção veicular. **Mantivemos toda a estrutura original com sidebar e componentes existentes, apenas adaptando os dados para suas tabelas do Supabase.**

## 🚗 Sobre o Projeto

O Conduzili é uma plataforma completa para escolas de direção, oferecendo:
- Gestão de estudantes e instrutores
- Agendamento de aulas teóricas e práticas
- Sistema de testes e quizzes
- Controle de pagamentos
- Sistema de gamificação com conquistas
- Biblioteca de sinais de trânsito
- Relatórios e analytics

## 🏗️ Estrutura do Dashboard

### ✅ **O que foi MANTIDO (estrutura original):**
- **Sidebar completa** com navegação
- **Header** com controles de tema
- **Layout responsivo** original
- **Componentes UI** existentes (DataTable, ChartAreaInteractive)
- **Sistema de temas** claro/escuro
- **Estrutura de arquivos** original

### 🔄 **O que foi ADAPTADO:**
- **Dados mockados** para refletir suas tabelas reais
- **Tipos TypeScript** baseados no seu banco
- **Configuração do Supabase** para conexão futura
- **Métricas específicas** do Conduzili

### 📊 **Visão Geral Atual:**
- **Cards de Métricas**: Estudantes, Instrutores, Taxa de Conversão, Lucro Estimado
- **Ícones Destacados**: Tamanho 32px para melhor visibilidade
- **Gráficos Interativos**: Visualização de dados em tempo real
- **Tabela de Alunos**: Dados reais do Supabase com filtros e busca
- **Dados em Português**: Adaptados para o mercado brasileiro

## 🔐 Sistema de Autenticação

### ✅ **Implementado:**
- **Login com email/senha** - Autenticação tradicional
- **Login com Google** - OAuth 2.0 integrado
- **Cadastro de usuários** - Criação de novas contas
- **Proteção de rotas** - Dashboard protegido por autenticação
- **Logout automático** - Gerenciamento de sessão
- **Redirecionamento inteligente** - Baseado no status de autenticação
- **Sistema de foto de perfil** - Upload, atualização e remoção de avatares
- **Sincronização automática** - Foto atualizada automaticamente no sidebar

### 📸 **Sistema de Foto de Perfil:**
- **Upload de imagens** para bucket Supabase Storage
- **Remoção automática** de imagens antigas
- **Atualização em tempo real** no sidebar e header
- **Fallback para iniciais** quando não há foto
- **Validação de arquivos** (apenas imagens)
- **Gerenciamento de storage** com políticas de segurança

### 🎯 **Sistema de Notificações Toast:**
- **Toasts elegantes** usando Sonner
- **Múltiplos tipos**: sucesso, erro, aviso, informação, loading
- **Posicionamento configurável** (top-right por padrão)
- **Duração automática** baseada no tipo
- **Hook personalizado** para uso consistente
- **Integração com tema** do sistema

### 🎨 **Sistema de Temas Avançado:**
- **Tema Blue padrão** - Cor azul consistente com tamanhos normais
- **Temas personalizados** - Blue, Green, Amber, Mono com opções scaled
- **Transições suaves** entre temas
- **Integração com tema** do sistema
- **Tamanhos proporcionais** para todos os elementos

### 🎯 **Sidebar Otimizado:**
- **Header fixo** - Logo e navegação sempre visíveis
- **Footer fixo** - Perfil do usuário sempre acessível
- **Scroll moderno e fino** - Barra de rolagem elegante (6px)
- **Temas adaptativos** - Cores que se ajustam automaticamente
- **Navegação intuitiva** - Estrutura organizada por seções
- **Scroll sempre ativo** - Funciona em todos os estados (expandido/colapsado)
- **Largura otimizada** - 64px quando colapsado (sem ícones cortados)

### 🎯 **Header da Página Fixo:**
- **Sempre visível** durante o scroll da página
- **Backdrop blur** para efeito visual moderno
- **Z-index otimizado** para garantir visibilidade
- **Fallback graceful** para navegadores antigos
- **Integração perfeita** com o sidebar fixo

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15.5.0 com TypeScript
- **UI Components**: Radix UI + Tailwind CSS (mantidos)
- **Charts**: Recharts (mantido)
- **Database**: Supabase (PostgreSQL) - configurado para conexão
- **Authentication**: Supabase Auth - **IMPLEMENTADO** ✅
- **Real-time**: Supabase Realtime - pronto para implementação

## 📊 Banco de Dados

O dashboard está **configurado** para conectar com o projeto Supabase "Conduzili Novo" com as seguintes tabelas principais:

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

## 📊 **Sistema de Gestão de Alunos**

### ✅ **Implementado:**
- **Tabela de Alunos Real** - Dados consultados diretamente do Supabase
- **Filtro por Escola** - Usuários veem apenas alunos da sua escola
- **Busca Inteligente** - Por nome ou email em tempo real
- **Filtros por Status** - Matriculado, Em Andamento, Aprovado, Reprovado, Suspenso
- **Progresso Visual** - Porcentagem de conclusão com cores semânticas
- **Interface Responsiva** - Funciona em todos os dispositivos
- **Segurança RLS** - Acesso controlado por permissões de escola

### 🎯 **Funcionalidades da Tabela:**
- **Avatar Personalizado** - Iniciais do nome em círculo colorido
- **Informações Completas** - Nome, email, status, progresso, aulas, data de matrícula
- **Ações por Aluno** - Visualizar, editar e remover registros
- **Contador Dinâmico** - Número de alunos encontrados
- **Estados de Loading** - Feedback visual durante carregamento
- **Tratamento de Erros** - Mensagens claras e opção de retry

### 🔧 **Integração Técnica:**
- **Hook Personalizado** - `useStudents` para lógica de dados
- **Query Otimizada** - JOIN entre `students` e `profiles`
- **Filtro Automático** - Baseado no `school_id` do usuário
- **Cache Local** - Estado gerenciado com React hooks
- **TypeScript Completo** - Tipagem segura para todos os dados

## 🚀 Como Executar

### **Pré-requisitos:**
1. **Node.js** 18+ instalado
2. **Supabase** - Projeto configurado
3. **Bucket de storage** configurado para avatares

### **Passos de Instalação:**

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd conduzili-oficial
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Crie um arquivo .env.local com:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Configure o Supabase Storage**
   - Siga as instruções em `supabase-storage-setup.md`
   - Crie o bucket `avatars`
   - Configure as políticas de segurança (RLS)

5. **Execute o projeto**
   ```bash
   npm run dev
   ```

6. **Acesse o sistema**
   - `http://localhost:3000` → redireciona automaticamente
   - Se não autenticado → vai para `/login`
   - Se autenticado → vai para `/dashboard`

## 🔧 Configuração do Supabase

### **Autenticação (OBRIGATÓRIO para funcionar):**
1. **Variáveis de ambiente**: Configure `.env.local`
2. **Google OAuth**: Configure no Google Cloud Console e Supabase
3. **Políticas RLS**: Configure segurança das tabelas

### **Documentação completa:**
- **`supabase-auth-setup.md`** - Guia detalhado de configuração
- **`supabase-config.md`** - Configuração geral do projeto

## 📱 Funcionalidades Atuais

### ✅ **Funcionando Agora:**
- **Sistema de autenticação completo** ✅
- Dashboard protegido com sidebar
- Métricas em tempo real
- Gráficos interativos
- Tabela de dados organizada
- Sistema de temas
- Layout responsivo
- Login/Logout automático

### 🔄 **Pronto para Implementação:**
- Conexão com dados reais do Supabase
- Operações CRUD nas tabelas
- Notificações em tempo real
- Relatórios avançados

## 🎯 Próximos Passos

- [x] ✅ Dashboard funcional com dados mockados
- [x] ✅ Estrutura original mantida
- [x] ✅ Configuração do Supabase
- [x] ✅ **Sistema de autenticação implementado**
- [x] ✅ **Sistema de foto de perfil implementado**
- [ ] Configurar variáveis de ambiente
- [ ] Configurar Google OAuth no Supabase
- [ ] Configurar bucket de storage para avatares
- [ ] Integração com API real do Supabase
- [ ] Sistema de notificações em tempo real
- [ ] Relatórios avançados e exportação
- [ ] Sistema de backup automático
- [ ] Integração com WhatsApp Business API
- [ ] Sistema de certificados digitais

## 🔐 Fluxo de Autenticação

```
Usuário não autenticado → /login → Autenticação → /dashboard
     ↓
Dashboard protegido → Logout → /login
```

## 📞 Suporte

Para dúvidas ou suporte técnico, entre em contato com a equipe de desenvolvimento.

---

**Conduzili** - Transformando o ensino de direção no Brasil 🚗🇧🇷

> **Importante**: Este dashboard mantém 100% da estrutura original, apenas adaptando os dados para o contexto do Conduzili. Todas as funcionalidades de UI, navegação e responsividade estão preservadas. **O sistema de autenticação está completamente implementado e funcional.**
