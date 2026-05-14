import { prisma } from "@/lib/prisma";

export async function getOrgSettings(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      defaultLowStockThreshold: true,
    },
  });

  return {
    defaultLowStockThreshold: org?.defaultLowStockThreshold ?? 5,
  };
}