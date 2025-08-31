# Sistema de Toasts - Guia de Uso

## 📋 Visão Geral

O sistema de toasts foi implementado usando o componente **Sonner** e um hook personalizado **`useToast`** para fornecer notificações elegantes e consistentes em todo o sistema.

## 🚀 Como Usar

### 1. Importar o Hook

```typescript
import { useToast } from '@/hooks/useToast'
```

### 2. Usar no Componente

```typescript
export default function MeuComponente() {
  const { success, error, warning, info, loading, dismiss } = useToast()
  
  // ... resto do código
}
```

## 🎯 Tipos de Toast Disponíveis

### ✅ **Sucesso**
```typescript
success('Operação realizada com sucesso!', 'Os dados foram salvos corretamente.')
```

### ❌ **Erro**
```typescript
error('Erro na operação', 'Verifique os dados e tente novamente.')
```

### ⚠️ **Aviso**
```typescript
warning('Atenção', 'Esta ação não pode ser desfeita.')
```

### ℹ️ **Informação**
```typescript
info('Informação importante', 'Sua sessão expira em 5 minutos.')
```

### 🔄 **Loading**
```typescript
const loadingToast = loading('Processando...', 'Aguarde enquanto salvamos os dados.')

// ... operação assíncrona

// Fechar o toast de loading
dismiss(loadingToast)
```

## 📍 Configurações Padrão

### **Posicionamento**: `top-right`
### **Durações**:
- **Sucesso**: 4 segundos
- **Erro**: 6 segundos  
- **Aviso**: 5 segundos
- **Informação**: 4 segundos
- **Loading**: Manual (até ser fechado)

## 💡 Exemplos Práticos

### **Upload de Arquivo**
```typescript
const handleUpload = async (file: File) => {
  const loadingToast = loading('Fazendo upload...', 'Aguarde enquanto processamos o arquivo.')
  
  try {
    // ... lógica de upload
    
    dismiss(loadingToast)
    success('Upload realizado!', 'Arquivo salvo com sucesso.')
  } catch (err) {
    dismiss(loadingToast)
    error('Erro no upload', 'Verifique o arquivo e tente novamente.')
  }
}
```

### **Salvamento de Formulário**
```typescript
const handleSave = async () => {
  try {
    // ... lógica de salvamento
    
    success('Dados salvos!', 'Suas alterações foram aplicadas.')
  } catch (err) {
    error('Erro ao salvar', 'Verifique os dados e tente novamente.')
  }
}
```

### **Login de Usuário**
```typescript
const handleLogin = async () => {
  try {
    const result = await signIn(credentials)
    
    if (result.error) {
      error('Erro no login', result.error.message)
    } else {
      success('Login realizado!', 'Redirecionando para o dashboard...')
      router.push('/dashboard')
    }
  } catch (err) {
    error('Erro inesperado', 'Tente novamente ou entre em contato com o suporte.')
  }
}
```

## 🎨 Personalização

### **Tema Automático**
Os toasts se adaptam automaticamente ao tema do sistema (claro/escuro).

### **Estilos CSS**
Os toasts usam as variáveis CSS do tema para cores e estilos consistentes.

## 🔧 Configuração Avançada

### **Modificar Durações**
```typescript
// No hook useToast
const success = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 6000, // 6 segundos
    position: 'top-right',
  })
}
```

### **Mudar Posição**
```typescript
// Posições disponíveis: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
const success = (message: string, description?: string) => {
  toast.success(message, {
    description,
    position: 'bottom-right',
  })
}
```

## 📱 Responsividade

- **Mobile**: Toasts se adaptam automaticamente ao tamanho da tela
- **Desktop**: Posicionamento otimizado para telas maiores
- **Touch**: Suporte completo para dispositivos touch

## 🚫 Boas Práticas

### ✅ **Faça:**
- Use mensagens claras e concisas
- Forneça descrições úteis quando necessário
- Use o tipo correto para cada situação
- Feche toasts de loading após operações

### ❌ **Evite:**
- Toasts muito longos ou complexos
- Muitos toasts simultâneos
- Toasts para informações triviais
- Esquecer de fechar toasts de loading

## 🔍 Debugging

### **Verificar se o Toaster está renderizado**
```typescript
// Deve estar no layout principal
<Toaster />
```

### **Logs no Console**
Os toasts incluem logs no console para debugging:
```typescript
console.log('Toast ID:', loadingToast)
```

## 📚 Referências

- **Sonner**: [Documentação oficial](https://sonner.emilkowal.ski/)
- **Next.js**: [Documentação oficial](https://nextjs.org/)
- **React Hooks**: [Documentação oficial](https://react.dev/reference/react/hooks) 