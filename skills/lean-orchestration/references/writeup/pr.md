Move the employee CSV parser into shared utilities

Moves `parseEmployeeCsv`, the template download and `REQUIRED_EMPLOYEE_COLUMNS` out of `BulkUploadDialog` into `lib/employee-csv` and rewires the dialog to import them, so the onboarding shell (ENS-1951) can import the same parser instead of carrying a second one. The dialog's behavior is unchanged; the diff is a move plus three import paths.

**Verified**: typecheck and lint clean; the dialog's existing tests pass unchanged; a 40-row file imported on corporate onboarding, the HCP users page and the team members page, with the template download checked on each. Not run: the end-to-end suite, which does not cover bulk upload.

**Review first**: `lib/employee-csv/index.ts`, that the re-exports match the dialog's previous names.

Part of ENS-1951
