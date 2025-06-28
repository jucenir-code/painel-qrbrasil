import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import QRCode from 'qrcode'

// POST - Gerar QR Code para uma placa
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
    const { placaId, url } = body

    if (!placaId || !url) {
      return NextResponse.json(
        { error: 'ID da placa e URL são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a placa pertence à franquia
    const placa = await prisma.placa.findFirst({
      where: {
        id: placaId,
        franquiaId: decoded.franquiaId
      }
    })

    if (!placa) {
      return NextResponse.json(
        { error: 'Placa não encontrada' },
        { status: 404 }
      )
    }

    // Gerar QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Atualizar placa com QR Code
    const placaAtualizada = await prisma.placa.update({
      where: { id: placaId },
      data: {
        qrCodeUrl: url,
        qrCodeData: qrCodeDataUrl
      }
    })

    return NextResponse.json({
      message: 'QR Code gerado com sucesso',
      qrCode: qrCodeDataUrl,
      placa: placaAtualizada
    })
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 