# Add, edit, or delete Log entries

Each entry is one Markdown file in [content/posts/](../content/posts/). The site discovers entries automatically.

## Add an entry

1. Copy [content/post-template.md](../content/post-template.md) into `content/posts/`.
2. Rename the copy, for example `my-first-tech-video.md`. Use lowercase letters, numbers, and hyphens.
3. Fill in the information between the `---` lines, then write below it.
4. Set `draft: false` when ready to publish.

```markdown
---
title: "What I learned this week"
date: "2026-09-11"
summary: "A short description for the Log list."
category: "Technology"
type: Article
draft: false
sample: false
---

Write your introduction here.

## What happened

Write your story or technical notes.

## What I learned

Share your conclusions.
```

## Edit, update, hide, or delete

| Action | What to do |
| --- | --- |
| Edit/update | Open the existing Markdown file and change its text or metadata. |
| Hide temporarily | Set `draft: true`. Restore with `draft: false`. |
| Delete | Delete the Markdown file from `content/posts/`. |
| Replace a sample | Rewrite the sample entry and set `sample: false`. |

Keep filenames unchanged after publishing: the filename determines the URL. Hiding or deleting an entry removes its article page after the next build, so its old `/log/...` link will no longer work. Drafts are hidden from the site but remain visible in a public GitHub repository.

## Metadata and videos

- `title`, `date`, `summary`, and `category` are required. Dates use `YYYY-MM-DD`.
- Categories can be anything, such as Personal or Technology; topic filters update automatically.
- Use `type: Article` or `type: Video`. Entries appear newest first.
- A future date does **not** schedule publishing. Keep `draft: true` until ready.
- Add a real YouTube URL between the `---` lines to show **Watch video ↗**:

```yaml
type: Video
youtube: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
```

Replace the placeholder with your real video ID. Articles can also have a YouTube link. Written content is required unless the entry is a Video with a YouTube URL.

## Write in Markdown

- `## Heading` and `### Subheading` create the left section outline. The title is added automatically.
- Use `**bold**`, `*italic*`, `[link text](https://example.com)`, and `- list item`.
- Put code between lines of three backticks; put its language (for example `python`) after the opening backticks.
- Put images in `public/assets/log/`; reference them as `![Description](../assets/log/photo.jpg)`.
- Use Markdown, not raw HTML. The right related-entry list updates automatically.

## Preview and publish

Save, run `python scripts/build.py`, and refresh [the local Log](http://127.0.0.1:4173/log.html). [Start the preview server](../README.md#preview-your-changes) if needed.

[Commit and push to main](../README.md#publish-your-changes) to publish additions, edits, and deletions. Never edit generated files in `_site/`.
