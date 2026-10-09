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
