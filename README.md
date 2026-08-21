# lean-orchestration

Route every non-trivial Claude Code task for the highest-quality output per token.

Quality comes from adversarial *framing*, which is free text, and from *fresh context*, which is not. Two things cost money: a dispatch, which buys a worker its own context and its own read, and a byte admitted to the main context, which is then re-billed on every turn that follows. The second is the one most cost advice leaves unpriced. This plugin encodes one rule: maximum framing, fewest fresh contexts, fewest bytes resident in the main one.

## What it installs

| Component | What it does |
| --- | --- |
| `lean-orchestration` skill | The routing procedure: anti-trigger, escalation ladder, cost model. |
| `navigator` agent | Read-only. Answers one precise question about code you will not edit, returns anchors plus only load-bearing lines. |
| `finder` / `finder-lite` agent | Read-only. Reviews one slice through one named lens (code-defect, spec-conformance, design-critique). |
| `skeptic` / `skeptic-max` agent | Adversarial. Tries to refute a finding it did not author, at the burden direction you state. |
| `/lean` command | Enter lean mode explicitly for the current task. |
| Autostart hook | Injects the skill body at session start, so routing is in force from your first message. |

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

## The autostart hook

The skill's description excludes small work, so left to model judgment it fires inconsistently. Running `/lean` by hand at the top of a session fixes that, and it stays fixed for the rest of the session.

The hook does that for you. On session start it injects the skill body itself, so routing is in force before your first message. There is no per-message cost: the body lands once and then sits in the cached prefix.

Earlier versions did less. A per-prompt nudge cost tokens on every message and only ever pointed at the skill, so any real task paid for the nudge *and* the skill. A session-start version then injected an instruction to load the skill, which left one step that could fail: the model could acknowledge without invoking. Injecting the body removes that step, and costs less than the instruction plus the load it used to trigger.

Measured across 72 local sessions, against the load-by-instruction version: with the hook, the skill loaded in 8 of 9 sessions (89%); without it, in 6 of 63 (10%). The skill description alone does not reliably fire, which is the whole reason this hook exists. Injecting the body should sit above that 89 percent, because there is no longer an invocation to skip.

A cheaper variant, injecting only the anti-trigger and letting the model decide whether to load, was tried and reverted. It saves roughly 3 to 4 percent of session spend and hands that 89 percent back to model judgment, with no signal when routing quietly stops firing. The body is 13 KB, roughly 3.3k tokens, against sessions that routinely run 200k to 500k prefixes, so it is not the expensive part. If that cost ever needs cutting, split the core so autostart loads only the route table and defers the cost model, rather than deferring the load itself.

It fires on `startup`, `clear`, and `compact`, so a compaction that summarizes the body away re-arms it. It does not fire on `resume`, because a resumed transcript already carries the skill.

Requires `node` on your PATH. Hook failures are silent, so a missing Node costs you the autostart and nothing else, and an unreadable `SKILL.md` degrades to asking the model to load the skill itself. You can still invoke `/lean-orchestration:lean` yourself.

### Turning it off

The plugin asks when you enable it. Answer no and autostart stays off; the rest of the plugin works normally and you load the skill yourself with `/lean-orchestration:lean`.

To change your mind later, edit the `autostart` value the plugin saved in your `settings.json`. For a one-off session, or if you installed the skill without the plugin, set `LEAN_ORCHESTRATION_AUTOSTART=off` in the environment; it overrides the saved setting.

Do not edit `hooks/hooks.json` to disable it: plugin files are replaced on update.

## Effort

The session's effort level is the user's cost intent. A role may pin below it (`finder-lite`) for genuinely light work. No role may pin above it, with one exception: `skeptic-max`, because the proof-burden pass is the one place where being wrong is expensive enough to justify the overspend.

At a low session effort, skip a marginal skeptic rather than dispatch a weak one. A low-effort skeptic rubber-stamps, which is worse than no skeptic, because it launders an unverified finding into a verified one.

## License

MIT
