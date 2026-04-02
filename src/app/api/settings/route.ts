import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = await prisma.settings.update({
      where: { id: "default" },
      data: body,
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
