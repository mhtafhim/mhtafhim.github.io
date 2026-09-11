import json
from pathlib import Path
import shutil
import tempfile
import unittest

from scripts.build import ROOT, build
from scripts.portfolio import load_portfolio


class PortfolioTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.root = Path(self.folder.name)
        shutil.copytree(ROOT / 'src', self.root / 'src')
        shutil.copytree(ROOT / 'public', self.root / 'public')
        (self.root / 'content' / 'posts').mkdir(parents=True)
        self.path = self.root / 'content' / 'portfolio.json'
        self.data = json.loads((ROOT / 'content' / 'portfolio.json').read_text(encoding='utf-8'))
        self.save()

    def save(self):
        self.path.write_text(json.dumps(self.data), encoding='utf-8')

    def test_json_updates_render_without_template_changes(self):
        self.data['experience'].insert(0, {
            'role': 'New role <engineer>', 'organization': 'New employer', 'period': '2027 — present',
            'details': [{'title': 'Technical contributions', 'bullets': ['A new achievement']}],
        })
        self.data['education'].append({'degree': 'New degree', 'institution': 'New university', 'period': '2028'})
        self.data['projects']['research'].append({'name': 'New research', 'description': 'Research summary'})
        self.save()
        build(self.root)
        html = (self.root / '_site' / 'index.html').read_text(encoding='utf-8')
        for text in ['New role &lt;engineer&gt;', 'A new achievement', 'New degree', 'New research']:
            self.assertIn(text, html)
        offsets = [html.index(f'id="{key}"') for key in ['experience', 'skills', 'education', 'projects', 'achievements', 'about', 'contact']]
        self.assertEqual(offsets, sorted(offsets))
        self.assertIn('id="education-title">Education</h2>', html)
        self.assertIn('class="profile-photo"', html)
        self.assertFalse((self.root / '_site' / 'content').exists())
        # Section order and navigation both follow the editable list.
        self.data['sections'].reverse()
        self.save()
        build(self.root)
        html = (self.root / '_site' / 'index.html').read_text(encoding='utf-8')
        self.assertLess(html.index('id="about"'), html.index('id="experience"'))

    def test_invalid_content_preserves_last_successful_build(self):
        build(self.root)
        original = (self.root / '_site' / 'index.html').read_bytes()
        for field, value, error in [
            ('current', 'true', 'expected bool'),
            ('highlights', 'not a list', 'expected a list'),
            ('typo', 'misspelled field', 'unknown field'),
        ]:
            self.data['experience'][0][field] = value
            self.save()
            with self.assertRaisesRegex(ValueError, error):
                build(self.root)
            self.data = json.loads((ROOT / 'content' / 'portfolio.json').read_text(encoding='utf-8'))
        self.path.write_text('{"broken":', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'line 1, column'):
            build(self.root)
        self.assertEqual((self.root / '_site' / 'index.html').read_bytes(), original)

    def test_safe_links_photo_paths_and_replacement(self):
        _, first_url = load_portfolio(self.root)
        photo = self.root / 'public' / self.data['profile']['photo']['src']
        photo.write_bytes(photo.read_bytes() + b'\n')
        _, next_url = load_portfolio(self.root)
        self.assertNotEqual(first_url, next_url)
        for source in ['../profile.jpg', 'assets/images/missing.jpg', '/outside.jpg']:
            self.data['profile']['photo']['src'] = source
            self.save()
            with self.assertRaisesRegex(ValueError, 'photo.src'):
                load_portfolio(self.root)
        self.data['profile'].pop('photo')
        self.data['profile']['links'][0]['url'] = 'javascript:alert(1)'
        self.save()
        with self.assertRaisesRegex(ValueError, 'HTTPS or mailto'):
            load_portfolio(self.root)
        self.data['profile']['links'] = []
        self.save()
        build(self.root)
        html = (self.root / '_site' / 'index.html').read_text(encoding='utf-8')
        self.assertNotIn('class="profile-photo"', html)


if __name__ == '__main__':
    unittest.main()
