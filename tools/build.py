#!/usr/bin/env python3
"""Пересобирает архивы «всё сразу» и files.js из tools/versions.json. Запуск: python3 tools/build.py"""
import json, os, zipfile
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = json.load(open(os.path.join(R, 'tools/versions.json')))
by = {i['id']: i for i in V['items']}
for it in V['items']:
    for L in ('ru', 'en'):
        assert os.path.exists(os.path.join(R, 'files', it[L])), it[L]
    if it.get('has'):
        for L in ('ru', 'en'):
            out = os.path.join(R, 'files', it[L])
            with zipfile.ZipFile(out + '.tmp', 'w', zipfile.ZIP_DEFLATED) as z:
                for m in it['has']:
                    z.write(os.path.join(R, 'files', by[m][L]), by[m][L])
            os.replace(out + '.tmp', out)
open(os.path.join(R, 'files.js'), 'w').write('window.JW_FILES=' + json.dumps(V, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('ok', len(V['items']))
