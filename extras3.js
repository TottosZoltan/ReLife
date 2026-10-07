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
