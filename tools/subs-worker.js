// JooWoo subs worker. Needs: D1 binding DB, secrets STATS_KEY and SALT. Routes: GET /count, POST /sub {id}, GET /stats?key=
const O = ['https://nareonna.github.io', 'http://localhost:8765'], LIM = 5;
export default {
  async fetch(req, env) {
    const u = new URL(req.url), o = req.headers.get('Origin') || '';
    const h = { 'Access-Control-Allow-Origin': O.includes(o) ? o : O[0], 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    const J = (x, s = 200) => new Response(JSON.stringify(x), { status: s, headers: { ...h, 'Content-Type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    const db = env.DB, q = (s, ...a) => db.prepare(s).bind(...a);
    await q('CREATE TABLE IF NOT EXISTS jw_subs (id TEXT PRIMARY KEY, iph TEXT, day TEXT, ts INTEGER)').run();
    const N = async () => (await q('SELECT COUNT(*) AS n FROM jw_subs').first()).n;
    if (u.pathname === '/count') return J({ count: await N() });
    if (u.pathname === '/sub' && req.method === 'POST') {
      if (!O.includes(o)) return J({ ok: false }, 403);
      let id = ''; try { id = String((await req.json()).id || ''); } catch (e) {}
      if (!/^[a-z0-9]{16,40}$/.test(id)) return J({ ok: false }, 400);
      if (await q('SELECT 1 FROM jw_subs WHERE id=?', id).first()) return J({ ok: true, new: false, count: await N() });
      const day = new Date().toISOString().slice(0, 10), ip = req.headers.get('CF-Connecting-IP') || '';
      const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(env.SALT + '|' + ip));
      const iph = [...new Uint8Array(d)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
      if ((await q('SELECT COUNT(*) AS n FROM jw_subs WHERE iph=? AND day=?', iph, day).first()).n >= LIM) return J({ ok: true, new: false, count: await N() });
      await q('INSERT INTO jw_subs VALUES (?,?,?,?)', id, iph, day, Date.now()).run();
      return J({ ok: true, new: true, count: await N() });
    }
    if (u.pathname === '/stats') {
      if (!env.STATS_KEY || u.searchParams.get('key') !== env.STATS_KEY) return new Response('no', { status: 403 });
      const tot = await N(), D = (await q('SELECT day, COUNT(*) AS n FROM jw_subs GROUP BY day ORDER BY day DESC LIMIT 60').all()).results.reverse();
      const td = new Date().toISOString().slice(0, 10), wk = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
      const t = (D.find(x => x.day === td) || { n: 0 }).n, w = D.filter(x => x.day >= wk).reduce((s, x) => s + x.n, 0), mx = Math.max(1, ...D.map(x => x.n));
      const bars = D.map(x => `<div class=b title="${x.day}: ${x.n}"><i style="height:${Math.round(x.n / mx * 100)}%"></i><span>${x.day.slice(8)}</span></div>`).join('');
      const css = 'body{margin:0;background:#0f0b0b;color:#efe6dc;font:16px Georgia,serif;padding:32px 18px}main{max-width:760px;margin:auto}h1{font:italic 900 34px Georgia;color:#e6926c}.k{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px}.k div{border:1px solid #4a3a2e;border-radius:16px;padding:16px;text-align:center}.k b{display:block;font-size:36px;color:#e9c58f}.k small,p{color:#9b918a}.ch{display:flex;align-items:flex-end;gap:4px;height:200px;border-bottom:1px solid #4a3a2e;padding-bottom:22px}.b{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;position:relative}.b i{min-height:2px;background:linear-gradient(#e6926c,#9fc6ea);border-radius:4px 4px 0 0}.b span{position:absolute;bottom:-20px;width:100%;text-align:center;font-size:10px;color:#9b918a}';
      const html = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=robots content=noindex><title>JooWoo subs</title><style>${css}</style><main><h1>Подписчики JooWoo</h1><div class=k><div><b>${tot}</b><small>всего</small></div><div><b>${t}</b><small>сегодня</small></div><div><b>${w}</b><small>за 7 дней</small></div></div><div class=ch>${bars}</div><p>новые подписки по дням</p></main>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
    }
    return J({ ok: true, name: 'JooWoo subs' });
  },
};
