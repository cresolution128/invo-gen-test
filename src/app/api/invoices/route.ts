import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateNumber,
  calculateTotals,
  calculateLineTotal,
} from "@/lib/utils";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, dueDate, ...invoiceData } = body;

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    const newCounter = settings.invoiceCounter + 1;
    const number = generateNumber(settings.invoicePrefix, newCounter);

    const totals = calculateTotals(items);

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        number,
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

    await prisma.settings.update({
      where: { id: "default" },
      data: { invoiceCounter: newCounter },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
