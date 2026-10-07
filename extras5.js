// ReLife extras5: jellemvonások, pillangó-hatás, stressz/kiégés, világhírek, mentési helyek
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
  // ----- Életlap + mentési helyek -----
  const box = document.createElement('div'); box.className = 'ov'; box.hidden = true; box.style.zIndex = 52; box.innerHTML = '<div class="box" id="trb"></div>'; $('#app').append(box);
  const bar = (n, v) => `<div class="top"><small>${n}</small><small>${Math.round(v)}</small></div><div class="tr"><i style="width:${v}%"></i></div>`;
  function open() {
    if (!(typeof p !== "undefined" && p)) { alert(t(['Előbb kezdj egy életet.', 'Start a life first.'])); return; }
    const T_ = tr(), slots = [1, 2, 3].map(i => { let s = null; try { s = JSON.parse(localStorage.getItem('relife_slot' + i)); } catch (e) { } return `<div class="card" style="margin:6px 0"><b>${t(['Hely', 'Slot'])} ${i}: ${s ? s.name + ' (' + s.age + ')' : t(['üres', 'empty'])}</b><div class="grid" style="margin-top:6px"><button data-sv="${i}">💾 ${t(['Mentés', 'Save'])}</button><button data-ld="${i}" ${s ? '' : 'disabled'}>📂 ${t(['Betöltés', 'Load'])}</button></div></div>`; }).join('');
    $('#trb').innerHTML = `<h2>🧬 ${t(['Jellem és egészség', 'Traits & health'])}</h2>${bar(t(['Kitartás', 'Grit']), T_.grit)}${bar(t(['Empátia', 'Empathy']), T_.emp)}${bar(t(['Kreativitás', 'Creativity']), T_.cre)}${bar(t(['Stressz', 'Stress']), p.stress || 20)}<p style="margin-top:10px">${t(['Év', 'Year'])}: ${T0() + p.age}</p><h3>${t(['Mentési helyek', 'Save slots'])}</h3>${slots}<button id="trx">${t(['Bezár', 'Close'])}</button>`;
    box.hidden = false;
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id == 'trx') box.hidden = true;
    if (b.dataset.sv) { try { localStorage.setItem('relife_slot' + b.dataset.sv, JSON.stringify(p)); } catch (x) { } open(); }
    if (b.dataset.ld) { const s = localStorage.getItem('relife_slot' + b.dataset.ld); if (s && confirm(t(['A mostani élet felülíródik. Biztos?', 'Current life will be overwritten. Sure?']))) { localStorage.setItem('relife_save', s); location.reload(); } }
  });
  const bt = document.createElement('button'); bt.className = 'big alt'; bt.textContent = '🧬 ' + t(['Jellem / mentések', 'Traits / saves']); bt.onclick = open;
  const ref = document.querySelector('#tset'); $('#title').insertBefore(bt, ref ? ref.nextSibling : null);
})();
