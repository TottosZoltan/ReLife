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
