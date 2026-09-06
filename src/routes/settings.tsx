import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { demoTasks } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Sli_AI Workplace Assistant" },
      {
        name: "description",
        content: "Manage your profile, default writing tone and workspace preferences in Sli_AI.",
      },
      { property: "og:title", content: "Settings | Sli_AI Workplace Assistant" },
      { property: "og:description", content: "Profile and AI preferences for your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("Slindokuhle");
  const [role, setRole] = useState("Product Manager");
  const [tone, setTone] = useState("Formal");
  const [hours, setHours] = useState("09:00 – 17:00");
  const [notify, setNotify] = useState(true);
  const [autoPlan, setAutoPlan] = useState(false);

  return (
    <AppLayout title="Settings" subtitle="Personalise how Sli_AI works for you">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Profile</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Job title</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Working hours</Label>
              <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold">AI preferences</h2>
          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label>Default email tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Formal", "Friendly", "Persuasive", "Concise"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-medium">Deadline reminders</p>
                <p className="text-xs text-muted-foreground">
                  Highlight tasks due within 24 hours on the dashboard.
                </p>
              </div>
              <Switch checked={notify} onCheckedChange={setNotify} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-medium">Auto-plan each morning</p>
                <p className="text-xs text-muted-foreground">
                  Re-prioritise open tasks at the start of every workday.
                </p>
              </div>
              <Switch checked={autoPlan} onCheckedChange={setAutoPlan} />
            </div>
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Workspace data</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your tasks and activity counts are stored in this browser. You can restore the demo
            content at any time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => toast.success("Preferences saved")}>Save preferences</Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem("sli-ai-tasks", JSON.stringify(demoTasks));
                localStorage.setItem(
                  "sli-ai-stats",
                  JSON.stringify({ emails: 12, meetings: 7, tasksPlanned: 24 }),
                );
                toast.success("Demo data restored — refresh to see it");
              }}
            >
              Reset demo data
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
