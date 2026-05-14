import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email, password, orgName } = await req.json()

    // Validate inputs
    if (!email || !password || !orgName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create org and user together
    const org = await prisma.organization.create({
      data: {
        name: orgName,
        users: {
          create: { email, passwordHash },
        },
      },
      include: { users: true },
    })

    const user = org.users[0]

    // Create JWT token
    const token = await signToken({
      userId: user.id,
      orgId: org.id,
      email: user.email,
    })

    // Set cookie and return
    const res = NextResponse.json({ ok: true }, { status: 201 })
    res.cookies.set('sf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}