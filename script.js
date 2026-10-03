// ===== GitLife — szöveges életszimulátor =====
const $ = s => document.querySelector(s);
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const P = a => a[R(0, a.length - 1)];
const cl = v => Math.max(0, Math.min(100, v));
const NF = ['Anna', 'Hanna', 'Lili', 'Zsófia', 'Emma', 'Nóra', 'Boglárka', 'Dóra'];
const NM = ['Bence', 'Máté', 'Levente', 'Dániel', 'Marcell', 'Ádám', 'Zalán', 'Patrik'];
const SN = ['Kovács', 'Tóth', 'Szabó', 'Németh', 'Farkas', 'Horváth', 'Varga', 'Kiss', 'Töttös'];
const ST = { hap: ['😊', 'Boldog'], hea: ['❤️', 'Egészség'], sma: ['🧠', 'Okos'], loo: ['✨', 'Kinézet'] };
const fmt = n => { const a = Math.abs(n); return (n < 0 ? '−' : '') + (a >= 1e6 ? (a / 1e6).toFixed(1).replace('.', ',') + ' M Ft' : Math.round(a / 1e3) + ' e Ft'); };
const EDU = ['Általános', 'Érettségi', 'Diploma'];
let p, tab = 'log';

// ----- adatok -----
const JOBS = [
  { n: 'Pincér', e: 0, s: 0, pay: 3e6 }, { n: 'Eladó', e: 0, s: 0, pay: 3.4e6 },
  { n: 'Raktáros', e: 0, s: 10, pay: 3.8e6 }, { n: 'Influenszer', e: 0, s: 0, l: 70, pay: 4e6 },
  { n: 'Szakács', e: 1, s: 30, pay: 4.4e6 }, { n: 'Villanyszerelő', e: 1, s: 40, pay: 5.4e6 },
  { n: 'Tanár', e: 2, s: 50, pay: 5.8e6 }, { n: 'Programozó', e: 2, s: 60, pay: 10e6 },
  { n: 'Ügyvéd', e: 2, s: 65, pay: 12e6 }, { n: 'Orvos', e: 2, s: 75, pay: 14e6 }
];
const MS = { 3: 'Elkezdted az óvodát.', 6: 'Elkezdted az általános iskolát.', 14: 'Gimnáziumba kerültél.' };
const QUIET = ['Nyugodt év volt.', 'Semmi különös nem történt.', 'Telt-múlt az idő.', 'Egy átlagos év.'];
const UNI = { t: 'Érettségi után', d: 'Letetted az érettségit. Mi legyen a következő lépés?', o: [
  ['Egyetemre megyek', [[1, 'Felvettek az egyetemre!', { uni: 1, hap: 8 }]]],
  ['Munkát keresek', [[1, 'Kilépsz a nagybetűs életbe.', { hap: 3 }]]]] };

// döntéses események: o = [felirat, [[súly, szöveg, hatás], ...], minimum pénz?]
const CH = [
  { a: [14, 17], t: 'Rossz társaság', d: 'A suli mögött a menő srácok cigivel kínálnak.', o: [
    ['Elszívom', [[1, 'Rászoktál a dohányzásra.', { hea: -12, hap: 8 }]]],
    ['Nem kérek, kösz', [[1, 'Kinevettek, de büszke vagy magadra.', { hap: -6, sma: 4 }]]]] },
  { a: [10, 17], t: 'Dolgozat', d: 'Holnap nehéz dolgozat, de nem tanultál. Puskázol?', o: [
    ['Puskázok', [[2, 'Nem vették észre. Ötös!', { hap: 5, sma: -2 }], [1, 'Rajtakaptak! Intő és szégyen.', { hap: -12, sma: -3 }]]],
    ['Inkább tanulok', [[1, 'Éjszakába nyúlóan tanultál, de megérte.', { sma: 7, hap: -4 }]]]] },
  { a: [16, 28], t: 'Pénteki buli', d: 'Hatalmas buli lesz, de hétfőn számon kérnek.', o: [
    ['Bulizom hajnalig', [[1, 'Felejthetetlen éjszaka!', { hap: 15, hea: -4, sma: -3 }]]],
    ['Otthon tanulok', [[1, 'Unalmas volt, de felkészültél.', { sma: 7, hap: -8 }]]]] },
  { a: [22, 50], t: 'KockaCoin', d: 'Egy haver "tuti" kriptót ajánl. Beszállsz 500 e Ft-tal?', o: [
    ['Beszállok', [[1, 'A KockaCoin az egekbe lőtt!', { money: 1.5e6, hap: 10 }], [1, 'A kripto becsődölt.', { money: -5e5, hap: -15 }]], 5e5],
    ['Kihagyom', [[1, 'Okosan döntöttél.', { sma: 3 }]]]] },
  { a: [12, 70], t: 'Elveszett pénztárca', d: 'Találtál egy pénztárcát 120 e Ft-tal.', o: [
    ['Megtartom', [[1, 'A lelkiismereted nem hagy nyugodni.', { money: 12e4, hap: -8 }]]],
    ['Leadom a rendőrségen', [[1, 'A tulajdonos nagyon hálás volt.', { hap: 10 }]]]] },
  { a: [30, 90], t: 'Gyanús hívás', d: 'Egy "banki ügyintéző" kéri az adataidat.', o: [
    ['Megadom', [[1, 'Átverés volt! Kiürítették a számlád.', { money: -8e5, hap: -15 }]]],
    ['Leteszem', [[1, 'Okosan leraktad.', { sma: 2 }]]]] },
  { a: [7, 13], t: 'Kutya', d: 'Nagyon vágysz egy kutyára. Megkéred a szüleidet?', o: [
    ['Kérem', [[2, 'Kaptál egy kutyát, a legjobb barátod lett.', { hap: 15 }], [1, 'Nemet mondtak.', { hap: -6 }]]],
    ['Inkább nem', [[1, 'Lemondtál róla.', { hap: 1 }]]]] },
  { a: [40, 80], t: 'Szűrővizsgálat', d: 'Esedékes az éves szűrés.', o: [
    ['Elmegyek (200 e Ft)', [[1, 'Időben kiszúrták a bajt.', { money: -2e5, hea: 8 }]], 2e5],
    ['Halogatom', [[2, 'Nem lett belőle baj.', { hap: 2 }], [1, 'Később súlyos baj derült ki.', { hea: -22 }]]]] },
  { a: [20, 40], t: 'Külföldi állás', d: 'Bécsben jól fizető munkát kínálnak.', o: [
    ['Kimegyek', [[1, 'Három év alatt szépen spóroltál.', { money: 4e6, hap: -8 }]]],
    ['Itthon maradok', [[1, 'Itthon jó neked.', { hap: 6 }]]]] },
  { a: [15, 35], t: 'Balaton', d: 'A haverok nyaralni mennek a Balatonra.', o: [
    ['Megyek (100 e Ft)', [[1, 'Fürdés, lángos, napfény.', { money: -1e5, hap: 14, loo: 2 }]], 1e5],
    ['Otthon maradok', [[1, 'Kihagytad.', { hap: -3 }]]]] },
  { a: [22, 60], u: () => p.job, t: 'Túlóra', d: 'A főnök túlórát kér tőled.', o: [
    ['Vállalom', [[2, 'Észrevették! Béremelést kaptál.', { raise: .1, hap: -6 }], [1, 'Csak kimerültél.', { hap: -10, hea: -4 }]]],
    ['Nem vállalom', [[1, 'Időben hazamentél.', { hap: 3 }]]]] }
];
// véletlen hírek: [minKor, maxKor, szöveg, hatás]
const RN = [
  [2, 8, 'A szüleid vettek neked egy új játékot.', { hap: 8 }],
  [6, 18, 'Egy osztálytársad csúfolt az iskolában.', { hap: -12 }],
  [12, 25, 'Nagyon pattanásos lett az arcod.', { loo: -10 }],
  [14, 80, 'Találtál az utcán 10 000 Ft-ot!', { money: 1e4 }],
  [18, 80, 'Elkaptad a kemény influenzát.', { hea: -15 }],
  [10, 100, 'Ettél egy nagyon finom édesburgonyás csirkét DM Pestóval.', { hap: 12 }],
  [40, 90, 'Fájni kezdett a hátad a sok üléstől.', { hea: -10 }],
  [5, 16, 'Nyertél a sulis versenyen!', { hap: 10, sma: 3 }],
  [16, 60, 'Fodrásznál jártál, jól sikerült a haj.', { loo: 6, hap: 4, money: -15000 }],
  [18, 70, 'Szép nyári nap volt a Duna-parton.', { hap: 8 }],
  [20, 70, 'Elromlott az autód, sokba került a javítás.', { money: -4e5 }],
  [1, 12, 'Elestél biciklivel, lehorzsoltad a térded.', { hea: -4 }],
  [25, 70, 'Egy régi barátod váratlanul felhívott.', { hap: 8 }],
  [30, 100, 'Olvastál egy könyvet, ami elgondolkodtatott.', { sma: 4 }]
];

// ----- állapot, mentés -----
const lg = (t, c = '') => { p.logs.push({ a: p.age, t, c }); if (p.logs.length > 160) p.logs.shift(); };
const save = () => { try { localStorage.setItem('gitlife_save', JSON.stringify(p)); } catch (e) {} };
const person = (role, age, bond, g) => ({ n: `${P(SN)} ${P(g == 'f' ? NF : NM)}`, role, age, bond, alive: true });
const stage = a => a < 3 ? 'Csecsemő' : a < 6 ? 'Óvodás' : a < 14 ? 'Általános iskolás' : a < 18 ? 'Gimnazista' : p.uni ? 'Egyetemista' : a < 65 ? 'Felnőtt' : 'Nyugdíjas';
const kids = () => p.rel.filter(r => r.alive && r.role == 'Gyerek');
const partner = () => p.rel.find(r => r.alive && (r.role == 'Párod' || r.role == 'Házastárs'));

function newLife() {
  const g = P(['f', 'm']), sn = P(SN);
  p = { g, name: `${sn} ${P(g == 'f' ? NF : NM)}`, age: 0, money: 0, hap: R(75, 95), hea: R(80, 100), sma: R(25, 75), loo: R(20, 85),
    edu: 0, uni: false, job: null, pay: 0, yrs: 0, pension: 0, fam: R(1, 3), dead: false, done: {}, logs: [], rel: [] };
  const m = { ...person('Anya', R(22, 38), R(60, 90), 'f'), par: 1 }, f = { ...person('Apa', R(23, 42), R(55, 90), 'm'), par: 1 };
  m.n = `${sn} ${P(NF)}`; f.n = `${sn} ${P(NM)}`;
  p.rel.push(m, f);
  if (Math.random() < .4) p.rel.push({ ...person('Testvér', R(1, 6), 50, P(['f', 'm'])), n: `${sn} ${P(NF.concat(NM))}` });
  lg(`Megszülettél Budapesten. A neved ${p.name}, a szüleid ${m.n} és ${f.n}. A család ${['szerény', 'átlagos', 'tehetős'][p.fam - 1]} körülmények között él.`, 'good');
}
function load() { try { p = JSON.parse(localStorage.getItem('gitlife_save')); } catch (e) {} if (!p || !p.rel) newLife(); }

// ----- hatások -----
function apply(fx) {
  const o = [];
  for (const k in fx) {
    const v = fx[k];
    if (k == 'money') { p.money += v; o.push((v > 0 ? '+' : '−') + fmt(Math.abs(v))); }
    else if (k == 'raise') { p.pay = Math.round(p.pay * (1 + v)); o.push('+' + Math.round(v * 100) + '% fizetés'); }
    else if (k == 'uni') p.uni = true;
    else if (ST[k]) { const b = p[k]; p[k] = cl(b + v); const d = Math.round(p[k] - b); if (d) o.push((d > 0 ? '+' : '') + d + ' ' + ST[k][0]); }
  }
  return o.join('  ');
}
function fxlog(t, fx) {
  const s = apply(fx), sc = ['hap', 'hea', 'sma', 'loo'].reduce((q, k) => q + (fx[k] || 0), 0) + Math.sign(fx.money || 0) * 5 + (fx.raise ? 9 : 0);
  lg(s ? `${t}  (${s})` : t, sc >= 0 ? 'good' : 'bad');
}
function pick(outs) {
  let r = Math.random() * outs.reduce((s, o) => s + o[0], 0);
  for (const [w, t, fx] of outs) if ((r -= w) < 0) return fxlog(t, fx);
}
function ask(ev) {
  $('#mt').textContent = ev.t; $('#md').textContent = ev.d;
  const b = $('#mb'); b.innerHTML = '';
  ev.o.forEach(([l, outs, req]) => {
    const x = document.createElement('button'); x.textContent = l;
    if (req && p.money < req) { x.disabled = true; x.textContent += ' (nincs pénz)'; }
    x.onclick = () => { $('#modal').hidden = true; pick(outs); render(); };
    b.append(x);
  });
  $('#modal').hidden = false;
}

// ----- öregedés -----
function up() {
  if (p.dead) return;
  const a = ++p.age, n0 = p.logs.length;
  p.done = {};
  if (MS[a]) lg(MS[a]);
  // pénz
  if (a >= 18 && !p.uni) {
    const inc = p.job ? p.pay : p.pension, cost = 2e6 + kids().filter(k => k.age < 18).length * 6e5;
    p.money += inc - cost;
    if (p.money < 0) { lg('Eladósodtál, ez nagyon stresszes.', 'bad'); apply({ hap: -5 }); }
  }
  // természetes változás
  p.hap = cl(p.hap - R(0, 3) + (partner() ? 1 : 0));
  if (a > 40) p.hea = cl(p.hea - R(0, 3)); if (a > 60) p.hea = cl(p.hea - R(0, 2));
  if (a > 35) p.loo = cl(p.loo - R(0, 2));
  if (a >= 6 && a <= 18) p.sma = cl(p.sma + R(1, 3));
  // tanulmányok
  if (a == 18) { p.edu = p.sma >= 25 ? 1 : 0; lg(p.edu ? 'Leérettségiztél.' : 'Nem sikerült az érettségi, maradt az általános iskola.', p.edu ? 'good' : 'bad'); }
  if (a == 22 && p.uni) {
    p.uni = false;
    if (p.sma >= 45) { p.edu = 2; fxlog('Megszerezted a diplomádat!', { hap: 15 }); } else lg('Az egyetemet nem sikerült befejezned.', 'bad');
  }
  // munka
  if (p.job) {
    p.yrs++; const r = Math.random();
    if (a >= 65) { p.pension = Math.round(p.pay * .5); lg(`Nyugdíjba mentél (${p.job}). Nyugdíj: ${fmt(p.pension)} / év.`, 'good'); p.job = null; p.pay = 0; }
    else if (r < .1) { fxlog('Előléptettek a munkahelyeden!', { raise: .15, hap: 8 }); }
    else if (r < .13) { lg(`Kirúgtak (${p.job}).`, 'bad'); apply({ hap: -15 }); p.job = null; p.pay = 0; }
  } else if (a == 65 && !p.pension) p.pension = 1.5e6;
  // emberek
  p.rel.forEach(r => {
    if (!r.alive) return;
    r.age++; r.bond = cl(r.bond - R(0, 4));
    if (r.par && r.age > 70 && Math.random() < (r.age - 70) * .012) {
      r.alive = false; lg(`${r.role} elhunyt: ${r.n} (${r.age} éves).`, 'bad'); apply({ hap: -15 });
      if (a >= 18) { const inh = R(3, 12) * 1e6 * p.fam; p.money += inh; lg(`Örökséged: ${fmt(inh)}.`, 'good'); }
    } else if (r.role == 'Párod' && r.bond < 15) { r.alive = false; lg(`${r.n} szakított veled.`, 'bad'); apply({ hap: -15 }); }
    else if (r.role == 'Házastárs' && r.bond < 10) { r.alive = false; p.money = Math.round(p.money * .7); lg(`${r.n} elvált tőled. A vagyonod egy része elúszott.`, 'bad'); apply({ hap: -20 }); }
  });
  // halál
  const risk = a < 45 ? .001 : ((a - 40) ** 2) * 4e-5 * (1 + (60 - p.hea) / 100);
  if (p.hea <= 0 || Math.random() < risk) {
    p.dead = true;
    lg(`Meghaltál ${a} évesen (${p.hea <= 0 ? 'betegségben' : a < 45 ? 'baleset következtében' : P(['szívmegállás', 'tüdőgyulladás', 'természetes okokból'])}).`, 'death');
    return render();
  }
  // események
  let ev = null;
  if (a == 18 && p.edu == 1) ev = UNI;
  else if (Math.random() < .3) { const l = CH.filter(e => a >= e.a[0] && a <= e.a[1] && (!e.u || e.u())); if (l.length) ev = P(l); }
  if (!ev && Math.random() < .5) { const l = RN.filter(e => a >= e[0] && a <= e[1]); if (l.length) { const e = P(l); fxlog(e[2], e[3]); } }
  if (p.logs.length == n0) lg(P(QUIET));
  render();
  if (ev) ask(ev);
}

// ----- teendők -----
const fr = () => { const g = P(['f', 'm']); return { ...person('Barát', R(5, 40), 45, g) }; };
const ACT = [
  { id: 'study', i: '📚', n: 'Tanulás', m: 6, c: 0, run: () => fxlog('Tanultál. Okosabb lettél, de fárasztó volt.', { sma: R(2, 5), hap: -2 }) },
  { id: 'gym', i: '🏋️', n: 'Edzés', m: 12, c: 15e4, run: () => fxlog('Edzettél. Erősebbnek érzed magad.', { hea: R(4, 8), loo: R(2, 5) }) },
  { id: 'doc', i: '🏥', n: 'Orvos', m: 0, c: 4e5, run: () => fxlog('Orvoshoz mentél, kikezeltek.', { hea: R(15, 25) }) },
  { id: 'med', i: '🧘', n: 'Meditálás', m: 10, c: 0, run: () => fxlog('Meditáltál, lenyugodtál.', { hap: R(3, 7) }) },
  { id: 'fr', i: '🎬', n: 'Haverok', m: 8, c: 5e4, run: () => { fxlog('Jót töltél a barátaiddal.', { hap: R(4, 9) }); if (p.rel.filter(r => r.alive && r.role == 'Barát').length < 4 && Math.random() < .5) { const f = fr(); p.rel.push(f); lg(`Új barátod lett: ${f.n}.`, 'good'); } } },
  { id: 'trip', i: '✈️', n: 'Utazás', m: 16, c: 12e5, run: () => fxlog('Elutaztál, feltöltődtél.', { hap: R(10, 18), loo: 2 }) },
  { id: 'lot', i: '🎰', n: 'Lottó', m: 18, c: 2e4, run: () => Math.random() < .01 ? fxlog('MEGNYERTED A LOTTÓ FŐNYEREMÉNYÉT!', { money: 5e7, hap: 30 }) : fxlog('Nem nyertél a lottón.', { hap: -1 }) },
  { id: 'pt', i: '🧾', n: 'Diákmunka', m: 14, c: 0, run: () => fxlog('Diákmunkáztál.', { money: R(300, 600) * 1e3, hap: -3 }) },
  { id: 'meet', i: '💘', n: 'Ismerkedés', m: 16, c: 0, run: () => {
    if (partner()) return fxlog('Már van párod, inkább vele foglalkozz.', { hap: -1 });
    if (Math.random() < .3 + p.loo / 200) { const g = P(['f', 'm']), q = person('Párod', Math.max(16, p.age + R(-4, 4)), 45, g); p.rel.push(q); fxlog(`Megismerkedtél valakivel: ${q.n}!`, { hap: 10 }); }
    else fxlog('Nem jött össze semmi.', { hap: -3 });
  } }
];
function doAct(id) {
  const x = ACT.find(q => q.id == id), c = p.age < 18 ? 0 : x.c;
  if (p.done[id] || p.dead || p.money < c) return;
  p.done[id] = 1; p.money -= c; x.run(); render();
}

// ----- emberek -----
function talk(i) { const r = p.rel[i]; if (p.done['t' + i]) return; p.done['t' + i] = 1; r.bond = cl(r.bond + R(5, 12)); fxlog(`Beszélgettél vele: ${r.n}.`, { hap: 3 }); render(); }
function gift(i) { const r = p.rel[i], c = p.age < 18 ? 0 : 1e5; if (p.done['g' + i] || p.money < c) return; p.done['g' + i] = 1; p.money -= c; r.bond = cl(r.bond + R(8, 15)); lg(`Megajándékoztad: ${r.n}.`, 'good'); render(); }
function propose(i) {
  const r = p.rel[i]; p.done['p' + i] = 1;
  if (r.bond >= 65 && Math.random() < .8) { r.role = 'Házastárs'; fxlog(`Összeházasodtál vele: ${r.n}!`, { hap: 20 }); }
  else { r.bond = cl(r.bond - 12); fxlog(`${r.n} nemet mondott a kérdésedre.`, { hap: -8 }); }
  render();
}
function baby(i) {
  p.done['b' + i] = 1; const g = P(['f', 'm']);
  const k = { n: `${p.name.split(' ')[0]} ${P(g == 'f' ? NF : NM)}`, role: 'Gyerek', age: 0, bond: 80, alive: true }; p.rel.push(k);
  fxlog(`Megszületett a gyereked: ${k.n}!`, { hap: 15 }); render();
}

// ----- munka -----
function applyJob(n) {
  const j = JOBS.find(q => q.n == n); p.done.job = 1;
  if (Math.random() < Math.min(.95, Math.max(.15, .6 + (p.sma - j.s) / 100))) { p.job = j.n; p.pay = j.pay; p.yrs = 0; fxlog(`Felvettek: ${j.n}.`, { hap: 10 }); }
  else lg(`Elutasítottak (${j.n}).`, 'bad');
  render();
}
function quit() { if (confirm('Biztosan felmondasz?')) { lg(`Felmondtál (${p.job}).`); p.job = null; p.pay = 0; render(); } }

// ----- megjelenítés -----
function panel() {
  const a = p.age;
  if (tab == 'log') {
    let h = '', last = -1;
    for (const l of p.logs.slice().reverse()) { if (l.a !== last) { h += `<h3>${l.a} éves</h3>`; last = l.a; } h += `<p class="lg ${l.c}">${l.t}</p>`; }
    return h;
  }
  if (tab == 'act') {
    return '<div class="grid">' + ACT.filter(x => a >= x.m).map(x => {
      const c = a < 18 ? 0 : x.c, off = p.done[x.id] || p.dead || p.money < c;
      return `<button class="act" ${off ? 'disabled' : ''} onclick="doAct('${x.id}')"><b>${x.i} ${x.n}</b><small>${c ? fmt(c) : 'ingyen'}</small></button>`;
    }).join('') + '</div>';
  }
  if (tab == 'rel') {
    return p.rel.map((r, i) => {
      if (!r.alive) return '';
      const gc = a < 18 ? 0 : 1e5;
      let b = `<button ${p.done['t' + i] ? 'disabled' : ''} onclick="talk(${i})">Beszélgetés</button>`;
      if (a >= 8 && r.age >= 3) b += `<button ${p.done['g' + i] || p.money < gc ? 'disabled' : ''} onclick="gift(${i})">Ajándék${gc ? ' (100 e)' : ''}</button>`;
      if (r.role == 'Párod' && a >= 18) b += `<button class="alt" ${p.done['p' + i] ? 'disabled' : ''} onclick="propose(${i})">Házassági ajánlat</button>`;
      if (r.role == 'Házastárs' && a <= 45) b += `<button class="alt" ${p.done['b' + i] ? 'disabled' : ''} onclick="baby(${i})">Gyerek vállalása</button>`;
      return `<div class="card"><div class="top"><b>${r.n}</b><small>${r.role}, ${r.age} éves</small></div><div class="tr"><i style="width:${r.bond}%"></i></div><div class="btns">${b}</div></div>`;
    }).join('') || '<p class="empty">Nincs senki körülötted.</p>';
  }
  let h = `<div class="card"><div class="top"><b>Végzettség</b><small>${EDU[p.edu]}${p.uni ? ' (egyetemista)' : ''}</small></div></div>`;
  if (p.job) return h + `<div class="card"><div class="top"><b>${p.job}</b><small>${p.yrs}. éve</small></div><p>Fizetés: ${fmt(p.pay)} / év</p><div class="btns" style="margin-top:8px"><button class="alt" onclick="quit()">Felmondok</button></div></div>`;
  if (a >= 65) return h + `<p class="empty">Nyugdíjas vagy: ${fmt(p.pension)} / év.</p>`;
  if (a < 16 || p.uni) return h + `<p class="empty">${p.uni ? 'Az egyetem mellett most nem dolgozol.' : '16 éves kortól vállalhatsz állást.'}</p>`;
  return h + JOBS.map(j => {
    const ok = p.edu >= j.e && p.loo >= (j.l || 0) && !p.done.job;
    return `<div class="card"><div class="top"><b>${j.n}</b><small>${fmt(j.pay)} / év</small></div><small style="color:var(--mut)">${EDU[j.e]}${j.s ? `, okosság ${j.s}+` : ''}${j.l ? `, kinézet ${j.l}+` : ''}</small><div class="btns" style="margin-top:8px"><button ${ok ? '' : 'disabled'} onclick="applyJob('${j.n}')">Jelentkezés</button></div></div>`;
  }).join('');
}
function render() {
  $('#nm').textContent = p.name; $('#sg').textContent = p.dead ? 'Elhunyt' : stage(p.age); $('#mo').textContent = fmt(p.money);
  const ag = $('#ag'); if (ag.textContent != p.age) { ag.textContent = p.age; ag.classList.remove('pop'); void ag.offsetWidth; ag.classList.add('pop'); }
  for (const k in ST) { const v = Math.round(p[k]); $('#v' + k).textContent = v; const i = $('#b' + k); i.style.width = v + '%'; i.style.background = v < 25 ? '#c23b3b' : v < 50 ? '#f0b429' : ''; }
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t == tab));
  const v = $('#view'); v.innerHTML = panel();
  $('#up').disabled = p.dead;
  if (p.dead) {
    $('#es').textContent = `${p.name} ${p.age} évet élt.\nVégzettség: ${EDU[p.edu]}\nMunka: ${p.job || (p.pension ? 'nyugdíjas' : 'nincs')}\nVagyon: ${fmt(p.money)}\nGyerekek: ${p.rel.filter(r => r.role == 'Gyerek').length}`;
    $('#end').hidden = false;
  }
  save();
}
function restart(ask) { if (!ask || confirm('Új életet kezdesz? A mostani elvész!')) { newLife(); $('#end').hidden = true; $('#modal').hidden = true; tab = 'log'; render(); } }

// ----- indítás -----
$('#bars').innerHTML = Object.entries(ST).map(([k, [e, n]]) => `<div><div class="st"><span>${e} ${n}</span><span id="v${k}"></span></div><div class="tr"><i id="b${k}"></i></div></div>`).join('');
$('#up').onclick = up;
$('#nw').onclick = () => restart(true);
$('#again').onclick = () => restart(false);
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; render(); });
load(); render();
