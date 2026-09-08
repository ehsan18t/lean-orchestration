Add the shared onboarding shell

This is the second of the four and the last one before the two redesigns. It adds the twelve components that the HCP and corporate onboarding flows both render: the shell and its rail, the rail account block, the progress indicator and status pill, the team panel with its invite and CSV import sheets, the roles reference, the tooltip and the compact value. It exists so that neither redesign owns the chrome the other one needs. Without it, corporate would have to sit on top of HCP and could not ship until HCP shipped.

Nothing renders these components yet, which is deliberate. They arrive with their own translation namespace and are judged by the typecheck, the linter and a read against the branch they came from, where the same code runs. The one change that is live for users sits alongside them: the onboarding shell imports the same employee spreadsheet the bulk upload dialog already imported, so the parser, the download and the required column list move out of that dialog into shared utilities. That is a move rather than a copy, and the dialog is rewired in the same pull request so the app never ends up carrying two employee CSV parsers. The dialog is rendered by corporate onboarding, the HCP users page and the team members page, so those three screens are where to look if anything behaves differently.

**Acceptance criteria**
1. The twelve components export from the shared onboarding package and pass the typecheck and the linter with no new suppressions.
2. Their strings resolve from the new onboarding translation namespace and no key falls back to the default locale.
3. No screen renders the new components; the app's routes are unchanged.
4. A search for the employee CSV parser finds one implementation, in the shared utilities, and the bulk upload dialog imports it from there.
5. The bulk upload dialog imports a file, downloads the template and rejects a file missing a required column exactly as before on corporate onboarding, the HCP users page and the team members page.
