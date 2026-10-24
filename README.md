# Context Dashboard

A Claude Code mod that shows where your context window is going. Type `/context-dashboard` and a pane opens beside the transcript with:

- one full-width bar for how much of the window is used, and the model's name;
- every `/context` category as a row, in its own colour, with a bar, a token count and its share of the window (free space and the compaction buffer drawn hollow);
- your five largest memory files, your five largest MCP tools (on-demand tools marked), and what the skill list costs.

It refreshes when a session starts and after every turn, using the local estimate, so it makes no extra token-count calls and sends nothing anywhere.

## Install

At the prompt of a terminal session:

```
/plugin install context-dashboard --marketplace WashC-904/context-dashboard
```

From a shell:

```
claude plugin install context-dashboard --marketplace WashC-904/context-dashboard
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `WashC-904/context-dashboard`, then **Add plugin**.

Answer `y` to add the marketplace, then choose a scope.

## Use

Type `/context-dashboard`. Close the pane with its close mark.

## How it works

Hooks `session.start` and `turn.complete` read `$.session.usage({ breakdown: 'summary' })` and keep the result in the mod's own state; a `ui.render` hook draws the pane from it. Everything is in `hooks/register.tsx` and `hooks/dash.ts`.
