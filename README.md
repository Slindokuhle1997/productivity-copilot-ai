# Smart Work Hub

Build a modern, responsive web application called “Sli_AI Workplace Productivity Assistant”.

The application is an AI-powered workplace productivity platform designed to help professionals automate and improve common daily work activities, including writing emails, summarizing meetings, and planning/prioritizing tasks.

The final result must be a fully functional, interactive prototype, not a collection of static mockup screens.

The application should have a polished, modern SaaS appearance and clearly demonstrate the value of AI through complete workflows:

User Input → AI Processing → Structured AI Output → User Action



1. PRIMARY OBJECTIVES

The application must demonstrate these three core AI capabilities:

Smart Email Generator

Generate professional workplace emails based on context, audience and tone.

Meeting Notes Summarizer

Convert long meeting notes into a concise summary and extract key points, decisions, action items and deadlines.

AI Task Planner

Analyze workplace tasks, prioritize them and generate practical daily or weekly schedules.

The dashboard should bring these capabilities together into one cohesive productivity experience.



2. APPLICATION LAYOUT

Use a modern SaaS dashboard layout consisting of:

Left sidebar navigation

Top header

Main content area

Responsive card-based UI

Professional typography

Consistent spacing

Clear visual hierarchy

Subtle shadows and rounded cards

Professional blue/indigo accent colors

Sidebar navigation should include:

Dashboard

Email Generator

Meeting Summarizer

Task Planner

Settings

On mobile devices, convert the sidebar into a responsive/collapsible navigation.

The application must work correctly on:

Desktop

Tablet

Mobile

Avoid horizontal scrolling on smaller screens.



3. DASHBOARD

The Dashboard is the main landing page.

Display a welcome message and productivity overview.

Statistics cards

Include:

Emails Generated

Meetings Summarized

Tasks Planned

High-Priority Tasks

Upcoming Deadlines

Use realistic demo data so the dashboard looks populated when first opened.

Today's Priorities

Display a list of important tasks with:

Task name

Priority

Deadline

Estimated duration

Status

Use visual priority indicators such as:

Critical / Red

High / Orange

Medium / Yellow

Low / Green

Upcoming Deadlines

Show upcoming work deadlines in a compact card.

AI Productivity Insight

Include an AI-generated productivity recommendation based on the demo tasks.

For example:

“Complete the client presentation first because it has the closest deadline and requires the longest uninterrupted focus period.”

Quick Actions

Include prominent buttons:

Generate Email

Summarize Meeting

Plan My Day

Each button should navigate to the appropriate AI feature.



4. SMART EMAIL GENERATOR

Create a complete AI-powered email generation workflow.

Input section

Include the following fields:

Email Purpose

Text input describing what the email is about.

Audience

Allow the user to select:

Manager

Client

Colleague

Team

Executive

External Partner

Tone

Allow the user to select:

Formal

Friendly

Persuasive

Concise

Key Information

Provide a large text area where the user can enter relevant details, facts or talking points.

Desired Length

Allow:

Short

Medium

Detailed

Include a prominent:

Generate Email button.



5. EMAIL AI PROMPT ENGINEERING

Use structured prompt engineering for the email generator.

The AI prompt should define:

Role

The AI acts as a professional workplace communication assistant.

Objective

Generate a clear, professional email that achieves the user's stated objective.

Inputs

Use:

Purpose

Audience

Tone

Key information

Desired length

Instructions

The AI must:

Match the selected tone.

Adapt language to the selected audience.

Clearly communicate the user's objective.

Organize information logically.

Use professional workplace language.

Avoid unnecessary repetition.

Avoid inventing facts, dates, names or commitments that were not provided.

Produce a concise and useful email.

Expected output

Return:

Email subject

Email body



6. EMAIL RESULTS

Display the generated email in a polished result card/editor.

Show:

Subject

Email Body

Provide buttons for:

Copy

Edit

Regenerate

Clear

The user should be able to edit the generated email before using it.

Show a loading state while the AI is generating the email.

Disable the Generate button while processing.

If generation fails, show a helpful error message and a Retry button.



7. MEETING NOTES SUMMARIZER

Create a complete AI-powered meeting summarization workflow.

Inputs

Include:

Meeting title

Meeting date

Meeting notes

The Meeting Notes field should support long-form text.

Include a:

Summarize Meeting button.

Provide realistic sample meeting notes that users can load as demo data.



8. MEETING AI PROMPT ENGINEERING

Use structured prompt engineering.

The AI should act as a professional meeting assistant.

The prompt should instruct the AI to:

Understand the meeting context.

Identify the most important information.

Remove unnecessary repetition.

Produce a concise professional summary.

Extract key discussion points.

Identify decisions.

Identify action items.

Identify responsible people when explicitly mentioned.

Identify deadlines and dates when explicitly mentioned.

Never invent information that does not appear in the meeting notes.



9. MEETING SUMMARY OUTPUT

Do not display the result as one large block of text.

Present the output in clearly separated sections:

Executive Summary

A concise overview of the meeting.

Key Points

Important topics discussed.

Decisions

Decisions made during the meeting.

Action Items

Display action items in a structured table or cards containing:

Task

Owner

Deadline

Status

Only show an owner or deadline if it can be identified from the notes.

Deadlines

Clearly highlight extracted dates and deadlines.

AI Follow-Up Suggestions

Provide useful follow-up recommendations based only on the meeting information.



10. MEETING ACTIONS

Provide:

Copy Summary

Copy Action Items

Regenerate

Clear

Show a loading state during AI processing.

Show a helpful error state with Retry if processing fails.



11. AI TASK PLANNER

Create an AI-powered task planning and prioritization system.

Users should be able to add multiple workplace tasks.

Each task should support:

Task name

Description

Deadline

Estimated duration

Importance

Urgency

Allow users to:

Add tasks

Edit tasks

Delete tasks

Mark tasks complete

Change task priority

Include realistic demo tasks when the application first loads.



12. AI TASK PRIORITIZATION

Use structured prompt engineering for task prioritization.

The AI should evaluate tasks using:

Deadline proximity

Urgency

Importance

Estimated duration

Workload

Dependencies where identifiable

Assign one of:

Critical

High

Medium

Low

The AI should provide a short explanation for each priority.

Example:

High Priority — Client presentation

Reason: The deadline is today, the task is marked highly important, and it requires two hours of focused work.

Do not invent deadlines or task information.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://productivity-copilot-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/45d06bc1-012d-4378-bdee-4000ce35a93e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
