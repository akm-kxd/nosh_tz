import { NextRequest } from "next/server";
import prisma from "@/app/lib/prisma";
import { emitEvent } from "@/app/api/_lib/events";

export async function GET() {
  const tables = await prisma.table.findMany({
    orderBy: { id: "asc" },
  });
  return Response.json(tables);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.table.create({ data: body });
  emitEvent("tables:update", created);
  return Response.json(created);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const updated = await prisma.table.update({ where: { id }, data });
  emitEvent("tables:update", updated);
  return Response.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const deleted = await prisma.table.delete({ where: { id } });
  emitEvent("tables:update", { id: deleted.id, deleted: true });
  return Response.json({ ok: true });
}


