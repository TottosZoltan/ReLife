// ReLife extras7: éves jövedelem, többszöri álláskeresés, mellékállás, csatornairányok (niche), influenszer a vállalkozás mellé, alkotói események
(function () {
  const t = x => T(x), R_ = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const isBiz = () => !!(p.car && CAR_BY[p.car.id] && CAR_BY[p.car.id].biz);
  const crCareer = () => !!(p.car && CAR_BY[p.car.id] && CAR_BY[p.car.id].cr);

  // ---- éves jövedelem: több munkahely egy éven belül ----
  window.leaveJob = function () {
    if (!p.job) return;
    p.earn = (p.earn || 0) + Math.round(p.pay * .4); p.earnMax = Math.max(p.earnMax || 0, p.pay);
  };
  window.yearIncome = function () {
    const e = p.earn || 0;
    const base = e ? Math.min(e + (p.job ? Math.round(p.pay * .5) : 0), (p.earnMax || p.pay || 0) * 1.1) : (p.job ? p.pay : (p.pension || 0));
    return Math.round(base + (p.side ? p.side.pay : 0));
  };

  // ---- csatornairányok ----
  const NICHES = {
    vid: [
      { id: 'game', i: '🎮', n: ['Gaming', 'Gaming'], gm: 1.15, im: .9, aff: { tw: 1.25, yt: 1.05 } },
      { id: 'vlog', i: '📷', n: ['Vlog', 'Vlog'], gm: 1.1, im: 1, aff: { yt: 1.1, tt: 1.05 } },
      { id: 'edu', i: '📚', n: ['Oktató / ismeretterjesztő', 'Educational'], gm: .85, im: 1.35, aff: { yt: 1.2 } },
      { id: 'comedy', i: '😂', n: ['Humor', 'Comedy'], gm: 1.25, im: .85, aff: { tt: 1.25 } },
      { id: 'cook', i: '🍳', n: ['Főzés', 'Cooking'], gm: 1, im: 1.1, aff: { tt: 1.1, yt: 1.05 } },
      { id: 'music', i: '🎵', n: ['Zene', 'Music'], gm: .95, im: 1.15, aff: { yt: 1.1 } },
      { id: 'tech', i: '💻', n: ['Tech tesztek', 'Tech reviews'], gm: .9, im: 1.3, aff: { yt: 1.15 } }
    ],
    inf: [
      { id: 'fashion', i: '👗', n: ['Divat', 'Fashion'], gm: 1.15, im: 1, aff: { ig: 1.2, tt: 1.1 } },
      { id: 'fit', i: '💪', n: ['Fitnesz', 'Fitness'], gm: 1.1, im: 1.05, aff: { ig: 1.15, tt: 1.1 } },
      { id: 'travel', i: '✈️', n: ['Utazás', 'Travel'], gm: 1.05, im: 1.15, aff: { ig: 1.2, fb: 1.05 } },
      { id: 'beauty', i: '💄', n: ['Szépség', 'Beauty'], gm: 1.15, im: 1.1, aff: { ig: 1.2 } },
      { id: 'food', i: '🍽️', n: ['Gasztro', 'Food'], gm: 1.05, im: 1.05, aff: { ig: 1.1, fb: 1.1 } },
      { id: 'life', i: '🏡', n: ['Életmód', 'Lifestyle'], gm: 1, im: 1.1, aff: { fb: 1.15, tx: 1.05 } },
      { id: 'opinion', i: '🗣️', n: ['Vélemény / közélet', 'Commentary'], gm: 1.1, im: .95, aff: { tx: 1.3 } }
    ]
  };
  const NALL = NICHES.vid.concat(NICHES.inf);
  const nf = a => a && a.niche ? NALL.find(x => x.id == a.niche) : null;
  window.nicheGm = (a, k) => { const n = nf(a); return n ? n.gm * (n.aff[k] || 1) : 1; };
  window.nicheIm = (a, k) => { const n = nf(a); return n ? n.im * (1 + ((n.aff[k] || 1) - 1) / 2) : 1; };
  window.nicheIcon = a => { const n = nf(a); return n ? n.i : ''; };
  window.nicheLabel = a => { const n = nf(a); return n ? ' · ' + n.i + ' ' + t(n.n) : ''; };
  const nnote = (x, k) => t(['növekedés', 'growth']) + ' ×' + (x.gm * (x.aff[k] || 1)).toFixed(2) + ' · ' + t(['bevétel', 'income']) + ' ×' + (x.im * (1 + ((x.aff[k] || 1) - 1) / 2)).toFixed(2);
  window.nicheStep = function (mode, cid, k) {
    const L = NICHES[cid == 'vid' ? 'vid' : 'inf'];
    const fn = id => mode == 'start' ? `startCr('${cid}','${k}','${id}')` : mode == 'open' ? `crOpen('${k}','${id}')` : `startInf('${k}','${id}')`;
    return `<h3>${PLAT[k].i} ${PLAT[k].n}: ${t(['milyen irányú csatornát viszel?', 'what direction will your channel take?'])}</h3><div class="grid">`
      + L.map(x => abtn({ i: x.i, n: t(x.n), note: nnote(x, k), fn: fn(x.id) })).join('') + `</div><div class="btns"><button class="alt" onclick="crPend=null;render()">${t(['‹ Platform módosítása', '‹ Change platform'])}</button></div>`;
  };

  // ---- influenszer a vállalkozás mellé ----
  window.crPickI = k => { crPend = { mode: 'inf', k }; render(); };
  window.startInf = function (k, n) {
    if (!isBiz() || p.inf || p.age < 14 || !CAR_BY.inf.pl.includes(k)) return;
    crNicheSel = n || null; p.inf = { id: 'inf', rank: 0, perf: 35, yrs: 0, acc: { [k]: newAcc() }, sel: k }; crNicheSel = null; crPend = null;
    fxlog('📱 ' + t(['Influenszerkedni kezdtél a céged mellett: ingyen reklám a vállalkozásodnak!', 'You started influencing next to your business: free advertising for your company!']), { hap: 6 }); render();
  };
  window.quitInf = function () { if (!p.inf || !confirm(t(['Biztosan abbahagyod az influenszerkedést?', 'Really stop influencing?']))) return; p.inf = null; lg('📱 ' + t(['Abbahagytad az influenszerkedést.', 'You stopped influencing.'])); render(); };
  window.quitCr = () => crCareer() ? quitCar() : quitInf();
  const SYN = { cafe: ['cook', 'food'], shop: ['fashion', 'beauty', 'life'], startup: ['tech', 'edu'] };
  window.infBoost = function () {
    if (!p.inf || !isBiz()) return 1;
    const tot = crTot(p.inf), syn = Object.values(p.inf.acc).some(a => (SYN[p.car.id] || []).includes(a.niche));
    return 1 + Math.min(.6, Math.log10(tot + 1) * .08) + (syn ? .08 : 0);
  };
  window.infPromo = function () {
    if (!p.inf || !isBiz() || p.done.infPromo) return; p.done.infPromo = 1;
    const g = Math.round(R_(4, 9) * (1 + crTier(crTot(p.inf)) * .3));
    p.car.perf = cl(p.car.perf + g); fxlog('📣 ' + t(['Reklámoztad a cégedet a csatornádon.', 'You advertised your company on your channel.']), { hap: 2 }); render();
  };
  function infPanel() {
    if (p.age < 14) return '';
    if (p.inf) {
      const boost = isBiz() ? `<div class="card"><div class="top"><b>📣 ${t(['Ingyen reklám a cégednek', 'Free ads for your company'])}</b><small>+${Math.round((infBoost() - 1) * 100)}% ${t(['cégbevétel', 'company income'])}</small></div><div class="btns"><button ${p.done.infPromo ? 'disabled' : ''} onclick="infPromo()">${t(['Cég reklámozása', 'Promote the company'])}</button></div></div>` : '';
      return `<h3>📱 ${t(['Influenszer-oldalág', 'Influencer side channel'])}</h3>` + boost + crPanel();
    }
    if (!isBiz()) return '';
    const intro = `<div class="card"><div class="top"><b>📱 ${t(['Influenszerkedés a cég mellett', 'Influencing next to your business'])}</b></div><small>${t(['Építs közönséget: az influenszer-csatornád ingyen reklám a vállalkozásodnak, és növeli a bevételét.', 'Build an audience: your channel is free advertising for your business and boosts its income.'])}</small></div>`;
    if (crPend && crPend.mode == 'inf') return `<h3>📱 ${t(['Influenszerkedés', 'Influencing'])}</h3>` + intro + nicheStep('inf', 'inf', crPend.k);
    return `<h3>📱 ${t(['Influenszerkedés', 'Influencing'])}</h3>` + intro + `<div class="grid">` + CAR_BY.inf.pl.map(k => abtn({ i: PLAT[k].i, n: PLAT[k].n, note: PLAT[k].d, fn: `crPickI('${k}')` })).join('') + '</div>';
  }

  // ---- mellékállás (különleges karrier mellett) ----
  window.applySide = function (n) {
    const j = JOBS.find(q => q.n == n); if (!j || !p.car || p.side || p.age < 16 || (p.done.sideN || 0) >= 2) return;
    if (p.edu < j.e || p.loo < (j.l || 0) || (j.c && p.crim) || (j.lic && !p.lic)) return;
    p.done.sideN = (p.done.sideN || 0) + 1;
    if (Math.random() < Math.min(.95, Math.max(.2, .65 + (p.sma - j.s) / 100))) { p.side = { n: j.n, pay: Math.round(j.pay * .4 / 1e3) * 1e3 }; fxlog('🧰 ' + t(['Mellékállást vállaltál: ', 'You took a side job: ']) + j.n + '.', { hap: 3 }); }
    else lg('🧰 ' + t(['Nem vettek fel mellékállásba: ', 'You were not hired for the side job: ']) + j.n + '.', 'bad');
    render();
  };
  window.quitSide = function () { if (!p.side) return; lg('🧰 ' + t(['Felmondtál a mellékállásban: ', 'You quit your side job: ']) + p.side.n + '.'); p.side = null; render(); };
  function sidePanel() {
    if (!p.car || p.age < 16) return '';
    let h = `<h3>🧰 ${t(['Mellékállás', 'Side job'])}</h3>`;
    if (p.side) return h + row(p.side.n, fmt(p.side.pay) + t([' / év', ' / year']), `<small>${t(['Mellékállásban dolgozol a karriered mellett, a fizetése a teljes munkaidős bér 40%-a.', 'You work a side job next to your career; it pays 40% of the full-time wage.'])}</small><div class="btns"><button class="alt" onclick="quitSide()">${t(['Felmondok', 'Quit'])}</button></div>`);
    const L = JOBS.filter(j => p.edu >= j.e && p.loo >= (j.l || 0) && !(j.c && p.crim) && (!j.lic || p.lic));
    if (!L.length) return h + `<p class="empty">${t(['Nincs elérhető mellékállás.', 'No side job available.'])}</p>`;
    return h + `<small>${t(['Mellé kisebb munkát is vállalhatsz. Évente legfeljebb kétszer próbálkozhatsz.', 'You can take a smaller job alongside. You may try at most twice a year.'])}</small><div class="grid">`
      + L.slice(0, 14).map(j => abtn({ i: '🧰', n: j.n, note: fmt(Math.round(j.pay * .4 / 1e3) * 1e3) + t([' / év', ' / year']), off: (p.done.sideN || 0) >= 2, fn: `applySide('${j.n.replace(/'/g, "\\'")}')` })).join('') + '</div>';
  }

  // ---- panel hook ----
  const _panel = panel;
  panel = function (tb) {
    let h = _panel.apply(this, arguments);
    try { if (tb == 'job' && !sub && p.age >= 14 && !p.dead) h += (!crCareer() ? infPanel() : '') + sidePanel(); } catch (e) { console.error(e); }
    return h;
  };

  // ---- évváltás ----
  let asked = false; const _ask = ask; ask = function () { asked = true; return _ask.apply(this, arguments); };
  const _up = up;
  up = function () {
    asked = false; _up.apply(this, arguments);
    try {
      if (p.dead) return;
      p.earn = 0; p.earnMax = 0;
      if (p.side) { if (p.age >= 65 || Math.random() < .04) { lg('🧰 ' + t(['Elvesztetted a mellékállásodat: ', 'You lost your side job: ']) + p.side.n + '.', 'bad'); p.side = null; } else apply({ hap: -1 }); }
      if (p.inf) {
        p.inf.yrs = (p.inf.yrs || 0) + 1; crYear(p.inf, CAR_BY.inf);
        if (isBiz()) { p.car.perf = cl(p.car.perf + R_(1, 3) + crTier(crTot(p.inf))); lg('📣 ' + t(['Az influenszer-csatornád ingyen reklámot csinált a cégednek.', 'Your influencer channel gave your company free advertising.'])); }
      }
      if (!asked && crO() && Math.random() < .4) { const L = CREV.filter(e => p.age >= e.a[0] && p.age <= e.a[1] && (!e.u || e.u())); if (L.length) { const e = L[Math.floor(Math.random() * L.length)]; pend = null; ask(e); } }
      render();
    } catch (e) { console.error(e); }
  };

  // ---- egyedi alkotói események ----
  const hasN = id => { const c = crO(); return !!c && Object.values(c.acc || {}).some(a => a.niche == id); };
  const hasP = id => { const c = crO(); return !!c && !!(c.acc || {})[id]; };
  const O = (l, outs, req) => req ? [l, outs, req] : [l, outs];
  const CREV = [
    { a: [12, 80], u: () => !!crO(), t: ['Kommentháború', 'Comment war'], d: ['Egy ismeretlen fiók durván kritizál a csatornád alatt, és egyre többen csatlakoznak.', 'An anonymous account slams you under your channel, and more and more people join in.'], o: [
      O(['Visszaszólok keményen', 'Fire back hard'], [[2, ['Az éles válaszod bejárta a netet, és sokan melléd álltak.', 'Your sharp reply spread around, and many backed you.'], { fol: 12, hap: 3 }], [2, ['Az éles válasz visszaütött, sokan elfordultak.', 'The sharp reply backfired, and many turned away.'], { fol: -8, hap: -5 }]]),
      O(['Nem foglalkozom vele', 'Ignore it'], [[1, ['Elült a vihar, nem lett belőle ügy.', 'The storm blew over and nothing came of it.'], { hap: 1 }]]),
      O(['Moderálom a kommenteket', 'Moderate the comments'], [[1, ['Rendet tettél, a közösséged megkönnyebbült.', 'You cleaned up, and your community was relieved.'], { fol: -2, hap: 3 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Márkaajánlat', 'Brand offer'], d: ['Egy nagy márka sok pénzt ajánl egy olyan termék reklámozásáért, amiben nem hiszel.', 'A big brand offers a lot of money to promote a product you do not believe in.'], o: [
      O(['Elfogadom a pénzt', 'Take the money'], [[2, ['A pénz megjött, a közönség észre sem vette.', 'The money arrived and your audience did not even notice.'], { money: 6e5, hap: 2 }], [2, ['A közönség átlátott rajta, és hitelességet vesztettél.', 'Your audience saw through it and you lost credibility.'], { money: 6e5, fol: -10, hap: -4 }]]),
      O(['Visszautasítom', 'Turn it down'], [[1, ['Megőrizted a hitelességed, a követők értékelték.', 'You kept your credibility, and followers appreciated it.'], { fol: 4, hap: 3 }]]),
      O(['Alkudozom a feltételekről', 'Negotiate the terms'], [[1, ['Jobb feltételekkel, a saját stílusodban csinálhattad meg.', 'You got better terms and did it in your own style.'], { money: 3e5, fol: 2, hap: 3 }], [1, ['A márka kiszállt a tárgyalásból.', 'The brand walked away from the talks.'], { hap: -2 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Kiégés', 'Burnout'], d: ['Hónapok óta megállás nélkül gyártod a tartalmat, és kezdesz kimerülni.', 'You have been pumping out content nonstop for months, and you are running out of steam.'], o: [
      O(['Kiveszek egy kis szünetet', 'Take a short break'], [[1, ['Kipihented magad, bár a követők egy része elmaradt.', 'You rested up, though some followers drifted away.'], { hap: 8, fol: -8 }]]),
      O(['Hajtok tovább', 'Push through'], [[2, ['Kitartottál, és meglett az eredménye.', 'You persevered and it paid off.'], { fol: 10, hap: -4, hea: -3 }], [2, ['Összeroppantál, az egészséged megsínylette.', 'You broke down, and your health suffered.'], { hap: -8, hea: -8 }]]),
      O(['Felveszek egy vágót (200 e Ft)', 'Hire an editor (200k HUF)'], [[1, ['A vágó leveszi a terhet a válladról.', 'The editor takes the load off your shoulders.'], { money: -2e5, hap: 4, fol: 3 }]], 2e5)] },
    { a: [14, 80], u: () => !!crO(), t: ['Közös videó felkérés', 'Collab invitation'], d: ['Egy nálad sokkal nagyobb alkotó közös tartalmat javasol.', 'A creator far bigger than you proposes a joint piece of content.'], o: [
      O(['Benne vagyok!', 'I am in!'], [[2, ['A közös tartalom óriásit ment, sok új követőd lett.', 'The joint content blew up and brought many new followers.'], { fol: 25, hap: 6 }], [1, ['Kínos lett a közös munka, alig hozott valamit.', 'The collab turned out awkward and brought little.'], { fol: 2, hap: -2 }]]),
      O(['Inkább nem', 'Rather not'], [[1, ['Megmaradtál a saját utadon.', 'You stayed on your own path.'], { hap: 1 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Plágiumvád', 'Plagiarism claim'], d: ['Valaki azt állítja, hogy az egyik tartalmadat tőle másoltad.', 'Someone claims you copied one of your pieces from them.'], o: [
      O(['Bocsánatot kérek', 'Apologize'], [[1, ['A bocsánatkérést elfogadták, de maradt némi folt.', 'The apology was accepted, but a stain remained.'], { fol: -4, hap: -2 }]]),
      O(['Tagadom és bizonyítok', 'Deny and prove it'], [[2, ['Bizonyítottad, hogy az ötlet a tied, és a vád visszaütött rájuk.', 'You proved the idea was yours and the claim backfired on them.'], { fol: 8, hap: 4 }], [2, ['Nem tudtál meggyőzni mindenkit, sokan kételkednek.', 'You could not convince everyone, and many doubt you.'], { fol: -12, hap: -5 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Rajongói találkozó', 'Fan meet-up'], d: ['A követőid találkozót szerveznének veled.', 'Your followers would like to organize a meet-up with you.'], o: [
      O(['Megszervezem (150 e Ft)', 'Organize it (150k HUF)'], [[3, ['Remek hangulat, a rajongók imádtak!', 'A great mood, and the fans loved it!'], { money: -1.5e5, fol: 12, hap: 8 }], [1, ['Kevesen jöttek el, kicsit csalódott vagy.', 'Few showed up, and you are a bit disappointed.'], { money: -1.5e5, hap: -3 }]], 1.5e5),
      O(['Most nem érek rá', 'No time right now'], [[1, ['Elhalasztottad, a követők megértették.', 'You postponed it and the followers understood.'], {}]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Algoritmusváltás', 'Algorithm change'], d: ['Az egyik platform megváltoztatta az ajánlórendszerét, és visszaesett az elérésed.', 'One of the platforms changed its recommendation system and your reach dropped.'], o: [
      O(['Alkalmazkodom', 'Adapt'], [[3, ['Megtaláltad az új működést, és újra nőni kezdtél.', 'You figured out the new system and started growing again.'], { fol: 10, hap: -1 }], [1, ['Hiába próbálkoztál, nem jött be.', 'Your efforts did not pay off.'], { hap: -3 }]]),
      O(['Kivárom', 'Wait it out'], [[1, ['Idővel helyreállt az elérésed, de sokat vesztettél.', 'Your reach recovered over time, but you lost a lot.'], { fol: -6 }]])] },
    { a: [14, 80], u: () => !!crO(), t: ['Gyűlöletkommentek', 'Hate comments'], d: ['Egy szervezett támadás miatt sok gyűlöletkomment érkezett, és ez megvisel.', 'A coordinated attack brought many hate comments, and it is wearing you down.'], o: [
      O(['Pszichológushoz fordulok (100 e Ft)', 'See a psychologist (100k HUF)'], [[1, ['A beszélgetések sokat segítettek.', 'The sessions helped a lot.'], { money: -1e5, hap: 7 }]], 1e5),
      O(['Elbírom egyedül', 'I will cope alone'], [[1, ['Átvészelted, de megviselt.', 'You got through it, but it took a toll.'], { hap: -5 }]])] },
    { a: [14, 80], u: () => hasN('game'), t: ['Játékfejlesztő meghívó', 'Game developer invite'], d: ['Egy stúdió korai hozzáférést ad a következő játékukhoz, ha bemutatod a csatornádon.', 'A studio offers early access to their next game if you showcase it on your channel.'], o: [
      O(['Elfogadom', 'Accept'], [[2, ['Elsőként mutattad be, és sokan téged néztek.', 'You were first to show it, and many watched you.'], { fol: 14, money: 2e5, hap: 5 }], [1, ['A játék gyenge lett, a közönség csalódott.', 'The game was weak and the audience was disappointed.'], { fol: -3, money: 2e5 }]]),
      O(['Nem érdekel', 'Not interested'], [[1, ['Kihagytad a lehetőséget.', 'You passed on the opportunity.'], {}]])] },
    { a: [14, 80], u: () => hasN('cook'), t: ['Étterem meghívás', 'Restaurant invitation'], d: ['Egy étterem ingyen vendégül lát, ha bemutatod a konyhájukat.', 'A restaurant hosts you for free if you feature their kitchen.'], o: [
      O(['Elmegyek forgatni', 'Go and film'], [[2, ['Finom ételek, remek tartalom!', 'Delicious food and great content!'], { fol: 12, hap: 5 }], [1, ['Az étel gyenge volt, kínos volt dicsérni.', 'The food was poor, and praising it felt awkward.'], { fol: -3, hap: -2 }]]),
      O(['Inkább otthon főzök', 'I will cook at home'], [[1, ['Maradtál a saját receptjeidnél.', 'You stuck to your own recipes.'], { hap: 2 }]])] },
    { a: [14, 80], u: () => hasN('edu') || hasN('tech'), t: ['Iskolák felkérése', 'Schools invite you'], d: ['Iskolák hívnak előadni a tudásodról.', 'Schools invite you to give talks about what you know.'], o: [
      O(['Vállalom', 'I will do it'], [[1, ['Szép bevétel és hálás diákok.', 'Nice income and grateful students.'], { money: 3e5, hap: 5, fol: 4 }]]),
      O(['Nincs rá időm', 'I have no time'], [[1, ['Elengedted az alkalmat.', 'You let the chance go.'], {}]])] },
    { a: [14, 80], u: () => hasN('fashion') || hasN('beauty'), t: ['Divatbemutató meghívó', 'Fashion show invite'], d: ['Meghívnak egy híres divatbemutatóra.', 'You are invited to a famous fashion show.'], o: [
      O(['Elmegyek (80 e Ft)', 'Go (80k HUF)'], [[2, ['Rengeteg új kapcsolat és követő!', 'Lots of new contacts and followers!'], { money: -8e4, fol: 20, hap: 6 }], [1, ['Nem figyeltek fel rád, drága este volt.', 'Nobody noticed you, and it was an expensive night.'], { money: -8e4, hap: -3 }]], 8e4),
      O(['Kihagyom', 'Skip it'], [[1, ['Otthon maradtál.', 'You stayed home.'], {}]])] },
    { a: [14, 80], u: () => hasN('fit'), t: ['Sérülés forgatás közben', 'Injury while filming'], d: ['Egy edzésvideó közben megsérültél.', 'You got hurt while filming a workout video.'], o: [
      O(['Pihenek, kezeltetem', 'Rest and get treated'], [[1, ['Rendbe jöttél, és őszintén beszéltél róla a közönségnek.', 'You recovered and talked honestly about it with your audience.'], { hea: -2, hap: 1, fol: 5 }]]),
      O(['Folytatom a forgatást', 'Keep filming'], [[1, ['A sérülés súlyosabb lett.', 'The injury got worse.'], { hea: -9, hap: -4, fol: 6 }]])] },
    { a: [14, 80], u: () => hasN('travel'), t: ['Utazási szponzor', 'Travel sponsor'], d: ['Egy utazási iroda fizetett útra hív, ha bemutatod az úticélt.', 'A travel agency invites you on a paid trip if you present the destination.'], o: [
      O(['Indulok!', 'Count me in!'], [[1, ['Csodás utazás és nagyszerű tartalom.', 'A wonderful trip and great content.'], { fol: 15, hap: 8, money: 1e5 }]]),
      O(['Inkább nem', 'Rather not'], [[1, ['Nem mentél.', 'You did not go.'], {}]])] },
    { a: [14, 80], u: () => hasN('music'), t: ['Szerzői jogi bejelentés', 'Copyright claim'], d: ['Egy videódat szerzői jogi panasz miatt letiltották.', 'One of your videos was blocked over a copyright complaint.'], o: [
      O(['Törlöm a videót', 'Delete the video'], [[1, ['Elült az ügy, de elveszett egy jó videó.', 'The matter ended, but a good video was lost.'], { fol: -3, hap: -2 }]]),
      O(['Vitatom a döntést', 'Dispute it'], [[1, ['Igazad lett, a videó újra elérhető.', 'You were right, and the video is back.'], { fol: 6, hap: 3 }], [1, ['Elvesztetted a vitát.', 'You lost the dispute.'], { fol: -6, hap: -4 }]])] },
    { a: [16, 80], u: () => !!crO() && !!p.side, t: ['Munkatársak felismernek', 'Coworkers recognize you'], d: ['A mellékállásodban a kollégák rájöttek, hogy te vagy az a népszerű alkotó.', 'At your side job your coworkers figured out you are that popular creator.'], o: [
      O(['Büszkén vállalom', 'Own it proudly'], [[1, ['A kollégák szurkolnak neked, és megosztják a tartalmaid.', 'Your coworkers cheer you on and share your content.'], { fol: 8, hap: 5 }]]),
      O(['Letagadom', 'Deny it'], [[1, ['Lebuktál, és ez kínos volt.', 'You got caught and it was awkward.'], { hap: -3 }]])] },
    { a: [14, 80], u: () => !!p.inf && isBiz(), t: ['A követőid a cégedre kíváncsiak', 'Followers curious about your company'], d: ['A követőid sokat kérdeznek a vállalkozásodról, és vásárolnának tőled.', 'Your followers keep asking about your business and would love to buy from you.'], o: [
      O(['Nagy kampányt indítok (200 e Ft)', 'Launch a big campaign (200k HUF)'], [[3, ['A kampány betalált, megugrott a forgalom!', 'The campaign hit, and sales jumped!'], { money: -2e5, perf: 12, hap: 5 }], [1, ['A kampány nem hozott sokat.', 'The campaign did not bring much.'], { money: -2e5, perf: 3 }]], 2e5),
      O(['Marad a külön tartalom', 'Keep content separate'], [[1, ['A csatorna megőrizte a hitelességét.', 'Your channel kept its authenticity.'], { fol: 3, perf: 2 }]])] }
  ];
  window.CREV = CREV;
})();
