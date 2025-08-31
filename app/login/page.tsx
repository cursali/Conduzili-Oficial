'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'
import { IconMail, IconLock, IconEye, IconEyeOff, IconBrandGoogle } from '@tabler/icons-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })

  const { signIn, signUp, signInWithGoogle } = useAuthContext()
  const { success, error, loading: showLoading, dismiss } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      
      if (isLogin) {
        result = await signIn({
          email: formData.email,
          password: formData.password
        })
      } else {
        result = await signUp({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        })
      }

      if (result.error) {
        error('Erro de autenticação', result.error.message)
      } else {
        success(
          isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!',
          isLogin ? 'Redirecionando para o dashboard...' : 'Faça login para continuar.'
        )
        
        if (isLogin) {
          // Redirecionar para o dashboard após login bem-sucedido
          router.push('/dashboard')
        } else {
          // Mudar para modo de login após cadastro bem-sucedido
          setIsLogin(true)
          setFormData({ email: '', password: '', full_name: '' })
        }
      }
    } catch (err: unknown) {
      error('Erro inesperado', (err as Error)?.message || 'Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)

    try {
      const result = await signInWithGoogle()
      if (result.error) {
        error('Erro no login com Google', (result.error as Error)?.message || 'Erro desconhecido')
      } else {
        success('Login com Google realizado!', 'Redirecionando para o dashboard...')
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      error('Erro no login com Google', (err as Error)?.message || 'Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          {/* Logo */}
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
            <IconMail className="w-10 h-10 text-white" />
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            {isLogin ? 'Bem-vindo de volta!' : 'Criar conta'}
          </CardTitle>
          
          <CardDescription className="text-base text-gray-600">
            {isLogin 
              ? 'Entre com suas credenciais para acessar o sistema'
              : 'Crie sua conta para começar a usar o sistema'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                  Nome Completo
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  disabled={loading}
                  className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error toast will be handled by useToast */}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500 font-medium">ou continue com</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLogin ? 'Entrar com Google' : 'Cadastrar com Google'}
          </Button>

          {/* Toggle Login/Signup */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              disabled={loading}
            >
              {isLogin 
                ? 'Não tem uma conta? Criar conta'
                : 'Já tem uma conta? Entrar'
              }
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-sm text-gray-500">
        <p>© 2024 Conduzili. Todos os direitos reservados.</p>
      </div>
    </div>
  )
} 