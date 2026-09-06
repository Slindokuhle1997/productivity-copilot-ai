import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  AlertCircle,
  CalendarClock,
  Clock,
  Check,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { prioritizeTasks, type PlanResult } from "@/lib/ai.functions";
import {
  useTasks,
  priorityStyles,
  deadlineLabel,
  bumpStat,
  type Task,
  type Priority,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | Sli_AI" },
      {
        name: "description",
        content:
          "Add workplace tasks and let Sli_AI prioritise them and build a practical daily or weekly plan.",
      },
      { property: "og:title", content: "AI Task Planner | Sli_AI" },
      {
        property: "og:description",
        content: "Prioritised tasks with reasons and a realistic schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

const levels = ["High", "Medium", "Low"] as const;
const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];

const emptyDraft = {
  name: "",
  description: "",
  deadline: new Date().toISOString().slice(0, 10),
  duration: "1h",
  importance: "Medium" as (typeof levels)[number],
  urgency: "Medium" as (typeof levels)[number],
};

function TasksPage() {
  const run = useServerFn(prioritizeTasks);
  const { tasks, setTasks } = useTasks();
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<"day" | "week">("day");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanResult | null>(null);

  function saveTask() {
    if (!draft.name.trim()) {
      toast.error("Give the task a name.");
      return;
    }
    if (editingId) {
      setTasks(tasks.map((t) => (t.id === editingId ? { ...t, ...draft } : t)));
      toast.success("Task updated");
    } else {
      const task: Task = {
        id: crypto.randomUUID(),
        ...draft,
        priority: "Medium",
        completed: false,
      };
      setTasks([...tasks, task]);
      toast.success("Task added");
    }
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function editTask(t: Task) {
    setEditingId(t.id);
    setDraft({
      name: t.name,
      description: t.description,
      deadline: t.deadline,
      duration: t.duration,
      importance: t.importance,
      urgency: t.urgency,
    });
  }

  async function planTasks() {
    const open = tasks.filter((t) => !t.completed);
    if (open.length === 0) {
      toast.error("Add at least one open task.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await run({
        data: {
          horizon,
          tasks: open.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            deadline: t.deadline,
            duration: t.duration,
            importance: t.importance,
            urgency: t.urgency,
          })),
        },
      });
      setPlan(res);
      setTasks(
        tasks.map((t) => {
          const p = res.prioritized.find((x) => x.id === t.id);
          return p ? { ...t, priority: p.priority, reason: p.reason } : t;
        }),
      );
      bumpStat("tasksPlanned", open.length);
      toast.success("Plan ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while planning.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="AI Task Planner" subtitle="Prioritise your workload and build a real plan">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <section className="surface-card h-fit p-5 sm:p-6">
          <h2 className="text-sm font-semibold">{editingId ? "Edit task" : "Add a task"}</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tname">Task name</Label>
              <Input
                id="tname"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Prepare board update"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tdesc">Description</Label>
              <Textarea
                id="tdesc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="What needs to happen and why it matters."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tdl">Deadline</Label>
                <Input
                  id="tdl"
                  type="date"
                  value={draft.deadline}
                  onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tdur">Estimated duration</Label>
                <Input
                  id="tdur"
                  value={draft.duration}
                  onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                  placeholder="1h 30m"
                />
              </div>
              <div className="space-y-2">
                <Label>Importance</Label>
                <Select
                  value={draft.importance}
                  onValueChange={(v) =>
                    setDraft({ ...draft, importance: v as (typeof levels)[number] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select
                  value={draft.urgency}
                  onValueChange={(v) =>
                    setDraft({ ...draft, urgency: v as (typeof levels)[number] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={saveTask}>
                <Plus className="size-4" /> {editingId ? "Save changes" : "Add task"}
              </Button>
              {editingId && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setDraft(emptyDraft);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <Label className="mb-2 block">Plan horizon</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as "day" | "week")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
              </SelectContent>
            </Select>
            <Button className="mt-3 w-full" size="lg" onClick={planTasks} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Prioritising…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Prioritise & Plan
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          {error && (
            <div className="surface-card border-destructive/30 p-5">
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
              </p>
              <Button className="mt-3" variant="outline" size="sm" onClick={planTasks}>
                Retry
              </Button>
            </div>
          )}

          {plan && !loading && (
            <div className="surface-card brand-gradient p-5 text-primary-foreground">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4" /> AI recommendation
              </h3>
              <p className="mt-2 text-sm/relaxed opacity-95">{plan.insight}</p>
            </div>
          )}

          {plan && plan.schedule.length > 0 && !loading && (
            <div className="surface-card p-5">
              <h3 className="text-sm font-semibold">
                {horizon === "week" ? "Weekly plan" : "Suggested schedule for today"}
              </h3>
              <ul className="mt-3 space-y-2">
                {plan.schedule.map((s, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-secondary/50 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="shrink-0 text-xs font-semibold text-primary sm:w-32">
                      {s.time}
                    </span>
                    <span className="text-sm font-medium">{s.task}</span>
                    {s.note && (
                      <span className="text-xs text-muted-foreground sm:ml-auto">{s.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your tasks</h3>
              <span className="text-xs text-muted-foreground">
                {tasks.filter((t) => !t.completed).length} open
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className={cn(
                    "rounded-xl border border-border p-4 transition-colors",
                    t.completed && "opacity-60",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={t.completed}
                      onCheckedChange={(v) =>
                        setTasks(
                          tasks.map((x) => (x.id === t.id ? { ...x, completed: Boolean(v) } : x)),
                        )
                      }
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            t.completed && "line-through",
                          )}
                        >
                          {t.name}
                        </p>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                            priorityStyles[t.priority],
                          )}
                        >
                          {t.priority}
                        </span>
                      </div>
                      {t.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="size-3.5" /> {t.deadline} ·{" "}
                          {deadlineLabel(t.deadline)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" /> {t.duration}
                        </span>
                        <span>Importance: {t.importance}</span>
                        <span>Urgency: {t.urgency}</span>
                      </div>
                      {t.reason && (
                        <p className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Why: </span>
                          {t.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Select
                        value={t.priority}
                        onValueChange={(v) =>
                          setTasks(
                            tasks.map((x) =>
                              x.id === t.id ? { ...x, priority: v as Priority } : x,
                            ),
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-[112px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => editTask(t)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {tasks.length === 0 && (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  <Check className="mx-auto mb-2 size-5" /> No tasks yet — add one on the left.
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
