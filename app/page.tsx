"use client";

import { useEffect, useMemo, useState } from "react";

// простая типизация для таблиц и брони
type Table = {
  id: number;
  name: string;
  capacity: number;
  posX: number;
  posY: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
};

type Reservation = {
  id: number;
  tableId: number | null;
  startsAt: string; // ISO
  status: "PENDING" | "CONFIRMED" | "SEATED" | "CANCELLED";
  partySize: number;
};

export default function FloorPlanPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const colors = useMemo(
    () => ({
      AVAILABLE: "bg-green-500",
      OCCUPIED: "bg-red-500",
      RESERVED: "bg-yellow-500",
    }),
    []
  );

  useEffect(() => {
    // начальная загрузка
    fetch("/api/tables").then((r) => r.json()).then(setTables);
    fetch("/api/reservations").then((r) => r.json()).then(setReservations);

    const ev = new EventSource("/api/events");
    ev.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "tables:update") {
          fetch("/api/tables")
            .then((r) => r.json())
            .then(setTables);
        } else if (msg.type === "reservations:update") {
          fetch("/api/reservations").then((r) => r.json()).then(setReservations);
        }
      } catch {}
    };
    return () => ev.close();
  }, []);

  // Вычисляем RESERVED: если есть ближайшая подтверждённая бронь на стол в ближайшие 2 часа
  const computed = useMemo(() => {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    const upcoming = reservations.filter(
      (r) => r.tableId && r.status !== "CANCELLED" && r.status !== "SEATED" && new Date(r.startsAt).getTime() - now <= twoHours && new Date(r.startsAt).getTime() >= now
    );
    const reservedByTable = new Set(upcoming.map((r) => r.tableId as number));
    return tables.map((t) => {
      if (t.status === "AVAILABLE" && reservedByTable.has(t.id)) {
        return { ...t, status: "RESERVED" as const };
      }
      return t;
    });
  }, [tables, reservations]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Floor</h1>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded bg-black text-white text-sm"
            onClick={async () => {
              const name = `T${tables.length + 1}`;
              const capacity = 2 + (tables.length % 4);
              const posX = (tables.length * 70) % 600;
              const posY = Math.floor(tables.length / 8) * 70;
              const created = await fetch("/api/tables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, capacity, posX, posY }),
              }).then((r) => r.json());
              setTables((t) => [...t, created]);
            }}
          >
            Add Table
          </button>
        </div>
      </div>

      <div className="relative w-full h-[520px] border rounded bg-neutral-50">
        {computed.map((t) => (
          <div
            key={t.id}
            className={`absolute ${colors[t.status]} text-white rounded flex items-center justify-center cursor-pointer select-none`}
            style={{ left: t.posX, top: t.posY, width: 60, height: 60 }}
            onClick={async () => {
              if (t.status === "AVAILABLE") {
                await fetch("/api/seating", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tableId: t.id, partySize: t.capacity }),
                });
              } else {
                // завершить текущую посадку, стол освободится
                await fetch("/api/seating", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tableId: t.id }),
                });
              }
            }}
            title={`${t.name} • ${t.capacity}p`}
          >
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
}
