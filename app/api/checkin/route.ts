import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let studentId: string | undefined;
  try {
    const body = await request.json();
    const { name, affiliation, grade } = body;
    studentId = body.studentId;

    const existing = await prisma.participant.findUnique({
      where: { studentId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "already_checked_in", participant: existing },
        { status: 409 }
      );
    }

    const created = await prisma.participant.create({
      data: { name, affiliation, grade, studentId },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    // ユニーク制約違反 (P2002) = 二重受付 → 409 で返す
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && studentId) {
      const existing = await prisma.participant.findUnique({ where: { studentId } }).catch(() => null);
      return NextResponse.json(
        { error: "already_checked_in", participant: existing },
        { status: 409 }
      );
    }
    console.error("[POST /api/checkin]", error);
    return NextResponse.json({ error: "internal_server_error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: { checkedInAt: "desc" },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("[GET /api/checkin]", error);
    return NextResponse.json({ error: "internal_server_error" }, { status: 500 });
  }
}
