import { eventBus } from "@/app/api/_lib/events";

export const runtime = "nodejs";

export async function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      function send(e: unknown) {
        const data = `data: ${JSON.stringify(e)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }

      const onMessage = (payload: unknown) => send(payload);
      eventBus.on("message", onMessage);

      // ping to keep alive
      const interval = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(": ping\n\n"));
      }, 15000);

      // initial hello
      send({ type: "connected" });

      return () => {
        clearInterval(interval);
        eventBus.off("message", onMessage);
      };
    },
    cancel() {},
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


