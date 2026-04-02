import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalCustomers,
      totalProducts,
      quotes,
      invoices,
      recentQuotes,
      recentInvoices,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.quote.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.quote.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
    ]);

    const quotesByStatus = Object.fromEntries(
      quotes.map((q) => [q.status, q._count.status])
    );

    const invoicesByStatus = Object.fromEntries(
      invoices.map((i) => [i.status, i._count.status])
    );

    return NextResponse.json({
      totalCustomers,
      totalProducts,
      quotesByStatus,
      invoicesByStatus,
      recentQuotes,
      recentInvoices,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
