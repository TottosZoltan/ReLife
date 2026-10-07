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
