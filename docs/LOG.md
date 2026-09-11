# Writing a Log entry

**Tafhim’s Log** — Technology, experiences, and observations—in writing and video.

1. Copy `content/post-template.md` into `content/posts/`.
2. Give it a filename such as `my-first-month-in-germany.md`. Use lowercase letters, numbers, and hyphens. The filename becomes the permanent URL; keep it unchanged after publishing.
3. Fill in the metadata and write the article in Markdown.
4. Set `draft: false` when ready to publish.
5. Commit and push the Markdown file to `main`. The included GitHub Actions workflow discovers it and rebuilds the Log automatically after the one-time Pages setup below.

```markdown
---
title: "What I learned this week"
date: "2026-09-11"
summary: "A short description shown on the Log list."
category: "Personal"
type: Article
draft: false
---

Start with a short introduction. Do not repeat the title here.

## The experience

Write your story, notes, or observations.

### A lesson

Add a subsection if useful.

## Reflection

Your closing thoughts.
```

`title`, `date`, `summary`, and `category` are required. Dates use `YYYY-MM-DD`. Categories are free text: `Personal`, `Technology`, `Travel`, or anything else. They appear automatically in the topic filter. `draft` is optional and defaults to `false`; use an unquoted boolean.

`type` accepts `Article` or `Video` (case-insensitive). It defaults to `Article` for existing entries. Both types have their own page, section outline, related entries, and a visible format label. The format filter works together with search and topics. Video entries do not show an estimated video duration; the generator cannot infer it from a URL.

The generator discovers every `.md` file directly inside `content/posts/`. No manual post list or manifest is needed. Posts are ordered newest first. A future date does not schedule a post; use `draft: true` until ready.

## Markdown features

- `##` and `###` headings create the clickable section outline automatically, including unique links for repeated headings.
- Standard paragraphs, bold, italic, links, numbered and nested lists, blockquotes, and horizontal rules work.
- Use fenced code blocks with a language name, for example three backticks followed by `python`. Readers can copy code in supported secure browsers.
- Markdown tables and strikethrough are supported. Wide tables and code blocks scroll within the article on phones.
- Put images in `public/assets/log/`. Reference them as `![Descriptive alt text](../assets/log/photo.jpg)`. URLs are relative to the generated `log/your-post.html` page.
- Raw HTML is displayed as text. Write with Markdown rather than embedding scripts, iframes, or HTML widgets.

The generator adds the title, author, date, estimated reading time, other-posts sidebar, and older/newer links. Reading and section links work without JavaScript; search, active section tracking, theme overrides, and copy buttons enhance the static page.

## YouTube companion videos

Add an optional `youtube` field in front matter with your real HTTPS YouTube video URL. Both the index entry and its page display a restrained **Watch video ↗** link opening in a new tab. Nothing loads from YouTube until the link is followed. Articles can include companion videos without changing their type.

For a video-first entry, use:

```yaml
type: Video
youtube: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
```

Replace the placeholder with a real video URL before publishing. Write a short introduction, transcript, timestamps, or notes below the front matter using normal Markdown. The URL is optional for either type; without one, no Watch video link is displayed. A Video entry with a YouTube URL may omit the Markdown body. A Video without a URL requires written notes. This does not change its publication status: use `draft: true` for unfinished entries.

Suggested structure: keep a channel link beside GitHub and LinkedIn in the portfolio when your channel is ready; use individual video links on related Log entries; add a small Selected videos section later when you have several published videos. Personal vlogs fit in Personal or Video notes categories, while technical explanations fit in Technology. No channel or video URL has been invented for the sample posts.

Three illustrative sample posts are included with `sample: true`, which displays a sample notice and list labels. Replace their contents and set `sample: false` when they reflect your writing, or set `draft: true` to hide them.

## Preview locally

Install Python 3.12 or newer, then run from the repository root:

```sh
python -m pip install -r requirements.txt
python scripts/build.py
python -m http.server 4173 --bind 127.0.0.1 --directory _site
```

Open `http://127.0.0.1:4173/log.html`. Rerun the build command after changing Markdown or Log templates, then refresh. Generated pages and public assets are written only to `_site/`, including `log.html`, `log/*.html`, and `data/log-index.json`. Edit the Markdown and templates rather than generated HTML.

To preview exactly the public deployment:

```sh
python scripts/build.py
python -m http.server 4173 --bind 127.0.0.1 --directory _site
```

## One-time GitHub Pages setup

Before using automatic Markdown publishing, set **Repository Settings → Pages → Build and deployment → Source → GitHub Actions**. Commit the included `.github/workflows/pages.yml` with the rest of these changes. Subsequent pushes to `main` run tests, build the complete site, and deploy `_site/`. Pull requests build and test without deploying.

This setup follows [GitHub's custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). These local changes do not themselves update the repository setting or publish the site.

Drafts are excluded from generated pages and the deployment package. They are **not private** if their Markdown is committed to a public repository. Keep sensitive unfinished writing outside the repository. Deploy `_site/` via the workflow, not the source directory.

## Maintenance

- `src/templates/log/`: shared layout, archive, and article templates.
- `public/assets/css/log.css`: Log layout and Markdown typography.
- `public/assets/js/log.js`: search, table of contents, and code copying.
- `scripts/build.py`: file discovery and rendering.
- `python -m unittest discover -s tests -v`: generator checks.

The four original articles have been migrated without changing their wording. Old `post.html?slug=...` links forward to the corresponding new static article. The old `archive/legacy/posts.json` is retained only as a migration archive and is no longer read by the Log.

## Legacy URLs

- `blog.html` and `blog/` redirect to `log.html`.
- Each previously generated `blog/slug.html` redirects to `log/slug.html`. If an entry is removed or drafted, its known old URL redirects to the Log index instead.
- `post.html?slug=...` forwards to the matching `log/slug.html`; unknown entries offer a link to the Log index.
- JavaScript redirects preserve section fragments. Static legacy pages include a no-JavaScript refresh and a visible fallback link. Arbitrary unknown `/blog/*` paths cannot be wildcard-redirected by a plain GitHub Pages site.

The renamed generator is `scripts/build.py`, templates are in `src/templates/log/`, and dependencies are in `requirements.txt`. The canonical URLs and social metadata always point to `/log.html` or `/log/slug.html`.
