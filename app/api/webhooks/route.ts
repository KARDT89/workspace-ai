import { processWebhook } from "corsair";
import { corsair } from "@/server/corsair";

export async function POST(req: Request) {
  const rawHeaders = Object.fromEntries(req.headers);
  const body = await req.json();

  const result = await processWebhook(corsair, rawHeaders, body);

  if (!result.plugin) return new Response(null, { status: 404 });

  if (result.plugin) {
        console.log(`Handled by ${result.plugin}.${result.action}`);
    }
    
  const headers = new Headers(result.responseHeaders);
  if (result.response?.returnToSender) {
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify(result.response.returnToSender), {
      status: 200,
      headers,
    });
  }

  return new Response(null, { status: 200, headers });
}
