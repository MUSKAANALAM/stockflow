import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Product } from '@prisma/client'
import Link from 'next/link'

async function getData(orgId: string): Promise<{
  totalProducts: number
  totalQuantity: number
  lowStock: Product[]
}> {
  const products: Product[] = await prisma.product.findMany({
    where: { organizationId: orgId },
  })

  const totalQuantity: number = products.reduce(
    (sum: number, p: Product) => sum + p.quantityOnHand,
    0
  )

  const lowStock: Product[] = products.filter(
    (p: Product) => p.quantityOnHand <= (p.lowStockThreshold ?? 5)
  )

  return {
    totalProducts: products.length,
    totalQuantity,
    lowStock,
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  const { totalProducts, totalQuantity, lowStock } = await getData(session!.orgId)

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1.5">Total products</p>
          <p className="text-3xl font-semibold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1.5">Total units in stock</p>
          <p className="text-3xl font-semibold text-gray-900">
            {totalQuantity.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1.5">Low stock items</p>
          <p className={`text-3xl font-semibold ${lowStock.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {lowStock.length}
          </p>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800">Low stock items</span>
          <Link href="/products" className="text-xs text-blue-600 hover:underline">
            View all products
          </Link>
        </div>

        {lowStock.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            All products are sufficiently stocked 🎉
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">Name</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">SKU</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">Qty on hand</th>
                <th className="text-left px-5 py-2.5 text-xs text-gray-400 font-medium">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lowStock.map((p: Product) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-5 py-3">
                    <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-0.5 rounded-md">
                      {p.quantityOnHand}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {p.lowStockThreshold ?? 5}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}