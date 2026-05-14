import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
 
  const q = searchParams.get('q') || ''

  const products = await prisma.product.findMany({
    where: {
      organizationId: session.orgId,
      ...(q ? {
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = body

  if (!name || !sku) {
    return NextResponse.json({ error: 'Name and SKU are required' }, { status: 400 })
  }

  const existing = await prisma.product.findFirst({
    where: { organizationId: session.orgId, sku },
  })
  if (existing) {
    return NextResponse.json({ error: 'SKU already exists' }, { status: 409 })
  }

  const product = await prisma.product.create({
    data: {
      organizationId: session.orgId,
      name,
      sku,
      description: description || null,
      quantityOnHand: parseInt(quantityOnHand) || 0,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : null,
    },
  })

  return NextResponse.json(product, { status: 201 })
}