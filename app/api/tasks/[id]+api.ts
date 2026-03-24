import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks, streaks, streakEvents } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

function getId(request: Request): string {
  return new URL(request.url).pathname.split("/").pop() ?? "";
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const id = getId(request);
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json();

  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .limit(1);

  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if ("firstAction" in body) {
    updates.firstAction = body.firstAction;
  }
  if ("startedAt" in body && !existing.startedAt) {
    updates.startedAt = new Date();
  }
  if ("completedAt" in body && !existing.completedAt) {
    updates.completedAt = new Date();
    updates.status = "completed";
  }

  if (Object.keys(updates).length === 0) {
    return Response.json(existing);
  }

  const [updated] = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, id))
    .returning();

  if (updates.startedAt) {
    await recordStreakEvent(userId);
  }

  return Response.json(updated);
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = getId(request);
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)));

  return Response.json({ ok: true });
}

async function recordStreakEvent(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const inserted = await db
    .insert(streakEvents)
    .values({ id: crypto.randomUUID(), userId, eventDate: today })
    .onConflictDoNothing()
    .returning();

  if (inserted.length === 0) return;

  const [existing] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.userId, userId))
    .limit(1);

  const newStreak =
    existing?.lastActivityDate === yesterday ? (existing.currentStreak ?? 0) + 1 : 1;
  const newLongest = Math.max(newStreak, existing?.longestStreak ?? 0);

  await db
    .insert(streaks)
    .values({ userId, currentStreak: newStreak, longestStreak: newLongest, lastActivityDate: today })
    .onConflictDoUpdate({
      target: streaks.userId,
      set: { currentStreak: newStreak, longestStreak: newLongest, lastActivityDate: today },
    });
}
