import { getCurrentSession } from "@/lib/betterauth/session";
import { MailView } from "@/components/mail/mail-view";

export default async function MailPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const [session, { thread }] = await Promise.all([
    getCurrentSession(),
    searchParams,
  ]);

  return (
    <MailView
      initialThreadId={thread}
      userEmail={session?.user.email ?? ""}
    />
  );
}
