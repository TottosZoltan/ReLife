// ReLife extras3: havi költségvetés, városonkénti lakhatás, költözés, adó, piaci események, adomány
(function () {
  const t = x => T(x), R_ = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const MULT = { 'Budapest': 1.4, 'Debrecen': 1, 'Szeged': 1, 'Pécs': .9, 'Győr': 1, 'Miskolc': .85 };
  const mult = () => MULT[p.city && p.city[0]] || 1;
  const adult = () => p.age >= 18 && !p.uni && !(p.prison > 0);
  const kidsN = () => p.rel.filter(r => r.role == 'Gyerek' && r.alive && r.age < 18).length;
  function budget() {
    const house = p.assets.some(x => x.t == 'house'), cars = p.assets.filter(x => x.t == 'car').length;
    const inc = p.job ? p.pay : p.pension || 0, tax = p.job ? Math.round(inc * .08) : 0;
    const home = Math.round((house ? 8e5 : 2e6 * mult())), car = cars * 3e5, kid = kidsN() * 6e5, ins = p.assets.filter(x => x.ins).reduce((s, x) => s + Math.round(x.v * .025), 0), intr = Math.round((p.debt || 0) * .12);
    return { inc, tax, home, car, kid, ins, intr, net: inc - tax - home - car - kid - ins };
  }
  const m = n => (window.fmt || (x => x))(Math.round(n / 12));
  function card() {
    const b = budget(), simple = document.body.dataset.view == 'simple', rows = [[t(['Bevétel', 'Income']), b.inc], [t(['Adó (8%)', 'Tax (8%)']), -b.tax], [t(['Lakhatás', 'Housing']), -b.home], [t(['Autók', 'Cars']), -b.car], [t(['Gyerekek', 'Children']), -b.kid], [t(['Biztosítás', 'Insurance']), -b.ins], [t(['Hitelkamat', 'Loan interest']), -b.intr]].filter(r => r[1]);
    let h = `<h3 style="margin:12px 0 6px">📊 ${t(['Havi költségvetés', 'Monthly budget'])}</h3><div class="card"><div class="top"><b>${t(['Havi egyenleg', 'Monthly balance'])}</b><small>${m(b.net - b.intr)}</small></div>`;
    if (!simple) h += rows.map(r => `<div class="top"><small>${r[0]}</small><small>${m(r[1])}</small></div>`).join('');
    h += `<small>🏙 ${p.city[0]} · ${t(['lakhatási szorzó', 'housing factor'])} ×${mult()}</small></div>`;
    if (p.age >= 20) h += `<div class="card"><b>🚚 ${t(['Költözés (300 e Ft)', 'Move (300k)'])}</b><div class="grid" style="margin-top:8px">${Object.keys(MULT).filter(c => c != p.city[0]).map(c => `<button onclick="moveTo('${c}')">${c}</button>`).join('')}</div></div>`
      + `<div class="card"><b>🎗 ${t(['Jótékonyság', 'Charity'])}</b><div class="grid" style="margin-top:8px"><button onclick="donate(1e6)">1 M Ft</button><button onclick="donate(5e6)">5 M Ft</button></div></div>`;
    return h;
  }
  window.moveTo = c => {
    if (p.age < 20 || p.money < 3e5 || p.done.mv) return; const x = CITY.find(q => q[0] == c); if (!x) return;
    p.done.mv = 1; p.money -= 3e5; p.city = x; lg(`🚚 ${t(['Elköltöztél ide: ', 'You moved to '])}${x[0]}.`); apply({ hap: R_(-3, 5) }); render();
  };
  window.donate = a => {
    if (p.age < 18 || p.money < a) return; p.money -= a; p.hap = Math.min(100, p.hap + (a >= 5e6 ? 6 : 3)); p.rep = (p.rep || 0) + (a >= 5e6 ? 2 : 1);
    lg(`🎗 ${t(['Adományoztál: ', 'You donated: '])}${fmt(a)}.`, 'good'); render();
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
      const b = budget(), extra = Math.round(2e6 * (mult() - 1)) * (p.assets.some(x => x.t == 'house') ? 0 : 1);
      p.money -= b.tax + extra; if (b.tax) lg(`🧾 ${t(['Adó: −', 'Tax: −'])}${fmt(b.tax)}.`);
      const r = Math.random();
      if (r < .05) { p.inv = Math.round((p.inv || 0) * .75); p.cry = Math.round((p.cry || 0) * .6); p.money = Math.round(p.money * .97); lg('📉 ' + t(['Gazdasági válság: a befektetések esnek.', 'Economic crisis: investments drop.']), 'bad'); }
      else if (r < .09) { p.money = Math.round(p.money * .96); lg('💸 ' + t(['Infláció: minden drágább lett.', 'Inflation: everything got pricier.']), 'bad'); }
      else if (r < .12) { p.inv = Math.round((p.inv || 0) * 1.2); lg('📈 ' + t(['Gazdasági fellendülés: a részvények nőnek.', 'Boom: stocks are rising.']), 'good'); }
      render();
    } catch (e) { }
  };
})();
