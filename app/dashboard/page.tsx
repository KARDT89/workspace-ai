
import { redirect } from "next/navigation"
import {getCurrentSession} from "@/lib/betterauth/session"
import { ModeToggle } from "@/components/mode-toggle"

const Dashboard = async () => {
  const session = await getCurrentSession()
  if (!session) {
    redirect("/login")
  }

  return (
    <div>Dashboard
        <ModeToggle/>
    </div>
  )
}

export default Dashboard
