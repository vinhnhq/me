# ADR-014: Deploying, and the working loop

## Status

Accepted

## Date

2026-11-23

## Context

Until 2026-11-23 changes were committed on `main` and pushed when the owner said "deploy". The
sister project adopted a tighter loop that day (rules in place of prose, a gate on every pull
request, a daily check, one issue at a time), and the owner asked for the same here. The
owner also decided to make this repository public, as an example of a product built with an
agent.

## Decision

- **A change is a pull request.** Branch from `main`, open a pull request, and the owner merges.
  A merge to `main` deploys production on Vercel; any other branch deploys a preview.
- **An agent never merges and never deploys.** It opens the pull request and stops.
- **Every pull request runs the fast gate** (`.github/workflows/checks.yml`): `check:comments`,
  `check:rules`, react-doctor at 100, the build, typecheck, then the audit and the PDF's page
  count against the build.
- **The live site is checked every day** (`.github/workflows/daily.yml`, 01:00 UTC, 08:00 in
  Vietnam): the audit against https://vinhn.dev and the PDF's page count. A failure opens an
  issue labelled `daily-check` and `agent-ready`, or comments on the open one. No agent runs.
- **A trap that can be tested is a rule** in `check:rules`. `CLAUDE.md` keeps only what a script
  cannot test.
- **Issues carry the queue**: `agent-ready` for work an agent can finish against the checks,
  `needs-owner` for what waits on the owner.
- **`/daily`** reads the state and works at most one `agent-ready` issue. **`/work-issue N`** is
  the bounded goal: fixed, `verify` passes, within five tries; it stops early when a third try
  changes nothing or when a check would have to be weakened.
- **One maker, one checker.** The agent that wrote a change has one independent reviewer read
  the diff.

## Alternatives considered

- **Pushing to `main` with the gate afterwards.** The previous way. A gate that runs after the
  deploy reports a broken site; it does not prevent one.

## Consequences

- The gate does not run `check:visual` (its baseline is one machine's rendering) or the
  simulators. A green pull request is not a full verification; `bun run verify` on the owner's
  Mac is.
- The workflows use GitHub Actions minutes.
