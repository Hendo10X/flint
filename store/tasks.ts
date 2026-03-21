import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  taskType: string | null;
  difficulty: number | null; // 1=easy 2=medium 3=hard, null = unset
  firstAction: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface TaskStore {
  tasks: Task[];
  streak: number;
  lastStartDate: string | null;
  addTask: (title: string, difficulty?: number | null, taskType?: string | null) => void;
  removeTask: (id: string) => void;
  setFirstAction: (id: string, action: string) => void;
  startTask: (id: string) => void;
  completeTask: (id: string) => void;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  streak: 0,
  lastStartDate: null,

  addTask: (title, difficulty = null, taskType = null) =>
    set((s) => ({
      tasks: [
        ...s.tasks,
        {
          id: Date.now().toString(),
          title,
          taskType,
          difficulty,
          firstAction: null,
          startedAt: null,
          completedAt: null,
        },
      ],
    })),

  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  setFirstAction: (id, firstAction) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, firstAction } : t)),
    })),

  startTask: (id) => {
    const { lastStartDate, streak, tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task || task.startedAt) return;

    const today = todayStr();
    let newStreak = streak;
    if (lastStartDate !== today) {
      newStreak = lastStartDate === yesterdayStr() ? streak + 1 : 1;
    }

    set((s) => ({
      streak: newStreak,
      lastStartDate: today,
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, startedAt: new Date().toISOString() } : t
      ),
    }));
  },

  completeTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, completedAt: new Date().toISOString() } : t
      ),
    })),
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
