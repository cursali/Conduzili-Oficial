import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('API Route: Redirecionando para Edge Function do Supabase')
    
    const { userId } = await request.json()
    console.log('API Route: User ID recebido:', userId)

    if (!userId) {
      console.error('API Route: User ID não fornecido')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Redirecionar para a Edge Function do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Supabase URL not configured' },
        { status: 500 }
      )
    }

    // Chamar a Edge Function do Supabase
    const response = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ userId })
    })

    const result = await response.json()
    console.log('Edge Function response:', response.status, result)

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete user' },
        { status: response.status }
      )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('API Route: Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
