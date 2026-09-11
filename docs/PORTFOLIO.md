# Edit portfolio information

Open [content/portfolio.json](../content/portfolio.json). All portfolio text is edited here.

## Find the right section

| Field | Information |
| --- | --- |
| `profile` | Name, role, employer, summary, links, photo, and hero facts |
| `experience` | Jobs and work details |
| `skills.core` / `skills.toolkit` | Main skills / expandable full list |
| `education` | Degrees, universities, dates, and results |
| `projects.featured` / `research` / `web` / `more` | The four groups inside `projects` |
| `achievements` | Featured achievements, recognition, and community |
| `about` | Introduction, location notes, and languages |
| `contact` | Email, availability, and contact description |
| `sections` | Section order and headings |

## Add, edit, update, or delete

- **Add:** copy a complete existing entry (`{ ... }`) inside the correct list (`[ ... ]`), then replace its text. Separate entries with commas.
- **Edit/update:** change the values inside quotes. Keep field names such as `role` or `degree` unchanged.
- **Delete:** remove the entry's entire `{ ... }` block and its separating comma. Leave `[]` when a list is empty.
- **Reorder:** move entries up or down in their list. They appear in that order.
- **Hide a section:** remove its entry from `sections`; keep its content elsewhere in the JSON to restore it later.

For example, add this object inside `experience`:

```json
{
  "role": "Software Engineer",
  "organization": "Company name",
  "period": "January 2027 — present",
  "current": true,
  "highlights": [
    { "label": "Main contribution", "text": "What you built and its impact." }
  ],
  "details": [
    { "title": "More details", "paragraphs": ["Additional information."] }
  ],
  "technologies": ["C++", "Python"]
}
```

Set an old job's `current` to `false` when it ends. Update `profile.role`, `profile.employer`, hero facts, and contact information when those change too.

**Required fields:** jobs need `role`, `organization`, and `period`; education needs `degree`, `institution`, and `period`; featured/web/research projects need `name` and `description`. Copy existing entries for optional fields.

**Expandable details:** use `details` for jobs, education, and featured/web/research projects. Each group needs a `title`, plus a `paragraphs` list and/or a `bullets` list.

## Headings, photo, and résumé

- In `sections`, edit `title` to rename a heading. Optional `nav_label` shortens its menu label. Keep IDs unchanged and unique. Move entries to reorder sections; Contact stays last in the menu.
- Replace `public/assets/images/profile.jpg` to update your photo. If the filename changes, update `profile.photo.src` (relative to `public/`) and `alt`. Remove the `photo` object to hide it.
- Replace `public/resume/resume.pdf` to update your résumé. Keep the filename; its download link updates automatically.

## Save and publish

Save the file, run `python scripts/build.py`, then refresh the local preview. [Commit and push](../README.md#publish-your-changes) to update the live website.

Use double quotes, no comma after the last entry, and `true` / `false` without quotes. Values are plain text, not HTML. The build reports invalid fields or the line containing a JSON error.
