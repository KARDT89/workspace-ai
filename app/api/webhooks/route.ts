import { processWebhook } from "corsair";
import { corsair } from "@/server/corsair";

export async function POST(req: Request) {
  const rawHeaders = Object.fromEntries(req.headers);
  const body = await req.json();

  const result = await processWebhook(corsair, rawHeaders, body, {
    tenantId: process.env.TENANT_ID ?? "dev",
  });

  if (!result.plugin) return new Response(null, { status: 404 });

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
