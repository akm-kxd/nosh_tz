"use client";

import { useEffect, useState } from "react";

type Analytics = {
  dailyCovers: number;
  peakHour: number | null;
  averageDiningTimeMinutes: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  async function load() {
    const res = await fetch("/api/analytics");
    setData(await res.json());
  }

  useEffect(() => {
    load();
    const ev = new EventSource("/api/events");
    ev.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type?.includes("seating") || msg.type?.includes("tables")) {
          load();
        }
      } catch {}
    };
    return () => ev.close();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-neutral-500">Daily covers</div>
          <div className="text-2xl font-semibold">{data.dailyCovers}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-neutral-500">Peak hour</div>
          <div className="text-2xl font-semibold">{data.peakHour ?? "—"}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-neutral-500">Avg dining time</div>
          <div className="text-2xl font-semibold">{data.averageDiningTimeMinutes}m</div>
        </div>
      </div>
    </div>
  );
}


