import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, senha } = body

    // Validação básica
    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar franquia pelo email
    const franquia = await prisma.franquia.findUnique({
      where: { email }
    })

    if (!franquia) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    // Verificar senha
    const senhaValida = await verifyPassword(senha, franquia.senha)

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      )
    }

    // Gerar token
    const token = generateToken(franquia.id)

    // Criar resposta com cookie
    const response = NextResponse.json(
      { 
        message: 'Login realizado com sucesso',
        franquia: {
          id: franquia.id,
          nome: franquia.nome,
          email: franquia.email
        }
      },
      { status: 200 }
    )

    // Definir cookie (ajustado para dev)
    response.cookies.set('auth-token', token, {
      httpOnly: false, // só para teste local
      secure: false, // só para teste local
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 