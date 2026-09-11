"""Load and validate the editable portfolio without extra runtime dependencies."""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
from urllib.parse import urlsplit


# A tuple supplies an optional field's schema and default. Lists describe entries.
LINK = {'label': str, 'url': str}
DETAIL = {'title': str, 'paragraphs': ([str], []), 'bullets': ([str], [])}
PROJECT = {
    'name': str, 'description': str, 'category': (str, ''),
    'link': (LINK, None), 'details': ([DETAIL], []), 'technologies': ([str], []),
}
SCHEMA = {
    'profile': {
        'name': str, 'monogram': str, 'page_title': str, 'description': str,
        'role': str, 'employer': (str, ''), 'summary': str,
        'photo': ({'src': str, 'alt': str}, None),
        'links': ([LINK], []), 'resume_filename': (str, 'Resume.pdf'),
        'facts': ([{'label': str, 'value': str, 'detail': (str, '')}], []),
    },
    'sections': [{'id': str, 'title': str, 'nav_label': (str, '')}],
    'experience': [{
        'role': str, 'organization': str, 'period': str, 'location': (str, ''),
        'current': (bool, False), 'context': (str, ''),
        'highlights': ([{'label': (str, ''), 'text': str}], []),
        'details': ([DETAIL], []), 'technologies': ([str], []),
    }],
    'skills': {key: ([{'category': str, 'technologies': [str]}], []) for key in ('core', 'toolkit')},
    'education': [{
        'degree': str, 'institution': str, 'period': str,
        'description': (str, ''), 'result': (str, ''), 'details': ([DETAIL], []),
    }],
    'projects': {
        'repository_url': (str, ''), 'featured': ([PROJECT], []), 'web': ([PROJECT], []),
        'research': ([PROJECT], []),
        'more': ([{'name': str, 'url': str, 'description': str, 'links': ([LINK], [])}], []),
    },
    'achievements': {
        'featured': ([{'number': str, 'suffix': (str, ''), 'title': str,
                      'description': str, 'link': (LINK, None)}], []),
        'recognition': ([str], []), 'community': ([str], []),
    },
    'about': {
        'paragraphs': ([str], []), 'notes': ([str], []),
        'languages': ([{'name': str, 'level': str}], []),
    },
    'contact': {'description': str, 'availability': (str, ''), 'note': (str, ''), 'email': str},
}
SECTION_IDS = {'experience', 'skills', 'education', 'projects', 'achievements', 'about', 'contact'}


def validate(value, schema, path='portfolio'):
    optional = isinstance(schema, tuple)
    if optional:
        schema, default = schema
        if value is None and default is None:
            return None
    if isinstance(schema, dict):
        if not isinstance(value, dict):
            raise ValueError(f'{path}: expected an object with named fields.')
        unknown = value.keys() - schema.keys()
        if unknown:
            raise ValueError(f'{path}: unknown field(s): {", ".join(sorted(unknown))}.')
        result = {}
        for key, spec in schema.items():
            if key not in value:
                if not isinstance(spec, tuple):
                    raise ValueError(f'{path}.{key}: required field is missing.')
                item = deepcopy(spec[1])
            else:
                item = value[key]
            result[key] = validate(item, spec, f'{path}.{key}')
        return result
    if isinstance(schema, list):
        if not isinstance(value, list):
            raise ValueError(f'{path}: expected a list in square brackets [].')
        return [validate(item, schema[0], f'{path}[{index}]') for index, item in enumerate(value)]
    if type(value) is not schema:
        raise ValueError(f'{path}: expected {schema.__name__}.')
    if schema is str:
        if not optional and not value.strip():
            raise ValueError(f'{path}: text must not be empty.')
        if (path.endswith('.url') or path.endswith('.repository_url')) and value:
            url = urlsplit(value)
            if not ((url.scheme in ('http', 'https') and url.netloc and not url.username and not url.password)
                    or (url.scheme == 'mailto' and '@' in url.path)):
                raise ValueError(f'{path}: use a full HTTPS or mailto URL.')
    return value


def load_portfolio(root):
    path = root / 'content' / 'portfolio.json'
    try:
        data = json.loads(path.read_text(encoding='utf-8-sig'))
    except FileNotFoundError as exc:
        raise ValueError('Missing content/portfolio.json. Restore it before building.') from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f'content/portfolio.json, line {exc.lineno}, column {exc.colno}: {exc.msg}.') from exc
    data = validate(data, SCHEMA)
    ids = [section['id'] for section in data['sections']]
    if len(ids) != len(set(ids)) or any(key not in SECTION_IDS for key in ids):
        raise ValueError('portfolio.sections: use each supported section ID at most once.')
    if '@' not in data['contact']['email'] or any(char.isspace() for char in data['contact']['email']):
        raise ValueError('portfolio.contact.email: enter an email address.')
    photo_url = None
    photo = data['profile']['photo']
    if photo:
        source = Path(photo['src'])
        public = (root / 'public').resolve()
        image = public / source
        if (source.is_absolute() or '..' in source.parts or '\\' in photo['src']
                or public not in image.resolve().parents
                or image.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp', '.avif')
                or not image.is_file()):
            raise ValueError('portfolio.profile.photo.src: use an existing image path relative to public/.')
        photo_url = f'{source.as_posix()}?v={hashlib.sha256(image.read_bytes()).hexdigest()[:12]}'
    return data, photo_url
