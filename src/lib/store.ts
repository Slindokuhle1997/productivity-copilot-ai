import { useCallback, useEffect, useState } from "react";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export type Task = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  duration: string;
  importance: "High" | "Medium" | "Low";
  urgency: "High" | "Medium" | "Low";
  priority: Priority;
  completed: boolean;
  reason?: string;
};

export type Stats = {
  emails: number;
  meetings: number;
  tasksPlanned: number;
};

const TASKS_KEY = "sli-ai-tasks";
const STATS_KEY = "sli-ai-stats";

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const demoTasks: Task[] = [
  {
    id: "t1",
    name: "Finalise Q3 client presentation",
    description: "Consolidate results slides and rehearse the narrative for the Wednesday review.",
    deadline: iso(0),
    duration: "2h",
    importance: "High",
    urgency: "High",
    priority: "Critical",
    completed: false,
    reason: "Due today, highly important and needs a long uninterrupted focus block.",
  },
  {
    id: "t2",
    name: "Approve supplier contract renewal",
    description: "Review updated pricing terms from procurement and sign off.",
    deadline: iso(1),
    duration: "45m",
    importance: "High",
    urgency: "Medium",
    priority: "High",
    completed: false,
    reason: "Blocks procurement and the deadline is tomorrow.",
  },
  {
    id: "t3",
    name: "Write onboarding guide for new analyst",
    description: "Document tooling access, reporting cadence and first-week goals.",
    deadline: iso(3),
    duration: "1h 30m",
    importance: "Medium",
    urgency: "Medium",
    priority: "Medium",
    completed: false,
    reason: "Important for the new joiner but there is still buffer before the start date.",
  },
  {
    id: "t4",
    name: "Clean up shared reporting folder",
    description: "Archive old exports and rename inconsistent files.",
    deadline: iso(6),
    duration: "30m",
    importance: "Low",
    urgency: "Low",
    priority: "Low",
    completed: false,
    reason: "Low impact housekeeping that can fill a gap between meetings.",
  },
  {
    id: "t5",
    name: "Prepare budget variance summary",
    description: "Compare planned vs actual spend for the finance sync.",
    deadline: iso(2),
    duration: "1h",
    importance: "High",
    urgency: "High",
    priority: "High",
    completed: false,
    reason: "Finance sync depends on it and the deadline is in two days.",
  },
];

const defaultStats: Stats = { emails: 12, meetings: 7, tasksPlanned: 24 };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTasks(read<Task[]>(TASKS_KEY, demoTasks));
    setReady(true);
  }, []);

  const persist = useCallback((next: Task[]) => {
    setTasks(next);
    try {
      window.localStorage.setItem(TASKS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  return { tasks, setTasks: persist, ready };
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(defaultStats);

  useEffect(() => {
    setStats(read<Stats>(STATS_KEY, defaultStats));
  }, []);

  const bump = useCallback((key: keyof Stats, by = 1) => {
    setStats((prev) => {
      const next = { ...prev, [key]: prev[key] + by };
      try {
        window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { stats, bump };
}

export function bumpStat(key: keyof Stats, by = 1) {
  if (typeof window === "undefined") return;
  const current = read<Stats>(STATS_KEY, defaultStats);
  const next = { ...current, [key]: current[key] + by };
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export const priorityStyles: Record<Priority, string> = {
  Critical: "bg-priority-critical/12 text-priority-critical border-priority-critical/30",
  High: "bg-priority-high/12 text-priority-high border-priority-high/30",
  Medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/30",
  Low: "bg-priority-low/12 text-priority-low border-priority-low/30",
};

export function daysUntil(dateStr: string) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function deadlineLabel(dateStr: string) {
  const d = daysUntil(dateStr);
  if (Number.isNaN(d)) return dateStr;
  if (d < 0) return `Overdue by ${Math.abs(d)}d`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `In ${d} days`;
}
