
import { redirect } from "next/navigation"
import {getCurrentSession} from "@/lib/betterauth/session"

const Dashboard = async () => {
  const session = await getCurrentSession()
  if (!session) {
    redirect("/login")
  }

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard
