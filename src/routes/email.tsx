import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Copy, RefreshCw, Trash2, Mail, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { generateEmail } from "@/lib/ai.functions";
import { bumpStat } from "@/lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator | Sli_AI" },
      {
        name: "description",
        content:
          "Generate professional workplace emails tailored to your audience, tone and length with Sli_AI.",
      },
      { property: "og:title", content: "Smart Email Generator | Sli_AI" },
      {
        property: "og:description",
        content: "Draft workplace emails in seconds with audience and tone control.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const audiences = ["Manager", "Client", "Colleague", "Team", "Executive", "External Partner"];
const tones = ["Formal", "Friendly", "Persuasive", "Concise"];
const lengths = ["Short", "Medium", "Detailed"];

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("Manager");
  const [tone, setTone] = useState("Formal");
  const [keyInfo, setKeyInfo] = useState("");
  const [length, setLength] = useState("Medium");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [hasResult, setHasResult] = useState(false);

  async function generate() {
    if (!purpose.trim()) {
      toast.error("Add the purpose of the email first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await run({ data: { purpose, audience, tone, keyInfo, length } });
      setSubject(res.subject);
      setBody(res.body);
      setHasResult(true);
      bumpStat("emails");
      toast.success("Email drafted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while drafting the email.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setSubject("");
    setBody("");
    setHasResult(false);
    setError(null);
  }

  return (
    <AppLayout
      title="Smart Email Generator"
      subtitle="Describe the situation and Sli_AI writes the email"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Email brief</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Email purpose</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Ask my manager to approve extra budget for the Q3 campaign"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyinfo">Key information</Label>
              <Textarea
                id="keyinfo"
                rows={7}
                value={keyInfo}
                onChange={(e) => setKeyInfo(e.target.value)}
                placeholder="Facts, numbers, dates or talking points the email must include."
              />
            </div>

            <div className="space-y-2">
              <Label>Desired length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengths.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" size="lg" onClick={generate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Writing your email…
                </>
              ) : (
                <>
                  <Mail className="size-4" /> Generate Email
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="surface-card flex flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Generated email</h2>
            {hasResult && (
              <span className="text-xs text-muted-foreground">Editable before sending</span>
            )}
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/8 p-4">
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
              <Button className="mt-3" variant="outline" size="sm" onClick={generate}>
                Retry
              </Button>
            </div>
          )}

          {loading && !hasResult && (
            <div className="mt-6 space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
              <div className="h-24 animate-pulse rounded bg-secondary" />
              <div className="h-24 animate-pulse rounded bg-secondary" />
            </div>
          )}

          {!loading && !hasResult && !error && (
            <p className="mt-8 text-sm text-muted-foreground">
              Your drafted email will appear here with subject and body, ready to edit and copy.
            </p>
          )}

          {hasResult && (
            <div className="mt-5 flex flex-1 flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="flex flex-1 flex-col space-y-2">
                <Label htmlFor="bodytext">Body</Label>
                <Textarea
                  id="bodytext"
                  className="min-h-[320px] flex-1"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
                    toast.success("Email copied");
                  }}
                >
                  <Copy className="size-4" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
                  <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Regenerate
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="size-4" /> Clear
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
