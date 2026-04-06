import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks, streaks } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [taskRows, streakRows] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), isNull(tasks.completedAt))),
    db.select().from(streaks).where(eq(streaks.userId, userId)).limit(1),
  ]);

  return Response.json({
    tasks: taskRows,
    streak: streakRows[0]?.currentStreak ?? 0,
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, title, taskType = null, difficulty = null, firstAction = null } = body;

  if (!title?.trim()) {
    return Response.json({ error: "Title required" }, { status: 400 });
  }

  const [row] = await db
    .insert(tasks)
    .values({
      id: id ?? crypto.randomUUID(),
      userId: session.user.id,
      title: title.trim(),
      taskType,
      difficulty,
      firstAction,
      status: "active",
    })
    .returning();

  return Response.json(row);
}
