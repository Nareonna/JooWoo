/* JooWoo · подписчики сайта. Отдельный Cloudflare Worker (не joowoo-cloud — его адрес не светим).
 *
 * Нужно в настройках воркера:
 *   D1-база с именем привязки DB     (Settings → Bindings → D1 database → Variable name: DB)
 *   секрет STATS_KEY                  (пароль от странички статистики)
 *   секрет SALT                       (любая длинная случайная строка — для шифровки IP)
 *
 * Адреса:
 *   GET  /count                → {"count":128}
 *   POST /sub  {"id":"..."}    → {"ok":true,"count":129,"new":true}
 *   GET  /stats?key=STATS_KEY  → страничка со статистикой (только для тебя)
 */
const ORIGINS = ['https://nareonna.github.io', 'http://localhost:8765'];
const PER_IP_PER_DAY = 5; // мобильные операторы дают один IP многим людям — поэтому не 1

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    await env.DB.prepare('CREATE TABLE IF NOT EXISTS jw_subs (id TEXT PRIMARY KEY, iph TEXT, day TEXT, ts INTEGER)').run();
    const count = async () => (await env.DB.prepare('SELECT COUNT(*) AS n FROM jw_subs').first()).n;

    if (url.pathname === '/count') return json({ count: await count() });

    if (url.pathname === '/sub' && req.method === 'POST') {
      if (!ORIGINS.includes(origin)) return json({ ok: false }, 403);
      let id = '';
      try { id = String((await req.json()).id || ''); } catch (e) {}
      if (!/^[a-z0-9]{16,40}$/.test(id)) return json({ ok: false }, 400);
      if (await env.DB.prepare('SELECT 1 FROM jw_subs WHERE id=?').bind(id).first()) return json({ ok: true, new: false, count: await count() });
      const day = new Date().toISOString().slice(0, 10);
      const ip = req.headers.get('CF-Connecting-IP') || '';
      const iph = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(env.SALT + '|' + ip)))]
        .slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
      const same = (await env.DB.prepare('SELECT COUNT(*) AS n FROM jw_subs WHERE iph=? AND day=?').bind(iph, day).first()).n;
      if (same >= PER_IP_PER_DAY) return json({ ok: true, new: false, count: await count() });
      await env.DB.prepare('INSERT INTO jw_subs (id, iph, day, ts) VALUES (?,?,?,?)').bind(id, iph, day, Date.now()).run();
      return json({ ok: true, new: true, count: await count() });
    }

    if (url.pathname === '/stats') {
      if (!env.STATS_KEY || url.searchParams.get('key') !== env.STATS_KEY) return new Response('нет доступа', { status: 403 });
      const total = await count();
      const days = (await env.DB.prepare('SELECT day, COUNT(*) AS n FROM jw_subs GROUP BY day ORDER BY day DESC LIMIT 60').all()).results.reverse();
      const today = new Date().toISOString().slice(0, 10), weekAgo = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
      const t = (days.find(d => d.day === today) || { n: 0 }).n, w = days.filter(d => d.day >= weekAgo).reduce((s, d) => s + d.n, 0);
      const max = Math.max(1, ...days.map(d => d.n));
      const bars = days.map(d => `<div class="b" title="${d.day.split('-').reverse().join('.')}: ${d.n}"><i style="height:${Math.round(d.n / max * 100)}%"></i><span>${d.day.slice(8)}</span></div>`).join('');
      return new Response(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>JooWoo · подписчики</title>
<style>body{margin:0;background:#0f0b0b;color:#efe6dc;font:16px/1.6 Georgia,serif;padding:32px 18px}main{max-width:760px;margin:0 auto}h1{font:italic 900 34px Georgia,serif;margin:0 0 20px;color:#e6926c}
.k{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px}.k div{border:1px solid rgba(233,197,143,.25);border-radius:16px;padding:16px;text-align:center}.k b{display:block;font-size:36px;color:#e9c58f}.k small{color:rgba(239,230,220,.6)}
.ch{display:flex;align-items:flex-end;gap:4px;height:200px;border-bottom:1px solid rgba(233,197,143,.25);padding-bottom:22px}.b{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;position:relative}.b i{display:block;width:100%;min-height:2px;background:linear-gradient(#e6926c,#9fc6ea);border-radius:4px 4px 0 0}.b span{position:absolute;bottom:-20px;font-size:10px;color:rgba(239,230,220,.5)}
p{color:rgba(239,230,220,.6);font-size:13px}</style></head><body><main><h1>Подписчики JooWoo</h1>
<div class="k"><div><b>${total}</b><small>всего</small></div><div><b>${t}</b><small>сегодня</small></div><div><b>${w}</b><small>за 7 дней</small></div></div>
<div class="ch">${bars || '<p>пока никого — первая подписка появится здесь</p>'}</div><p>новые подписки по дням, последние 60 дней</p></main></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    }
    return json({ ok: true, name: 'JooWoo subs' });
  },
};
