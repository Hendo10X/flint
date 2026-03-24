import { create } from "zustand";
import {
  apiFetchTasks,
  apiCreateTask,
  apiPatchTask,
  apiDeleteTask,
} from "@/lib/task-api";
import { toast } from "@/store/toast";

export interface Task {
  id: string;
  title: string;
  taskType: string | null;
  difficulty: number | null;
  firstAction: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface TaskStore {
  tasks: Task[];
  streak: number;
  lastStartDate: string | null;
  addSheetOpen: boolean;
  openAddSheet: () => void;
  closeAddSheet: () => void;
  loadTasks: () => Promise<void>;
  addTask: (title: string, difficulty?: number | null, taskType?: string | null, firstAction?: string | null) => Promise<void>;
  removeTask: (id: string) => void;
  setFirstAction: (id: string, action: string) => void;
  startTask: (id: string) => void;
  completeTask: (id: string) => void;
}

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

function dbRowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    taskType: row.taskType ?? null,
    difficulty: row.difficulty ?? null,
    firstAction: row.firstAction ?? null,
    startedAt: row.startedAt ? new Date(row.startedAt).toISOString() : null,
    completedAt: row.completedAt ? new Date(row.completedAt).toISOString() : null,
  };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  streak: 0,
  lastStartDate: null,
  addSheetOpen: false,
  openAddSheet: () => set({ addSheetOpen: true }),
  closeAddSheet: () => set({ addSheetOpen: false }),

  loadTasks: async () => {
    try {
      const { tasks: rows, streak } = await apiFetchTasks();
      set({ tasks: rows.map(dbRowToTask), streak });
    } catch {
      toast("Couldn't load tasks. Check your connection.");
    }
  },

  addTask: async (title, difficulty = null, taskType = null, firstAction = null) => {
    const id = uuid();
    set((s) => ({
      tasks: [
        ...s.tasks,
        { id, title, taskType, difficulty, firstAction, startedAt: null, completedAt: null },
      ],
    }));

    try {
      await apiCreateTask({ id, title, taskType, difficulty, firstAction });
    } catch {
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      toast("Couldn't save task. Try again.");
    }
  },

  removeTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    apiDeleteTask(id).catch(() => toast("Couldn't delete task. Try again."));
  },

  setFirstAction: (id, firstAction) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, firstAction } : t)),
    }));
    apiPatchTask(id, { firstAction }).catch(() => toast("Couldn't update task."));
  },

  startTask: (id) => {
    const { tasks: current, streak, lastStartDate } = get();
    const task = current.find((t) => t.id === id);
    if (!task || task.startedAt) return;

    const startedAt = new Date().toISOString();
    const today = todayStr();

    // Optimistic streak update — mirrors server logic
    let newStreak = streak;
    if (lastStartDate !== today) {
      newStreak = lastStartDate === yesterdayStr() ? streak + 1 : 1;
    }

    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, startedAt } : t)),
      streak: newStreak,
      lastStartDate: today,
    }));

    apiPatchTask(id, { startedAt: true }).catch(() => toast("Couldn't start task. Try again."));
  },

  completeTask: (id) => {
    const completedAt = new Date().toISOString();
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, completedAt } : t)),
    }));
    apiPatchTask(id, { completedAt: true }).catch(() => toast("Couldn't complete task. Try again."));
  },
}));

export function sortedActive(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => !t.completedAt)
    .sort((a, b) => {
      if (a.difficulty === null && b.difficulty === null) return 0;
      if (a.difficulty === null) return 1;
      if (b.difficulty === null) return -1;
      return a.difficulty - b.difficulty;
    });
}
