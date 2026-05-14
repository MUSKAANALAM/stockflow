import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export interface TokenPayload extends JWTPayload {
  userId: string
  orgId: string
  email: string
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret'
)

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as TokenPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('sf_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<TokenPayload | null> {
  const token = req.cookies.get('sf_token')?.value
  if (!token) return null
  return verifyToken(token)
}