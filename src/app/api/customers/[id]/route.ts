import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, company, street, zip, city, country, email, phone, notes } =
      body;
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        company: company ?? "",
        street: street ?? "",
        zip: zip ?? "",
        city: city ?? "",
        country: country ?? "",
        email: email ?? "",
        phone: phone ?? "",
        notes: notes ?? "",
      },
    });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.customer.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
