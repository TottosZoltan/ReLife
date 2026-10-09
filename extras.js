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
  // ----- achievementek -----
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
    const d = el(`<div class="achb ${r}" style="--c:${RC[r]}"><div class="achi"><span>${a.i}</span><i></i></div><div class="acht"><small>${t(['ACHIEVEMENT FELOLDVA', 'ACHIEVEMENT UNLOCKED'])} · ${t(RN[r]).toUpperCase()}</small><b>${a.n}</b><em>${a.d}</em></div><div class="achp">+${a.pt}⭐</div></div>`);
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
    if (got.length > 2) aq.push({ i: '🏆', n: got.length + t([' új achievement', ' new achievements']), d: got.slice(0, 4).map(a => t(a[2])).join(', ') + (got.length > 4 ? '…' : ''), r: top, pt: pts });
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
  setTimeout(() => { if (!st.tut) { st.tut = 1; applySet(); popup(t(['Üdv a ReLife-ban!', 'Welcome to ReLife!']), t(['Tipp: a „Kor” gomb lépteti az évet. A fülekkel (💼💰👥🎯) dönthetsz. Cél és achievementek a ⚙️ Beállításokban.', 'Tip: the Age button advances a year. Use the tabs (💼💰👥🎯) to decide. Goals and achievements live in ⚙️ Settings.']), [[t(['Értem', 'Got it']), () => {}]]); } }, 800);
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
      <div style="display:grid;gap:8px;margin-top:10px"><button data-a="album">📷 ${t(['Fotóalbum', 'Photo album'])}</button><button data-v2="ach">🏆 ${t(['Achievementek', 'Achievements'])}${newAch() ? ` <b style="background:#e4572e;color:#fff;border-radius:99px;padding:1px 8px;font-size:12px">${newAch()} ${t(['új', 'new'])}</b>` : ''}</button><button data-v2="lives">📚 ${t(['Életek könyvtára', 'Lives library'])}</button>
      <button data-a="privacy">🔐 ${t(['Adatvédelmi beállítások', 'Privacy options'])}</button><button data-a="exp">📤 ${t(['Mentés exportálása', 'Export save'])}</button><button data-a="imp">📥 ${t(['Mentés importálása', 'Import save'])}</button><button data-a="del">🗑 ${t(['Adatok törlése', 'Delete data'])}</button><button data-v2="about">ℹ️ ${t(['Névjegy / Változásnapló', 'About / Changelog'])}</button><button data-a="x">${t(['Bezár', 'Close'])}</button></div>`;
    if (v == 'ach') {
      const have = L('relife_ach') || {}, n = Object.keys(have).length, pts = AC.reduce((s, a) => s + (have[a[0]] ? PT[a[4]] : 0), 0), tot = AC.reduce((s, a) => s + PT[a[4]], 0);
      const cnt = r => AC.filter(a => a[4] == r && have[a[0]]).length + '/' + AC.filter(a => a[4] == r).length;
      const list = AC.filter(a => afil == 'all' || a[4] == afil).sort((a, b) => (have[b[0]] ? 1 : 0) - (have[a[0]] ? 1 : 0) || (have[b[0]] || 0) - (have[a[0]] || 0));
      const cards = list.map(a => {
        const o = have[a[0]], hid = a[4] == 'secret' && !o; let pr = '';
        if (!o && a[6] && !hid) { try { const [c, m] = a[6](), pc = Math.max(0, Math.min(100, c / m * 100)); pr = `<div class="tr"><i style="width:${pc}%"></i></div><small>${fmtp(c)} / ${fmtp(m)}</small>`; } catch (x) { } }
        return `<div class="achc ${o ? 'on' : ''} ${a[4]}" style="--c:${RC[a[4]]}">${o && o > viewMark ? '<span class="new">NEW</span>' : ''}<div class="achg">${hid ? '🔒' : a[1]}</div><b>${hid ? '???' : t(a[2])}</b><small>${hid ? t(['Titkos achievement', 'Secret achievement']) : t(a[3])}</small>${pr}<small class="pt">${o ? '✓ ' + new Date(o).toLocaleDateString(LANG == 'hu' ? 'hu-HU' : 'en-GB') + ' · +' + PT[a[4]] + '⭐' : t(RN[a[4]]) + ' · ' + PT[a[4]] + '⭐'}</small></div>`;
      }).join('');
      h = `${back}<h2>🏆 ${n}/${AC.length}</h2><div class="tr"><i style="width:${n / AC.length * 100}%"></i></div><p style="margin:4px 0 8px"><b>⭐ ${pts}</b> / ${tot} · ${Math.round(n / AC.length * 100)}%</p>
        <div class="chips" style="margin-bottom:4px"><button class="chip ${afil == 'all' ? 'on' : ''}" data-f="all">${t(['Mind', 'All'])} ${n}/${AC.length}</button>${Object.keys(RN).map(r => `<button class="chip ${afil == r ? 'on' : ''}" data-f="${r}" style="${afil == r ? '' : 'border-color:' + RC[r]}">${t(RN[r])} ${cnt(r)}</button>`).join('')}</div>
        <div class="achgrid">${cards}</div>`;
    }
    if (v == 'lives') { const lv = (L('relife_lives') || []).slice().reverse(), top = lv.slice().sort((a, b) => b.s - a.s)[0];
      h = `${back}<h2>📚 ${t(['Életek', 'Lives'])}</h2>` + (top ? `<p>👑 Hall of Fame: ${top.n} – ${top.s} ⭐</p>` : `<p>${t(['Még nincs lezárt élet.', 'No finished lives yet.'])}</p>`) + lv.map(x => `<div class="card" style="margin:6px 0"><b>${x.n}</b> · ${x.a} ${t(['év', 'yr'])}<br><small>⭐ ${x.s}${x.d ? ' 🎯' : ''}</small></div>`).join(''); }
    if (v == 'about') h = `${back}<h2>ℹ️ ReLife</h2><p>v1.1: ${t(['Beállítások, nehézség, tartalomszűrő, achievementek, életcélok, életpontszám, életek könyvtára, téma, betűméret, mentés export/import.', 'Settings, difficulty, content filter, achievements, life goals, life score, lives library, theme, font size, save export/import.'])}</p>`;
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
