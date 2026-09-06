import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Copy,
  RefreshCw,
  Trash2,
  FileText,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { summarizeMeeting, type MeetingResult } from "@/lib/ai.functions";
import { bumpStat } from "@/lib/store";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer | Sli_AI" },
      {
        name: "description",
        content:
          "Turn long meeting notes into an executive summary, decisions, action items and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer | Sli_AI" },
      {
        property: "og:description",
        content: "Structured meeting summaries with owners, deadlines and follow-ups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

const sampleNotes = `Attendees: Thabo (Product), Naledi (Design), Ryan (Engineering), Slindokuhle (PM)

Thabo opened by saying the Q3 onboarding revamp is behind by about a week because the analytics events were not instrumented. Ryan confirmed engineering finished the new signup API on Tuesday but the events work is still open. He said he can complete instrumentation by 18 September.

Naledi walked through the redesigned onboarding checklist. The team liked the three-step version much more than the five-step version. There was a long back and forth about whether to keep the progress bar, and we agreed to keep it but make it smaller.

We decided to launch to 10% of new users first instead of a full rollout. Slindokuhle will prepare the rollout plan and share it with the group before Friday.

Support raised that the current help article does not match the new flow. Naledi said she will not have capacity, so Slindokuhle will ask the content team.

Pricing page changes were mentioned but we agreed to park that discussion for the next session.

Ryan also flagged that the load tests have not been run. No date agreed for that yet.`;

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingResult | null>(null);

  async function summarize() {
    if (notes.trim().length < 30) {
      toast.error("Paste the meeting notes first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await run({ data: { title, date, notes } });
      setResult(res);
      bumpStat("meetings");
      toast.success("Meeting summarised");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while summarising.");
    } finally {
      setLoading(false);
    }
  }

  function copySummary() {
    if (!result) return;
    const text = [
      `Executive summary\n${result.executiveSummary}`,
      `\nKey points\n${result.keyPoints.map((k) => `- ${k}`).join("\n")}`,
      `\nDecisions\n${result.decisions.map((d) => `- ${d}`).join("\n")}`,
    ].join("\n");
    void navigator.clipboard.writeText(text);
    toast.success("Summary copied");
  }

  function copyActions() {
    if (!result) return;
    const text = result.actionItems
      .map(
        (a) =>
          `- ${a.task}${a.owner ? ` (Owner: ${a.owner})` : ""}${a.deadline ? ` — due ${a.deadline}` : ""}`,
      )
      .join("\n");
    void navigator.clipboard.writeText(text);
    toast.success("Action items copied");
  }

  return (
    <AppLayout
      title="Meeting Notes Summarizer"
      subtitle="Long notes in, structured outcomes out"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="surface-card h-fit p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Meeting details</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mtitle">Meeting title</Label>
              <Input
                id="mtitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q3 onboarding revamp sync"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mdate">Meeting date</Label>
              <Input
                id="mdate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mnotes">Meeting notes</Label>
                <button
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    setNotes(sampleNotes);
                    setTitle("Q3 onboarding revamp sync");
                  }}
                >
                  Load sample notes
                </button>
              </div>
              <Textarea
                id="mnotes"
                rows={14}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste the raw notes or transcript here…"
              />
            </div>
            <Button className="w-full" size="lg" onClick={summarize} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Summarising…
                </>
              ) : (
                <>
                  <FileText className="size-4" /> Summarize Meeting
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          {error && (
            <div className="surface-card border-destructive/30 p-5">
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
              <Button className="mt-3" variant="outline" size="sm" onClick={summarize}>
                Retry
              </Button>
            </div>
          )}

          {loading && (
            <div className="surface-card space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
              <div className="h-20 animate-pulse rounded bg-secondary" />
              <div className="h-20 animate-pulse rounded bg-secondary" />
            </div>
          )}

          {!loading && !result && !error && (
            <div className="surface-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Your structured summary — key points, decisions, action items and deadlines — will
                appear here.
              </p>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={copySummary}>
                  <Copy className="size-4" /> Copy Summary
                </Button>
                <Button variant="secondary" size="sm" onClick={copyActions}>
                  <Copy className="size-4" /> Copy Action Items
                </Button>
                <Button variant="outline" size="sm" onClick={summarize}>
                  <RefreshCw className="size-4" /> Regenerate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                  <Trash2 className="size-4" /> Clear
                </Button>
              </div>

              <Section title="Executive summary" icon={<FileText className="size-4 text-primary" />}>
                <p className="leading-relaxed text-foreground">{result.executiveSummary}</p>
              </Section>

              {result.keyPoints.length > 0 && (
                <Section title="Key points" icon={<Lightbulb className="size-4 text-primary" />}>
                  <ul className="space-y-2">
                    {result.keyPoints.map((k, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {result.decisions.length > 0 && (
                <Section
                  title="Decisions"
                  icon={<CheckCircle2 className="size-4 text-priority-low" />}
                >
                  <ul className="space-y-2">
                    {result.decisions.map((d, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-priority-low" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {result.actionItems.length > 0 && (
                <div className="surface-card p-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="size-4 text-primary" /> Action items
                  </h3>
                  <div className="mt-3 -mx-5 overflow-x-auto px-5">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="py-2 pr-3 font-medium">Task</th>
                          <th className="py-2 pr-3 font-medium">Owner</th>
                          <th className="py-2 pr-3 font-medium">Deadline</th>
                          <th className="py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.actionItems.map((a, i) => (
                          <tr key={i} className="border-b border-border/60 last:border-0">
                            <td className="py-3 pr-3">{a.task}</td>
                            <td className="py-3 pr-3 text-muted-foreground">{a.owner || "—"}</td>
                            <td className="py-3 pr-3 text-muted-foreground">{a.deadline || "—"}</td>
                            <td className="py-3">
                              <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs">
                                {a.status || "Not started"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.deadlines.length > 0 && (
                <Section
                  title="Deadlines"
                  icon={<CalendarClock className="size-4 text-priority-high" />}
                >
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {result.deadlines.map((d, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-priority-high/30 bg-priority-high/8 px-3 py-2"
                      >
                        <span className="block text-foreground">{d.item}</span>
                        <span className="text-xs font-semibold text-priority-high">{d.date}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {result.followUps.length > 0 && (
                <Section
                  title="AI follow-up suggestions"
                  icon={<Lightbulb className="size-4 text-primary" />}
                >
                  <ul className="space-y-2">
                    {result.followUps.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
