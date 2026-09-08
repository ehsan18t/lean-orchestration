Let a provider resume onboarding where they left off

A provider who leaves HCP onboarding partway through comes back to the step they were on, with everything they entered still there, instead of starting again at Team. Today the flow restarts from the first step on every visit, and a provider with six coverage types to configure rarely finishes in one sitting, so most abandon it and phone support to finish. Progress is saved when the provider leaves a step, not on every keystroke, so a browser closed in the middle of a step loses that step's unsaved fields; that is deliberate, and the completed steps are untouched.

**Acceptance criteria**
1. Reopening onboarding after leaving it lands on the step that was open when the provider left, with every saved field populated.
2. A coverage type left half-configured shows its saved tiers and benefit values, with unsaved fields empty.
3. A provider who has submitted for approval sees Review, read-only, and cannot reopen earlier steps.
4. Resuming works after signing out and back in on another device.
