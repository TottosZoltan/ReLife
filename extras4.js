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
    let b = av.querySelector('.mood'); if (!b) { b = document.createElement('span'); b.className = 'mood'; av.append(b); }
    b.textContent = mood(); $('#app').dataset.season = p.age % 4;
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
  const bt = document.createElement('button'); bt.className = 'big alt'; bt.textContent = '📷 ' + t(['Fotóalbum', 'Photo album']); bt.onclick = open;
  const ref = document.querySelector('#tset') || document.querySelector('#title .lang'); $('#title').insertBefore(bt, ref ? ref.nextSibling : null);
})();
