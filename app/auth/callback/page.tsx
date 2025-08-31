'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconLoader2 } from '@tabler/icons-react'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          setStatus('success')
          setMessage('Autenticação realizada com sucesso! Redirecionando...')
          
          // Aguardar um pouco para mostrar a mensagem de sucesso
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Falha na autenticação. Redirecionando para o login...')
          
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
      } catch (error: unknown) {
        setStatus('error')
        setMessage((error as Error)?.message || 'Erro inesperado. Redirecionando para o login...')
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <IconLoader2 className="w-12 h-12 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Processando autenticação...'}
            {status === 'success' && 'Sucesso!'}
            {status === 'error' && 'Erro na autenticação'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {status === 'loading' && (
            <div className="text-sm text-gray-600">
              Aguarde enquanto processamos sua autenticação...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 