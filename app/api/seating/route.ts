import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { emitEvent } from "@/app/api/_lib/events";

// старт посадки (walk-in или из брони)
export async function POST(req: NextRequest) {
  const { tableId, reservationId, partySize } = await req.json();

  const session = await prisma.seatingSession.create({
    data: { tableId, reservationId, partySize },
  });

  await prisma.table.update({
    where: { id: tableId },
    data: { status: "OCCUPIED" },
  });

  if (reservationId) {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "SEATED" },
    });
  }

  emitEvent("tables:update", { id: tableId, status: "OCCUPIED" });
  emitEvent("seating:update", session);
  return Response.json(session);
}

// завершение посадки
export async function PUT(req: NextRequest) {
  const { sessionId, tableId } = await req.json();
  const session = sessionId
    ? await prisma.seatingSession.findUnique({ where: { id: sessionId } })
    : await prisma.seatingSession.findFirst({ where: { tableId, endedAt: null } });
  if (!session) return new Response("Not found", { status: 404 });

  const ended = await prisma.seatingSession.update({
    where: { id: session.id },
    data: { endedAt: new Date() },
  });

  await prisma.table.update({ where: { id: ended.tableId }, data: { status: "AVAILABLE" } });
  emitEvent("tables:update", { id: ended.tableId, status: "AVAILABLE" });
  emitEvent("seating:update", ended);
  return Response.json(ended);
}


