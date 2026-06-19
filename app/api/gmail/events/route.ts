import { getCurrentSession } from "@/lib/betterauth/session";
import {
  registerSSEClient,
  unregisterSSEClient,
} from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) return new Response(null, { status: 401 });

  const userId = session.user.id;
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      registerSSEClient(userId, controller);

      // Heartbeat every 30s — keeps connection alive through proxies/ngrok
      const hb = setInterval(() => {
        try {
          controller.enqueue(": heartbeat\n\n");
        } catch {
          clearInterval(hb);
        }
      }, 30_000);

      cleanup = () => {
        clearInterval(hb);
        unregisterSSEClient(userId);
      };
    },
    cancel() {
      cleanup?.();
    },
  });

  req.signal.addEventListener("abort", () => cleanup?.());

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
