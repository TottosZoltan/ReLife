
// ======================= extras.js =======================
// ReLife extras: Beállítások, nehézség, tartalomszűrő, eredmények, életcélok, Életek könyvtár
(function () {
  const L = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const D = { snd: 1, ntf: 0, mode: 'none', tut: 0, diff: 'normal', th: 'auto', fs: 'm', fNo: 0, fAl: 0, fDe: 0, fPr: 0, vib: 1, view: 'full' };
  let st = Object.assign({}, D, L('relife_set') || {});
  const t = x => T(x), el = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; };
  function applySet() {
    const b = document.body; b.dataset.diff = st.diff; b.dataset.fs = st.fs;
    b.dataset.th = st.th == 'auto' ? (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light') : st.th;
    b.dataset.view = st.view; const mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.content = b.dataset.th == 'dark' ? '#0e171e' : '#16232e'; S('relife_set', st);
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
  // ----- eredmények -----
  const nw = () => { try { return netw(); } catch (e) { return p.money; } };
  const kids = () => p.rel.filter(r => r.role == 'Gyerek').length;
  const hobN = () => Object.keys(p.hob || {}).length, hasA = k => p.assets.some(x => x.t == k), frN = () => p.rel.filter(r => r.alive && r.role == 'Barát').length;
  const ageP = n => () => [p.age, n];
  // [id, ikon, [név], [leírás], ritkaság, teszt, haladás()->[jelenlegi, cél]]
  const AC = [
    ['b1', '👶', ['Első év', 'First year'], ['Töltsd be az 1. évet', 'Turn 1'], 'common', () => p.age >= 1],
    ['sch', '🎒', ['Iskolás', 'Schoolkid'], ['Kezdd el az iskolát (6 év)', 'Start school (age 6)'], 'common', () => p.age >= 6, ageP(6)],
    ['a18', '🔑', ['Nagykorú', 'Of age'], ['Töltsd be a 18-at', 'Turn 18'], 'common', () => p.age >= 18, ageP(18)],
    ['a30', '🎉', ['Harmincas', 'Thirty'], ['Töltsd be a 30-at', 'Turn 30'], 'common', () => p.age >= 30, ageP(30)],
    ['a50', '🎈', ['Félszáz', 'Fifty'], ['Érd meg az 50-et', 'Reach 50'], 'common', () => p.age >= 50, ageP(50)],
    ['a70', '🧓', ['Hetvenes', 'Seventy'], ['Érd meg a 70-et', 'Reach 70'], 'rare', () => p.age >= 70, ageP(70)],
    ['old', '🏅', ['Hosszú élet', 'Long life'], ['Érd meg a 90-et', 'Reach 90'], 'rare', () => p.age >= 90, ageP(90)],
    ['c100', '🎂', ['100 éves', 'Centenarian'], ['Érd meg a 100-at', 'Reach 100'], 'legend', () => p.age >= 100, ageP(100)],
    ['hs', '📘', ['Érettségi', 'School done'], ['Szerezz érettségit', 'Finish high school'], 'common', () => p.edu >= 1],
    ['deg', '🎓', ['Diplomás', 'Graduate'], ['Szerezz diplomát', 'Earn a degree'], 'common', () => p.edu == 2],
    ['lic', '🚗', ['Jogsi!', 'Licensed'], ['Szerezz jogosítványt', 'Get a driving licence'], 'common', () => !!p.lic],
    ['job1', '💼', ['Első munka', 'First job'], ['Legyen munkád vagy karriered', 'Get a job or a career'], 'common', () => !!(p.job || p.car)],
    ['car', '🌟', ['Csúcsra jutottál', 'At the top'], ['Karrier 3. rang', 'Career rank 3'], 'epic', () => p.car && p.car.rank >= 3, () => [p.car ? p.car.rank : 0, 3]],
    ['love', '💘', ['Szerelem', 'In love'], ['Legyen párod', 'Have a partner'], 'common', () => p.rel.some(r => r.alive && (r.role == 'Párod' || r.role == 'Házastárs'))],
    ['mar', '💍', ['Igen!', 'I do'], ['Házasodj meg', 'Get married'], 'common', () => p.rel.some(r => r.role == 'Házastárs')],
    ['kid1', '👶', ['Szülő', 'Parent'], ['Legyen gyereked', 'Have a child'], 'common', () => kids() >= 1],
    ['fam', '👨‍👩‍👧‍👦', ['Nagycsalád', 'Big family'], ['3 gyerek', '3 children'], 'rare', () => kids() >= 3, () => [kids(), 3]],
    ['f5', '🤝', ['Népszerű', 'Popular'], ['5 élő barát', '5 living friends'], 'common', () => frN() >= 5, () => [frN(), 5]],
    ['f10', '🧑‍🤝‍🧑', ['10 barát', '10 friends'], ['10 élő barát', '10 living friends'], 'rare', () => frN() >= 10, () => [frN(), 10]],
    ['pet', '🐾', ['Állatbarát', 'Animal lover'], ['Legyen kisállatod', 'Own a pet'], 'common', () => !!p.pet],
    ['hob1', '🎸', ['Hobbi', 'Hobbyist'], ['Kezdj el egy hobbit', 'Start a hobby'], 'common', () => hobN() >= 1],
    ['hob3', '🎭', ['Sokoldalú', 'Well-rounded'], ['3 hobbi egyszerre', '3 hobbies at once'], 'rare', () => hobN() >= 3, () => [hobN(), 3]],
    ['hob', '🎯', ['Hobbimester', 'Hobby master'], ['Hobbi 90 fölé', 'Hobby level 90+'], 'rare', () => Object.values(p.hob || {}).some(h => h.lv >= 90), () => [Math.max(0, ...Object.values(p.hob || {}).map(h => h.lv || 0)), 90]],
    ['lang5', '🗣️', ['Nyelvzseni', 'Polyglot'], ['Nyelvtudás 5/5', 'Language skill 5/5'], 'rare', () => (p.lang || 0) >= 5, () => [p.lang || 0, 5]],
    ['fit', '🏃', ['Sportember', 'Athlete'], ['Kondíció 80 fölé', 'Fitness 80+'], 'rare', () => (p.fit || 0) >= 80, () => [p.fit || 0, 80]],
    ['trav', '🌍', ['Világutazó', 'Globetrotter'], ['8 országba eljutni', 'Visit 8 destinations'], 'rare', () => Object.keys(p.trav || {}).length >= 8, () => [Object.keys(p.trav || {}).length, 8]],
    ['house', '🏡', ['Háztulajdonos', 'Homeowner'], ['Végy házat', 'Own a house'], 'common', () => hasA('house')],
    ['yacht', '🛥️', ['Kapitány', 'Captain'], ['Végy jachtot', 'Own a yacht'], 'epic', () => hasA('boat')],
    ['mem', '📷', ['Emlékgyűjtő', 'Memory keeper'], ['10 emlék a fotóalbumban', '10 album memories'], 'rare', () => (p.album || []).length >= 10, () => [(p.album || []).length, 10]],
    ['rich1', '💵', ['Első millió', 'First million'], ['Nettó vagyon 1 M', 'Net worth 1M'], 'common', () => nw() >= 1e6, () => [nw(), 1e6]],
    ['rich10', '💶', ['Tízmilliós', 'Ten million'], ['Nettó vagyon 10 M', 'Net worth 10M'], 'rare', () => nw() >= 1e7, () => [nw(), 1e7]],
    ['mil', '💰', ['Százmilliomos', 'Hundred-millionaire'], ['Nettó vagyon 100 M', 'Net worth 100M'], 'epic', () => nw() >= 1e8, () => [nw(), 1e8]],
    ['bil', '💎', ['Milliárdos', 'Billionaire'], ['Nettó vagyon 1 Mrd', 'Net worth 1B'], 'legend', () => nw() >= 1e9, () => [nw(), 1e9]],
    ['inv', '📈', ['Befektető', 'Investor'], ['1 M fölött befektetve', '1M+ invested'], 'rare', () => (p.inv || 0) >= 1e6, () => [p.inv || 0, 1e6]],
    ['cry', '₿', ['Kriptós', 'Crypto fan'], ['Legyen kriptód', 'Hold some crypto'], 'common', () => (p.cry || 0) > 0],
    ['joy', '😊', ['Boldog ember', 'Happy soul'], ['Boldogság 95+ felnőttként', 'Happiness 95+ as an adult'], 'rare', () => p.age >= 20 && p.hap >= 95],
    ['gen', '🧠', ['Zseni', 'Genius'], ['Okosság 95+', 'Smarts 95+'], 'rare', () => p.sma >= 95],
    ['iron', '🛡️', ['Vasegészség', 'Iron health'], ['60 évesen is 90+ egészség', 'Health 90+ at age 60+'], 'epic', () => p.age >= 60 && p.hea >= 90],
    ['hard', '💀', ['Kemény élet', 'Hardcore'], ['Valósághű módban 60 év', 'Reach 60 on Realistic'], 'epic', () => st.diff == 'hard' && p.age >= 60],
    ['m_f', '⚡', ['Száguldó évek', 'Racing years'], ['Gyors élet módban 60 év', 'Reach 60 in Fast mode'], 'rare', () => p.mode == 'fast' && p.age >= 60],
    ['m_p', '🪙', ['A semmiből', 'From nothing'], ['Szegény startból 10 M vagyon', '10M net worth from a poor start'], 'epic', () => p.mode == 'poor' && nw() >= 1e7],
    ['m_h', '🏔️', ['Remete túlélő', 'Hermit survivor'], ['Remete módban 40 év', 'Reach 40 in Hermit mode'], 'epic', () => p.mode == 'hermit' && p.age >= 40],
    ['sec', '🕵️', ['Új lap', 'Clean slate'], ['Titkos: túlélni a börtönt és megérni a 40-et', 'Secret: survive prison and reach 40'], 'secret', () => p.crim > 0 && p.prison > 0 && p.age >= 40],
    ['sec2', '🧙', ['Rongyoktól a gazdagságig', 'Rags to riches'], ['Titkos: szegény családból 50 M vagyon', 'Secret: 50M net worth from a modest family'], 'secret', () => p.fam == 1 && nw() >= 5e7],
    ['sec3', '🐉', ['Halhatatlan mágnás', 'Immortal tycoon'], ['Titkos: 100 évesen milliárdosnak lenni', 'Secret: be a billionaire at 100'], 'secret', () => p.age >= 100 && nw() >= 1e9],
    ['sec4', '🦉', ['Éjjeli bagoly', 'Night owl'], ['Titkos: játssz hajnali 2 és 5 között', 'Secret: play between 2 and 5 AM'], 'secret', () => { const h = new Date().getHours(); return h >= 2 && h < 5; }]
  ];
  const RC = { common: '#8a9aa3', rare: '#1f8a83', epic: '#8a4fd1', legend: '#f0b429', secret: '#e4572e' };
  const RN = { common: ['Közönséges', 'Common'], rare: ['Ritka', 'Rare'], epic: ['Epikus', 'Epic'], legend: ['Legendás', 'Legendary'], secret: ['Titkos', 'Secret'] };
  const PT = { common: 10, rare: 25, epic: 50, legend: 100, secret: 75 };
  const HB = { common: 2, rare: 4, epic: 7, legend: 10, secret: 8 };
  const RO = { common: 0, rare: 1, epic: 2, secret: 3, legend: 4 };
  const fmtp = v => v >= 1e9 ? (v / 1e9).toFixed(1).replace(/\.0$/, '') + t([' Mrd', ' B']) : v >= 1e6 ? (v / 1e6).toFixed(1).replace(/\.0$/, '') + ' M' : Math.round(v);
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
  // ----- achievement-feloldás: hang, rezgés, konfetti, villogó kártya -----
  let _ac = null;
  const actx = () => { try { _ac = _ac || new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state == 'suspended') _ac.resume(); return _ac; } catch (e) { return null; } };
  function tone(c, f, t0, d, type, vol) { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .015); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + .05); }
  const NT = { D5: 587.33, C5: 523.25, E5: 659.25, F5: 698.46, G5: 783.99, Ab5: 830.61, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093 };
  const JG = {
    common: [['C5', 0, .16], ['G5', .11, .3]],
    rare: [['C5', 0, .14], ['E5', .09, .14], ['G5', .18, .34]],
    epic: [['C5', 0, .14], ['E5', .08, .14], ['G5', .16, .14], ['C6', .25, .55]],
    legend: [['C5', 0, .14], ['E5', .07, .14], ['G5', .14, .14], ['C6', .21, .14], ['E6', .3, .16], ['G6', .4, .9]],
    secret: [['D5', 0, .2], ['F5', .13, .2], ['Ab5', .26, .2], ['B5', .39, .2], ['E6', .52, .7]]
  };
  function jingle(r) {
    if (!st.snd) return; const c = actx(); if (!c) return; const t0 = c.currentTime + .02;
    JG[r].forEach(([n, o, d]) => tone(c, NT[n], t0 + o, d, 'triangle', .13));
    if (r == 'epic' || r == 'legend' || r == 'secret') { const L0 = JG[r][JG[r].length - 1][1]; for (let k = 0; k < (r == 'legend' ? 9 : 5); k++) tone(c, NT.C7 * (1 + (k % 3) * .25), t0 + L0 + k * .07, .22, 'sine', .035); }
    if (r == 'legend') [NT.C5, NT.E5, NT.G5].forEach(f => tone(c, f, t0 + .4, 1.3, 'sine', .05));
  }
  const VIB = { common: [40], rare: [50, 40, 50], epic: [60, 40, 60, 40, 140], legend: [80, 50, 80, 50, 80, 50, 240], secret: [30, 40, 30, 40, 30, 40, 160] };
  const BURST = { common: 36, rare: 70, epic: 130, legend: 230, secret: 150 };
  let aq = [], abusy = false;
  function nextBanner() {
    if (abusy || !aq.length) return; abusy = true;
    const a = aq.shift(), r = a.r;
    const d = el(`<div class="achb ${r}" style="--c:${RC[r]}"><div class="achi"><span>${a.i}</span><i></i></div><div class="acht"><small>${t(['EREDMÉNY FELOLDVA', 'ACHIEVEMENT UNLOCKED'])} · ${t(RN[r]).toUpperCase()}</small><b>${a.n}</b><em>${a.d}</em></div><div class="achp">+${a.pt}⭐</div></div>`);
    $('#app').append(d);
    jingle(r);
    try { if (st.vib && navigator.vibrate) navigator.vibrate(VIB[r]); } catch (e) {}
    try { confetti(BURST[r]); if (r == 'legend') setTimeout(() => confetti(160), 450); if (r == 'epic' || r == 'legend' || r == 'secret') flash('good'); } catch (e) {}
    const done = () => { if (d._x) return; d._x = 1; d.classList.add('out'); setTimeout(() => { d.remove(); abusy = false; nextBanner(); }, 380); };
    d.onclick = done; setTimeout(done, r == 'legend' ? 4600 : 3400);
  }
  function unlockCheck() {
    const have = L('relife_ach') || {}, got = [];
    AC.forEach(a => { if (!have[a[0]] && a[5]()) { have[a[0]] = Date.now(); got.push(a); } });
    if (!got.length) return;
    S('relife_ach', have);
    got.forEach(a => { p.hap = Math.min(100, p.hap + HB[a[4]]); });
    const top = got.slice().sort((x, y) => RO[y[4]] - RO[x[4]])[0][4], pts = got.reduce((s, a) => s + PT[a[4]], 0);
    if (got.length > 2) aq.push({ i: '🏆', n: got.length + t([' új eredmény', ' new achievements']), d: got.slice(0, 4).map(a => t(a[2])).join(', ') + (got.length > 4 ? '…' : ''), r: top, pt: pts });
    else got.forEach(a => aq.push({ i: a[1], n: t(a[2]), d: t(a[3]), r: a[4], pt: PT[a[4]] }));
    nextBanner();
  }
  const score = () => Math.round(p.age * 10 + Math.max(0, nw()) / 1e5 + kids() * 30 + (p.edu || 0) * 40 + Object.keys(p.trav || {}).length * 15 + (p.goalDone ? 200 : 0));
  function chk() {
    if (!p || !p.rel) return;
    unlockCheck();
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
  setTimeout(() => { if (!st.tut) { st.tut = 1; applySet(); popup(t(['Üdv a ReLife-ban!', 'Welcome to ReLife!']), t(['Tipp: a „Kor” gomb lépteti az évet. A fülekkel (💼💰👥🎯) dönthetsz. Cél és eredmények a ⚙️ Beállításokban.', 'Tip: the Age button advances a year. Use the tabs (💼💰👥🎯) to decide. Goals and achievements live in ⚙️ Settings.']), [[t(['Értem', 'Got it']), () => {}]]); } }, 800);
  // ----- Beállítások / Achievement / Életek képernyő -----
  const box = el('<div id="cfg" class="ov" hidden style="z-index:50"><div class="box" id="cfgb"></div></div>');
  $('#app').append(box);
  const seg = (k, opts) => `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 12px">${opts.map(o => `<button class="chip ${st[k] == o[0] ? 'on' : ''}" data-k="${k}" data-v="${o[0]}">${t(o[1])}</button>`).join('')}</div>`;
  const tog = (k, l) => `<label style="display:flex;justify-content:space-between;padding:8px 0"><span>${t(l)}</span><input type="checkbox" data-c="${k}" ${st[k] ? 'checked' : ''}></label>`;
  let afil = 'all', viewMark = 0;
  const newAch = () => Object.values(L('relife_ach') || {}).filter(x => x > +(L('relife_achview') || 0)).length;
  function showCfg(v) {
    v = v || 'main'; let h = '';
    const back = `<button class="ghost" data-v2="main">${t(['‹ Vissza', '‹ Back'])}</button>`;
    if (v == 'main') h = `<h2>⚙️ ${t(['Beállítások', 'Settings'])}</h2>
      <b>${t(['Nehézség', 'Difficulty'])}</b>${seg('diff', [['easy', ['Könnyű', 'Easy']], ['normal', ['Normál', 'Normal']], ['hard', ['Valósághű', 'Realistic']]])}
      <b>${t(['Téma', 'Theme'])}</b>${seg('th', [['auto', ['Auto', 'Auto']], ['light', ['Világos', 'Light']], ['dark', ['Sötét', 'Dark']]])}
      <b>${t(['Betűméret', 'Font size'])}</b>${seg('fs', [['s', ['Kicsi', 'Small']], ['m', ['Közepes', 'Medium']], ['l', ['Nagy', 'Large']]])}
      <b>${t(['Nézet', 'View'])}</b>${seg('view', [['simple', ['Egyszerű', 'Simple']], ['full', ['Részletes', 'Detailed']]])}
      <b>${t(['Tartalomszűrő', 'Content filter'])}</b>${tog('fPr', ['Börtön / bűnözés kikapcsolása', 'Hide prison / crime'])}${tog('fAl', ['Alkohol kikapcsolása', 'Hide alcohol'])}${tog('fDe', ['Halálesetes események kikapcsolása', 'Hide death events'])}
      ${tog('vib', ['Rezgés', 'Vibration'])}${tog('snd', ['Hangok', 'Sounds'])}${tog('ntf', ['Értesítések', 'Notifications'])}
      <div style="display:grid;gap:8px;margin-top:10px"><button data-a="album">📷 ${t(['Fotóalbum', 'Photo album'])}</button><button data-v2="ach">🏆 ${t(['Eredmények', 'Achievements'])}${newAch() ? ` <b style="background:#e4572e;color:#fff;border-radius:99px;padding:1px 8px;font-size:12px">${newAch()} ${t(['új', 'new'])}</b>` : ''}</button><button data-v2="lives">📚 ${t(['Életek könyvtára', 'Lives library'])}</button>
      <button data-a="privacy">🔐 ${t(['Adatvédelmi beállítások', 'Privacy options'])}</button><button data-a="exp">📤 ${t(['Mentés exportálása', 'Export save'])}</button><button data-a="imp">📥 ${t(['Mentés importálása', 'Import save'])}</button><button data-a="del">🗑 ${t(['Adatok törlése', 'Delete data'])}</button><button data-v2="about">ℹ️ ${t(['Névjegy / Változásnapló', 'About / Changelog'])}</button><button data-a="x">${t(['Bezár', 'Close'])}</button></div>`;
    if (v == 'ach') {
      const have = L('relife_ach') || {}, n = Object.keys(have).length, pts = AC.reduce((s, a) => s + (have[a[0]] ? PT[a[4]] : 0), 0), tot = AC.reduce((s, a) => s + PT[a[4]], 0);
      const cnt = r => AC.filter(a => a[4] == r && have[a[0]]).length + '/' + AC.filter(a => a[4] == r).length;
      const list = AC.filter(a => afil == 'all' || a[4] == afil).sort((a, b) => (have[b[0]] ? 1 : 0) - (have[a[0]] ? 1 : 0) || (have[b[0]] || 0) - (have[a[0]] || 0));
      const cards = list.map(a => {
        const o = have[a[0]], hid = a[4] == 'secret' && !o; let pr = '';
        if (!o && a[6] && !hid) { try { const [c, m] = a[6](), pc = Math.max(0, Math.min(100, c / m * 100)); pr = `<div class="tr"><i style="width:${pc}%"></i></div><small>${fmtp(c)} / ${fmtp(m)}</small>`; } catch (x) { } }
        return `<div class="achc ${o ? 'on' : ''} ${a[4]}" style="--c:${RC[a[4]]}">${o && o > viewMark ? '<span class="new">NEW</span>' : ''}<div class="achg">${hid ? '🔒' : a[1]}</div><b>${hid ? '???' : t(a[2])}</b><small>${hid ? t(['Titkos eredmény', 'Secret achievement']) : t(a[3])}</small>${pr}<small class="pt">${o ? '✓ ' + new Date(o).toLocaleDateString(LANG == 'hu' ? 'hu-HU' : 'en-GB') + ' · +' + PT[a[4]] + '⭐' : t(RN[a[4]]) + ' · ' + PT[a[4]] + '⭐'}</small></div>`;
      }).join('');
      h = `${back}<h2>🏆 ${n}/${AC.length}</h2><div class="tr"><i style="width:${n / AC.length * 100}%"></i></div><p style="margin:4px 0 8px"><b>⭐ ${pts}</b> / ${tot} · ${Math.round(n / AC.length * 100)}%</p>
        <div class="chips" style="margin-bottom:4px"><button class="chip ${afil == 'all' ? 'on' : ''}" data-f="all">${t(['Mind', 'All'])} ${n}/${AC.length}</button>${Object.keys(RN).map(r => `<button class="chip ${afil == r ? 'on' : ''}" data-f="${r}" style="${afil == r ? '' : 'border-color:' + RC[r]}">${t(RN[r])} ${cnt(r)}</button>`).join('')}</div>
        <div class="achgrid">${cards}</div>`;
    }
    if (v == 'lives') { const lv = (L('relife_lives') || []).slice().reverse(), top = lv.slice().sort((a, b) => b.s - a.s)[0];
      h = `${back}<h2>📚 ${t(['Életek', 'Lives'])}</h2>` + (top ? `<p>👑 Hall of Fame: ${top.n} – ${top.s} ⭐</p>` : `<p>${t(['Még nincs lezárt élet.', 'No finished lives yet.'])}</p>`) + lv.map(x => `<div class="card" style="margin:6px 0"><b>${x.n}</b> · ${x.a} ${t(['év', 'yr'])}<br><small>⭐ ${x.s}${x.d ? ' 🎯' : ''}</small></div>`).join(''); }
    if (v == 'about') h = `${back}<h2>ℹ️ ReLife</h2><p>v1.1: ${t(['Beállítások, nehézség, tartalomszűrő, eredmények, életcélok, életpontszám, életek könyvtára, téma, betűméret, mentés export/import.', 'Settings, difficulty, content filter, achievements, life goals, life score, lives library, theme, font size, save export/import.'])}</p>`;
    $('#cfgb').innerHTML = h; box.hidden = false;
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) { st[b.dataset.k] = b.dataset.v; applySet(); showCfg(); }
    else if (b.dataset.f) { afil = b.dataset.f; showCfg('ach'); }
    else if (b.dataset.v2) { if (b.dataset.v2 == 'ach' && !box.querySelector('[data-f]')) { viewMark = +(L('relife_achview') || 0); S('relife_achview', Date.now()); afil = 'all'; } showCfg(b.dataset.v2); }
    else if (b.dataset.a == 'x') box.hidden = true;
    else if (b.dataset.a == 'album') { if (window.RLAlbum) window.RLAlbum(); }
    else if (b.dataset.a == 'privacy') { if (window.ReLifeAdPrivacyOptions) window.ReLifeAdPrivacyOptions(); }
    else if (b.dataset.a == 'exp') { const s = localStorage.getItem('relife_save') || ''; try { navigator.clipboard.writeText(s); alert(t(['Mentés a vágólapra másolva.', 'Save copied to clipboard.'])); } catch (e) { prompt('Save:', s); } }
    else if (b.dataset.a == 'imp') { const s = prompt(t(['Illeszd be a mentést:', 'Paste the save:'])); if (s) { try { const o = JSON.parse(s); if (!o.rel || !o.assets) throw 0; localStorage.setItem('relife_save', s); location.reload(); } catch (e) { alert(t(['Érvénytelen mentés.', 'Invalid save.'])); } } }
    else if (b.dataset.a == 'del') { if (confirm(t(['Minden adat törlődik. Biztos?', 'All data will be erased. Sure?']))) { ['relife_save', 'relife_ach', 'relife_lives', 'relife_set', 'relife_achview', 'relife_autom', 'relife_auto1', 'relife_auto2', 'relife_auto3', 'relife_slot1', 'relife_slot2', 'relife_slot3'].forEach(k => localStorage.removeItem(k)); location.reload(); } }
  });
  box.addEventListener('change', e => { const c = e.target.dataset.c; if (c) { st[c] = e.target.checked ? 1 : 0; applySet(); } });
  $('#tgear').onclick = () => showCfg();
  try { matchMedia('(prefers-color-scheme:dark)').addEventListener('change', applySet); } catch (x) { }
  applySet();
})();
;

// ======================= extras2.js =======================
// ReLife extras2: NPC személyiség, közös emlékek, veszekedés/kibékülés, családfa-összefoglaló
(function () {
  const t = x => T(x), rnd = a => a[Math.floor(Math.random() * a.length)];
  const PE = { kind: ['😇', ['Kedves', 'Kind']], amb: ['🚀', ['Ambiciózus', 'Ambitious']], fun: ['😂', ['Vicces', 'Funny']], shy: ['🤫', ['Csendes', 'Quiet']], wild: ['🎸', ['Szabad lélek', 'Free spirit']] };
  const MEM = [
    ['Együtt voltatok a Balatonon.', 'You went to Lake Balaton together.'], ['Hajnalig beszélgettetek.', 'You talked until dawn.'],
    ['Közösen sütöttetek egy tortát.', 'You baked a cake together.'], ['Kirándultatok a hegyekben.', 'You hiked in the mountains.'],
    ['Moziba mentetek együtt.', 'You went to the movies together.'], ['Nagyot nevettetek egy buta poénon.', 'You laughed at a silly joke.'],
    ['Együtt néztetek meg egy meccset.', 'You watched a match together.']];
  const FIGHT = ['Összevesztetek egy apróságon.', 'You had an argument over something small.'];
  const MAKE = ['Kibékültetek, és ettől közelebb kerültetek.', 'You made up and grew closer.'];
  const close = () => p.rel.filter(r => r.alive && ['Barát', 'Párod', 'Házastárs', 'Anya', 'Apa', 'Testvér'].includes(r.role));
  const pers = r => { if (!r.pers) r.pers = rnd(Object.keys(PE)); return r.pers; };
  const _up = up;
  up = function () {
    _up.apply(this, arguments);
    try {
      if (p.dead) return;
      p.rel.forEach(r => { if (r.alive) pers(r); });
      close().forEach(r => {
        if (r.fight) { if (Math.random() < .55) { r.fight = 0; r.bond = cl(r.bond + 10); (r.mem = r.mem || []).push(t(MAKE)); lg(`🤝 ${dn(r.n)}: ${t(MAKE)}`, 'good'); } else r.bond = cl(r.bond - 3); return; }
        const q = r.pers == 'kind' ? .2 : r.pers == 'wild' ? .35 : .12;
        if (r.bond > 25 && Math.random() < .07 * (r.pers == 'wild' ? 2 : 1)) { r.fight = 1; r.bond = cl(r.bond - 12); lg(`💢 ${dn(r.n)}: ${t(FIGHT)}`, 'bad'); }
        else if (Math.random() < q * .5 && p.age > 5) { const m = rnd(MEM); (r.mem = r.mem || []).push(t(m)); if (r.mem.length > 6) r.mem.shift(); r.bond = cl(r.bond + (r.pers == 'fun' ? 6 : 4)); lg(`📸 ${dn(r.n)}: ${t(m)}`, 'good'); }
      });
      render();
    } catch (e) { }
  };
  const _panel = panel;
  panel = function (tb) {
    let h = _panel.apply(this, arguments);
    try {
      if (tb == 'rel' && !sub && relOpen == null && p.age >= 3) {
        const c = close();
        if (c.length) h += `<h3 style="margin:14px 0 6px">${t(['Személyiségek és emlékek', 'Personalities & memories'])}</h3>` + c.map(r => { const e = PE[pers(r)], m = (r.mem || []).slice(-2);
          return `<div class="card"><div class="top"><b>${e[0]} ${dn(r.n)}</b><small>${t(e[1])}${r.fight ? ' · 💢' : ''}</small></div>${m.length ? '<small>' + m.map(x => '• ' + x).join('<br>') + '</small>' : ''}</div>`; }).join('');
        const k = p.rel.filter(r => r.alive && r.role == 'Gyerek').length, gp = p.rel.reduce((s, r) => s + (r.kin || []).filter(q => q.alive).length, 0);
        h += `<div class="card"><b>🌳 ${t(['Családfa', 'Family tree'])}</b><br><small>${t(['Gyerekek', 'Children'])}: ${k} · ${t(['Rokonok', 'Relatives'])}: ${gp}</small></div>`;
      }
    } catch (e) { }
    return h;
  };
})();
;

// ======================= extras3.js =======================
// ReLife extras3: havi költségvetés, városonkénti lakhatás, költözés, adó, piaci események, adomány
(function () {
  const t = x => T(x), R_ = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const MULT = { 'Budapest': 1.4, 'Debrecen': 1, 'Szeged': 1, 'Pécs': .9, 'Győr': 1, 'Miskolc': .85 };
  const mult = () => MULT[p.city && p.city[0]] || 1;
  const adult = () => p.age >= 18 && !p.uni && !(p.prison > 0);
  const kidsN = () => p.rel.filter(r => r.role == 'Gyerek' && r.alive && r.age < 18).length;
  function living() {
    const house = p.assets.some(x => x.t == 'house'), cars = p.assets.filter(x => x.t == 'car').length;
    const util = house ? 4.5e5 : 3e5, rent = house ? 0 : Math.round(1.2e6 * mult()), food = 5e5, car = cars * 3e5, kid = kidsN() * 6e5;
    return { util, rent, food, car, kid, total: util + rent + food + car + kid };
  }
  window.livingCost = living;
  function budget() {
    const L = living(), inc = window.yearIncome ? window.yearIncome() : (p.job ? p.pay : p.pension || 0), tax = (p.job || p.side) ? Math.round(inc * .08) : 0;
    const ins = p.assets.filter(x => x.ins).reduce((s, x) => s + Math.round(x.v * .025), 0), intr = Math.round((p.debt || 0) * .12);
    return { inc, tax, ...L, ins, intr, net: inc - tax - L.total - ins };
  }
  const m = n => fmt(Math.round(n));
  function extraInc() {
    const o = { biz: 0, car: 0, cr: 0, inf: 0 };
    try {
      if (p.car) { const C = CAR_BY[p.car.id]; if (C.cr) o.cr = crIncome(p.car, false, true); else { const v = rk(C.ranks[p.car.rank][1] * (.6 + p.car.perf / 125) * (1 + .15 * pkn(p.car, 'inc')) * (window.infBoost ? infBoost() : 1)); if (C.biz) o.biz = v; else o.car = v; } }
      if (p.inf) o.inf = crIncome(p.inf, false, true);
    } catch (e) { }
    return o;
  }
  function card() {
    const b = budget(), simple = document.body.dataset.view == 'simple';
    const rows = [[t(['Bevétel (munka, nyugdíj)', 'Income (job, pension)']), b.inc], [t(['Adó (8%)', 'Tax (8%)']), -b.tax]];
    const x = extraInc(); if (x.biz) rows.push([t(['Céges bevétel (becsült)', 'Company income (est.)']), x.biz]); if (x.car) rows.push([t(['Karrier-bevétel (becsült)', 'Career income (est.)']), x.car]);
    if (x.cr) rows.push([t(['Videós / alkotói bevétel (becsült)', 'Video / creator income (est.)']), x.cr]); if (x.inf) rows.push([t(['Influenszer-csatorna bevétele (becsült)', 'Influencer channel income (est.)']), x.inf]);
    rows.push([t(['Rezsi', 'Utilities']), -b.util]);
    if (b.rent) rows.push([t(['Lakhatás (bérleti díj)', 'Housing (rent)']), -b.rent]);
    rows.push([t(['Éves élelem', 'Food (yearly)']), -b.food]);
    if (b.car) rows.push([t(['Autók', 'Cars']), -b.car]);
    if (b.kid) rows.push([t(['Gyerekek', 'Children']), -b.kid]);
    if (b.ins) rows.push([t(['Biztosítás', 'Insurance']), -b.ins]);
    let x0; let h = `<h3 style="margin:12px 0 6px">📊 ${t(['Éves költségvetés', 'Yearly budget'])}</h3><div class="card"><div class="top"><b>${t(['Éves egyenleg', 'Yearly balance'])}</b><small>${m(b.net - b.intr + ((x0 = extraInc()).biz + x0.car + x0.cr + x0.inf))}</small></div>`;
    if (!simple) h += rows.map(r => `<div class="top"><small>${r[0]}</small><small>${m(r[1])}</small></div>`).join('') + (b.intr ? `<div class="top"><small>${t(['Hitelkamat (becsült)', 'Loan interest (est.)'])}</small><small>${m(-b.intr)}</small></div>` : '');
    h += `<small>${t(['A rezsit, a lakhatást és az élelmet minden évben ki kell fizetned. A cég- és alkotói bevétel becsült érték, a valós évente ingadozik.', 'Utilities, housing and food must be paid every year. Business and creator income is an estimate and varies each year.'])}</small>`;
    h += `<small>🏙 ${p.city[0]} · ${t(['lakhatási szorzó', 'housing factor'])} ×${mult()}</small></div>`;
    return h;
  }
  window.cityMult = c => MULT[c] || 1;
  window.moveTo = c => {
    if (p.age < 20 || p.money < 3e5 || p.done.mv) return; const x = CITY.find(q => q[0] == c); if (!x || x[0] == p.city[0]) return;
    p.done.mv = 1; p.money -= 3e5; p.city = x;
    p.rel.forEach(r => { if (r.alive && DRIFT.includes(r.role)) r.bond = Math.max(0, r.bond - R_(3, 10)); });
    lg(`🚚 ${t(['Elköltöztél ide: ', 'You moved to '])}${x[0]}.`); apply({ hap: R_(-3, 5) }); render();
  };
  window.donate = a => {
    a = Math.round(a); if (p.age < 18 || !(a >= 1e5) || p.money < a) return;
    p.money -= a; const first = !p.done.char; p.done.char = 1;
    p.rep = (p.rep || 0) + (a >= 5e6 ? 2 : a >= 1e6 ? 1 : 0);
    fxlog(`🎗 ${t(['Adományoztál: ', 'You donated: '])}${fmt(a)}.`, first ? { hap: a >= 5e6 ? 8 : a >= 1e6 ? 6 : a >= 3e5 ? 4 : 3 } : {}); render();
  };
  const _panel = panel;
  panel = function (tb) {
    let h = _panel.apply(this, arguments);
    try { if (tb == 'assets' && !sub && p.age >= 18) h += card(); } catch (e) { }
    return h;
  };
  const _up = up;
  up = function () {
    _up.apply(this, arguments);
    try {
      if (p.dead || !adult()) return;
      const b = budget();
      p.money -= b.tax; if (b.tax) lg(`🧾 ${t(['Adó: −', 'Tax: −'])}${fmt(b.tax)}.`);
      const r = Math.random();
      if (r < .05) { p.inv = Math.round((p.inv || 0) * .75); p.cry = Math.round((p.cry || 0) * .6); p.money = Math.round(p.money * .97); lg('📉 ' + t(['Gazdasági válság: a befektetések esnek.', 'Economic crisis: investments drop.']), 'bad'); }
      else if (r < .09) { p.money = Math.round(p.money * .96); lg('💸 ' + t(['Infláció: minden drágább lett.', 'Inflation: everything got pricier.']), 'bad'); }
      else if (r < .12) { p.inv = Math.round((p.inv || 0) * 1.2); lg('📈 ' + t(['Gazdasági fellendülés: a részvények nőnek.', 'Boom: stocks are rising.']), 'good'); }
      render();
    } catch (e) { }
  };
})();
;

// ======================= extras4.js =======================
// ReLife extras4: hangulatjelző, évszakok/ünnepek, szülinapi kártya, fotóalbum, életkártya megosztás
(function () {
  const t = x => T(x), pk = a => a[Math.floor(Math.random() * a.length)];
  const SEAS = [['🌸', ['tavasz', 'spring']], ['☀️', ['nyár', 'summer']], ['🍂', ['ősz', 'autumn']], ['❄️', ['tél', 'winter']]];
  const HOL = [['🎄', ['Karácsony a családdal.', 'Christmas with the family.']], ['🎆', ['Szilveszteri buli.', 'New Year’s Eve party.']], ['🐰', ['Húsvéti ebéd.', 'Easter lunch.']], ['🎃', ['Halloween este.', 'Halloween night.']], ['🎂', ['Jó kis szülinapi ünneplés.', 'A nice birthday celebration.']]];
  const mood = () => p.dead ? '🕊' : p.sick || p.hea < 30 ? '🤒' : p.hap < 30 ? '😞' : p.hap > 75 ? '😊' : p.hea < 45 ? '😴' : '🙂';
  const album = () => p.album || (p.album = []);
  const snap = (k, e, txt) => { p.snap = p.snap || {}; if (p.snap[k]) return; p.snap[k] = 1; album().push({ a: p.age, e, t: txt }); };
  function tag() {
    const av = $('#av'); if (!av) return; av.style.position = 'relative';
    let b = av.querySelector('.mood'); if (!b) { b = document.createElement('span'); }
    b.remove(); $('#app').dataset.season = p.age % 4;
  }
  function photos() {
    if (p.rel.some(r => r.role == 'Házastárs')) snap('wed', '💍', t(['Az esküvőd napja', 'Your wedding day']));
    if (p.rel.some(r => r.role == 'Gyerek')) snap('kid', '👶', t(['Az első gyereked', 'Your first child']));
    if (p.edu == 2) snap('deg', '🎓', t(['Diplomaosztó', 'Graduation']));
    if (p.age >= 18) snap('a18', '🎈', t(['Elmúltál 18', 'You turned 18']));
    if (p.pet) snap('pet', '🐾', t(['A kisállatod', 'Your pet']));
    if (p.age >= 50) snap('a50', '🥂', t(['Az 50. szülinap', 'Your 50th birthday']));
  }
  const _render = render;
  render = function () { _render.apply(this, arguments); try { tag(); photos(); } catch (e) { } };
  const _up = up;
  up = function () {
    const n0 = p.logs.length ? p.logs[p.logs.length - 1].n : 0; _up.apply(this, arguments);
    try {
      if (p.dead) return;
      const s = SEAS[p.age % 4], h = pk(HOL); lg(`${s[0]} ${t(h[1])}`, 'good'); p.hap = Math.min(100, p.hap + 1);
      const mo = new Date().getMonth(); if (mo == 9 && Math.random() < .5) lg('🎃 ' + t(['Halloween hangulat van.', 'It is Halloween season.']));
      if (p.age > 0 && p.age % 10 == 0) {
        const ev = p.logs.filter(l => l.n > n0 && l.t.length < 120).slice(-4).map(l => '• ' + l.t).join('\n');
        popup(`🎂 ${p.age} ${t(['éves vagy', 'years old'])}`, `${mood()} ${t(['Az év legfontosabb történései:', 'Highlights of the year:'])}\n${ev}`, [[t(['Tovább', 'Continue']), null]]);
      }
      render();
    } catch (e) { }
  };
  // ----- fotóalbum + életkártya -----
  const box = document.createElement('div'); box.id = 'alb'; box.className = 'ov'; box.hidden = true; box.style.zIndex = 51; box.innerHTML = '<div class="box" id="albb"></div>'; $('#app').append(box);
  function open() {
    if (!(typeof p !== "undefined" && p)) { alert(t(['Előbb kezdj egy életet.', 'Start a life first.'])); return; }
    const al = album();
    $('#albb').innerHTML = `<h2>📷 ${t(['Fotóalbum', 'Photo album'])}</h2>` + (al.length ? al.map(x => `<div class="card" style="margin:6px 0"><b>${x.e} ${x.t}</b><br><small>${x.a} ${t(['évesen', 'years old'])}</small></div>`).join('') : `<p>${t(['Még nincsenek emlékeid.', 'No memories yet.'])}</p>`)
      + `<div style="display:grid;gap:8px"><button id="albc">🖼 ${t(['Életkártya megosztása', 'Share life card'])}</button><button id="albx">${t(['Bezár', 'Close'])}</button></div>`;
    box.hidden = false; $('#albx').onclick = () => box.hidden = true; $('#albc').onclick = card;
  }
  function card() {
    const c = document.createElement('canvas'); c.width = 800; c.height = 500; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 800, 500); g.addColorStop(0, '#16232e'); g.addColorStop(1, '#1f8a83'); x.fillStyle = g; x.fillRect(0, 0, 800, 500);
    x.fillStyle = '#fff'; x.font = '700 44px sans-serif'; x.fillText(p.name, 40, 90); x.font = '28px sans-serif';
    const l = [`${mood()} ${p.age} ${t(['év', 'yr'])} · ${p.city[0]}`, `💰 ${fmt(netw())}`, `😊 ${Math.round(p.hap)}  ❤️ ${Math.round(p.hea)}  🧠 ${Math.round(p.sma)}  ✨ ${Math.round(p.loo)}`, `📷 ${album().length} ${t(['emlék', 'memories'])}`, p.sc ? `⭐ ${p.sc}` : ''];
    l.forEach((s, i) => x.fillText(s, 40, 170 + i * 56)); x.font = '700 30px sans-serif'; x.fillText('ReLife', 640, 460);
    c.toBlob(async b => {
      const f = new File([b], 'relife-card.png', { type: 'image/png' });
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) return await navigator.share({ files: [f], title: 'ReLife' }); } catch (e) { return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'relife-card.png'; a.click();
    });
  }
  window.RLAlbum = open;
})();
;

// ======================= extras5.js =======================
// ReLife extras5: rejtett jellem-hatások, pillangó-hatás, stressz/kiégés, világhírek
(function () {
  const t = x => T(x), R_ = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), cl_ = v => Math.max(0, Math.min(100, v));
  const NEWS = { 1995: ['Terjed az internet.', 'The internet spreads.'], 2000: ['Új évezred, mobiltelefonok mindenhol.', 'New millennium, mobile phones everywhere.'], 2008: ['Világgazdasági válság.', 'Global financial crisis.'], 2012: ['Okostelefon-korszak.', 'The smartphone era.'], 2020: ['Világjárvány, távmunka.', 'Pandemic, remote work.'], 2023: ['Mesterséges intelligencia berobban.', 'AI goes mainstream.'], 2030: ['Önvezető autók az utakon.', 'Self-driving cars on the roads.'] };
  const T0 = () => p.by || (p.by = R_(1985, 2005));
  const tr = () => p.tr || (p.tr = { grit: 10, emp: 10, cre: 10 });
  // jellem: negatív boldogság-hatás csökkentése kitartással
  const _apply = apply;
  apply = function (fx) { if (fx && p && p.tr && fx.hap < 0) { fx = Object.assign({}, fx); fx.hap = Math.round(fx.hap * (1 - p.tr.grit / 400)); } return _apply.call(this, fx); };
  const ECHO = [
    { q: ['Egy idegennek segítettél egyszer...', 'Once you helped a stranger...'], y: ['Évekkel később ő segít neked: kapsz egy kis pénzt.', 'Years later they repay you: you receive some money.'], fx: () => { p.money += 3e6; tr().emp = cl_(tr().emp + 5); } },
    { q: ['Kockázatot vállaltál egy ötlet miatt...', 'You took a risk on an idea...'], y: ['Az ötleted végre megtérült!', 'Your idea finally paid off!'], fx: () => { p.money += 6e6; p.hap = cl_(p.hap + 8); tr().cre = cl_(tr().cre + 5); } },
    { q: ['Elhanyagoltál egy régi barátot...', 'You neglected an old friend...'], y: ['Egy régi barát megkeres, és újra közel kerültök.', 'An old friend reaches out and you reconnect.'], fx: () => { p.hap = cl_(p.hap + 6); const r = p.rel.find(x => x.alive && x.role == 'Barát'); if (r) r.bond = cl_(r.bond + 15); } }
  ];
  const DEC = [
    { t: ['Egy idegen bajban van', 'A stranger is in trouble'], d: ['Segítesz neki, vagy továbbmész?', 'Help or walk on?'], o: [['Segítek', 0], ['Továbbmegyek', null]] },
    { t: ['Kockázatos ötlet', 'A risky idea'], d: ['Belevágsz egy merész tervbe?', 'Go for a bold plan?'], o: [['Belevágok', 1], ['Inkább nem', null]] },
    { t: ['Régi barát üzen', 'An old friend writes'], d: ['Válaszolsz neki?', 'Do you reply?'], o: [['Nem érek rá', 2], ['Válaszolok', null]] }
  ];
  function decide() {
    const d = DEC[R_(0, DEC.length - 1)];
    popup(t(d.t), t(d.d), d.o.map(([l, e]) => [t([l, l == 'Segítek' ? 'Help' : l == 'Továbbmegyek' ? 'Walk on' : l == 'Belevágok' ? 'Go for it' : l == 'Inkább nem' ? 'Pass' : l == 'Nem érek rá' ? 'No time' : 'Reply']), () => {
      if (e != null) { (p.echo = p.echo || []).push({ at: p.age + R_(3, 8), k: e }); tr().grit += e == 1 ? 3 : 0; tr().emp += e == 0 ? 4 : 0; lg('💭 ' + t(ECHO[e].q)); } else tr().emp = cl_(tr().emp + 1); render();
    }]));
  }
  const _up = up;
  up = function () {
    _up.apply(this, arguments);
    try {
      if (p.dead) return; const T_ = tr(), a = p.age;
      if (p.hap < 40) T_.grit = cl_(T_.grit + 2); if (Object.keys(p.hob || {}).length) T_.cre = cl_(T_.cre + 1);
      if (p.rel.filter(r => r.alive && r.bond > 60).length >= 3) T_.emp = cl_(T_.emp + 1);
      // stressz és kiégés
      p.stress = cl_((p.stress || 20) + (p.job ? 6 : -4) + (p.debt > 0 ? 5 : -2) + (p.hap < 40 ? 4 : -3) - Math.round(T_.grit / 25));
      if (p.stress > 85 && a > 18) { lg('🔥 ' + t(['Kiégés közeleg. Nem szégyen segítséget kérni.', 'Burnout is near. Asking for help is okay.']), 'bad'); p.hea = cl_(p.hea - 4);
        popup(t(['Túl sok a stressz', 'Too much stress']), t(['Egy kis pihenés és beszélgetés sokat segíthet.', 'Some rest and a talk can help a lot.']), [[t(['Segítséget kérek', 'Ask for help']), () => { p.stress = 40; p.hap = cl_(p.hap + 8); lg('🤝 ' + t(['Segítséget kértél, és megkönnyebbültél.', 'You asked for help and felt relief.']), 'good'); render(); }], [t(['Most nem', 'Not now']), null]]); }
      // pillangó-hatás
      (p.echo || []).filter(e => e.at <= a).forEach(e => { ECHO[e.k].fx(); lg('🦋 ' + t(ECHO[e.k].y), 'good'); });
      p.echo = (p.echo || []).filter(e => e.at > a);
      if (a > 8 && Math.random() < .08 && !p.dead && document.getElementById('modal').hidden) decide();
      const y = T0() + a, n = NEWS[y] || NEWS[Object.keys(NEWS).find(k => +k == y - 1)]; if (NEWS[y]) lg(`📰 ${y}: ${t(NEWS[y])}`);
      render();
    } catch (e) { }
  };
})();
;

// ======================= extras6.js =======================
// ReLife extras6: hangok, értesítések, napi jutalom, életszakasz-átvezetők, bűnözős gombok szűrése
(function () {
  const t = x => T(x), S = () => { try { return JSON.parse(localStorage.getItem('relife_set')) || {}; } catch (e) { return {}; } };
  let ac; const beep = (f, d = .07) => { try { if (!S().snd && S().snd !== undefined) return; ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d); } catch (e) { } };
  document.addEventListener('click', e => { const b = e.target.closest('button'); if (b) beep(b.id == 'up' ? 660 : 440); }, true);
  // értesítések: ha az app háttérben van, 30 perc múlva szólunk
  let tm; document.addEventListener('visibilitychange', () => {
    clearTimeout(tm); if (!document.hidden || !S().ntf) return;
    try { if (Notification.permission == 'default') Notification.requestPermission(); } catch (e) { }
    tm = setTimeout(() => { try { if (Notification.permission == 'granted') new Notification('ReLife', { body: t(['Új évet kezdhetsz!', 'A new year awaits!']) }); } catch (e) { } }, 18e5);
  });
  // napi jutalom
  setTimeout(() => {
    try {
      if (!(typeof p !== "undefined" && p) || p.dead || p.age < 3) return; const d = new Date().toDateString(), k = 'relife_daily';
      if (localStorage.getItem(k) == d) return; localStorage.setItem(k, d);
      const m = p.age >= 18 ? 5e5 : 0; p.money += m; p.hap = Math.min(100, p.hap + 3);
      popup('🎁 ' + t(['Napi jutalom', 'Daily reward']), t(['+3 boldogság', '+3 happiness']) + (m ? ' · ' + fmt(m) : ''), [[t(['Köszi!', 'Thanks!']), null]]);
    } catch (e) { }
  }, 1500);
  // életszakasz-átvezetők
  const ST = { 6: ['🎒', ['Iskolakezdés', 'First day of school'], ['Új padtársak, új kalandok várnak.', 'New classmates and adventures await.']], 14: ['📚', ['Gimnázium', 'High school'], ['Komolyodik az élet.', 'Life gets more serious.']], 18: ['🎓', ['Érettségi', 'Graduation'], ['Eldől, merre tovább.', 'Time to decide what is next.']], 30: ['🏡', ['Felnőttkor', 'Adulthood'], ['Beállt az életed rendje.', 'Your routine has settled.']], 65: ['🌅', ['Nyugdíjas évek', 'Retirement years'], ['Most már van időd magadra.', 'Now you have time for yourself.']] };
  const _up = up;
  up = function () {
    _up.apply(this, arguments);
    try { const s = ST[p.age]; if (s && !p.dead && document.getElementById('modal').hidden) popup(`${s[0]} ${t(s[1])}`, t(s[2]), [[t(['Tovább', 'Continue']), null]]); } catch (e) { }
  };
  // bűnözős gombok elrejtése, ha a szűrő be van kapcsolva
  const RX = /lop[áa]s|rabl|bűn|csal[áa]s|zsarol|steal|rob|crime|fraud|heist|smuggl|csempész/i;
  function hide() { if (!S().fPr) return; document.querySelectorAll('#sbody button, #sbody .card').forEach(b => { if (RX.test(b.textContent)) b.style.display = 'none'; }); }
  new MutationObserver(hide).observe(document.getElementById('sbody'), { childList: true, subtree: true });
})();
;

// ======================= extras7.js =======================
// ReLife extras7: éves jövedelem, többszöri álláskeresés, mellékállás, csatornairányok (niche), influenszer a vállalkozás mellé, alkotói események
(function () {
  const t = x => T(x), R_ = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const isBiz = () => !!(p.car && CAR_BY[p.car.id] && CAR_BY[p.car.id].biz);
  const crCareer = () => !!(p.car && CAR_BY[p.car.id] && CAR_BY[p.car.id].cr);

  // ---- éves jövedelem: több munkahely egy éven belül ----
  window.leaveJob = function () {
    if (!p.job) return;
    p.earn = (p.earn || 0) + Math.round(p.pay * .4); p.earnMax = Math.max(p.earnMax || 0, p.pay);
  };
  window.yearIncome = function () {
    const e = p.earn || 0;
    const base = e ? Math.min(e + (p.job ? Math.round(p.pay * .5) : 0), (p.earnMax || p.pay || 0) * 1.1) : (p.job ? p.pay : (p.pension || 0));
    return Math.round(base + (p.side ? p.side.pay : 0));
  };

  // ---- csatornairányok ----
  const NICHES = {
    vid: [
      { id: 'game', i: '🎮', n: ['Gaming', 'Gaming'], gm: 1.15, im: .9, aff: { tw: 1.25, yt: 1.05 } },
      { id: 'vlog', i: '📷', n: ['Vlog', 'Vlog'], gm: 1.1, im: 1, aff: { yt: 1.1, tt: 1.05 } },
      { id: 'edu', i: '📚', n: ['Oktató / ismeretterjesztő', 'Educational'], gm: .85, im: 1.35, aff: { yt: 1.2 } },
      { id: 'comedy', i: '😂', n: ['Humor', 'Comedy'], gm: 1.25, im: .85, aff: { tt: 1.25 } },
      { id: 'cook', i: '🍳', n: ['Főzés', 'Cooking'], gm: 1, im: 1.1, aff: { tt: 1.1, yt: 1.05 } },
      { id: 'music', i: '🎵', n: ['Zene', 'Music'], gm: .95, im: 1.15, aff: { yt: 1.1 } },
      { id: 'tech', i: '💻', n: ['Tech tesztek', 'Tech reviews'], gm: .9, im: 1.3, aff: { yt: 1.15 } }
    ],
    inf: [
      { id: 'fashion', i: '👗', n: ['Divat', 'Fashion'], gm: 1.15, im: 1, aff: { ig: 1.2, tt: 1.1 } },
      { id: 'fit', i: '💪', n: ['Fitnesz', 'Fitness'], gm: 1.1, im: 1.05, aff: { ig: 1.15, tt: 1.1 } },
      { id: 'travel', i: '✈️', n: ['Utazás', 'Travel'], gm: 1.05, im: 1.15, aff: { ig: 1.2, fb: 1.05 } },
      { id: 'beauty', i: '💄', n: ['Szépség', 'Beauty'], gm: 1.15, im: 1.1, aff: { ig: 1.2 } },
      { id: 'food', i: '🍽️', n: ['Gasztro', 'Food'], gm: 1.05, im: 1.05, aff: { ig: 1.1, fb: 1.1 } },
      { id: 'life', i: '🏡', n: ['Életmód', 'Lifestyle'], gm: 1, im: 1.1, aff: { fb: 1.15, tx: 1.05 } },
      { id: 'opinion', i: '🗣️', n: ['Vélemény / közélet', 'Commentary'], gm: 1.1, im: .95, aff: { tx: 1.3 } }
    ]
  };
  const NALL = NICHES.vid.concat(NICHES.inf);
  const nf = a => a && a.niche ? NALL.find(x => x.id == a.niche) : null;
  window.nicheGm = (a, k) => { const n = nf(a); return n ? n.gm * (n.aff[k] || 1) : 1; };
  window.nicheIm = (a, k) => { const n = nf(a); return n ? n.im * (1 + ((n.aff[k] || 1) - 1) / 2) : 1; };
  window.nicheIcon = a => { const n = nf(a); return n ? n.i : ''; };
  window.nicheLabel = a => { const n = nf(a); return n ? ' · ' + n.i + ' ' + t(n.n) : ''; };
  const nnote = (x, k) => t(['növekedés', 'growth']) + ' ×' + (x.gm * (x.aff[k] || 1)).toFixed(2) + ' · ' + t(['bevétel', 'income']) + ' ×' + (x.im * (1 + ((x.aff[k] || 1) - 1) / 2)).toFixed(2);
  window.nicheStep = function (mode, cid, k) {
    const L = NICHES[cid == 'vid' ? 'vid' : 'inf'];
    const fn = id => mode == 'start' ? `startCr('${cid}','${k}','${id}')` : mode == 'open' ? `crOpen('${k}','${id}')` : `startInf('${k}','${id}')`;
    return `<h3>${PLAT[k].i} ${PLAT[k].n}: ${t(['milyen irányú csatornát viszel?', 'what direction will your channel take?'])}</h3><div class="grid">`
      + L.map(x => abtn({ i: x.i, n: t(x.n), note: nnote(x, k), fn: fn(x.id) })).join('') + `</div><div class="btns"><button class="alt" onclick="crPend=null;render()">${t(['‹ Platform módosítása', '‹ Change platform'])}</button></div>`;
  };

  // ---- influenszer a vállalkozás mellé ----
  window.crPickI = k => { crPend = { mode: 'inf', k }; render(); };
  window.startInf = function (k, n) {
    if (!isBiz() || p.inf || p.age < 14 || !CAR_BY.inf.pl.includes(k)) return;
    crNicheSel = n || null; p.inf = { id: 'inf', rank: 0, perf: 35, yrs: 0, acc: { [k]: newAcc() }, sel: k }; crNicheSel = null; crPend = null;
    fxlog('📱 ' + t(['Influenszerkedni kezdtél a céged mellett: ingyen reklám a vállalkozásodnak!', 'You started influencing next to your business: free advertising for your company!']), { hap: 6 }); render();
  };
  window.quitInf = function () { if (!p.inf || !confirm(t(['Biztosan abbahagyod az influenszerkedést?', 'Really stop influencing?']))) return; p.inf = null; lg('📱 ' + t(['Abbahagytad az influenszerkedést.', 'You stopped influencing.'])); render(); };
  window.quitCr = () => crCareer() ? quitCar() : quitInf();
  const SYN = { cafe: ['cook', 'food'], shop: ['fashion', 'beauty', 'life'], startup: ['tech', 'edu'] };
  window.infBoost = function () {
    if (!p.inf || !isBiz()) return 1;
    const tot = crTot(p.inf), syn = Object.values(p.inf.acc).some(a => (SYN[p.car.id] || []).includes(a.niche));
    return 1 + Math.min(.6, Math.log10(tot + 1) * .08) + (syn ? .08 : 0);
  };
  window.infPromo = function () {
    if (!p.inf || !isBiz() || p.done.infPromo) return; p.done.infPromo = 1;
    const g = Math.round(R_(4, 9) * (1 + crTier(crTot(p.inf)) * .3));
    p.car.perf = cl(p.car.perf + g); fxlog('📣 ' + t(['Reklámoztad a cégedet a csatornádon.', 'You advertised your company on your channel.']), { hap: 2 }); render();
  };
  function infPanel() {
    if (p.age < 14) return '';
    if (p.inf) {
      const boost = isBiz() ? `<div class="card"><div class="top"><b>📣 ${t(['Ingyen reklám a cégednek', 'Free ads for your company'])}</b><small>+${Math.round((infBoost() - 1) * 100)}% ${t(['cégbevétel', 'company income'])}</small></div><div class="btns"><button ${p.done.infPromo ? 'disabled' : ''} onclick="infPromo()">${t(['Cég reklámozása', 'Promote the company'])}</button></div></div>` : '';
      return `<h3>📱 ${t(['Influenszer-oldalág', 'Influencer side channel'])}</h3>` + boost + crPanel();
    }
    if (!isBiz()) return '';
    const intro = `<div class="card"><div class="top"><b>📱 ${t(['Influenszerkedés a cég mellett', 'Influencing next to your business'])}</b></div><small>${t(['Építs közönséget: az influenszer-csatornád ingyen reklám a vállalkozásodnak, és növeli a bevételét.', 'Build an audience: your channel is free advertising for your business and boosts its income.'])}</small></div>`;
    if (crPend && crPend.mode == 'inf') return `<h3>📱 ${t(['Influenszerkedés', 'Influencing'])}</h3>` + intro + nicheStep('inf', 'inf', crPend.k);
    return `<h3>📱 ${t(['Influenszerkedés', 'Influencing'])}</h3>` + intro + `<div class="grid">` + CAR_BY.inf.pl.map(k => abtn({ i: PLAT[k].i, n: PLAT[k].n, note: PLAT[k].d, fn: `crPickI('${k}')` })).join('') + '</div>';
  }

  // ---- mellékállás (különleges karrier mellett) ----
  window.applySide = function (n) {
    const j = JOBS.find(q => q.n == n); if (!j || !p.car || p.side || p.age < 16 || (p.done.sideN || 0) >= 2) return;
    if (p.edu < j.e || p.loo < (j.l || 0) || (j.c && p.crim) || (j.lic && !p.lic)) return;
    p.done.sideN = (p.done.sideN || 0) + 1;
    if (Math.random() < Math.min(.95, Math.max(.2, .65 + (p.sma - j.s) / 100))) { p.side = { n: j.n, pay: Math.round(j.pay * .4 / 1e3) * 1e3 }; fxlog('🧰 ' + t(['Mellékállást vállaltál: ', 'You took a side job: ']) + j.n + '.', { hap: 3 }); }
    else lg('🧰 ' + t(['Nem vettek fel mellékállásba: ', 'You were not hired for the side job: ']) + j.n + '.', 'bad');
    render();
  };
  window.quitSide = function () { if (!p.side) return; lg('🧰 ' + t(['Felmondtál a mellékállásban: ', 'You quit your side job: ']) + p.side.n + '.'); p.side = null; render(); };
  function sidePanel() {
    if (!p.car || p.age < 16) return '';
    let h = `<h3>🧰 ${t(['Mellékállás', 'Side job'])}</h3>`;
    if (p.side) return h + row(p.side.n, fmt(p.side.pay) + t([' / év', ' / year']), `<small>${t(['Mellékállásban dolgozol a karriered mellett, a fizetése a teljes munkaidős bér 40%-a.', 'You work a side job next to your career; it pays 40% of the full-time wage.'])}</small><div class="btns"><button class="alt" onclick="quitSide()">${t(['Felmondok', 'Quit'])}</button></div>`);
    const L = JOBS.filter(j => p.edu >= j.e && p.loo >= (j.l || 0) && !(j.c && p.crim) && (!j.lic || p.lic));
    if (!L.length) return h + `<p class="empty">${t(['Nincs elérhető mellékállás.', 'No side job available.'])}</p>`;
    return h + `<small>${t(['Mellé kisebb munkát is vállalhatsz. Évente legfeljebb kétszer próbálkozhatsz.', 'You can take a smaller job alongside. You may try at most twice a year.'])}</small><div class="grid">`
      + L.slice(0, 14).map(j => abtn({ i: '🧰', n: j.n, note: fmt(Math.round(j.pay * .4 / 1e3) * 1e3) + t([' / év', ' / year']), off: (p.done.sideN || 0) >= 2, fn: `applySide('${j.n.replace(/'/g, "\\'")}')` })).join('') + '</div>';
  }

  // ---- menü a Munka fülön ----
  window.sideMenu = function () {
    let h = '';
    if (p.car && p.age >= 16) h += mcard('🧰', t(['Mellékállás', 'Side job']), p.side ? p.side.n + ' · ' + fmt(p.side.pay) + t([' / év', ' / year']) : t(['Kisebb munka a karrier mellé', 'A smaller job next to your career']), "go('side')");
    if (!crCareer() && p.age >= 14 && (isBiz() || p.inf)) h += mcard('📱', t(['Influenszerkedés', 'Influencing']), p.inf ? t(['Csatorna: ', 'Channel: ']) + cNum(crTot(p.inf)) + ' ' + t(['követő', 'followers']) : t(['Ingyen reklám a cégednek', 'Free ads for your company']), "go('inf')");
    return h;
  };
  const _panel = panel;
  panel = function (tb) {
    try {
      if (tb == 'job' && sub == 'side') return bk() + sidePanel();
      if (tb == 'job' && sub == 'inf') return bk() + infPanel();
    } catch (e) { console.error(e); }
    return _panel.apply(this, arguments);
  };

  // ---- évváltás ----
  let asked = false; const _ask = ask; ask = function () { asked = true; return _ask.apply(this, arguments); };
  const _up = up;
  up = function () {
    asked = false; _up.apply(this, arguments);
    try {
      if (p.dead) return;
      p.earn = 0; p.earnMax = 0;
      if (p.side) { if (p.age >= 65 || Math.random() < .04) { lg('🧰 ' + t(['Elvesztetted a mellékállásodat: ', 'You lost your side job: ']) + p.side.n + '.', 'bad'); p.side = null; } else apply({ hap: -1 }); }
      if (p.inf) {
        p.inf.yrs = (p.inf.yrs || 0) + 1; crYear(p.inf, CAR_BY.inf);
        if (isBiz()) { p.car.perf = cl(p.car.perf + R_(1, 3) + crTier(crTot(p.inf))); lg('📣 ' + t(['Az influenszer-csatornád ingyen reklámot csinált a cégednek.', 'Your influencer channel gave your company free advertising.'])); }
      }
      if (!asked && crO() && Math.random() < .4) { const L = CREV.filter(e => p.age >= e.a[0] && p.age <= e.a[1] && (!e.u || e.u())); if (L.length) { const e = L[Math.floor(Math.random() * L.length)]; pend = null; ask(e); } }
      render();
    } catch (e) { console.error(e); }
  };

  // ---- egyedi alkotói események ----
  const hasN = id => { const c = crO(); return !!c && Object.values(c.acc || {}).some(a => a.niche == id); };
  const hasP = id => { const c = crO(); return !!c && !!(c.acc || {})[id]; };
  const O = (l, outs, req) => req ? [l, outs, req] : [l, outs];
  const CREV = [
    { a: [12, 80], u: () => !!crO(), t: ['Kommentháború', 'Comment war'], d: ['Egy ismeretlen fiók durván kritizál a csatornád alatt, és egyre többen csatlakoznak.', 'An anonymous account slams you under your channel, and more and more people join in.'], o: [
      O(['Visszaszólok keményen', 'Fire back hard'], [[2, ['Az éles válaszod bejárta a netet, és sokan melléd álltak.', 'Your sharp reply spread around, and many backed you.'], { fol: 12, hap: 3 }], [2, ['Az éles válasz visszaütött, sokan elfordultak.', 'The sharp reply backfired, and many turned away.'], { fol: -8, hap: -5 }]]),
      O(['Nem foglalkozom vele', 'Ignore it'], [[1, ['Elült a vihar, nem lett belőle ügy.', 'The storm blew over and nothing came of it.'], { hap: 1 }]]),
      O(['Moderálom a kommenteket', 'Moderate the comments'], [[1, ['Rendet tettél, a közösséged megkönnyebbült.', 'You cleaned up, and your community was relieved.'], { fol: -2, hap: 3 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Márkaajánlat', 'Brand offer'], d: ['Egy nagy márka sok pénzt ajánl egy olyan termék reklámozásáért, amiben nem hiszel.', 'A big brand offers a lot of money to promote a product you do not believe in.'], o: [
      O(['Elfogadom a pénzt', 'Take the money'], [[2, ['A pénz megjött, a közönség észre sem vette.', 'The money arrived and your audience did not even notice.'], { money: 6e5, hap: 2 }], [2, ['A közönség átlátott rajta, és hitelességet vesztettél.', 'Your audience saw through it and you lost credibility.'], { money: 6e5, fol: -10, hap: -4 }]]),
      O(['Visszautasítom', 'Turn it down'], [[1, ['Megőrizted a hitelességed, a követők értékelték.', 'You kept your credibility, and followers appreciated it.'], { fol: 4, hap: 3 }]]),
      O(['Alkudozom a feltételekről', 'Negotiate the terms'], [[1, ['Jobb feltételekkel, a saját stílusodban csinálhattad meg.', 'You got better terms and did it in your own style.'], { money: 3e5, fol: 2, hap: 3 }], [1, ['A márka kiszállt a tárgyalásból.', 'The brand walked away from the talks.'], { hap: -2 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Kiégés', 'Burnout'], d: ['Hónapok óta megállás nélkül gyártod a tartalmat, és kezdesz kimerülni.', 'You have been pumping out content nonstop for months, and you are running out of steam.'], o: [
      O(['Kiveszek egy kis szünetet', 'Take a short break'], [[1, ['Kipihented magad, bár a követők egy része elmaradt.', 'You rested up, though some followers drifted away.'], { hap: 8, fol: -8 }]]),
      O(['Hajtok tovább', 'Push through'], [[2, ['Kitartottál, és meglett az eredménye.', 'You persevered and it paid off.'], { fol: 10, hap: -4, hea: -3 }], [2, ['Összeroppantál, az egészséged megsínylette.', 'You broke down, and your health suffered.'], { hap: -8, hea: -8 }]]),
      O(['Felveszek egy vágót (200 e Ft)', 'Hire an editor (200k HUF)'], [[1, ['A vágó leveszi a terhet a válladról.', 'The editor takes the load off your shoulders.'], { money: -2e5, hap: 4, fol: 3 }]], 2e5)] },
    { a: [14, 80], u: () => !!crO(), t: ['Közös videó felkérés', 'Collab invitation'], d: ['Egy nálad sokkal nagyobb alkotó közös tartalmat javasol.', 'A creator far bigger than you proposes a joint piece of content.'], o: [
      O(['Benne vagyok!', 'I am in!'], [[2, ['A közös tartalom óriásit ment, sok új követőd lett.', 'The joint content blew up and brought many new followers.'], { fol: 25, hap: 6 }], [1, ['Kínos lett a közös munka, alig hozott valamit.', 'The collab turned out awkward and brought little.'], { fol: 2, hap: -2 }]]),
      O(['Inkább nem', 'Rather not'], [[1, ['Megmaradtál a saját utadon.', 'You stayed on your own path.'], { hap: 1 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Plágiumvád', 'Plagiarism claim'], d: ['Valaki azt állítja, hogy az egyik tartalmadat tőle másoltad.', 'Someone claims you copied one of your pieces from them.'], o: [
      O(['Bocsánatot kérek', 'Apologize'], [[1, ['A bocsánatkérést elfogadták, de maradt némi folt.', 'The apology was accepted, but a stain remained.'], { fol: -4, hap: -2 }]]),
      O(['Tagadom és bizonyítok', 'Deny and prove it'], [[2, ['Bizonyítottad, hogy az ötlet a tied, és a vád visszaütött rájuk.', 'You proved the idea was yours and the claim backfired on them.'], { fol: 8, hap: 4 }], [2, ['Nem tudtál meggyőzni mindenkit, sokan kételkednek.', 'You could not convince everyone, and many doubt you.'], { fol: -12, hap: -5 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Rajongói találkozó', 'Fan meet-up'], d: ['A követőid találkozót szerveznének veled.', 'Your followers would like to organize a meet-up with you.'], o: [
      O(['Megszervezem (150 e Ft)', 'Organize it (150k HUF)'], [[3, ['Remek hangulat, a rajongók imádtak!', 'A great mood, and the fans loved it!'], { money: -1.5e5, fol: 12, hap: 8 }], [1, ['Kevesen jöttek el, kicsit csalódott vagy.', 'Few showed up, and you are a bit disappointed.'], { money: -1.5e5, hap: -3 }]], 1.5e5),
      O(['Most nem érek rá', 'No time right now'], [[1, ['Elhalasztottad, a követők megértették.', 'You postponed it and the followers understood.'], {}]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Algoritmusváltás', 'Algorithm change'], d: ['Az egyik platform megváltoztatta az ajánlórendszerét, és visszaesett az elérésed.', 'One of the platforms changed its recommendation system and your reach dropped.'], o: [
      O(['Alkalmazkodom', 'Adapt'], [[3, ['Megtaláltad az új működést, és újra nőni kezdtél.', 'You figured out the new system and started growing again.'], { fol: 10, hap: -1 }], [1, ['Hiába próbálkoztál, nem jött be.', 'Your efforts did not pay off.'], { hap: -3 }]]),
      O(['Kivárom', 'Wait it out'], [[1, ['Idővel helyreállt az elérésed, de sokat vesztettél.', 'Your reach recovered over time, but you lost a lot.'], { fol: -6 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Gyűlöletkommentek', 'Hate comments'], d: ['Egy szervezett támadás miatt sok gyűlöletkomment érkezett, és ez megvisel.', 'A coordinated attack brought many hate comments, and it is wearing you down.'], o: [
      O(['Pszichológushoz fordulok (100 e Ft)', 'See a psychologist (100k HUF)'], [[1, ['A beszélgetések sokat segítettek.', 'The sessions helped a lot.'], { money: -1e5, hap: 7 }]], 1e5),
      O(['Elbírom egyedül', 'I will cope alone'], [[1, ['Átvészelted, de megviselt.', 'You got through it, but it took a toll.'], { hap: -5 }]])] },
    { a: [14, 80], u: () => hasN('game'), t: ['Játékfejlesztő meghívó', 'Game developer invite'], d: ['Egy stúdió korai hozzáférést ad a következő játékukhoz, ha bemutatod a csatornádon.', 'A studio offers early access to their next game if you showcase it on your channel.'], o: [
      O(['Elfogadom', 'Accept'], [[2, ['Elsőként mutattad be, és sokan téged néztek.', 'You were first to show it, and many watched you.'], { fol: 14, money: 2e5, hap: 5 }], [1, ['A játék gyenge lett, a közönség csalódott.', 'The game was weak and the audience was disappointed.'], { fol: -3, money: 2e5 }]]),
      O(['Nem érdekel', 'Not interested'], [[1, ['Kihagytad a lehetőséget.', 'You passed on the opportunity.'], {}]])] },
    { a: [14, 80], u: () => hasN('cook'), t: ['Étterem meghívás', 'Restaurant invitation'], d: ['Egy étterem ingyen vendégül lát, ha bemutatod a konyhájukat.', 'A restaurant hosts you for free if you feature their kitchen.'], o: [
      O(['Elmegyek forgatni', 'Go and film'], [[2, ['Finom ételek, remek tartalom!', 'Delicious food and great content!'], { fol: 12, hap: 5 }], [1, ['Az étel gyenge volt, kínos volt dicsérni.', 'The food was poor, and praising it felt awkward.'], { fol: -3, hap: -2 }]]),
      O(['Inkább otthon főzök', 'I will cook at home'], [[1, ['Maradtál a saját receptjeidnél.', 'You stuck to your own recipes.'], { hap: 2 }]])] },
    { a: [14, 80], u: () => hasN('edu') || hasN('tech'), t: ['Iskolák felkérése', 'Schools invite you'], d: ['Iskolák hívnak előadni a tudásodról.', 'Schools invite you to give talks about what you know.'], o: [
      O(['Vállalom', 'I will do it'], [[1, ['Szép bevétel és hálás diákok.', 'Nice income and grateful students.'], { money: 3e5, hap: 5, fol: 4 }]]),
      O(['Nincs rá időm', 'I have no time'], [[1, ['Elengedted az alkalmat.', 'You let the chance go.'], {}]])] },
    { a: [14, 80], u: () => hasN('fashion') || hasN('beauty'), t: ['Divatbemutató meghívó', 'Fashion show invite'], d: ['Meghívnak egy híres divatbemutatóra.', 'You are invited to a famous fashion show.'], o: [
      O(['Elmegyek (80 e Ft)', 'Go (80k HUF)'], [[2, ['Rengeteg új kapcsolat és követő!', 'Lots of new contacts and followers!'], { money: -8e4, fol: 20, hap: 6 }], [1, ['Nem figyeltek fel rád, drága este volt.', 'Nobody noticed you, and it was an expensive night.'], { money: -8e4, hap: -3 }]], 8e4),
      O(['Kihagyom', 'Skip it'], [[1, ['Otthon maradtál.', 'You stayed home.'], {}]])] },
    { a: [14, 80], u: () => hasN('fit'), t: ['Sérülés forgatás közben', 'Injury while filming'], d: ['Egy edzésvideó közben megsérültél.', 'You got hurt while filming a workout video.'], o: [
      O(['Pihenek, kezeltetem', 'Rest and get treated'], [[1, ['Rendbe jöttél, és őszintén beszéltél róla a közönségnek.', 'You recovered and talked honestly about it with your audience.'], { hea: -2, hap: 1, fol: 5 }]]),
      O(['Folytatom a forgatást', 'Keep filming'], [[1, ['A sérülés súlyosabb lett.', 'The injury got worse.'], { hea: -9, hap: -4, fol: 6 }]])] },
    { a: [14, 80], u: () => hasN('travel'), t: ['Utazási szponzor', 'Travel sponsor'], d: ['Egy utazási iroda fizetett útra hív, ha bemutatod az úticélt.', 'A travel agency invites you on a paid trip if you present the destination.'], o: [
      O(['Indulok!', 'Count me in!'], [[1, ['Csodás utazás és nagyszerű tartalom.', 'A wonderful trip and great content.'], { fol: 15, hap: 8, money: 1e5 }]]),
      O(['Inkább nem', 'Rather not'], [[1, ['Nem mentél.', 'You did not go.'], {}]])] },
    { a: [14, 80], u: () => hasN('music'), t: ['Szerzői jogi bejelentés', 'Copyright claim'], d: ['Egy videódat szerzői jogi panasz miatt letiltották.', 'One of your videos was blocked over a copyright complaint.'], o: [
      O(['Törlöm a videót', 'Delete the video'], [[1, ['Elült az ügy, de elveszett egy jó videó.', 'The matter ended, but a good video was lost.'], { fol: -3, hap: -2 }]]),
      O(['Vitatom a döntést', 'Dispute it'], [[1, ['Igazad lett, a videó újra elérhető.', 'You were right, and the video is back.'], { fol: 6, hap: 3 }], [1, ['Elvesztetted a vitát.', 'You lost the dispute.'], { fol: -6, hap: -4 }]])] },
    { a: [16, 80], u: () => !!crO() && !!p.side, t: ['Munkatársak felismernek', 'Coworkers recognize you'], d: ['A mellékállásodban a kollégák rájöttek, hogy te vagy az a népszerű alkotó.', 'At your side job your coworkers figured out you are that popular creator.'], o: [
      O(['Büszkén vállalom', 'Own it proudly'], [[1, ['A kollégák szurkolnak neked, és megosztják a tartalmaid.', 'Your coworkers cheer you on and share your content.'], { fol: 8, hap: 5 }]]),
      O(['Letagadom', 'Deny it'], [[1, ['Lebuktál, és ez kínos volt.', 'You got caught and it was awkward.'], { hap: -3 }]])] },
    { a: [14, 80], u: () => !!p.inf && isBiz(), t: ['A követőid a cégedre kíváncsiak', 'Followers curious about your company'], d: ['A követőid sokat kérdeznek a vállalkozásodról, és vásárolnának tőled.', 'Your followers keep asking about your business and would love to buy from you.'], o: [
      O(['Nagy kampányt indítok (200 e Ft)', 'Launch a big campaign (200k HUF)'], [[3, ['A kampány betalált, megugrott a forgalom!', 'The campaign hit, and sales jumped!'], { money: -2e5, perf: 12, hap: 5 }], [1, ['A kampány nem hozott sokat.', 'The campaign did not bring much.'], { money: -2e5, perf: 3 }]], 2e5),
      O(['Marad a külön tartalom', 'Keep content separate'], [[1, ['A csatorna megőrizte a hitelességét.', 'Your channel kept its authenticity.'], { fol: 3, perf: 2 }]])] }
  ];
  window.CREV = CREV;
})();
;

// ======================= extras8.js =======================
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
  // általános lépésfuttató: st = {i, n, c, risk, who, rel, exec}
  window.runSteps = async function (L, title) {
    if (running || !L.length) return; running = true; mkWho.boss = mkWho.col = null;
    const _r = render; render = () => { }; let done = 0, skipped = 0; const b00 = snap();
    try {
      for (let n = 0; n < L.length; n++) {
        const st = L[n]; let w, chat;
        if (st.rel != null && p.rel[st.rel]) { const r = p.rel[st.rel]; w = { look: lk(r), age: r.age, name: dn(r.n) }; chat = [['th', P(['Szia! Örülök, hogy keresel.', 'Régen beszéltünk, mizu?', 'Jó, hogy felhívtál!'])], ['me', P(['Ráérsz egy kicsit beszélgetni?', 'Gondoltam, megkérdezem, hogy vagy.'])]]; }
        else if (st.who) { w = whoLook(st.who); chat = CHAT[st.id] || [['col', 'Van egy új feladat, belevágsz?'], ['me', 'Mehet!']]; }
        else { w = { look: null, emoji: st.i, name: '' }; chat = [['sys', `${st.i} ${st.n}`]]; }
        scene(`<div class="awh"><span>${n + 1}/${L.length}</span><b>${st.i} ${st.n}</b></div><div class="awp">${w.look ? portrait(w.look, w.age) : portrait(null, 0, w.emoji)}<div class="awn">${w.name}</div></div><div class="awc" id="awc"></div><div class="awf" id="awf"></div><div class="awbt" id="awb"></div>`);
        const C = $$('#awc');
        for (const [who, tx] of chat) { const d = document.createElement('div'); d.className = 'bub ' + (who == 'me' ? 'me' : who == 'sys' ? 'sys' : 'th'); C.append(d); await typeInto(d, tx, 16); await sleep(250); }
        if (st.risk) {
          const q = document.createElement('div'); q.className = 'bub sys'; q.textContent = '⚠️ ' + (st.c ? `Ára: ${fmt(st.c)}.` : 'Kockázatos lehet, nem biztos a kimenet.'); C.append(q);
          const nom = st.c && !can(st.c);
          const ch = await choose(st, [[nom ? 'Nincs rá pénzed' : `✅ Csinálom${st.c ? ' (' + fmt(st.c) + ')' : ''}`, 1, nom ? 'dis' : ''], ['⏭️ Kihagyom', 0, 'alt'], ['⛔ Leállítom az automatát', -1, 'alt']]);
          if (ch == -1) break; if (ch == 0 || nom) { skipped++; continue; }
        } else await sleep(500);
        const b0 = snap(), nl = p.logs.length;
        try { st.exec(); } catch (e) { }
        const a0 = snap(), lg0 = p.logs.slice(nl).map(l => l.t).join(' '), good = (a0.hap - b0.hap) + (a0.jp - b0.jp) / 5 + (a0.money - b0.money) / 1e5 >= 0;
        const r = document.createElement('div'); r.className = 'bub sys ' + (good ? 'ok' : 'ko'); C.append(r); await typeInto(r, (good ? '✔ ' : '✖ ') + (lg0 || 'Megtörtént.'), 12);
        $$('#awf').innerHTML = fxChips(b0, a0); burst(good); done++;
        await sleep(st.risk ? 900 : 700);
        if (st.risk) await choose(st, [['Tovább ▶', 1]]);
      }
    } finally { render = _r; }
    const a = snap(), s = scene(`<h2>${title}</h2><p>${done} tevékenység elvégezve${skipped ? ', ' + skipped + ' kihagyva' : ''}.</p><div class="awf big">${fxChips(b00, a)}</div><div class="awbt" id="awb"></div>`);
    burst(true); lg(`${title}: ${done} tevékenység elvégezve.`, 'good'); await choose(0, [['Rendben', 1]]); s.hidden = true; running = false; render();
  };
  window.autoWork = () => runSteps(steps().map(s => ({ ...s, exec: () => s.kind == 'job' ? doJobAct(s.id) : doCarAct(s.id) })), '🤖 Automata munka kész');

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
;

// ======================= extras9.js =======================
// ===== extras9: Stílusstúdió (fodrász + ruhabolt), hangulatjelző kivéve =====
(function () {
  const q = s => document.querySelector(s), T_ = x => (typeof T == 'function' ? T(x) : x[0]);
  // hangulat-jelvény az avatarról: végleg le
  const _rr = render;
  render = function () { _rr.apply(this, arguments); document.querySelectorAll('#av .mood').forEach(e => e.remove()); };

  const PR = { hs: 6e4, hc: 4e4, ot: 9e4, oc: 4e4, ht: 3e4, ea: 3e4, gl: 4e4, nc: 3e4, xc: 2e4 };
  const TABS = {
    hair: [['hs', '✂️ Frizura', HSN, 'hair'], ['hc', '🎨 Hajszín', HC, 0]],
    clothes: [['ot', '👕 Ruha', OTN, 'body'], ['oc', '🎨 Ruhaszín', OC, 0], ['ht', '🧢 Fejfedő', HTN, 'hair'], ['gl', '👓 Szemüveg', GLN, 'hair'], ['ea', '🎧 Fül', EAN, 'hair'], ['nc', '🧣 Nyak', NCN, 'neck'], ['xc', '🎨 Kiegészítő színe', XC, 0]]
  };
  let mode = 'hair', cur = 0, d = null, base = null;
  const price = () => p.age < 18 ? 0 : TABS[mode].reduce((s, t) => s + (String(d[t[0]]) != String(base[t[0]]) ? PR[t[0]] : 0), 0);
  const nchg = () => TABS[mode].filter(t => String(d[t[0]]) != String(base[t[0]])).length;

  function draw() {
    const box = q('#stu .box'), tabs = TABS[mode], t = tabs[cur], k = t[0], cost = price(), ok = can(cost);
    const chips = (t[2] === HC || t[2] === OC || t[2] === XC)
      ? [...t[2].keys()].map(i => `<button class="chip${+d[k] == i ? ' on' : ''}" data-k="${k}" data-v="${i}"><i class="sw" style="background:${t[2][i]}"></i></button>`).join('')
      : [...t[2].keys()].map(i => {
        const lk2 = { ...d, [k]: i };
        return `<button class="chip pv${+d[k] == i ? ' on' : ''}" data-k="${k}" data-v="${i}" title="${T_(t[2][i])}">${avSvg(lk2, p.age, false, VB[t[3]])}</button>`;
      }).join('');
    box.innerHTML = `<h2>${mode == 'hair' ? '💇 Fodrászszalon' : '👗 Ruhabolt'}</h2>
      <div class="stp">${avSvg(d, p.age)}</div>
      <div class="stt">${tabs.map((x, i) => `<button class="${i == cur ? 'on' : ''}" data-t="${i}">${x[1]}</button>`).join('')}</div>
      <div class="chips stc">${chips}</div>
      <div class="stb"><button id="stbuy" ${nchg() && ok ? '' : 'disabled'}>${!nchg() ? 'Válassz valamit' : ok ? `Megveszem · ${cost ? fmt(cost) : 'ingyen (szülők fizetik)'}` : 'Nincs elég pénzed (' + fmt(cost) + ')'}</button><button id="stx" class="alt">Mégse</button></div>`;
    box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { cur = +b.dataset.t; draw(); });
    box.querySelectorAll('.chip').forEach(b => b.onclick = () => { d[b.dataset.k] = +b.dataset.v; draw(); });
    q('#stx').onclick = close;
    q('#stbuy').onclick = () => {
      const c = price(), n = nchg(); if (!n || !can(c)) return;
      p.money -= c; p.look = { ...p.look, ...d }; close();
      fxlog(`${mode == 'hair' ? '💇 Új hajad lett' : '🛍️ Új szettet vettél'}${c ? ' (' + fmt(c) + ')' : ''}. Ez jól esik!`, { loo: R(2, 5) + n, hap: R(2, 4) }); render();
    };
  }
  function close() { const s = q('#stu'); if (s) s.hidden = true; }
  window.openStudio = function (m) {
    mode = m; cur = 0; base = p.look || (p.look = mkLook(p.g, p.skin || 3)); d = { ...base };
    TABS[mode].forEach(t => { if (d[t[0]] == null) d[t[0]] = 0; });
    let s = q('#stu'); if (!s) { s = document.createElement('div'); s.id = 'stu'; s.className = 'ov'; s.innerHTML = '<div class="box"></div>'; q('#app').append(s); }
    s.hidden = false; draw();
  };
  const _da = window.doAct;
  window.doAct = function (id) { if (id == 'hair' || id == 'clothes') return openStudio(id == 'hair' ? 'hair' : 'clothes'); return _da.apply(this, arguments); };
  [['hair', 'Fodrász (frizura, hajszín)'], ['clothes', 'Ruhabolt (ruhák, kiegészítők)']].forEach(([id, n]) => { const x = ACT.find(a => a.id == id); if (x) { x.c = 0; x.n = n; } });
})();
;

// ======================= extras10.js =======================
// ReLife extras7: főoldali intro-számláló, évenkénti automata mentés (3 forgó hely), jellem-hatások (empátia, kreativitás)
(function () {
  const tg = document.getElementById('tage'), ti = document.getElementById('title');
  if (tg && ti) {
    const t0 = performance.now() + 800;
    (function f(now) {
      const k = Math.min(1, Math.max(0, (now - t0) / 1600));
      tg.textContent = Math.round(k * k * (3 - 2 * k) * 87) + ' ' + T(['éves', 'years old']);
      if (k < 1) requestAnimationFrame(f);
    })(performance.now());
    setTimeout(() => ti.classList.remove('intro'), 3400);
  }
  const _up = up;
  up = function () {
    const r = _up.apply(this, arguments);
    try {
      if (p && !p.dead) {
        p.rel.forEach(q => { if (q.alive && !q.past && q.bond != null && Math.random() < trt('emp') / 250) q.bond = Math.min(100, q.bond + 1); });
        Object.values(p.hob || {}).forEach(h => { if (h && h.lv != null && Math.random() < trt('cre') / 300) h.lv = Math.min(100, h.lv + 1); });
        render(); autoSave();
      } else if (p && p.dead) clearAuto();
    } catch (e) { }
    return r;
  };
})();
