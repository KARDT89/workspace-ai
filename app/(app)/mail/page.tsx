import { getCurrentSession } from "@/lib/betterauth/session";
import { MailView } from "@/components/mail/mail-view";

export default async function MailPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string; folder?: string }>;
}) {
  const [session, { thread, folder }] = await Promise.all([
    getCurrentSession(),
    searchParams,
  ]);

  const initialFolder =
    folder === "sent" || folder === "drafts" ? folder : "inbox";

  return (
    <MailView
      initialThreadId={thread}
      initialFolder={initialFolder}
      userEmail={session?.user.email ?? ""}
    />
  );
}
