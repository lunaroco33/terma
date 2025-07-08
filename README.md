# Terma

This is a library of process for developing software with LLMs, specifically Claude Code.

Copy/clone the contents of `out` into `~/.claude/commands` to install these across all projects.

## Quick Start

Use `/orient` to begin each session. Use `/research :question` to probe the codebase and write a report to `/research`. Then, use `/plan` or just `/feature` to plan a change to the application.

Use `/implement` to spin up one or more well-instructed subagents to implement the plan.

You may find use for `/debug`, `/code-review`, `/harden` after implementation.

When you are at a known good start (i.e. about to commit) use `/progress` to write a progress report and update `LOG.md`, then commit w/ the `.md` file included. `/next-up` is like `/progress` but moves straight on to whatever additional task you provide.

You can use `/bug-report` to interactiely gather and record context for known issues, and use `/resolve` to resolve them.

We currently assume a protocol of `LOG.md`, `BUGS.md`, `SPEC.md`, `CLAUDE.md` etc. but this will and should be customized to fit.

## Patterns

- feature dev: `/orient`, `/feature`, `/implement`, `/progress`, `/compact` (loop)
  - then: `/code-review`

- bugs: `/bug-report`, `/debug`, `/resolve`, `/code-review`

- tech spike: `/prototype`, `/debug`

- improve codebase architecture: `/orient`, `/research`, `/decompose`, `/code-review`
