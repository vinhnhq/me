---
title: Checks, not promises: how I keep an AI agent's work honest
date: 2026-11-25
description: An agent says "done" easily. This is the loop I use so that "done" is something a script can show: rules, decision records, zero changed pixels, and a gate.
tags: ai-agents, testing, workflow
---

An AI coding agent is fast, and it is always confident. It will tell you a change is finished, tested and safe in the same calm voice whether that is true or not. For a while my answer was to read everything it wrote. That does not scale, and it is not even reliable: I get tired, and the agent does not.

So I changed the question. I stopped asking the agent "is it done?" and started asking "what would show that it is done?". If the answer is a command that prints pass or fail, the agent can work towards it without me. If there is no such command, the first job is to write one.

This site is the example. Its code is public: [github.com/vinhnhq/me](https://github.com/vinhnhq/me). I use the same loop on client work.

## Where the idea came from

Two things I read in the same week pushed me to tidy this up: Lauren Tan's talk "All Code Is Slop (Except Mine)", about lint rules in place of comments and verification before trust, and Addy Osmani's article "Practical Loop Engineering", which describes a loop as a command, a condition a tool can check, and a limit. I only had the talk's description and chapter list, not its full text, so what I took from it is the direction, not the detail.

## Four moves

### 1. Comments became records

The code had 226 comments. Most were small decisions: why the menu is a native `<dialog>`, why one check compares against the screen's width. The same decisions were also written in the agent's instruction file, in other words, and the two copies had started to disagree.

Now there are no comments at all, and a script fails if one comes back. Each reason lives once, in a short decision record: what was decided, what was tried first and why it failed. There are 14 of them. The instruction file the agent reads at the start of a session went from 302 lines to 70, because it no longer has to explain anything. It only says where to look.

### 2. Warnings became rules

A warning in a document works only if the agent reads it and remembers it. A rule in a script works every time.

So every trap that can be tested is a rule now. "The résumé must not contain symbols the PDF cannot print." "Every link to the PDF is marked so search engines skip it." "The menu stays a native dialog." There are 15, each tied to its record.

A rule that cannot fail is decoration, so I tested the rules themselves: for each one I broke the code on purpose and checked that exactly that rule failed. All 15 did.

### 3. "It looks the same" became zero changed pixels

After a refactor, the agent says the page looks the same. I used to open the page and squint.

Now a script photographs 80 views of the site (four pages, three screen sizes, light and dark, the open menu, keyboard focus) and compares each with a saved picture. One changed pixel fails it. When I removed all 226 comments, the result was 80 of 80 with no pixel changed. That is a stronger statement than "looks fine to me".

Other checks cover what pictures cannot: touch targets of at least 44 pixels, text contrast, the accessibility rules a machine can test, and that the résumé's PDF is still exactly two pages.

### 4. One command, one gate

All of it runs from one command, and the same checks run on every pull request before anything can reach production. The agent works on a branch, opens a pull request and stops. It never merges and never deploys. One other agent reads the diff first: one maker, one checker, no more. Once a day a workflow checks the live site and opens an issue if something broke overnight.

## What the checks caught, including me

- A picture baseline taken from the live site differed from my local build by 12 pixels, in a place I had not touched. The cause was the hosting build, not my change. Without a pixel count I would never have known the two differ; with it, I learned to compare like with like.
- While waiting for a deploy, my own script asked the live site for pages too many times. The host started answering my address with a security page, and for a few minutes every check told me the site was down. It was not: a check run from another network passed. The lesson went into the records the same day.

## What it does not do

- It does not judge taste. Whether a page is good is still a person's call.
- It does not test a real finger on a real phone. I still tap through the simulators.
- A green pull request is not a full verification. The pixel check runs on my machine, because its pictures are my machine's rendering.

## What I would bring to a team

Not a tool. The habit of turning "be careful with X" into something that fails when X happens, and of writing each decision down once, where both people and agents will find it. The agent's speed is only useful when something other than the agent decides what done means.

The longer story of how I work with agents is in [How I build with AI agents](/blog/how-i-build-with-ai-agents).
