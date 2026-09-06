import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-3.6-flash";

async function callAI(system: string, user: string): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this app yet.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("The assistant is busy right now. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted for this workspace. Please add credits to continue.");
    throw new Error(`The assistant could not complete this request (${res.status}). ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("The assistant returned an empty response. Please try again.");
  return content;
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(slice) as T;
  } catch {
    throw new Error("The assistant returned an unexpected format. Please try again.");
  }
}

/* ---------------- Email generator ---------------- */

export type EmailResult = { subject: string; body: string };

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        purpose: z.string().min(1),
        audience: z.string().min(1),
        tone: z.string().min(1),
        keyInfo: z.string().default(""),
        length: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<EmailResult> => {
    const system = [
      "ROLE: You are a professional workplace communication assistant.",
      "OBJECTIVE: Write a clear, professional email that achieves the user's stated objective.",
      "INSTRUCTIONS:",
      "- Match the requested tone exactly.",
      "- Adapt vocabulary and formality to the audience.",
      "- Communicate the objective clearly and organise information logically.",
      "- Use professional workplace language; avoid repetition and filler.",
      "- NEVER invent facts, figures, dates, names, links or commitments that were not provided.",
      "- Respect the requested length: short = under 90 words, medium = 90-180 words, detailed = 180-320 words.",
      'OUTPUT: Return strict JSON only: {"subject": string, "body": string}. The body uses plain text with line breaks, no markdown.',
    ].join("\n");

    const user = [
      `Purpose: ${data.purpose}`,
      `Audience: ${data.audience}`,
      `Tone: ${data.tone}`,
      `Desired length: ${data.length}`,
      `Key information:\n${data.keyInfo || "(none provided)"}`,
    ].join("\n");

    return parseJson<EmailResult>(await callAI(system, user));
  });

/* ---------------- Meeting summarizer ---------------- */

export type MeetingResult = {
  executiveSummary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: Array<{ task: string; owner?: string | undefined; deadline?: string | undefined; status?: string | undefined }>;
  deadlines: Array<{ item: string; date: string }>;
  followUps: string[];
};

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        title: z.string().default(""),
        date: z.string().default(""),
        notes: z.string().min(10),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<MeetingResult> => {
    const system = [
      "ROLE: You are a professional meeting assistant.",
      "OBJECTIVE: Turn raw meeting notes into a concise, structured, professional summary.",
      "INSTRUCTIONS:",
      "- Understand the meeting context and identify the most important information.",
      "- Remove repetition and small talk.",
      "- Extract key discussion points, decisions, action items, owners and deadlines.",
      "- Only include an owner or deadline when it is explicitly stated in the notes.",
      "- NEVER invent information that does not appear in the notes.",
      "- Follow-up suggestions must be grounded only in the meeting content.",
      "OUTPUT: strict JSON only with keys:",
      '{"executiveSummary": string, "keyPoints": string[], "decisions": string[], "actionItems": [{"task": string, "owner": string|null, "deadline": string|null, "status": string}], "deadlines": [{"item": string, "date": string}], "followUps": string[]}',
    ].join("\n");

    const user = [
      `Meeting title: ${data.title || "(not provided)"}`,
      `Meeting date: ${data.date || "(not provided)"}`,
      `Notes:\n${data.notes}`,
    ].join("\n");

    const parsed = parseJson<MeetingResult>(await callAI(system, user));
    return {
      executiveSummary: parsed.executiveSummary ?? "",
      keyPoints: parsed.keyPoints ?? [],
      decisions: parsed.decisions ?? [],
      actionItems: (parsed.actionItems ?? []).map((a) => ({
        task: a.task,
        owner: a.owner ?? undefined,
        deadline: a.deadline ?? undefined,
        status: a.status || "Not started",
      })),
      deadlines: parsed.deadlines ?? [],
      followUps: parsed.followUps ?? [],
    };
  });

/* ---------------- Task planner ---------------- */

export type PlanResult = {
  prioritized: Array<{ id: string; priority: "Critical" | "High" | "Medium" | "Low"; reason: string }>;
  schedule: Array<{ time: string; task: string; note?: string }>;
  insight: string;
};

export const prioritizeTasks = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        horizon: z.enum(["day", "week"]).default("day"),
        tasks: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().default(""),
              deadline: z.string().default(""),
              duration: z.string().default(""),
              importance: z.string().default(""),
              urgency: z.string().default(""),
            }),
          )
          .min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<PlanResult> => {
    const system = [
      "ROLE: You are a workplace planning and prioritisation assistant.",
      "OBJECTIVE: Prioritise the given tasks and build a practical schedule.",
      "EVALUATE using: deadline proximity, urgency, importance, estimated duration, total workload and any dependencies you can identify from the task text.",
      'ASSIGN each task exactly one priority: "Critical", "High", "Medium" or "Low".',
      "Give a short, concrete reason for each priority (one or two sentences) referencing the actual deadline, importance or duration.",
      "NEVER invent deadlines, durations or task details that were not provided.",
      `Build a realistic ${data.horizon === "week" ? "weekly plan (use weekday labels as time slots)" : "daily schedule (use clock time ranges within a normal work day)"}.`,
      "OUTPUT: strict JSON only:",
      '{"prioritized": [{"id": string, "priority": string, "reason": string}], "schedule": [{"time": string, "task": string, "note": string}], "insight": string}',
      "insight is a single actionable productivity recommendation.",
    ].join("\n");

    const user = `Today is ${new Date().toISOString().slice(0, 10)}.\nTasks:\n${JSON.stringify(data.tasks, null, 2)}`;

    const parsed = parseJson<PlanResult>(await callAI(system, user));
    return {
      prioritized: parsed.prioritized ?? [],
      schedule: parsed.schedule ?? [],
      insight: parsed.insight ?? "",
    };
  });
