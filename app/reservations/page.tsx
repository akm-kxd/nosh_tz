"use client";

import { useEffect, useState } from "react";

type Reservation = {
  id: number;
  guestName: string;
  phone: string;
  partySize: number;
  startsAt: string;
  endsAt?: string | null;
  status: "PENDING" | "CONFIRMED" | "SEATED" | "CANCELLED";
  tableId?: number | null;
};

export default function ReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  type FormState = {
    guestName: string;
    phone: string;
    partySize: number;
    startsAt: string; // datetime-local
    specialRequests: string;
  };
  const [form, setForm] = useState<FormState>({
    guestName: "",
    phone: "",
    partySize: 2,
    startsAt: new Date().toISOString().slice(0, 16),
    specialRequests: "",
  });

  useEffect(() => {
    // загрузка списка броней
    fetch("/api/reservations")
      .then((r) => r.json())
      .then(setItems);
    const ev = new EventSource("/api/events");
    ev.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "reservations:update") {
          fetch("/api/reservations").then((r) => r.json()).then(setItems);
        }
      } catch {}
    };
    return () => ev.close();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reservations</h1>

      <form
        className="grid grid-cols-2 gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const payload: {
            guestName: string;
            phone: string;
            partySize: number;
            startsAt: Date;
            specialRequests?: string;
          } = {
            guestName: form.guestName,
            phone: form.phone,
            partySize: Number(form.partySize),
            startsAt: new Date(form.startsAt),
            specialRequests: form.specialRequests || undefined,
          };
          const created = await fetch("/api/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json());
          setItems((prev) => [...prev, created]);
        }}
      >
        <input
          className="border rounded px-2 py-1"
          placeholder="Guest name"
          value={form.guestName}
          onChange={(e) => setForm({ ...form, guestName: e.target.value })}
          required
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <input
          type="number"
          className="border rounded px-2 py-1"
          placeholder="Party size"
          value={form.partySize}
          onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })}
          required
        />
        <input
          type="datetime-local"
          className="border rounded px-2 py-1"
          value={form.startsAt}
          onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
          required
        />
        <input
          className="col-span-2 border rounded px-2 py-1"
          placeholder="Special requests"
          value={form.specialRequests}
          onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
        />
        <div className="col-span-2">
          <button className="px-3 py-1.5 rounded bg-black text-white text-sm">Create</button>
        </div>
      </form>

      <div className="divide-y border rounded">
        {items.map((r) => (
          <div key={r.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.guestName} • {r.partySize}p</div>
              <div className="text-xs text-neutral-500">{new Date(r.startsAt).toLocaleString()} • {r.status}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 rounded border"
                onClick={async () => {
                  await fetch("/api/reservations", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: r.id, status: "CONFIRMED" }),
                  });
                }}
              >Confirm</button>
              <button
                className="px-2 py-1 rounded border"
                onClick={async () => {
                  const next = new Date(new Date(r.startsAt).getTime() + 30 * 60 * 1000);
                  await fetch("/api/reservations", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: r.id, startsAt: next }),
                  });
                }}
              >+30 min</button>
              <button
                className="px-2 py-1 rounded border"
                onClick={async () => {
                  await fetch("/api/reservations", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: r.id, status: "CANCELLED" }),
                  });
                }}
              >Cancel</button>
              <button
                className="px-2 py-1 rounded border"
                onClick={async () => {
                  let tableId = r.tableId ?? null;
                  if (!tableId) {
                    const tables: Array<{ id: number; capacity: number; status: string }> = await fetch("/api/tables").then((x) => x.json());
                    const candidate = tables.find((t) => t.status === "AVAILABLE" && t.capacity >= r.partySize) ?? tables.find((t) => t.status === "AVAILABLE");
                    if (!candidate) {
                      alert("No available tables");
                      return;
                    }
                    tableId = candidate.id;
                  }
                  await fetch("/api/seating", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tableId, reservationId: r.id, partySize: r.partySize }) });
                }}
              >Seat</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


