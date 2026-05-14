
import { getSession } from "@/lib/auth";
import ProductsPage from "./ProductsPage";
import { getOrgSettings } from "@/lib/defaultStock";

export default async function Page() {
  const session = await getSession();
  

  if (!session) {
    return null; // or redirect("/login")
  }

  const safeSession = {
    userId: session.userId,
    orgId: session.orgId,
  };
    const { defaultLowStockThreshold } = await getOrgSettings(session!.orgId);

  return <ProductsPage defaultLowStockThreshold={defaultLowStockThreshold} />;
}