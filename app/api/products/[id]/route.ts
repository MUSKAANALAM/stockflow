import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};


export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const product = await prisma.product.findFirst({
    where: {
      id,
      organizationId: session.orgId,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}


export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const product = await prisma.product.findFirst({
    where: {
      id,
      organizationId: session.orgId,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  const {
    name,
    sku,
    description,
    quantityOnHand,
    costPrice,
    sellingPrice,
    lowStockThreshold,
  } = body;

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: name ?? product.name,
      sku: sku ?? product.sku,
      description: description ?? product.description,

      quantityOnHand:
        quantityOnHand !== undefined
          ? parseInt(quantityOnHand)
          : product.quantityOnHand,

      costPrice:
        costPrice !== undefined
          ? costPrice
            ? parseFloat(costPrice)
            : null
          : product.costPrice,

      sellingPrice:
        sellingPrice !== undefined
          ? sellingPrice
            ? parseFloat(sellingPrice)
            : null
          : product.sellingPrice,

      lowStockThreshold:
        lowStockThreshold !== undefined
          ? lowStockThreshold
            ? parseInt(lowStockThreshold)
            : null
          : product.lowStockThreshold,
    },
  });

  return NextResponse.json(updated);
}


export async function DELETE(
  req: NextRequest,
  context: RouteContext 
) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const product = await prisma.product.findFirst({
    where: {
      id,
      organizationId: session.orgId,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.product.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}