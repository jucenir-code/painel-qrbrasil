import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(franquiaId: number): string {
  return jwt.sign({ franquiaId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { franquiaId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { franquiaId: number }
  } catch {
    return null
  }
} 