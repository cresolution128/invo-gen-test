import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { orderBy: { position: "asc" } },
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const company = await prisma.company.findFirst();
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });

    return NextResponse.json({
      type: "invoice",
      document: invoice,
      company,
      settings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
