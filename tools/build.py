#!/usr/bin/env python3
"""Пересобирает архивы «всё сразу» и files.js из tools/versions.json. Запуск: python3 tools/build.py

Корзина: когда в versions.json у файла меняется имя (новая версия), старый файл
сам переезжает в files/archive/ и попадает в список «archive» — на сайте он в корзине.
Ничего руками переносить не нужно: положи новый файл в files/, поменяй ver/date/ru/en и запусти скрипт.
"""
import json, os, re, shutil, zipfile
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VP = os.path.join(R, 'tools/versions.json')
V = json.load(open(VP))
V.setdefault('archive', [])
FILES, ARCH = os.path.join(R, 'files'), os.path.join(R, 'files', 'archive')
os.makedirs(ARCH, exist_ok=True)

# прошлое состояние сайта — из уже собранного files.js
prev = {}
try:
    s = open(os.path.join(R, 'files.js')).read()
    prev = {i['id']: i for i in json.loads(s[s.index('=') + 1:].rstrip().rstrip(';'))['items']}
except Exception:
    pass

def dn(d):
    p = d.split('.'); return (p[2], p[1], p[0])

moved = 0
for it in V['items']:
    old = prev.get(it['id'])
    if not old or it.get('has') or (old['ru'], old['en']) == (it['ru'], it['en']):
        continue
    for L in ('ru', 'en'):
        src = os.path.join(FILES, old[L])
        if old[L] not in (it['ru'], it['en']) and os.path.exists(src):
            shutil.move(src, os.path.join(ARCH, old[L]))
    if not any(a['id'] == old['id'] and a['ver'] == old.get('ver') for a in V['archive']):
        e = {k: old[k] for k in ('id', 'name', 'ver', 'date', 'ru', 'en') if k in old}
        if old.get('mode'): e['mode'] = old['mode']
        V['archive'].append(e); moved += 1

V['archive'].sort(key=lambda e: (dn(e['date']), [int(x) for x in re.findall(r'\d+', e.get('ver', ''))]), reverse=True)

for it in V['items']:
    for L in ('ru', 'en'):
        assert os.path.exists(os.path.join(FILES, it[L])), it[L]
    if it.get('has'):
        by = {i['id']: i for i in V['items']}
        for L in ('ru', 'en'):
            out = os.path.join(FILES, it[L])
            with zipfile.ZipFile(out + '.tmp', 'w', zipfile.ZIP_DEFLATED) as z:
                for m in it['has']:
                    z.write(os.path.join(FILES, by[m][L]), (by[m].get('dl') or {}).get(L) or by[m][L])
            os.replace(out + '.tmp', out)
for a in V['archive']:
    for L in ('ru', 'en'):
        assert os.path.exists(os.path.join(ARCH, a[L])), 'archive/' + a[L]

json.dump(V, open(VP, 'w'), ensure_ascii=False, indent=1)
open(os.path.join(R, 'files.js'), 'w').write('window.JW_FILES=' + json.dumps(V, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('ok', len(V['items']), 'в корзине', len(V['archive']), '(+%d)' % moved if moved else '')
