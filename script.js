// ===== ReLife — szöveges életszimulátor =====
const $ = s => document.querySelector(s);
const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const P = a => a[R(0, a.length - 1)];
const cl = v => Math.max(0, Math.min(100, v));
let LANG = 'hu'; try { LANG = localStorage.getItem('relife_lang') == 'en' ? 'en' : 'hu'; } catch (e) {}
const T = x => Array.isArray(x) ? x[LANG == 'en' ? 1 : 0] : x;
const dn = n => LANG == 'en' ? n.split(' ').reverse().join(' ') : n;
const ROLE_EN = { Anya: 'Mother', Apa: 'Father', 'Testvér': 'Sibling', 'Barát': 'Friend', 'Párod': 'Partner', 'Házastárs': 'Spouse', Gyerek: 'Child', 'Osztálytárs': 'Classmate', 'Munkatárs': 'Coworker', 'Szomszéd': 'Neighbor', 'Riválisod': 'Rival', Mentor: 'Mentor' };
const rl = r => LANG == 'en' ? (ROLE_EN[r] || r) : r;
const DRIFT = ['Barát', 'Osztálytárs', 'Munkatárs', 'Szomszéd', 'Riválisod', 'Mentor'];
let pend = null;
const fill = s => pend ? s.replace(/\{n\}/g, dn(pend.n)).replace(/\{f\}/g, dn(pend.n).split(' ')[0]).replace(/\{s\}/g, schName(pend.sch)) : s;
const exl = role => p.rel.filter(r => r.alive && role.split(',').includes(r.role) && r.age >= 18);
const mkNpc = o => { const g = P(['f', 'm']); return { n: `${P(SN)} ${P(g == 'f' ? NF : NM)}`, role: o.role, age: o.a ? R(o.a[0], o.a[1]) : Math.max(3, p.age + R(o.r[0], o.r[1])), bond: 40, alive: true }; };
const NF = ['Anna', 'Hanna', 'Lili', 'Zsófia', 'Emma', 'Nóra', 'Boglárka', 'Dóra', 'Réka', 'Vivien', 'Luca', 'Eszter', 'Panna', 'Kinga', 'Fanni', 'Bianka'];
const NM = ['Bence', 'Máté', 'Levente', 'Dániel', 'Marcell', 'Ádám', 'Zalán', 'Patrik', 'Balázs', 'Gergő', 'Olivér', 'Kristóf', 'Milán', 'Tamás', 'Noel', 'Barnabás'];
const SN = ['Kovács', 'Tóth', 'Szabó', 'Németh', 'Farkas', 'Horváth', 'Varga', 'Kiss', 'Molnár', 'Balogh', 'Papp', 'Takács', 'Juhász', 'Lakatos', 'Mészáros', 'Simon'];
const ST = { hap: ['😊', ['Boldog', 'Happy']], hea: ['❤️', ['Egészség', 'Health']], sma: ['🧠', ['Okos', 'Smart']], loo: ['✨', ['Kinézet', 'Looks']] };
const fmt = n => { const a = Math.abs(n), en = LANG == 'en'; return (n < 0 ? '−' : '') + (a >= 1e6 ? (a / 1e6).toFixed(1).replace('.', en ? '.' : ',') + ' M Ft' : Math.round(a / 1e3) + (en ? ' k Ft' : ' e Ft')); };
const EDU = [['Általános', 'Primary'], ['Érettségi', 'High school'], ['Diploma', 'Degree']];
let p, tab = null, relOpen = null, sub = null, lastPlace = null, goAdopt = false, adSel = null;
const hasCar = () => p.assets.some(x => x.t == 'car'), hasHouse = () => p.assets.some(x => x.t == 'house'), kidsU = () => kids().filter(k => k.age < 18);
const driver = () => p.lic && hasCar(); // autós események csak jogosítvánnyal ÉS autóval
const can = c => !c || p.money >= c; const roll = w => Math.random() < w, worst = t => p.assets.filter(x => x.t == t).reduce((m, x) => Math.min(m, x.cond == null ? 80 : x.cond), 100), hasIns = t => p.assets.some(x => x.ins && (x.t == t || (t == 'car' && x.t == 'bike'))), netw = () => p.money + (p.sav || 0) + p.assets.reduce((q, x) => q + x.v, 0) + (p.inv || 0) + (p.cry || 0) - (p.debt || 0); // ingyenes dolog mindig elérhető, mínuszban is
const NR = ['Barát', 'Osztálytárs', 'Munkatárs', 'Szomszéd', 'Mentor', 'Anya', 'Apa', 'Testvér', 'Párod', 'Házastárs'], AR = NR.concat('Gyerek'), LOVE = ['Párod', 'Házastárs'];

// ----- adatok -----
const JOBS = [
  { n: 'Pincér', e: 0, s: 0, pay: 3e6 }, { n: 'Eladó', e: 0, s: 0, pay: 3.4e6 },
  { n: 'Raktáros', e: 0, s: 10, pay: 3.8e6 },
  { n: 'Szakács', e: 1, s: 30, pay: 4.4e6 }, { n: 'Villanyszerelő', e: 1, s: 40, pay: 5.4e6 },
  { n: 'Tanár', e: 2, s: 50, c: 1, pay: 5.8e6 }, { n: 'Programozó', e: 2, s: 60, pay: 10e6 },
  { n: 'Ügyvéd', e: 2, s: 65, c: 1, pay: 12e6 }, { n: 'Orvos', e: 2, s: 75, c: 1, pay: 14e6 }, { n: 'Ápoló', e: 1, s: 40, pay: 4.6e6 }, { n: 'Mérnök', e: 2, s: 60, pay: 8e6 }, { n: 'Pilóta', e: 2, s: 70, l: 50, c: 1, pay: 16e6 }
];
JOBS.push(
  { n: 'Takarító', e: 0, s: 0, pay: 2.8e6 }, { n: 'Futár', e: 0, s: 0, pay: 3.2e6 }, { n: 'Pék', e: 0, s: 15, pay: 3.5e6 },
  { n: 'Biztonsági őr', e: 0, s: 5, pay: 3.6e6 }, { n: 'Sofőr', e: 0, s: 10, pay: 4.2e6, lic: 1 }, { n: 'Fodrász', e: 1, s: 20, l: 40, pay: 4.2e6 },
  { n: 'Buszvezető', e: 1, s: 20, pay: 4.8e6, lic: 1 }, { n: 'Katona', e: 1, s: 30, c: 1, pay: 5.5e6 }, { n: 'Rendőr', e: 1, s: 35, c: 1, pay: 5.2e6, lic: 1 },
  { n: 'Tűzoltó', e: 1, s: 40, c: 1, pay: 5e6 }, { n: 'Grafikus', e: 1, s: 45, pay: 5.6e6 }, { n: 'Újságíró', e: 2, s: 50, pay: 6e6 },
  { n: 'Könyvelő', e: 2, s: 50, pay: 7e6 }, { n: 'Építész', e: 2, s: 60, pay: 9e6 }, { n: 'Pszichológus', e: 2, s: 65, c: 1, pay: 8.5e6 },
  { n: 'Gyógyszerész', e: 2, s: 65, pay: 9.5e6 }, { n: 'Kutató', e: 2, s: 75, pay: 11e6 }
);
const MS = { 3: 'Elkezdted az óvodát.', 6: 'Elkezdted az általános iskolát.', 14: 'Gimnáziumba kerültél.' };
const QUIET = ['Nyugodt év volt.', 'Semmi különös nem történt.', 'Telt-múlt az idő.', 'Egy átlagos év.'];
const UNI = { t: 'Érettségi után', d: 'Letetted az érettségit. Mi legyen a következő lépés?', o: [
  ['Egyetemre megyek', [[1, 'Felvettek az egyetemre!', { uni: 1, hap: 8 }]]],
  ['Munkát keresek', [[1, 'Kilépsz a nagybetűs életbe.', { hap: 3 }]]]] };

// döntéses események: o = [felirat, [[súly, szöveg, hatás], ...], minimum pénz?]
const CH = [
  { a: [14, 17], t: 'Rossz társaság', d: 'A suli mögött a menő srácok cigivel kínálnak.', o: [
    ['Elszívom', [[1, 'Rászoktál a dohányzásra.', { hea: -12, hap: 8 }]]],
    ['Nem kérek, kösz', [[1, 'Kinevettek, de büszke vagy magadra.', { hap: -6, sma: 4 }]]]] },
  { a: [10, 17], t: 'Dolgozat', d: 'Holnap nehéz dolgozatot írtok, de nem tanultál. Puskázol?', o: [
    ['Puskázok', [[2, 'Nem vették észre. Ötös!', { hap: 5, sma: -2 }], [1, 'Rajtakaptak! Intő és szégyen.', { hap: -12, sma: -3 }]]],
    ['Inkább tanulok', [[1, 'Késő éjszakáig tanultál, de megérte.', { sma: 7, hap: -4 }]]]] },
  { a: [16, 28], t: 'Pénteki buli', d: 'Hatalmas buli lesz, de hétfőn felelned kell.', o: [
    ['Bulizom hajnalig', [[1, 'Felejthetetlen éjszaka!', { hap: 15, hea: -4, sma: -3 }]]],
    ['Otthon tanulok', [[1, 'Unalmas volt, de felkészültél.', { sma: 7, hap: -8 }]]]] },
  { a: [22, 50], t: 'KockaCoin', d: 'Egy haver „tuti” kriptót ajánl. Beszállsz 500 e Ft-tal?', o: [
    ['Beszállok', [[1, 'A KockaCoin az egekbe lőtt!', { money: 1.5e6, hap: 10 }], [1, 'A kripto becsődölt.', { money: -5e5, hap: -15 }]], 5e5],
    ['Kihagyom', [[1, 'Okosan döntöttél.', { sma: 3 }]]]] },
  { a: [12, 70], t: 'Elveszett pénztárca', d: 'Találtál egy pénztárcát, benne 120 e Ft-tal.', o: [
    ['Megtartom', [[1, 'A lelkiismereted nem hagy nyugodni.', { money: 12e4, hap: -8 }]]],
    ['Leadom a rendőrségen', [[1, 'A tulajdonos nagyon hálás volt.', { hap: 10 }]]]] },
  { a: [30, 90], t: 'Gyanús hívás', d: 'Egy „banki ügyintéző” elkéri az adataidat.', o: [
    ['Megadom', [[1, 'Átverés volt! Kiürítették a számládat.', { money: -8e5, hap: -15 }]]],
    ['Leteszem', [[1, 'Okosan leraktad.', { sma: 2 }]]]] },
  { a: [7, 13], u: () => !p.pet, t: 'Kisállat', d: 'Nagyon vágysz egy kisállatra. Megkéred a szüleidet?', o: [
    ['Kérem', [[2, 'A szüleid beleegyeztek, választhatsz egy kisállatot!', { hap: 8, adopt: 0 }], [1, 'Nemet mondtak.', { hap: -6 }]]],
    ['Inkább nem', [[1, 'Lemondtál róla.', { hap: 1 }]]]] },
  { a: [40, 80], t: 'Szűrővizsgálat', d: 'Esedékes az éves szűrővizsgálatod.', o: [
    ['Elmegyek (200 e Ft)', [[1, 'Időben kiszúrták a bajt.', { money: -2e5, hea: 8 }]], 2e5],
    ['Halogatom', [[2, 'Nem lett belőle baj.', { hap: 2 }], [1, 'Később súlyos betegség derült ki.', { hea: -22 }]]]] },
  { a: [20, 40], t: 'Külföldi állás', d: 'Bécsben jól fizető állást ajánlanak.', o: [
    ['Kimegyek', [[1, 'Három év alatt szépen spóroltál.', { money: 4e6, hap: -8 }]]],
    ['Itthon maradok', [[1, 'Itthon jó neked.', { hap: 6 }]]]] },
  { a: [15, 35], t: 'Balaton', d: 'A haverok nyaralni mennek a Balatonra.', o: [
    ['Megyek (100 e Ft)', [[1, 'Fürdés, lángos, napfény.', { money: -1e5, hap: 14, loo: 2 }]], 1e5],
    ['Otthon maradok', [[1, 'Kihagytad.', { hap: -3 }]]]] },
  { a: [22, 60], u: () => p.job, t: 'Túlóra', d: 'A főnök túlórát kér tőled.', o: [
    ['Vállalom', [[2, 'Észrevették! Béremelést kaptál.', { raise: .1, hap: -6 }], [1, 'Csak kimerültél.', { hap: -10, hea: -4 }]]],
    ['Nem vállalom', [[1, 'Időben hazamentél.', { hap: 3 }]]]] },
  { a: [6, 14], t: 'Iskolai zaklatás', d: 'Látod, hogy egy osztálytársadat bántják.', o: [
    ['Közbelépek', [[2, 'Kiálltál mellette, barátok lettetek.', { hap: 8, hea: -3 }], [1, 'Téged is bántani kezdtek.', { hap: -10, hea: -5 }]]],
    ['Elfordulok', [[1, 'Rossz érzés maradt benned.', { hap: -6 }]]]] },
  { a: [18, 30], u: () => !p.lic, t: 'Jogosítvány', d: 'Letennéd a jogosítványt? A vizsga 150 e Ft.', o: [
    ['Igen', [[3, 'Elsőre átmentél! Megvan a jogosítványod.', { money: -15e4, hap: 10, lic: 1 }], [1, 'Elbuktál, újra kell próbálni.', { money: -15e4, hap: -8 }]], 15e4],
    ['Később', [[1, 'Még vársz vele.', { hap: -1 }]]]] },
  { a: [19, 35], t: 'Tetoválás', d: 'Egy tetováló stúdió előtt állsz. 50 e Ft.', o: [
    ['Csináltatok', [[1, 'Menő lett!', { money: -5e4, loo: 5, hap: 6 }]], 5e4],
    ['Inkább nem', [[1, 'A bőröd tiszta maradt.', { hap: 1 }]]]] },
  { a: [35, 60], u: () => p.lic, t: 'Életközepi válság', d: 'Megtetszik egy sportautó. 10 M Ft.', o: [
    ['Megveszem', [[1, 'Szuper érzés! Jól áll neked.', { money: -1e7, hap: 15, loo: 4, sportcar: 1 }]], 1e7],
    ['Józan maradok', [[1, 'A válság elmúlt.', { hap: -2 }]]]] },
  { a: [18, 80], u: () => driver(), t: 'Gyorshajtás', d: 'Késésben vagy, az út üres.', o: [
    ['Ráfekszem a gázra', [[2, 'Időben odaértél.', { hap: 5 }], [1, 'Megbüntettek gyorshajtásért.', { money: -3e5, hap: -6 }]]],
    ['Betartom a szabályt', [[1, 'Kicsit késtél, de nyugodt maradtál.', { hap: -1 }]]]] }
];
CH.push(
  { a: [6, 17], np: { role: 'Osztálytárs', r: [-1, 1] }, t: ['Új barát?', 'A new friend?'], d: ['{n} odajön hozzád a szünetben, és barátkozni szeretne.', '{n} comes over during break and wants to be your friend.'], o: [
    [['Szívesen!', 'Sure!'], [[3, ['{n} és te hamar jó barátok lettetek.', 'You and {n} quickly became good friends.'], { hap: 8, npc: ['Barát', 55] }], [1, ['{n} kicsit tolakodó, de lett egy új ismerősöd.', '{n} is a bit pushy, but you gained a new acquaintance.'], { hap: 2, npc: ['Osztálytárs', 35] }]]],
    [['Lassan ismerkedem', 'Take it slowly'], [[1, ['Lassan ismerkedtetek, de idővel jó barátság lett belőle.', 'You took it slowly, but it grew into a good friendship.'], { hap: 3, npc: ['Osztálytárs', 50] }]]],
    [['Nem érdekel', 'Not interested'], [[1, ['{n} szomorúan elsétált. Rossz érzés maradt benned.', '{n} walked away looking sad. It left you with a bad feeling.'], { hap: -4 }]]]] },
  { a: [10, 17], np: { role: 'Osztálytárs', r: [-1, 1] }, t: ['Csoportmunka', 'Group project'], d: ['A csoportmunkában {n} egy ujjal sem nyúl a feladathoz.', '{n} is not doing any work on the group project.'], o: [
    [['Megcsinálom helyette', 'Do it for them'], [[1, ['Mindent elkészítettél, {n} hálás volt.', 'You finished everything, and {n} was grateful.'], { sma: 3, hap: -4, npc: ['Osztálytárs', 50] }]]],
    [['Szólok a tanárnak', 'Tell the teacher'], [[1, ['A tanár beszélt vele, de {n} haragszik rád.', 'The teacher talked to {n}, who is now angry with you.'], { hap: -3, npc: ['Riválisod', 15] }]]],
    [['Leülök beszélgetni vele', 'Sit down and talk'], [[2, ['Kiderült, hogy {n} otthon nehéz helyzetben van. Megértettétek egymást.', 'It turned out {n} had problems at home. You understood each other.'], { hap: 6, npc: ['Barát', 50] }], [1, ['A beszélgetés nem sokat ért.', 'The talk did not help much.'], { hap: -2, npc: ['Osztálytárs', 30] }]]]] },
  { a: [8, 17], np: { role: 'Riválisod', r: [-1, 2] }, t: ['Kigúnyolás', 'Mocking'], d: ['{n} a folyosón mindenki előtt kigúnyol.', '{n} mocks you in the hallway in front of everyone.'], o: [
    [['Visszaszólok', 'Talk back'], [[2, ['Mindenki nevetett, de {n} többet nem kötött beléd.', 'Everyone laughed, and {n} never bothered you again.'], { hap: 5, npc: ['Riválisod', 20] }], [1, ['Verekedés lett belőle. Igazgatói intőt kaptál.', 'It turned into a fight. You got a detention.'], { hap: -10, hea: -4, npc: ['Riválisod', 5] }]]],
    [['Nem törődöm vele', 'Ignore it'], [[1, ['Nem adtál neki okot a nevetésre, és {n} hamar megunta.', 'You gave no reaction, and {n} soon got bored.'], { sma: 2 }]]],
    [['Szólok a tanárnak', 'Tell the teacher'], [[1, ['{n} figyelmeztetést kapott, de a többiek besúgónak tartanak.', '{n} got a warning, but others now call you a snitch.'], { hap: -3, npc: ['Riválisod', 10] }]]]] },
  { a: [4, 12], np: { role: 'Szomszéd', r: [-2, 2] }, t: ['Új szomszéd', 'New neighbor'], d: ['Egy új gyerek költözött a szomszédba: {n}. A kertben látod meg.', 'A new kid, {n}, moved in next door. You spot them in the garden.'], o: [
    [['Átmegyek játszani', 'Go over and play'], [[3, ['Egész délután játszottatok. Barátok lettetek!', 'You played all afternoon and became friends!'], { hap: 9, npc: ['Barát', 55] }]]],
    [['Elbújok', 'Hide'], [[1, ['Szégyenlős voltál. Talán majd legközelebb.', 'You felt shy. Maybe next time.'], { hap: -2 }]]]] },
  { a: [6, 14], np: { role: 'Osztálytárs', r: [-1, 1] }, t: ['Szülinapi meghívó', 'Birthday invitation'], d: ['{n} meghív a szülinapi bulijára.', '{n} invites you to a birthday party.'], o: [
    [['Elmegyek', 'Go'], [[2, ['Remekül éreztétek magatokat!', 'You had a great time!'], { hap: 9, npc: ['Barát', 50] }], [1, ['Unalmas volt, de legalább tortát ettél.', 'It was boring, but at least you had cake.'], { hap: 2, npc: ['Osztálytárs', 40] }]]],
    [['Nem megyek', 'Skip it'], [[1, ['Otthon maradtál, {n} csalódott volt.', 'You stayed home, and {n} was disappointed.'], { hap: -3 }]]]] },
  { a: [12, 17], np: { role: 'Mentor', a: [28, 60] }, t: ['Segítő tanár', 'Helpful teacher'], d: ['Az egyik tanárod, {n} észrevette a tehetségedet, és plusz segítséget ajánl.', 'One of your teachers, {n}, noticed your talent and offers extra help.'], o: [
    [['Elfogadom', 'Accept'], [[1, ['{n} sokat tanított neked.', '{n} taught you a lot.'], { sma: 8, hap: 2, npc: ['Mentor', 60] }]]],
    [['Nem szeretnék', 'No thanks'], [[1, ['Kihagytad a lehetőséget.', 'You passed on the opportunity.'], { hap: -1 }]]]] },
  { a: [15, 18], np: { role: 'Osztálytárs', r: [-1, 1] }, t: ['Fagyizás', 'Ice cream'], d: ['{n} fagyizni hív a suli után.', '{n} asks you out for ice cream after school.'], o: [
    [['Elmegyek', 'Go'], [[2, ['Remek délutánt töltöttetek együtt.', 'You spent a lovely afternoon together.'], { hap: 10, npc: ['Barát', 60] }], [1, ['Kínos csend volt, de {n} kedves volt.', 'It was awkward, but {n} was kind.'], { hap: -2, npc: ['Osztálytárs', 35] }]]],
    [['Nemet mondok', 'Say no'], [[1, ['Udvariasan elutasítottad.', 'You politely declined.'], { hap: -1 }]]]] },
  { a: [18, 60], u: () => p.job, np: { role: 'Munkatárs', r: [-8, 8] }, t: ['Új kolléga', 'New coworker'], d: ['{n} új kolléga, és ebédre hív.', '{n} is a new coworker and invites you to lunch.'], o: [
    [['Megyek', 'Join'], [[2, ['Jót beszélgettetek, jobb lett a munkahelyi hangulat.', 'You had a nice chat and the mood at work improved.'], { hap: 6, npc: ['Munkatárs', 55] }], [1, ['Csak munkáról volt szó.', 'It was all work talk.'], { hap: 1, npc: ['Munkatárs', 35] }]]],
    [['Nem érek rá', 'Too busy'], [[1, ['Kihagytad a társasági életet.', 'You skipped the social side of work.'], { hap: -1 }]]]] },
  { a: [22, 60], u: () => p.job, np: { role: 'Riválisod', r: [-6, 6] }, t: ['Ellopott ötlet', 'Stolen idea'], d: ['{n} a saját nevén adta le az ötletedet.', '{n} presented your idea as their own.'], o: [
    [['Szembeszállok vele', 'Confront them'], [[1, ['Kiderült az igazság, téged dicsértek.', 'The truth came out and you got the praise.'], { raise: .05, hap: 3, npc: ['Riválisod', 10] }], [1, ['Nem hittek neked.', 'Nobody believed you.'], { hap: -8, npc: ['Riválisod', 5] }]]],
    [['Hagyom', 'Let it go'], [[1, ['Nyeltél egyet, de feszült lett a hangulat.', 'You swallowed it, but things got tense.'], { hap: -6, npc: ['Riválisod', 15] }]]]] },
  { a: [20, 45], u: () => p.job, np: { role: 'Mentor', a: [40, 60] }, t: ['Mentor', 'Mentor'], d: ['{n}, egy tapasztalt kolléga mentorálni szeretne.', '{n}, an experienced colleague, offers to mentor you.'], o: [
    [['Elfogadom', 'Accept'], [[1, ['{n} sokat segített a karrieredben.', '{n} helped your career a lot.'], { sma: 4, raise: .07, hap: 4, npc: ['Mentor', 60] }]]],
    [['Majd egyedül', 'I will manage'], [[1, ['Egyedül is megoldottad.', 'You managed on your own.'], { hap: 1 }]]]] },
  { a: [20, 80], np: { role: 'Szomszéd', a: [25, 75] }, t: ['Kölcsönkérés', 'Borrowing'], d: ['{n} szomszéd átjön, és kölcsönkérne egy fúrógépet.', 'Your neighbor {n} comes over to borrow a drill.'], o: [
    [['Kölcsönadom', 'Lend it'], [[2, ['{n} egy üveg házi lekvárral hozta vissza.', '{n} returned it with a jar of homemade jam.'], { hap: 5, npc: ['Szomszéd', 55] }], [1, ['A fúrógép sosem került elő.', 'The drill never came back.'], { hap: -3, npc: ['Szomszéd', 25] }]]],
    [['Nem adom', 'Refuse'], [[1, ['Kínos pillanat volt.', 'It was an awkward moment.'], { hap: -2, npc: ['Szomszéd', 20] }]]]] },
  { a: [20, 80], np: { role: 'Szomszéd', a: [22, 70] }, t: ['Éjszakai zaj', 'Night noise'], d: ['Éjjel hangos zene szól {n} lakásából.', 'Loud music blares from the apartment of {n} at night.'], o: [
    [['Átmegyek beszélni', 'Go talk to them'], [[2, ['{n} elnézést kért, és kibékültetek.', '{n} apologized and you made peace.'], { hap: 3, npc: ['Szomszéd', 50] }], [1, ['Veszekedés lett belőle.', 'It turned into an argument.'], { hap: -6, npc: ['Riválisod', 10] }]]],
    [['Rendőrt hívok', 'Call the police'], [[1, ['Kijöttek, de {n} dühös rád.', 'They came, but {n} is angry with you.'], { hap: -4, npc: ['Riválisod', 10] }]]]] },
  { a: [18, 50], u: () => !partner(), np: { role: 'Párod', r: [-5, 5] }, t: ['Társkereső', 'Dating app'], d: ['{n} rád jobbra húzott egy társkereső appon.', '{n} swiped right on you on a dating app.'], o: [
    [['Elmegyek randira', 'Go on a date'], [[2, ['Remek este volt! Összejöttetek.', 'It was a great evening! You got together.'], { hap: 12, npc: ['Párod', 50] }], [1, ['Kellemes beszélgetés volt, de nem működött a kémia.', 'A pleasant chat, but no chemistry.'], { hap: 1, npc: ['Barát', 35] }], [1, ['Kiderült, hogy {n} hazudott magáról.', 'It turned out {n} had lied about themselves.'], { hap: -6 }]]],
    [['Nem válaszolok', 'Ignore'], [[1, ['Továbbgörgettél.', 'You kept scrolling.'], { hap: -1 }]]]] },
  { a: [8, 90], u: () => pastMates().length > 0, pk: () => pastMates(), t: ['Régi osztálytárs', 'Old classmate'], d: ['Az utcán összefutottál {n} nevű egykori {s} osztálytársaddal.', 'You ran into {n}, your former {s} classmate, on the street.'], o: [
    [['Meghívom egy kávéra', 'Invite for coffee'], [[3, ['Órákig beszélgettetek, felidéztétek a régi időket.', 'You talked for hours and remembered the old days.'], { hap: 8, bond: 20 }], [1, ['Kicsit kínos volt, de kedvesen elbeszélgettetek.', 'It was a bit awkward, but a nice chat.'], { hap: 2, bond: 8 }]]],
    [['Telefonszámot cserélünk', 'Swap numbers'], [[1, ['Telefonszámot cseréltetek, ezentúl tartjátok a kapcsolatot.', 'You swapped numbers and will stay in touch.'], { hap: 3, bond: 12 }]]],
    [['Köszönök és megyek', 'Say hi and go'], [[1, ['Röviden váltottatok pár szót.', 'You exchanged a few quick words.'], { hap: 1, bond: 2 }]]]] },
  { a: [18, 24], u: () => p.uni, np: { role: 'Osztálytárs', r: [-1, 3] }, t: ['Közös tanulás', 'Study group'], d: ['{n} egyetemi csoporttársad együtt tanulna veled a vizsgára.', 'Your classmate {n} wants to study with you for the exam.'], o: [
    [['Igen', 'Yes'], [[2, ['Együtt sokkal könnyebb volt!', 'Studying together made it much easier!'], { sma: 5, hap: 3, npc: ['Barát', 55] }], [1, ['Többet beszélgettetek, mint tanultatok.', 'You talked more than you studied.'], { sma: 1, hap: 6, npc: ['Barát', 50] }]]],
    [['Egyedül tanulok', 'Study alone'], [[1, ['Csendben haladtál, de magányos volt.', 'You made quiet progress, but it felt lonely.'], { sma: 4, hap: -3 }]]]] },
  { a: [20, 80], ex: 'Barát', u: () => exl('Barát').length, t: ['Kölcsön', 'A loan'], d: ['A barátod, {n} 200 e Ft kölcsönt kér tőled.', 'Your friend {n} asks to borrow 200k Ft.'], o: [
    [['Kölcsönadom (200 e Ft)', 'Lend it (200k Ft)'], [[2, ['{n} időben visszaadta. Erősebb lett a barátságotok.', '{n} paid it back on time. Your friendship grew stronger.'], { hap: 4, bond: 12 }], [1, ['{n} sosem adta vissza a pénzt.', '{n} never paid you back.'], { money: -2e5, hap: -6, bond: -25 }]], 2e5],
    [['Nemet mondok', 'Say no'], [[1, ['{n} megsértődött, de megértette.', '{n} was offended but understood.'], { hap: -2, bond: -15 }]]]] },
  { a: [22, 60], ex: 'Barát', u: () => exl('Barát').length, t: ['Esküvői meghívó', 'Wedding invitation'], d: ['A barátod, {n} esküvőre hív.', 'Your friend {n} invites you to a wedding.'], o: [
    [['Megyek (80 e Ft)', 'Go (80k Ft)'], [[1, ['Gyönyörű esküvő volt, sokat táncoltatok!', 'A beautiful wedding, and you danced a lot!'], { money: -8e4, hap: 10, bond: 10 }]], 8e4],
    [['Nem megyek', 'Skip it'], [[1, ['Elfoglalt voltál, {n} csalódott.', 'You were busy, and {n} was disappointed.'], { hap: -2, bond: -15 }]]]] }

);
// véletlen hírek: [minKor, maxKor, szöveg, hatás]
const RN = [
  [2, 8, 'A szüleid vettek neked egy új játékot.', { hap: 8 }],
  [6, 18, 'Egy osztálytársad csúfolt az iskolában.', { hap: -12 }],
  [12, 25, 'Nagyon pattanásos lett az arcod.', { loo: -10 }],
  [14, 80, 'Találtál az utcán 10 000 Ft-ot!', { money: 1e4 }],
  [18, 80, 'Elkaptad a súlyos influenzát.', { hea: -15 }],
  [40, 90, 'Fájni kezdett a hátad a sok üléstől.', { hea: -10 }],
  [5, 16, 'Nyertél a sulis versenyen!', { hap: 10, sma: 3 }],
  [16, 60, 'Fodrásznál jártál, jól sikerült a hajad.', { loo: 6, hap: 4, money: -15000 }],
  [18, 70, 'Szép nyári nap volt a Duna-parton.', { hap: 8 }],
  [20, 70, 'Elromlott az autód, sokba került a javítás.', { money: -4e5, ins: 'car' }, () => driver() && worst('car') < 70],
  [1, 12, 'Elestél biciklivel, lehorzsoltad a térded.', { hea: -4 }],
  [25, 70, 'Egy régi barátod váratlanul felhívott.', { hap: 8 }],
  [30, 100, 'Olvastál egy könyvet, ami elgondolkodtatott.', { sma: 4 }]
];

// ----- bővített események (előfeltételekkel) -----
CH.push(
  { a: [18, 80], u: () => driver() && worst('car') < 65, t: 'Lerobbant az autód', d: 'Út közben füstölni kezd a motorháztető, az autó lerobban.', o: [
    ['Szerelőhöz viszem (250 e Ft)', [[1, 'Megjavították, jobb mint új.', { money: -25e4, hap: -2, ins: 'car' }]], 25e4],
    ['Magam próbálom megjavítani', [[2, 'Sikerült, ügyes vagy!', { sma: 3, hap: 4 }], [1, 'Csak rosszabb lett, drága lesz a javítás.', { money: -4e5, hap: -6, ins: 'car' }]]],
    ['Eladom roncsként', [[1, 'Elvitték a roncsot, az autód elveszett.', { crash: 1, money: 2e5, hap: -4 }]]]] },
  { a: [18, 80], u: () => driver(), t: 'Kilyukadt a gumi', d: 'Defektet kaptál az úton.', o: [
    ['Kicserélem a pótkerékre', [[3, 'Gyorsan megoldottad.', { hap: 1, sma: 1 }], [1, 'Nem ment simán, elkéstél.', { hap: -3 }]]],
    ['Autómentőt hívok (80 e Ft)', [[1, 'Az autómentő gyorsan jött.', { money: -8e4 }]], 8e4]] },
  { a: [18, 80], u: () => driver(), t: 'Közúti baleset', d: 'Egy keresztezésben összeütköztél egy másik autóval.', o: [
    ['Rendőrt hívok', [[2, 'Kisebb koccanás volt, a biztosító rendezte.', { hap: -5, money: -5e4, ins: 'car' }], [1, 'Súlyos baleset, az autód totálkáros.', { hea: -25, hap: -15, crash: 1 }]]],
    ['Megegyezünk egymás közt (150 e Ft)', [[1, 'Kifizetted a kárt, és mentetek tovább.', { money: -15e4, hap: -4 }]], 15e4]] },
  { a: [19, 60], u: () => driver(), t: 'Buli után', d: 'Éjjel van, ittál is, és az autód ott áll a ház előtt.', o: [
    ['Beülök a volán mögé', [[3, 'Szerencsére semmi baj nem történt.', { hap: -2 }], [1, 'Rajtakaptak! Elvették a jogosítványodat.', { money: -4e5, hap: -12, nolic: 1 }], [1, 'Balesetet okoztál. Az autó elveszett.', { hea: -20, hap: -15, crash: 1 }]]],
    ['Taxit hívok (15 e Ft)', [[1, 'Biztonságban hazaértél.', { hap: 2, money: -15e3 }]], 15e3],
    ['Ott alszom', [[1, 'Biztonságos döntés volt.', { hap: 1 }]]]] },
  { a: [18, 60], ex: 'Barát', u: () => driver() && exl('Barát').length, t: 'Autós kirándulás', d: '{n} autós kirándulást javasol hétvégére.', o: [
    ['Megyünk! (30 e Ft benzin)', [[3, 'Fantasztikus nap volt együtt.', { money: -3e4, hap: 10, bond: 10 }], [1, 'Eltévedtetek, de jót nevettetek.', { money: -3e4, hap: 5, bond: 6 }]], 3e4],
    ['Inkább nem', [[1, 'Otthon maradtál, {n} csalódott.', { hap: -2, bond: -6 }]]]] },
  { a: [20, 80], u: () => hasHouse() && worst('house') < 65, t: 'Beázik a tető', d: 'A heves esőben beázott a házad teteje.', o: [
    ['Szakembert hívok (400 e Ft)', [[1, 'Rendesen megjavították.', { money: -4e5, ins: 'house' }]], 4e5],
    ['Magam tapaszolom', [[2, 'Sikerült ideiglenesen megoldani.', { sma: 2, hap: 2 }], [1, 'Csak ideiglenes volt, nagyobb lett a kár.', { money: -6e5, hap: -5, ins: 'house' }]]]] },
  { a: [20, 80], u: () => hasHouse(), t: 'Betörés a háznál', d: 'Nyomát találod, hogy valaki be akart törni hozzád.', o: [
    ['Rendőrt hívok', [[1, 'Jegyzőkönyvet vettek fel, kisebb kár keletkezett.', { money: -1e5, hap: -6, ins: 'house' }]]],
    ['Zárat cseréltetek (50 e Ft)', [[1, 'Biztonságosabb lett az otthonod.', { money: -5e4, hap: 2 }]], 5e4]] },
  { a: [20, 80], ex: 'Párod,Házastárs', u: () => exl('Párod,Házastárs').length, t: 'Évforduló', d: 'Ma van az évfordulótok {n} nevű társaddal.', o: [
    ['Vacsora étteremben (80 e Ft)', [[1, 'Romantikus este volt.', { money: -8e4, hap: 10, bond: 8 }]], 8e4],
    ['Otthon főzök neki', [[2, 'Különleges este lett, szinte ingyen.', { hap: 8, bond: 8 }], [1, 'Odaégett a vacsora, de nevettetek.', { hap: 5, bond: 4 }]]],
    ['Elfelejtem', [[1, '{n} megsértődött.', { hap: -8, bond: -20 }]]]] },
  { a: [20, 80], ex: 'Párod,Házastárs', u: () => exl('Párod,Házastárs').length, t: 'Veszekedés', d: 'Nagy vitába keveredtél a társaddal, {n}-nel.', o: [
    ['Bocsánatot kérek', [[2, 'Kibékültetek.', { hap: 2, bond: 6 }], [1, 'Nem sikerült megnyugtatni.', { hap: -5, bond: -8 }]]],
    ['Nem engedek', [[1, 'Napokig nem beszéltetek.', { hap: -8, bond: -15 }]]]] },
  { a: [20, 70], u: () => kidsU().length, t: 'Beteg a gyerek', d: 'A gyereked belázasodott.', o: [
    ['Orvoshoz viszem (50 e Ft)', [[1, 'Gyorsan meggyógyult.', { money: -5e4, hap: 3 }]], 5e4],
    ['Otthon ápolom', [[2, 'Pár nap alatt jobban lett.', { hap: 1, hea: -2 }], [1, 'Rosszabbodott, végül mégis orvos kellett.', { money: -1e5, hap: -6 }]]]] },
  { a: [20, 70], u: () => kidsU().length, t: 'Iskolai ünnepély', d: 'A gyereked fellép az iskolai ünnepélyen.', o: [
    ['Elmegyek megnézni', [[1, 'Nagyon büszke voltál rá.', { hap: 8 }]]],
    ['Nem érek rá', [[1, 'A gyerek szomorú volt.', { hap: -5 }]]]] },
  { a: [22, 60], u: () => p.job, t: 'Béremelés kérése', d: 'Úgy érzed, többet érdemelnél a jelenlegi fizetésednél.', o: [
    ['Elkérem a béremelést', [[2, 'Megkaptad!', { raise: .08, hap: 5 }], [1, 'Nemet mondtak.', { hap: -5 }]]],
    ['Még várok', [[1, 'Egyelőre maradt minden.', { hap: 0 }]]]] },
  { a: [18, 25], u: () => p.uni, t: 'Ösztöndíj', d: 'Kiírtak egy ösztöndíjpályázatot az egyetemen.', o: [
    ['Pályázom', [[1, 'Megnyerted az ösztöndíjat!', { money: 3e5, hap: 6 }], [1, 'Most nem nyertél.', { hap: -3 }]]],
    ['Kihagyom', [[1, 'Nem pályáztál.', { hap: 0 }]]]] },
  { a: [22, 80], u: () => p.money < 0, t: 'Behajtó', d: 'Egy behajtó cég keres a tartozásod miatt.', o: [
    ['Részletfizetést kérek (50 e Ft)', [[1, 'Megegyeztetek, kicsit könnyebb lett.', { money: -5e4, hap: -2 }]], 5e4],
    ['Nem veszem fel a telefont', [[1, 'Egy hétig rettegtél.', { hap: -10 }]]]] },
  { a: [20, 80], ex: 'Barát', u: () => exl('Barát').length, t: 'Barát bajban', d: 'A barátod, {n} nagyon rossz passzban van.', o: [
    ['Meghallgatom', [[1, 'Sokat jelentett neki, hogy ott voltál.', { hap: 3, bond: 10 }]]],
    ['Pénzzel segítek (50 e Ft)', [[1, 'Nagyon hálás volt.', { money: -5e4, hap: 2, bond: 15 }]], 5e4],
    ['Nem érek rá', [[1, '{n} csalódott benned.', { bond: -12, hap: -2 }]]]] },
  { a: [20, 80], u: () => p.sick, t: 'Kórházi kivizsgálás', d: 'Az orvos szerint érdemes lenne alaposan kivizsgálni a betegségedet.', o: [
    ['Elmegyek (200 e Ft)', [[2, 'Új kezelést kaptál, jobban vagy.', { money: -2e5, hea: 12 }], [1, 'Nem sokat segített.', { money: -2e5, hap: -3 }]], 2e5],
    ['Várok még', [[1, 'Halogattad.', { hap: -2 }]]]] }
);
RN.push(
  [18, 80, 'Parkolási bírságot kaptál.', { money: -2e4, hap: -3 }, () => driver()],
  [18, 80, 'Az autód átment a műszaki vizsgán.', { money: -4e4, hap: 2 }, () => driver()],
  [18, 80, 'Az üzemanyagárak elszálltak, sokat költöttél az autóra.', { money: -6e4 }, () => driver()],
  [18, 80, 'Szép autós kirándulás a Balatonhoz.', { hap: 8 }, () => driver()],
  [20, 80, 'Elromlott a fűtés a házadban.', { money: -2e5, ins: 'house' }, () => hasHouse() && worst('house') < 60],
  [20, 80, 'Gyönyörű lett a kerted, nagyon élvezed.', { hap: 5 }, () => hasHouse()],
  [20, 80, 'Romantikus estét töltöttél a párodnál.', { hap: 8 }, () => partner()],
  [20, 80, 'A párod megfőzte a kedvenc ételedet.', { hap: 6 }, () => partner()],
  [6, 17, 'Jó jegyeket kaptál, a szüleid büszkék rád.', { hap: 6, sma: 2 }],
  [16, 80, 'A gyereked ügyes volt az iskolában.', { hap: 8 }, () => kidsU().length],
  [20, 60, 'A főnök megdicsért a munkahelyeden.', { hap: 6 }, () => p.job],
  [20, 60, 'Prémiumot kaptál a cégtől.', { money: 2e5, hap: 5 }, () => p.job],
  [20, 60, 'Leépítésről szóltak a hírek, idegeskedtél.', { hap: -6 }, () => p.job],
  [18, 30, 'Vizsgaidőszak stressze nyomja a vállad.', { hap: -6, sma: 3 }, () => p.uni],
  [18, 80, 'Kamatot kaptál a megtakarításodra.', { money: 5e4 }, () => p.money > 2e6],
  [18, 80, 'A tartozásod után kamatot kell fizetned.', { money: -3e4, hap: -4 }, () => p.money < 0]
);

// ===== hobbik, különleges karrierek, munkahelyi teendők =====
const carIs = id => p.car && p.car.id == id, isBiz = () => p.car && CAR_BY[p.car.id].biz, hobN = () => Object.keys(p.hob || {}).length, hobLv = ids => Math.max(0, ...ids.map(i => (p.hob && p.hob[i] ? p.hob[i].lv : 0)));
const rk = n => Math.round(n / 1e3) * 1e3;

// --- hobbik ---
const HOB = [
  { id: 'guitar', i: '🎸', n: 'Gitározás', m: 6, c0: 8e4, fx: { hap: [2, 5] }, cn: 'Zenei fellépés', pz: 3e5 },
  { id: 'sing', i: '🎤', n: 'Éneklés', m: 6, fx: { hap: [2, 5] }, cn: 'Tehetségkutató', pz: 4e5 },
  { id: 'paint', i: '🎨', n: 'Festés', m: 4, c0: 3e4, fx: { hap: [2, 4], sma: [0, 1] }, cn: 'Kiállítás', pz: 3e5 },
  { id: 'foot', i: '⚽', n: 'Foci', m: 5, fx: { hea: [2, 4], hap: [1, 3] }, cn: 'Bajnokság', pz: 1e5 },
  { id: 'swim', i: '🏊', n: 'Úszás', m: 5, fx: { hea: [3, 5], loo: [0, 2] }, cn: 'Úszóverseny', pz: 1e5 },
  { id: 'chess', i: '♟️', n: 'Sakk', m: 6, fx: { sma: [2, 4] }, cn: 'Sakkverseny', pz: 2e5 },
  { id: 'dance', i: '💃', n: 'Tánc', m: 6, fx: { hea: [1, 3], loo: [1, 2], hap: [2, 4] }, cn: 'Táncverseny', pz: 2e5 },
  { id: 'game', i: '🎮', n: 'Videójátékozás', m: 6, fx: { hap: [3, 6], hea: [-1, 0] }, cn: 'E-sport torna', pz: 4e5 },
  { id: 'cook', i: '🍳', n: 'Főzés', m: 8, fx: { hap: [2, 4], hea: [0, 1] }, cn: 'Főzőverseny', pz: 2e5 },
  { id: 'fish', i: '🎣', n: 'Horgászat', m: 8, c0: 5e4, fx: { hap: [3, 6] }, cn: 'Horgászverseny', pz: 1e5 },
  { id: 'garden', i: '🌱', n: 'Kertészkedés', m: 10, c0: 2e4, fx: { hap: [2, 5], hea: [1, 2] }, cn: 'Virágkiállítás', pz: 1e5 },
  { id: 'photo', i: '📷', n: 'Fényképezés', m: 10, c0: 2e5, fx: { hap: [2, 5] }, cn: 'Fotópályázat', pz: 3e5 },
  { id: 'write', i: '✍️', n: 'Írás', m: 10, fx: { sma: [1, 3], hap: [1, 3] }, cn: 'Irodalmi pályázat', pz: 2e5 },
  { id: 'code', i: '💻', n: 'Programozás', m: 10, fx: { sma: [2, 4] }, cn: 'Hackathon', pz: 5e5 },
  { id: 'climb', i: '🧗', n: 'Hegymászás', m: 12, c0: 1e5, c: 2e4, fx: { hea: [2, 5], hap: [2, 4] }, cn: 'Mászóverseny', pz: 2e5 }
];
const hobT = lv => lv < 25 ? 'Kezdő' : lv < 50 ? 'Haladó' : lv < 75 ? 'Profi' : lv < 100 ? 'Mester' : 'Legenda';
function startHob(id) {
  const x = HOB.find(q => q.id == id); if (!x || p.hob[id] || hobN() >= 3 || p.age < x.m) return;
  const c = p.age < 18 ? 0 : x.c0 || 0; if (!can(c)) return;
  p.money -= c; p.hob[id] = { lv: 5, prac: 1 }; fxlog(`Új hobbid: ${x.i} ${x.n}.`, { hap: 5 }); render();
}
function hobPrac(id) {
  const x = HOB.find(q => q.id == id), h = p.hob[id], c = p.age < 18 ? 0 : x.c || 0; if (!h || p.done['h' + id] || !can(c)) return;
  p.done['h' + id] = 1; p.money -= c; const b = h.lv; h.lv = cl(h.lv + Math.round(R(6, 13) * (h.eq ? 1.3 : 1))); h.prac = 1;
  const f = {}; for (const k in x.fx) f[k] = R(x.fx[k][0], x.fx[k][1]);
  for (const t of [25, 50, 75, 100]) if (b < t && h.lv >= t) lg(`${x.i} ${x.n}: elérted a(z) ${hobT(t)} szintet!`, 'good');
  fxlog(`Gyakoroltál: ${x.n}.`, f); render();
}
function hobComp(id) {
  const x = HOB.find(q => q.id == id), h = p.hob[id], c = p.age < 18 ? 0 : 2e4; if (!h || h.lv < 30 || p.done['hc' + id] || !can(c)) return;
  p.done['hc' + id] = 1; p.money -= c; h.prac = 1;
  if (Math.random() < Math.min(.92, .25 + h.lv / 130 + (h.eq ? .06 : 0))) {
    const z = p.age < 18 ? R(1, 3) * 1e4 : rk(x.pz * (h.lv / 50) * R(5, 15) / 10); h.lv = cl(h.lv + R(2, 5));
    fxlog(`${x.cn}: sikeresen szerepeltél, jutalmad ${fmt(z)}!`, { money: z, hap: 9 });
  } else { h.lv = cl(h.lv + 1); fxlog(`${x.cn}: most nem jött össze, de sokat tanultál belőle.`, { hap: -3 }); }
  render();
}
function quitHob(id) { const x = HOB.find(q => q.id == id); if (!confirm(`Biztosan abbahagyod: ${x.n}?`)) return; delete p.hob[id]; lg(`Abbahagytad: ${x.n}.`); render(); }
function hobYear() { for (const id in p.hob) { const h = p.hob[id]; if (!h.prac) h.lv = cl(h.lv - R(2, 6)); h.prac = 0; } }

// --- munkahelyi teendők (hétköznapi munkákhoz) ---

// --- különleges karrierek ---
const BZ = [
  { id: 'ad', i: '📣', n: 'Reklámkampány', c: 1e5, g: [8, 15], t: 'A reklámkampány sok új vevőt hozott.' },
  { id: 'deal', i: '🤝', n: 'Tárgyalás ügyfelekkel', w: .7, g: [8, 15], m: [1e5, 5e5], t: 'Jó üzletet kötöttél.', tf: 'Az ügyfél végül nem kötött üzletet.' },
  { id: 'hire', i: '🧑‍💼', n: 'Alkalmazott felvétele', c: 2e5, g: [6, 10], t: 'Új munkatárs csatlakozott a céghez.' },
  { id: 'admin', i: '🗂️', n: 'Adminisztráció, könyvelés', g: [4, 8], t: 'Rendbe tetted a papírmunkát.' },
  { id: 'invest', i: '🏗️', n: 'Fejlesztés', c: 8e5, w: .8, g: [12, 22], t: 'A fejlesztés bejött, nő a forgalom.', tf: 'A fejlesztés nem hozta, amit vártál.' }
];
const CARS = [
  { id: 'actor', i: '🎭', n: 'Színész', age: 16, l: 45, v: [70, 140], ranks: [['Statiszta', 1.2e6], ['Epizódszereplő', 3e6], ['Mellékszereplő', 7e6], ['Főszereplő', 22e6], ['Hollywoodi sztár', 70e6]], acts: [
    { id: 'aud', i: '🎬', n: 'Meghallgatás', w: .65, g: [12, 22], fx: { hap: 3 }, t: 'Sikeres meghallgatás, szerepet kaptál.', tf: 'Nem téged választottak.' },
    { id: 'prep', i: '📜', n: 'Szerepre készülés', g: [6, 12], fx: { sma: 1 }, t: 'Hónapokig tanultad a szerepet.' },
    { id: 'int', i: '🎙️', n: 'Interjú, talk-show', w: .85, g: [5, 10], fx: { loo: 1 }, t: 'Jól sikerült a tévés megjelenés.', tf: 'Kínosan sült el az interjú.' },
    { id: 'gym', i: '🏋️', n: 'Edzés a szerephez', c: 1.5e5, g: [5, 9], fx: { hea: 3, loo: 3 }, t: 'Formába hoztad magad a szerepre.' },
    { id: 'ad', i: '📺', n: 'Reklámfilm', w: .7, g: [2, 5], m: [3e5, 12e5], t: 'Reklámfilmet forgattál, jól fizettek.', tf: 'Nem kaptad meg a reklámszerepet.' }] },
  { id: 'athlete', i: '🏅', n: 'Profi sportoló', age: 14, max: 36, hea: 65, v: [75, 130], ranks: [['Utánpótlás', 1e6], ['Félprofi', 3e6], ['Profi', 8e6], ['Válogatott', 18e6], ['Világsztár', 50e6]], acts: [
    { id: 'tr', i: '🏃', n: 'Edzés', g: [8, 14], fx: { hea: 2 }, t: 'Keményen edzettél.' },
    { id: 'match', i: '🏟️', n: 'Mérkőzés', w: .65, g: [10, 18], m: [2e5, 9e5], t: 'Nyertetek, te voltál a meccs embere!', tf: 'Vesztettetek, és megsérültél kicsit.', ff: { hea: -4 } },
    { id: 'spon', i: '🧢', n: 'Szponzori szerződés', w: .5, g: [3, 7], m: [5e5, 20e5], t: 'Szponzor szerződést kötött veled.', tf: 'Most senki nem akart szponzorálni.' },
    { id: 'rehab', i: '💆', n: 'Fizioterápia', c: 8e4, g: [4, 8], fx: { hea: 6 }, t: 'Kezelésen vettél részt, frissebb vagy.' },
    { id: 'diet', i: '🥗', n: 'Diéta, étrend', g: [3, 6], fx: { hea: 2 }, t: 'Szigorúan tartottad az étrendet.' }] },
  { id: 'musician', i: '🎸', n: 'Zenész', age: 14, hob: [['guitar', 'sing'], 25], v: [70, 140], ranks: [['Utcazenész', 8e5], ['Kocsmai zenekar', 2e6], ['Klubzenész', 4.5e6], ['Turnézó zenész', 12e6], ['Világhírű rocksztár', 40e6]], acts: [
    { id: 'pr', i: '🎼', n: 'Gyakorlás', g: [8, 14], fx: { hap: 2 }, t: 'Sokat gyakoroltál.' },
    { id: 'gig', i: '🎤', n: 'Fellépés', w: .75, g: [8, 16], m: [1e5, 6e5], t: 'Telt ház volt, tombolt a közönség!', tf: 'Üres volt a klub, rossz este.' },
    { id: 'wr', i: '📝', n: 'Dalírás', g: [6, 12], fx: { sma: 1, hap: 2 }, t: 'Új dalt írtál.' },
    { id: 'clip', i: '🎥', n: 'Videóklip', c: 2e5, g: [10, 20], t: 'Elkészült az új videóklipped.' },
    { id: 'alb', i: '💿', n: 'Album kiadása', c: 5e5, w: .6, g: [15, 25], m: [3e5, 15e5], t: 'Az albumod nagy siker lett!', tf: 'Az album alig fogyott.' }] },
  { id: 'vid', i: '🎥', n: 'Videós / Streamer', age: 12, cr: 1, pl: ['yt', 'tw', 'tt', 'ki'], ranks: [['Kezdő alkotó', 3e5], ['Növekvő csatorna', 2e6], ['Népszerű alkotó', 6e6], ['Sztárcsatorna', 16e6], ['Mega-streamer', 40e6]], acts: [] },
  { id: 'inf', i: '📱', n: 'Influenszer', age: 14, cr: 1, pl: ['ig', 'tt', 'tx', 'fb'], ranks: [['Kezdő influenszer', 3e5], ['Mikroinfluenszer', 2e6], ['Ismert influenszer', 6e6], ['Sztárinfluenszer', 16e6], ['Mega-influenszer', 40e6]], acts: [] },
  { id: 'politician', i: '🏛️', n: 'Politikus', age: 25, e: 2, s: 60, c: 1, max: 72, v: [80, 120], ranks: [['Önkormányzati képviselő', 3.5e6], ['Polgármester', 7e6], ['Parlamenti képviselő', 12e6], ['Miniszter', 22e6], ['Miniszterelnök', 40e6]], acts: [
    { id: 'sp', i: '🗣️', n: 'Beszéd', w: .8, g: [8, 14], t: 'Meggyőző beszédet mondtál.', tf: 'Rosszul sikerült a beszéd.' },
    { id: 'camp', i: '🪧', n: 'Kampányolás', c: 3e5, w: .7, g: [12, 22], t: 'A kampány sok szavazót mozgósított.', tf: 'A kampány nem hozta a várt hatást.' },
    { id: 'neg', i: '🤝', n: 'Tárgyalás', w: .7, g: [6, 12], t: 'Megegyeztél a másik párttal.', tf: 'A tárgyalás zátonyra futott.' },
    { id: 'press', i: '📰', n: 'Sajtótájékoztató', w: .8, g: [5, 10], t: 'Jól sikerült a sajtótájékoztató.', tf: 'Kínos kérdéseket kaptál a sajtótól.' },
    { id: 'char', i: '❤️', n: 'Jótékonysági rendezvény', c: 1e5, g: [6, 10], fx: { hap: 3 }, t: 'Jótékonysági estet szerveztél.' }] },
  { id: 'cafe', i: '☕', n: 'Kávézó-tulajdonos', age: 18, cost: 15e5, biz: 1, v: [60, 150], ranks: [['Kis kávézó', 2.5e6], ['Népszerű kávézó', 5e6], ['Kávézólánc', 12e6], ['Országos lánc', 30e6], ['Nemzetközi birodalom', 80e6]], acts: BZ },
  { id: 'shop', i: '📦', n: 'Webshop-tulajdonos', age: 16, cost: 5e5, biz: 1, v: [50, 170], ranks: [['Kis webshop', 1.8e6], ['Ismert webshop', 4e6], ['Nagy webáruház', 10e6], ['Logisztikai központ', 25e6], ['E-kereskedelmi óriás', 60e6]], acts: BZ },
  { id: 'startup', i: '🚀', n: 'Techcég-alapító', age: 18, cost: 3e6, s: 55, biz: 1, v: [10, 320], ranks: [['Garázscég', 1e6], ['Startup', 5e6], ['Unikornis-jelölt', 20e6], ['Tőzsdei cég', 60e6], ['Techóriás', 200e6]], acts: BZ }
];
const CAR_BY = Object.fromEntries(CARS.map(c => [c.id, c]));
const carUnmet = C => {
  const o = []; if (C.l && p.loo < C.l) o.push(`kinézet ${C.l}+`); if (C.hea && p.hea < C.hea) o.push(`egészség ${C.hea}+`); if (C.s && p.sma < C.s) o.push(`okosság ${C.s}+`);
  if (C.e != null && p.edu < C.e) o.push(T(EDU[C.e])); if (C.c && p.crim) o.push('tiszta előélet');
  if (C.hob && hobLv(C.hob[0]) < C.hob[1]) o.push(`gitár vagy ének hobbi ${C.hob[1]}+`); return o;
};
const carReq = C => { const r = []; if (C.age) r.push(`${C.age}+ év`); if (C.max) r.push(`${C.max} éves korig`); if (C.cost) r.push(`induló tőke ${fmt(C.cost)}`);
  if (C.l) r.push(`kinézet ${C.l}+`); if (C.hea) r.push(`egészség ${C.hea}+`); if (C.s) r.push(`okosság ${C.s}+`); if (C.e != null) r.push(T(EDU[C.e])); if (C.c) r.push('tiszta előélet'); if (C.hob) r.push(`gitár vagy ének hobbi ${C.hob[1]}+`); return r.join(', '); };
const bizVal = () => { const C = CAR_BY[p.car.id]; return rk(C.ranks[p.car.rank][1] * 2.5 + (C.cost || 0) * .6); };
let crPl = null;
function startCar(id) {
  const C = CAR_BY[id]; if (p.car || carUnmet(C).length || p.age < C.age || (C.max && p.age > C.max) || !can(C.cost || 0)) return;
  if (!parentGate(C.cost || 0, C.n)) return render();
  if (p.job && !confirm(`Ehhez otthagyod a mostani munkád (${p.job}). Biztos vagy benne?`)) return;
  if (p.job) lg(`Felmondtál (${p.job}).`);
  p.job = null; p.pay = 0; p.money -= C.cost || 0; p.car = { id, rank: 0, perf: 35, yrs: 0 }; if (C.cr) { const k = crPl && C.pl.includes(crPl) ? crPl : C.pl[0]; p.car.acc = { [k]: newAcc() }; p.car.sel = k; } p.done.job = 1;
  fxlog(`Új karrier: ${C.i} ${C.n} (${C.ranks[0][0]}).`, { hap: 10 }); render();
}
function quitCar() { if (!p.car) return; const C = CAR_BY[p.car.id]; if (!confirm(`Biztosan felhagysz ezzel: ${C.n}?`)) return; lg(`Felhagytál a karrierrel: ${C.n}.`); p.car = null; render(); }
function sellBiz() { const v = bizVal(), C = CAR_BY[p.car.id]; if (!confirm(`Eladod a céged ${fmt(v)}-ért?`)) return; p.money += v; lg(`Eladtad a cégedet (${C.n}): ${fmt(v)}.`, 'good'); p.car = null; render(); }
function doCarAct(id) {
  if (!p.car) return; const C = CAR_BY[p.car.id], x = C.acts.find(q => q.id == id), c = p.age < 18 ? 0 : x.c || 0, k = 'c' + id;
  if (!x || p.done[k] || !can(c)) return; p.done[k] = 1; p.money -= c;
  if (Math.random() < (x.w == null ? 1 : x.w)) {
    p.car.perf = cl(p.car.perf + R(x.g[0], x.g[1])); const f = { ...(x.fx || {}) };
    if (x.m) { const m = rk(R(x.m[0], x.m[1]) * (1 + p.car.rank * .8)); if (m > 0) f.money = m; }
    fxlog(x.t, f);
  } else { p.car.perf = cl(p.car.perf - R(2, 6)); fxlog(x.tf || 'Most nem sikerült.', { hap: -3, ...(x.ff || {}) }); }
  render();
}

function careerList() {
  const a = p.age, L = CARS.filter(C => a >= C.age && (!C.max || a <= C.max)); if (!L.length) return '';
  return '<h3>Különleges karrierek</h3>' + L.map(C => { const un = carUnmet(C), ok = !un.length && can(C.cost || 0);
    return row(`${C.i} ${C.n}`, `${fmt(C.ranks[0][1])} / év-től`, `<small>${carReq(C)}${un.length ? ' · hiányzik: ' + un.join(', ') : ''}</small><div class="btns"><button ${ok ? '' : 'disabled'} onclick="${C.cr ? `go('crstart:${C.id}')` : `startCar('${C.id}')`}">${C.cr ? 'Platform választása' : C.cost ? 'Indítás' : 'Belevágok'}</button></div>`); }).join('');
}
function carYear() {
  const c = p.car; if (!c) return; const C = CAR_BY[c.id], a = p.age; c.yrs++;
  if (a >= (C.max || 65)) { p.pension = Math.max(p.pension || 0, rk(C.ranks[c.rank][1] * .35)); lg(`Visszavonultál (${C.ranks[c.rank][0]}). Nyugdíj: ${fmt(p.pension)} / év.`, 'good'); p.car = null; return; }
  if (C.cr) return crYear(c, C);
  const v = C.v ? R(C.v[0], C.v[1]) / 100 : 1, inc = rk(C.ranks[c.rank][1] * (.6 + c.perf / 125) * v * (1 + .15 * pkn(c, 'inc'))); p.money += inc;
  if (C.v && v < .55) lg(`${C.i} Gyenge év volt a karrieredben, kevesebb bevétel.`, 'bad'); else if (C.v && v > 1.6) lg(`${C.i} Kiváló év volt, bőven keresett!`, 'good');
  if (c.perf >= 75 && c.rank < C.ranks.length - 1 && Math.random() < .65) { c.rank++; c.perf = 45; fxlog(`Előléptél: ${C.i} ${C.ranks[c.rank][0]}!`, { hap: 10 }); return; }
  c.perf = cl(c.perf - Math.max(2, R(8, 16) - 3 * pkn(c, 'dec')));
  if (c.perf <= 8) {
    if (c.rank > 0) { c.rank--; c.perf = 35; lg(`Visszaestél: ${C.ranks[c.rank][0]} lettél.`, 'bad'); apply({ hap: -8 }); }
    else { lg(C.biz ? `Csődbe ment a vállalkozásod (${C.n}).` : `Vége a karrierednek (${C.n}), a teljesítményed nem volt elég.`, 'bad'); apply({ hap: -15 }); p.car = null; }
  }
}

// --- új események ---
CH.push(
  { a: [16, 70], u: () => carIs('actor'), t: 'Főszerepajánlat', d: 'Egy rendező főszerepet kínál neked egy nagy költségvetésű filmben.', o: [
    ['Elvállalom', [[2, 'A film nagy siker lett!', { perf: 25, hap: 10, money: 5e5 }], [1, 'A film megbukott.', { perf: -15, hap: -8 }]]],
    ['Nem vállalom', [[1, 'Kihagytad a lehetőséget.', { hap: -2 }]]]] },
  { a: [16, 70], u: () => carIs('actor'), t: 'Botrány a sajtóban', d: 'Egy bulvárlap kellemetlen képeket közölt rólad.', o: [
    ['Nyilvánosan bocsánatot kérek', [[1, 'A közönség megbocsátott.', { perf: -5, hap: -4 }]]],
    ['Letagadom', [[1, 'Elhitték, elült a botrány.', { hap: 2 }], [1, 'Kiderült, hogy hazudtál. Nagy a visszhang.', { perf: -25, hap: -10 }]]]] },
  { a: [14, 36], u: () => carIs('athlete'), t: 'Sérülés', d: 'Edzésen megrándult a térded.', o: [
    ['Kezeltetem (400 e Ft)', [[1, 'Szakszerű kezelést kaptál, hamar rendbe jöttél.', { money: -4e5, hea: 6 }]], 4e5],
    ['Beleállok a játékba', [[1, 'Súlyosabb lett a sérülés.', { hea: -14, perf: -15 }], [1, 'Szerencsére nem lett baj.', { hap: 2 }]]]] },
  { a: [14, 36], u: () => carIs('athlete'), t: 'Átigazolási ajánlat', d: 'Egy másik klub csábító ajánlatot tett.', o: [
    ['Elfogadom', [[1, 'Új klub, új lehetőségek!', { perf: 15, hap: 6, money: 3e5 }]]],
    ['Maradok', [[1, 'Hű maradtál a csapatodhoz.', { hap: 2 }]]]] },
  { a: [14, 70], u: () => carIs('musician'), t: 'Slágergyanús dal', d: 'Elkészült egy új dalod, amiről érzed, hogy különleges.', o: [
    ['Kiadom', [[1, 'Slágerré vált a dalod!', { perf: 30, money: 8e5, hap: 12 }], [2, 'Szépen szerepelt, de nem tört át.', { perf: 4, hap: 2 }]]],
    ['Még várok vele', [[1, 'Elraktad a fiókba.', { hap: 0 }]]]] },
  { a: [14, 70], u: () => carIs('musician'), t: 'Eltűnt a hangszered', d: 'Elveszett az egyik legfontosabb hangszered.', o: [
    ['Újat veszek (150 e Ft)', [[1, 'Új hangszered lett.', { money: -15e4, hap: 1 }]], 15e4],
    ['Kölcsönkérek egyet', [[1, 'Nem az igazi, rosszabbul szerepeltél.', { perf: -6, hap: -3 }]]]] },
  { a: [12, 70], u: () => isCr(), t: 'Shitstorm', d: 'Egy régi videód miatt hatalmas vihar kerekedett az interneten.', o: [
    ['Kiállok magam mellett', [[1, 'Sokan melléd álltak, nőtt a követőtáborod.', { fol: 8 }], [1, 'Csak olaj volt a tűzre, sokan kikövettek.', { fol: -15, hap: -8 }]]],
    ['Törlöm a videót', [[1, 'Elült a vihar, de sokan csalódtak.', { fol: -6, hap: -3 }]]]] },
  { a: [12, 70], u: () => isCr(), t: 'Szponzori ajánlat', d: 'Egy márka fizetne, ha bemutatnád a termékét.', o: [
    ['Elfogadom', [[1, 'Szép összeget kaptál, a közönség is szerette.', { money: 4e5, fol: 3 }]]],
    ['Nem érdekel', [[1, 'Hitelesnek maradtál.', { hap: 1 }]]]] },
  { a: [25, 80], u: () => carIs('politician'), t: 'Korrupciós vád', d: 'Egy újság korrupcióval vádol.', o: [
    ['Tagadom', [[2, 'Nem találtak bizonyítékot.', { perf: 5 }], [1, 'Kiderült egy kellemetlen részlet.', { perf: -30, hap: -12 }]]],
    ['Sajtótájékoztatót tartok', [[1, 'Nyugodtan válaszoltál, sokan elhitték.', { perf: -4, hap: -3 }]]]] },
  { a: [25, 80], u: () => carIs('politician'), t: 'Választás', d: 'Közeleg a választás.', o: [
    ['Elindulok (300 e Ft)', [[2, 'Megnyerted a választást!', { perf: 30, hap: 10 }], [1, 'Elvesztetted a választást.', { perf: -20, hap: -10 }]], 3e5],
    ['Kihagyom', [[1, 'Most nem indultál.', { perf: -5 }]]]] },
  { a: [16, 80], u: () => isBiz(), t: 'Adóellenőrzés', d: 'A hatóság ellenőrzi a cég könyvelését.', o: [
    ['Együttműködöm', [[3, 'Minden rendben volt.', { hap: -2 }], [1, 'Hiányosságot találtak, bírságot kaptál.', { money: -4e5, hap: -6 }]]],
    ['Ügyvédet fogadok (150 e Ft)', [[1, 'Az ügyvéd mindent rendezett.', { money: -15e4 }]], 15e4]] },
  { a: [16, 80], u: () => isBiz(), t: 'Nagy megrendelés', d: 'Egy nagy ügyfél hatalmas megrendelést ajánl.', o: [
    ['Elvállalom', [[2, 'Határidőre elkészültetek, nagy nyereség!', { money: 6e5, perf: 15 }], [1, 'Nem bírtátok időben, kötbért fizettetek.', { perf: -10, money: -2e5, hap: -5 }]]],
    ['Túl nagy falat', [[1, 'Kihagytad az üzletet.', { hap: -1 }]]]] },
  { a: [16, 80], u: () => isBiz(), t: 'Új konkurens', d: 'A közelben megnyílt egy versenytársad.', o: [
    ['Árat csökkentek', [[1, 'Megtartottad a vevőidet.', { perf: 5, money: -1e5 }]]],
    ['Új terméket indítok (300 e Ft)', [[2, 'Az új termék befutott.', { perf: 15, money: -3e5 }], [1, 'Az új termék nem fogyott.', { perf: -5, money: -3e5 }]], 3e5]] },
  { a: [18, 70], u: () => p.job, t: 'Új pozíció', d: 'Szabad lett egy magasabb pozíció a cégednél.', o: [
    ['Jelentkezem', [[1, 'Megkaptad a pozíciót!', { raise: .12, hap: 8 }], [2, 'Egy másik jelölt kapta meg.', { hap: -4 }]]],
    ['Maradok a helyemen', [[1, 'Kényelmes maradt minden.', { hap: 0 }]]]] },
  { a: [12, 90], u: () => hobN() > 0, np: { role: 'Barát', r: [-6, 6] }, t: 'Hobbitárs', d: '{n} is ugyanazt a hobbit űzi, mint te, és együtt gyakorolna veled.', o: [
    ['Igen, csináljuk!', [[3, 'Remek barátság kerekedett belőle.', { hap: 8, hob: 1, npc: ['Barát', 55] }], [1, 'Kedves társaság, de nem lett belőle közeli barát.', { hap: 3, npc: ['Szomszéd', 35] }]]],
    ['Inkább egyedül', [[1, 'Maradtál a magad útján.', { hap: -1 }]]]] },
  { a: [10, 80], u: () => hobLv(['guitar', 'sing']) >= 40, t: 'Zenekar hívása', d: 'Egy helyi zenekar tagnak hív.', o: [
    ['Csatlakozom', [[2, 'Jó buli lett, pénzt is kerestek.', { hap: 9, money: 1.5e5, hob: 1 }], [1, 'A zenekar hamar szétesett.', { hap: -3 }]]],
    ['Nem érek rá', [[1, 'Kihagytad.', { hap: -1 }]]]] },
  { a: [12, 90], u: () => hobLv(['paint', 'photo']) >= 50, t: 'Kiállítási meghívó', d: 'Egy galéria kiállítást ajánl a munkáidból.', o: [
    ['Elfogadom', [[2, 'Több alkotásod is elkelt.', { hap: 8, money: 4e5, hob: 1 }], [1, 'Kevesen jöttek el.', { hap: -3 }]]],
    ['Nem teszem ki magam', [[1, 'Maradtál a magánéletnél.', { hap: -1 }]]]] },
  { a: [8, 25], u: () => hobLv(['foot', 'swim', 'dance', 'climb']) >= 50, t: 'Edző felfigyel rád', d: 'Egy edző felfigyelt a tehetségedre, és külön edzéseket ajánl.', o: [
    ['Elfogadom', [[1, 'Sokat fejlődtél tőle.', { hea: 6, hap: 4, hob: 1 }]]],
    ['Nem szeretnék', [[1, 'Maradtál a hobbinál.', { hap: 0 }]]]] },
  { a: [10, 80], u: () => hobLv(['game', 'code', 'write']) >= 50, t: 'Online siker', d: 'Megosztanád az alkotásodat az interneten.', o: [
    ['Megosztom', [[1, 'Felkapott lett, sokan dicsértek!', { hap: 10, money: 2e5 }], [2, 'Néhány kedvelés, semmi több.', { hap: 1 }]]],
    ['Megtartom magamnak', [[1, 'Biztonságban maradt.', { hap: 0 }]]]] }
);
RN.push(
  [10, 90, 'A hobbidban nagyot fejlődtél, büszke vagy magadra.', { hap: 5, hob: 1 }, () => hobN() > 0],
  [12, 90, 'Egy ismerős dicsérte a hobbidat.', { hap: 4 }, () => hobN() > 0],
  [14, 80, 'Interjút adtál egy helyi lapnak a karrieredről.', { hap: 5, perf: 4 }, () => p.car],
  [14, 80, 'Rajongói levelet kaptál.', { hap: 6 }, () => p.car && ['actor', 'musician', 'vid', 'inf', 'athlete'].includes(p.car.id)],
  [18, 70, 'A kollégák meghívtak egy közös sörözésre.', { hap: 5 }, () => p.job]
);

CH.push(
  { a: [8, 80], u: () => !p.pet, t: ['Állatmenhely', 'Animal shelter'], d: ['Elmész egy állatmenhely mellett, ahol sok állat vár gazdira. Bemész megnézni őket?', 'You pass an animal shelter full of animals waiting for a home. Go in?'], o: [
    [['Bemegyek', 'Go in'], [[1, ['A menhelyen sok kedves állatot láttál, választhatsz magadnak egyet.', 'You met lots of lovely animals at the shelter, and you can pick one.'], { hap: 3, adopt: 3e4 }]]],
    [['Most nem', 'Not now'], [[1, ['Továbbmentél.', 'You walked on.'], { hap: 0 }]]]] },
  { a: [8, 80], u: () => !p.pet, t: ['Kóbor állat', 'Stray animal'], d: ['Egy éhes kóbor állat követ hazáig. Befogadod?', 'A hungry stray follows you all the way home. Take it in?'], o: [
    [['Befogadom', 'Take it in'], [[1, ['Befogadtad, most már te vagy a gazdija. Megnézheted, milyen állat, és el is nevezheted.', 'You took it in. You can check what animal it is and name it.'], { hap: 5, adopt: 0 }]]],
    [['Nem tudom megtartani', 'I cannot keep it'], [[1, ['Szomorúan továbbmentél, de egy menhelyet értesítettél.', 'You walked on sadly, but called a shelter.'], { hap: -2 }]]]] }
);
const CITY = [['Budapest', 'Budapesten'], ['Debrecen', 'Debrecenben'], ['Szeged', 'Szegeden'], ['Pécs', 'Pécsett'], ['Győr', 'Győrben'], ['Miskolc', 'Miskolcon']];
// Jellem: csúszkák (0-100), csak a karakterkészítőben állíthatók; a játékban nem látszanak
const TRS = [
  { k: 'ext', i: '🎉', l: ['Extroverzió', 'Extraversion'], a: ['Introvertált', 'Introverted'], b: ['Extrovertált', 'Extroverted'], h: ['65 fölött könnyebb ismerkedni, 35 alatt gyorsabban tanulsz az iskolában.', 'Above 65 meeting people is easier, below 35 you learn faster at school.'] },
  { k: 'amb', i: '🚀', l: ['Ambíció', 'Ambition'], a: ['Nyugodt', 'Calm'], b: ['Ambiciózus', 'Ambitious'], h: ['65 fölött gyorsabban lépsz előre a munkában, 35 alatt kevesebb boldogságot veszítesz.', 'Above 65 you get promoted faster, below 35 you lose less happiness.'] },
  { k: 'grit', i: '💪', l: ['Kitartás', 'Grit'], a: ['Érzékeny', 'Sensitive'], b: ['Acélos', 'Resilient'], h: ['Csökkenti a rossz hírek okozta boldogságvesztést és a stresszt.', 'Softens the happiness lost to bad news, and lowers stress.'] },
  { k: 'emp', i: '💞', l: ['Empátia', 'Empathy'], a: ['Távolságtartó', 'Reserved'], b: ['Együttérző', 'Caring'], h: ['A kapcsolataid lassabban kopnak.', 'Your relationships fade more slowly.'] },
  { k: 'cre', i: '🎨', l: ['Kreativitás', 'Creativity'], a: ['Gyakorlatias', 'Practical'], b: ['Alkotó', 'Creative'], h: ['A hobbijaid gyorsabban fejlődnek.', 'Your hobbies improve faster.'] }
];
const TRD = { ext: 50, amb: 50, grit: 30, emp: 30, cre: 30 };
const trt = k => (p && p.tr && p.tr[k] != null) ? p.tr[k] : TRD[k];
const mkTr = o => { const r = {}; TRS.forEach(x => { r[x.k] = o && o[x.k] != null ? Math.max(0, Math.min(100, Math.round(+o[x.k]))) : R(15, 85); }); return r; };
const MODES = [
  ['none', ['Nincs', 'None'], ['Normál élet, külön szabályok nélkül.', 'A normal life with no special rules.']],
  ['poor', ['Szegény start', 'Poor start'], ['Szegény családba születsz, és nulláról indulsz.', 'You are born into a modest family and start from zero.']],
  ['hermit', ['Remete', 'Hermit'], ['A barátságok nem tudnak igazán elmélyülni.', 'Friendships can never grow truly deep.']],
  ['fast', ['Gyors élet', 'Fast life'], ['Az évek gyorsabban telnek: néha egy kattintás két évet pörget.', 'Years fly: sometimes one tap spins two years.']]
];
const ASSETS = [
  { n: 'Használt Suzuki', t: 'car', i: '🚗', v: 1.5e6 }, { n: 'Toyota Corolla', t: 'car', i: '🚙', v: 6e6 }, { n: 'BMW', t: 'car', i: '🏎️', v: 18e6 }, { n: 'Elektromos autó', t: 'car', i: '🔋', v: 24e6 },
  { n: 'Motor', t: 'bike', i: '🏍️', v: 3e6 },
  { n: 'Garzon', t: 'house', i: '🏢', v: 20e6 }, { n: 'Családi ház', t: 'house', i: '🏡', v: 55e6 }, { n: 'Hétvégi nyaraló', t: 'house', i: '🛖', v: 35e6 }, { n: 'Balatoni villa', t: 'house', i: '🏰', v: 150e6 },
  { n: 'Jacht', t: 'boat', i: '🛥️', v: 90e6 }, { n: 'Festmény', t: 'art', i: '🖼️', v: 8e6 }, { n: 'Régi óra', t: 'jewel', i: '⌚', v: 5e6 }, { n: 'Ékszer', t: 'jewel', i: '💍', v: 2e6 },
  { n: 'Gitár', t: 'item', i: '🎸', v: 1.5e5, sk: 'sma' }, { n: 'Zongora', t: 'item', i: '🎹', v: 8e5, sk: 'sma' }, { n: 'Laptop', t: 'item', i: '💻', v: 4e5, sk: 'sma' }, { n: 'Okostelefon', t: 'item', i: '📱', v: 3e5, sk: 'hap' },
  { n: 'Fényképezőgép', t: 'item', i: '📷', v: 5e5, sk: 'hap' }, { n: 'Játékkonzol', t: 'item', i: '🎮', v: 2e5, sk: 'hap' }, { n: 'Kerékpár', t: 'item', i: '🚲', v: 1.2e5, sk: 'hea' }, { n: 'Dobfelszerelés', t: 'item', i: '🥁', v: 4e5, sk: 'hap' }
];
const SICK = ['Cukorbetegség', 'Szívbetegség', 'Tüdőgyulladás', 'Daganatos betegség', 'Magas vérnyomás'];

// ----- állapot, mentés -----
const lg = (t, c = '') => { p.logs.push({ a: p.age, t, c, n: p.ln = (p.ln || 0) + 1 }); if (p.logs.length > 160) p.logs.shift(); };
const save = () => { try { localStorage.setItem('relife_save', JSON.stringify(p)); } catch (e) {} };
// automata mentés: évente, 3 forgó hely – az újabb mindig a legrégebbit írja felül
const AUTO_N = 3;
const autoMeta = () => { try { const m = JSON.parse(localStorage.getItem('relife_autom')); return Array.isArray(m) ? m : []; } catch (e) { return []; } };
function autoSave() {
  if (!p || p.dead) return;
  try {
    let m = autoMeta().filter(x => localStorage.getItem('relife_auto' + x.k));
    let k;
    if (m.length < AUTO_N) k = [1, 2, 3].find(i => !m.some(x => x.k == i));
    else { m.sort((a, b) => a.ts - b.ts); k = m[0].k; }
    m = m.filter(x => x.k != k); m.push({ k, ts: Date.now(), n: p.name, a: p.age });
    localStorage.setItem('relife_auto' + k, JSON.stringify(p));
    localStorage.setItem('relife_autom', JSON.stringify(m));
  } catch (e) {}
}
function clearAuto() { try { [1, 2, 3].forEach(i => localStorage.removeItem('relife_auto' + i)); localStorage.removeItem('relife_autom'); } catch (e) {} }
const person = (role, age, bond, g) => ({ n: `${P(SN)} ${P(g == 'f' ? NF : NM)}`, role, age, bond, alive: true });
const stage = a => T(a < 3 ? ['Csecsemő', 'Baby'] : a < 6 ? ['Óvodás', 'Preschooler'] : a < 14 ? ['Általános iskolás', 'Schoolkid'] : a < 18 ? ['Gimnazista', 'High schooler'] : p.uni ? ['Egyetemista', 'Student'] : a < 65 ? ['Felnőtt', 'Adult'] : ['Nyugdíjas', 'Retiree']);
const kids = () => p.rel.filter(r => r.alive && r.role == 'Gyerek');
const partner = () => p.rel.find(r => r.alive && (r.role == 'Párod' || r.role == 'Házastárs'));

// ----- iskolák és osztálytársak (minden iskolában más emberek) -----
const SCHA = { k: ['óvodai', 'kindergarten'], a: ['általános iskolai', 'primary school'], g: ['gimnáziumi', 'high school'], u: ['egyetemi', 'university'], x: ['régi', 'old'] };
const schName = c => T(SCHA[c] || SCHA.x);
const schoolId = () => { const a = p.age; return a < 3 ? null : a < 6 ? 'k' : a < 14 ? 'a' : a < 18 ? 'g' : p.uni ? 'u' : null; };
function uname(g) { const t = new Set(p.rel.map(r => r.n)); t.add(p.name); let n; for (let i = 0; i < 50; i++) { n = `${P(SN)} ${P(g == 'f' ? NF : NM)}`; if (!t.has(n)) return n; } return n; }
function mkMate(sc) { const g = P(['f', 'm']), q = person('Osztálytárs', Math.max(3, p.age + R(-1, 1)), 40, g); q.n = uname(g); q.sch = sc || schoolId() || 'x'; return q; }
const mates = sc => p.rel.filter(r => r.alive && r.role == 'Osztálytárs' && !r.past && r.sch == sc);
const pastMates = () => p.rel.filter(r => r.alive && r.past && (r.role == 'Osztálytárs' || r.was == 'Osztálytárs'));
function newSchool() {
  const sc = schoolId();
  p.rel.forEach(r => { if (r.alive && !r.past && (r.role == 'Osztálytárs' || r.was == 'Osztálytárs') && r.sch != sc) r.past = true; });
  if (!sc) return;
  const l = []; for (let i = R(3, 5); i > 0; i--) { const q = mkMate(sc); p.rel.push(q); l.push(q.n); }
  const w = { k: 'Új csoportba kerültél az óvodában', a: 'Új osztályba kerültél az általános iskolában', g: 'Új osztályba kerültél a gimnáziumban', u: 'Új évfolyamtársaid lettek az egyetemen' }[sc];
  lg(`🏫 ${w}. Új osztálytársaid: ${l.slice(0, 3).join(', ')}${l.length > 3 ? ' és mások' : ''}. A régiekkel már csak az utcán futhatsz össze.`, 'good');
}
const roleLab = r => { const wl = x => x == 'Osztálytárs' && r.past ? T(['Volt osztálytárs', 'Former classmate']) : rl(x); return (r.was && r.was != r.role ? wl(r.was) + ' · ' : '') + wl(r.role); };
function popup(t, d, btns) {
  $('#mt').textContent = t; $('#md').textContent = d; const b = $('#mb'); b.innerHTML = '';
  btns.forEach(([l, fn]) => { const x = document.createElement('button'); x.textContent = l; x.onclick = () => { $('#modal').hidden = true; if (fn) fn(); else render(); }; b.append(x); });
  $('#modal').hidden = false;
}

function newLife(o = {}) {
  const g = o.g == 'f' || o.g == 'm' ? o.g : P(['f', 'm']), sn = o.ln || P(SN), fn = o.fn || P(g == 'f' ? NF : NM);
  const city = CITY.find(c => c[0] == o.city) || P(CITY), skin = +o.skin >= 1 ? +o.skin : R(1, 5), gk = ST[o.gift] ? o.gift : P(Object.keys(ST));
  p = { g, skin, tr: mkTr(o.tr), name: `${sn} ${fn}`, age: 0, money: 0, hap: R(75, 95), hea: R(80, 100), sma: R(25, 75), loo: R(20, 85),
    edu: 0, uni: false, job: null, pay: 0, yrs: 0, pension: 0, fam: [1, 2, 3].includes(+o.fam) ? +o.fam : R(1, 3), dead: false, done: {}, logs: [], rel: [], assets: [], lic: false, hob: {}, car: null, jp: 30, fit: 30, lang: 0, trav: {}, inv: 0, cry: 0, debt: 0, jr: 0, pet: null, crim: 0, prison: 0, sick: null, city };
  p[gk] = cl(p[gk] + 15);
  p.look = { g, sk: skin, hs: pk(o.hs, () => rndHs(g)), hc: pk(o.hc, () => R(0, 4)), oc: pk(o.oc, () => R(0, 7)), bd: pk(o.bd, rndBd), ot: pk(o.ot, rndOt), ht: pk(o.ht, rndHt), ea: pk(o.ea, rndEa), gl: pk(o.gl, rndGl), nc: pk(o.nc, rndNc), xc: pk(o.xc, () => R(0, 7)) };
  const m = { ...person('Anya', R(22, 38), R(60, 90), 'f'), par: 1 }, f = { ...person('Apa', R(23, 42), R(55, 90), 'm'), par: 1 };
  m.n = `${sn} ${P(NF)}`; f.n = `${sn} ${P(NM)}`;
  m.kin = genKin(m); f.kin = genKin(f);
  p.rel.push(m, f);
  if (Math.random() < .4) p.rel.push({ ...person('Testvér', R(1, 6), 50, P(['f', 'm'])), n: `${sn} ${P(NF.concat(NM))}` });
  lg(`Megszülettél ${p.city[1]}. A neved ${p.name}, a szüleid ${m.n} és ${f.n}. A család ${['szerény', 'átlagos', 'tehetős'][p.fam - 1]} körülmények között él.`, 'good');
}
function load() { try { p = JSON.parse(localStorage.getItem('relife_save')); } catch (e) { p = null; } if (!p || !p.rel || !p.assets) p = null; }

// ----- hatások -----
function apply(fx) {
  const o = [];
  for (const k in fx) {
    const v = fx[k];
    if (k == 'money') { let m = v, nt = ''; if (fx.ins && v < 0 && hasIns(fx.ins)) { m = Math.round(v * .25); nt = ' 🛡️'; } p.money += m; if (p.age < 20 && p.money < 0) { p.money = 0; nt += ' 👪'; } o.push((m > 0 ? '+' : '−') + fmt(Math.abs(m)) + nt); }
    else if (k == 'raise') { p.pay = Math.round(p.pay * (1 + v)); o.push('+' + Math.round(v * 100) + '% fizetés'); }
    else if (k == 'uni') { p.uni = true; newSchool(); }
    else if (k == 'lic') p.lic = true;
    else if (k == 'nolic') p.lic = false;
    else if (k == 'crash') { const j = p.assets.findIndex(x => x.t == 'car'); if (j >= 0) { const x = p.assets[j]; if (x.ins) { const pay = Math.round(x.v * .6); p.money += pay; o.push('🛡️ +' + fmt(pay)); } p.assets.splice(j, 1); Object.keys(p.done).forEach(q => q.startsWith('as') && delete p.done[q]); } }
    else if (k == 'sportcar') p.assets.push({ n: 'Sportautó', t: 'car', i: '🏎️', v: 1e7 });
    else if (k == 'fol') { if (p.car && p.car.acc) { Object.values(p.car.acc).forEach(a => { a.f = Math.max(0, Math.round(a.f * (1 + v / 100))); }); o.push((v > 0 ? '+' : '') + v + '% követő'); } }
    else if (k == 'ban') { if (p.car && p.car.acc) { const l = Object.values(p.car.acc).filter(a => !a.ban); if (l.length) { P(l).ban = v; o.push('⛔ fiók felfüggesztve'); } } }
    else if (k == 'perf') { if (p.car) p.car.perf = cl(p.car.perf + v); }
    else if (k == 'rank') { p.jr = Math.min(6, (p.jr || 0) + v); }
    else if (k == 'hob') { const ks = Object.keys(p.hob || {}); if (ks.length) { const h = p.hob[P(ks)]; h.lv = cl(h.lv + 4); } }
    else if (k == 'npc') { if (pend && !p.rel.includes(pend)) { if (pend.role == 'Osztálytárs') { pend.sch = schoolId() || 'x'; if (v[0] != 'Osztálytárs') pend.was = 'Osztálytárs'; } pend.role = v[0]; pend.bond = v[1]; p.rel.push(pend); } }
    else if (k == 'adopt') { p.offer = { c: v }; goAdopt = true; }
    else if (k == 'bond') { if (pend) pend.bond = cl(pend.bond + v); }
    else if (ST[k]) { const b = p[k]; p[k] = cl(b + v); const d = Math.round(p[k] - b); if (d) o.push((d > 0 ? '+' : '') + d + ' ' + ST[k][0]); }
  }
  return o.join('  ');
}
function fxlog(t, fx) {
  const s = apply(fx), sc = ['hap', 'hea', 'sma', 'loo'].reduce((q, k) => q + (fx[k] || 0), 0) + Math.sign(fx.money || 0) * 5 + (fx.raise ? 9 : 0);
  lg(s ? `${t}  (${s})` : t, sc >= 0 ? 'good' : 'bad');
  if (Math.abs(sc) >= 8) flash(sc > 0 ? 'good' : 'bad');
  if (sc >= 15) confetti(60);
  if (sc <= -12 && navigator.vibrate) navigator.vibrate(40);
}
function pick(outs) {
  let r = Math.random() * outs.reduce((s, o) => s + o[0], 0);
  for (const [w, t, fx] of outs) if ((r -= w) < 0) return fxlog(fill(T(t)), fx);
}
function ask(ev) {
  $('#mt').textContent = fill(T(ev.t)); $('#md').textContent = fill(T(ev.d));
  const b = $('#mb'); b.innerHTML = '';
  ev.o.forEach(([l, outs, req]) => {
    const x = document.createElement('button'); x.textContent = fill(T(l));
    if (req && p.money < req) { x.disabled = true; x.textContent += u('nomoney'); }
    x.onclick = () => { $('#modal').hidden = true; pick(outs); pend = null; render(); if (goAdopt) { goAdopt = false; adSel = null; tab = 'act'; sub = 'adopt'; render(); $('#sbody').scrollTop = 0; } };
    b.append(x);
  });
  $('#modal').hidden = false;
}

// ----- öregedés -----
function up() {
  if (p.dead) return;
  const sPrev = schoolId(), a = ++p.age, n0 = p.logs.length; pend = null; tab = null; sub = null; relOpen = null; lastPlace = null; p.offer = null; adSel = null;
  p.done = {};
  if (MS[a]) lg(MS[a]);
  if (schoolId() != sPrev) newSchool();
  const jail = p.prison > 0;
  if (jail) { p.prison--; apply({ hap: -4 }); lg(p.prison ? 'Börtönben telt az év.' : 'Letelt a büntetésed, szabadlábra kerültél.', p.prison ? 'bad' : 'good'); }
  // pénz
  if (a >= 18 && !p.uni && !jail) {
    const house = p.assets.some(x => x.t == 'house'), cars = p.assets.filter(x => x.t == 'car').length;
    const inc = p.job ? p.pay : p.pension, cost = (house ? 8e5 : 2e6) + cars * 3e5 + kids().filter(k => k.age < 18).length * 6e5;
    p.money += inc - cost;
    if (p.money < 0) { if (a < 20) { p.money = 0; lg('A szüleid kisegítettek, így nem adósodtál el.', 'good'); } else { lg('Eladósodtál, ez nagyon stresszes.', 'bad'); apply({ hap: -5 }); } }
  }
  assetsYear();
  // betegség
  if (p.sick) { apply({ hea: -R(3, 8) }); lg(`A betegséged (${p.sick}) rontja az egészségedet.`, 'bad'); }
  else if (a > 20 && Math.random() < (.03 + (100 - p.hea) / 1500) * (p.prot ? .3 : 1)) { p.sick = P(SICK); lg(`Diagnosztizáltak nálad: ${p.sick}. Menj orvoshoz!`, 'bad'); }
  p.prot = false; p.fit = cl((p.fit == null ? 30 : p.fit) - R(3, 8)); if (p.fit >= 60) p.hea = cl(p.hea + 1); else if (p.fit < 20 && a > 25) p.hea = cl(p.hea - 1);
  // természetes változás
  p.hap = cl(p.hap - R(0, trt('amb') < 35 ? 1 : 3) + (partner() ? 1 : 0));
  if (a > 40) p.hea = cl(p.hea - R(0, 3)); if (a > 60) p.hea = cl(p.hea - R(0, 2));
  if (a > 35) p.loo = cl(p.loo - R(0, 2));
  if (a >= 6 && a <= 18) p.sma = cl(p.sma + R(1, 3) + (trt('ext') < 35 ? 1 : 0));
  // tanulmányok
  if (a == 18) { p.edu = p.sma >= 25 ? 1 : 0; lg(p.edu ? 'Leérettségiztél.' : 'Nem sikerült az érettségi, így az általános iskolai végzettséged maradt.', p.edu ? 'good' : 'bad'); }
  if (a == 22 && p.uni) {
    p.uni = false; newSchool();
    if (p.sma >= 45) { p.edu = 2; fxlog('Megszerezted a diplomádat!', { hap: 15 }); } else lg('Az egyetemet nem sikerült befejezned.', 'bad');
  }
  // munka
  if (p.job) {
    p.yrs++; const r = Math.random(), pr = (trt('amb') > 65 ? .17 : .1) + (p.jp || 0) / 500, jl = (p.jp || 0) < 20 ? .06 : .03; p.jp = cl((p.jp == null ? 30 : p.jp) - R(5, 12));
    if (a >= 65) { p.pension = Math.round(p.pay * .5); lg(`Nyugdíjba mentél (${p.job}). Nyugdíj: ${fmt(p.pension)} / év.`, 'good'); p.job = null; p.pay = 0; }
    else if (r < pr) { p.jr = Math.min(JR.length - 1, (p.jr || 0) + 1); fxlog(`Előléptettek a munkahelyeden: ${JR[p.jr]} lettél!`, { raise: .15, hap: 8 }); }
    else if (r < pr + jl) { lg(`Kirúgtak (${p.job}).`, 'bad'); apply({ hap: -15 }); p.job = null; p.pay = 0; }
  } else if (a == 65 && !p.pension) p.pension = 1.5e6;
  carYear(); hobYear(); petYear(); moneyYear();
  // emberek
  p.rel.forEach(r => {
    if (!r.alive) return;
    r.age++; r.bond = cl(r.bond - R(0, 4));
    if (r.par && r.age > 70 && Math.random() < (r.age - 70) * .012) {
      r.alive = false; lg(`${r.role} elhunyt: ${r.n} (${r.age} éves).`, 'bad'); apply({ hap: -15 });
      if (a >= 18) { const inh = R(3, 12) * 1e6 * p.fam; p.money += inh; lg(`Örökséged: ${fmt(inh)}.`, 'good'); }
    } else if (r.role == 'Párod' && r.bond < 15) { r.alive = false; lg(`${r.n} szakított veled.`, 'bad'); apply({ hap: -15 }); }
    else if (r.role == 'Házastárs' && r.bond < 10) { r.alive = false; p.money = Math.round(p.money * .7); lg(`${r.n} elvált tőled. A vagyonod egy része elúszott.`, 'bad'); apply({ hap: -20 }); }
    else if (DRIFT.includes(r.role) && r.bond < 5) { r.alive = false; lg(T(['Elsodródtatok egymástól: ', 'You drifted apart from ']) + dn(r.n) + '.'); }
  });
  p.rel.forEach(r => (r.kin || []).forEach(q => { if (!q.alive) return; q.age++; q.bond = cl(q.bond - R(0, 3)); if (q.age > 70 && Math.random() < (q.age - 70) * .015) { q.alive = false; if (r.alive) { lg(`${q.role} elhunyt: ${q.n}.`, 'bad'); apply({ hap: -6 }); } } }));
  // halál
  const risk = a < 45 ? .001 : ((a - 40) ** 2) * 4e-5 * (1 + (60 - p.hea) / 100); const risk2 = risk + (a > 100 ? (a - 100) * .06 : 0);
  if (p.hea <= 0 || Math.random() < risk2) {
    p.dead = true;
    lg(`Meghaltál ${a} évesen (${p.sick ? p.sick + ' miatt' : p.hea <= 0 ? 'betegség miatt' : a < 45 ? 'baleset következtében' : P(['szívmegállás', 'tüdőgyulladás', 'természetes okokból'])}).`, 'death');
    return render();
  }
  // események
  let ev = null;
  if (jail) { /* börtönben nincs esemény */ }
  else if (a == 18 && p.edu == 1) ev = UNI;
  else if (Math.random() < .3) { const l = CH.filter(e => a >= e.a[0] && a <= e.a[1] && (!e.u || e.u())); if (l.length) { ev = P(l); pend = ev.np ? mkNpc(ev.np) : ev.pk ? P(ev.pk()) : ev.ex ? P(exl(ev.ex)) : null; } }
  if (!ev && !jail && Math.random() < .5) { const l = RN.filter(e => a >= e[0] && a <= e[1] && (!e[4] || e[4]())); if (l.length) { const e = P(l); fxlog(e[2], e[3]); } }
  if (p.logs.length == n0) lg(P(QUIET));
  render();
  if (ev) ask(ev);
}

// ----- teendők -----
const fr = () => { const g = P(['f', 'm']); return { ...person('Barát', R(5, 40), 45, g) }; };
const ACT = [
  { id: 'study', i: '📚', n: 'Tanulás', m: 6, c: 0, run: () => fxlog('Tanultál. Okosabb lettél, de fárasztó volt.', { sma: R(2, 5), hap: -2 }) },
  { id: 'gym', i: '🏋️', n: 'Edzés', m: 12, c: 15e4, run: () => fxlog('Edzettél. Erősebbnek érzed magad.', { hea: R(4, 8), loo: R(2, 5) }) },
  { id: 'doc', i: '🏥', n: 'Orvos', m: 0, c: 4e5, run: () => { if (p.sick && Math.random() < .7) { lg(`Meggyógyultál: ${p.sick}.`, 'good'); p.sick = null; apply({ hea: 10, hap: 8 }); } else fxlog('Orvoshoz mentél, kikezeltek.', { hea: R(15, 25) }); } },
  { id: 'psy', i: '🛋️', n: 'Pszichológus', m: 10, c: 2e5, run: () => fxlog('Jót beszélgettél a pszichológussal.', { hap: R(8, 15) }) },
  { id: 'spa', i: '💆', n: 'Wellness', m: 16, c: 3e5, run: () => fxlog('Kikapcsolódtál a wellnessben.', { hap: R(5, 10), loo: R(1, 4), hea: 3 }) },
  { id: 'vol', i: '🤝', n: 'Önkéntes munka', m: 14, c: 0, run: () => fxlog('Önkénteskedtél, jó érzés segíteni.', { hap: R(4, 8), sma: 1 }) },
  { id: 'surg', i: '💉', n: 'Plasztikai műtét', m: 18, c: 2e6, run: () => Math.random() < .85 ? fxlog('A műtét jól sikerült!', { loo: R(12, 22), hea: -4 }) : fxlog('A műtét félresikerült...', { loo: -15, hea: -10, hap: -15 }) },
  { id: 'med', i: '🧘', n: 'Meditálás', m: 10, c: 0, run: () => fxlog('Meditáltál, lenyugodtál.', { hap: R(3, 7) }) },
  { id: 'fr', i: '🎬', n: 'Haverok', m: 8, c: 5e4, run: () => { fxlog('Jót töltél a barátaiddal.', { hap: R(4, 9) }); if (p.rel.filter(r => r.alive && r.role == 'Barát').length < 4 && Math.random() < .5) { const f = fr(); p.rel.push(f); lg(`Új barátod lett: ${f.n}.`, 'good'); } } },
  { id: 'trip', i: '✈️', n: 'Utazás', m: 16, c: 12e5, run: () => fxlog('Elutaztál, feltöltődtél.', { hap: R(10, 18), loo: 2 }) },
  { id: 'lot', i: '🎰', n: 'Lottó', m: 18, c: 2e4, run: () => Math.random() < .01 ? fxlog('MEGNYERTED A LOTTÓ FŐNYEREMÉNYÉT!', { money: 5e7, hap: 30 }) : fxlog('Nem nyertél a lottón.', { hap: -1 }) },
  { id: 'pt', i: '🧾', n: 'Diákmunka', m: 14, c: 0, run: () => fxlog('Diákmunkáztál.', { money: R(300, 600) * 1e3, hap: -3 }) },
  { id: 'meet', i: '💘', n: 'Ismerkedés', m: 16, c: 0, run: () => {
    if (partner()) return fxlog('Már van párod, inkább vele foglalkozz.', { hap: -1 });
    if (Math.random() < .3 + p.loo / 200 + (trt('ext') > 65 ? .15 : 0)) { const g = P(['f', 'm']), q = person('Párod', Math.max(16, p.age + R(-4, 4)), 45, g); p.rel.push(q); fxlog(`Megismerkedtél valakivel: ${q.n}!`, { hap: 10 }); }
    else fxlog('Nem jött össze semmi.', { hap: -3 });
  } },
  { id: 'steal', i: '🛒', n: 'Bolti lopás', m: 12, c: 0, k: 1, run: () => crime('Bolti lopás', .7, R(2, 6) * 1e4, 1) },
  { id: 'pick', i: '👛', n: 'Zsebtolvajlás', m: 14, c: 0, k: 1, run: () => crime('Zsebtolvajlás', .6, R(5, 15) * 1e4, 1) },
  { id: 'burg', i: '🔓', n: 'Betörés', m: 18, c: 0, k: 1, run: () => crime('Betörés', .45, R(5, 20) * 1e5, R(2, 4)) }
];
ACT.push(
  { id: 'walk', i: '🚶', n: 'Séta', m: 3, c: 0, run: () => fxlog('Sétáltál egyet a friss levegőn.', { hap: R(2, 5), hea: R(0, 2) }) },
  { id: 'rest', i: '😴', n: 'Pihenés', m: 0, c: 0, run: () => fxlog('Jól kipihented magad.', { hap: R(2, 5), hea: R(1, 3) }) },
  { id: 'play', i: '🧸', n: 'Játszás', m: 2, M: 13, c: 0, run: () => fxlog('Jót játszottál.', { hap: R(4, 8) }) },
  { id: 'draw', i: '🎨', n: 'Rajzolás', m: 4, c: 0, run: () => fxlog('Rajzoltál egy szép képet.', { hap: R(2, 5), sma: 1 }) },
  { id: 'read', i: '📖', n: 'Olvasás', m: 6, c: 0, run: () => fxlog('Olvastál egy jó könyvet.', { sma: R(1, 3), hap: 1 }) },
  { id: 'run', i: '🏃', n: 'Futás', m: 10, c: 0, run: () => fxlog('Lefutottál pár kilométert.', { hea: R(2, 5), hap: 2, loo: 1 }) },
  { id: 'chore', i: '🧹', n: 'Házimunka', m: 8, c: 0, run: () => { p.rel.forEach(r => { if (r.alive && r.par) r.bond = cl(r.bond + 3); }); fxlog('Segítettél a házimunkában.', { hap: 1, money: p.age < 18 && Math.random() < .5 ? R(5, 15) * 1e3 : 0 }); } },
  { id: 'bottle', i: '♻️', n: 'Palackgyűjtés', m: 10, c: 0, run: () => fxlog('Palackokat gyűjtöttél és leadtad.', { money: R(3, 9) * 1e3, hea: -1 }) },
  { id: 'odd', i: '🧰', n: 'Alkalmi munka', m: 18, c: 0, u: () => p.prison == 0, run: () => fxlog('Alkalmi munkát vállaltál.', { money: R(8, 25) * 1e4, hea: -2, hap: -2 }) },
  { id: 'lic', i: '🪪', n: 'Jogosítvány vizsga', m: 18, c: 15e4, u: () => !p.lic, run: () => Math.random() < .55 + p.sma / 300 ? fxlog('Átmentél a vizsgán! Megvan a jogosítványod.', { hap: 12, lic: 1 }) : fxlog('Elbuktál a vizsgán, újra kell próbálnod.', { hap: -6 }) },
  { id: 'cinema', i: '🍿', n: 'Mozi', m: 8, c: 3e4, run: () => fxlog('Jó filmet néztél.', { hap: R(3, 7) }) },
  { id: 'dine', i: '🍽️', n: 'Étterem', m: 16, c: 1e5, run: () => fxlog('Finomat vacsoráztál.', { hap: R(5, 9) }) },
  { id: 'concert', i: '🎤', n: 'Koncert', m: 15, c: 12e4, run: () => fxlog('Felejthetetlen koncerten voltál.', { hap: R(8, 14) }) },
  { id: 'course', i: '🎓', n: 'Tanfolyam', m: 16, c: 2e5, run: () => fxlog('Elvégeztél egy tanfolyamot.', { sma: R(4, 8), hap: -1 }) },
  { id: 'drive', i: '🚗', n: 'Autós kirándulás', m: 18, c: 3e4, u: () => driver(), run: () => fxlog('Autóval kirándultál, kikapcsolt.', { hap: R(6, 12) }) },
  { id: 'service', i: '🔧', n: 'Autószerviz', m: 18, c: 8e4, u: () => driver(), run: () => fxlog('Átnézették az autódat, megbízhatóan fut.', { hap: 2 }) },
  { id: 'reno', i: '🛠️', n: 'Házfelújítás', m: 18, c: 5e5, u: () => hasHouse(), run: () => { p.assets.forEach(x => { if (x.t == 'house') x.v = Math.round(x.v * 1.06); }); fxlog('Felújítottad a házat, értékesebb lett.', { hap: R(6, 10) }); } }
);

// ===== ÚJ: gombok, kategóriák, teendők, részletoldalak =====
const SI = { fol: '👥', hap: '😊', hea: '❤️', sma: '🧠', loo: '✨', money: '💰', fit: '💪', bond: '🤝', love: '💘', lic: '🪪', baby: '👶', jp: '📈', perf: '📈', lv: '📈', cond: '🔧', val: '💎' };
function abtn(x) {
  const c = x.c || 0, cost = c ? `<span class="cs${can(c) ? '' : ' no'}">−${fmt(c)}</span>` : '', rw = (x.r || []).map(k => SI[k] || k).join(' ');
  const sb = x.done ? '✓ kész' : [cost, rw, x.risk ? '⚠️' : '', x.note || ''].filter(Boolean).join(' ');
  return `<button class="act${x.done ? ' dn' : ''}" ${x.done || x.off || !can(c) ? 'disabled' : ''} onclick="${x.fn}"><b>${x.i} ${x.n}</b>${sb ? `<small>${sb}</small>` : ''}</button>`;
}
function go(x) { sub = x; render(); $('#sbody').scrollTop = 0; }
function goBack() { sub = ({ travel: 'c:fun', adopt: 'c:home', 'rc:past': 'rc:know', inv: tab == 'act' ? 'c:money' : null })[sub] || (tab == 'assets' && sub && sub.startsWith('a:') ? 'own' : null) || (tab == 'assets' && sub && (sub.startsWith('fin:') || sub.startsWith('shop:')) ? 'shop' : null) || (sub && sub.startsWith('h:') ? 'hobs' : null) || (sub && sub.startsWith('crstart:') ? 'jobs' : null) || (tab == 'rel' && sub && sub.startsWith('kin:') && p.rel[+sub.slice(4)] ? 'rc:' + relCat(p.rel[+sub.slice(4)]) : null); render(); $('#sbody').scrollTop = 0; }
const bk = () => '<button class="ghost" onclick="goBack()">‹ Vissza</button>';
function subTitle(t, sb, ro) {
  if (t == 'rel' && ro == 'pet') return p.pet ? p.pet.n : T(TT.rel);
  if (t == 'rel' && sb == 'rc:kin') return 'Rokonok';
  if (t == 'rel' && sb == 'rc:past') return 'Volt osztálytársak';
  if (t == 'rel' && sb && sb.startsWith('rc:')) return (RCATS.find(x => x[0] == sb.slice(3)) || ['', 'Kapcsolatok'])[1].replace(/^\S+\s/, '');
  if (t == 'rel' && sb && sb.startsWith('kin:')) return 'Rokonok';
  if (t == 'rel') return ro != null && p.rel[ro] ? dn(p.rel[ro].n) : T(TT.rel);
  if (t == 'act' && sb) { if (sb.startsWith('c:')) { const C = CATS.find(c => c.id == sb.slice(2)); return C ? C.n : T(TT.act); } return sb == 'travel' ? 'Utazás' : sb == 'adopt' ? 'Kisállat' : 'Befektetések'; }
  if (t == 'assets' && sb) return sb.startsWith('a:') ? (p.assets[+sb.slice(2)] ? p.assets[+sb.slice(2)].n : T(TT.assets)) : FSUB[sb] || T(TT.assets);
  if (t == 'job' && sb) { if (sb.startsWith('h:')) { const x = HOB.find(q => q.id == sb.slice(2)); return x ? x.n : T(TT.job); } if (sb.startsWith('crstart:')) return 'Platform választása'; if (sb == 'jobs') return 'Állások'; if (sb == 'hobs') return 'Hobbik'; if (sb == 'jwork') return 'Munkahelyi tevékenységek'; if (sb == 'school') return occ()[1]; }
  if (t == 'job') return occ()[1];
  return T(TT[t]) || '';
}
const placeName = lp => { const t = lp.tab == 'job' ? occ()[1] : T(TT[lp.tab]), q = subTitle(lp.tab, lp.sub, lp.relOpen); return q && q != t ? t + ' › ' + q : t; };

// --- kategóriák ---
const CATS = [
  { id: 'health', i: '❤️', n: 'Egészség és sport', m: 0 }, { id: 'look', i: '💇', n: 'Külső és megjelenés', m: 10 }, { id: 'mind', i: '🧠', n: 'Tanulás és elme', m: 4 },
  { id: 'fun', i: '🎉', n: 'Szórakozás és utazás', m: 3 }, { id: 'social', i: '👥', n: 'Társas élet', m: 6 }, { id: 'money', i: '💰', n: 'Pénz és befektetés', m: 14 },
  { id: 'home', i: '🏠', n: 'Otthon és háziállat', m: 3 }, { id: 'illegal', i: '🕶️', n: 'Törvénytelen', m: 12 }
];
const AM = { study: ['mind', ['sma']], gym: ['health', ['hea', 'loo', 'fit'], [4, 8]], doc: ['health', ['hea']], psy: ['health', ['hap']], spa: ['look', ['hap', 'loo']], vol: ['social', ['hap']], surg: ['look', ['loo']],
  med: ['health', ['hap']], fr: ['social', ['hap', 'bond']], lot: ['money', ['money']], pt: ['money', ['money']], meet: ['social', ['love']], steal: ['illegal', ['money']], pick: ['illegal', ['money']],
  burg: ['illegal', ['money']], walk: ['health', ['hap', 'hea', 'fit'], [1, 3]], rest: ['health', ['hap', 'hea']], play: ['fun', ['hap']], draw: ['mind', ['hap', 'sma']], read: ['mind', ['sma']],
  run: ['health', ['hea', 'hap', 'fit'], [3, 6]], chore: ['home', ['bond']], bottle: ['money', ['money']], odd: ['money', ['money']], lic: ['mind', ['lic']], cinema: ['fun', ['hap']],
  dine: ['fun', ['hap']], concert: ['fun', ['hap']], course: ['mind', ['sma']], drive: ['fun', ['hap']] };
ACT.forEach(x => { const m = AM[x.id]; if (m) { x.cat = m[0]; x.r = m[1]; if (m[2]) x.fit = m[2]; } });
['trip', 'service', 'reno'].forEach(id => { const j = ACT.findIndex(x => x.id == id); if (j >= 0) ACT.splice(j, 1); });
const addFriend = (lim) => { if (p.rel.filter(r => r.alive && r.role == 'Barát').length >= lim) return null; const f = fr(); p.rel.push(f); lg(`Új barátod lett: ${f.n}.`, 'good'); return f; };
const newPartner = () => { const q = person('Párod', Math.max(16, p.age + R(-4, 4)), 45, P(['f', 'm'])); p.rel.push(q); return q; };
ACT.push(
  // egészség
  { id: 'yoga', cat: 'health', i: '🧘‍♀️', n: 'Jóga', m: 12, c: 0, r: ['hea', 'hap', 'fit'], fit: [2, 5], run: () => fxlog('Jógáztál, ellazultál.', { hea: R(1, 3), hap: R(2, 5) }) },
  { id: 'hike', cat: 'health', i: '🥾', n: 'Túrázás', m: 8, c: 2e4, r: ['hea', 'hap', 'fit'], fit: [4, 8], run: () => fxlog('Nagy túrát tettél a hegyekben.', { hea: R(2, 4), hap: R(4, 8) }) },
  { id: 'swim', cat: 'health', i: '🏊', n: 'Úszás', m: 5, c: 3e4, r: ['hea', 'fit'], fit: [4, 8], run: () => fxlog('Úsztál egy jót.', { hea: R(2, 5), hap: 2 }) },
  { id: 'team', cat: 'health', i: '🏀', n: 'Csapatsport', m: 8, c: 0, r: ['hea', 'hap', 'fit'], fit: [3, 7], run: () => { fxlog('Csapatsportoltál a barátaiddal.', { hea: R(1, 4), hap: R(3, 6) }); if (roll(.12)) fxlog('Megsérültél a játék közben.', { hea: -R(4, 9) }); } },
  { id: 'checkup', cat: 'health', i: '🩺', n: 'Szűrővizsgálat', m: 16, c: 15e4, r: ['hea'], run: () => { p.prot = true; fxlog('Átvizsgáltak, így nagyobb eséllyel előzöd meg a bajt.', { hea: R(2, 5) }); } },
  { id: 'hosp', cat: 'health', i: '🏨', n: 'Kórházi kezelés', m: 0, c: 12e5, u: () => p.sick, r: ['hea'], run: () => { if (roll(.9)) { lg(`Kigyógyultál: ${p.sick}.`, 'good'); p.sick = null; apply({ hea: 15, hap: 10 }); } else fxlog('A kezelés most nem sokat segített.', { hea: 4 }); } },
  { id: 'diet', cat: 'health', i: '🥗', n: 'Egészséges étkezés', m: 10, c: 5e4, r: ['hea', 'fit'], fit: [1, 3], run: () => fxlog('Tudatosan étkeztél.', { hea: R(2, 4) }) },
  // külső
  { id: 'hair', cat: 'look', i: '💇', n: 'Fodrász', m: 10, c: 6e4, r: ['loo', 'hap'], run: () => fxlog('Új frizurát kaptál.', { loo: R(1, 4), hap: 2 }) },
  { id: 'clothes', cat: 'look', i: '👗', n: 'Új ruhák', m: 10, c: 2e5, r: ['loo', 'hap'], run: () => fxlog('Új ruhákat vettél.', { loo: R(2, 5), hap: 3 }) },
  { id: 'cosm', cat: 'look', i: '🧴', n: 'Kozmetikus', m: 14, c: 8e4, r: ['loo'], run: () => fxlog('A kozmetikusnál megújultál.', { loo: R(2, 4) }) },
  { id: 'whiten', cat: 'look', i: '😁', n: 'Fogfehérítés', m: 16, c: 15e4, r: ['loo'], run: () => fxlog('Vakítóan fehér lett a mosolyod.', { loo: R(3, 6) }) },
  { id: 'tattoo', cat: 'look', i: '🖋️', n: 'Tetoválás', m: 18, c: 8e4, r: ['loo', 'hap'], run: () => roll(.7) ? fxlog('Szép tetoválást csináltattál.', { loo: R(1, 4), hap: 3 }) : fxlog('A tetoválás nem lett a legszebb.', { loo: -R(1, 3), hap: -2 }) },
  // tanulás
  { id: 'lang', cat: 'mind', i: '🗣️', n: 'Nyelvtanulás', m: 8, c: 5e4, r: ['sma'], u: () => (p.lang || 0) < 5, run: () => { if (roll(.7)) { p.lang = (p.lang || 0) + 1; fxlog(`Fejlődött a nyelvtudásod (${p.lang}/5).`, { sma: R(1, 3) }); } else fxlog('Nehezen ment a nyelvtanulás.', { sma: 1 }); } },
  { id: 'code', cat: 'mind', i: '💻', n: 'Programozás tanulása', m: 12, c: 0, r: ['sma'], run: () => fxlog('Új dolgokat tanultál programozásból.', { sma: R(2, 4) }) },
  { id: 'museum', cat: 'mind', i: '🏛️', n: 'Múzeum', m: 6, c: 2e4, r: ['sma', 'hap'], run: () => fxlog('Múzeumban jártál.', { sma: R(1, 3), hap: R(1, 3) }) },
  { id: 'club', cat: 'mind', i: '🎒', n: 'Szakkör', m: 6, M: 18, c: 0, r: ['sma', 'hap'], run: () => fxlog('Szakkörön vettél részt.', { sma: R(1, 3), hap: R(2, 4) }) },
  { id: 'diary', cat: 'mind', i: '📔', n: 'Naplóírás', m: 10, c: 0, r: ['hap', 'sma'], run: () => fxlog('Írtál a naplódba, rendeződtek a gondolataid.', { hap: R(1, 3), sma: 1 }) },
  // szórakozás
  { id: 'party', cat: 'fun', i: '🥳', n: 'Buli', m: 16, c: 5e4, r: ['hap', 'bond'], run: () => { fxlog('Remek bulin voltál.', { hap: R(4, 9) }); if (roll(.12)) fxlog('Másnapos lettél.', { hea: -2, hap: -2 }); if (roll(.15)) addFriend(6); } },
  { id: 'park', cat: 'fun', i: '🎡', n: 'Vidámpark', m: 3, c: 4e4, r: ['hap'], run: () => fxlog('Remekül szórakoztál a vidámparkban.', { hap: R(5, 9) }) },
  { id: 'match', cat: 'fun', i: '🏟️', n: 'Sportmérkőzés', m: 8, c: 4e4, r: ['hap'], run: () => roll(.5) ? fxlog('A kedvenc csapatod nyert, ünnepeltetek!', { hap: R(7, 11) }) : fxlog('Izgalmas meccset láttál.', { hap: R(3, 6) }) },
  // társas élet
  { id: 'app', cat: 'social', i: '📱', n: 'Társkereső app', m: 16, c: 0, r: ['love'], u: () => !partner(), run: () => { if (roll(.2 + p.loo / 250 + (trt('ext') > 65 ? .1 : 0))) { const q = newPartner(); fxlog(`Az appon megismerkedtél valakivel: ${q.n}!`, { hap: 9 }); } else fxlog('Csak üres beszélgetések lettek.', { hap: -2 }); } },
  { id: 'community', cat: 'social', i: '🤝', n: 'Közösségi klub', m: 10, c: 0, r: ['hap', 'bond'], run: () => { const f = roll(.6) ? addFriend(6) : null; fxlog(f ? 'Jó társaságot találtál a klubban.' : 'Kellemes estét töltöttél a klubban.', { hap: R(2, 5) }); } },
  { id: 'host', cat: 'social', i: '🍷', n: 'Vendégség', m: 18, c: 8e4, r: ['hap', 'bond'], run: () => { p.rel.forEach(r => { if (r.alive && ['Barát', 'Szomszéd', 'Munkatárs', 'Testvér'].includes(r.role)) r.bond = cl(r.bond + 4); }); fxlog('Vendégeket láttál az otthonodban, jó hangulat volt.', { hap: R(4, 8) }); } },
  { id: 'family', cat: 'social', i: '👨‍👩‍👧', n: 'Családi program', m: 3, c: 0, r: ['hap', 'bond'], run: () => { p.rel.forEach(r => { if (r.alive && ['Anya', 'Apa', 'Testvér'].includes(r.role)) r.bond = cl(r.bond + R(4, 9)); }); fxlog('Együtt töltöttetek egy napot a családdal.', { hap: R(3, 6) }); } },
  { id: 'reunion', cat: 'social', i: '🎓', n: 'Osztálytalálkozó', m: 25, c: 5e4, r: ['hap', 'bond'], run: () => { p.rel.forEach(r => { if (r.alive && r.role == 'Osztálytárs') r.bond = cl(r.bond + R(5, 12)); }); fxlog('Felidéztétek a régi időket az osztálytalálkozón.', { hap: R(4, 9) }); } },
  { id: 'charity', cat: 'social', i: '🎗️', n: 'Adományozás', m: 16, c: 1e5, r: ['hap'], run: () => fxlog('Adományoztál, jó érzés segíteni.', { hap: R(4, 8) }) },
  // pénz
  { id: 'scratch', cat: 'money', i: '🎟️', n: 'Kaparós sorsjegy', m: 18, c: 5e3, r: ['money'], rk: 1, run: () => roll(.15) ? fxlog('Nyertél a kaparóssal!', { money: R(2, 60) * 1e4, hap: 4 }) : fxlog('Nem nyertél a kaparóssal.', { hap: -1 }) },
  { id: 'bet', cat: 'money', i: '🎲', n: 'Sportfogadás', m: 18, c: 1e5, r: ['money'], rk: 1, run: () => roll(.42) ? fxlog('Bejött a tipped!', { money: 22e4, hap: 6 }) : fxlog('Nem jött be a fogadásod.', { hap: -3 }) },
  { id: 'loan', cat: 'money', i: '🏦', n: 'Hitelfelvétel (500 e Ft)', m: 20, c: 0, r: ['money'], rk: 1, run: () => { p.debt = (p.debt || 0) + 55e4; fxlog('Felvettél egy hitelt, évi 12% kamattal.', { money: 5e5 }); } },
  { id: 'repay', cat: 'money', i: '💳', n: 'Hiteltörlesztés', m: 18, c: 0, u: () => p.debt > 0, r: ['hap'], run: () => { const m = Math.min(p.debt, Math.max(0, p.money)); if (!m) return lg('Nincs miből törleszteni.', 'bad'); p.money -= m; p.debt -= m; fxlog(`Törlesztettél ${fmt(m)}-ot. Hátralévő tartozás: ${fmt(p.debt)}.`, { hap: 2 }); } },
  // otthon
  { id: 'cook', cat: 'home', i: '🍳', n: 'Főzés', m: 8, c: 0, r: ['hap', 'hea'], run: () => fxlog('Finomat főztél.', { hap: R(2, 4), hea: R(0, 2) }) },
  { id: 'clean', cat: 'home', i: '🧽', n: 'Takarítás', m: 8, c: 0, r: ['hap', 'bond'], run: () => { p.rel.forEach(r => { if (r.alive && r.par) r.bond = cl(r.bond + 2); }); fxlog('Kitakarítottál, tisztaság van.', { hap: R(1, 3) }); } },
  { id: 'garden', cat: 'home', i: '🌻', n: 'Kertészkedés', m: 10, c: 0, u: () => hasHouse(), r: ['hap', 'hea'], run: () => fxlog('Dolgoztál a kertben.', { hap: R(3, 6), hea: R(1, 3) }) },
  { id: 'diy', cat: 'home', i: '🔨', n: 'Barkácsolás', m: 12, c: 3e4, r: ['sma', 'hap'], run: () => roll(.75) ? fxlog('Összeraktál valami hasznosat.', { sma: 1, hap: 3 }) : fxlog('Elrontottad a barkácsolást.', { hap: -3 }) },
  { id: 'move', cat: 'home', i: '📦', n: 'Költözés másik városba', m: 18, c: 4e5, r: ['hap'], rk: 1, run: () => { const old = p.city[0]; p.city = P(CITY.filter(c => c[0] != old)); p.rel.forEach(r => { if (r.alive && DRIFT.includes(r.role)) r.bond = cl(r.bond - R(3, 10)); }); fxlog(`Elköltöztél ide: ${p.city[0]}. Új élet, új lehetőségek.`, { hap: R(-3, 6) }); } },
  // törvénytelen
  { id: 'graff', cat: 'illegal', i: '🎨', n: 'Graffiti', m: 12, c: 0, k: 1, r: ['hap'], run: () => crime('Graffiti', .8, 0, 1) },
  { id: 'scam', cat: 'illegal', i: '🕵️', n: 'Csalás', m: 18, c: 0, k: 1, r: ['money'], run: () => crime('Csalás', .5, R(3, 10) * 1e5, R(1, 3)) },
  { id: 'bank', cat: 'illegal', i: '🏦', n: 'Bankrablás', m: 21, c: 0, k: 1, r: ['money'], run: () => crime('Bankrablás', .22, R(10, 40) * 1e6, R(5, 9)) }
);
ACT.forEach(x => { if (!x.cat) x.cat = 'fun'; });

// --- kisállat ---
const PETS = [
  { k: 'kutya', n: 'Kutya', acc: 'kutyát', i: '🐶', life: 14, d: 'hűséges, sok mozgás' }, { k: 'macska', n: 'Macska', acc: 'macskát', i: '🐱', life: 16, d: 'önálló, kényes' },
  { k: 'nyúl', n: 'Nyúl', acc: 'nyulat', i: '🐰', life: 8, d: 'szelíd, kedves' }, { k: 'hörcsög', n: 'Hörcsög', acc: 'hörcsögöt', i: '🐹', life: 3, d: 'kicsi, éjjel aktív' },
  { k: 'papagáj', n: 'Papagáj', acc: 'papagájt', i: '🦜', life: 20, d: 'okos, beszélni tanul' }, { k: 'teknős', n: 'Teknős', acc: 'teknőst', i: '🐢', life: 40, d: 'lassú, hosszú életű' },
  { k: 'aranyhal', n: 'Aranyhal', acc: 'aranyhalat', i: '🐠', life: 6, d: 'nyugodt, könnyen tartható' }];
const PN = ['Max', 'Luna', 'Bodri', 'Cirmi', 'Bundi', 'Kormi', 'Pötyi', 'Frakk', 'Mici', 'Zeusz', 'Szilvi', 'Maci', 'Foltos', 'Csipsz', 'Tappancs', 'Milka', 'Pamacs', 'Gombóc'];
const ALLP = PETS.map(q => q.k);
const PACT = [
  { k: 'pet', i: '🤚', n: 'Simogatás', ok: ['kutya', 'macska', 'nyúl', 'hörcsög', 'papagáj', 'teknős'], r: ['hap', 'bond'] },
  { k: 'play', i: '🎾', n: 'Játék', ok: ['kutya', 'macska', 'nyúl', 'hörcsög', 'papagáj'], r: ['hap', 'bond'] },
  { k: 'walk', i: '🦮', n: 'Séta', ok: ['kutya'], r: ['hap', 'hea', 'fit'] },
  { k: 'feed', i: '🍖', n: 'Csemege', c: 1e4, ok: ALLP, r: ['hea', 'bond'] },
  { k: 'groom', i: '🛁', n: 'Fürdetés, ápolás', ok: ['kutya', 'macska', 'nyúl'], r: ['hea', 'bond'] },
  { k: 'clean', i: '🧹', n: 'Lakhely takarítása', ok: ['nyúl', 'hörcsög', 'papagáj', 'teknős', 'aranyhal'], r: ['hea'] },
  { k: 'trick', i: '🎓', n: 'Trükk tanítása', ok: ['kutya', 'papagáj'], r: ['bond', 'sma'] },
  { k: 'vet', i: '🩺', n: 'Állatorvos', c: 8e4, ok: ALLP, r: ['hea'] }];
const PNAME = x => String(x || '').replace(/[<>&"'`\\]/g, '').trim().slice(0, 16);
const adoptCost = () => p.age < 18 ? 0 : p.offer ? p.offer.c : 8e4;
function selAd(k) { adSel = k; render(); }
function adoptPanel() {
  if (p.pet) return `<p class="empty">Már van kisállatod: ${p.pet.i} ${p.pet.n}. Őt a Kapcsolatok › Család alatt találod.</p>`;
  const c = adoptCost(), K = PETS.find(q => q.k == adSel);
  let h = `<div class="card"><div class="top"><b>🐾 Kisállat örökbefogadása</b><small>${c ? fmt(c) : 'ingyen'}</small></div><small>${p.offer ? 'Most különleges lehetőség adódott, ' : ''}Válaszd ki az állatot, és add meg a nevét.</small></div><div class="grid">`
    + PETS.map(q => `<button class="act" style="${q.k == adSel ? 'outline:3px solid #3fbf5f' : ''}" onclick="selAd('${q.k}')"><b>${q.i} ${q.n}</b><small>~${q.life} év · ${q.d}</small></button>`).join('') + '</div>';
  if (K) h += `<div class="card" style="margin-top:8px"><b>${K.i} Hogy hívják?</b><div style="display:flex;gap:8px;margin:8px 0"><input id="pnm" maxlength="16" autocomplete="off" value="${P(PN)}" style="flex:1;min-width:0;border:1px solid #b8c4bc;border-radius:10px;padding:10px"><button class="act" style="flex:none;width:52px;align-items:center" onclick="document.getElementById('pnm').value=P(PN)">🎲</button></div><div class="grid">${abtn({ i: '💛', n: 'Örökbefogadom', c, r: ['hap'], done: p.done.adopt, fn: `adoptPet('${K.k}')` })}</div></div>`;
  return h;
}
function adoptPet(k) {
  const K = PETS.find(q => q.k == k), c = adoptCost(); if (!K || p.pet || p.done.adopt || !can(c)) return;
  const el = document.getElementById('pnm'), nm = PNAME(el && el.value) || P(PN);
  if (!p.offer && !parentGate(8e4, 'kisállat')) { p.done.adopt = 1; return render(); }
  p.done.adopt = 1; p.money -= c; p.offer = null; adSel = null;
  p.pet = { k: K.k, i: K.i, n: nm, age: 0, hp: 80, bond: 50, tr: 0 };
  fxlog(`Örökbe fogadtál egy ${K.acc}: ${nm}! ${K.i}`, { hap: 10 }); render();
}
function petAct(k) {
  const t = p.pet, x = PACT.find(q => q.k == k), id = 'pet' + k, c = p.age >= 18 ? x && x.c || 0 : 0; if (!t || !x || !x.ok.includes(t.k) || p.done[id] || !can(c)) return; p.done[id] = 1; p.money -= c;
  const n = t.n;
  if (k == 'pet') { t.bond = cl(t.bond + R(4, 8)); fxlog(`Megsimogattad a kisállatod: ${n}.`, { hap: R(2, 4) }); }
  else if (k == 'play') { t.bond = cl(t.bond + R(6, 12)); fxlog(`Játszottál a kisállatoddal: ${n}.`, { hap: R(3, 6) }); }
  else if (k == 'walk') { t.bond = cl(t.bond + 4); t.hp = cl(t.hp + R(3, 6)); p.fit = cl((p.fit || 0) + R(2, 4)); fxlog(`Sétáltál a kutyáddal: ${n}.`, { hap: R(2, 4), hea: R(1, 3) }); }
  else if (k == 'feed') { t.bond = cl(t.bond + R(3, 6)); t.hp = cl(t.hp + R(2, 5)); fxlog(`Finomsággal kedveskedtél neki: ${n}.`, { hap: R(1, 3) }); }
  else if (k == 'groom') { t.bond = cl(t.bond + R(3, 6)); t.hp = cl(t.hp + R(1, 4)); fxlog(`Megfürdetted, kikefélted: ${n}.`, { hap: R(1, 3) }); }
  else if (k == 'clean') { t.hp = cl(t.hp + R(3, 7)); t.bond = cl(t.bond + R(1, 3)); fxlog(`Kitakarítottad a lakhelyét: ${n}.`, { hap: 1 }); }
  else if (k == 'trick') { if (roll(.7)) { t.tr = (t.tr || 0) + 1; t.bond = cl(t.bond + R(4, 8)); fxlog(`Új trükköt tanult tőled: ${n}. (Trükkök: ${t.tr})`, { hap: R(3, 6), sma: 1 }); } else { t.bond = cl(t.bond + 2); fxlog(`Ma nem akart a trükk menni: ${n}.`, { hap: 1 }); } }
  else { t.hp = cl(t.hp + R(25, 40)); fxlog(`Állatorvosnál jártatok: ${n}.`, { hap: 1 }); }
  render();
}
function petRename() {
  const t = p.pet; if (!t) return; let v = null; try { v = prompt(T(['Új név:', 'New name:']), t.n); } catch (e) { }
  const nm = PNAME(v); if (!nm || nm == t.n) return; const o = t.n; t.n = nm; lg(`Átkereszteltél egy kisállatot: ${o} → ${nm}.`); render();
}
function petActions() {
  const t = p.pet; return '<div class="grid" style="margin-top:8px">' + PACT.filter(x => x.ok.includes(t.k)).map(x => abtn({ i: x.i, n: x.n, c: p.age >= 18 ? x.c || 0 : 0, r: x.r, done: p.done['pet' + x.k], fn: `petAct('${x.k}')` })).join('') + '</div>';
}
const petState = t => { const w = []; if (t.hp < 35) w.push('gyenge, vidd orvoshoz'); if (t.bond < 30) w.push('magányos'); else if (t.bond >= 75) w.push('nagyon ragaszkodik hozzád'); return w.length ? w.join(', ') : 'jól van'; };
function petBlock() {
  const t = p.pet; if (!t) return '';
  return `<div class="card"><div class="top"><b>${t.i} ${t.n}</b><small>${t.k}, ${t.age}. éves</small></div><div class="tr"><i style="width:${t.hp}%"></i></div><small>Egészség ${Math.round(t.hp)} · Kötődés ${Math.round(t.bond)}</small>` + petActions() + '</div>';
}
function petDetail() {
  const t = p.pet; if (!t) return '<p class="empty">Nincs kisállatod.</p>';
  return `<div class="card pd"><div class="rwrap"><div class="rav pav">${t.i}</div><div class="rbody"><div class="top"><b>${t.n}</b><small>Kisállat · ${t.k}, ${t.age} éves</small></div><small class="dsc">Állapot: ${petState(t)}${t.tr ? ' · trükkök: ' + t.tr : ''}</small></div></div></div>`
    + `<div class="card"><div class="top"><small>Egészség</small><small>${Math.round(t.hp)}/100</small></div><div class="tr"><i style="width:${t.hp}%"></i></div><div class="top"><small>Kötődés</small><small>${Math.round(t.bond)}/100</small></div><div class="tr"><i style="width:${t.bond}%"></i></div></div>`
    + '<h3>Mit csinálsz vele?</h3>' + petActions().replace(' style="margin-top:8px"', '') + '<h3>Egyebek</h3><div class="grid"><button class="act" onclick="petRename()"><b>✏️ Átnevezés</b></button></div>';
}
function petYear() {
  const t = p.pet; if (!t) return; const K = PETS.find(q => q.k == t.k); t.age++; t.hp = cl(t.hp - R(4, 10)); t.bond = cl(t.bond - R(2, 6));
  if (t.hp <= 0 || t.age >= K.life + R(-2, 2)) { lg(`${t.i} Elpusztult a kisállatod, ${t.n}. Nagyon hiányzik.`, 'bad'); apply({ hap: -12 }); p.pet = null; return; }
  if (t.bond >= 40) p.hap = cl(p.hap + 2);
}

// --- utazás ---
const DEST = [
  { id: 'balaton', i: '🏖️', n: 'Balaton', c: 2e5, m: 4, h: [5, 9] }, { id: 'vienna', i: '🏰', n: 'Bécs', c: 4e5, m: 10, h: [6, 10] }, { id: 'rome', i: '🏛️', n: 'Róma', c: 9e5, m: 14, h: [8, 13] },
  { id: 'paris', i: '🗼', n: 'Párizs', c: 12e5, m: 14, h: [9, 14] }, { id: 'ny', i: '🗽', n: 'New York', c: 35e5, m: 18, h: [10, 16] }, { id: 'tokyo', i: '⛩️', n: 'Tokió', c: 4e6, m: 18, h: [11, 17] },
  { id: 'safari', i: '🦁', n: 'Afrikai szafari', c: 5e6, m: 18, h: [12, 18] }, { id: 'cruise', i: '🚢', n: 'Hajóút', c: 6e6, m: 20, h: [12, 20] }
];
function travel(id) {
  const d = DEST.find(q => q.id == id), c = p.age < 18 ? 0 : d.c; if (p.done.trip || !can(c)) return; p.done.trip = 1; p.money -= c; p.trav = p.trav || {};
  const first = !p.trav[id]; p.trav[id] = (p.trav[id] || 0) + 1;
  fxlog(`${d.i} ${d.n}: ${P(['gyönyörű napokat töltöttél itt.', 'felejthetetlen élményekben volt részed.', 'sokat sétáltál és fényképeztél.'])}${first ? ' (először jártál itt)' : ''}`, { hap: R(d.h[0], d.h[1]), loo: 1, sma: first ? 1 : 0 });
  const r = Math.random();
  if (r < .1) fxlog('Elloptak a pénztárcád az úton.', { money: p.age < 18 ? 0 : -R(2, 6) * 1e4, hap: -4 });
  else if (r < .15) fxlog('Rosszul lettél az úton, ételmérgezést kaptál.', { hea: -6 });
  else if (r < .23 && !partner() && p.age >= 16) { const q = newPartner(); fxlog(`Nyaralás közben megismerkedtél valakivel: ${q.n}!`, { hap: 9 }); }
  if (Object.keys(p.trav).length >= 5 && !p.wt) { p.wt = 1; lg('🌍 Világutazó lettél: 5 különböző helyen jártál!', 'good'); }
  render();
}

// --- befektetés, pénzügyek ---
function invest(k, amt) { if (!can(amt) || p.age < 18) return; if (!parentGate(amt, 'befektetés')) return render(); p.money -= amt; p[k] = (p[k] || 0) + amt; lg(`${k == 'inv' ? '📈 Részvénybe' : '🪙 Kriptóba'} fektettél: ${fmt(amt)}.`); render(); }
function cashOut(k) { const v = p[k] || 0; if (!v) return; p[k] = 0; p.money += v; lg(`Kivetted a befektetésed: ${fmt(v)}.`, 'good'); render(); }
function moneyYear() {
  [['inv', '📈 Részvényeid', -18, 28, 1], ['cry', '🪙 Kriptód', -60, 120, 0]].forEach(([k, n, lo, hi, pl]) => { if (p[k] > 0) { const g = R(lo, hi); p[k] = Math.round(p[k] * (1 + g / 100)); p[k + 'g'] = g; lg(`${n} ${g >= 0 ? (pl ? 'nőttek' : 'nőtt') : (pl ? 'estek' : 'esett')} ${Math.abs(g)}%-ot: ${fmt(p[k])}.`, g >= 0 ? 'good' : 'bad'); } });
  if (p.sav > 0) { p.sav = Math.round(p.sav * 1.03); }
  if (p.debt > 0) { p.debt = Math.round(p.debt * 1.12); lg(`A tartozásod kamatozik: ${fmt(p.debt)}.`, 'bad'); if (p.debt > 3e6) apply({ hap: -3 }); }
}
function invPanel() {
  if (p.age < 18) return '<p class="empty">18 évesen fektethetsz be.</p>';
  const one = (k, ic, n, d) => `<div class="card"><div class="top"><b>${ic} ${n}</b><small>${fmt(p[k] || 0)}</small></div><small>${d}${p[k + 'g'] != null ? ` · tavaly: ${p[k + 'g'] >= 0 ? '+' : ''}${p[k + 'g']}%` : ''}</small><div class="grid" style="margin-top:8px">${[1e5, 1e6, 5e6].map(m => abtn({ i: '➕', n: fmt(m), off: !can(m), fn: `invest('${k}',${m})` })).join('')}${abtn({ i: '💵', n: 'Kivét', off: !(p[k] > 0), r: ['money'], fn: `cashOut('${k}')` })}</div></div>`;
  return '<p class="empty">Az árfolyamok évente, öregedéskor frissülnek.</p>' + one('inv', '📈', 'Részvények', 'mérsékelt kockázat (−18% … +28% évente)') + one('cry', '🪙', 'Kripto', 'nagyon kockázatos (−60% … +120% évente)');
}

// --- teendők panel ---
const catAvail = cid => ACT.filter(x => x.cat == cid && p.age >= x.m && (!x.M || p.age <= x.M) && (!x.u || x.u()));
const actBtn = x => abtn({ i: x.i, n: x.n, c: p.age < 18 ? 0 : x.c || 0, r: x.r, risk: x.k || x.rk, done: p.done[x.id], fn: `doAct('${x.id}')` });
const CATX = {
  health: () => `<div class="card"><div class="top"><b>💪 Kondíció</b><small>${Math.round(p.fit == null ? 30 : p.fit)}/100</small></div><div class="tr"><i style="width:${p.fit == null ? 30 : p.fit}%"></i></div><small>A sport növeli, ha elhanyagolod, csökken. Jó kondícióval lassabban romlik az egészséged.</small></div>` + (p.sick ? `<p class="lg bad">🤒 Betegség: ${p.sick}. Menj orvoshoz vagy kórházba!</p>` : ''),
  mind: () => `<div class="card"><div class="top"><b>🗣️ Nyelvtudás</b><small>${p.lang || 0}/5</small></div><small>Minden szint növeli az állásinterjúk esélyét.</small></div>`,
  money: () => `<div class="card"><div class="top"><b>Pénzügyek</b><small>nettó ${fmt(netw())}</small></div><small>Készpénz ${fmt(p.money)} · Befektetés ${fmt((p.inv || 0) + (p.cry || 0))}${p.debt > 0 ? ` · Tartozás ${fmt(p.debt)}` : ''}</small></div>` + (p.age >= 18 ? `<div class="grid" style="margin-bottom:8px"><button class="act" onclick="go('inv')"><b>📈 Befektetések</b><small>részvény, kripto</small></button></div>` : ''),
  fun: () => `<div class="grid" style="margin-bottom:8px"><button class="act" onclick="go('travel')"><b>✈️ Utazás</b><small>${Object.keys(p.trav || {}).length} hely eddig</small></button></div>`,
  home: () => petBlock() + (!p.pet && p.age >= 6 ? `<div class="grid" style="margin-bottom:8px">${mcard('🐾', 'Kisállat örökbefogadása', p.offer ? 'különleges lehetőség!' : (adoptCost() ? fmt(adoptCost()) : 'ingyen'), "adSel=null;go('adopt')")}</div>` : ''),
  illegal: () => '<p class="lg bad">⚠️ Ha elkapnak, pénzbüntetés vagy börtön jár. Börtönben nem dolgozhatsz.</p>'
};
function actPanel() {
  const a = p.age;
  const top = (p.sick ? `<p class="lg bad">🤒 Betegség: ${p.sick}. Menj orvoshoz!</p>` : '') + (p.prison > 0 ? `<p class="lg bad">⛓️ Még ${p.prison} év börtön van hátra.</p>` : '');
  return top + '<div class="grid">' + CATS.filter(C => a >= C.m).map(C => {
    const l = catAvail(C.id), n = l.filter(x => !p.done[x.id]).length + (C.id == 'fun' && !p.done.trip ? 1 : 0) + (C.id == 'money' && a >= 18 ? 1 : 0) + (C.id == 'home' && a >= 6 && !p.pet ? 1 : 0);
    return `<button class="act" onclick="go('c:${C.id}')"><b>${C.i} ${C.n}</b><small>${n ? n + ' lehetőség' : 'ebben az évben kész'}</small></button>`;
  }).join('') + '</div>';
}
function actSub(sb) {
  if (sb == 'adopt') return adoptPanel();
  if (sb == 'travel') {
    const l = DEST.filter(d => p.age >= d.m), vis = Object.keys(p.trav || {}).map(k => DEST.find(d => d.id == k)).filter(Boolean).map(d => d.i + ' ' + d.n).join(', ');
    return `<div class="card"><div class="top"><b>🌍 Utazások</b><small>${Object.keys(p.trav || {}).length}/${DEST.length}</small></div><small>${vis || 'Még sehol sem jártál.'} Évente egy utat tehetsz.</small></div><div class="grid">` + l.map(d => abtn({ i: d.i, n: d.n, c: p.age < 18 ? 0 : d.c, r: ['hap', 'sma'], done: p.done.trip, fn: `travel('${d.id}')` })).join('') + '</div>';
  }
  if (sb == 'inv') return invPanel();
  const cid = sb.slice(2), l = catAvail(cid);
  return (CATX[cid] ? CATX[cid]() : '') + (l.length ? '<div class="grid">' + l.map(actBtn).join('') + '</div>' : '<p class="empty">Most nincs elérhető teendő.</p>');
}

// --- vagyon panel és részletek ---
const asCost = (x, b, f) => Math.round((b + x.v * f) / 1e3) * 1e3;
function asList(x, i) {
  const L = [], t = x.t, cond = x.cond == null ? 80 : x.cond;
  if (t == 'car' || t == 'bike') {
    L.push({ k: 'svc', i: '🔧', n: 'Szerviz', c: asCost(x, 6e4, .008), r: ['cond'], run: () => { x.cond = cl(cond + R(25, 40)); fxlog(`Átnézették: ${x.n}. Megbízhatóbban fut.`, { hap: 2 }); } });
    L.push({ k: 'tune', i: '🛠️', n: 'Tuning', c: 3e5, r: ['val', 'hap'], run: () => { x.v = Math.round(x.v * (1 + R(5, 11) / 100)); x.cond = cl(cond - 5); fxlog(`Átalakítottad: ${x.n}. Értékesebb és menőbb lett.`, { hap: R(3, 7) }); } });
    L.push({ k: 'trip', i: '🛣️', n: 'Hosszú út', c: 3e4, r: ['hap'], u: () => p.lic, run: () => { x.cond = cl(cond - R(2, 6)); fxlog(`Nagyot mentél vele: ${x.n}.`, { hap: R(5, 10) }); } });
    L.push({ k: 'race', i: '🏁', n: 'Utcai verseny', r: ['money', 'hap'], risk: 1, u: () => p.lic && cond >= 40 && p.age >= 18, run: () => {
      if (roll(.4 + cond / 400)) fxlog('Megnyerted az utcai versenyt!', { money: R(3, 12) * 1e5, hap: 8 });
      else if (roll(.35)) { const pay = x.ins ? Math.round(x.v * .6) : 0, f = { hea: -R(10, 25), hap: -12 }; if (pay) f.money = pay; p.assets.splice(i, 1); Object.keys(p.done).forEach(q => q.startsWith('as') && delete p.done[q]); sub = null; fxlog(`Karambol! A járműved (${x.n}) totálkáros lett.`, f); }
      else { x.cond = cl(cond - R(15, 30)); fxlog('Elbuktad a versenyt, megsérült a jármű.', { hea: -R(2, 8), hap: -6 }); } } });
  }
  if (t == 'item') L.push({ k: 'use', i: x.i, n: 'Használat', r: [x.sk || 'hap'], run: () => { x.cond = cl(cond - R(1, 4)); fxlog(`Használtad: ${x.n}. Jó kikapcsolódás.`, { hap: R(3, 7), [x.sk || 'hap']: R(1, 3) }); } });
  if (t == 'house') {
    L.push({ k: 'reno', i: '🛠️', n: 'Felújítás', c: asCost(x, 4e5, .01), r: ['cond', 'val', 'hap'], run: () => { x.cond = cl(cond + R(30, 50)); x.v = Math.round(x.v * (1 + R(4, 9) / 100)); fxlog(`Felújítottad: ${x.n}.`, { hap: R(5, 9) }); } });
    L.push({ k: 'garden', i: '🌳', n: 'Kertépítés', c: 2e5, r: ['val', 'hap'], run: () => { x.v = Math.round(x.v * (1 + R(2, 4) / 100)); fxlog('Gyönyörű kertet építettél.', { hap: R(3, 6) }); } });
    L.push({ k: 'rent', i: '🔑', n: x.rent ? 'Bérlő kiköltöztetése' : `Kiadás bérlőnek (~${fmt(Math.round(x.v * .04))}/év)`, r: x.rent ? [] : ['money'], run: () => { x.rent = !x.rent; fxlog(x.rent ? `Kiadtad bérlőnek: ${x.n}.` : `Már nem adod ki: ${x.n}.`, {}); } });
  }
  if (t == 'boat') {
    L.push({ k: 'svc', i: '🔧', n: 'Karbantartás', c: asCost(x, 2e5, .005), r: ['cond'], run: () => { x.cond = cl(cond + R(25, 40)); fxlog('Karbantartottad a hajót.', { hap: 2 }); } });
    L.push({ k: 'cruise', i: '⛵', n: 'Hajókirándulás', c: 8e4, r: ['hap'], run: () => { x.cond = cl(cond - R(2, 5)); fxlog('Nagyot vitorlásztál.', { hap: R(8, 14) }); } });
  }
  if (t == 'art') {
    L.push({ k: 'show', i: '🏛️', n: 'Kölcsönadás kiállításra', r: ['val', 'hap'], run: () => { x.v = Math.round(x.v * (1 + R(1, 8) / 100)); fxlog('A festményed kiállításon szerepelt, nőtt az értéke.', { hap: 3 }); } });
    L.push({ k: 'rest', i: '🖌️', n: 'Restauráltatás', c: 2e5, r: ['cond', 'val'], run: () => { x.cond = cl(cond + R(25, 40)); x.v = Math.round(x.v * (1 + R(3, 7) / 100)); fxlog('Restauráltattad a festményt.', {}); } });
  }
  if (t == 'jewel') L.push({ k: 'appr', i: '🔍', n: 'Értékbecslés', c: 2e4, r: ['val'], run: () => { x.v = Math.round(x.v * (1 + R(-3, 6) / 100)); fxlog(`Értékbecsléssel frissítetted: ${x.n}.`, {}); } });
  L.push({ k: 'ins', i: '🛡️', n: x.ins ? 'Biztosítás felmondása' : `Biztosítás (${fmt(Math.round(x.v * .025))}/év)`, r: x.ins ? [] : ['🛡️'], run: () => { x.ins = !x.ins; fxlog(x.ins ? `Biztosítást kötöttél: ${x.n}.` : `Felmondtad a biztosítást: ${x.n}.`, {}); } });
  return L;
}
function asAct(i, k) {
  const x = p.assets[i]; if (!x) return; const e = asList(x, i).find(q => q.k == k); if (!e) return; const id = 'as' + i + k, c = p.age < 18 ? 0 : e.c || 0;
  if (p.done[id] || !can(c)) return; p.done[id] = 1; if (!parentGate(e.c || 0, e.n)) return render(); p.money -= c; e.run(); render();
}
function assetDetail(i) {
  const x = p.assets[i]; if (!x) return '<p class="empty">Ez a tárgy már nincs meg.</p>'; const cond = Math.round(x.cond == null ? 80 : x.cond);
  const head = `<div class="card"><div class="top"><b>${x.i} ${x.n}</b><small>${fmt(x.v)}</small></div><div class="tr"><i style="width:${cond}%"></i></div><small>Állapot ${cond}/100${x.ins ? ' · biztosítva' : ''}${x.rent ? ` · kiadva (~${fmt(Math.round(x.v * .04))}/év)` : ''}</small></div>`;
  return head + '<div class="grid">' + asList(x, i).filter(e => !e.u || e.u()).map(e => abtn({ i: e.i, n: e.n, c: p.age < 18 ? 0 : e.c || 0, r: e.r, risk: e.risk, done: p.done['as' + i + e.k], fn: `asAct(${i},'${e.k}')` })).join('') + abtn({ i: '💸', n: `Eladás (${fmt(x.v)})`, r: ['money'], fn: `sell(${i})` }) + '</div>';
}
const FSUB = { bank: 'Bank', inv: 'Befektetések', own: 'Tulajdonom', shop: 'Vásárlás', 'shop:style': 'Ruházat és szépség', 'shop:fun': 'Élmények', 'shop:edu': 'Tanulás', 'shop:care': 'Egészség', 'fin:house': 'Ingatlan', 'fin:veh': 'Járművek', 'fin:item': 'Tárgyak', 'fin:lux': 'Luxus' };
const FGRP = { 'fin:house': ['house'], 'fin:veh': ['car', 'bike'], 'fin:item': ['item'], 'fin:lux': ['boat', 'art', 'jewel'] };
function loanTake(m) { if (!(m > 0) || p.age < 20 || (p.debt || 0) + m * 1.1 > 1e7) return; p.debt = (p.debt || 0) + Math.round(m * 1.1); fxlog('Hitelt vettél fel, évi 12% kamattal.', { money: m }); render(); }
function repayAll() { const m = Math.min(p.debt || 0, Math.max(0, p.money)); if (m <= 0) return; p.money -= m; p.debt -= m; lg(`Törlesztettél ${fmt(m)}-ot.` + (p.debt > 0 ? ` Hátralévő tartozás: ${fmt(p.debt)}.` : ' Már nincs tartozásod!'), 'good'); render(); }
function deposit(m) { if (p.age < 18 || !can(m)) return; p.money -= m; p.sav = (p.sav || 0) + m; lg(`Betétbe tettél ${fmt(m)}-ot.`); render(); }
function withdraw() { const v = p.sav || 0; if (!v) return; p.sav = 0; p.money += v; lg(`Kivetted a betétedet: ${fmt(v)}.`, 'good'); render(); }
function bankPanel() {
  if (p.age < 18) return '<p class="empty">18 évesen mehetsz a bankba.</p>';
  const d = p.debt || 0, max = Math.max(0, Math.floor((1e7 - d) / 1.1 / 1e5) * 1e5), v = Math.min(max, 5e5);
  const info = `<div class="card"><div class="top"><b>🏦 Bankszámla</b><small>${fmt(p.money)}</small></div><small>Betét: ${fmt(p.sav || 0)} (évi 3%) · Tartozás: ${fmt(d)} (évi 12%)</small></div>`;
  const loan = p.age < 20 ? '<h3>Hitel</h3><p class="empty">20 éves korig a szüleid támogatnak, ezért nem vehetsz fel hitelt.</p>'
    : max < 1e5 ? '<h3>Hitel</h3><p class="empty">Elérted a hitelkeretedet.</p>'
    : `<h3>Hitel</h3><div class="card"><div class="top"><b>💸 Mennyit vennél fel?</b><small id="loanv">${fmt(v)}</small></div><input type="range" class="sl" id="loanr" min="100000" max="${max}" step="100000" value="${v}" oninput="document.getElementById('loanv').textContent=fmt(+this.value)"><small>Évi 12% kamat és 10% kezelési díj. Legfeljebb ${fmt(max)}.</small><div class="btns"><button onclick="loanTake(+document.getElementById('loanr').value)">Hitelt veszek fel</button></div></div>`;
  return info + loan + '<div class="grid" style="margin-top:8px">' + abtn({ i: '💳', n: 'Törlesztés', off: !(d > 0 && p.money > 0), r: ['hap'], fn: 'repayAll()' }) + '</div>'
    + '<h3>Megtakarítás</h3><div class="grid">' + [1e5, 1e6].map(m => abtn({ i: '💰', n: 'Betét ' + fmt(m), off: !can(m), fn: `deposit(${m})` })).join('') + abtn({ i: '🏧', n: 'Kivét', off: !(p.sav > 0), fn: 'withdraw()' }) + '</div>';
}
const SHOP = {
  'shop:style': ['Ruházat és szépség', [{ id: 'cl1', i: '👕', n: 'Divatos ruha', c: 6e4, fx: { loo: 3, hap: 2 } }, { id: 'cl2', i: '👟', n: 'Márkás cipő', c: 9e4, fx: { loo: 2, hap: 3 } }, { id: 'cl3', i: '💇', n: 'Fodrász', c: 4e4, fx: { loo: 4 } }, { id: 'cl4', i: '💄', n: 'Szépségápolás', c: 8e4, fx: { loo: 5, hap: 1 } }, { id: 'cl5', i: '🕶️', n: 'Designer napszemüveg', c: 2.5e5, fx: { loo: 5, hap: 3 } }, { id: 'cl6', i: '🤵', n: 'Öltöny, estélyi', c: 4e5, fx: { loo: 7, hap: 3 } }]],
  'shop:fun': ['Élmények', [{ id: 'f1', i: '🍽️', n: 'Étterem', c: 5e4, fx: { hap: 4 } }, { id: 'f2', i: '🎟️', n: 'Koncertjegy', c: 8e4, fx: { hap: 6 } }, { id: 'f3', i: '🎬', n: 'Mozi és popcorn', c: 2e4, fx: { hap: 3 } }, { id: 'f4', i: '🎢', n: 'Vidámpark', c: 6e4, fx: { hap: 5 } }, { id: 'f5', i: '🍾', n: 'Luxusvacsora', c: 3e5, fx: { hap: 8 } }]],
  'shop:edu': ['Tanulás', [{ id: 'e1', i: '📚', n: 'Könyvek', c: 3e4, fx: { sma: 3 } }, { id: 'e2', i: '🎓', n: 'Online tanfolyam', c: 1.2e5, fx: { sma: 5 } }, { id: 'e3', i: '🧑‍🏫', n: 'Magántanár', c: 2.5e5, fx: { sma: 6, hap: 1 } }]],
  'shop:care': ['Egészség', [{ id: 'h1', i: '💊', n: 'Vitaminok', c: 3e4, fx: { hea: 3 } }, { id: 'h2', i: '🏋️', n: 'Edzőterem-bérlet', c: 1.5e5, fx: { hea: 4, hap: 2 } }, { id: 'h3', i: '💆', n: 'Masszázs, wellness', c: 1e5, fx: { hea: 2, hap: 5 } }, { id: 'h4', i: '🩺', n: 'Magán-szűrővizsgálat', c: 2e5, fx: { hea: 6 } }]]
};
function shopBuy(id) {
  let x = null; Object.values(SHOP).forEach(g => g[1].forEach(q => { if (q.id == id) x = q; })); if (!x || p.done['sh' + id] || p.done['shn' + id] || p.age < 6) return;
  const c = p.age < 18 ? 0 : x.c; if (!can(c)) return;
  if (!parentGate(x.c, x.n)) { p.done['shn' + id] = 1; return render(); }
  p.done['sh' + id] = 1; p.money -= c; fxlog(`${x.i} ${x.n}.`, x.fx); render();
}
function ownCard(x, i) { return `<div class="card pc" onclick="go('a:${i}')"><div class="top"><b>${x.i} ${x.n}</b><small>${fmt(x.v)} ›</small></div><div class="tr"><i style="width:${x.cond == null ? 80 : x.cond}%"></i></div><small>Állapot ${Math.round(x.cond == null ? 80 : x.cond)}/100${x.ins ? ' · biztosítva' : ''}${x.rent ? ' · kiadva' : ''}</small></div>`; }
function finSub(sb) {
  if (sb == 'bank') return bankPanel();
  if (sb == 'inv') return invPanel();
  if (sb == 'own') return p.assets.map(ownCard).join('') || '<p class="empty">Még nincs semmid. Nézz körül a Bolt és Ingatlan menüben!</p>';
  if (sb == 'shop') { const n = k => p.assets.filter(x => FGRP[k].includes(x.t)).length, m = (ic, t, d, to) => mcard(ic, t, d, `go('${to}')`);
    return '<div class="grid">' + m('🏠', 'Ingatlan', n('fin:house') + ' db', 'fin:house') + m('🚗', 'Járművek', n('fin:veh') + ' db', 'fin:veh') + m('🎸', 'Tárgyak', 'hangszer, gadget', 'fin:item') + m('💎', 'Luxus', n('fin:lux') + ' db', 'fin:lux')
      + Object.entries(SHOP).map(([k, g]) => m({ 'shop:style': '👕', 'shop:fun': '🎟️', 'shop:edu': '📚', 'shop:care': '💊' }[k], g[0], g[1].length + ' lehetőség', k)).join('') + '</div>'; }
  if (SHOP[sb]) return '<div class="grid">' + SHOP[sb][1].map(x => abtn({ i: x.i, n: x.n, c: p.age < 18 ? 0 : x.c, r: Object.keys(x.fx), done: p.done['sh' + x.id], off: p.done['shn' + x.id] || p.age < 6, note: p.done['shn' + x.id] ? 'nem engedték' : '', fn: `shopBuy('${x.id}')` })).join('') + '</div>';
  const ts = FGRP[sb]; if (!ts) return '';
  const minA = ts.includes('item') ? 12 : 18;
  const own = p.assets.map((x, i) => ts.includes(x.t) ? ownCard(x, i) : '').join('');
  const shop = p.age < minA ? `<p class="empty">${minA} évesen vásárolhatsz.</p>` : '<h3>Vásárlás</h3><div class="grid">' + ASSETS.map((x, i) => [x, i]).filter(([x]) => ts.includes(x.t)).map(([x, i]) => { const lic = (x.t == 'car' || x.t == 'bike') && !p.lic; return abtn({ i: x.i, n: x.n, c: x.v, off: lic || p.done['nb' + i], note: lic ? '🪪 kell' : p.done['nb' + i] ? 'nem engedték' : '', fn: `buy(${i})` }); }).join('') + '</div>';
  return (own ? '<h3>Tulajdonod</h3>' + own : '') + shop;
}
function assetsPanel() {
  const a = p.age, m = (ic, t, sb, to) => mcard(ic, t, sb, `go('${to}')`);
  return row('Nettó vagyon', fmt(netw()), `<small>Készpénz ${fmt(p.money)} · Betét ${fmt(p.sav || 0)} · Befektetés ${fmt((p.inv || 0) + (p.cry || 0))}${p.debt > 0 ? ` · Tartozás ${fmt(p.debt)}` : ''}</small>`)
    + (a < 20 ? '<p class="empty">👪 20 éves korig a szüleid támogatnak, nem adósodhatsz el, de a drága dolgokba nehezebben egyeznek bele.</p>' : '')
    + '<h3>Pénzügy</h3><div class="grid">' + (a >= 18 ? m('🏦', 'Bank', 'hitel, betét', 'bank') + m('📈', 'Befektetések', 'részvény, kripto', 'inv') : '')
    + m('🛍️', 'Vásárlás', 'ingatlan, jármű, ruha, élmény', 'shop') + m('🎒', 'Tulajdonom', p.assets.length + ' tárgy', 'own') + '</div>';
}
function assetsYear() {
  let rent = 0, prem = 0;
  p.assets.forEach(x => {
    x.cond = cl((x.cond == null ? 80 : x.cond) - R(4, 10));
    const g = x.t == 'car' || x.t == 'bike' ? -R(6, 12) / 100 : x.t == 'house' ? R(2, 8) / 100 : x.t == 'art' ? R(-4, 14) / 100 : x.t == 'boat' ? -R(2, 7) / 100 : x.t == 'item' ? -R(8, 15) / 100 : R(0, 4) / 100;
    x.v = Math.round(x.v * (1 + g) * (x.cond < 30 ? .97 : 1));
    if (x.ins && p.age >= 18) prem += Math.round(x.v * .025);
    if (x.rent && x.t == 'house' && x.cond >= 40) rent += Math.round(x.v * .04);
  });
  if (prem) { p.money -= prem; lg(`🛡️ Biztosítási díjak: −${fmt(prem)}.`); }
  if (rent) { p.money += rent; lg(`🔑 Bérleti díj: +${fmt(rent)}.`, 'good'); }
  const h = p.assets.find(x => x.rent && x.t == 'house'); if (h && Math.random() < .12) { h.cond = cl(h.cond - R(10, 25)); lg('A bérlő megrongálta a lakást.', 'bad'); }
}

// --- hobbi részletoldal ---
function hobbyDetail(id) {
  const x = HOB.find(q => q.id == id), h = p.hob[id]; if (!x || !h) return '<p class="empty">Ezt a hobbit már nem űzöd.</p>';
  const a = p.age, c = a < 18 ? 0 : x.c || 0, ce = a < 18 ? 0 : 2e4, cl_ = a < 18 ? 0 : 1.2e5, ceq = a < 18 ? 0 : (x.c0 || 5e4) * 2;
  const friends = p.rel.filter(r => r.alive && ['Barát', 'Testvér', 'Párod', 'Házastárs', 'Osztálytárs'].includes(r.role));
  return `<div class="card"><div class="top"><b>${x.i} ${x.n}</b><small>${hobT(h.lv)} · ${Math.round(h.lv)}/100</small></div><div class="tr"><i style="width:${h.lv}%"></i></div><small>${h.eq ? '🎒 Saját felszerelés · ' : ''}Gyakorlás nélkül a szint lassan csökken.</small></div><div class="grid">`
    + abtn({ i: '🎯', n: 'Gyakorlás', c, r: ['lv', 'hap'], done: p.done['h' + id], fn: `hobPrac('${id}')` })
    + abtn({ i: '👨‍🏫', n: 'Órák / edző', c: cl_, r: ['lv'], done: p.done['hl' + id], fn: `hobLesson('${id}')` })
    + (h.lv >= 30 ? abtn({ i: '🏆', n: x.cn, c: ce, r: ['money', 'hap'], done: p.done['hc' + id], fn: `hobComp('${id}')` }) : '')
    + (h.lv >= 60 ? abtn({ i: '🧑‍🎓', n: 'Tanítás', r: ['money'], done: p.done['ht' + id], fn: `hobTeach('${id}')` }) : '')
    + (friends.length ? abtn({ i: '🤝', n: 'Közös gyakorlás', r: ['lv', 'bond'], done: p.done['hf' + id], fn: `hobFriend('${id}')` }) : '')
    + (!h.eq ? abtn({ i: '🎒', n: 'Felszerelés', c: ceq, r: ['lv'], fn: `hobEquip('${id}')` }) : '')
    + abtn({ i: '🚪', n: 'Abbahagyom', fn: `quitHob('${id}')` }) + '</div>';
}
function hobLesson(id) { const x = HOB.find(q => q.id == id), h = p.hob[id], c = p.age < 18 ? 0 : 1.2e5; if (!h || p.done['hl' + id] || !can(c)) return; p.done['hl' + id] = 1; p.money -= c; h.lv = cl(h.lv + R(10, 18)); h.prac = 1; fxlog(`Órákat vettél: ${x.n}. Sokat fejlődtél.`, { hap: 3, sma: 1 }); render(); }
function hobEquip(id) { const x = HOB.find(q => q.id == id), h = p.hob[id], c = p.age < 18 ? 0 : (x.c0 || 5e4) * 2; if (!h || h.eq || !can(c)) return; p.money -= c; h.eq = 1; fxlog(`Profi felszerelést vettél: ${x.n}.`, { hap: 5 }); render(); }
function hobTeach(id) { const x = HOB.find(q => q.id == id), h = p.hob[id]; if (!h || h.lv < 60 || p.done['ht' + id]) return; p.done['ht' + id] = 1; h.prac = 1; fxlog(`Tanítottál másokat: ${x.n}.`, { money: rk(R(5, 15) * 1e4 * (h.lv / 50)), hap: 3 }); render(); }
function hobFriend(id) { const x = HOB.find(q => q.id == id), h = p.hob[id], l = p.rel.filter(r => r.alive && ['Barát', 'Testvér', 'Párod', 'Házastárs', 'Osztálytárs'].includes(r.role)); if (!h || !l.length || p.done['hf' + id]) return; p.done['hf' + id] = 1; const r = P(l); r.bond = cl(r.bond + R(4, 9)); h.lv = cl(h.lv + R(3, 7)); h.prac = 1; fxlog(`Együtt gyakoroltatok (${x.n}): ${r.n}.`, { hap: R(3, 6) }); render(); }
function hobbyPanel() {
  const a = p.age; if (p.prison > 0 || a < 4) return '';
  const own = Object.keys(p.hob).map(id => { const x = HOB.find(q => q.id == id), h = p.hob[id]; return `<div class="card pc" onclick="go('h:${id}')"><div class="top"><b>${x.i} ${x.n}</b><small>${hobT(h.lv)} · ${Math.round(h.lv)}/100 ›</small></div><div class="tr"><i style="width:${h.lv}%"></i></div></div>`; }).join('');
  const fresh = HOB.filter(x => !p.hob[x.id] && a >= x.m).map(x => abtn({ i: x.i, n: x.n, c: a < 18 ? 0 : x.c0 || 0, r: ['hap'], off: hobN() >= 3, fn: `startHob('${x.id}')` })).join('');
  return `<h3>Hobbik (${hobN()}/3)</h3>` + (own || '<p class="empty">Még nincs hobbid.</p>') + (hobN() < 3 && fresh ? `<h3>Új hobbi kezdése</h3><div class="grid">${fresh}</div>` : '');
}

// --- munka: rangok, teendők, állásváltás ---
const JR = ['Gyakornok', 'Junior', 'Medior', 'Senior', 'Csoportvezető', 'Osztályvezető', 'Igazgató'];
const JA = [
  { id: 'ot', i: '⏰', n: 'Túlóra', g: [10, 18], fx: { hea: -2, hap: -2 }, r: ['jp'], t: 'Bent maradtál túlórázni, észrevették a szorgalmad.' },
  { id: 'train', i: '📘', n: 'Továbbképzés', c: 1e5, g: [8, 14], fx: { sma: 2 }, r: ['jp', 'sma'], t: 'Továbbképzésen vettél részt.' },
  { id: 'team', i: '🍻', n: 'Csapatépítés', c: 3e4, g: [5, 9], fx: { hap: 3 }, r: ['jp', 'hap'], t: 'Jót csapatépítettetek a kollégákkal.' },
  { id: 'boss', i: '🗣️', n: 'Beszélgetés a főnökkel', w: .8, g: [4, 10], fx: {}, r: ['jp'], t: 'Hasznosat beszélgettél a főnököddel.', tf: 'Rossz pillanatban kerested a főnököt.' },
  { id: 'net', i: '🤝', n: 'Kapcsolatépítés', c: 5e4, r: ['jp', 'bond'], run: () => { p.jp = cl((p.jp || 0) + R(6, 10)); if (roll(.4) && p.rel.filter(r => r.alive && r.role == 'Munkatárs').length < 4) { const q = person('Munkatárs', R(22, 55), 45, P(['f', 'm'])); p.rel.push(q); fxlog(`Új kollégával kötöttél barátságot: ${q.n}.`, { hap: 3 }); } else fxlog('Jó kapcsolatokat építettél a cégnél.', { hap: 2 }); } },
  { id: 'mentor', i: '🧭', n: 'Mentort keresek', r: ['jp', 'bond'], u: () => !p.rel.some(r => r.alive && r.role == 'Mentor'), run: () => { if (roll(.5)) { const q = person('Mentor', R(40, 60), 50, P(['f', 'm'])); p.rel.push(q); p.jp = cl((p.jp || 0) + 8); fxlog(`Mentorod lett: ${q.n}.`, { hap: 5 }); } else fxlog('Most nem találtál megfelelő mentort.', { hap: -1 }); } },
  { id: 'vac', i: '🏝️', n: 'Szabadság', r: ['hap', 'hea'], run: () => { p.jp = cl((p.jp || 0) - 3); fxlog('Kivettél pár nap szabadságot, kipihented magad.', { hap: R(6, 10), hea: 2 }); } },
  { id: 'side', i: '🧰', n: 'Mellékállás', r: ['money'], run: () => { p.jp = cl((p.jp || 0) - 2); fxlog('Mellékállásban dolgoztál.', { money: R(5, 15) * 1e4, hap: -2 }); } },
  { id: 'raise', i: '💵', n: 'Fizetésemelés kérése', r: ['money'], run: () => { if (roll(.2 + (p.jp || 0) / 200)) fxlog('A főnök belement a fizetésemelésbe!', { raise: .08, hap: 6 }); else { p.jp = cl((p.jp || 0) - 5); fxlog('Nem kaptál fizetésemelést.', { hap: -4 }); } } }
];
function jobActs() {
  const a = p.age, jp = Math.round(p.jp || 0);
  return `<div class="card"><div class="top"><b>Munkahelyi megítélés</b><small>${jp}/100</small></div><div class="tr"><i style="width:${jp}%"></i></div><small>Magas megítélésnél több az előléptetés, alacsonynál nagyobb a kirúgás esélye.</small></div><h3>Munkahelyi tevékenységek</h3><div class="grid">`
    + JA.filter(x => !x.u || x.u()).map(x => abtn({ i: x.i, n: x.n, c: a < 18 ? 0 : x.c || 0, r: x.r, done: p.done['j' + x.id], fn: `doJobAct('${x.id}')` })).join('') + '</div>';
}
function doJobAct(id) {
  const x = JA.find(q => q.id == id), k = 'j' + id, c = p.age < 18 ? 0 : x.c || 0; if (!p.job || p.done[k] || !can(c)) return;
  p.done[k] = 1; p.money -= c;
  if (x.run) x.run(); else if (Math.random() < (x.w == null ? 1 : x.w)) { p.jp = cl((p.jp || 0) + R(x.g[0], x.g[1])); fxlog(x.t, x.fx || {}); } else fxlog(x.tf, { hap: -2 });
  render();
}
function jobList() {
  return JOBS.map(j => {
    const ok = p.edu >= j.e && p.loo >= (j.l || 0) && !p.done.job && !(j.c && p.crim) && (!j.lic || p.lic) && j.n != p.job;
    return row(j.n, fmt(j.pay) + ' / év' + (p.job ? ` (${j.pay >= p.pay ? '+' : ''}${fmt(j.pay - p.pay)})` : ''), `<small>${T(EDU[j.e])}${j.s ? `, okosság ${j.s}+` : ''}${j.l ? `, kinézet ${j.l}+` : ''}${j.c ? ', tiszta előélet' : ''}${j.lic ? ', jogosítvány' : ''}</small><div class="btns"><button ${ok ? '' : 'disabled'} onclick="applyJob('${j.n}')">Jelentkezés</button></div>`);
  }).join('');
}
let jt = 'n';
const setJt = x => { jt = x; render(); };
const mcard = (i, t, sb, fn) => `<button class="act" onclick="${fn}"><b>${i} ${t}</b>${sb ? `<small>${sb}</small>` : ''}</button>`;
function occ() {
  const a = p.age;
  if (p.prison > 0) return ['⛓️', T(['Börtön', 'Prison'])];
  if (inSchool()) return a < 6 ? ['🧸', T(['Óvoda', 'Preschool'])] : p.uni ? ['🎓', T(['Egyetem', 'University'])] : a < 14 ? ['🏫', T(['Iskola', 'School'])] : ['🎒', T(['Iskola', 'School'])];
  if (p.car) return [CAR_BY[p.car.id].i, T(['Munka', 'Work'])];
  if (p.job) return ['💼', T(['Munka', 'Work'])];
  if (a < 3) return ['🍼', T(['Otthon', 'Home'])];
  if (a >= 65) return ['🏖️', T(['Nyugdíj', 'Retired'])];
  return ['🔍', T(['Munkanélküli', 'Jobless'])];
}
const inSchool = () => p.age >= 3 && (p.age < 18 || p.uni);
const sName = () => p.age < 6 ? 'Óvoda' : p.uni ? 'Egyetem' : 'Iskola';
const gr = () => p.gr == null ? 50 : p.gr, gg = d => { p.gr = cl(gr() + d); };
function mate(t) {
  const sc = schoolId(), l = mates(sc);
  if (!l.length || (l.length < 6 && roll(.5))) { const q = mkMate(sc); p.rel.push(q); fxlog(`${t} Megismerkedtél egy osztálytársaddal: ${q.n}.`, { hap: 4 }); }
  else { const r = P(l); r.bond = cl(r.bond + R(4, 9)); fxlog(`${t} Közelebb kerültél hozzá: ${r.n}.`, { hap: 3 }); }
}
function exam(t) { const sc = (p.sma + gr()) / 2 + R(-20, 20); if (sc >= 60) { gg(R(5, 9)); fxlog(`${t}: remekül sikerült!`, { hap: 4 }); } else if (sc >= 40) { gg(1); fxlog(`${t}: közepesen sikerült.`, { hap: 0 }); } else { gg(-6); fxlog(`${t}: rosszul sikerült.`, { hap: -4 }); } }
const SCH = [
  { id: 'kplay', i: '🧸', n: 'Játék a csoportban', a: [3, 5], r: ['hap', 'bond'], run: () => mate('Együtt játszottatok az óvodában.') },
  { id: 'kdraw', i: '🎨', n: 'Rajzolás, barkácsolás', a: [3, 5], r: ['hap', 'sma'], run: () => fxlog('Szép dolgokat alkottál az óvodában.', { hap: R(3, 6), sma: 1 }) },
  { id: 'ksong', i: '🎶', n: 'Éneklés, mondókák', a: [3, 5], r: ['hap', 'sma'], run: () => fxlog('Mondókákat tanultál az óvónénivel.', { hap: R(2, 5), sma: R(1, 2) }) },
  { id: 'knap', i: '😴', n: 'Délutáni alvás', a: [3, 5], r: ['hea'], run: () => fxlog('Jót aludtál a délutáni pihenőn.', { hea: 3, hap: 1 }) },
  { id: 'study', i: '📚', n: 'Tanulás', a: [6, 17], r: ['sma', 'perf'], run: () => { gg(R(4, 8)); fxlog('Sokat tanultál, javultak a jegyeid.', { sma: R(2, 4), hap: -2 }); } },
  { id: 'hw', i: '✍️', n: 'Házi feladat', a: [6, 17], r: ['perf'], run: () => { gg(R(2, 5)); fxlog('Gondosan megírtad a házi feladatot.', { sma: 1 }); } },
  { id: 'hand', i: '🙋', n: 'Jelentkezés órán', a: [6, 17], r: ['perf', 'sma'], run: () => { if (roll(.7)) { gg(R(3, 6)); fxlog('Jól válaszoltál, a tanár dicsért.', { hap: 3, sma: 1 }); } else { gg(-1); fxlog('Rosszul válaszoltál, kicsit égtél.', { hap: -3 }); } } },
  { id: 'test', i: '📝', n: 'Dolgozat', a: [6, 17], r: ['perf'], run: () => exam('Dolgozat') },
  { id: 'brk', i: '🤝', n: 'Barátkozás szünetben', a: [6, 17], r: ['bond', 'hap'], run: () => mate('Szünetben együtt lógtatok.') },
  { id: 'pe', i: '🏃', n: 'Testnevelés', a: [6, 17], r: ['fit', 'hea'], run: () => { p.fit = cl((p.fit == null ? 30 : p.fit) + R(2, 5)); fxlog('Sokat mozogtál testnevelésen.', { hea: 2, hap: 2 }); } },
  { id: 'skip', i: '🏃‍♂️', n: 'Lógás', a: [10, 17], risk: 1, run: () => { if (roll(.4)) { gg(-6); fxlog('Lógáson kaptak, igazgatói intőt kaptál.', { hap: -6 }); } else { gg(-3); fxlog('Ellógtad a napot, jó volt, de lemaradtál.', { hap: 6 }); } } },
  { id: 'ustudy', i: '📚', n: 'Tanulás vizsgára', a: [18, 30], u: 1, r: ['sma', 'perf'], run: () => { gg(R(4, 8)); fxlog('Nyomtad a tananyagot a vizsgára.', { sma: R(2, 5), hap: -3 }); } },
  { id: 'uexam', i: '📝', n: 'Vizsga', a: [18, 30], u: 1, r: ['perf'], run: () => exam('Vizsga') },
  { id: 'ugrp', i: '👥', n: 'Tanulócsoport', a: [18, 30], u: 1, r: ['bond', 'sma'], run: () => { mate('Együtt tanultatok a csoporttal.'); gg(2); } },
  { id: 'upar', i: '🍻', n: 'Egyetemi buli', a: [18, 30], u: 1, c: 4e4, r: ['hap', 'bond'], risk: 1, run: () => { gg(-2); mate('Nagyot buliztatok.'); } },
  { id: 'uint', i: '🧑‍💼', n: 'Gyakornoki munka', a: [18, 30], u: 1, r: ['money', 'perf'], run: () => { gg(R(1, 3)); fxlog('Gyakornokoskodtál egy cégnél.', { money: R(4, 9) * 1e4, hap: -1 }); } }
];
function schoolDo(id) {
  const x = SCH.find(q => q.id == id), k = 's' + id, c = x.c || 0; if (!x || p.done[k] || !can(c)) return;
  p.done[k] = 1; p.money -= c; x.run(); render();
}
function schoolPanel() {
  const a = p.age, g = Math.round(gr()), l = SCH.filter(x => a >= x.a[0] && a <= x.a[1] && (!x.u || p.uni));
  return `<div class="card"><div class="top"><b>${occ()[0]} ${sName()}</b><small>${a < 6 ? 'Óvodás vagy' : p.uni ? 'Egyetemista vagy' : a < 14 ? 'Általános iskolás vagy' : 'Gimnazista vagy'}</small></div>` + (a >= 6 ? `<div class="top"><small>Tanulmányi eredmény</small><small>${g}/100</small></div><div class="tr"><i style="width:${g}%"></i></div>` : '') + '</div>'
    + `<h3>Tevékenységek</h3><div class="grid">` + l.map(x => abtn({ i: x.i, n: x.n, c: x.c || 0, r: x.r, risk: x.risk, done: p.done['s' + x.id], fn: `schoolDo('${x.id}')` })).join('') + '</div>';
}
function jobsScreen() {
  const a = p.age, sp = jt == 's';
  let b;
  if (sp) b = p.job ? '<p class="empty">Különleges karrierhez előbb mondj fel a mostani munkádból.</p>' : (careerList().replace('<h3>Különleges karrierek</h3>', '') || '<p class="empty">Még nincs elérhető különleges karrier a korodban.</p>');
  else b = a < 16 ? '<p class="empty">16 éves kortól vállalhatsz állást.</p>' : p.uni ? '<p class="empty">Az egyetem mellett most nem dolgozol.</p>' : jobList();
  return `<div class="seg"><button class="${sp ? '' : 'on'}" onclick="setJt('n')">💼 Sima munkák</button><button class="${sp ? 'on' : ''}" onclick="setJt('s')">⭐ Különleges</button></div>` + b;
}
function jobPanel() {
  const a = p.age;
  const h = row('Végzettség', T(EDU[p.edu]) + (p.uni ? ' (egyetemista)' : ''), '') + (a >= 17 ? row('Jogosítvány', p.lic ? 'Van' : 'Nincs', '') : '') + (p.crim ? row('Büntetett előélet', p.crim + ' ügy', '') : '') + (p.lang ? row('Nyelvtudás', p.lang + '/5', '') : '');
  const hob = a >= 4 && p.prison <= 0 ? mcard('🎨', 'Hobbik', `${hobN()}/3 hobbi`, "go('hobs')") : '';
  const sch = inSchool() && (p.job || p.car) ? mcard(a < 6 ? '🧸' : p.uni ? '🎓' : '🏫', sName(), 'Tanulmányok, barátok', "go('school')") : '';
  const G = x => x ? '<h3>Menü</h3><div class="grid">' + x + '</div>' : '';
  if (p.prison > 0) return h + '<p class="empty">Börtönben nem dolgozhatsz.</p>';
  if (p.car) return h + carPanel() + G(sch + hob);
  let top = '';
  if (p.job) top = row(p.job, `${JR[p.jr || 0]} · ${p.yrs}. éve`, `<p>Fizetés: ${fmt(p.pay)} / év</p><div class="btns"><button class="alt" onclick="quit()">Felmondok</button></div>`);
  else if (inSchool()) top = schoolPanel();
  else if (a >= 65) top = `<p class="empty">Nyugdíjas vagy: ${fmt(p.pension)} / év.</p>`;
  else if (a >= 18) top = '<div class="card"><div class="top"><b>🔍 Munkanélküli vagy</b></div><small>Nézz szét az állások között, vagy indíts különleges karriert.</small></div>';
  else if (a < 3) top = '<p class="empty">Még csecsemő vagy, a család gondoskodik rólad.</p>';
  const menu = (a >= 14 && (a < 65 || p.job) ? mcard('💼', 'Állások', 'Sima és különleges munkák', "go('jobs')") : '') + (p.job ? mcard('📋', 'Munkahelyi tevékenységek', 'Megítélés, túlóra, emelés', "go('jwork')") : '') + sch + hob;
  return h + top + G(menu);
}

// --- karrier: fejlesztések ---
const PERKS = {
  actor: [{ id: 'agent', i: '🕴️', n: 'Ügynök', c: 4e5, e: 'inc' }, { id: 'coach', i: '🎓', n: 'Színészi coach', c: 3e5, e: 'dec' }],
  athlete: [{ id: 'mgr', i: '💼', n: 'Menedzser', c: 5e5, e: 'inc' }, { id: 'camp', i: '🏕️', n: 'Edzőtábor', c: 4e5, e: 'dec' }],
  musician: [{ id: 'label', i: '📀', n: 'Lemezszerződés', c: 6e5, e: 'inc' }, { id: 'studio', i: '🎚️', n: 'Saját stúdió', c: 5e5, e: 'dec' }],
  vid: [{ id: 'mgr', i: '📊', n: 'Ügynökség', c: 3e5, e: 'inc' }, { id: 'team', i: '🎬', n: 'Vágó és csapat', c: 3e5, e: 'dec' }],
  politician: [{ id: 'pr', i: '📣', n: 'PR-csapat', c: 6e5, e: 'inc' }, { id: 'adv', i: '🧑‍⚖️', n: 'Tanácsadó', c: 4e5, e: 'dec' }]
};
['cafe', 'shop', 'startup'].forEach(k => PERKS[k] = [{ id: 'mkt', i: '📈', n: 'Marketingcsapat', c: 6e5, e: 'inc' }, { id: 'acc', i: '🧾', n: 'Könyvelő', c: 3e5, e: 'dec' }]);
const pkn = (c, e) => (c.perks || []).filter(id => { const K = (PERKS[c.id] || []).find(q => q.id == id); return K && K.e == e; }).length;
function buyPerk(id) {
  const c = p.car; if (!c) return; const K = PERKS[c.id].find(q => q.id == id), cost = K.c * (1 + c.rank); c.perks = c.perks || [];
  if (c.perks.includes(id) || !can(cost)) return; p.money -= cost; c.perks.push(id); fxlog(`${K.i} ${K.n}: új fejlesztés a karrieredben.`, { hap: 4, perf: 5 }); render();
}
function carPanel() {
  if (CAR_BY[p.car.id].cr) return crPanel();
  const c = p.car, C = CAR_BY[c.id], r = C.ranks[c.rank], nx = C.ranks[c.rank + 1], a = p.age, est = Math.round(r[1] * (.6 + c.perf / 125) * (1 + .15 * pkn(c, 'inc')));
  const card = x => abtn({ i: x.i, n: x.n, c: a < 18 ? 0 : x.c || 0, r: ['perf'].concat(x.m ? ['money'] : [], Object.keys(x.fx || {}).filter(k => x.fx[k] > 0 && SI[k])), done: p.done['c' + x.id], fn: `doCarAct('${x.id}')` });
  const perks = (PERKS[c.id] || []).map(K => (c.perks || []).includes(K.id)
    ? `<button class="act dn" disabled><b>${K.i} ${K.n}</b><small>✓ megvan · ${K.e == 'inc' ? '+15% bevétel' : 'lassabb elfáradás'}</small></button>`
    : abtn({ i: K.i, n: K.n, c: K.c * (1 + c.rank), r: [K.e == 'inc' ? 'money' : 'perf'], fn: `buyPerk('${K.id}')` })).join('');
  return row(`${C.i} ${r[0]}`, `${c.yrs}. éve · ${C.n}`, `<p>Várható bevétel: ${fmt(est)} / év</p><div class="tr"><i style="width:${c.perf}%"></i></div><small>Teljesítmény ${Math.round(c.perf)}/100 · ${nx ? `előlépéshez 75+ kell, következő: ${nx[0]}` : 'a csúcson vagy!'}</small>`)
    + `<h3>Tevékenységek ebben az évben</h3><div class="grid">${C.acts.map(card).join('')}</div><h3>Fejlesztések</h3><div class="grid">${perks}</div><div class="btns">${C.biz ? `<button class="alt" onclick="sellBiz()">Cég eladása (${fmt(bizVal())})</button>` : ''}<button class="alt" onclick="quitCar()">Felhagyok vele</button></div>`;
}

// ===== alkotók: videósok és influenszerek, platformonként külön fiókkal =====
const cNum = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.0', '') + ' M' : n >= 1e4 ? Math.round(n / 1e3) + ' e' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.0', '') + ' e' : String(n);
const isCr = () => !!(p.car && CAR_BY[p.car.id] && CAR_BY[p.car.id].cr);
const ac = (id, i, n, w, b, g, o = {}) => ({ id, i, n, w, b, g: [g[0] * 1.6, g[1] * 1.6], ...o });
const PLAT = {
  yt: { n: 'YouTube', i: '▶️', fu: 'feliratkozó', pn: 'videó', d: 'videók, Shorts, élő adás', k: 30, mon: 1000, ver: 1e5, acts: [
    ac('vid', '📹', 'Videó feltöltése', .85, [15, 70], [3, 9]), ac('sh', '📱', 'Shorts', .85, [30, 150], [2, 8]),
    ac('live', '🔴', 'Élő adás', .8, [10, 60], [2, 6], { m: [3, 10], min: 200 }), ac('col', '🤝', 'Együttműködés', .6, [50, 200], [8, 16], { min: 100, tf: 'nem jött össze' }),
    ac('edit', '🎬', 'Profi vágás és borító', .9, [20, 80], [4, 8], { c: 5e4 }), ac('sp', '💰', 'Szponzorált videó', .6, [0, 0], [1, 3], { m: [80, 200], min: 1000 })] },
  tw: { n: 'Twitch', i: '🟣', fu: 'követő', pn: 'stream', d: 'streamek, raid, subathon', k: 50, mon: 100, ver: 2e4, acts: [
    ac('st', '🎮', 'Stream', .85, [15, 80], [3, 8], { m: [3, 10], min: 50 }), ac('raid', '⚔️', 'Raid és ajánlás', .7, [30, 120], [6, 12]),
    ac('em', '😀', 'Emote-ok és overlay', .9, [10, 40], [3, 6], { c: 5e4 }), ac('sub', '🏆', 'Subathon', .6, [50, 200], [10, 20], { m: [40, 100], min: 200 }),
    ac('clip', '✂️', 'Klipek a csúcspontokból', .85, [10, 60], [2, 6]), ac('sp', '📣', 'Szponzori szerződés', .6, [0, 0], [1, 3], { m: [80, 200], min: 500 })] },
  tt: { n: 'TikTok', i: '🎵', fu: 'követő', pn: 'videó', d: 'rövid videók, trendek, live', k: 10, mon: 10000, ver: 5e4, acts: [
    ac('sv', '🎵', 'Rövid videó', .85, [30, 200], [3, 10]), ac('tr', '🔥', 'Trend / challenge', .6, [100, 500], [8, 20], { tf: 'lecsúsztál a trendről' }),
    ac('live', '🔴', 'TikTok live', .8, [10, 60], [2, 6], { m: [5, 15], min: 1000 }), ac('duet', '👯', 'Duett', .7, [40, 200], [5, 12]),
    ac('fx', '✨', 'Effektek, vágás', .9, [20, 90], [3, 7], { c: 5e4 }), ac('sp', '💰', 'Márkás videó', .6, [0, 0], [1, 3], { m: [60, 160], min: 1000 })] },
  ki: { n: 'Kick', i: '🟢', fu: 'követő', pn: 'stream', d: 'streamek, IRL, nyereményjáték', k: 60, mon: 100, ver: 1e4, acts: [
    ac('st', '🟢', 'Stream', .85, [15, 80], [3, 8], { m: [3, 10], min: 50 }), ac('irl', '🚶', 'IRL stream', .7, [30, 120], [5, 12]),
    ac('col', '🤝', 'Közös stream', .6, [50, 200], [8, 16], { min: 100 }), ac('gv', '🎁', 'Nyereményjáték', .9, [30, 150], [6, 14], { c: 1e5 }),
    ac('hl', '✂️', 'Kiemelések', .85, [10, 60], [2, 6]), ac('deal', '💰', 'Platform-szerződés', .5, [0, 0], [1, 3], { m: [100, 250], min: 500 })] },
  ig: { n: 'Instagram', i: '📸', fu: 'követő', pn: 'poszt', d: 'posztok, story, reel', k: 18, mon: 5000, ver: 5e4, acts: [
    ac('po', '📸', 'Poszt', .9, [20, 90], [2, 6]), ac('sto', '⭕', 'Story', .95, [5, 30], [1, 3]), ac('re', '🎞️', 'Reel', .8, [30, 200], [4, 12]),
    ac('sp', '💰', 'Szponzorált poszt', .65, [0, 0], [1, 3], { m: [80, 180], min: 1000 }), ac('gv', '🎁', 'Nyereményjáték', .9, [30, 150], [6, 14], { c: 1e5 }),
    ac('qa', '🔴', 'Élő Q&A', .8, [10, 60], [2, 5], { min: 100 })] },
  tx: { n: 'X', i: '🐦', fu: 'követő', pn: 'poszt', d: 'posztok, szálak, viták', k: 6, mon: 5000, ver: 3e4, acts: [
    ac('tw', '🐦', 'Poszt', .9, [10, 50], [1, 4]), ac('th', '🧵', 'Szál', .75, [30, 150], [3, 9]),
    ac('vi', '🚀', 'Virális próbálkozás', .3, [200, 800], [10, 30], { tf: 'senki nem reagált' }), ac('de', '🔥', 'Vita', .5, [100, 400], [6, 18], { risk: 1, tf: 'megtámadtak, rossz hangulat', hf: -8 }),
    ac('sp', '🎙️', 'Spaces', .8, [10, 60], [2, 6], { min: 100 }), ac('ad', '💰', 'Szponzorált poszt', .6, [0, 0], [1, 3], { m: [60, 140], min: 1000 })] },
  fb: { n: 'Facebook', i: '👍', fu: 'követő', pn: 'poszt', d: 'posztok, csoportok, élő', k: 8, mon: 5000, ver: 5e4, acts: [
    ac('po', '👍', 'Poszt', .9, [20, 90], [2, 5]), ac('gr', '👥', 'Csoport építése', .8, [20, 100], [3, 8]), ac('live', '🔴', 'Élő videó', .8, [10, 60], [2, 6], { min: 100 }),
    ac('ad', '📣', 'Hirdetés', .9, [100, 400], [5, 10], { c: 1e5 }), ac('re', '🎞️', 'Reel', .8, [30, 200], [3, 10]), ac('sp', '💰', 'Márkaegyüttműködés', .6, [0, 0], [1, 3], { m: [60, 140], min: 1000 })] }
};
const newAcc = () => ({ f: R(30, 120) + Math.round(p.loo / 3), n: 0, vw: 0, ver: false, ban: 0, act: 0 });
const crTot = c => Object.values(c.acc || {}).reduce((q, a) => q + a.f, 0);
const crTier = t => t >= 1e6 ? 4 : t >= 1e5 ? 3 : t >= 1e4 ? 2 : t >= 1e3 ? 1 : 0;
function crSync(c) {
  if (!c.acc) { const C0 = CAR_BY[c.id]; c.acc = { [C0.pl[0]]: newAcc() }; }
  if (!c.acc[c.sel]) c.sel = Object.keys(c.acc)[0];
  const t = crTot(c), tr = crTier(t), C = CAR_BY[c.id];
  if (tr > c.rank) { c.rank = tr; fxlog(`${C.i} Új szint: ${C.ranks[tr][0]}!`, { hap: 8 }); } else c.rank = tr;
  c.perf = cl(Math.round(Math.log10(t + 1) * 16));
}
function crIncome(c, real, assume) {
  let inc = 0;
  Object.entries(c.acc).forEach(([k, a]) => { const P2 = PLAT[k]; if (a.ban || a.f < P2.mon) return; inc += a.f * P2.k * (a.ver ? 1.3 : 1) * (real ? R(60, 150) / 100 : 1) * (a.act || assume ? 1 : .5); });
  return rk(inc * (1 + .15 * pkn(c, 'inc')));
}
function crYear(c, C) {
  crSync(c); const inc = crIncome(c, true); p.money += inc;
  Object.entries(c.acc).forEach(([k, a]) => {
    const P2 = PLAT[k];
    if (a.ban) { a.ban--; a.act = 0; if (!a.ban) lg(`${P2.i} Visszakaptad a ${P2.n} fiókod.`, 'good'); return; }
    const g = a.act ? R(-2, 8) + (a.ver ? 3 : 0) + 2 * pkn(c, 'dec') : -Math.max(2, R(6, 16) - 3 * pkn(c, 'dec'));
    a.f = Math.max(0, Math.round(a.f * (1 + g / 100))); a.act = 0;
  });
  crSync(c); lg(`${C.i} Idei bevétel: ${fmt(inc)} · összes követő: ${cNum(crTot(c))}.`, inc > 0 ? 'good' : '');
}
function crSel(k) { if (p.car && p.car.acc && p.car.acc[k]) { p.car.sel = k; render(); } }
function crAct(k, id) {
  const c = p.car; if (!c || !c.acc || !c.acc[k]) return; const a = c.acc[k], P2 = PLAT[k], x = P2.acts.find(q => q.id == id); if (!x) return;
  const dk = 'cr' + k + id, cost = p.age < 18 ? 0 : x.c || 0;
  if (p.done[dk] || a.ban || (x.min && a.f < x.min) || !can(cost)) return;
  p.done[dk] = 1; if (!parentGate(x.c || 0, x.n)) return render(); p.money -= cost; a.act = (a.act || 0) + 1; a.n = (a.n || 0) + 1;
  if (Math.random() < (x.w == null ? 1 : x.w)) {
    const gain = Math.round((R(x.b[0], x.b[1]) + a.f * R(Math.round(x.g[0] * 10), Math.round(x.g[1] * 10)) / 1000) * (a.ver ? 1.25 : 1)); a.f += gain; a.vw = (a.vw || 0) + Math.round(gain * R(8, 40));
    const f = { hap: 2 }; if (x.m && a.f >= 500) f.money = rk(a.f * R(x.m[0], x.m[1]) / 10 * (1 + .15 * pkn(c, 'inc')));
    fxlog(`${P2.i} ${x.n}: jól sikerült! +${cNum(gain)} ${P2.fu}.`, f);
  } else {
    const loss = Math.round(a.f * R(1, 4) / 100); a.f = Math.max(0, a.f - loss);
    fxlog(`${P2.i} ${x.n}: ${x.tf || 'nem hozott eredményt'}.${loss ? ` (−${cNum(loss)} ${P2.fu})` : ''}`, { hap: x.hf || -3 });
  }
  crSync(c); render();
}
function crVerify(k) {
  const c = p.car; if (!c || !c.acc || !c.acc[k]) return; const a = c.acc[k], P2 = PLAT[k], dk = 'crv' + k;
  if (a.ver || a.ban || a.f < P2.ver || p.done[dk]) return; p.done[dk] = 1;
  if (Math.random() < .55 + .2 * pkn(c, 'inc')) { a.ver = true; fxlog(`✅ Hitelesítették a ${P2.n} fiókodat! Több bevétel és gyorsabb növekedés.`, { hap: 12 }); }
  else fxlog(`${P2.i} A ${P2.n} elutasította a hitelesítési kérelmedet. Jövőre újra próbálhatod.`, { hap: -4 });
  render();
}
function crOpen(k) { const c = p.car; if (!c || !c.acc || c.acc[k] || !CAR_BY[c.id].pl.includes(k)) return; c.acc[k] = newAcc(); c.sel = k; fxlog(`${PLAT[k].i} Új fiókot nyitottál itt: ${PLAT[k].n}.`, { hap: 4 }); crSync(c); render(); }
function startCr(id, k) { const C = CAR_BY[id]; if (!C || !C.cr || !C.pl.includes(k)) return; sub = null; crPl = k; try { startCar(id); } finally { crPl = null; } }
function crStart(id) {
  const C = CAR_BY[id]; if (!C || !C.cr) return '';
  return `<div class="card"><div class="top"><b>${C.i} ${C.n}</b></div><small>Válaszd ki, melyik platformon kezdesz. Később további fiókokat is nyithatsz, és mindegyiket külön építheted.</small></div><h3>Platform</h3><div class="grid">`
    + C.pl.map(k => abtn({ i: PLAT[k].i, n: PLAT[k].n, note: PLAT[k].d, fn: `startCr('${id}','${k}')` })).join('') + '</div>';
}
function crPanel() {
  const c = p.car, C = CAR_BY[c.id], a0 = p.age; crSync(c);
  const keys = Object.keys(c.acc), k = c.sel, a = c.acc[k], P2 = PLAT[k], tot = crTot(c), veri = keys.filter(q => c.acc[q].ver).length, est = crIncome(c, false, true);
  const head = row(`${C.i} ${C.ranks[c.rank][0]}`, `${c.yrs}. éve · ${C.n}`, `<p>Összes követő: ${cNum(tot)} · várható bevétel: ${fmt(est)} / év</p><small>${keys.length} fiók · ✅ ${veri} hitelesített</small>`);
  const tabs = '<div class="seg pl">' + keys.map(q => `<button class="${q == k ? 'on' : ''}" onclick="crSel('${q}')">${PLAT[q].i} ${PLAT[q].n}${c.acc[q].ver ? ' ✅' : ''}</button>`).join('') + '</div>';
  const goal = a.ver ? P2.ver * 10 : P2.ver, pct = Math.min(100, Math.round(a.f / goal * 100));
  const card = `<div class="card"><div class="top"><b>${P2.i} ${P2.n}${a.ver ? ' ✅' : ''}</b><small>${cNum(a.f)} ${P2.fu}</small></div><div class="tr"><i style="width:${pct}%"></i></div><small>${a.n || 0} ${P2.pn} · ${cNum(a.vw || 0)} megtekintés · ${a.f >= P2.mon ? 'monetizálva' : `monetizáláshoz ${cNum(P2.mon)} ${P2.fu} kell`}${a.ver ? '' : ` · hitelesítéshez ${cNum(P2.ver)} kell`}${a.ban ? ` · ⛔ felfüggesztve (${a.ban} év)` : ''}</small></div>`;
  const acts = P2.acts.map(x => abtn({ i: x.i, n: x.n, c: a0 < 18 ? 0 : x.c || 0, r: x.m ? ['money'] : ['fol'], risk: x.risk, off: a.ban || (x.min && a.f < x.min), note: x.min && a.f < x.min ? cNum(x.min) + ' kell' : '', done: p.done['cr' + k + x.id], fn: `crAct('${k}','${x.id}')` })).join('')
    + abtn({ i: '✅', n: a.ver ? 'Hitelesített fiók' : 'Hitelesítés kérése', off: a.ver || a.ban || a.f < P2.ver, note: a.ver ? '' : a.f < P2.ver ? cNum(P2.ver) + ' kell' : '', done: p.done['crv' + k], fn: `crVerify('${k}')` });
  const more = C.pl.filter(q => !c.acc[q]).map(q => abtn({ i: PLAT[q].i, n: PLAT[q].n + ' fiók nyitása', note: PLAT[q].d, fn: `crOpen('${q}')` })).join('');
  const perks = (PERKS[c.id] || []).map(K => (c.perks || []).includes(K.id)
    ? `<button class="act dn" disabled><b>${K.i} ${K.n}</b><small>✓ megvan · ${K.e == 'inc' ? '+15% bevétel' : 'lassabb elfáradás'}</small></button>`
    : abtn({ i: K.i, n: K.n, c: K.c * (1 + c.rank), r: [K.e == 'inc' ? 'money' : 'perf'], fn: `buyPerk('${K.id}')` })).join('');
  return head + tabs + card + `<h3>${P2.n} tevékenységek</h3><div class="grid">${acts}</div>` + (more ? `<h3>Új platform</h3><div class="grid">${more}</div>` : '') + `<h3>Fejlesztések</h3><div class="grid">${perks}</div><div class="btns"><button class="alt" onclick="quitCar()">Felhagyok vele</button></div>`;
}
PERKS.inf = PERKS.vid;
CH.push(
  { a: [12, 80], u: () => isCr(), t: 'Virális tartalom', d: 'Az egyik posztod hirtelen berobbant, özönlenek az emberek.', o: [
    ['Kihasználom, sokat posztolok', [[3, 'A hullám nagyot lendített rajtad!', { fol: 45, hap: 8 }], [1, 'Gyorsan lecsengett, de pár új követőt hozott.', { fol: 10, hap: 2 }]]],
    ['Hagyom, ahogy van', [[1, 'Szépen nőtt a közönséged magától is.', { fol: 15, hap: 3 }]]]] },
  { a: [12, 80], u: () => isCr(), t: 'Fiók felfüggesztve', d: 'Az egyik platform szerint megsértetted a szabályokat, és felfüggesztették a fiókodat.', o: [
    ['Fellebbezek', [[1, 'A fellebbezés sikerült, visszakaptad.', { hap: -2 }], [1, 'A fellebbezést elutasították, egy évig nem használhatod.', { ban: 1, fol: -20, hap: -8 }]]],
    ['Elfogadom a döntést', [[1, 'Egy évre kiestél, de tanultál belőle.', { ban: 1, fol: -10, hap: -4 }]]]] }
);

// ----- kapcsolatok: kategóriák, rokonok -----
const RCATS = [['fam', '👨‍👩‍👧 Család'], ['love', '💘 Kapcsolat'], ['friend', '🧑‍🤝‍🧑 Barátok'], ['know', '👋 Ismerősök']];
const ROLECAT = { Anya: 'fam', Apa: 'fam', Testvér: 'fam', Gyerek: 'fam', Párod: 'love', Házastárs: 'love', Barát: 'friend' };
const relCat = r => r.cat || ROLECAT[r.role] || 'know';
const isPastMate = r => r.past && r.role == 'Osztálytárs';
const relIn = c => p.rel.map((r, i) => [r, i]).filter(([r]) => r.alive && (c == 'past' ? isPastMate(r) : relCat(r) == c && !(c == 'know' && isPastMate(r))));
const kinAllN = () => p.rel.reduce((n, r) => n + (r.alive ? kinN(r) : 0), 0);
function kinAll() {
  let h = ''; p.rel.forEach((r, i) => { if (!r.alive) return; (r.kin || []).forEach((q, j) => { if (!q.alive) return;
    h += `<div class="card"><div class="top"><b>${dn(q.n)}</b><small>${rl(q.role)}, ${q.age} éves</small></div><small>${rl(r.role)} oldaláról</small><div class="tr"><i style="width:${q.bond}%"></i></div><div class="grid" style="margin-top:8px">`
      + abtn({ i: '💬', n: 'Beszélgetés', r: ['bond', 'hap'], done: p.done['kt' + i + '_' + j], fn: `kinDo(${i},${j},'t')` })
      + (p.age >= 8 ? abtn({ i: '🎁', n: 'Ajándék', c: p.age < 18 ? 0 : 1e5, r: ['bond'], done: p.done['kg' + i + '_' + j], fn: `kinDo(${i},${j},'g')` }) : '')
      + (p.age >= 18 && /^Nagy/.test(q.role) ? abtn({ i: '🙏', n: 'Pénzt kérek', r: ['money'], done: p.done['km' + i + '_' + j], fn: `kinDo(${i},${j},'m')` }) : '') + '</div></div>'; }); });
  return h || '<p class="empty">Nincsenek rokonok.</p>';
}
function relMenu() {
  const g = RCATS.filter(([c]) => relIn(c).length || (c == 'fam' && p.pet) || (c == 'know' && relIn('past').length)).map(([c, t]) => { const l = relIn(c), ic = t.split(' ')[0], nm = t.slice(ic.length + 1); return mcard(ic, nm, (l.length + (c == 'fam' && p.pet ? 1 : 0)) + ' fő', `go('rc:${c}')`); }).join('')
    + (kinAllN() ? mcard('🌳', 'Rokonok', kinAllN() + ' fő', "go('rc:kin')") : '');
  return g ? '<div class="grid">' + g + '</div>' : '<p class="empty">Nincs senki körülötted.</p>';
}
function relList(head, c) {
  if (c == 'kin') return kinAll();
  const l = relIn(c), t = p.pet;
  const pc = c == 'fam' && t ? `<div class="card pc" onclick="openRel('pet')"><div class="rwrap"><div class="rav pav">${t.i}</div><div class="rbody"><div class="top"><b>${t.n}</b><small>Kisállat, ${t.k}, ${t.age} éves</small></div><div class="tr"><i style="width:${t.bond}%"></i></div></div></div><span class="chev">›</span></div>` : '';
  const rest = l.map(([r, i]) => `<div class="card pc" onclick="openRel(${i})">${head(r, '')}<span class="chev">›</span></div>`).join('');
  const pm = c == 'know' && relIn('past').length ? '<div class="grid" style="margin-top:8px">' + mcard('🎓', 'Volt osztálytársak', relIn('past').length + ' fő', "go('rc:past')") + '</div>' : '';
  return (pc + rest + pm) || '<p class="empty">Itt most nincs senki.</p>';
}
function genKin(r) {
  if (Math.random() < .3) return [];
  const a = r.age, pool = [['Nagymama', 'f', a + R(22, 32)], ['Nagypapa', 'm', a + R(24, 34)], ['Nagynéni', 'f', a + R(-8, 8)], ['Nagybácsi', 'm', a + R(-8, 8)], ['Unokatestvér', P(['f', 'm']), R(1, Math.max(2, a - 10))]], k = [];
  for (let n = R(1, 4); n > 0 && pool.length; n--) { const [role, g, ag] = pool.splice(R(0, pool.length - 1), 1)[0]; k.push(person(role, Math.max(1, ag), R(30, 70), g)); }
  return k;
}
const kinN = r => (r.kin || []).filter(q => q.alive).length;
const kinCard = i => { const r = p.rel[i], n = kinN(r); return n ? `<div class="grid" style="margin-bottom:6px">${mcard('👪', 'Rokonok', n + ' fő', `go('kin:${i}')`)}</div>` : ''; };
const ASKR = ['Osztálytárs', 'Munkatárs', 'Szomszéd', 'Riválisod', 'Mentor'];
const needAsk = (r, c) => (c == 'friend' && ASKR.includes(r.role)) || (c == 'love' && (ASKR.includes(r.role) || r.role == 'Barát'));
const catBtns = i => RCATS.map(([c, t]) => { const r = p.rel[i], cur = relCat(r) == c; return `<button class="act${cur ? ' dn' : ''}" ${cur ? 'disabled' : ''} onclick="setCat(${i},'${c}')"><b>${t}</b><small>${cur ? '✓ jelenlegi' : needAsk(r, c) ? 'megkérdezed tőle' : 'áthelyezés ide'}</small></button>`; }).join('');
function setCat(i, c) {
  const r = p.rel[i]; if (!r || !RCATS.some(x => x[0] == c) || relCat(r) == c) return;
  if (!needAsk(r, c)) { r.cat = c; return render(); }
  const n = dn(r.n), no = [[T(['Rendben', 'OK']), () => render()]];
  if (p.done['q' + i]) return popup(T(['Ma már kérdezted', 'You already asked']), T([`${n} ebben az évben már válaszolt neked. Próbáld újra jövőre, vagy töltsetek előbb több időt együtt.`, `${n} already answered you this year. Try again next year, or spend more time together first.`]), no);
  if (c == 'love') {
    if (partner()) return popup(T(['Már van párod', 'You have a partner']), T(['Egyszerre csak egy párkapcsolatod lehet.', 'You can only have one partner at a time.']), no);
    if (p.age < 16 || r.age < 16) return popup(T(['Még túl fiatal', 'Too young']), T([`Párkapcsolatot 16 éves kortól lehet kezdeni, mindkét félnek.`, 'A relationship needs both of you to be at least 16.']), no);
    if (Math.abs(r.age - p.age) > (p.age < 18 || r.age < 18 ? 3 : 30)) return popup(T(['Nagy a korkülönbség', 'Age gap']), T([`${n} és közted túl nagy a korkülönbség.`, `The age gap between you and ${n} is too big.`]), no);
  }
  const lv = c == 'love', b = r.bond;
  const ch = lv ? (b >= 75 ? .75 : b >= 60 ? .5 : b >= 45 ? .25 : .06) : (b >= 70 ? .92 : b >= 55 ? .8 : b >= 40 ? .55 : b >= 25 ? .3 : .1) * (r.role == 'Riválisod' ? .25 : 1);
  popup(lv ? T(['💘 Kapcsolat?', 'Relationship?']) : T(['🤝 Barátság?', 'Friendship?']), lv ? T([`Megkérdezed tőle: ${n}, hogy járnátok-e együtt?`, `You ask ${n} if they want to date you.`]) : T([`Megkérdezed tőle: ${n}, hogy szeretne-e a barátod lenni?`, `You ask ${n} if they want to be your friend.`]), [
    [T(['Megkérdezem', 'Ask']), () => {
      p.done['q' + i] = 1;
      if (Math.random() < ch) {
        r.was = r.was || r.role; r.role = lv ? 'Párod' : 'Barát'; r.cat = c; r.bond = cl(Math.max(b, lv ? 55 : 45) + 8);
        popup(T(['🎉 Elfogadta!', '🎉 Accepted!']), lv ? T([`${n} igent mondott. Mostantól együtt jártok.`, `${n} said yes. You are a couple now.`]) : T([`${n} igent mondott. Mostantól barátok vagytok.`, `${n} said yes. You are friends now.`]), [[T(['Örülök!', 'Great!']), () => { fxlog(lv ? `Összejöttetek: ${r.n}!` : `Barátok lettetek: ${r.n}.`, { hap: lv ? 12 : 8 }); render(); }]]);
      } else {
        r.bond = cl(b - (lv ? 8 : 4));
        popup(T(['😕 Nemet mondott', '😕 Said no']), T([`${n} most nem szeretne. A besorolás marad, ahogy eddig volt: ${roleLab(r)}.`, `${n} would rather not. Nothing changes: ${roleLab(r)}.`]), [[T(['Értem', 'I see']), () => { fxlog(lv ? `${r.n} nem akar járni veled.` : `${r.n} nem szeretne barát lenni.`, { hap: lv ? -6 : -3 }); render(); }]]);
      }
    }],
    [T(['Mégsem', 'Cancel']), () => render()]]);
}
function kinPanel(i) {
  const r = p.rel[i]; if (!r || !r.alive) return '<p class="empty">Nincs senki.</p>';
  const l = (r.kin || []).map((q, j) => [q, j]).filter(([q]) => q.alive); if (!l.length) return '<p class="empty">Nincsenek rokonok.</p>';
  return l.map(([q, j]) => `<div class="card"><div class="top"><b>${dn(q.n)}</b><small>${rl(q.role)}, ${q.age} éves</small></div><div class="tr"><i style="width:${q.bond}%"></i></div><div class="grid" style="margin-top:8px">`
    + abtn({ i: '💬', n: 'Beszélgetés', r: ['bond', 'hap'], done: p.done['kt' + i + '_' + j], fn: `kinDo(${i},${j},'t')` })
    + (p.age >= 8 ? abtn({ i: '🎁', n: 'Ajándék', c: p.age < 18 ? 0 : 1e5, r: ['bond'], done: p.done['kg' + i + '_' + j], fn: `kinDo(${i},${j},'g')` }) : '')
    + (p.age >= 18 && /^Nagy/.test(q.role) ? abtn({ i: '🙏', n: 'Pénzt kérek', r: ['money'], done: p.done['km' + i + '_' + j], fn: `kinDo(${i},${j},'m')` }) : '') + '</div></div>').join('');
}
function kinDo(i, j, k) {
  const r = p.rel[i], q = r && r.kin && r.kin[j]; if (!q || !q.alive) return; const d = 'k' + k + i + '_' + j; if (p.done[d]) return;
  if (k == 't') { p.done[d] = 1; q.bond = cl(q.bond + R(5, 12)); fxlog(`Beszélgettél vele: ${q.n}.`, { hap: 3 }); }
  else if (k == 'g') { const c = p.age < 18 ? 0 : 1e5; if (!can(c) || p.age < 8) return; p.done[d] = 1; p.money -= c; q.bond = cl(q.bond + R(8, 15)); lg(`Megajándékoztad: ${q.n}.`, 'good'); }
  else if (k == 'm') { p.done[d] = 1; if (Math.random() < .3 + q.bond / 200) fxlog(`${q.n} adott egy kis pénzt.`, { money: R(1, 5) * 1e5 }); else fxlog(`${q.n} most nem tudott segíteni.`, { hap: -2 }); }
  render();
}

function parentGate(nom, what) {
  if (p.age >= 20 || !(nom >= 5e4)) return true;
  const ch = nom <= 1.5e5 ? .6 : nom <= 6e5 ? .3 : nom <= 3e6 ? .12 : .04;
  if (Math.random() < ch) return true;
  fxlog(`A szüleid nem engedték: ${what || 'túl drága'}.`, { hap: -2 }); return false;
}
function doAct(id) {
  const x = ACT.find(q => q.id == id), c = p.age < 18 ? 0 : x.c;
  if (p.done[id] || p.dead || !can(c) || (x.k && p.prison > 0) || (x.u && !x.u())) return;
  p.done[id] = 1; if (!parentGate(x.c || 0, x.n)) return render(); p.money -= c; x.run(); if (x.fit) p.fit = cl((p.fit == null ? 30 : p.fit) + R(x.fit[0], x.fit[1])); render();
}

function crime(n, ok, loot, term) {
  if (Math.random() < ok) return loot ? fxlog(`${n}: nem kaptak el, ${fmt(loot)} a zsebedben.`, { money: loot, hap: 4 }) : fxlog(`${n}: nem kaptak el, nagy élmény volt.`, { hap: 6 });
  p.crim++;
  if (term < 2 && Math.random() < .6) return fxlog(`${n}: elkaptak! Pénzbüntetést kaptál.`, { money: p.age < 18 ? 0 : -loot * 2, hap: -10 });
  p.prison = term; p.job = null; p.pay = 0; p.car = null;
  fxlog(`${n}: elkaptak, ${term} évre börtönbe kerültél!`, { hap: -20 });
}
function buy(i) { const x = ASSETS[i]; if (p.money < x.v || p.age < (x.t == 'item' ? 12 : 18) || ((x.t == 'car' || x.t == 'bike') && !p.lic)) return; if (!parentGate(x.v, x.n)) { p.done['nb' + i] = 1; return render(); } p.money -= x.v; p.assets.push({ ...x, cond: 90, ins: false, rent: false }); fxlog(`Megvetted: ${x.n}.`, { hap: x.t == 'house' ? 12 : 8 }); render(); }
function sell(i) { const x = p.assets[i]; if (!x || !confirm(`Eladod: ${x.n} (${fmt(x.v)})?`)) return; p.money += x.v; p.assets.splice(i, 1); Object.keys(p.done).forEach(q => q.startsWith('as') && delete p.done[q]); sub = null; lg(`Eladtad: ${x.n} (${fmt(x.v)}).`, 'good'); render(); }

// ----- emberek -----
function talk(i) { const r = p.rel[i]; if (p.done['t' + i]) return; p.done['t' + i] = 1; r.bond = cl(r.bond + R(5, 12)); fxlog(`Beszélgettél vele: ${r.n}.`, { hap: 3 }); render(); }
function gift(i) { const r = p.rel[i], c = p.age < 18 ? 0 : 1e5; if (p.done['g' + i] || !can(c)) return; p.done['g' + i] = 1; p.money -= c; r.bond = cl(r.bond + R(8, 15)); lg(`Megajándékoztad: ${r.n}.`, 'good'); render(); }
function propose(i) {
  const r = p.rel[i]; p.done['p' + i] = 1;
  if (r.bond >= 65 && Math.random() < .8) { r.role = 'Házastárs'; fxlog(`Összeházasodtál vele: ${r.n}!`, { hap: 20 }); }
  else { r.bond = cl(r.bond - 12); fxlog(`${r.n} nemet mondott a kérdésedre.`, { hap: -8 }); }
  render();
}
function baby(i) {
  p.done['b' + i] = 1; const g = P(['f', 'm']);
  const k = { n: `${p.name.split(' ')[0]} ${P(g == 'f' ? NF : NM)}`, role: 'Gyerek', age: 0, bond: 80, alive: true }; p.rel.push(k);
  fxlog(`Megszületett a gyereked: ${k.n}!`, { hap: 15 }); render();
}

// ----- munka -----
function applyJob(n) {
  const j = JOBS.find(q => q.n == n); if ((j.c && p.crim) || (j.lic && !p.lic) || p.car) return; p.done.job = 1;
  if (Math.random() < Math.min(.95, Math.max(.15, .6 + (p.sma - j.s) / 100 + (p.lang || 0) * .03))) { p.jr = p.job ? Math.max(0, (p.jr || 0) - 1) : 0; p.job = j.n; p.pay = j.pay; p.yrs = 0; p.jp = 30; fxlog(`Felvettek: ${j.n}.`, { hap: 10 }); }
  else lg(`Elutasítottak (${j.n}).`, 'bad');
  render();
}
function quit() { if (confirm(T(['Biztosan felmondasz?', 'Really quit your job?']))) { lg(`Felmondtál (${p.job}).`); p.job = null; p.pay = 0; render(); } }

// ----- megjelenítés -----
const TT = { job: ['Foglalkozás', 'Occupation'], assets: ['Pénzügy', 'Finance'], rel: ['Kapcsolatok', 'Relationships'], act: ['Tevékenységek', 'Activities'] };
const logHtml = () => { const L = p.logs; let h = '', last = -1; for (let j = L.length - 1; j >= 0; j--) { const l = L[j]; if (l.a !== last) { h += `<h3>${l.a} éves</h3>`; last = l.a; } h += `<p class="lg ${l.c}${l.n > seen ? ' new' : ''}" style="animation-delay:${(L.length - 1 - j) * 70}ms">${l.t}</p>`; } return h; };
const row = (top, sub, btn) => `<div class="card"><div class="top"><b>${top}</b><small>${sub}</small></div>${btn}</div>`;

function panel(t) {
  if (t == 'act' && sub) return bk() + actSub(sub);
  if (t == 'assets' && sub && sub.startsWith('a:')) return bk() + assetDetail(+sub.slice(2));
  if (t == 'assets' && sub) return bk() + finSub(sub);
  if (t == 'job' && sub && sub.startsWith('h:')) return bk() + hobbyDetail(sub.slice(2));
  if (t == 'rel' && sub && sub.startsWith('kin:')) return bk() + kinPanel(+sub.slice(4));
  if (t == 'job' && sub && sub.startsWith('crstart:')) return bk() + crStart(sub.slice(8));
  if (t == 'job' && sub == 'jobs') return bk() + jobsScreen();
  if (t == 'job' && sub == 'hobs') return bk() + hobbyPanel();
  if (t == 'job' && sub == 'jwork') return bk() + jobActs();
  if (t == 'job' && sub == 'school') return bk() + schoolPanel();
  return panel0(t);
}
function panel0(t) {
  const a = p.age;
  if (t == 'act') return actPanel();
  if (t == 'assets') return assetsPanel();
  if (t == 'rel') {
    if (relOpen == 'pet') { if (p.pet) return '<button class="ghost" onclick="openRel(null)">‹ Vissza</button>' + petDetail(); relOpen = null; }
    if (relOpen != null && !(p.rel[relOpen] && p.rel[relOpen].alive)) relOpen = null;
    const head = (r, extra) => `<div class="rwrap"><div class="rav">${avSvg(lk(r), r.age)}</div><div class="rbody"><div class="top"><b>${dn(r.n)}</b><small>${roleLab(r)}, ${r.age}${T([' éves', ' y/o'])}</small></div><div class="tr"><i style="width:${r.bond}%"></i></div>${extra}</div></div>`;
    if (relOpen == null) return sub && sub.startsWith('rc:') ? bk() + relList(head, sub.slice(3)) : relMenu();
    const i = relOpen, r = p.rel[i], gc = a < 18 ? 0 : 1e5;
    const Bt = (ic, n, id, c, fn, rw, show = true) => show ? abtn({ i: ic, n, c, r: rw, done: p.done[id], fn }) : '';
    const b = Bt('💬', 'Beszélgetés', 't' + i, 0, `talk(${i})`, ['bond', 'hap'])
      + Bt('🎁', 'Ajándék', 'g' + i, gc, `gift(${i})`, ['bond'], a >= 8 && r.age >= 3)
      + Bt('🙏', 'Pénzt kérek', 'm' + i, 0, `beg(${i})`, ['money'], !!r.par && a >= 18)
      + Bt('💍', 'Házassági ajánlat', 'p' + i, 0, `propose(${i})`, ['love'], r.role == 'Párod' && a >= 18)
      + Bt('👶', 'Gyerek vállalása', 'b' + i, 0, `baby(${i})`, ['baby'], r.role == 'Házastárs' && a <= 45)
      + RI.filter(x => a >= (x.m || 0) && (!x.M || a <= x.M) && (!x.roles || x.roles.includes(r.role)) && (!x.role || x.role == r.role) && (!x.u || x.u(r))).map(x => Bt(x.i, T(x.l), 'i' + x.k + i, a < 18 ? 0 : x.c || 0, `rint(${i},'${x.k}')`, riR(x))).join('')
      + (LOVE.includes(r.role) ? Bt('💔', 'Szakítás', 'x' + i, 0, `split(${i})`, []) : '') + (DRIFT.includes(r.role) ? Bt('🚪', 'Kapcsolat megszakítása', 'x' + i, 0, `cut(${i})`, []) : '');
    return `<button class="ghost" onclick="openRel(null)">‹ Vissza</button><div class="card pd">${head(r, `<small class="dsc">Kapcsolat: ${Math.round(r.bond)}/100</small>`)}</div><h3>Mit csinálsz vele?</h3><div class="grid">${b}</div><h3>Besorolás</h3><div class="grid">${catBtns(i)}</div>`;
  }
  return jobPanel();
}

// ----- extra emberi műveletek -----
function openRel(i) { relOpen = i; render(); $('#sbody').scrollTop = 0; }
function cut(i) { const r = p.rel[i]; if (!confirm(T([`Biztosan megszakítod a kapcsolatot vele: ${r.n}?`, `Cut ties with ${dn(r.n)} for good?`]))) return; r.alive = false; relOpen = null; fxlog(`Megszakítottad a kapcsolatot vele: ${r.n}.`, { hap: -3 }); render(); }
function beg(i) { const r = p.rel[i]; p.done['m' + i] = 1; if (r.bond >= 55 && Math.random() < .7) fxlog(`${r.n} adott neked pénzt.`, { money: R(1, 4) * 1e5 * p.fam }); else fxlog(`${r.n} nemet mondott.`, { hap: -4 }); render(); }
function split(i) { const r = p.rel[i]; if (!confirm(T([`Biztosan szakítasz vele: ${r.n}?`, `Really break up with ${dn(r.n)}?`]))) return; if (r.role == 'Házastárs') p.money = Math.round(p.money * .7); r.alive = false; fxlog(`Szakítottál vele: ${r.n}.`, { hap: -8 }); render(); }

// ----- effektek -----
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
let seen = 0, prev = null, lastTab = null, endT = 0, ackDead = false; // ackDead: a halál utáni szürkítés addig tart, amíg új életet nem kezdünk / fel nem élesztenek
function flash(c) { if (RM) return; const f = $('#flash'); f.className = ''; void f.offsetWidth; f.className = c; }
function confetti(n = 70) {
  if (RM) return;
  const cv = $('#cv'), A = $('#app'); cv.width = A.clientWidth; cv.height = A.clientHeight;
  const x = cv.getContext('2d'), cols = ['#e4572e', '#f0b429', '#1f8a83', '#ffffff', '#7aa2f7'];
  const ps = Array.from({ length: n }, () => ({ x: cv.width / 2, y: cv.height * .55, vx: (Math.random() - .5) * 15, vy: -Math.random() * 14 - 4, s: R(6, 11), c: P(cols), r: Math.random() * 6, vr: (Math.random() - .5) * .4 }));
  let t = 0;
  (function f() {
    x.clearRect(0, 0, cv.width, cv.height); t++;
    ps.forEach(q => { q.vy += .35; q.x += q.vx; q.y += q.vy; q.r += q.vr; x.save(); x.translate(q.x, q.y); x.rotate(q.r); x.fillStyle = q.c; x.globalAlpha = Math.max(0, 1 - t / 110); x.fillRect(-q.s / 2, -q.s / 3, q.s, q.s * .6); x.restore(); });
    if (t < 110) requestAnimationFrame(f); else x.clearRect(0, 0, cv.width, cv.height);
  })();
}

// ----- megjelenítés -----
const SKIN = ['', '\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'], SKINC = ['', '#f8dcc6', '#e9bd96', '#c98f62', '#9a6240', '#5e3a24'];

const HC = ['#24180f', '#6b4226', '#e0b24a', '#b5381f', '#8a8f9a', '#d96a9f'], OC = ['#e4572e', '#1f8a83', '#3a6fd8', '#f0b429', '#7a5cc7', '#3b3b46', '#e86a9a', '#4a9d4a'], XC = ['#e4572e', '#1f8a83', '#3a6fd8', '#f0b429', '#7a5cc7', '#3b3b46', '#e86a9a', '#f4f4f4'], SW = { skin: SKINC, hc: HC, oc: OC, xc: XC };
const HSN = [['rövid', 'short'], ['hosszú', 'long'], ['feltűzött', 'tied-up'], ['nagyon rövid', 'buzzed'], ['göndör', 'curly'], ['félhosszú', 'bob'], ['lófarkas', 'ponytail'], ['tüskés', 'spiky'], ['copfos', 'pigtail'], ['kopasz', 'bald'],
  ['afro', 'afro'], ['frufrus bubi', 'bob with bangs'], ['oldalra fésült', 'side-swept'], ['feltupírozott', 'quiff'], ['magas konty', 'top bun'], ['két konty', 'space buns'], ['magas lófarok', 'high ponytail'], ['két fonat', 'twin braids'], ['oldalfonat', 'side braid'], ['hullámos hosszú', 'long wavy'], ['hosszú frufruval', 'long with bangs'], ['tarajos', 'mohawk'], ['kopaszodó', 'receding'], ['középen elválasztott', 'curtains'], ['pixie', 'pixie']];
const TALL = [2, 4, 7, 10, 13, 14, 15, 16, 21], FULLHAT = [1, 2, 3, 4, 5, 9];
const BDN = [['átlagos', 'average'], ['karcsú', 'slim'], ['nyurga', 'lanky'], ['izmos', 'muscular'], ['atletikus', 'athletic'], ['telt', 'curvy'], ['nagydarab', 'heavyset'], ['zömök', 'stocky'], ['körte formájú', 'pear-shaped'], ['apró', 'petite']];
const HCN = [['fekete', 'black'], ['barna', 'brown'], ['szőke', 'blond'], ['vörös', 'red'], ['ősz', 'gray'], ['rózsaszín', 'pink']];
const OCN = [['piros', 'red'], ['kékeszöld', 'teal'], ['kék', 'blue'], ['sárga', 'yellow'], ['lila', 'purple'], ['sötét', 'dark'], ['rózsaszín', 'pink'], ['zöld', 'green']];
const OTN = [['póló', 't-shirt'], ['pulcsi', 'sweater'], ['kapucnis pulcsi', 'hoodie'], ['márkás polo', 'branded polo'], ['garbó', 'turtleneck'], ['kardigán', 'cardigan'], ['trikó', 'tank top'], ['csíkos póló', 'striped tee'], ['ing', 'shirt'], ['blézer', 'blazer'], ['melegítőfelső', 'track jacket'], ['sportmez', 'jersey'], ['kantáros nadrág', 'dungarees'], ['farmerdzseki', 'denim jacket'], ['bőrdzseki', 'leather jacket'], ['mellény', 'puffer vest']];
const HTN = [['nincs', 'none'], ['baseball sapka', 'cap'], ['kötött sapka', 'beanie'], ['halászsapka', 'bucket hat'], ['kalap', 'fedora'], ['szalmakalap', 'straw hat'], ['fejpánt', 'headband'], ['masni', 'hair bow'], ['virágkoszorú', 'flower crown'], ['bandana', 'bandana'], ['macskafül', 'cat ears'], ['korona', 'crown']];
const EAN = [['nincs', 'none'], ['fejhallgató', 'headphones'], ['fülhallgató', 'earbuds'], ['headset', 'headset'], ['fülbevaló', 'earrings']];
const GLN = [['nincs', 'none'], ['kerek szemüveg', 'round glasses'], ['szögletes szemüveg', 'square glasses'], ['napszemüveg', 'sunglasses']];
const NCN = [['nincs', 'none'], ['nyaklánc', 'necklace'], ['sál', 'scarf'], ['nyakkendő', 'tie'], ['csokornyakkendő', 'bow tie']];
const pk = (v, f) => v != null && v !== 'r' ? +v : f();
const chance = (p, n) => () => Math.random() < p ? R(1, n) : 0;
const rndHs = g => P(g == 'f' ? [1, 2, 0, 4, 5, 6, 8, 5, 6, 10, 11, 14, 15, 16, 17, 18, 19, 20, 23, 24, 11, 19] : [0, 3, 4, 7, 0, 3, 7, 9, 10, 12, 13, 21, 22, 23, 12, 13]);
const rndBd = () => P([0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const rndOt = () => P([0, 0, 0, 1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
const rndHt = chance(.22, 11), rndEa = chance(.15, 4), rndGl = chance(.2, 3), rndNc = chance(.18, 4);
const mkLook = (g, sk) => ({ g, sk: sk || R(1, 5), hs: rndHs(g), hc: R(0, 4), oc: R(0, 7), bd: rndBd(), ot: rndOt(), ht: rndHt(), ea: rndEa(), gl: rndGl(), nc: rndNc(), xc: R(0, 7) });
const lk = r => r.look || (r.look = mkLook(NF.includes(r.n.split(' ')[1]) || r.role == 'Anya' ? 'f' : 'm'));
const desc = l => { const h = l.hs == 9 ? T(HSN[9]) : `${T(HCN[l.hc])} ${T(HSN[l.hs])} ${T(['haj', 'hair'])}`, ot = +l.ot || 0;
  const x = [[HTN, l.ht], [EAN, l.ea], [GLN, l.gl], [NCN, l.nc]].filter(([, v]) => +v > 0).map(([A, v]) => T(A[+v]));
  return `${h}, ${ot == 13 ? '' : T(OCN[l.oc]) + ' '}${T(OTN[ot])}, ${T(BDN[l.bd || 0])} ${T(['alkat', 'build'])}${x.length ? ', ' + x.join(', ') : ''}`; };
let UID = 0;
const BG = ['#fde2d8', '#d3efeb', '#d6e2fb', '#fdf0c4', '#e3d9f6', '#dcdce4', '#fbd8e6', '#d9eed5'];
// szín sötétítés (f<0) / világosítás (f>0)
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let c = [n >> 16, (n >> 8) & 255, n & 255]; c = c.map(v => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)); return `rgb(${c})`; };
// testalkatok: bx = alsó félszélesség, sx = váll félszélesség, sy = váll magassága, nw = nyak félszélesség, fw = arc szélesség, hz = fej méret
const BODY = [
  { bx: 34, sx: 32, sy: 80, nw: 6.5, fw: 1, hz: 1 },      // átlagos
  { bx: 26, sx: 25, sy: 81, nw: 5.5, fw: .95, hz: 1 },    // karcsú
  { bx: 24, sx: 27, sy: 85, nw: 4.8, fw: .93, hz: 1 },    // nyurga (hosszú nyak)
  { bx: 47, sx: 46, sy: 77, nw: 10.5, fw: 1.03, hz: 1 },   // izmos
  { bx: 30, sx: 40, sy: 79, nw: 7.5, fw: 1, hz: 1 },      // atletikus (V alak)
  { bx: 49, sx: 40, sy: 80, nw: 8.5, fw: 1.1, hz: 1 },     // telt
  { bx: 56, sx: 50, sy: 79, nw: 11, fw: 1.2, hz: 1 },     // nagydarab
  { bx: 40, sx: 39, sy: 73, nw: 9, fw: 1.04, hz: 1 },     // zömök (rövid nyak)
  { bx: 44, sx: 27, sy: 82, nw: 6.2, fw: 1, hz: 1 },      // körte
  { bx: 21, sx: 22, sy: 83, nw: 5, fw: .98, hz: 1.07 }    // apró
];
function avSvg(l, a, dead, vb) {
  if (dead) return '🪦';
  const id = 'g' + (++UID), sk = SKINC[l.sk] || SKINC[3], f = l.g == 'f', baby = a < 3, bd = BODY[+l.bd || 0] || BODY[0];
  const c01 = v => Math.max(0, Math.min(1, v)), gr = c01((a - 3) / 13), mat = c01((a - 12) / 6), adultF = f && a >= 18;
  const hc = a >= 65 ? '#d5d8de' : HC[l.hc] || HC[0], oc = OC[l.oc] || OC[0];
  const ot = +l.ot || 0, ht = +l.ht || 0, ea = +l.ea || 0, gl = baby ? 0 : l.gl == null ? -1 : +l.gl || 0, nc = baby ? 0 : +l.nc || 0, xc = XC[l.xc == null ? 5 : +l.xc] || XC[5];
  let hs = +l.hs || 0; if (FULLHAT.includes(ht) && TALL.includes(hs)) hs = 0;
  if (a < 6 && ![0, 3, 9, 12, 22, 24].includes(hs)) hs = 0; // kisgyereknek még nincs hosszú haja
  if (hs == 22 && a < 30) hs = 0;
  const OL = '#2b1d17', kw = w => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`, k = kw(2), th = (w = 1.7, c = OL) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"`;
  const skD = shade(sk, -.18), hb = shade(hc, -.4), hl = `<path d="M37 24Q50 17 63 25" fill="none" stroke="#fff" opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
  // ---- test ----
  const g = (f ? .91 : 1) * (.9 + .1 * mat), sx = bd.sx * g, bx = bd.bx * g, sy = bd.sy, nw = bd.nw, y0 = sy - 5;
  const SL = 50 - sx, SR = 50 + sx, BL = 50 - bx, BR = 50 + bx, nwl = 50 - nw, nwr = 50 + nw;
  const pL = `M${BL} 112L${SL} ${sy + 8}C${SL} ${sy - 2} ${50 - nw - 10} ${sy - 4} ${50 - nw} ${y0}`, pR = `M${50 + nw} ${y0}C${50 + nw + 10} ${sy - 4} ${SR} ${sy - 2} ${SR} ${sy + 8}L${BR} 112`;
  const torso = `${pL}L${50 + nw} ${y0}${pR.slice(pR.indexOf('C'))}Z`;
  const ax = sx * .66, tw = Math.max(nw + 11, ax * .72), X = (s, d) => 50 + s * d;
  // ---- ruha ----
  const oD = shade(oc, -.25), oL = shade(oc, .35), den = '#4a76ad', denD = shade(den, -.22), cream = '#f6f1e6';
  const btn = (x, y, c) => `<circle cx="${x}" cy="${y}" r="1.5" fill="${c || '#fff'}" stroke="${OL}" stroke-width=".7"/>`;
  const sleeves = c => [-1, 1].map(s => `<path d="M${s < 0 ? -10 : 110} ${sy - 8}L${X(s, nw + 11)} ${sy - 8}L${X(s, nw + 11)} ${sy - 3}Q${X(s, tw + 1)} ${sy + 6} ${X(s, tw)} ${sy + 26}L${X(s, tw)} 125L${s < 0 ? -10 : 110} 125Z" fill="${c}"/><path d="M${X(s, nw + 11)} ${sy - 3}Q${X(s, tw + 1)} ${sy + 6} ${X(s, tw)} ${sy + 26}V125" ${th(1.6)}/>`).join('');
  const flaps = (c, d) => [-1, 1].map(s => `<path d="M${X(s, nw + 1)} ${y0 - 5}L${X(s, nw + 9)} ${y0 + 3}L${X(s, .8)} ${y0 + d}L${X(s, nw - 1)} ${y0 + 1}Z" fill="${c}" ${kw(1.4)}/>`).join('');
  const stand = (c, h) => `<path d="M${nwl - 2} ${y0 - 13}H${nwr + 2}V${y0 + h}Q50 ${y0 + h + 6} ${nwl - 2} ${y0 + h}Z" fill="${c}" ${kw(1.6)}/><path d="M${nwl + 2} ${y0 - 9}V${y0 + h}M${nwl + 6} ${y0 - 9}V${y0 + h + 1}M${nwl + 10} ${y0 - 9}V${y0 + h + 3}M${nwr - 2} ${y0 - 9}V${y0 + h}M${nwr - 6} ${y0 - 9}V${y0 + h + 1}M${nwr - 10} ${y0 - 9}V${y0 + h + 3}" ${th(1)} opacity=".22"/>`;
  const O = { fill: oc, pre: '', post: '', nk: ot == 0 && l.oc % 2 ? 'v' : 'crew', vd: 13 };
  switch (ot) {
    case 1: { // pulcsi
      let ln = ''; for (let x = SL + 4; x < SR - 3; x += 5) ln += `M${x} ${sy + 9}V114`;
      O.pre = `<path d="${ln}" ${th(1, oD)} opacity=".5"/><path d="M50 ${sy + 8}q-5 5 0 10t0 10t0 10t0 10" ${th(2, oL)} opacity=".8"/><path d="M${BL - 2} 103H${BR + 2}" ${th(2.2, oD)} opacity=".7"/>`;
      O.post = `<path d="M${nwl - 1} ${y0 - 1}Q50 ${y0 + 10} ${nwr + 1} ${y0 - 1}" ${th(5.4, OL)}/><path d="M${nwl - 1} ${y0 - 1}Q50 ${y0 + 10} ${nwr + 1} ${y0 - 1}" ${th(3.8, oD)}/>`; break; }
    case 2: { // kapucnis pulcsi
      const hood = `M${nwl - 7} ${y0 - 14}C${nwl - 8} ${y0 + 2} ${nwl + 2} ${y0 + 9} 50 ${y0 + 9}C${nwr - 2} ${y0 + 9} ${nwr + 8} ${y0 + 2} ${nwr + 7} ${y0 - 14}`;
      O.pre = `<path d="M${50 - 22} 114L${50 - 19} 99Q50 92 ${50 + 19} 99L${50 + 22} 114Z" fill="${oD}" opacity=".55"/><path d="M${50 - 19} 99Q50 92 ${50 + 19} 99" ${th(1.4)} opacity=".5"/>`;
      O.post = `<path d="${hood}" ${th(11.5)}/><path d="${hood}" ${th(8.6, shade(oc, -.12))}/><path d="${hood}" ${th(1.4, oD)} transform="translate(0 -1.2)" opacity=".6"/>`
        + `<path d="M${50 - 5} ${y0 + 9}V${y0 + 25}M${50 + 5} ${y0 + 9}V${y0 + 22}" ${th(1.8, "#fff")}/><circle cx="${50 - 5}" cy="${y0 + 26}" r="1.6" fill="#fff" ${kw(.8)}/><circle cx="${50 + 5}" cy="${y0 + 23}" r="1.6" fill="#fff" ${kw(.8)}/>`; O.nk = 'none'; break; }
    case 3: { // márkás polo
      O.nk = 'v'; O.vd = 9;
      O.pre = `<path d="M${50 + 14} ${sy + 11}h7v5.5q-3.5 3.2 -7 0Z" fill="#fff" ${kw(1)}/><path d="M${50 + 15.4} ${sy + 13}h4.2" ${th(1, oc)}/>`;
      O.post = `<path d="M50 ${y0 + 9}V${y0 + 36}" ${th(1.4)}/><path d="M${48.2} ${y0 + 9}h3.6v26h-3.6Z" fill="${oL}" opacity=".5"/>${flaps(oL, 11)}${btn(50, y0 + 17)}${btn(50, y0 + 27)}`; break; }
    case 4: // garbó
      O.nk = 'none'; O.post = stand(oc, 2); break;
    case 5: { // kardigán
      O.pre = `<path d="M${50 - 13} ${y0 - 3}L${50 + 13} ${y0 - 3}L${50 + 9} 114H${50 - 9}Z" fill="${cream}"/><path d="M${50 - 13} ${y0 - 3}L${50 - 9} 114M${50 + 13} ${y0 - 3}L${50 + 9} 114" ${th(1.8)}/><path d="M${50 - 13} ${y0 - 3}L${50 - 9} 114M${50 + 13} ${y0 - 3}L${50 + 9} 114" ${th(4.6, oD)} opacity=".35" transform="translate(${-3.4} 0)"/>`
        + `<path d="M${50 + 9.5} ${y0 - 3}L${50 + 6} 114" ${th(4.6, oD)} opacity=".35" transform="translate(3.4 0)"/><path d="M${50 - 26} ${sy + 22}h10v9h-10zM${50 + 16} ${sy + 22}h10v9h-10z" ${th(1.2)} opacity=".35"/>`; break; }
    case 6: // trikó
      O.nk = 'scoop'; O.pre = sleeves(sk); break;
    case 7: { // csíkos póló
      let st = ''; for (let y = y0 + 5; y < 114; y += 9) st += `<rect x="0" y="${y}" width="100" height="4.4" fill="#fff" opacity=".88"/>`; O.pre = st; break; }
    case 8: // ing
      O.nk = 'v'; O.vd = 9; O.post = `<path d="M50 ${y0 + 9}V114" ${th(1.4)}/>${flaps('#fff', 11).replace(/fill="#fff"/g, `fill="${oL}"`)}${btn(50, y0 + 17)}${btn(50, y0 + 27)}${btn(50, y0 + 37)}<path d="M${50 + 8} ${sy + 11}h10v10h-10z" ${th(1.2)} opacity=".5"/>`; break;
    case 9: { // blézer
      O.nk = 'v'; O.vd = 9;
      O.pre = `<path d="M${nwl - 1} ${y0 - 3}L50 ${y0 + 28}L${nwr + 1} ${y0 - 3}Z" fill="#f6f6f2"/>`;
      const lap = s => `<path d="M${X(s, nw + 9)} ${y0 - 2}L${X(s, nw)} ${y0 - 1}L${X(s, 1)} ${y0 + 26}L${X(s, 7)} ${y0 + 31}L${X(s, 15)} ${y0 + 20}L${X(s, 11)} ${y0 + 15}L${X(s, nw + 14)} ${y0 + 7}Z" fill="${oD}" ${kw(1.4)}/>`;
      O.post = lap(-1) + lap(1) + btn(50, y0 + 33, oL) + `<path d="M${50 + 12} ${sy + 12}l7 -1" ${th(1.4, "#fff")}/>`; break; }
    case 10: { // melegítőfelső
      O.pre = `<path d="M${50 - ax - 4} ${sy + 10}L${50 - ax - 5} 114M${50 + ax + 4} ${sy + 10}L${50 + ax + 5} 114" ${th(2.6, "#fff")} opacity=".9"/>`;
      O.nk = 'none'; O.post = stand(oD, 1) + `<path d="M50 ${y0 - 12}V114" ${th(1.4)}/><path d="M50 ${y0 - 6}V114" ${th(1, "#fff")} stroke-dasharray="1.2 1.4" opacity=".7"/><circle cx="50" cy="${y0 + 7}" r="1.9" fill="#fff" ${kw(.9)}/>`; break; }
    case 11: { // sportmez
      O.nk = 'v'; O.vd = 9;
      O.pre = `<path d="M${50 - sx + 3} ${sy + 4}L${50 - sx + 2} ${sy + 30}M${50 + sx - 3} ${sy + 4}L${50 + sx - 2} ${sy + 30}" ${th(3, "#fff")} opacity=".9"/><text x="50" y="${y0 + 33}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="900" fill="#fff" stroke="${OL}" stroke-width=".9" paint-order="stroke">10</text>`;
      O.post = `<path d="M${nwl - 1} ${y0 - 1}L50 ${y0 + 9}L${nwr + 1} ${y0 - 1}" ${th(3.6, "#fff")}/>`; break; }
    case 12: // kantáros nadrág
      O.post = `<path d="M${50 - 15} ${sy + 8}H${50 + 15}V114H${50 - 15}Z" fill="${den}" ${kw(1.5)}/><path d="M${nwl - 8} ${y0 - 3}L${nwl - 1} ${y0 - 1}L${50 - 9} ${sy + 8}H${50 - 15}Z" fill="${den}" ${kw(1.4)}/><path d="M${nwr + 8} ${y0 - 3}L${nwr + 1} ${y0 - 1}L${50 + 9} ${sy + 8}H${50 + 15}Z" fill="${den}" ${kw(1.4)}/><path d="M${50 - 7} ${sy + 16}h14v9h-14z" ${th(1.2, denD)}/><path d="M${50 - 13} ${sy + 11}H${50 + 13}" ${th(1, denD)} stroke-dasharray="1.5 1.2"/>${btn(50 - 12, sy + 6.5, '#e6b84a')}${btn(50 + 12, sy + 6.5, '#e6b84a')}`; break;
    case 13: { // farmerdzseki
      O.fill = den;
      O.pre = `<path d="M${nwl - 1} ${y0 - 3}L50 ${y0 + 23}L${nwr + 1} ${y0 - 3}Z" fill="${oc}"/><path d="M50 ${y0 + 23}V114" ${th(1.4, denD)}/><path d="M${50 - 25} ${sy + 12}h13v11h-13zM${50 + 12} ${sy + 12}h13v11h-13z" fill="${den}" stroke="${denD}" stroke-width="1.4"/><path d="M${50 - 25} ${sy + 16}h13M${50 + 12} ${sy + 16}h13" ${th(1, denD)}/>`;
      O.nk = 'v'; O.vd = 8;
      O.post = flaps(denD, 17) + btn(50, y0 + 29, '#d8b04a') + btn(50, y0 + 39, '#d8b04a') + btn(50 - 19, sy + 18.5, '#d8b04a') + btn(50 + 19, sy + 18.5, '#d8b04a'); break; }
    case 14: { // bőrdzseki
      const lc = shade(oc, -.62); O.fill = lc;
      O.pre = `<path d="M${nwl - 1} ${y0 - 3}L50 ${y0 + 16}L${nwr + 1} ${y0 - 3}Z" fill="${oc}"/><path d="M${SL + 6} ${sy + 3}Q${SL + 10} ${sy + 12} ${SL + 7} ${sy + 20}" ${th(2.4, "#fff")} opacity=".22"/>`;
      O.nk = 'v'; O.vd = 8;
      const lap = s => `<path d="M${X(s, nw + 10)} ${y0 - 3}L${X(s, nw)} ${y0}L${X(s, 4)} ${y0 + 19}L${X(s, 15)} ${y0 + 26}L${X(s, 17)} ${y0 + 12}Z" fill="${shade(lc, .12)}" ${kw(1.4)}/>`;
      O.post = lap(-1) + lap(1) + `<path d="M${50 - 1} ${y0 + 17}L${50 + 16} 114" ${th(1.6, "#cfd6dc")}/><path d="M${50 - 1} ${y0 + 17}L${50 + 16} 114" ${th(1, OL)} stroke-dasharray="1 1.4"/>${btn(50 - 14, y0 + 15, '#cfd6dc')}${btn(50 + 15, y0 + 22, '#cfd6dc')}`; break; }
    case 15: { // mellény
      const vc = shade(oc, -.55); O.fill = vc;
      O.pre = sleeves(oc) + `<path d="M${50 - tw} ${sy + 8}Q50 ${sy + 12} ${50 + tw} ${sy + 8}M${50 - tw} ${sy + 19}Q50 ${sy + 23} ${50 + tw} ${sy + 19}M${50 - tw} ${sy + 30}Q50 ${sy + 34} ${50 + tw} ${sy + 30}" ${th(1.3)} opacity=".4"/><path d="M50 ${y0 + 6}V114" ${th(1.5)}/>`;
      O.nk = 'none'; O.post = stand(vc, 1) + `<path d="M50 ${y0 - 12}V${y0 + 7}" ${th(1.4)}/>`; break; }
  }
  const nkP = {
    crew: [`M${nwl - 1} ${y0 - 1}L${nwr + 1} ${y0 - 1}Q50 ${y0 + 10} ${nwl - 1} ${y0 - 1}Z`, `M${nwl - 1} ${y0 - 1}Q50 ${y0 + 10} ${nwr + 1} ${y0 - 1}`],
    v: [`M${nwl - 1} ${y0 - 1}L${nwr + 1} ${y0 - 1}L50 ${y0 + O.vd}Z`, `M${nwl - 1} ${y0 - 1}L50 ${y0 + O.vd}L${nwr + 1} ${y0 - 1}`],
    scoop: [`M${nwl - 5} ${y0 - 2}L${nwr + 5} ${y0 - 2}Q50 ${y0 + 22} ${nwl - 5} ${y0 - 2}Z`, `M${nwl - 5} ${y0 - 2}Q50 ${y0 + 22} ${nwr + 5} ${y0 - 2}`],
    none: ['', '']
  }[O.nk];
  const musc = +l.bd == 3 || +l.bd == 4 ? `<path d="M${50 - 15} ${sy + 15}Q${50 - 7} ${sy + 20} 50 ${sy + 15}Q${50 + 7} ${sy + 20} ${50 + 15} ${sy + 15}" ${th(1.5)} opacity=".22"/>` : '';
  const bust = `<g fill="none" stroke="${OL}" stroke-width="1.5" stroke-linecap="round" opacity=".4"><path d="M${50 - 2.5} ${sy + 18}Q${50 - 11} ${sy + 25} ${50 - 19.5} ${sy + 14}"/><path d="M${50 + 2.5} ${sy + 18}Q${50 + 11} ${sy + 25} ${50 + 19.5} ${sy + 14}"/><path d="M50 ${sy + 9}Q${50 - 1} ${sy + 14} 50 ${sy + 18}" stroke-width="1.1" opacity=".6"/></g><path d="M${50 - 19.5} ${sy + 14}Q${50 - 11} ${sy + 25} ${50 - 2.5} ${sy + 18}Q${50 - 11} ${sy + 21} ${50 - 19.5} ${sy + 14}ZM${50 + 19.5} ${sy + 14}Q${50 + 11} ${sy + 25} ${50 + 2.5} ${sy + 18}Q${50 + 11} ${sy + 21} ${50 + 19.5} ${sy + 14}Z" fill="#000" opacity=".12"/>`;
  const bodyG = `<path d="M${50 - nw} 58H${50 + nw}V${y0 + 3}H${50 - nw}Z" fill="${sk}"/><path d="M${50 - nw} 62V${y0}M${50 + nw} 62V${y0}" ${th()}/>`
    + `<path d="M${50 - nw} 62H${50 + nw}V74Q50 80 ${50 - nw} 74Z" fill="#000" opacity=".14"/>`
    + `<clipPath id="${id}t"><path d="${torso}"/></clipPath><path d="${torso}" fill="${O.fill}"/><g clip-path="url(#${id}t)">${O.pre}<rect x="50" y="60" width="60" height="60" fill="#000" opacity=".1"/></g>`
    + `<path d="${pL}" ${k} fill="none"/><path d="${pR}" ${k} fill="none"/>`
    + `<path d="M${50 - ax} ${sy + 12}Q${50 - ax - 1.5} ${sy + 24} ${50 - ax} 112M${50 + ax} ${sy + 12}Q${50 + ax + 1.5} ${sy + 24} ${50 + ax} 112" ${th()} opacity="${ot == 6 || ot == 15 ? 0 : .22}"/>${ot == 0 || ot == 1 || ot == 7 ? musc : ''}${adultF ? bust : ''}`
    + (nkP[0] ? `<path d="${nkP[0]}" fill="${sk}"/><path d="${nkP[1]}" ${th(1.7)}/>` : '') + O.post;
  // ---- csecsemő: pólya ----
  const sw0 = shade(oc, .62), sw1 = shade(oc, .42);
  const swShape = 'M17 114C17 94 30 80 50 78C70 80 83 94 83 114Z';
  const swaddle = `<clipPath id="${id}w"><path d="${swShape}"/></clipPath><path d="${swShape}" fill="${sw0}"/>`
    + `<g clip-path="url(#${id}w)"><path d="M10 96Q50 108 90 90L90 103Q50 120 10 109Z" fill="${sw1}"/><path d="M22 84Q50 98 78 84L78 92Q50 106 22 92Z" fill="${shade(oc, .3)}"/>`
    + [[28, 110, 1.6], [44, 113, 1.3], [62, 109, 1.6], [76, 101, 1.4], [32, 97, 1.1], [58, 90, 1.2]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${oc}" opacity=".55"/>`).join('') + `</g>`
    + `<path d="${swShape}" fill="none" ${k}/><path d="M22 84Q50 98 78 84" ${th(1.4)} opacity=".55"/><path d="M10 96Q50 108 90 90" fill="none" stroke="${OL}" stroke-width="1.2" opacity=".35" clip-path="url(#${id}w)"/>`
    + `<circle cx="34" cy="94" r="4.4" fill="${sk}" ${kw(1.5)}/><path d="M32.4 93q1.8 -1.4 3.6 0" ${th(1)} opacity=".5"/>`;
  // ---- nyakra ----
  const neck = [
    '',
    `<path d="M${nwl - 2} ${y0 - 5}Q50 ${y0 + 23} ${nwr + 2} ${y0 - 5}" ${th(1.7, "#e6b84a")}/><circle cx="50" cy="${y0 + 11}" r="2.8" fill="${xc}" ${kw(1)}/>`,
    `<path d="M${50 + 4} ${y0 + 6}L${50 + 17} ${y0 + 3}L${50 + 21} ${y0 + 40}L${50 + 8} ${y0 + 42}Z" fill="${xc}" ${kw(1.6)}/><path d="M${50 + 6} ${y0 + 20}L${50 + 19} ${y0 + 18}M${50 + 7} ${y0 + 30}L${50 + 20} ${y0 + 28}" ${th(1.4, shade(xc, -.35))} opacity=".7"/><path d="M${nwl - 6} ${y0 - 8}Q50 ${y0 + 13} ${nwr + 6} ${y0 - 8}" ${th(12)}/><path d="M${nwl - 6} ${y0 - 8}Q50 ${y0 + 13} ${nwr + 6} ${y0 - 8}" ${th(9.2, xc)}/><path d="M${nwl + 1} ${y0 - 2}l-2 6M${nwl + 8} ${y0 + 3}l-1 6M${nwr - 1} ${y0 - 2}l2 6M${nwr - 8} ${y0 + 3}l1 6" ${th(1.4, shade(xc, -.35))} opacity=".7"/>`,
    `<path d="M${50 - 3} ${y0 + 10}L${50 - 6.5} ${y0 + 31}L50 ${y0 + 37}L${50 + 6.5} ${y0 + 31}L${50 + 3} ${y0 + 10}Z" fill="${xc}" ${kw(1.5)}/><path d="M${50 - 5} ${y0 + 3}H${50 + 5}L${50 + 3} ${y0 + 11}H${50 - 3}Z" fill="${shade(xc, -.15)}" ${kw(1.5)}/><path d="M${50 - 4} ${y0 + 20}L${50 + 4} ${y0 + 17}M${50 - 5} ${y0 + 27}L${50 + 5} ${y0 + 24}" ${th(1.2, "#fff")} opacity=".5"/>`,
    `<path d="M50 ${y0 + 4}L${50 - 12} ${y0 - 2}V${y0 + 10}ZM50 ${y0 + 4}L${50 + 12} ${y0 - 2}V${y0 + 10}Z" fill="${xc}" ${kw(1.5)}/><rect x="${50 - 3}" y="${y0 + 1}" width="6" height="7" rx="2" fill="${shade(xc, -.15)}" ${kw(1.4)}/>`
  ][nc] || '';
  // ---- haj ----
  const blob = cs => cs.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${hc}" ${k}/>`).join('') + cs.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2] - 1}" fill="${hc}"/>`).join('');
  const circ = [[30, 30], [38, 20], [50, 15], [62, 20], [70, 30], [25, 46], [75, 46], [27, 38], [73, 38]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="11" fill="${hc}" ${k}/>`).join('');
  const tie = (x, y, c) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${c || shade(oc, -.1)}" ${kw(1.4)}/>`;
  const braid = (s, y, bx2) => Array.from({ length: 6 }, (_, i) => `<ellipse cx="${(50 + s * (bx2 + (i % 2 ? -2.2 : 1.6))).toFixed(1)}" cy="${y + i * 8}" rx="6" ry="5.6" fill="${hc}" ${kw(1.6)}/>`).join('') + `<circle cx="${50 + s * (bx2 - .6)}" cy="${y + 47}" r="3" fill="${shade(oc, -.1)}" ${kw(1.2)}/>`;
  const lLong = `<path d="M26 54Q19 84 26 102Q38 96 38 70Z" fill="${hc}" ${k}/><path d="M74 54Q81 84 74 102Q62 96 62 70Z" fill="${hc}" ${k}/>`;
  const back = [
    '', `<path d="M24 48Q17 8 50 9Q83 8 76 48L81 98Q50 106 19 98Z" fill="${hc}" ${k}/>`,
    `<circle cx="50" cy="11" r="10" fill="${hc}" ${k}/><path d="M44 8Q50 4 56 8" fill="none" stroke="#fff" opacity=".4" stroke-width="2.4" stroke-linecap="round"/>`, '', circ,
    `<path d="M23 50Q16 8 50 9Q84 8 77 50L79 74Q66 80 61 70L39 70Q34 80 21 74Z" fill="${hc}" ${k}/>`,
    `<path d="M68 26Q93 22 91 56Q89 76 77 84Q82 62 73 46Z" fill="${hc}" ${k}/>`, '',
    `<path d="M29 32Q7 34 7 62Q7 78 18 82Q15 62 29 50Z" fill="${hc}" ${k}/><path d="M71 32Q93 34 93 62Q93 78 82 82Q85 62 71 50Z" fill="${hc}" ${k}/>`, '',
    blob([[50, 21, 17], [32, 26, 14], [68, 26, 14], [22, 40, 12], [78, 40, 12], [24, 54, 8], [76, 54, 8], [39, 15, 12], [61, 15, 12]]),
    `<path d="M22 58Q14 6 50 8Q86 6 78 58L77 80Q50 87 23 80Z" fill="${hc}" ${k}/>`,
    '', '',
    `<circle cx="50" cy="11" r="10.5" fill="${hc}" ${k}/><path d="M43 8Q50 3 57 8M45 15Q50 11 55 15" fill="none" stroke="#fff" opacity=".35" stroke-width="2" stroke-linecap="round"/>`,
    `<circle cx="27" cy="15" r="11" fill="${hc}" ${k}/><circle cx="73" cy="15" r="11" fill="${hc}" ${k}/>`,
    `<path d="M50 7Q88 -3 91 36Q93 62 79 80Q83 54 75 38Q67 22 50 22Z" fill="${hc}" ${k}/>`,
    `<path d="M24 48Q18 8 50 9Q82 8 76 48Z" fill="${hc}" ${k}/>`, `<path d="M24 48Q18 8 50 9Q82 8 76 48Z" fill="${hc}" ${k}/>`,
    `<path d="M24 48Q16 6 50 8Q84 6 76 48Q85 62 80 76Q87 90 78 101Q64 105 50 100Q36 105 22 101Q13 90 20 76Q15 62 24 48Z" fill="${hc}" ${k}/>`,
    `<path d="M24 48Q17 8 50 9Q83 8 76 48L81 98Q50 106 19 98Z" fill="${hc}" ${k}/>`,
    '', '',
    `<path d="M23 50Q15 8 50 9Q85 8 77 50L80 82Q66 88 60 72L40 72Q34 88 20 82Z" fill="${hc}" ${k}/>`, ''][hs] || '';
  const locks = [1, 20].includes(hs) ? lLong : hs == 17 ? braid(-1, 58, 23) + braid(1, 58, 23) : hs == 18 ? braid(1, 58, 22) : hs == 19 ? `<path d="M26 54Q19 70 25 82Q19 94 27 104L38 100Q35 84 38 72Q37 64 36 58Z" fill="${hc}" ${k}/><path d="M74 54Q81 70 75 82Q81 94 73 104L62 100Q65 84 62 72Q63 64 64 58Z" fill="${hc}" ${k}/>` : '';
  const babyTuft = a < 1 ? `<path d="M40 24Q50 17 60 24" fill="none" stroke="${hc}" stroke-width="2.2" stroke-linecap="round" opacity=".28"/><path d="M44 22Q50 19 56 22" fill="none" stroke="${hc}" stroke-width="1.6" stroke-linecap="round" opacity=".4"/>`
    : a < 2 ? `<path d="M46 21Q45 13 51 14Q56 16 54 21Z" fill="${hc}" ${kw(1.4)}/>`
    : `<path d="M44 21Q41 7 52 10Q61 13 55 21Z" fill="${hc}" ${k}/><path d="M37 23Q40 15 45 21" fill="none" stroke="${hc}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
  const front = [
    `<path d="M25 46Q21 11 50 11Q79 11 75 46Q73 34 66 29Q52 36 38 28Q29 34 25 46Z" fill="${hc}" ${k}/>${hl}`,
    `<path d="M25 48Q20 11 50 11Q80 11 75 48Q68 33 50 24Q32 33 25 48Z" fill="${hc}" ${k}/>${hl}`,
    `<path d="M26 46Q22 13 50 13Q78 13 74 46Q70 28 50 26Q30 28 26 46Z" fill="${hc}" ${k}/>${tie(50, 19)}`,
    `<path d="M27 42Q26 18 50 17Q74 18 73 42Q66 28 50 27Q34 28 27 42Z" fill="${hc}" opacity=".8"/>`,
    [[40, 28], [50, 24], [60, 28]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="8.5" fill="${hc}" ${kw(1.4)}/>`).join('') + hl,
    `<path d="M24 48Q20 10 50 10Q80 10 76 48L72 41Q71 35 70 34Q50 39 30 34Q29 35 28 41Z" fill="${hc}" ${k}/>${hl}`,
    `<path d="M25 46Q21 11 50 11Q79 11 75 46Q72 31 62 27Q50 33 38 27Q28 32 25 46Z" fill="${hc}" ${k}/>${hl}${tie(72, 28)}`,
    `<path d="M25 46L23 26L32 21L35 6L44 18L50 3L57 18L65 6L68 21L77 26L75 46Q72 33 64 30Q52 36 38 29Q28 34 25 46Z" fill="${hc}" ${k}/>`,
    `<path d="M25 48Q20 11 50 11Q80 11 75 48Q68 32 50 24Q32 32 25 48Z" fill="${hc}" ${k}/>${hl}${tie(27, 38, '#e86a9a')}${tie(73, 38, '#e86a9a')}`,
    `<path d="M38 25Q50 19 62 25" fill="none" stroke="#fff" opacity=".55" stroke-width="3" stroke-linecap="round"/>`,
    `<path d="M26 44Q22 20 50 18Q78 20 74 44Q70 30 50 29Q30 30 26 44Z" fill="${hc}" ${k}/>${hl}`,                                   // 10 afro
    `<path d="M25 47Q20 10 50 10Q80 10 75 47L74 36Q50 29 26 36Z" fill="${hc}" ${k}/>${hl}`,                                          // 11 frufrus bubi
    `<path d="M25 46Q19 12 46 10Q82 8 76 46Q73 36 64 29Q46 27 36 34Q30 38 25 46Z" fill="${hc}" ${k}/><path d="M42 12Q44 22 37 31" ${th(1.3)} opacity=".5"/>${hl}`, // 12 oldalra fésült
    `<path d="M25 46Q21 22 32 14Q38 -2 56 3Q72 4 70 16Q79 24 75 46Q73 34 66 29Q52 33 38 29Q29 34 25 46Z" fill="${hc}" ${k}/><path d="M40 12Q50 6 60 10" fill="none" stroke="#fff" opacity=".4" stroke-width="2.6" stroke-linecap="round"/>`, // 13 quiff
    `<path d="M25 46Q21 12 50 13Q79 12 75 46Q71 30 50 25Q29 30 25 46Z" fill="${hc}" ${k}/>${hl}${tie(50, 13, shade(oc, -.1))}`,    // 14 magas konty
    `<path d="M25 46Q21 13 50 13Q79 13 75 46Q71 30 50 24Q29 30 25 46Z" fill="${hc}" ${k}/><path d="M50 14V24" ${th(1.2)} opacity=".45"/>${tie(30, 17, '#e86a9a')}${tie(70, 17, '#e86a9a')}`, // 15 két konty
    `<path d="M25 46Q21 11 50 11Q79 11 75 46Q72 31 62 25Q50 21 38 25Q28 31 25 46Z" fill="${hc}" ${k}/>${hl}${tie(54, 12, '#e86a9a')}`, // 16 magas lófarok
    `<path d="M25 46Q21 11 50 11Q79 11 75 46Q70 30 50 24Q30 30 25 46Z" fill="${hc}" ${k}/><path d="M50 12V24" ${th(1.2)} opacity=".45"/>${hl}`, // 17 két fonat
    `<path d="M25 46Q20 11 50 11Q80 11 75 46Q72 32 64 28Q48 26 36 33Q29 37 25 46Z" fill="${hc}" ${k}/>${hl}`,                       // 18 oldalfonat
    `<path d="M25 48Q20 10 50 10Q80 10 75 48Q70 32 58 28Q50 24 42 28Q30 32 25 48Z" fill="${hc}" ${k}/>${hl}`,                       // 19 hullámos hosszú
    `<path d="M25 48Q20 10 50 10Q80 10 75 48L74 38Q62 31 50 34Q38 31 26 38Z" fill="${hc}" ${k}/><path d="M38 14Q36 24 38 32M50 12V30M62 14Q64 24 62 32" ${th(1)} opacity=".25"/>`, // 20 hosszú frufruval
    `<path d="M28 42Q27 24 50 22Q73 24 72 42Q64 29 50 28Q36 29 28 42Z" fill="${hc}" opacity=".45"/><path d="M42 25Q40 12 44 6L47 12L50 0L53 12L56 6Q60 12 58 25Q50 20 42 25Z" fill="${hc}" ${k}/>`, // 21 tarajos
    `<path d="M25 50Q20 26 32 19Q29 33 33 45Z" fill="${hc}" ${k}/><path d="M75 50Q80 26 68 19Q71 33 67 45Z" fill="${hc}" ${k}/><path d="M43 24Q50 19 57 24" ${th(1.2, hc)} opacity=".7"/><path d="M38 25Q50 18 62 25" fill="none" stroke="#fff" opacity=".5" stroke-width="3" stroke-linecap="round"/>`, // 22 kopaszodó
    `<path d="M25 50Q19 11 50 11L48 22Q34 27 33 46Z" fill="${hc}" ${k}/><path d="M75 50Q81 11 50 11L52 22Q66 27 67 46Z" fill="${hc}" ${k}/>${hl}`, // 23 középen elválasztott
    `<path d="M25 46Q19 12 52 10Q82 11 76 46Q72 34 66 29Q60 27 52 29Q38 36 31 43Q27 50 25 46Z" fill="${hc}" ${k}/>${hl}`          // 24 pixie
  ][hs] || '';
  // ---- arc ----
  const face = f ? 'M27 42Q27 19 50 19Q73 19 73 42Q73 57 63 65Q50 72 37 65Q27 57 27 42Z' : 'M27 40Q27 19 50 19Q73 19 73 40L73 51Q73 68 50 69Q27 68 27 51Z';
  const ek = c01((a - 8) / 8), eye = x => `<ellipse cx="${x}" cy="47" rx="${(3.2 - .4 * ek).toFixed(2)}" ry="${(3.8 - .4 * ek).toFixed(2)}" fill="${OL}"/>`;
  const lash = (x, s) => f && a >= 10 ? `<path d="M${x + s * 3.4} 45.4l${s * 2.6} -2" stroke="${OL}" stroke-width="1.7" stroke-linecap="round"/>` : '';
  const brow = (x1, x2) => `<path d="M${x1} 39.5Q${(x1 + x2) / 2} 36.4 ${x2} 38.6" fill="none" stroke="${hb}" stroke-width="${f ? 2.3 : 3.1}" stroke-linecap="round"/>`;
  const mouth = `<path d="M44.5 59Q50 63.2 55.5 59" ${th(1.9)}/>`;
  const nose = `<path d="M50 50.5Q52.4 54 49.6 54.6" fill="none" stroke="${skD}" stroke-width="1.6" stroke-linecap="round"/>`;
  const chin = +l.bd == 5 || +l.bd == 6 ? `<path d="M41 66Q50 70 59 66" ${th(1.4)} opacity=".28"/>` : '';
  const acN = a >= 12 && a <= 17 ? [1, 3, 4, 5, 4, 2][a - 12] : 0;
  const acne = [[34, 55], [64, 53], [44, 29], [58, 27], [67, 44], [32, 44], [50, 33]].slice(0, acN).map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="1.3" fill="#d9645a" opacity=".85"/>`).join('');
  const fuzz = !f && a >= 14 && a <= 17 ? `<path d="M44 55.6Q50 53.6 56 55.6" fill="none" stroke="${hb}" stroke-width="2.2" stroke-linecap="round" opacity="${((a - 13) * .13).toFixed(2)}"/>` : '';
  const old = a >= 50 ? `<path d="M32 54q2 2.4 4 1.2M68 54q-2 2.4 -4 1.2M40 33q10 -2.4 20 0" ${th(1.1)} opacity=".3"/>` : '';
  const fr = shade(xc, -.3), lens = 'fill="#fff" fill-opacity=".22"';
  const glasses = (gl == -1 ? (a >= 55 && (l.sk + l.hc + l.hs) % 2 == 0 ? 1 : 0) : gl) ? [0,
    `<g ${lens} stroke="${gl == -1 ? OL : fr}" stroke-width="1.6"><circle cx="39" cy="47" r="6.6"/><circle cx="61" cy="47" r="6.6"/></g><path d="M45.6 46Q50 44 54.4 46M32.4 46L28 45M67.6 46L72 45" ${th(1.5, gl == -1 ? OL : fr)}/>`,
    `<g ${lens} stroke="${fr}" stroke-width="1.7" stroke-linejoin="round"><rect x="31.5" y="41.5" width="14" height="11" rx="3"/><rect x="54.5" y="41.5" width="14" height="11" rx="3"/></g><path d="M45.5 45H54.5M31.5 44L27 43M68.5 44L73 43" ${th(1.5, fr)}/>`,
    `<g fill="#1d2230" fill-opacity=".9" stroke="${fr}" stroke-width="1.7" stroke-linejoin="round"><path d="M31.5 42H46L45 51Q44 54 40 54H35Q31 54 31 50Z"/><path d="M54 42H68.5L69 50Q69 54 65 54H60Q56 54 55 51Z"/></g><path d="M46 44.5H54M31.5 43.5L27 42.5M68.5 43.5L73 42.5M34 44l4 -.5" ${th(1.5, fr)}/><path d="M35 45l5 -.4" stroke="#fff" opacity=".5" stroke-width="1.2" stroke-linecap="round"/>`
  ][gl == -1 ? 1 : gl] : '';
  // ---- fejfedő ----
  const hD = shade(xc, -.25), hL = shade(xc, .3);
  const hat = [
    '',
    `<path d="M25 31Q22 7 50 6Q78 7 75 31Z" fill="${xc}" ${k}/><path d="M50 7V28" ${th(1)} opacity=".35"/><circle cx="50" cy="6.5" r="2" fill="${hD}" ${kw(1)}/><path d="M24 30Q50 25 76 30Q80 39 50 42Q20 39 24 30Z" fill="${hD}" ${k}/>`,
    `<path d="M24 33Q19 4 50 5Q81 4 76 33Z" fill="${xc}" ${k}/><path d="M23 26Q50 21 77 26V34Q50 39 23 34Z" fill="${hL}" ${k}/><path d="M30 24V36M37 23V37M44 22V38M51 22V38M58 22V38M65 23V37M72 24V36" ${th(1)} opacity=".25"/><circle cx="50" cy="4.5" r="6" fill="${hL}" ${k}/>`,
    `<path d="M30 28Q28 7 50 7Q72 7 70 28Z" fill="${xc}" ${k}/><path d="M30 24Q50 30 70 24" ${th(2.4, hD)}/><path d="M13 30Q50 17 87 30Q91 38 50 40Q9 38 13 30Z" fill="${hL}" ${k}/>`,
    `<path d="M30 25Q28 5 40 5Q50 10 60 5Q72 5 70 25Z" fill="${xc}" ${k}/><path d="M30 24Q50 30 70 24V19Q50 25 30 19Z" fill="${hD}" ${kw(1.2)}/><path d="M11 27Q50 15 89 27Q93 34 50 36Q7 34 11 27Z" fill="${xc}" ${k}/>`,
    `<path d="M31 25Q29 8 50 8Q71 8 69 25Z" fill="#ecd08a" ${k}/><path d="M31 23Q50 29 69 23V18Q50 24 31 18Z" fill="${xc}" ${kw(1.2)}/><path d="M9 27Q50 14 91 27Q95 35 50 37Q5 35 9 27Z" fill="#f2dc9c" ${k}/><path d="M18 29Q50 34 82 29M24 32Q50 36 76 32" ${th(1)} opacity=".25"/>`,
    `<path d="M26 34Q50 17 74 34" ${th(8.2)}/><path d="M26 34Q50 17 74 34" ${th(5.8, xc)}/><path d="M33 29Q50 20 67 29" ${th(1.2, "#fff")} opacity=".5"/>`,
    `<path d="M64 19L50 11V27ZM64 19L78 11V27Z" fill="${xc}" ${k}/><circle cx="64" cy="19" r="4" fill="${hD}" ${k}/>`,
    '<path d="M31 20Q27 28 32 33M44 14Q50 12 56 14M69 20Q73 28 68 33" fill="none" stroke="#3f9a52" stroke-width="2.6" stroke-linecap="round"/>' + [[29, 33, '#ff7aa8'], [34, 24, '#ffd24d'], [42, 18, '#fff'], [50, 16, '#ff7aa8'], [58, 18, '#8fd3ff'], [66, 24, '#fff'], [71, 33, '#ffd24d']].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="4.3" fill="${c[2]}" ${kw(1.3)}/><circle cx="${c[0]}" cy="${c[1]}" r="1.4" fill="${c[2] == '#ffd24d' ? '#ff7aa8' : '#ffd24d'}"/>`).join(''),
    `<path d="M25 37Q22 9 50 8Q78 9 75 37Q50 29 25 37Z" fill="${xc}" ${k}/><g fill="#fff" opacity=".8"><circle cx="36" cy="22" r="1.6"/><circle cx="50" cy="17" r="1.6"/><circle cx="64" cy="22" r="1.6"/><circle cx="43" cy="28" r="1.4"/><circle cx="57" cy="28" r="1.4"/></g><path d="M74 31L87 25L85 34L90 41L76 38Z" fill="${hD}" ${k}/>`,
    `<path d="M29 28L30 5L45 17Z" fill="${xc}" ${k}/><path d="M71 28L70 5L55 17Z" fill="${xc}" ${k}/><path d="M32 22L32.4 11L40 17Z" fill="#ffb3c8"/><path d="M68 22L67.6 11L60 17Z" fill="#ffb3c8"/><path d="M27 32Q50 15 73 32" ${th(6.4)}/><path d="M27 32Q50 15 73 32" ${th(4.2, xc)}/>`,
    `<path d="M30 30L27 8L39 18L50 4L61 18L73 8L70 30Z" fill="#f5c542" ${k}/><path d="M30 25H70" ${th(1.2)} opacity=".4"/><circle cx="27" cy="8" r="2.6" fill="${xc}" ${kw(1)}/><circle cx="50" cy="4.5" r="2.8" fill="${xc}" ${kw(1)}/><circle cx="73" cy="8" r="2.6" fill="${xc}" ${kw(1)}/>`
  ][ht] || '';
  // ---- fül ----
  const cups = `<rect x="16" y="38" width="13" height="21" rx="5.5" fill="${xc}" ${k}/><rect x="71" y="38" width="13" height="21" rx="5.5" fill="${xc}" ${k}/><rect x="20" y="42" width="5" height="13" rx="2.5" fill="${hD}" opacity=".6"/><rect x="75" y="42" width="5" height="13" rx="2.5" fill="${hD}" opacity=".6"/>`;
  const band = `<path d="M23.5 44C17 -9 83 -9 76.5 44" ${th(6.2)}/><path d="M23.5 44C17 -9 83 -9 76.5 44" ${th(4, xc)}/>`;
  const ear = [
    '', band + cups,
    `<circle cx="27" cy="54" r="3.2" fill="${xc}" ${kw(1.2)}/><circle cx="73" cy="54" r="3.2" fill="${xc}" ${kw(1.2)}/><path d="M27 57Q23 80 40 104M73 57Q77 80 60 104" ${th(1.2)} opacity=".85"/>`,
    band + cups + `<path d="M19 57Q17 72 34 68" ${th(2.6)}/><circle cx="35" cy="68" r="3.4" fill="${xc}" ${kw(1.2)}/>`,
    `<circle cx="27" cy="58" r="3" fill="none" stroke="#e6b84a" stroke-width="1.7"/><circle cx="73" cy="58" r="3" fill="none" stroke="#e6b84a" stroke-width="1.7"/><circle cx="27" cy="63.5" r="2.2" fill="${xc}" ${kw(.9)}/><circle cx="73" cy="63.5" r="2.2" fill="${xc}" ${kw(.9)}/>`
  ][ea] || '';
  const hz0 = baby ? 1.28 : 1 + .14 * (1 - gr);
  const hd = `translate(50 52) scale(${(hz0 * bd.hz * bd.fw).toFixed(3)} ${(hz0 * bd.hz).toFixed(3)}) translate(-50 -52)`;
  const tb = baby || a >= 16 ? '' : `translate(50 112) scale(${(.84 + .16 * gr).toFixed(3)} ${(.92 + .08 * gr).toFixed(3)}) translate(-50 -112)`;
  const hasBrows = !baby;
  return `<svg viewBox="${vb || '0 0 100 110'}" xmlns="http://www.w3.org/2000/svg"><clipPath id="${id}c"><rect width="100" height="110" rx="16"/></clipPath><g clip-path="url(#${id}c)"><rect width="100" height="110" fill="${BG[l.oc] || BG[0]}"/><circle cx="50" cy="50" r="44" fill="#fff" opacity=".4"/>`
    + `<g transform="${hd}">${baby ? '' : back}</g><g transform="${tb}">${baby ? swaddle : bodyG + locks + neck}</g>`
    + `<g transform="${hd}"><ellipse cx="27" cy="49" rx="3.8" ry="5.2" fill="${sk}" ${k}/><ellipse cx="73" cy="49" rx="3.8" ry="5.2" fill="${sk}" ${k}/>`
    + `<clipPath id="${id}f"><path d="${face}"/></clipPath><path d="${face}" fill="${sk}" ${k}/><rect x="52" y="14" width="30" height="62" fill="#000" opacity=".08" clip-path="url(#${id}f)"/>`
    + `${eye(39)}${eye(61)}${lash(39, -1)}${lash(61, 1)}${hasBrows ? brow(33, 44.5) + brow(67, 55.5) : ''}${nose}${mouth}${chin}${old}${acne}${fuzz}${a < 7 ? `<ellipse cx="32.5" cy="56" rx="4.2" ry="2.8" fill="#ff7a8a" opacity=".32"/><ellipse cx="67.5" cy="56" rx="4.2" ry="2.8" fill="#ff7a8a" opacity=".32"/>` : ''}${glasses}${baby ? babyTuft : front}${hat}${ear}</g></g></svg>`;
}
const RI = [
  { k: 'hang', i: '🛋️', l: ['Közös program', 'Hang out'], roles: AR, ok: [9, 4, 'Együtt töltöttetek egy délutánt: ', 'You spent an afternoon with: '] },
  { k: 'joke', i: '😄', l: ['Vicc', 'Joke'], roles: AR, w: .7, ok: [5, 4, 'Jót nevettetek együtt: ', 'You shared a good laugh with: '], no: [-2, -1, 'Rosszul sült el a poénod: ', 'Your joke fell flat with: '] },
  { k: 'compl', i: '🌟', l: ['Bók', 'Compliment'], roles: AR, w: .75, ok: [5, 3, 'Megdicsérted: ', 'You complimented: '], no: [-3, -2, 'Kínosra sikerült a bók: ', 'Your compliment got awkward with: '] },
  { k: 'adv', i: '💡', l: ['Tanácsot kérek', 'Ask advice'], m: 8, roles: NR, ok: [4, 2, 'Jó tanácsot kaptál tőle: ', 'You got good advice from: ', { sma: 1 }] },
  { k: 'cook', i: '🍳', l: ['Közös főzés', 'Cook together'], m: 10, roles: AR, ok: [8, 5, 'Együtt főztetek: ', 'You cooked together with: '] },
  { k: 'prank', i: '🤡', l: ['Csíny', 'Prank'], m: 8, roles: ['Barát', 'Osztálytárs', 'Testvér', 'Szomszéd', 'Munkatárs'], w: .5, ok: [8, 5, 'A csínytevésed sikerült, jót nevettetek: ', 'Your prank worked, you laughed with: '], no: [-10, -3, 'A csínytevésed rosszul sült el: ', 'Your prank backfired on: '] },
  { k: 'arg', i: '💢', l: ['Veszekedés', 'Argue'], m: 6, ok: [-12, -4, 'Összevesztetek: ', 'You had a fight with: '] },
  { k: 'peace', i: '🕊️', l: ['Kibékülés', 'Make peace'], role: 'Riválisod', w: .6, ok: [30, 6, 'Kibékültetek: ', 'You made peace with: '], no: [-5, -3, 'Nem sikerült kibékülni: ', 'Making peace failed with: '] },
  { k: 'sorry', i: '🙏', l: 'Bocsánatot kérek', m: 5, u: r => r.bond < 60, w: .8, ok: [14, -1, 'Megbocsátott neked: '], no: [-3, -2, 'Nem fogadta el a bocsánatkérésed: '] },
  { k: 'help', i: '🤝', l: 'Segítek neki', m: 8, roles: AR, ok: [9, 3, 'Segítettél neki: '] },
  { k: 'study', i: '📚', l: 'Közös tanulás', m: 8, M: 30, roles: ['Barát', 'Osztálytárs', 'Testvér', 'Párod'], ok: [6, 1, 'Együtt tanultatok: ', , { sma: 3 }] },
  { k: 'sport', i: '⚽', l: 'Közös sportolás', m: 8, roles: ['Barát', 'Osztálytárs', 'Munkatárs', 'Testvér', 'Párod', 'Házastárs'], ok: [6, 3, 'Együtt sportoltatok: ', , { hea: 4 }] },
  { k: 'coffee', i: '☕', l: 'Kávé / fagyi', m: 10, c: 5e3, roles: AR.filter(x => x != 'Gyerek').concat('Gyerek'), ok: [7, 4, 'Leültetek egy kávéra / fagyira: '] },
  { k: 'party', i: '🎉', l: 'Buli', m: 16, c: 5e4, roles: ['Barát', 'Munkatárs', 'Testvér', 'Párod', 'Házastárs'], w: .85, ok: [10, 10, 'Fergeteges buli volt: ', , { hea: -2 }], no: [-3, -4, 'Elfajult a buli: ', , { hea: -3 }] },
  { k: 'trip', i: '🏖️', l: 'Közös utazás', m: 18, c: 3e5, roles: ['Barát', 'Párod', 'Házastárs', 'Anya', 'Apa', 'Testvér'], ok: [15, 14, 'Közös nyaralás volt: '] },
  { k: 'drive', i: '🚗', l: 'Autós kirándulás', m: 18, c: 3e4, u: () => driver(), roles: ['Barát', 'Párod', 'Házastárs', 'Anya', 'Apa', 'Testvér', 'Munkatárs'], w: .9, ok: [9, 8, 'Autós kirándulás volt: '], no: [2, -4, 'Eltévedtetek, de legalább együtt voltatok: '] },
  { k: 'secret', i: '🤫', l: 'Titkot megosztok', m: 10, roles: ['Barát', 'Testvér', 'Párod', 'Házastárs'], w: .8, ok: [10, 4, 'Bizalmába fogadott: '], no: [-12, -5, 'Kiderült a titok, megsértődött: '] },
  { k: 'loan', i: '💸', l: 'Kölcsönt kérek', m: 18, roles: ['Barát', 'Testvér', 'Anya', 'Apa'], u: r => r.bond >= 45, w: .65, ok: [-4, 2, 'Kölcsönadott neked pénzt: ', , { money: 15e4 }], no: [-8, -3, 'Nemet mondott a kölcsönre: '] },
  { k: 'date', i: '🌹', l: 'Randi', m: 16, c: 8e4, roles: LOVE, w: .9, ok: [10, 10, 'Remek randi volt: '], no: [-4, -3, 'Rosszul sült el a randi: '] },
  { k: 'flirt', i: '😍', l: 'Flörtölök', m: 16, roles: ['Barát', 'Osztálytárs', 'Munkatárs'], u: () => !partner(), w: .4, ok: [12, 6, 'Működött a flört: '], no: [-8, -4, 'Kínosra sikerült a flört: '] },
  { k: 'chores', i: '🧹', l: 'Segítek otthon', m: 6, roles: ['Anya', 'Apa', 'Testvér'], ok: [8, 2, 'Segítettél otthon: '] },
  { k: 'dinner', i: '🍲', l: 'Közös vacsora', m: 3, roles: ['Anya', 'Apa', 'Testvér', 'Párod', 'Házastárs', 'Gyerek'], ok: [8, 5, 'Együtt vacsoráztatok: '] },
  { k: 'play', i: '🧩', l: 'Játszunk', m: 2, M: 12, roles: ['Barát', 'Testvér', 'Osztálytárs', 'Szomszéd'], ok: [8, 6, 'Játszottatok együtt: '] },
  { k: 'story', i: '📖', l: 'Mesét olvasok', roles: ['Gyerek'], u: r => r.age < 10, ok: [8, 5, 'Mesét olvastál neki: '] },
  { k: 'hw', i: '✏️', l: 'Segítek a leckében', roles: ['Gyerek'], u: r => r.age >= 6 && r.age < 18, ok: [8, 3, 'Segítettél neki a leckében: '] },
  { k: 'outing', i: '🎡', l: 'Közös kirándulás', c: 6e4, roles: ['Gyerek'], u: r => r.age >= 2, ok: [12, 10, 'Kirándultatok együtt: '] },
  { k: 'pocket', i: '💰', l: 'Zsebpénz', c: 1e4, roles: ['Gyerek'], u: r => r.age >= 6 && r.age < 18, ok: [5, 0, 'Zsebpénzt adtál neki: '] },
  { k: 'scold', i: '☝️', l: 'Megdorgálom', roles: ['Gyerek'], u: r => r.age >= 4, ok: [-8, -3, 'Megdorgáltad: ', , { sma: 0 }] },
  { k: 'career', i: '💼', l: 'Karriertanács', m: 16, roles: ['Mentor'], w: .7, ok: [8, 2, 'Karriertanácsot kaptál tőle: ', , { sma: 3 }], no: [2, 0, 'Most nem ért rá rád: '] },
  { k: 'hobby', i: '🎯', l: 'Közös hobbi', m: 6, roles: ['Barát', 'Osztálytárs', 'Testvér', 'Párod', 'Házastárs', 'Munkatárs'], u: () => hobN() > 0, ok: [8, 5, 'Együtt hobbiztatok: ', , { hob: 1 }] },
  { k: 'duel', i: '⚔️', l: 'Szócsata', m: 8, role: 'Riválisod', w: .5, ok: [-3, 4, 'Megleckéztetted: '], no: [-6, -6, 'Alulmaradtál a vitában: '] }
];
const riR = x => { const r = ['bond']; if (x.ok[1] > 0) r.push('hap'); const f = x.ok[4] || {}; for (const k in f) if (f[k] > 0 && SI[k]) r.push(k); return r; };
function rint(i, k) {
  const r = p.rel[i], x = RI.find(q => q.k == k), id = 'i' + k + i, c = p.age < 18 ? 0 : x.c || 0;
  if (p.done[id] || !can(c)) return; p.done[id] = 1; p.money -= c;
  const win = Math.random() < (x.w || 1), b = win ? x.ok : x.no; r.bond = cl(r.bond + b[0]);
  if (k == 'peace' && win) r.role = 'Barát';
  fxlog(T([b[2], b[3] || b[2]]) + dn(r.n) + '.', { hap: b[1], ...(b[4] || {}) });
  if (k == 'flirt' && win && r.bond >= 50 && !partner()) { r.role = 'Párod'; lg(`Összejöttetek: ${r.n}!`, 'good'); }
  render();
}
const avatar = (g, a, skin, dead) => dead ? '🪦' : (a < 2 ? '👶' : a < 20 ? (g == 'f' ? '👧' : '👦') : a < 65 ? (g == 'f' ? '👩' : '👨') : (g == 'f' ? '👵' : '👴')) + (SKIN[skin] || '');

function render() {
  const A = $('#app'), a = p.age;
  if (tab && p.ln > seen && !p.dead) { lastPlace = { tab, sub, relOpen }; tab = null; sub = null; relOpen = null; $('#view').scrollTop = 0; }
  if (tab == 'job' && sub && sub.startsWith('h:') && !p.hob[sub.slice(2)]) sub = 'hobs';
  if (tab == 'assets' && sub && sub.startsWith('a:') && !p.assets[+sub.slice(2)]) sub = 'own';
  A.dataset.st = a < 13 ? 'kid' : a < 20 ? 'teen' : a < 65 ? 'adult' : 'old'; A.classList.toggle('dead', p.dead && !ackDead);
  $('#nm').textContent = dn(p.name);
  $('#sg').textContent = (p.dead ? T(['Elhunyt', 'Deceased']) : p.prison > 0 ? T(['Börtönben', 'In prison']) : stage(a)) + (p.sick ? ' 🤒' : '') + ', ' + p.city[0];
  $('#mo').textContent = fmt(p.money);
  if (prev && p.money != prev.money) { const m = $('#mo'); m.classList.remove('upm', 'dnm'); void m.offsetWidth; m.classList.add(p.money > prev.money ? 'upm' : 'dnm'); }
  const ag = $('#ag'), av = $('#av');
  if (ag.textContent != a) { ag.textContent = a; [ag, av].forEach(x => { x.classList.remove('pop'); void x.offsetWidth; x.classList.add('pop'); }); }
  av.innerHTML = avSvg(p.look || (p.look = mkLook(p.g, p.skin || 3)), a, p.dead);
  for (const k in ST) {
    const v = Math.round(p[k]); $('#v' + k).textContent = v;
    const i = $('#b' + k); i.style.width = v + '%'; i.style.background = v < 25 ? '#c23b3b' : v < 50 ? '#f0b429' : '';
    if (prev && v != prev[k]) { const d = v - prev[k], f = document.createElement('span'); f.className = 'fl ' + (d > 0 ? 'p' : 'n'); f.textContent = (d > 0 ? '+' : '') + d; $('#c' + k).append(f); setTimeout(() => f.remove(), 1300); }
  }
  $('#view').innerHTML = logHtml(); seen = p.ln || 0;
  const sb = $('#sbody'), sc = sb.scrollTop;
  sb.innerHTML = tab ? panel(tab) : ''; sb.scrollTop = sc;
  sb.classList.remove('fresh'); const pk_ = tab + '|' + sub + '|' + relOpen; if (tab && pk_ != lastTab) { void sb.offsetWidth; sb.classList.add('fresh'); } lastTab = tab ? pk_ : null;
  $('#sheet').hidden = !tab; $('#stt').textContent = subTitle(tab, sub, relOpen);
  document.querySelectorAll('#dock [data-s]').forEach(b => b.classList.toggle('on', b.dataset.s == tab));
  { const o = occ(), jb = $('#dock [data-s=job]'); jb.querySelector('i').textContent = o[0]; jb.querySelector('span').textContent = o[1]; }
  { const bb = $('#back'); bb.hidden = !(lastPlace && !tab && !p.dead); if (lastPlace) bb.textContent = '↩ ' + placeName(lastPlace); }
  $('#up').disabled = p.dead;
  if (p.dead) {
    const net = netw(), k = p.rel.filter(r => r.role == 'Gyerek').length, rb = [];
    if (p.age >= 90) rb.push('🏅 Hosszú élet'); if (p.age < 30) rb.push('💔 Korai búcsú'); if (net >= 1e8) rb.push('💰 Százmilliomos');
    if (k >= 3) rb.push('👨‍👩‍👧‍👦 Nagycsalád'); if (p.crim >= 2) rb.push('🚨 Köztörvényes'); if (p.edu == 2) rb.push('🎓 Diplomás'); if (p.rel.some(r => r.role == 'Házastárs')) rb.push('💍 Házasság');
    if (Object.values(p.hob || {}).some(h => h.lv >= 90)) rb.push('🎯 Hobbimester'); if (p.car && p.car.rank >= 3) rb.push('🌟 Karrier csúcs');
    $('#es').textContent = `${p.name} ${p.age} évet élt (${p.city[0]}).\nVégzettség: ${T(EDU[p.edu])}\nMunka: ${p.job || (p.car ? CAR_BY[p.car.id].ranks[p.car.rank][0] : p.pension ? 'nyugdíjas' : 'nincs')}\nNettó vagyon: ${fmt(net)}\nGyerekek: ${k}` + (rb.length ? '\n\n' + rb.join('\n') : '');
    if ($('#end').hidden && !endT) { flash('bad'); endT = setTimeout(() => { $('#end').hidden = false; endT = 0; }, 1100); }
  }
  prev = { money: p.money }; for (const k in ST) prev[k] = Math.round(p[k]);
  save();
}

// ----- képernyők: főoldal és karakterkészítő -----
const show = id => document.querySelectorAll('.scr').forEach(s => s.hidden = s.id != id);
const clean = s => s.replace(/[<>&"'`\\]/g, '').trim().slice(0, 16);
function showTitle() {
  const c = !!(p && !p.dead);
  $('#tcont').hidden = !c; $('#tcont').classList.toggle('pri', c); $('#tnew').classList.toggle('pri', !c);
  if (c) $('#tcs').textContent = `${p.name} · ${p.age} ${T(['éves', 'yr'])}`;
  show('title');
}
const cfg = () => [
  { k: 'g', l: T(['Nem', 'Gender']), o: [['f', T(['Lány', 'Girl'])], ['m', T(['Fiú', 'Boy'])], ['r', '🎲']] },
  { ap: 1, k: 'skin', l: T(['Bőrszín', 'Skin tone']), o: [[1, ''], [2, ''], [3, ''], [4, ''], [5, ''], ['r', '🎲']] },
  { ap: 1, k: 'hs', pv: 'hair', l: T(['Frizura', 'Hairstyle']), o: [...HSN.keys()].map(i => [i, T(HSN[i])]).concat([['r', '🎲']]) },
  { ap: 1, k: 'bd', pv: 'body', l: T(['Testalkat', 'Body shape']), o: [...BDN.keys()].map(i => [i, T(BDN[i])]).concat([['r', '🎲']]) },
  { ap: 1, k: 'hc', l: T(['Hajszín', 'Hair color']), o: [[0, ''], [1, ''], [2, ''], [3, ''], [4, ''], [5, ''], ['r', '🎲']] },
  { ap: 1, k: 'ot', pv: 'body', l: T(['Ruha típusa', 'Outfit']), o: [...OTN.keys()].map(i => [i, T(OTN[i])]).concat([['r', '🎲']]) },
  { ap: 1, k: 'oc', l: T(['Ruha színe', 'Outfit color']), o: [[0, ''], [1, ''], [2, ''], [3, ''], [4, ''], [5, ''], [6, ''], [7, ''], ['r', '🎲']] },
  { ap: 1, k: 'ht', pv: 'hair', nv: 1, l: T(['Fejfedő', 'Headwear']), o: [...HTN.keys()].map(i => [i, T(HTN[i])]).concat([['r', '🎲']]) },
  { ap: 1, k: 'ea', pv: 'hair', nv: 1, l: T(['Fejhallgató, fülhallgató', 'Headphones & earbuds']), o: [...EAN.keys()].map(i => [i, T(EAN[i])]).concat([['r', '🎲']]) },
  { ap: 1, k: 'gl', pv: 'hair', nv: 1, l: T(['Szemüveg', 'Glasses']), o: [...GLN.keys()].map(i => [i, T(GLN[i])]).concat([['r', '🎲']]) },
  { ap: 1, k: 'nc', pv: 'neck', nv: 1, l: T(['Nyakra', 'Neckwear']), o: [...NCN.keys()].map(i => [i, T(NCN[i])]).concat([['r', '🎲']]) },
  { ap: 1, k: 'xc', l: T(['Kiegészítők színe', 'Accessory color']), o: [[0, ''], [1, ''], [2, ''], [3, ''], [4, ''], [5, ''], [6, ''], [7, ''], ['r', '🎲']] },
  { k: 'city', l: T(['Szülőváros', 'Hometown']), o: CITY.map(c => [c[0], c[0]]).concat([['r', '🎲']]) },
  { k: 'fam', l: T(['Család', 'Family']), o: [[1, T(['Szerény', 'Modest'])], [2, T(['Átlagos', 'Average'])], [3, T(['Tehetős', 'Wealthy'])], ['r', '🎲']] },
  { k: 'gift', l: T(['Tehetség (+15)', 'Talent (+15)']), o: [['hap', '😊 ' + T(['Vidám', 'Cheerful'])], ['hea', '❤️ ' + T(['Egészséges', 'Healthy'])], ['sma', '🧠 ' + T(['Okos', 'Smart'])], ['loo', '✨ ' + T(['Szép', 'Attractive'])], ['r', '🎲']] }
];
let cc = {};
const VB = { hair: '4 0 92 84', body: '0 0 100 110', neck: '8 40 84 70' };
let apOpen = false;
const ccLook = (o = {}) => { const g = cc.g == 'f' ? 'f' : 'm', n = (k, d) => o[k] != null ? o[k] : cc[k] == 'r' || cc[k] == null ? d : +cc[k];
  return { g, sk: n('skin', 3), hs: n('hs', g == 'f' ? 1 : 0), hc: n('hc', 1), oc: n('oc', 0), bd: n('bd', 0), ot: n('ot', 0), ht: n('ht', 0), ea: n('ea', 0), gl: n('gl', 0), nc: n('nc', 0), xc: n('xc', 5) }; };
function drawC() {
  const grp = c => `<div class="cg"><small>${c.l}</small><div class="chips">${c.o.map(([v, t]) => {
    const on = cc[c.k] == v ? ' on' : '', at = `data-k="${c.k}" data-v="${v}"`;
    if (c.nv && v == 0) return `<button class="chip${on}" ${at}>${t}</button>`;
    if (c.pv && v != 'r') return `<button class="chip pv${on}" ${at} title="${t}" aria-label="${t}">${avSvg(ccLook({ [c.k]: v }), 20, false, VB[c.pv])}</button>`;
    return `<button class="chip${on}" ${at}>${SW[c.k] && v != 'r' ? `<i class="sw" style="background:${SW[c.k][v]}"></i>` : t}</button>`;
  }).join('')}</div></div>`;
  const A = cfg(); $('#copts').innerHTML = A.filter(c => !c.ap).map(grp).join('') + `<details class="ap" ${apOpen ? 'open' : ''}><summary>${T(['Kinézet testreszabása (opcionális)', 'Customize appearance (optional)'])}</summary>${A.filter(c => c.ap).map(grp).join('')}</details>`;
  $('#cav').innerHTML = avSvg(ccLook(), 20);
}
function openCreate() { ackDead = true; $('#app').classList.remove('dead'); cc = { g: 'r', skin: 'r', hs: 'r', hc: 'r', oc: 'r', bd: 'r', ot: 'r', ht: 'r', ea: 'r', gl: 'r', nc: 'r', xc: 'r', city: 'r', fam: 'r', gift: 'r' }; cc.tr = { ...TRD }; cc.mode = 'none'; $('#cfn').value = $('#cln').value = ''; drawC(); show('create'); }
function startLife(rand) {
  newLife(rand ? {} : { ...cc, fn: clean($('#cfn').value), ln: clean($('#cln').value) });
  if (!rand && cc.mode && cc.mode != 'none') { p.mode = cc.mode; if (cc.mode == 'poor') { p.fam = 1; p.money = 0; } }
  clearAuto();
  seen = 0; prev = null; tab = null; sub = null; lastPlace = null; relOpen = null; lastTab = null; clearTimeout(endT); endT = 0; ackDead = false;
  document.querySelectorAll('.scr').forEach(s => s.hidden = true); $('#end').hidden = true; $('#modal').hidden = true;
  render(); confetti(90); autoSave();
}

// ----- indítás -----
const UI = {
  menu: ['Menü', 'Menu'], work: ['Foglalkozás', 'Occupation'], assets: ['Pénzügy', 'Finance'], ppl: ['Kapcsolatok', 'Relations'], todo: ['Tevékenységek', 'Activities'], yr: ['év', 'yr'], agebtn: ['Kor', 'Age'],
  tag: ['Egy élet. Annyi döntés.', 'One life. So many choices.'], start: ['Új élet kezdése', 'Start a new life'], cont: ['Folytatás', 'Continue'], set: ['Beállítások', 'Settings'], next: ['Tovább ›', 'Next ›'],
  ttl: ['Jellem készítő', 'Personality builder'], tsub: ['Állítsd be, milyen leszel. Ezt csak most, a születésedkor lehet módosítani, később már nem.', 'Shape who you will be. You can only set this now, at birth, never later.'], mode: ['Kihívás-mód', 'Challenge mode'], rj: ['🎲 Véletlen jellem', '🎲 Random'], pick: ['Melyik mentéstől folytatod?', 'Which save do you continue from?'], last: ['Utolsó állapot', 'Latest state'], auto: ['Automatikus mentés', 'Autosave'], lng: ['Nyelv', 'Language'], back: ['‹ Vissza', '‹ Back'],
  sur: ['Vezetéknév', 'Last name'], giv: ['Keresztnév', 'First name'], ra: ['🎲 Teljesen véletlen', '🎲 Fully random'], go: ['Megszületek', 'Be born'],
  endt: ['Vége az életednek', 'Your life is over'], again: ['Új élet kezdése', 'Start a new life'], lang: ['Nyelv', 'Language'], names: ['Nevek mutatása', 'Show names'],
  nomoney: [' (nincs pénz)', ' (not enough money)'], conf: ['A mostani élet elvész. Biztos vagy benne?', 'Your current life will be lost. Are you sure?'] };
const u = k => T(UI[k]);
function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i]').forEach(e => e.textContent = u(e.dataset.i));
  document.querySelectorAll('[data-ip]').forEach(e => e.placeholder = u(e.dataset.ip));
  document.querySelectorAll('[data-l]').forEach(b => b.classList.toggle('on', b.dataset.l == LANG));
  const lv = $('#tlv'); if (lv) lv.textContent = LANG == 'hu' ? 'Magyar' : 'English';
  const gr = $('#tgear'); if (gr) gr.setAttribute('aria-label', u('set'));
}
let lbl = false; try { lbl = localStorage.getItem('relife_lbl') == '1'; } catch (e) {}
function buildBars() {
  $('#bars').innerHTML = Object.entries(ST).map(([k, [e, n]]) => `<div class="cell" id="c${k}"><div class="ic">${e}<em>${T(n)}</em></div><div class="tr"><i id="b${k}"></i></div><span class="vn" id="v${k}"></span></div>`).join('') + `<button id="lbl" aria-label="${u('names')}">▾</button>`;
  $('#bars').classList.toggle('names', lbl);
  $('#lbl').onclick = () => { lbl = !lbl; try { localStorage.setItem('relife_lbl', lbl ? '1' : '0'); } catch (e) {} $('#bars').classList.toggle('names', lbl); };
}
document.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { $('#lsel').hidden = true; LANG = b.dataset.l; try { localStorage.setItem('relife_lang', LANG); } catch (e) {} applyLang(); buildBars(); if (!$('#create').hidden) drawC(); if (!$('#traits').hidden) drawT(); if (p) render(); if (!$('#title').hidden) showTitle(); });
buildBars(); applyLang();
$('#up').onclick = () => up();
$('#nw').onclick = showTitle;
$('#tnew').onclick = () => { if (p && !p.dead && !confirm(u('conf'))) return; openCreate(); };
const hideScr = () => document.querySelectorAll('.scr').forEach(s => s.hidden = true);
function pickBox(title, items) {
  $('#pkt').textContent = title; const b = $('#pkb'); b.innerHTML = '';
  items.forEach(([l, sub, fn]) => { const x = document.createElement('button'); x.className = 'pkb'; x.innerHTML = `<b>${l}</b>${sub ? `<small>${sub}</small>` : ''}`; x.onclick = () => { $('#pk').hidden = true; if (fn) fn(); }; b.append(x); });
  const c = document.createElement('button'); c.className = 'pkb x'; c.textContent = '✕'; c.onclick = () => { $('#pk').hidden = true; }; b.append(c);
  $('#pk').hidden = false;
}
$('#pk').onclick = e => { if (e.target.id == 'pk') $('#pk').hidden = true; };
$('#lsel').onclick = e => { if (e.target.id == 'lsel') $('#lsel').hidden = true; };
$('#tlang').onclick = () => { $('#lsel').hidden = false; };
const ago = ts => { const m = Math.round((Date.now() - ts) / 6e4); return m < 1 ? T(['épp most', 'just now']) : m < 60 ? m + T([' perce', ' min ago']) : m < 1440 ? Math.round(m / 60) + T([' órája', ' h ago']) : Math.round(m / 1440) + T([' napja', ' d ago']); };
function loadAuto(k) {
  let q = null; try { q = JSON.parse(localStorage.getItem('relife_auto' + k)); } catch (e) {}
  if (!q || !q.rel || !q.assets) return;
  p = q; fixP(); save(); clearTimeout(endT); endT = 0; seen = p.ln || 0; prev = null; tab = null; sub = null; relOpen = null; lastPlace = null; lastTab = null; ackDead = false;
  $('#app').classList.remove('dead'); $('#end').hidden = true; $('#modal').hidden = true; hideScr(); render();
}
$('#tcont').onclick = () => {
  const au = p && !p.dead ? autoMeta().filter(x => x.a != p.age && localStorage.getItem('relife_auto' + x.k)).sort((a, b) => b.ts - a.ts) : [];
  if (!au.length) { hideScr(); render(); return; }
  pickBox(u('pick'), [[`▶ ${u('last')}`, `${p.name} · ${p.age} ${T(['éves', 'yr'])}`, () => { hideScr(); render(); }]]
    .concat(au.map(x => [`💾 ${u('auto')}`, `${x.n} · ${x.a} ${T(['éves', 'yr'])} · ${ago(x.ts)}`, () => loadAuto(x.k)])));
};
$('#cback').onclick = showTitle;
$('#again').onclick = () => { $('#end').hidden = true; openCreate(); };
$('#crand').onclick = () => startLife(true);
$('#cgo').onclick = () => { drawT(); show('traits'); $('#traits .cwrap').scrollTop = 0; };

// ----- Jellem készítő (a karakterkészítő után) -----
function drawT() {
  $('#tav').innerHTML = avSvg(ccLook(), 20);
  $('#tsl').innerHTML = TRS.map(x => { const v = cc.tr[x.k]; return `<div class="trow"><div class="tt"><span>${x.i} ${T(x.l)}</span><em id="tv_${x.k}">${v}</em></div><input type="range" class="sl" min="0" max="100" value="${v}" data-t="${x.k}" style="--v:${v}%" aria-label="${T(x.l)}"><div class="ends"><span>${T(x.a)}</span><span>${T(x.b)}</span></div><div class="hint">${T(x.h)}</div></div>`; }).join('');
  $('#tmode').innerHTML = MODES.map(m => `<button class="chip${cc.mode == m[0] ? ' on' : ''}" data-m="${m[0]}">${T(m[1])}</button>`).join('');
  $('#tmd').textContent = T(MODES.find(m => m[0] == cc.mode)[2]);
}
$('#tsl').addEventListener('input', e => { const s = e.target, k = s.dataset.t; if (!k) return; cc.tr[k] = +s.value; $('#tv_' + k).textContent = s.value; s.style.setProperty('--v', s.value + '%'); });
$('#tmode').onclick = e => { const b = e.target.closest('[data-m]'); if (b) { cc.mode = b.dataset.m; drawT(); } };
$('#trand').onclick = () => { cc.tr = mkTr(); drawT(); };
$('#tback').onclick = () => show('create');
$('#tgo').onclick = () => startLife(false);
$('#dice').onclick = () => { const g = cc.g == 'r' ? P(['f', 'm']) : cc.g; $('#cln').value = P(SN); $('#cfn').value = P(g == 'f' ? NF : NM); };
$('#copts').addEventListener('toggle', e => { apOpen = e.target.open; }, true);
$('#copts').onclick = e => { const b = e.target.closest('.chip'); if (b) { cc[b.dataset.k] = b.dataset.v; drawC(); } };
$('#cls').onclick = () => { tab = null; sub = null; relOpen = null; render(); };
$('#back').onclick = () => { if (!lastPlace) return; tab = lastPlace.tab; sub = lastPlace.sub; relOpen = lastPlace.relOpen; render(); $('#sbody').scrollTop = 0; };
$('#sheet').onclick = e => { if (e.target.id == 'sheet') { tab = null; sub = null; relOpen = null; render(); } };
document.querySelectorAll('#dock [data-s]').forEach(b => b.onclick = () => { tab = tab == b.dataset.s ? null : b.dataset.s; sub = null; relOpen = null; render(); });
load();
function fixP() {
if (p && p.lic == null) p.lic = hasCar();
if (p) p.rel.forEach(r => { if (r.role == 'Osztálytárs' && r.sch == null) { if (inSchool()) r.sch = schoolId(); else { r.sch = 'x'; r.past = true; } } });
if (p && p.pet && p.pet.tr == null) p.pet.tr = 0;
if (p && p.car && p.car.id == 'streamer') { const f = [300, 4000, 40000, 400000, 2e6][p.car.rank || 0]; p.car = { id: 'vid', rank: p.car.rank || 0, perf: p.car.perf || 35, yrs: p.car.yrs || 0, perks: p.car.perks, acc: { yt: { f, n: 0, vw: 0, ver: false, ban: 0, act: 0 } }, sel: 'yt' }; }
if (p) p.rel.forEach(r => { if (r.par && r.kin == null) r.kin = genKin(r); });
if (p) { p.hob = p.hob || {}; p.car = p.car || null; if (p.jp == null) p.jp = 30; p.fit = p.fit == null ? 30 : p.fit; p.lang = p.lang || 0; p.trav = p.trav || {}; p.inv = p.inv || 0; p.cry = p.cry || 0; p.debt = p.debt || 0; p.jr = p.jr || 0; p.assets.forEach(x => { if (x.cond == null) x.cond = 80; x.ins = !!x.ins; x.rent = !!x.rent; }); } // régi mentés: aki már autót vett, annak van jogsija
if (p && (!p.tr || p.tr.ext == null)) { const o = p.tr || {}; p.tr = { ext: p.trait == 'ext' ? 80 : p.trait == 'int' ? 20 : 50, amb: p.trait == 'amb' ? 80 : p.trait == 'calm' ? 20 : 50, grit: o.grit != null ? o.grit : 30, emp: o.emp != null ? o.emp : 30, cre: o.cre != null ? o.cre : 30 }; delete p.trait; }
}
fixP();
if (p && !p.dead) { seen = p.ln || 0; render(); }
showTitle();

function navUp() { if (relOpen != null) { relOpen = null; render(); return true; } if (sub) { goBack(); return true; } if (tab) { tab = null; render(); return true; } return false; }
try { history.replaceState({ r: 0 }, ''); history.pushState({ r: 1 }, ''); } catch (e) { }
window.addEventListener('popstate', () => {
  if (!$('#title').hidden) return;
  if (!$('#modal').hidden || !$('#end').hidden) { try { history.pushState({ r: 1 }, ''); } catch (e) { } return; }
  if (!$('#traits').hidden) { $('#tback').click(); } else if (!$('#create').hidden) { $('#cback').click(); } else navUp();
  try { history.pushState({ r: 1 }, ''); } catch (e) { }
});
