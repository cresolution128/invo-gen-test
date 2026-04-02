import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateNumber } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    const newCounter = settings.invoiceCounter + 1;
    const number = generateNumber(settings.invoicePrefix, newCounter);

    const invoice = await prisma.invoice.create({
      data: {
        number,
        customerId: quote.customerId,
        subject: quote.subject,
        notes: quote.notes,
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal,
        total: quote.total,
        quoteId: quote.id,
        items: {
          create: quote.items.map((item) => ({
            position: item.position,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            total: item.total,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    await prisma.quote.update({
      where: { id },
      data: { status: "accepted" },
    });

    await prisma.settings.update({
      where: { id: "default" },
      data: { invoiceCounter: newCounter },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to convert quote to invoice" },
      { status: 500 }
    );
  }
}
