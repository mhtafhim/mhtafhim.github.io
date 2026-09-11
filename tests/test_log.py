from pathlib import Path
import shutil
import tempfile
import unittest

from scripts.build import ROOT, build, collect_posts, read_post, render_markdown


def article(title='Test post', draft='false', body='## A section\n\nSome text.'):
    return f'---\ntitle: "{title}"\ndate: "2026-09-11"\nsummary: "A summary."\ncategory: "Personal"\ndraft: {draft}\n---\n\n{body}\n'


class LogTests(unittest.TestCase):
    def test_new_files_are_discovered_and_drafts_excluded(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'first.md').write_text(article(), encoding='utf-8')
            (root / 'draft.md').write_text(article(draft='true'), encoding='utf-8')
            self.assertEqual([p['slug'] for p in collect_posts(root)], ['first'])
            (root / 'second.md').write_text(article('Another post'), encoding='utf-8')
            self.assertEqual(len(collect_posts(root)), 2)

    def test_unique_unicode_heading_ids_and_single_title_level(self):
        rendered, headings, _ = render_markdown('# Intro\n\n## Intro\n\n### বাংলায় লেখা\n\n## Intro-2')
        ids = [heading['id'] for heading in headings]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertNotIn('<h1', rendered)
        self.assertIn('বাংলায়-লেখা', rendered)

    def test_html_and_unsafe_links_are_not_executable(self):
        rendered, _, _ = render_markdown('<script>alert(1)</script>\n\n[bad](javascript:alert(1))')
        self.assertNotIn('<script>', rendered)
        self.assertNotIn('href="javascript:', rendered)

    def test_code_tables_and_nested_lists(self):
        rendered, _, _ = render_markdown('```cpp\nstd::cout << "Hello";\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n- A\n  - B')
        self.assertIn('language-cpp', rendered)
        self.assertIn('&lt;&lt;', rendered)
        self.assertIn('class="table-scroll"', rendered)
        self.assertEqual(rendered.count('<ul>'), 2)

    def test_invalid_date_and_quoted_draft_fail(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'post.md'
            path.write_text(article().replace('2026-09-11', 'not-a-date'), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'date'):
                read_post(path)
            path.write_text(article(draft='"false"'), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'draft'):
                read_post(path)

    def test_content_types_and_optional_video_url(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'entry.md'
            path.write_text(article(), encoding='utf-8')
            self.assertEqual(read_post(path)['content_type'], 'Article')
            path.write_text(article().replace('draft: false', 'draft: false\ntype: video'), encoding='utf-8')
            self.assertEqual(read_post(path)['content_type'], 'Video')
            path.write_text(article(body='').replace('draft: false', 'draft: false\ntype: Video\nyoutube: "https://youtu.be/example"'), encoding='utf-8')
            self.assertEqual(read_post(path)['content_type'], 'Video')
            path.write_text(article().replace('draft: false', 'draft: false\ntype: Podcast'), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'type'):
                read_post(path)

    def test_youtube_metadata_and_sample_flag(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'video.md'
            source = article().replace('draft: false', 'draft: false\nsample: true\nyoutube: "https://youtu.be/example"')
            path.write_text(source, encoding='utf-8')
            post = read_post(path)
            self.assertTrue(post['sample'])
            self.assertEqual(post['youtube'], 'https://youtu.be/example')
            for invalid in ('javascript:alert(1)', 'https://youtube.com.evil.example/watch', 'https://user@youtube.com/watch'):
                path.write_text(source.replace('https://youtu.be/example', invalid), encoding='utf-8')
                with self.assertRaisesRegex(ValueError, 'youtube'):
                    read_post(path)
            path.write_text(article(draft='"false"'), encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'draft'):
                read_post(path)

    def test_static_build_links_cleanup_and_public_package(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            shutil.copytree(ROOT / 'src', root / 'src')
            (root / 'content' / 'posts').mkdir(parents=True)
            (root / 'public').mkdir()
            (root / 'content' / 'legacy-urls.json').write_text('["first", "video"]', encoding='utf-8')
            source = root / 'content' / 'posts' / 'first.md'
            source.write_text(article('Escaped <title>'), encoding='utf-8')
            build(root)
            output = root / '_site'
            self.assertIn('log/first.html', (output / 'log.html').read_text(encoding='utf-8'))
            page = (output / 'log' / 'first.html').read_text(encoding='utf-8')
            self.assertIn('href="#section-a-section"', page)
            self.assertIn('Escaped &lt;title&gt;', page)
            self.assertIn('https://mhtafhim.github.io/log/first.html', page)
            self.assertIn('aria-current="page">Log', page)
            self.assertIn('href="../log/first.html"', (output / 'blog' / 'first.html').read_text(encoding='utf-8'))
            video = root / 'content' / 'posts' / 'video.md'
            video.write_text(article().replace('draft: false', 'draft: false\ntype: Video\nyoutube: "https://youtu.be/example"'), encoding='utf-8')
            build(root)
            self.assertIn('Watch video', (output / 'log' / 'video.html').read_text(encoding='utf-8'))
            video.write_text(article(draft='true'), encoding='utf-8')
            source.write_text(article(draft='true'), encoding='utf-8')
            (output / 'stale.txt').write_text('old generated output')
            build(root)
            self.assertFalse((output / 'log' / 'first.html').exists())
            self.assertFalse((output / 'stale.txt').exists())
            self.assertIn('href="../log.html"', (output / 'blog' / 'first.html').read_text(encoding='utf-8'))
            self.assertFalse((output / 'content').exists())
            self.assertTrue((output / '.nojekyll').exists())
            self.assertIn('No entries published yet', (output / 'log.html').read_text(encoding='utf-8'))
            self.assertFalse((root / 'log.html').exists())

    def test_resume_download_appears_and_refreshes_only_with_pdf(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            shutil.copytree(ROOT / 'src', root / 'src')
            (root / 'content' / 'posts').mkdir(parents=True)
            resume = root / 'public' / 'resume' / 'resume.pdf'
            resume.parent.mkdir(parents=True)
            (resume.parent / 'README.md').write_text('Instructions')
            build(root)
            output = root / '_site'
            self.assertNotIn('Download résumé', (output / 'index.html').read_text(encoding='utf-8'))
            self.assertFalse((output / 'resume' / 'README.md').exists())
            first = b'%PDF-1.4\nTest fixture one'
            resume.write_bytes(first)
            build(root)
            html = (output / 'index.html').read_text(encoding='utf-8')
            self.assertIn('download="Mahmudul-Haque-Resume.pdf"', html)
            self.assertEqual((output / 'resume' / 'resume.pdf').read_bytes(), first)
            resume.write_bytes(b'%PDF-1.4\nTest fixture two')
            build(root)
            self.assertNotEqual(html, (output / 'index.html').read_text(encoding='utf-8'))
            resume.write_text('not a PDF')
            with self.assertRaisesRegex(ValueError, 'PDF'):
                build(root)
            # Failed validation preserves the last successful output.
            self.assertEqual((output / 'resume' / 'resume.pdf').read_bytes(), b'%PDF-1.4\nTest fixture two')
            resume.unlink()
            build(root)
            self.assertFalse((output / 'resume' / 'resume.pdf').exists())
            self.assertNotIn('Download résumé', (output / 'index.html').read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
