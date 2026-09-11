# Résumé PDF

Put your current résumé in this folder with the exact filename **resume.pdf**.

The source path is `public/resume/resume.pdf`. Replace that file whenever you update your résumé. Keep the filename unchanged.

Then run `python scripts/build.py` for a local preview, or commit and push the replacement PDF to trigger the configured Pages workflow. The build publishes it at `/resume/resume.pdf` and automatically adds **Download résumé ↓** beside the hero's Email, LinkedIn, and GitHub links. The downloaded filename is `Mahmudul-Haque-Resume.pdf`.

The link includes a version based on the PDF contents, so a replacement gets a fresh URL without editing HTML. When the PDF is absent, the link is hidden to avoid a broken download. The supplied `CV.pdf` has been installed as `resume.pdf`.

This README is not published. Use a PDF intended for public download.
