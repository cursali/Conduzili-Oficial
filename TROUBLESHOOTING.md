# 🚨 Guia de Resolução de Problemas

## Problemas Comuns e Soluções

### 1. Erro de Arquivos Temporários (.next)
```bash
# Solução rápida
npm run clean:fast

# Solução completa
npm run clean

# Reset total
npm run reset
```

### 2. Erro de Cache Corrompido
```bash
# Limpar cache do Next.js
rm -rf .next

# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
npm install
```

### 3. Erro de Build Manifest
```bash
# Parar todos os processos
pkill -f "next" || true
pkill -f "node.*next" || true

# Limpar ambiente
./clean.sh

# Reiniciar
npm run dev
```

### 4. Erro de TypeScript
```bash
# Verificar tipos
npm run lint

# Limpar cache do TypeScript
rm -rf .next
npm run dev
```

### 5. Erro de Dependências
```bash
# Remover node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Verificar versões
npm list
```

## Scripts Disponíveis

### `npm run clean`
Executa limpeza completa do ambiente (recomendado para problemas persistentes)

### `npm run clean:fast`
Limpeza rápida (remove apenas .next)

### `npm run reset`
Reset total (remove tudo e reinstala)

## Prevenção de Problemas

1. **Sempre pare o servidor** antes de fazer mudanças grandes
2. **Use Ctrl+C** para parar o servidor de desenvolvimento
3. **Execute `npm run clean`** se houver problemas
4. **Mantenha as dependências atualizadas**

## Comandos Úteis

```bash
# Verificar status do sistema
ps aux | grep next

# Verificar portas em uso
lsof -i :3000

# Limpar cache do sistema (macOS)
rm -rf ~/Library/Caches/npm
rm -rf ~/Library/Caches/node-gyp

# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version
```

## Contato

Se os problemas persistirem, verifique:
1. Versão do Node.js (recomendado: 18+)
2. Versão do npm (recomendado: 9+)
3. Espaço em disco disponível
4. Permissões de arquivo
