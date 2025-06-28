import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = '9sPNBstabqNs7nE7bfiiM339bXedIDrmN' // Use o mesmo valor do seu .env

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (e) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas que precisam de autenticação
  const protectedRoutes = ['/dashboard', '/api/placas', '/api/qrcode']
  
  // Verificar se a rota atual precisa de autenticação
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value
    console.log('Token recebido no middleware:', token)

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decoded = await verifyToken(token)
    console.log('Resultado do verifyToken:', decoded)

    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/placas/:path*',
    '/api/qrcode/:path*'
  ]
} 