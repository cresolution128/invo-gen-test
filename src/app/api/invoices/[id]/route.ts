import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateTotals, calculateLineTotal } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
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
    const { items, dueDate, ...invoiceData } = body;

    const totals = calculateTotals(items);

    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...invoiceData,
        dueDate: dueDate ? new Date(dueDate) : null,
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

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update invoice" },
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
    await prisma.invoice.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
