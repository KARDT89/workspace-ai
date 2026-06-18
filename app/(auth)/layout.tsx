
import { redirect } from "next/navigation"
import {getCurrentSession} from "@/lib/betterauth/session"

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentSession()

  if (session) {
    redirect("/dashboard")
  }

  return children
}
