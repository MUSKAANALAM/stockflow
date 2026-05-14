import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.orgId },
    select: {
      defaultLowStockThreshold: true,
    },
  });

  return NextResponse.json({
    defaultLowStockThreshold: org?.defaultLowStockThreshold ?? 5,
  });
}


export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const threshold = Number(body.defaultLowStockThreshold);

  if (Number.isNaN(threshold)) {
    return NextResponse.json(
      { error: "Invalid threshold value" },
      { status: 400 }
    );
  }

  const updatedOrg = await prisma.organization.update({
    where: { id: session.orgId },
    data: {
      defaultLowStockThreshold: threshold,
    },
  });

  return NextResponse.json({
    defaultLowStockThreshold: updatedOrg.defaultLowStockThreshold,
  });
}