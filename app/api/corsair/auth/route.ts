import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/betterauth/session";
import { corsair } from "@/server/corsair";
import { generateOAuthUrl } from "corsair/oauth";

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/corsair/callback`;

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const plugin = searchParams.get("plugin");
  if (!plugin) return new Response("Missing plugin param", { status: 400 });

  const { url } = await generateOAuthUrl(corsair, plugin, {
    tenantId: session.user.id,
    redirectUri: REDIRECT_URI,
  });

  return NextResponse.redirect(url);
}
