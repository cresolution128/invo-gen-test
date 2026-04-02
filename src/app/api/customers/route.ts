import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await prisma.customer.create({
      data: body,
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
