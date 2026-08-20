# lean-orchestration

Route every non-trivial Claude Code task for the highest-quality output per token.

Quality comes from adversarial *framing*, which is free text, and from *fresh context*, which is not. Every subagent dispatch re-pays its overhead and its read. This plugin encodes one rule: maximum framing, fewest fresh contexts.

## What it installs

| Component | What it does |
| --- | --- |
| `lean-orchestration` skill | The routing procedure: anti-trigger, escalation ladder, cost model. |
| `navigator` agent | Read-only. Answers one precise question about code you will not edit, returns anchors plus only load-bearing lines. |
| `finder` / `finder-lite` agent | Read-only. Reviews one slice through one named lens (code-defect, spec-conformance, design-critique). |
| `skeptic` / `skeptic-max` agent | Adversarial. Tries to refute a finding it did not author, at the burden direction you state. |
| `/lean` command | Enter lean mode explicitly for the current task. |
| Step 0 hook | Enforces the anti-trigger on every prompt, on by default. |

## Install

```
/plugin marketplace add ehsan18t/lean-orchestration
/plugin install lean-orchestration
```

## The escalation ladder

Rungs are entry depths, not a sequence. Enter where the stakes land.

```
0. Your own check, inline            free, and it already happened
1. Gates (tests / typecheck / lint)  deterministic, near free. ALWAYS first
2. One adversarial skeptic           buys INDEPENDENCE, not verification
3. Small panel (2-3 skeptics)        high blast-radius or auto-applied changes only
4. Proof-burden pass (skeptic-max)   critical findings only
```

Never pay an LLM to find what a gate finds for free, or to repeat a check you already made. Rungs 2 and up buy exactly one thing the main loop cannot: a reader who did not author the claim. Dispatching to "double-check" is not that, and produces over-verification instead of correctness.

## The Step 0 hook

The skill's own description excludes small work, so left to model judgment it fires inconsistently. The hook closes that gap: it prepends roughly 55 tokens to each prompt telling the model to run the anti-trigger and emit a Route line before any fan-out.

It does not inline the full procedure. Loading all of it on a trivial turn gives you the brakes with no steering, which the skill warns about directly. The nudge points at the skill, and the model loads it only when Step 0 says the task warrants it.

To disable without uninstalling, remove the `UserPromptSubmit` block from `hooks/hooks.json`.

## Effort

The session's effort level is the user's cost intent. A role may pin below it (`finder-lite`) for genuinely light work. No role may pin above it, with one exception: `skeptic-max`, because the proof-burden pass is the one place where being wrong is expensive enough to justify the overspend.

At a low session effort, skip a marginal skeptic rather than dispatch a weak one. A low-effort skeptic rubber-stamps, which is worse than no skeptic, because it launders an unverified finding into a verified one.

## License

MIT
