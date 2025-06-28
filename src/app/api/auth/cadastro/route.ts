import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, cnpj, endereco, email, senha, whatsapp } = body

    // Validação básica
    if (!nome || !cnpj || !endereco || !email || !senha || !whatsapp) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se CNPJ ou email já existe
    const franquiaExistente = await prisma.franquia.findFirst({
      where: { OR: [{ cnpj }, { email }] }
    })

    if (franquiaExistente) {
      return NextResponse.json(
        { error: 'CNPJ ou email já cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha)

    // Criar franquia
    const franquia = await prisma.franquia.create({
      data: {
        nome,
        cnpj,
        endereco,
        email,
        senha: senhaHash,
        whatsapp
      }
    })

    // Gerar token JWT
    const token = generateToken(franquia.id)

    // Criar resposta com cookie igual ao login
    const response = NextResponse.json(
      {
        message: 'Franquia cadastrada com sucesso',
        franquiaId: franquia.id,
        franquia: {
          id: franquia.id,
          nome: franquia.nome,
          email: franquia.email
        },
        token
      },
      { status: 201 }
    )
    response.cookies.set('auth-token', token, {
      httpOnly: false, // para dev
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    })
    return response
  } catch (error) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 