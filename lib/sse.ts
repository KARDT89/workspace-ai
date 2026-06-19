const clients = new Map<string, ReadableStreamDefaultController>();

export function registerSSEClient(
  userId: string,
  controller: ReadableStreamDefaultController
) {
  clients.set(userId, controller);
}

export function unregisterSSEClient(userId: string) {
  clients.delete(userId);
}

export function notifyUser(userId: string, event = "inbox:updated") {
  const controller = clients.get(userId);
  if (!controller) return;
  try {
    controller.enqueue(`data: ${event}\n\n`);
  } catch {
    clients.delete(userId);
  }
}
