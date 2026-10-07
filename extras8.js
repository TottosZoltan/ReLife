// ===== extras8: Automata munka + élő párbeszéd-jelenetek =====
(function () {
  const $$ = s => document.querySelector(s), sleep = ms => new Promise(r => setTimeout(r, ms));
  const SAD_DOG = `<svg viewBox="0 0 200 150" class="sdog"><defs><linearGradient id="sdg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6b7b"/><stop offset="1" stop-color="#2b3642"/></linearGradient></defs><rect width="200" height="150" fill="url(#sdg)"/><g class="rain">${Array.from({ length: 14 }, (_, i) => `<line x1="${8 + i * 14}" y1="-10" x2="${4 + i * 14}" y2="6" stroke="#9fb8d0" stroke-width="1.4" style="animation-delay:${(i % 5) * .25}s"/>`).join('')}</g><rect y="128" width="200" height="22" fill="#1f2831"/><ellipse cx="100" cy="124" rx="48" ry="8" fill="#0003"/><ellipse cx="100" cy="100" rx="38" ry="30" fill="#b98a5a"/><ellipse cx="62" cy="78" rx="12" ry="26" fill="#7a5632" transform="rotate(14 62 78)"/><ellipse cx="138" cy="78" rx="12" ry="26" fill="#7a5632" transform="rotate(-14 138 78)"/><circle cx="100" cy="76" r="30" fill="#c99a68"/><ellipse cx="100" cy="90" rx="14" ry="10" fill="#e8cfae"/><ellipse cx="100" cy="85" rx="5" ry="3.5" fill="#222"/><circle cx="87" cy="70" r="5" fill="#fff"/><circle cx="113" cy="70" r="5" fill="#fff"/><circle cx="88" cy="72" r="3" fill="#222"/><circle cx="112" cy="72" r="3" fill="#222"/><path d="M80 62 L92 66 M120 62 L108 66" stroke="#5a3d22" stroke-width="2.5" stroke-linecap="round"/><path class="tear" d="M87 77 q-2 6 0 8 q2 -2 0 -8z" fill="#8fd0ff"/><path class="tear t2" d="M113 77 q-2 6 0 8 q2 -2 0 -8z" fill="#8fd0ff"/><path d="M92 97 q8 -5 16 0" stroke="#5a3d22" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  window.sadDogHtml = () => `<div class="sdogw">${SAD_DOG}<small>„Kérlek, vigyél haza…”</small></div>`;

  // --- gépelős párbeszéd ---
  async function typeInto(el, text, sp) { el.textContent = ''; for (const ch of text) { el.textContent += ch; await sleep(sp || 18); } }
  function portrait(look, age, emoji) { return `<div class="scp">${look ? avSvg(look, age || 30) : `<span>${emoji || '🙂'}</span>`}</div>`; }
  function fxChips(b, a) {
    const L = [['hap', '😊'], ['hea', '❤️'], ['sma', '🧠'], ['loo', '✨']], o = [];
    L.forEach(([k, e]) => { const d = Math.round((a[k] || 0) - (b[k] || 0)); if (d) o.push(`<i class="${d > 0 ? 'p' : 'n'}">${d > 0 ? '+' : ''}${d} ${e}</i>`); });
    const dm = a.money - b.money; if (dm) o.push(`<i class="${dm > 0 ? 'p' : 'n'}">${dm > 0 ? '+' : '−'}${fmt(Math.abs(dm))}</i>`);
    const dj = Math.round((a.jp || 0) - (b.jp || 0)); if (dj) o.push(`<i class="${dj > 0 ? 'p' : 'n'}">${dj > 0 ? '+' : ''}${dj} 📋</i>`);
    return o.join('');
  }
  const snap = () => ({ hap: p.hap, hea: p.hea, sma: p.sma, loo: p.loo, money: p.money, jp: p.jp || 0 });
  function burst(good) {
    const s = $$('#aws'); if (!s) return; const em = good ? ['✨', '🎉', '⭐', '💚'] : ['💢', '💧', '😓', '⚡'];
    for (let i = 0; i < 14; i++) { const e = document.createElement('b'); e.className = 'bst ' + (good ? 'up' : 'dn'); e.textContent = em[i % em.length]; e.style.left = (8 + Math.random() * 84) + '%'; e.style.animationDelay = (Math.random() * .4) + 's'; s.append(e); setTimeout(() => e.remove(), 1800); }
    s.classList.remove('shk'); if (!good) { void s.offsetWidth; s.classList.add('shk'); }
    try { if (navigator.vibrate) navigator.vibrate(good ? 15 : [30, 40, 30]); } catch (e) { }
  }

  // --- az automata munka lépései ---
  const CHAT = {
    ot: [['boss', 'Látom, még itt vagy. Maradsz egy kicsit?'], ['me', 'Persze, befejezem a feladatot.']],
    train: [['boss', 'Van egy drága, de hasznos tanfolyam. Beneveznél?'], ['me', 'Szívesen fejlődnék.']],
    team: [['col', 'Hétvégén csapatépítés! Jössz?'], ['me', 'Benne vagyok!']],
    boss: [['me', 'Főnök, van egy percje?'], ['boss', 'Gyere be, hallgatlak.']],
    net: [['col', 'Ismerek valakit, aki segíthet neked.'], ['me', 'Köszönöm, szívesen megismerem!']],
    mentor: [['me', 'Keresek valakit, aki segít a karrieremben.'], ['col', 'Hmm, talán én tudok segíteni.']],
    vac: [['me', 'Kivennék pár nap szabadságot.'], ['boss', 'Rendben, de lesz mit behozni.']],
    side: [['col', 'Van egy gyors mellékmunka, kell a pénz?'], ['me', 'Mindig jól jön egy kis plusz.']],
    raise: [['me', 'Szeretnék beszélni a fizetésemről.'], ['boss', 'Hmm… ezt alaposan meg kell gondolnom.']]
  };
  function steps() {
    const L = []; if (p.dead || p.prison > 0) return L;
    if (p.job) JA.forEach(x => { if ((!x.u || x.u()) && !p.done['j' + x.id]) { const c = p.age < 18 ? 0 : x.c || 0, neg = Object.values(x.fx || {}).some(v => v < 0);
      L.push({ id: x.id, i: x.i, n: x.n, c, risk: c > 0 || (x.w != null && x.w < 1) || neg || ['vac', 'side', 'raise'].includes(x.id), kind: 'job', who: ['train', 'team', 'net', 'mentor', 'side'].includes(x.id) ? 'col' : 'boss' }); } });
    if (p.car && !CAR_BY[p.car.id].cr) CAR_BY[p.car.id].acts.forEach(x => { if (!p.done['c' + x.id]) { const c = p.age < 18 ? 0 : x.c || 0, neg = Object.values(x.fx || {}).some(v => v < 0);
      L.push({ id: x.id, i: x.i, n: x.n, c, risk: c > 0 || (x.w != null && x.w < 1) || neg, kind: 'car', who: 'col' }); } });
    return L;
  }
  const mkWho = {};
  function whoLook(w) {
    if (mkWho[w]) return mkWho[w];
    const r = p.rel.find(q => q.alive && (w == 'col' ? ['Munkatárs', 'Mentor'].includes(q.role) : false));
    return mkWho[w] = r ? { look: lk(r), age: r.age, name: dn(r.n) } : { look: mkLook(P(['f', 'm']), R(1, 5)), age: w == 'boss' ? 48 : 32, name: w == 'boss' ? 'Főnök' : 'Kolléga' };
  }
  function scene(html) { let s = $$('#aws'); if (!s) { s = document.createElement('div'); s.id = 'aws'; s.className = 'ov'; $$('#app').append(s); } s.innerHTML = `<div class="box awb">${html}</div>`; s.hidden = false; return s; }
  const choose = (q, btns) => new Promise(res => { const b = $$('#awb'); b.innerHTML = ''; btns.forEach(([l, v, cls]) => { const x = document.createElement('button'); x.textContent = l; if (cls) x.className = cls; x.onclick = () => res(v); b.append(x); }); });

  let running = false;
  window.autoWork = async function () {
    if (running) return; const L = steps(); if (!L.length) return; running = true; mkWho.boss = mkWho.col = null;
    const _r = render; render = () => { }; let done = 0, skipped = 0, tot = { b: snap() };
    try {
      for (let n = 0; n < L.length; n++) {
        const st = L[n], w = whoLook(st.who), chat = CHAT[st.id] || [['col', 'Van egy új feladat, belevágsz?'], ['me', 'Mehet!']];
        scene(`<div class="awh"><span>${n + 1}/${L.length}</span><b>${st.i} ${st.n}</b></div><div class="awp">${portrait(w.look, w.age)}<div class="awn">${w.name}</div></div><div class="awc" id="awc"></div><div class="awf" id="awf"></div><div class="awbt" id="awb"></div>`);
        const C = $$('#awc');
        for (const [who, tx] of chat) { const d = document.createElement('div'); d.className = 'bub ' + (who == 'me' ? 'me' : 'th'); C.append(d); await typeInto(d, tx, 16); await sleep(250); }
        if (st.risk) {
          const info = st.c ? `Ára: ${fmt(st.c)}.` : 'Kockázatos lehet, nem biztos a kimenet.';
          const q = document.createElement('div'); q.className = 'bub sys'; q.textContent = `⚠️ ${info}`; C.append(q);
          const ch = await choose(st, [[st.c && !can(st.c) ? 'Nincs rá pénzed' : `✅ Csinálom${st.c ? ' (' + fmt(st.c) + ')' : ''}`, 1, st.c && !can(st.c) ? 'dis' : ''], ['⏭️ Kihagyom', 0, 'alt'], ['⛔ Leállítom az automatát', -1, 'alt']]);
          if (ch == -1) break; if (ch == 0 || (st.c && !can(st.c))) { skipped++; continue; }
        } else await sleep(500);
        const b0 = snap(), nl = p.logs.length;
        try { st.kind == 'job' ? doJobAct(st.id) : doCarAct(st.id); } catch (e) { }
        const a0 = snap(), lg0 = p.logs.slice(nl).map(l => l.t).join(' '), good = (a0.hap - b0.hap) + (a0.jp - b0.jp) / 5 + (a0.money - b0.money) / 1e5 >= 0;
        const r = document.createElement('div'); r.className = 'bub sys ' + (good ? 'ok' : 'ko'); C.append(r); await typeInto(r, (good ? '✔ ' : '✖ ') + (lg0 || 'Megtörtént.'), 12);
        $$('#awf').innerHTML = fxChips(b0, a0); burst(good); done++;
        await sleep(st.risk ? 900 : 700);
        if (st.risk) await choose(st, [['Tovább ▶', 1]]);
      }
    } finally { render = _r; }
    const a = snap(), s = scene(`<h2>🤖 Automata munka kész</h2><p>${done} tevékenység elvégezve${skipped ? ', ' + skipped + ' kihagyva' : ''}.</p><div class="awf big">${fxChips(tot.b, a)}</div><div class="awbt" id="awb"></div>`);
    burst(true); lg(`🤖 Automata munka: ${done} tevékenység elvégezve.`, 'good'); await choose(0, [['Rendben', 1]]); s.hidden = true; running = false; render();
  };

  // --- gomb a Foglalkozás fülön ---
  const _jp = window.jobPanel;
  window.jobPanel = function () {
    const h = _jp(), n = steps().length;
    if (!n || (!p.job && !p.car)) return h;
    return `<button class="act aw-btn" onclick="autoWork()"><b>🤖 Automata munka</b><small>${n} munkahelyi teendő · a pénzes és kockázatos lépésekről te döntesz</small></button>` + h;
  };

  // --- eldöntendő kérdések feldobása: portré, gépelés, örökbefogadás-kép ---
  const _ask = window.ask;
  window.ask = function (ev) {
    _ask(ev); const box = $$('#modal .box'); if (!box) return;
    box.querySelectorAll('.evx').forEach(e => e.remove());
    const adopt = /adopt/.test(JSON.stringify(ev.o || [])) || /örökbe|kutyus|menhely/i.test((ev.t || '') + (ev.d || ''));
    let top = '';
    if (adopt) top = window.sadDogHtml();
    else if (typeof pend !== 'undefined' && pend && pend.n) top = `<div class="awp"><div class="scp">${avSvg(lk(pend), pend.age || 20)}</div><div class="awn">${dn(pend.n)}</div></div>`;
    if (top) { const d = document.createElement('div'); d.className = 'evx'; d.innerHTML = top; box.prepend(d); }
    const md = $$('#md'), full = md.textContent, bt = $$('#mb'); md.textContent = ''; bt.classList.add('hid');
    (async () => { await typeInto(md, full, 14); bt.classList.remove('hid'); })();
  };
  const _ap = window.adoptPanel;
  if (_ap) window.adoptPanel = () => window.sadDogHtml() + _ap();
})();
