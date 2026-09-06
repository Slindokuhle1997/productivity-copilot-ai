import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Mail,
  FileText,
  ListChecks,
  Flame,
  CalendarClock,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { useStats, useTasks, priorityStyles, deadlineLabel, daysUntil } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sli_AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Write emails, summarise meetings and plan your day with an AI assistant built for busy professionals.",
      },
      { property: "og:title", content: "Sli_AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "One AI workspace for emails, meeting summaries and task prioritisation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("flex size-8 items-center justify-center rounded-lg bg-secondary text-primary", accent)}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { stats } = useStats();
  const { tasks } = useTasks();

  const open = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const highPriority = open.filter((t) => t.priority === "Critical" || t.priority === "High");
  const upcoming = useMemo(
    () =>
      [...open]
        .filter((t) => daysUntil(t.deadline) <= 7)
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
        .slice(0, 5),
    [open],
  );
  const priorities = useMemo(
    () =>
      [...open].sort((a, b) => {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;
        const p = order[a.priority] - order[b.priority];
        return p !== 0 ? p : daysUntil(a.deadline) - daysUntil(b.deadline);
      }),
    [open],
  );

  const top = priorities[0];

  return (
    <AppLayout title="Dashboard" subtitle="Your productivity overview for today">
      <section className="surface-card brand-gradient mb-6 p-6 text-primary-foreground sm:p-8">
        <p className="text-sm opacity-90">Welcome back, Slindokuhle</p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
          You have {open.length} open tasks and {highPriority.length} that need attention today.
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="lg">
            <Link to="/email">
              <Mail className="size-4" /> Generate Email
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/meetings">
              <FileText className="size-4" /> Summarize Meeting
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/tasks">
              <ListChecks className="size-4" /> Plan My Day
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Emails Generated" value={stats.emails} icon={<Mail className="size-4" />} />
        <StatCard
          label="Meetings Summarized"
          value={stats.meetings}
          icon={<FileText className="size-4" />}
        />
        <StatCard
          label="Tasks Planned"
          value={stats.tasksPlanned}
          icon={<ListChecks className="size-4" />}
        />
        <StatCard
          label="High-Priority Tasks"
          value={highPriority.length}
          icon={<Flame className="size-4" />}
          accent="bg-priority-high/12 text-priority-high"
        />
        <StatCard
          label="Upcoming Deadlines"
          value={upcoming.length}
          icon={<CalendarClock className="size-4" />}
          accent="bg-priority-critical/12 text-priority-critical"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Today's priorities</h3>
            <Link
              to="/tasks"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Open planner <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {priorities.slice(0, 5).map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-3.5" /> {deadlineLabel(t.deadline)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" /> {t.duration}
                    </span>
                    <span>{t.completed ? "Completed" : "In progress"}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    priorityStyles[t.priority],
                  )}
                >
                  {t.priority}
                </span>
              </li>
            ))}
            {priorities.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Everything is done. Nice work.
              </li>
            )}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="surface-card p-5">
            <h3 className="text-sm font-semibold">Upcoming deadlines</h3>
            <ul className="mt-4 space-y-3">
              {upcoming.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.deadline}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      daysUntil(t.deadline) <= 1
                        ? priorityStyles.Critical
                        : priorityStyles.Medium,
                    )}
                  >
                    {deadlineLabel(t.deadline)}
                  </span>
                </li>
              ))}
              {upcoming.length === 0 && (
                <li className="text-sm text-muted-foreground">Nothing due in the next week.</li>
              )}
            </ul>
          </section>

          <section className="surface-card border-primary/25 bg-accent/40 p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" /> AI productivity insight
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {top
                ? `Start with "${top.name}" — ${top.reason ?? `it is ${deadlineLabel(top.deadline).toLowerCase()} and needs about ${top.duration} of focused work.`}`
                : "You have no open tasks. Use the planner to capture what's next."}
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/tasks">
                <Sparkles className="size-4" /> Re-plan with AI
              </Link>
            </Button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
