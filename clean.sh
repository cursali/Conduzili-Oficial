#!/bin/bash

echo "🧹 Limpando ambiente de desenvolvimento..."

# Parar processos do Next.js
echo "🛑 Parando processos do Next.js..."
pkill -f "next" || true
pkill -f "node.*next" || true

# Limpar cache e arquivos temporários
echo "🗑️ Removendo arquivos temporários..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf .swc

# Limpar cache do npm
echo "📦 Limpando cache do npm..."
npm cache clean --force

# Limpar cache do sistema (macOS)
echo "💻 Limpando cache do sistema..."
rm -rf ~/Library/Caches/npm
rm -rf ~/Library/Caches/node-gyp

# Reinstalar dependências
echo "📥 Reinstalando dependências..."
npm install

# Limpar variáveis de ambiente
echo "🔧 Limpando variáveis de ambiente..."
unset NODE_ENV
unset NEXT_TELEMETRY_DISABLED

echo "✅ Limpeza concluída!"
echo "🚀 Execute 'npm run dev' para iniciar o servidor"
