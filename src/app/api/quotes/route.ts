import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateNumber,
  calculateTotals,
  calculateLineTotal,
} from "@/lib/utils";

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(quotes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, validUntil, ...quoteData } = body;

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    const newCounter = settings.quoteCounter + 1;
    const number = generateNumber(settings.quotePrefix, newCounter);

    const totals = calculateTotals(items);

    const quote = await prisma.quote.create({
      data: {
        ...quoteData,
        number,
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

    await prisma.settings.update({
      where: { id: "default" },
      data: { quoteCounter: newCounter },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
