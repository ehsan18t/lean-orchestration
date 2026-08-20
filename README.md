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
| Autostart hook | Loads the skill once at session start, so routing is in force from your first message. |

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

The hook does that for you. On session start it injects one instruction that loads the skill, so routing is in force before your first message. There is no per-message cost: the skill body lands once and then sits in the cached prefix.

Earlier versions nudged on every prompt instead. That cost tokens on every message and only ever pointed at the skill, so any real task paid for the nudge *and* the skill. Loading once is both cheaper and stronger.

It fires on `startup` and `clear`. It does not fire on `resume`, because a resumed transcript already carries the skill. After a heavy compaction the skill body can be summarized away; if you notice routing has stopped, run the command by hand.

Requires `node` on your PATH. Hook failures are silent, so a missing Node costs you the autostart and nothing else. You can still invoke `/lean-orchestration:lean` yourself.

### Turning it off

The plugin asks when you enable it. Answer no and autostart stays off; the rest of the plugin works normally and you load the skill yourself with `/lean-orchestration:lean`.

To change your mind later, edit the `autostart` value the plugin saved in your `settings.json`. For a one-off session, or if you installed the skill without the plugin, set `LEAN_ORCHESTRATION_AUTOSTART=off` in the environment; it overrides the saved setting.

Do not edit `hooks/hooks.json` to disable it: plugin files are replaced on update.

## Effort

The session's effort level is the user's cost intent. A role may pin below it (`finder-lite`) for genuinely light work. No role may pin above it, with one exception: `skeptic-max`, because the proof-burden pass is the one place where being wrong is expensive enough to justify the overspend.

At a low session effort, skip a marginal skeptic rather than dispatch a weak one. A low-effort skeptic rubber-stamps, which is worse than no skeptic, because it launders an unverified finding into a verified one.

## License

MIT
