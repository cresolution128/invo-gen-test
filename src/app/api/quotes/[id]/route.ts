import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTotals, calculateLineTotal } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });
    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { items, validUntil, ...quoteData } = body;

    const totals = calculateTotals(items);

    await prisma.quoteItem.deleteMany({
      where: { quoteId: id },
    });

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...quoteData,
        validUntil: validUntil ? new Date(validUntil) : null,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        items: {
          create: items.map(
            (
              item: {
                quantity: number;
                unitPrice: number;
                taxRate: number;
                name: string;
                description?: string;
                unit?: string;
                position?: number;
              },
              index: number
            ) => ({
              ...item,
              position: item.position ?? index,
              total: calculateLineTotal(item.quantity, item.unitPrice),
            })
          ),
        },
      },
      include: { items: true, customer: true },
    });

    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update quote" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.quote.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    );
  }
}
