import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { emitEvent } from "@/app/api/_lib/events";

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { startsAt: "asc" },
    include: { table: true },
  });
  return Response.json(reservations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.reservation.create({ data: body });
  emitEvent("reservations:update", created);
  return Response.json(created);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const updated = await prisma.reservation.update({
    where: { id },
    data,
  });
  emitEvent("reservations:update", updated);
  return Response.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.reservation.delete({ where: { id } });
  emitEvent("reservations:update", { id, deleted: true });
  return Response.json({ ok: true });
}


