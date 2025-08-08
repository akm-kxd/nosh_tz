import { eventBus } from "@/app/api/_lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let closed = false;
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (e: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
        } catch {
          // stream likely closed
        }
      };

      // транслируем события из шины в SSE
      const onMessage = (payload: unknown) => send(payload);
      eventBus.on("message", onMessage);

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {}
      }, 15000);

      // initial hello
      send({ type: "connected" });

      const doCleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        eventBus.off("message", onMessage);
        try {
          controller.close();
        } catch {}
      };
      cleanup = doCleanup;

      if (req.signal) {
        req.signal.addEventListener("abort", doCleanup, { once: true });
      }
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}


