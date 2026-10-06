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
