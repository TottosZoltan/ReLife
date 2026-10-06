// ReLife extras: Beállítások, nehézség, tartalomszűrő, achievementek, életcélok, Életek könyvtár
(function () {
  const L = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const D = { snd: 1, ntf: 0, mode: 'none', tut: 0, diff: 'normal', th: 'auto', fs: 'm', fNo: 0, fAl: 0, fDe: 0, fPr: 0, vib: 1, view: 'full' };
  let st = Object.assign({}, D, L('relife_set') || {});
  const t = x => T(x), el = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; };
  function applySet() {
    const b = document.body; b.dataset.diff = st.diff; b.dataset.fs = st.fs;
    b.dataset.th = st.th == 'auto' ? (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light') : st.th;
    b.dataset.view = st.view; S('relife_set', st);
  }
  // ----- nehézség: negatív hatások skálázása -----
  const _apply = apply;
  apply = function (fx) {
    if (fx && st.diff != 'normal') { const m = st.diff == 'easy' ? .5 : 1.3; fx = Object.assign({}, fx); ['hea', 'hap'].forEach(k => { if (fx[k] < 0) fx[k] = Math.round(fx[k] * m); }); }
    return _apply.call(this, fx);
  };
  // ----- tartalomszűrő -----
  const FR = { fPr: /börtön|bűn|lop[áo]|rabl|csal[áó]|prison|crime|steal|rob|fraud/i, fAl: /alkohol|piál|részeg|drink|alcohol|drunk|beer/i, fDe: /meghal|elhunyt|temet|halál|funeral|passed away|died/i };
  const _ask = ask;
  ask = function (ev) {
    try { const s = fill(T(ev.t)) + ' ' + fill(T(ev.d)); for (const k in FR) if (st[k] && FR[k].test(s)) { pend = null; return render(); } } catch (e) {}
    return _ask.call(this, ev);
  };
  // ----- achievementek -----
  const nw = () => { try { return netw(); } catch (e) { return p.money; } };
  const kids = () => p.rel.filter(r => r.role == 'Gyerek').length;
  const AC = [
    ['trav', '🌍', ['Világutazó', 'Globetrotter'], ['8 országba eljutni', 'Visit 8 destinations'], 'rare', () => Object.keys(p.trav || {}).length >= 8],
    ['mil', '💰', ['Százmilliomos', 'Hundred-millionaire'], ['Nettó vagyon 100 M', 'Net worth 100M'], 'epic', () => nw() >= 1e8],
    ['c100', '🎂', ['100 éves', 'Centenarian'], ['Érd meg a 100-at', 'Reach 100'], 'legend', () => p.age >= 100],
    ['f10', '🧑‍🤝‍🧑', ['10 barát', '10 friends'], ['10 élő barát', '10 living friends'], 'rare', () => p.rel.filter(r => r.alive && r.role == 'Barát').length >= 10],
    ['hob', '🎯', ['Hobbimester', 'Hobby master'], ['Hobbi 90 fölé', 'Hobby level 90+'], 'rare', () => Object.values(p.hob || {}).some(h => h.lv >= 90)],
    ['deg', '🎓', ['Diplomás', 'Graduate'], ['Szerezz diplomát', 'Earn a degree'], 'common', () => p.edu == 2],
    ['mar', '💍', ['Igen!', 'I do'], ['Házasodj meg', 'Get married'], 'common', () => p.rel.some(r => r.role == 'Házastárs')],
    ['fam', '👨‍👩‍👧‍👦', ['Nagycsalád', 'Big family'], ['3 gyerek', '3 children'], 'rare', () => kids() >= 3],
    ['car', '🌟', ['Csúcsra jutottál', 'At the top'], ['Karrier 3. rang', 'Career rank 3'], 'epic', () => p.car && p.car.rank >= 3],
    ['old', '🏅', ['Hosszú élet', 'Long life'], ['Érd meg a 90-et', 'Reach 90'], 'rare', () => p.age >= 90],
    ['pet', '🐾', ['Állatbarát', 'Animal lover'], ['Legyen kisállatod', 'Own a pet'], 'common', () => !!p.pet],
    ['rich1', '💵', ['Első millió', 'First million'], ['Nettó vagyon 1 M', 'Net worth 1M'], 'common', () => nw() >= 1e6],
    ['a50', '🎈', ['Félszáz', 'Fifty'], ['Érd meg az 50-et', 'Reach 50'], 'common', () => p.age >= 50],
    ['kid1', '👶', ['Szülő', 'Parent'], ['Legyen gyereked', 'Have a child'], 'common', () => kids() >= 1],
    ['hard', '💀', ['Kemény élet', 'Hardcore'], ['Valósághű módban 60 év', 'Reach 60 on Realistic'], 'epic', () => st.diff == 'hard' && p.age >= 60],
    ['sec', '🕵️', ['???', '???'], ['Titkos: túlélni a börtönt', 'Secret: survive prison'], 'secret', () => p.crim > 0 && p.prison > 0 && p.age >= 40],
    ['sec2', '🧙', ['???', '???'], ['Titkos: gazdag szegénynek indulva', 'Secret: rags to riches'], 'secret', () => p.fam == 1 && nw() >= 5e7]
  ];
  const RC = { common: '#8a9aa3', rare: '#1f8a83', epic: '#8a4fd1', legend: '#f0b429', secret: '#e4572e' };
  const GOALS = [
    ['rich', '💰', ['Gazdagság', 'Wealth'], ['Nettó vagyon 100 M', 'Net worth 100M'], () => nw() >= 1e8],
    ['trav', '🌍', ['Világutazó', 'Traveler'], ['8 desztináció', '8 destinations'], () => Object.keys(p.trav || {}).length >= 8],
    ['fam', '👨‍👩‍👧‍👦', ['Nagy család', 'Big family'], ['3 gyerek', '3 children'], () => kids() >= 3],
    ['star', '🌟', ['Karriercsúcs', 'Career peak'], ['Karrier 3. rang', 'Career rank 3'], () => p.car && p.car.rank >= 3],
    ['doc', '🎓', ['Tudós', 'Scholar'], ['Diploma + 70 okos', 'Degree + 70 smart'], () => p.edu == 2 && p.sma >= 70],
    ['long', '🏅', ['Hosszú élet', 'Long life'], ['90 év', 'Age 90'], () => p.age >= 90]
  ];
  function toast(m) {
    const d = el(`<div style="position:absolute;left:50%;top:calc(14px + env(safe-area-inset-top,0px));transform:translateX(-50%);background:#16232e;color:#fff;padding:10px 16px;border-radius:14px;z-index:99;font-weight:700;box-shadow:0 6px 20px #0006;max-width:90%;text-align:center">${m}</div>`);
    $('#app').append(d); setTimeout(() => d.remove(), 3200);
    try { if (st.vib && navigator.vibrate) navigator.vibrate(60); } catch (e) {}
  }
  const score = () => Math.round(p.age * 10 + Math.max(0, nw()) / 1e5 + kids() * 30 + (p.edu || 0) * 40 + Object.keys(p.trav || {}).length * 15 + (p.goalDone ? 200 : 0));
  function chk() {
    if (!p || !p.rel) return;
    const have = L('relife_ach') || {}; let ch = 0;
    AC.forEach(a => { if (!have[a[0]] && a[5]()) { have[a[0]] = Date.now(); ch = 1; toast(`🏆 ${a[1]} ${t(a[4] == 'secret' ? a[3] : a[2])}`); } });
    if (ch) S('relife_ach', have);
    const g = GOALS.find(x => x[0] == p.goal);
    if (g && !p.goalDone && !p.dead && g[4]()) { p.goalDone = 1; toast(`🎯 ${t(['Életcél teljesítve: ', 'Life goal done: '])}${t(g[2])}`); }
    if (p.dead && !p.sc) {
      p.sc = score(); const lv = L('relife_lives') || [];
      lv.push({ n: p.name, a: p.age, s: p.sc, g: p.goal || '', d: p.goalDone ? 1 : 0, w: Math.round(nw()) }); S('relife_lives', lv.slice(-30));
      const es = $('#es'); if (es) es.textContent += `\n⭐ ${t(['Életpontszám', 'Life score'])}: ${p.sc}` + (p.goalDone ? ' 🎯' : '');
    }
  }
  const _render = render;
  render = function () { _render.apply(this, arguments); try { chk(); } catch (e) { } };
  // ----- életcél választás induláskor -----
  const _sl = startLife;
  startLife = function () {
    _sl.apply(this, arguments);
    setTimeout(() => popup(t(['Válassz életcélt', 'Pick a life goal']), t(['A játék követi a haladásodat.', 'The game tracks your progress.']),
      GOALS.map(g => [`${g[1]} ${t(g[2])} – ${t(g[3])}`, () => { p.goal = g[0]; render(); }]).concat([[t(['Nincs célom', 'No goal']), null]])), 500);
  };
  // ----- kihívás-módok -----
  const _sl2 = startLife;
  startLife = function () {
    _sl2.apply(this, arguments);
    if (st.mode == 'poor') { p.fam = 1; p.money = 0; }
    if (st.mode != 'none') p.mode = st.mode;
  };
  // ----- belső hang + remete + gyors élet -----
  const VOICE = [
    [() => p.hap < 30, ['Úgy érzem, minden szürke mostanában...', 'Everything feels grey lately...']],
    [() => p.hea < 30, ['Fáradt vagyok. Többet kellene pihennem.', 'I am tired. I should rest more.']],
    [() => p.money > 5e6, ['Furcsa, hogy a pénz mennyi mindent megold, és mennyit nem.', 'Funny how much money fixes, and how much it does not.']],
    [() => p.age > 60, ['Sok minden történt. Jó volt ez az út.', 'So much has happened. It has been a good road.']],
    [() => p.age > 6 && p.age < 18, ['Vajon milyen leszek, ha felnövök?', 'I wonder what I will be like grown up.']],
    [() => p.rel.filter(r => r.alive && r.role == 'Barát').length == 0 && p.age > 12, ['Úgy érzem, elmaradtam a barátaimtól...', 'I feel I have drifted from my friends...']],
    [() => true, ['Jó lenne többet utazni egyszer.', 'I would love to travel more someday.']]
  ];
  const _up = up;
  up = function () {
    const was = p && p.dead; _up.apply(this, arguments);
    try {
      if (was || p.dead) return;
      if (p.mode == 'hermit') p.rel.forEach(r => { if (r.alive && ['Barát', 'Osztálytárs'].includes(r.role) && p.age > 12) r.bond = Math.min(r.bond, 4); });
      if (p.mode == 'fast' && p.age % 2 == 0 && p.age < 85) { p.age--; _up.call(this); }
      if (Math.random() < .35) { const v = VOICE.find(x => x[0]()); if (v) { lg('💭 ' + t(v[1])); render(); } }
    } catch (e) { }
  };
  // ----- rövid tutorial -----
  setTimeout(() => { if (!st.tut) { st.tut = 1; applySet(); popup(t(['Üdv a ReLife-ban!', 'Welcome to ReLife!']), t(['Tipp: a „Kor” gomb lépteti az évet. A fülekkel (💼💰👥🎯) dönthetsz. Cél és achievementek a ⚙️ Beállításokban.', 'Tip: the Age button advances a year. Use the tabs (💼💰👥🎯) to decide. Goals and achievements live in ⚙️ Settings.']), [[t(['Értem', 'Got it']), () => {}]]); } }, 800);
  // ----- Beállítások / Achievement / Életek képernyő -----
  const box = el('<div id="cfg" class="ov" hidden style="z-index:50"><div class="box" id="cfgb"></div></div>');
  $('#app').append(box);
  const seg = (k, opts) => `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 12px">${opts.map(o => `<button class="chip ${st[k] == o[0] ? 'on' : ''}" data-k="${k}" data-v="${o[0]}">${t(o[1])}</button>`).join('')}</div>`;
  const tog = (k, l) => `<label style="display:flex;justify-content:space-between;padding:8px 0"><span>${t(l)}</span><input type="checkbox" data-c="${k}" ${st[k] ? 'checked' : ''}></label>`;
  function showCfg(v) {
    v = v || 'main'; let h = '';
    const back = `<button class="ghost" data-v2="main">${t(['‹ Vissza', '‹ Back'])}</button>`;
    if (v == 'main') h = `<h2>⚙️ ${t(['Beállítások', 'Settings'])}</h2>
      <b>${t(['Nehézség', 'Difficulty'])}</b>${seg('diff', [['easy', ['Könnyű', 'Easy']], ['normal', ['Normál', 'Normal']], ['hard', ['Valósághű', 'Realistic']]])}
      <b>${t(['Téma', 'Theme'])}</b>${seg('th', [['auto', ['Auto', 'Auto']], ['light', ['Világos', 'Light']], ['dark', ['Sötét', 'Dark']]])}
      <b>${t(['Betűméret', 'Font size'])}</b>${seg('fs', [['s', ['Kicsi', 'Small']], ['m', ['Közepes', 'Medium']], ['l', ['Nagy', 'Large']]])}
      <b>${t(['Kihívás-mód (új életnél)', 'Challenge mode (new life)'])}</b>${seg('mode', [['none', ['Nincs', 'None']], ['poor', ['Szegény start', 'Poor start']], ['hermit', ['Remete', 'Hermit']], ['fast', ['Gyors élet', 'Fast life']]])}
      <b>${t(['Nézet', 'View'])}</b>${seg('view', [['simple', ['Egyszerű', 'Simple']], ['full', ['Részletes', 'Detailed']]])}
      <b>${t(['Tartalomszűrő', 'Content filter'])}</b>${tog('fPr', ['Börtön / bűnözés kikapcsolása', 'Hide prison / crime'])}${tog('fAl', ['Alkohol kikapcsolása', 'Hide alcohol'])}${tog('fDe', ['Halálesetes események kikapcsolása', 'Hide death events'])}
      ${tog('vib', ['Rezgés', 'Vibration'])}${tog('snd', ['Hangok', 'Sounds'])}${tog('ntf', ['Értesítések', 'Notifications'])}
      <div style="display:grid;gap:8px;margin-top:10px"><button data-v2="ach">🏆 ${t(['Achievementek', 'Achievements'])}</button><button data-v2="lives">📚 ${t(['Életek könyvtára', 'Lives library'])}</button>
      <button data-a="exp">📤 ${t(['Mentés exportálása', 'Export save'])}</button><button data-a="imp">📥 ${t(['Mentés importálása', 'Import save'])}</button><button data-a="del">🗑 ${t(['Adatok törlése', 'Delete data'])}</button><button data-v2="about">ℹ️ ${t(['Névjegy / Változásnapló', 'About / Changelog'])}</button><button data-a="x">${t(['Bezár', 'Close'])}</button></div>`;
    if (v == 'ach') { const have = L('relife_ach') || {}, n = Object.keys(have).length;
      h = `${back}<h2>🏆 ${n}/${AC.length} (${Math.round(n / AC.length * 100)}%)</h2><div class="tr"><i style="width:${n / AC.length * 100}%"></i></div>` + AC.map(a => { const o = have[a[0]], hid = a[4] == 'secret' && !o;
        return `<div class="card" style="margin:8px 0;opacity:${o ? 1 : .55};border-left:5px solid ${RC[a[4]]}"><b>${hid ? '🔒 ???' : a[1] + ' ' + t(a[2])}</b><br><small>${hid ? t(['Titkos achievement', 'Secret achievement']) : t(a[3])} · ${a[4]}</small></div>`; }).join(''); }
    if (v == 'lives') { const lv = (L('relife_lives') || []).slice().reverse(), top = lv.slice().sort((a, b) => b.s - a.s)[0];
      h = `${back}<h2>📚 ${t(['Életek', 'Lives'])}</h2>` + (top ? `<p>👑 Hall of Fame: ${top.n} – ${top.s} ⭐</p>` : `<p>${t(['Még nincs lezárt élet.', 'No finished lives yet.'])}</p>`) + lv.map(x => `<div class="card" style="margin:6px 0"><b>${x.n}</b> · ${x.a} ${t(['év', 'yr'])}<br><small>⭐ ${x.s}${x.d ? ' 🎯' : ''}</small></div>`).join(''); }
    if (v == 'about') h = `${back}<h2>ℹ️ ReLife</h2><p>v1.1: ${t(['Beállítások, nehézség, tartalomszűrő, achievementek, életcélok, életpontszám, életek könyvtára, téma, betűméret, mentés export/import.', 'Settings, difficulty, content filter, achievements, life goals, life score, lives library, theme, font size, save export/import.'])}</p>`;
    $('#cfgb').innerHTML = h; box.hidden = false;
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) { st[b.dataset.k] = b.dataset.v; applySet(); showCfg(); }
    else if (b.dataset.v2) showCfg(b.dataset.v2);
    else if (b.dataset.a == 'x') box.hidden = true;
    else if (b.dataset.a == 'exp') { const s = localStorage.getItem('relife_save') || ''; try { navigator.clipboard.writeText(s); alert(t(['Mentés a vágólapra másolva.', 'Save copied to clipboard.'])); } catch (e) { prompt('Save:', s); } }
    else if (b.dataset.a == 'imp') { const s = prompt(t(['Illeszd be a mentést:', 'Paste the save:'])); if (s) { try { const o = JSON.parse(s); if (!o.rel || !o.assets) throw 0; localStorage.setItem('relife_save', s); location.reload(); } catch (e) { alert(t(['Érvénytelen mentés.', 'Invalid save.'])); } } }
    else if (b.dataset.a == 'del') { if (confirm(t(['Minden adat törlődik. Biztos?', 'All data will be erased. Sure?']))) { ['relife_save', 'relife_ach', 'relife_lives', 'relife_set'].forEach(k => localStorage.removeItem(k)); location.reload(); } }
  });
  box.addEventListener('change', e => { const c = e.target.dataset.c; if (c) { st[c] = e.target.checked ? 1 : 0; applySet(); } });
  const tb = el(`<button class="big alt" id="tset">⚙️ ${t(['Beállítások', 'Settings'])}</button>`);
  tb.onclick = () => showCfg(); $('#title').append(tb);
  const old = document.querySelector('#title .lang'); if (old) $('#title').insertBefore(tb, old);
  applySet();
})();
