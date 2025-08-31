import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configurações básicas para desenvolvimento
  experimental: {
    // Configurações experimentais mínimas
  },
  
  // Configurações de compilação
  compiler: {
    // Remove console.logs em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configurações de imagens
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Configurações de tipos
  typescript: {
    // Ignora erros de TypeScript durante o build (apenas warnings)
    ignoreBuildErrors: false,
  },
  
  // Configurações de ESLint
  eslint: {
    // Ignora erros de ESLint durante o build
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
