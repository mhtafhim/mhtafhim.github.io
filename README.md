# Mahmudul Haque — portfolio & Log

A static portfolio with a Markdown-powered Log, system-aware light/dark themes, and a replaceable PDF résumé. All generated website files live in `_site/`; edit the source folders instead.

## Repository map

```text
.github/workflows/      GitHub Pages build, tests, and publishing
content/
  posts/                Published and draft Markdown entries
  drafts/               Unpublished working notes
  post-template.md      Copy this to start an entry
  legacy-urls.json      Historical article slugs for redirects
docs/                   Authoring, résumé, and deployment instructions
public/
  assets/               Live CSS, JavaScript, icons, and images
  resume/               Replace resume.pdf here
src/
  pages/                Portfolio HTML templates and static redirects
  templates/log/        Log index, entry, and compatibility templates
scripts/build.py        Builds the complete site
tests/                  Build, Markdown, routing, and résumé checks
archive/legacy/         Retired source material; never published
_site/                  Generated output; ignored by Git
requirements.txt        Pinned Python build dependencies
```

## Preview

Use Python 3.12 or newer. From the repository root:

```sh
python -m pip install -r requirements.txt
python scripts/build.py
python -m http.server 4173 --bind 127.0.0.1 --directory _site
```

Open `http://127.0.0.1:4173/` for the portfolio or `/log.html` for Tafhim’s Log. Rerun the build and refresh after editing source, Markdown, or the résumé. `_site/` is disposable and rebuilt cleanly; never edit or store source files there.

## Common updates

- **Portfolio content:** edit `src/pages/index.html`.
- **Styles and behavior:** edit `public/assets/css/` and `public/assets/js/`.
- **Log entries:** add a Markdown file in `content/posts/`. See [Writing a Log entry](docs/LOG.md).
- **Résumé:** place or replace `public/resume/resume.pdf`. See [Résumé updates](docs/RESUME.md).
- **Images:** put them under `public/assets/`; published URLs begin with `/assets/`.

The résumé download link appears beside Email, LinkedIn, and GitHub when a PDF is present. The supplied PDF is installed at `public/resume/resume.pdf`.

## Build and publish

```sh
python -m unittest discover -s tests -v
python scripts/build.py
```

The included GitHub Actions workflow tests and builds on pull requests, and publishes `_site/` after pushes to `main`. Set **Repository Settings → Pages → Source → GitHub Actions** once before using it. Local edits do not publish anything.

The public URLs remain unchanged by this folder reorganization: `/`, `/log.html`, `/log/slug.html`, and `/resume/resume.pdf`. Old `/blog.html`, known `/blog/slug.html`, and `post.html?slug=...` URLs retain redirects. Add a retired slug to `content/legacy-urls.json` if its old Blog URL must keep working after its Markdown file is removed.

Only `public/` assets, rendered page templates, generated Log entries, and compatibility routes enter `_site/`. Markdown files, drafts, documentation, archives, tests, and build scripts are excluded. Markdown README files within `public/` are also excluded.

## Content and visual conventions

Keep planned relocation distinct from current residence and university projects distinct from employment. Use confirmed information and keep private contact details out of public content.

The interface uses neutral surfaces with restrained orange accents, supports system/light/dark appearance, and honors reduced-motion settings. The Log supports Article and Video entries, optional YouTube links, search, topic/format filters, a left outline, and related entries on the right. See [Log authoring](docs/LOG.md) for details.
