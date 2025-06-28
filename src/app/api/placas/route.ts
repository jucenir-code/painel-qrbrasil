import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Listar placas da franquia
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const placas = await prisma.placa.findMany({
      where: { franquiaId: decoded.franquiaId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(placas)
  } catch (error) {
    console.error('Erro ao buscar placas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova placa
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()
    const { nomeEmpresa, cnpj, endereco, email, whatsapp } = body

    // Validação básica
    if (!nomeEmpresa || !cnpj || !endereco || !email || !whatsapp) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const placa = await prisma.placa.create({
      data: {
        nomeEmpresa,
        cnpj,
        endereco,
        email,
        whatsapp,
        franquiaId: decoded.franquiaId
      }
    })

    return NextResponse.json(
      { message: 'Placa cadastrada com sucesso', placa },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar placa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Editar placa
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    const body = await request.json()
    const { id, nomeEmpresa, cnpj, endereco, email, whatsapp } = body
    if (!id || !nomeEmpresa || !cnpj || !endereco || !email || !whatsapp) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }
    const placa = await prisma.placa.update({
      where: { id, franquiaId: decoded.franquiaId },
      data: { nomeEmpresa, cnpj, endereco, email, whatsapp }
    })
    return NextResponse.json({ message: 'Placa editada com sucesso', placa }, { status: 200 })
  } catch (error) {
    console.error('Erro ao editar placa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 