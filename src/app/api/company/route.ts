import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({ data: {} });
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({ data: body });
    } else {
      company = await prisma.company.update({
        where: { id: company.id },
        data: body,
      });
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}
