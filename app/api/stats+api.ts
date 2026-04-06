import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tasks, streaks } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [allTasks, streakRows] = await Promise.all([
    db.select().from(tasks).where(eq(tasks.userId, userId)),
    db.select().from(streaks).where(eq(streaks.userId, userId)).limit(1),
  ]);

  const streakData = streakRows[0] ?? { currentStreak: 0, longestStreak: 0 };

  const weekStarted = allTasks.filter(
    (t) => t.startedAt && t.startedAt >= sevenDaysAgo
  ).length;

  const weekCompleted = allTasks.filter(
    (t) => t.completedAt && t.completedAt >= sevenDaysAgo
  ).length;

  const now = new Date();
  const dailyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(now.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
    const started = allTasks.filter(
      (t) => t.startedAt && t.startedAt.toISOString().split("T")[0] === dateStr
    ).length;
    return { date: dateStr, day: dayLabel, started };
  });

  const ratedTasks = allTasks.filter((t) => t.difficulty !== null);
  const avgDifficulty =
    ratedTasks.length > 0
      ? ratedTasks.reduce((sum, t) => sum + (t.difficulty ?? 0), 0) / ratedTasks.length
      : 0;

  return Response.json({
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    weekStarted,
    weekCompleted,
    dailyActivity,
    avgDifficulty: Math.round(avgDifficulty * 10) / 10,
  });
}
