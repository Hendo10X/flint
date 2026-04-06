import { getBaseURL, authClient } from "@/lib/auth-client";

function headers(): Record<string, string> {
  const cookies = (authClient as any).getCookie?.();
  return {
    "Content-Type": "application/json",
    ...(cookies ? { Cookie: cookies } : {}),
  };
}

function url(path: string) {
  return `${getBaseURL()}${path}`;
}

export async function apiFetchTasks(): Promise<{ tasks: any[]; streak: number }> {
  const res = await fetch(url("/api/tasks"), { headers: headers(), credentials: "omit" });
  if (!res.ok) throw new Error(`fetch tasks failed: ${res.status}`);
  return res.json();
}

export async function apiCreateTask(body: {
  id: string;
  title: string;
  taskType?: string | null;
  difficulty?: number | null;
  firstAction?: string | null;
}): Promise<any> {
  const res = await fetch(url("/api/tasks"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    credentials: "omit",
  });
  if (!res.ok) throw new Error("create task failed");
  return res.json();
}

export async function apiPatchTask(id: string, body: Record<string, unknown>): Promise<any> {
  const res = await fetch(url(`/api/tasks/${id}`), {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(body),
    credentials: "omit",
  });
  if (!res.ok) throw new Error("patch task failed");
  return res.json();
}

export async function apiDeleteTask(id: string): Promise<void> {
  await fetch(url(`/api/tasks/${id}`), {
    method: "DELETE",
    headers: headers(),
    credentials: "omit",
  });
}
