# Mahmudul Haque — portfolio & Log

## What to edit

| Update | File |
| --- | --- |
| Profile, experience, skills, education, projects, achievements, About Me, contact | [content/portfolio.json](content/portfolio.json) |
| Section titles and order | `sections` in the same JSON file |
| Photo | Replace [public/assets/images/profile.jpg](public/assets/images/profile.jpg) |
| Résumé | Replace [public/resume/resume.pdf](public/resume/resume.pdf) |
| Log articles and videos | Markdown files in [content/posts/](content/posts/) |

**Instructions:** [Add, edit, or delete portfolio information](docs/PORTFOLIO.md) · [Add, edit, or delete Log entries](docs/LOG.md)

## Preview your changes

Run commands from this repository's folder. First-time setup requires Python 3.12+:

```sh
python -m pip install -r requirements.txt
```

After each edit:

```sh
python scripts/build.py
```

Start the local server if it is not already running:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory _site
```

Open [the local preview](http://127.0.0.1:4173/). After later edits, rebuild and refresh.

## Publish your changes

```sh
git add .
git commit -m "Update portfolio content"
git push origin main
```

This includes all current repository changes. GitHub Actions tests, builds, and publishes to [mhtafhim.github.io](https://mhtafhim.github.io/). Wait for the [latest workflow](https://github.com/mhtafhim/mhtafhim.github.io/actions) to finish. Pages must use **Settings → Pages → Source → GitHub Actions**, which is already configured.

## Folder guide

- `content/`: editable portfolio data and Markdown writing.
- `public/`: images, résumé, styles, and scripts.
- `src/`: page layouts and reusable section templates.
- `scripts/` and `tests/`: building and validation.
- `docs/`: editing instructions.
- `archive/`: old files, no longer used.
- `_site/`: generated website; **never edit this folder**.

Optional checks: `python -m unittest discover -s tests -v`.
