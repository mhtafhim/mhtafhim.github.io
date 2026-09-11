# Updating the résumé

1. Export your updated résumé as a PDF.
2. Save it as `public/resume/resume.pdf`, replacing the previous file.
3. Run `python scripts/build.py` for local preview, or commit and push the replacement to publish through the configured GitHub Pages workflow.

Use the same filename each time: **resume.pdf**. No HTML changes are required.

The homepage shows **Download résumé ↓** in the hero whenever that file exists. It downloads as `Mahmudul-Haque-Resume.pdf`. The public URL is `/resume/resume.pdf`; the link also includes a content-based version query so an updated PDF gets a fresh download URL.

The supplied `CV.pdf` is installed as `public/resume/resume.pdf`. If you remove it, the link stays hidden. The build rejects a file without a PDF header and preserves the previous build if validation fails. Removing the PDF and rebuilding removes the link and the previously generated PDF.

Use a PDF intended for public sharing. Other files placed in `public/` (except Markdown documentation) are also published, so keep private or older résumé versions elsewhere.
