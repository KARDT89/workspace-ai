import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";
import { processOAuthCallback } from "corsair/oauth";

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/corsair/callback`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) return new Response("Missing code or state", { status: 400 });

  const connectUrl = new URL("/connect", req.url);

  try {
    await processOAuthCallback(corsair, { code, state, redirectUri: REDIRECT_URI });
  } catch (err) {
    console.error("OAuth callback error:", err);
    connectUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(connectUrl);
  }

  return NextResponse.redirect(connectUrl);
}
