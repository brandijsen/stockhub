import { prisma } from "./prisma";

/** User is online if last activity was within this window. */
export const USER_ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

const HEARTBEAT_WRITE_INTERVAL_MS = 60 * 1000;

export function isUserOnline(
  lastSeenAt: Date | null | undefined,
  now = Date.now(),
): boolean {
  if (!lastSeenAt) {
    return false;
  }
  return now - lastSeenAt.getTime() < USER_ONLINE_THRESHOLD_MS;
}

/** Updates lastSeenAt at most once per minute unless `force` is true. */
export async function touchUserLastSeen(
  userId: string,
  force = false,
): Promise<void> {
  const now = new Date();
  try {
    if (force) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: now },
      });
      return;
    }

    const staleBefore = new Date(now.getTime() - HEARTBEAT_WRITE_INTERVAL_MS);
    await prisma.user.updateMany({
      where: {
        id: userId,
        OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: staleBefore } }],
      },
      data: { lastSeenAt: now },
    });
  } catch (e) {
    console.error("Failed to update lastSeenAt", e);
  }
}
