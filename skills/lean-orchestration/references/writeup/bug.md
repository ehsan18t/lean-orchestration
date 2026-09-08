CSV import drops the last row without a trailing newline

Uploading an employee spreadsheet whose final line has no trailing newline imports every row but the last, and the success toast reports the smaller count as if it were complete. Any team that exports from Numbers hits it, since Numbers omits the final newline by default, and the missing employee is never invited. It reproduces in the bulk upload dialog on corporate onboarding, the HCP users page and the team members page alike, so the shared parser rather than any one screen is the suspected cause; files saved from Excel and Google Sheets end with a newline and import fully, which is why it went unnoticed.

**Steps to reproduce**
1. Save a two-row employee spreadsheet as CSV without a trailing newline (Numbers does this by default).
2. Open Team members and choose Bulk upload.
3. Upload the file and confirm.

**Expected**: two employees are created and the toast reads "2 employees imported".
**Actual**: one employee is created and the toast reads "1 employee imported"; no error is shown.
**Environment**: production build 2026.09.1, Chrome 129 and Safari 18 on macOS, admin role; every time.

**Acceptance criteria**
1. A CSV whose last line has no trailing newline imports every row, including the last.
2. The count in the toast equals the number of data rows in the file.
3. A test in the shared parser covers a file without a trailing newline and fails on the current code.
