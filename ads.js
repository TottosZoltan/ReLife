// Hirdetés réteg (AdMob: alsó szalaghirdetés + jutalmazott videó). Csak a natív appban működik, böngészőben nem csinál semmit.
// Működés: ha meghalsz, a "Második esély" gombbal megnézhetsz egy hirdetést, és életben maradsz (életenként egyszer).
//
// ÉLESÍTÉSHEZ: állítsd az isTesting értékét false-ra. Fejlesztés közben hagyd true-n (Google teszthirdetés),
// mert a saját éles hirdetésedre kattintgatni tilos, kitilthatnak miatta.
(function () {
  const AdMob = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob;
  if (!AdMob) return;

  const CFG = {
    isTesting: true,
    rewardedId: 'ca-app-pub-3289948892121330/4544949853',      // a SAJÁT jutalmazott hirdetési egységed
    testRewardedId: 'ca-app-pub-3940256099942544/5224354917',  // Google teszt egység (Android)
    bannerId: 'ca-app-pub-3289948892121330/6277843087',        // a SAJÁT szalaghirdetési egységed
    testBannerId: 'ca-app-pub-3940256099942544/6300978111',    // Google teszt szalag (Android)
    bannerAfterMinutes: 5                                     // ennyi perccel az első indítás előtt SOHA nem jelenik meg szalag (tesztelésnél állítsd 0-ra)
  };
  const adId = () => CFG.isTesting ? CFG.testRewardedId : CFG.rewardedId;

  let ready = false, rewarded = false;
  const btn = document.getElementById('revive'), end = document.getElementById('end');

  async function prepare() {
    ready = false;
    try { await AdMob.prepareRewardVideoAd({ adId: adId(), isTesting: CFG.isTesting }); ready = true; }
    catch (e) { ready = false; }
    refresh();
  }
  async function showRewarded() {
    if (!ready) return false;
    rewarded = false; ready = false;
    let res = null;
    try { res = await AdMob.showRewardVideoAd(); } catch (e) {}
    const ok = rewarded || !!(res && (res.amount != null || res.type != null));
    prepare();
    return ok;
  }
  function refresh() {
    if (!btn) return;
    const can = typeof p !== 'undefined' && p && p.dead && !p.revived;
    btn.hidden = !(can && ready);
    btn.textContent = T(['📺 Második esély (hirdetés megnézése)', '📺 Second chance (watch an ad)']);
  }

  btn && (btn.onclick = async () => {
    if (!p || !p.dead || p.revived) return;
    btn.disabled = true;
    const ok = await showRewarded();
    btn.disabled = false;
    if (!ok) return;
    p.revived = 1; p.dead = false; p.sick = null; p.hea = Math.max(p.hea, 45);
    lg(T(['A hirdetés után egy második esélyt kaptál: visszatértél az életbe.', 'After the ad you got a second chance and came back to life.']), 'good');
    end.hidden = true;
    render();
  });

  // a halál utáni képernyő megjelenésekor frissítsük a gombot
  if (end) new MutationObserver(refresh).observe(end, { attributes: true, attributeFilter: ['hidden'] });

  // Szalaghirdetés az app alján (adaptív: mindig a teljes szélességet kitölti, középre igazítva).
  // Szabály: csak JÁTÉK KÖZBEN látszik (főmenüben és karakterkészítőben soha), és csak akkor,
  // ha az app első indítása óta eltelt legalább CFG.bannerAfterMinutes perc.
  function setBannerSpace(px) {
    document.documentElement.style.setProperty('--ad', px + 'px');
    document.body.classList.toggle('ad', px > 0);
  }
  let firstTs = Date.now();
  try {
    const v = +localStorage.getItem('relife_first');
    if (v > 0) firstTs = v; else localStorage.setItem('relife_first', String(firstTs));
  } catch (e) {}
  const eligible = () => Date.now() - firstTs >= CFG.bannerAfterMinutes * 60000;
  const inGame = () => { const t = document.getElementById('title'), c = document.getElementById('create'); return !!t && !!c && t.hidden && c.hidden; };

  let bannerOn = false, bannerBusy = false, listening = false;
  async function showBanner() {
    if (bannerOn || bannerBusy) return;
    bannerBusy = true;
    try {
      if (!listening) {
        listening = true;
        AdMob.addListener('bannerAdSizeChanged', e => { if (bannerOn && e && e.height > 0) setBannerSpace(Math.ceil(e.height)); });
        AdMob.addListener('bannerAdLoaded', () => { if (bannerOn && !document.body.classList.contains('ad')) setBannerSpace(56); });
        AdMob.addListener('bannerAdFailedToLoad', () => setBannerSpace(0));
      }
      bannerOn = true;
      await AdMob.showBanner({ adId: CFG.isTesting ? CFG.testBannerId : CFG.bannerId, adSize: 'ADAPTIVE_BANNER', position: 'BOTTOM_CENTER', margin: 0, isTesting: CFG.isTesting });
    } catch (e) { bannerOn = false; setBannerSpace(0); }
    bannerBusy = false;
    if (!bannerOn) { try { await AdMob.removeBanner(); } catch (e) {} }   // közben elhagytuk a játékot
    else if (!(eligible() && inGame())) hideBanner();
  }
  async function hideBanner() {
    if (!bannerOn) return;
    bannerOn = false; setBannerSpace(0);
    try { await AdMob.removeBanner(); } catch (e) {}
  }
  function updateBanner() { (eligible() && inGame()) ? showBanner() : hideBanner(); }

  // képernyőváltáskor (főmenü / karakterkészítő / játék) azonnal frissítünk
  ['title', 'create'].forEach(id => { const el = document.getElementById(id); if (el) new MutationObserver(updateBanner).observe(el, { attributes: true, attributeFilter: ['hidden'] }); });
  // ha még nem telt el az idő, akkor a lejáratkor ellenőrzünk újra
  if (!eligible()) setTimeout(updateBanner, CFG.bannerAfterMinutes * 60000 - (Date.now() - firstTs) + 1000);

  (async function init() {
    try { await AdMob.initialize({ initializeForTesting: CFG.isTesting }); } catch (e) {}
    updateBanner();
    try { AdMob.addListener('onRewardedVideoAdReward', () => { rewarded = true; }); } catch (e) {}
    try { AdMob.addListener('onRewardedVideoAdDismissed', () => { setTimeout(prepare, 300); }); } catch (e) {}
    prepare();
  })();
})();
