import prisma from "@/app/lib/prisma";

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const now = new Date();

  const sessions = await prisma.seatingSession.findMany({
    where: { startedAt: { gte: todayStart, lte: now } },
    select: { startedAt: true, endedAt: true, partySize: true },
  });

  const dailyCovers = sessions.reduce((sum, s) => sum + s.partySize, 0);

  const hourBuckets = new Array(24).fill(0);
  sessions.forEach((s) => {
    const hour = new Date(s.startedAt).getHours();
    hourBuckets[hour] += s.partySize;
  });

  const peakHour = hourBuckets
    .map((covers, hour) => ({ hour, covers }))
    .sort((a, b) => b.covers - a.covers)[0]?.hour ?? null;

  const diningTimes = sessions
    .filter((s) => s.endedAt)
    .map((s) => (new Date(s.endedAt as Date).getTime() - new Date(s.startedAt).getTime()) / (1000 * 60));

  const averageDiningTimeMinutes =
    diningTimes.length > 0 ? Math.round(diningTimes.reduce((a, b) => a + b, 0) / diningTimes.length) : 0;

  return Response.json({ dailyCovers, peakHour, averageDiningTimeMinutes });
}


