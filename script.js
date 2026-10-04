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
const fill = s => pend ? s.replace(/\{n\}/g, dn(pend.n)).replace(/\{f\}/g, dn(pend.n).split(' ')[0]) : s;
const exl = role => p.rel.filter(r => r.alive && role.split(',').includes(r.role) && r.age >= 18);
const mkNpc = o => { const g = P(['f', 'm']); return { n: `${P(SN)} ${P(g == 'f' ? NF : NM)}`, role: o.role, age: o.a ? R(o.a[0], o.a[1]) : Math.max(3, p.age + R(o.r[0], o.r[1])), bond: 40, alive: true }; };
const NF = ['Anna', 'Hanna', 'Lili', 'Zsófia', 'Emma', 'Nóra', 'Boglárka', 'Dóra', 'Réka', 'Vivien', 'Luca', 'Eszter', 'Panna', 'Kinga', 'Fanni', 'Bianka'];
const NM = ['Bence', 'Máté', 'Levente', 'Dániel', 'Marcell', 'Ádám', 'Zalán', 'Patrik', 'Balázs', 'Gergő', 'Olivér', 'Kristóf', 'Milán', 'Tamás', 'Noel', 'Barnabás'];
const SN = ['Kovács', 'Tóth', 'Szabó', 'Németh', 'Farkas', 'Horváth', 'Varga', 'Kiss', 'Molnár', 'Balogh', 'Papp', 'Takács', 'Juhász', 'Lakatos', 'Mészáros', 'Simon'];
const ST = { hap: ['😊', ['Boldog', 'Happy']], hea: ['❤️', ['Egészség', 'Health']], sma: ['🧠', ['Okos', 'Smart']], loo: ['✨', ['Kinézet', 'Looks']] };
const fmt = n => { const a = Math.abs(n), en = LANG == 'en'; return (n < 0 ? '−' : '') + (a >= 1e6 ? (a / 1e6).toFixed(1).replace('.', en ? '.' : ',') + ' M Ft' : Math.round(a / 1e3) + (en ? ' k Ft' : ' e Ft')); };
const EDU = [['Általános', 'Primary'], ['Érettségi', 'High school'], ['Diploma', 'Degree']];
let p, tab = null, relOpen = null;
const hasCar = () => p.assets.some(x => x.t == 'car'), hasHouse = () => p.assets.some(x => x.t == 'house'), kidsU = () => kids().filter(k => k.age < 18);
const driver = () => p.lic && hasCar(); // autós események csak jogosítvánnyal ÉS autóval
const can = c => !c || p.money >= c; // ingyenes dolog mindig elérhető, mínuszban is
const NR = ['Barát', 'Osztálytárs', 'Munkatárs', 'Szomszéd', 'Mentor', 'Anya', 'Apa', 'Testvér', 'Párod', 'Házastárs'], AR = NR.concat('Gyerek'), LOVE = ['Párod', 'Házastárs'];

// ----- adatok -----
const JOBS = [
  { n: 'Pincér', e: 0, s: 0, pay: 3e6 }, { n: 'Eladó', e: 0, s: 0, pay: 3.4e6 },
  { n: 'Raktáros', e: 0, s: 10, pay: 3.8e6 }, { n: 'Influenszer', e: 0, s: 0, l: 70, pay: 4e6 },
  { n: 'Szakács', e: 1, s: 30, pay: 4.4e6 }, { n: 'Villanyszerelő', e: 1, s: 40, pay: 5.4e6 },
  { n: 'Tanár', e: 2, s: 50, c: 1, pay: 5.8e6 }, { n: 'Programozó', e: 2, s: 60, pay: 10e6 },
  { n: 'Ügyvéd', e: 2, s: 65, c: 1, pay: 12e6 }, { n: 'Orvos', e: 2, s: 75, c: 1, pay: 14e6 }, { n: 'Ápoló', e: 1, s: 40, pay: 4.6e6 }, { n: 'Mérnök', e: 2, s: 60, pay: 8e6 }, { n: 'Pilóta', e: 2, s: 70, l: 50, c: 1, pay: 16e6 }
];
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
  { a: [7, 13], t: 'Kutya', d: 'Nagyon vágysz egy kutyára. Megkéred a szüleidet?', o: [
    ['Kérem', [[2, 'Kaptál egy kutyát, a legjobb barátod lett.', { hap: 15 }], [1, 'Nemet mondtak.', { hap: -6 }]]],
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
  { a: [25, 70], np: { role: 'Barát', r: [-2, 2] }, t: ['Régi osztálytárs', 'Old classmate'], d: ['Egy régi osztálytársad, {n} szembejön az utcán.', 'An old classmate, {n}, runs into you on the street.'], o: [
    [['Meghívom egy kávéra', 'Invite for coffee'], [[3, ['Órákig beszélgettetek, újra jóban lettetek.', 'You talked for hours and reconnected.'], { hap: 8, npc: ['Barát', 55] }]]],
    [['Köszönök és megyek', 'Say hi and go'], [[1, ['Röviden váltottatok pár szót.', 'You exchanged a few quick words.'], { hap: 1 }]]]] },
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
  [20, 70, 'Elromlott az autód, sokba került a javítás.', { money: -4e5 }, () => driver()],
  [1, 12, 'Elestél biciklivel, lehorzsoltad a térded.', { hea: -4 }],
  [25, 70, 'Egy régi barátod váratlanul felhívott.', { hap: 8 }],
  [30, 100, 'Olvastál egy könyvet, ami elgondolkodtatott.', { sma: 4 }]
];

// ----- bővített események (előfeltételekkel) -----
CH.push(
  { a: [18, 80], u: () => driver(), t: 'Lerobbant az autód', d: 'Út közben füstölni kezd a motorháztető, az autó lerobban.', o: [
    ['Szerelőhöz viszem (250 e Ft)', [[1, 'Megjavították, jobb mint új.', { money: -25e4, hap: -2 }]], 25e4],
    ['Magam próbálom megjavítani', [[2, 'Sikerült, ügyes vagy!', { sma: 3, hap: 4 }], [1, 'Csak rosszabb lett, drága lesz a javítás.', { money: -4e5, hap: -6 }]]],
    ['Eladom roncsként', [[1, 'Elvitték a roncsot, az autód elveszett.', { crash: 1, money: 2e5, hap: -4 }]]]] },
  { a: [18, 80], u: () => driver(), t: 'Kilyukadt a gumi', d: 'Defektet kaptál az úton.', o: [
    ['Kicserélem a pótkerékre', [[3, 'Gyorsan megoldottad.', { hap: 1, sma: 1 }], [1, 'Nem ment simán, elkéstél.', { hap: -3 }]]],
    ['Autómentőt hívok (80 e Ft)', [[1, 'Az autómentő gyorsan jött.', { money: -8e4 }]], 8e4]] },
  { a: [18, 80], u: () => driver(), t: 'Közúti baleset', d: 'Egy keresztezésben összeütköztél egy másik autóval.', o: [
    ['Rendőrt hívok', [[2, 'Kisebb koccanás volt, a biztosító rendezte.', { hap: -5, money: -5e4 }], [1, 'Súlyos baleset, az autód totálkáros.', { hea: -25, hap: -15, crash: 1 }]]],
    ['Megegyezünk egymás közt (150 e Ft)', [[1, 'Kifizetted a kárt, és mentetek tovább.', { money: -15e4, hap: -4 }]], 15e4]] },
  { a: [19, 60], u: () => driver(), t: 'Buli után', d: 'Éjjel van, ittál is, és az autód ott áll a ház előtt.', o: [
    ['Beülök a volán mögé', [[3, 'Szerencsére semmi baj nem történt.', { hap: -2 }], [1, 'Rajtakaptak! Elvették a jogosítványodat.', { money: -4e5, hap: -12, nolic: 1 }], [1, 'Balesetet okoztál. Az autó elveszett.', { hea: -20, hap: -15, crash: 1 }]]],
    ['Taxit hívok (15 e Ft)', [[1, 'Biztonságban hazaértél.', { hap: 2, money: -15e3 }]], 15e3],
    ['Ott alszom', [[1, 'Biztonságos döntés volt.', { hap: 1 }]]]] },
  { a: [18, 60], ex: 'Barát', u: () => driver() && exl('Barát').length, t: 'Autós kirándulás', d: '{n} autós kirándulást javasol hétvégére.', o: [
    ['Megyünk! (30 e Ft benzin)', [[3, 'Fantasztikus nap volt együtt.', { money: -3e4, hap: 10, bond: 10 }], [1, 'Eltévedtetek, de jót nevettetek.', { money: -3e4, hap: 5, bond: 6 }]], 3e4],
    ['Inkább nem', [[1, 'Otthon maradtál, {n} csalódott.', { hap: -2, bond: -6 }]]]] },
  { a: [20, 80], u: () => hasHouse(), t: 'Beázik a tető', d: 'A heves esőben beázott a házad teteje.', o: [
    ['Szakembert hívok (400 e Ft)', [[1, 'Rendesen megjavították.', { money: -4e5 }]], 4e5],
    ['Magam tapaszolom', [[2, 'Sikerült ideiglenesen megoldani.', { sma: 2, hap: 2 }], [1, 'Csak ideiglenes volt, nagyobb lett a kár.', { money: -6e5, hap: -5 }]]]] },
  { a: [20, 80], u: () => hasHouse(), t: 'Betörés a háznál', d: 'Nyomát találod, hogy valaki be akart törni hozzád.', o: [
    ['Rendőrt hívok', [[1, 'Jegyzőkönyvet vettek fel, kisebb kár keletkezett.', { money: -1e5, hap: -6 }]]],
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
  [20, 80, 'Elromlott a fűtés a házadban.', { money: -2e5 }, () => hasHouse()],
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

const CITY = [['Budapest', 'Budapesten'], ['Debrecen', 'Debrecenben'], ['Szeged', 'Szegeden'], ['Pécs', 'Pécsett'], ['Győr', 'Győrben'], ['Miskolc', 'Miskolcon']];
const TRAITS = { ext: ['Extrovertált', 'Extroverted'], int: ['Introvertált', 'Introverted'], amb: ['Ambiciózus', 'Ambitious'], calm: ['Nyugodt', 'Calm'] };
const ASSETS = [
  { n: 'Használt Suzuki', t: 'car', i: '🚗', v: 1.5e6 }, { n: 'Toyota Corolla', t: 'car', i: '🚙', v: 6e6 }, { n: 'BMW', t: 'car', i: '🏎️', v: 18e6 },
  { n: 'Garzon', t: 'house', i: '🏢', v: 20e6 }, { n: 'Családi ház', t: 'house', i: '🏡', v: 55e6 }, { n: 'Balatoni villa', t: 'house', i: '🏰', v: 150e6 }
];
const SICK = ['Cukorbetegség', 'Szívbetegség', 'Tüdőgyulladás', 'Daganatos betegség', 'Magas vérnyomás'];

// ----- állapot, mentés -----
const lg = (t, c = '') => { p.logs.push({ a: p.age, t, c, n: p.ln = (p.ln || 0) + 1 }); if (p.logs.length > 160) p.logs.shift(); };
const save = () => { try { localStorage.setItem('relife_save', JSON.stringify(p)); } catch (e) {} };
const person = (role, age, bond, g) => ({ n: `${P(SN)} ${P(g == 'f' ? NF : NM)}`, role, age, bond, alive: true });
const stage = a => T(a < 3 ? ['Csecsemő', 'Baby'] : a < 6 ? ['Óvodás', 'Preschooler'] : a < 14 ? ['Általános iskolás', 'Schoolkid'] : a < 18 ? ['Gimnazista', 'High schooler'] : p.uni ? ['Egyetemista', 'Student'] : a < 65 ? ['Felnőtt', 'Adult'] : ['Nyugdíjas', 'Retiree']);
const kids = () => p.rel.filter(r => r.alive && r.role == 'Gyerek');
const partner = () => p.rel.find(r => r.alive && (r.role == 'Párod' || r.role == 'Házastárs'));

function newLife(o = {}) {
  const g = o.g == 'f' || o.g == 'm' ? o.g : P(['f', 'm']), sn = o.ln || P(SN), fn = o.fn || P(g == 'f' ? NF : NM);
  const city = CITY.find(c => c[0] == o.city) || P(CITY), skin = +o.skin >= 1 ? +o.skin : R(1, 5), trait = TRAITS[o.trait] ? o.trait : P(Object.keys(TRAITS)), gk = ST[o.gift] ? o.gift : P(Object.keys(ST));
  p = { g, skin, trait, name: `${sn} ${fn}`, age: 0, money: 0, hap: R(75, 95), hea: R(80, 100), sma: R(25, 75), loo: R(20, 85),
    edu: 0, uni: false, job: null, pay: 0, yrs: 0, pension: 0, fam: [1, 2, 3].includes(+o.fam) ? +o.fam : R(1, 3), dead: false, done: {}, logs: [], rel: [], assets: [], lic: false, crim: 0, prison: 0, sick: null, city };
  p[gk] = cl(p[gk] + 15);
  p.look = { g, sk: skin, hs: pk(o.hs, () => rndHs(g)), hc: pk(o.hc, () => R(0, 4)), oc: pk(o.oc, () => R(0, 7)), bd: pk(o.bd, rndBd), ot: pk(o.ot, rndOt), ht: pk(o.ht, rndHt), ea: pk(o.ea, rndEa), gl: pk(o.gl, rndGl), nc: pk(o.nc, rndNc), xc: pk(o.xc, () => R(0, 7)) };
  const m = { ...person('Anya', R(22, 38), R(60, 90), 'f'), par: 1 }, f = { ...person('Apa', R(23, 42), R(55, 90), 'm'), par: 1 };
  m.n = `${sn} ${P(NF)}`; f.n = `${sn} ${P(NM)}`;
  p.rel.push(m, f);
  if (Math.random() < .4) p.rel.push({ ...person('Testvér', R(1, 6), 50, P(['f', 'm'])), n: `${sn} ${P(NF.concat(NM))}` });
  lg(`Megszülettél ${p.city[1]}. A neved ${p.name}, a szüleid ${m.n} és ${f.n}. A család ${['szerény', 'átlagos', 'tehetős'][p.fam - 1]} körülmények között él. Jellemed: ${T(TRAITS[trait]).toLowerCase()}.`, 'good');
}
function load() { try { p = JSON.parse(localStorage.getItem('relife_save')); } catch (e) { p = null; } if (!p || !p.rel || !p.assets) p = null; }

// ----- hatások -----
function apply(fx) {
  const o = [];
  for (const k in fx) {
    const v = fx[k];
    if (k == 'money') { p.money += v; o.push((v > 0 ? '+' : '−') + fmt(Math.abs(v))); }
    else if (k == 'raise') { p.pay = Math.round(p.pay * (1 + v)); o.push('+' + Math.round(v * 100) + '% fizetés'); }
    else if (k == 'uni') p.uni = true;
    else if (k == 'lic') p.lic = true;
    else if (k == 'nolic') p.lic = false;
    else if (k == 'crash') { const j = p.assets.findIndex(x => x.t == 'car'); if (j >= 0) p.assets.splice(j, 1); }
    else if (k == 'sportcar') p.assets.push({ n: 'Sportautó', t: 'car', i: '🏎️', v: 1e7 });
    else if (k == 'npc') { if (pend && !p.rel.includes(pend)) { pend.role = v[0]; pend.bond = v[1]; p.rel.push(pend); } }
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
    x.onclick = () => { $('#modal').hidden = true; pick(outs); pend = null; render(); };
    b.append(x);
  });
  $('#modal').hidden = false;
}

// ----- öregedés -----
function up() {
  if (p.dead) return;
  const a = ++p.age, n0 = p.logs.length; pend = null;
  p.done = {};
  if (MS[a]) lg(MS[a]);
  const jail = p.prison > 0;
  if (jail) { p.prison--; apply({ hap: -4 }); lg(p.prison ? 'Börtönben telt az év.' : 'Letelt a büntetésed, szabadlábra kerültél.', p.prison ? 'bad' : 'good'); }
  // pénz
  if (a >= 18 && !p.uni && !jail) {
    const house = p.assets.some(x => x.t == 'house'), cars = p.assets.filter(x => x.t == 'car').length;
    const inc = p.job ? p.pay : p.pension, cost = (house ? 8e5 : 2e6) + cars * 3e5 + kids().filter(k => k.age < 18).length * 6e5;
    p.money += inc - cost;
    if (p.money < 0) { lg('Eladósodtál, ez nagyon stresszes.', 'bad'); apply({ hap: -5 }); }
  }
  p.assets.forEach(x => x.v = Math.round(x.v * (x.t == 'car' ? .9 : 1.04)));
  // betegség
  if (p.sick) { apply({ hea: -R(3, 8) }); lg(`A betegséged (${p.sick}) rontja az egészségedet.`, 'bad'); }
  else if (a > 20 && Math.random() < .03 + (100 - p.hea) / 1500) { p.sick = P(SICK); lg(`Diagnosztizáltak nálad: ${p.sick}. Menj orvoshoz!`, 'bad'); }
  // természetes változás
  p.hap = cl(p.hap - R(0, p.trait == 'calm' ? 1 : 3) + (partner() ? 1 : 0));
  if (a > 40) p.hea = cl(p.hea - R(0, 3)); if (a > 60) p.hea = cl(p.hea - R(0, 2));
  if (a > 35) p.loo = cl(p.loo - R(0, 2));
  if (a >= 6 && a <= 18) p.sma = cl(p.sma + R(1, 3) + (p.trait == 'int' ? 1 : 0));
  // tanulmányok
  if (a == 18) { p.edu = p.sma >= 25 ? 1 : 0; lg(p.edu ? 'Leérettségiztél.' : 'Nem sikerült az érettségi, így az általános iskolai végzettséged maradt.', p.edu ? 'good' : 'bad'); }
  if (a == 22 && p.uni) {
    p.uni = false;
    if (p.sma >= 45) { p.edu = 2; fxlog('Megszerezted a diplomádat!', { hap: 15 }); } else lg('Az egyetemet nem sikerült befejezned.', 'bad');
  }
  // munka
  if (p.job) {
    p.yrs++; const r = Math.random(), pr = p.trait == 'amb' ? .17 : .1;
    if (a >= 65) { p.pension = Math.round(p.pay * .5); lg(`Nyugdíjba mentél (${p.job}). Nyugdíj: ${fmt(p.pension)} / év.`, 'good'); p.job = null; p.pay = 0; }
    else if (r < pr) { fxlog('Előléptettek a munkahelyeden!', { raise: .15, hap: 8 }); }
    else if (r < pr + .03) { lg(`Kirúgtak (${p.job}).`, 'bad'); apply({ hap: -15 }); p.job = null; p.pay = 0; }
  } else if (a == 65 && !p.pension) p.pension = 1.5e6;
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
  // halál
  const risk = a < 45 ? .001 : ((a - 40) ** 2) * 4e-5 * (1 + (60 - p.hea) / 100);
  if (p.hea <= 0 || Math.random() < risk) {
    p.dead = true;
    lg(`Meghaltál ${a} évesen (${p.sick ? p.sick + ' miatt' : p.hea <= 0 ? 'betegség miatt' : a < 45 ? 'baleset következtében' : P(['szívmegállás', 'tüdőgyulladás', 'természetes okokból'])}).`, 'death');
    return render();
  }
  // események
  let ev = null;
  if (jail) { /* börtönben nincs esemény */ }
  else if (a == 18 && p.edu == 1) ev = UNI;
  else if (Math.random() < .3) { const l = CH.filter(e => a >= e.a[0] && a <= e.a[1] && (!e.u || e.u())); if (l.length) { ev = P(l); pend = ev.np ? mkNpc(ev.np) : ev.ex ? P(exl(ev.ex)) : null; } }
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
    if (Math.random() < .3 + p.loo / 200 + (p.trait == 'ext' ? .15 : 0)) { const g = P(['f', 'm']), q = person('Párod', Math.max(16, p.age + R(-4, 4)), 45, g); p.rel.push(q); fxlog(`Megismerkedtél valakivel: ${q.n}!`, { hap: 10 }); }
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
function doAct(id) {
  const x = ACT.find(q => q.id == id), c = p.age < 18 ? 0 : x.c;
  if (p.done[id] || p.dead || !can(c) || (x.k && p.prison > 0) || (x.u && !x.u())) return;
  p.done[id] = 1; p.money -= c; x.run(); render();
}

function crime(n, ok, loot, term) {
  if (Math.random() < ok) return fxlog(`${n}: nem kaptak el, ${fmt(loot)} a zsebedben.`, { money: loot, hap: 4 });
  p.crim++;
  if (term < 2 && Math.random() < .6) return fxlog(`${n}: elkaptak! Pénzbüntetést kaptál.`, { money: p.age < 18 ? 0 : -loot * 2, hap: -10 });
  p.prison = term; p.job = null; p.pay = 0;
  fxlog(`${n}: elkaptak, ${term} évre börtönbe kerültél!`, { hap: -20 });
}
function buy(i) { const x = ASSETS[i]; if (p.money < x.v || p.age < 18 || (x.t == 'car' && !p.lic)) return; p.money -= x.v; p.assets.push({ ...x }); fxlog(`Megvetted: ${x.n}.`, { hap: x.t == 'house' ? 12 : 8 }); render(); }
function sell(i) { const x = p.assets[i]; p.money += x.v; p.assets.splice(i, 1); lg(`Eladtad: ${x.n} (${fmt(x.v)}).`); render(); }

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
  const j = JOBS.find(q => q.n == n); if (j.c && p.crim) return; p.done.job = 1;
  if (Math.random() < Math.min(.95, Math.max(.15, .6 + (p.sma - j.s) / 100))) { p.job = j.n; p.pay = j.pay; p.yrs = 0; fxlog(`Felvettek: ${j.n}.`, { hap: 10 }); }
  else lg(`Elutasítottak (${j.n}).`, 'bad');
  render();
}
function quit() { if (confirm(T(['Biztosan felmondasz?', 'Really quit your job?']))) { lg(`Felmondtál (${p.job}).`); p.job = null; p.pay = 0; render(); } }

// ----- megjelenítés -----
const TT = { job: ['Munka és tanulás', 'Work & study'], assets: ['Vagyon', 'Assets'], rel: ['Emberek', 'People'], act: ['Teendők', 'Actions'] };
const logHtml = () => { const L = p.logs; let h = '', last = -1; for (let j = L.length - 1; j >= 0; j--) { const l = L[j]; if (l.a !== last) { h += `<h3>${l.a} éves</h3>`; last = l.a; } h += `<p class="lg ${l.c}${l.n > seen ? ' new' : ''}" style="animation-delay:${(L.length - 1 - j) * 70}ms">${l.t}</p>`; } return h; };
const row = (top, sub, btn) => `<div class="card"><div class="top"><b>${top}</b><small>${sub}</small></div>${btn}</div>`;

function panel(t) {
  const a = p.age;
  if (t == 'act') {
    const cost = x => a < 18 ? 0 : x.c;
    const card = x => { const c = cost(x), off = p.done[x.id] || p.dead || !can(c) || (x.k && p.prison > 0); return `<button class="act" ${off ? 'disabled' : ''} onclick="doAct('${x.id}')"><b>${x.i} ${x.n}</b><small>${p.done[x.id] ? 'ebben az évben már' : c ? fmt(c) + (can(c) ? '' : ' – nincs pénz') : 'ingyen'}</small></button>`; };
    const l = ACT.filter(x => a >= x.m && (!x.M || a <= x.M) && (!x.u || x.u())), ok = l.filter(x => !x.k), free = ok.filter(x => !cost(x)), paid = ok.filter(x => cost(x));
    const grid = (h, L) => L.length ? (h ? `<h3>${h}</h3>` : '') + '<div class="grid">' + L.map(card).join('') + '</div>' : '';
    return (p.sick ? `<p class="lg bad">🤒 Betegség: ${p.sick}. Menj orvoshoz!</p>` : '') + (p.prison > 0 ? `<p class="lg bad">⛓️ Még ${p.prison} év börtön van hátra.</p>` : '')
      + grid(paid.length ? 'Ingyenes' : '', free) + grid(paid.length ? 'Fizetős' : '', paid) + grid('Törvénytelen', l.filter(x => x.k));
  }
  if (t == 'assets') {
    const own = p.assets.map((x, i) => row(`${x.i} ${x.n}`, fmt(x.v), `<div class="btns"><button class="alt" onclick="sell(${i})">Eladás</button></div>`)).join('');
    return (own ? '<h3>Tulajdonod</h3>' + own : '') + '<h3>Vásárlás</h3>' + (a < 18 ? '<p class="empty">18 évesen vásárolhatsz.</p>'
      : ASSETS.map((x, i) => row(`${x.i} ${x.n}`, fmt(x.v), `${x.t == 'car' && !p.lic ? '<small>Jogosítvány kell hozzá</small>' : ''}<div class="btns"><button ${p.money < x.v || (x.t == 'car' && !p.lic) ? 'disabled' : ''} onclick="buy(${i})">Megveszem</button></div>`)).join(''));
  }
  if (t == 'rel') {
    if (relOpen != null && !(p.rel[relOpen] && p.rel[relOpen].alive)) relOpen = null;
    const head = (r, extra) => `<div class="rwrap"><div class="rav">${avSvg(lk(r), r.age)}</div><div class="rbody"><div class="top"><b>${dn(r.n)}</b><small>${rl(r.role)}, ${r.age}${T([' éves', ' y/o'])}</small></div><div class="tr"><i style="width:${r.bond}%"></i></div>${extra}</div></div>`;
    if (relOpen == null) return p.rel.map((r, i) => r.alive ? `<div class="card pc" onclick="openRel(${i})">${head(r, '')}<span class="chev">›</span></div>` : '').join('') || '<p class="empty">Nincs senki körülötted.</p>';
    const i = relOpen, r = p.rel[i], gc = a < 18 ? 0 : 1e5;
    const sub = (id, c) => p.done[id] ? 'ebben az évben már' : c ? fmt(c) + (can(c) ? '' : ' – nincs pénz') : 'ingyen';
    const B = (ic, n, id, c, fn, show = true) => show ? `<button class="act" ${p.done[id] || !can(c) ? 'disabled' : ''} onclick="${fn}"><b>${ic} ${n}</b><small>${sub(id, c)}</small></button>` : '';
    const b = B('💬', 'Beszélgetés', 't' + i, 0, `talk(${i})`)
      + B('🎁', 'Ajándék', 'g' + i, gc, `gift(${i})`, a >= 8 && r.age >= 3)
      + B('🙏', 'Pénzt kérek', 'm' + i, 0, `beg(${i})`, !!r.par && a >= 18)
      + B('💍', 'Házassági ajánlat', 'p' + i, 0, `propose(${i})`, r.role == 'Párod' && a >= 18)
      + B('👶', 'Gyerek vállalása', 'b' + i, 0, `baby(${i})`, r.role == 'Házastárs' && a <= 45)
      + RI.filter(x => a >= (x.m || 0) && (!x.M || a <= x.M) && (!x.roles || x.roles.includes(r.role)) && (!x.role || x.role == r.role) && (!x.u || x.u(r))).map(x => B(x.i, T(x.l), 'i' + x.k + i, a < 18 ? 0 : x.c || 0, `rint(${i},'${x.k}')`)).join('')
      + (LOVE.includes(r.role) ? B('💔', 'Szakítás', 'x' + i, 0, `split(${i})`) : '') + (DRIFT.includes(r.role) ? B('🚪', 'Kapcsolat megszakítása', 'x' + i, 0, `cut(${i})`) : '');
    return `<button class="ghost" onclick="openRel(null)">‹ Vissza</button><div class="card pd">${head(r, `<small class="dsc">Kapcsolat: ${Math.round(r.bond)}/100 · ${desc(lk(r))}</small>`)}</div><h3>Mit csinálsz vele?</h3><div class="grid">${b}</div>`;
  }
  let h = row('Végzettség', T(EDU[p.edu]) + (p.uni ? ' (egyetemista)' : ''), '') + (a >= 17 ? row('Jogosítvány', p.lic ? 'Van' : 'Nincs', '') : '') + (p.crim ? row('Büntetett előélet', p.crim + ' ügy', '') : '');
  if (p.prison > 0) return h + '<p class="empty">Börtönben nem dolgozhatsz.</p>';
  if (p.job) return h + row(p.job, p.yrs + '. éve', `<p>Fizetés: ${fmt(p.pay)} / év</p><div class="btns"><button class="alt" onclick="quit()">Felmondok</button></div>`);
  if (a >= 65) return h + `<p class="empty">Nyugdíjas vagy: ${fmt(p.pension)} / év.</p>`;
  if (a < 16 || p.uni) return h + `<p class="empty">${p.uni ? 'Az egyetem mellett most nem dolgozol.' : '16 éves kortól vállalhatsz állást.'}</p>`;
  return h + JOBS.map(j => {
    const ok = p.edu >= j.e && p.loo >= (j.l || 0) && !p.done.job && !(j.c && p.crim);
    return row(j.n, fmt(j.pay) + ' / év', `<small>${T(EDU[j.e])}${j.s ? `, okosság ${j.s}+` : ''}${j.l ? `, kinézet ${j.l}+` : ''}${j.c ? ', tiszta előélet' : ''}</small><div class="btns"><button ${ok ? '' : 'disabled'} onclick="applyJob('${j.n}')">Jelentkezés</button></div>`);
  }).join('');
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
  { k: 'duel', i: '⚔️', l: 'Szócsata', m: 8, role: 'Riválisod', w: .5, ok: [-3, 4, 'Megleckéztetted: '], no: [-6, -6, 'Alulmaradtál a vitában: '] }
];
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
  sb.classList.remove('fresh'); if (tab && tab != lastTab) { void sb.offsetWidth; sb.classList.add('fresh'); } lastTab = tab;
  $('#sheet').hidden = !tab; $('#stt').textContent = tab == 'rel' && relOpen != null && p.rel[relOpen] ? dn(p.rel[relOpen].n) : T(TT[tab]) || '';
  document.querySelectorAll('#dock [data-s]').forEach(b => b.classList.toggle('on', b.dataset.s == tab));
  $('#up').disabled = p.dead;
  if (p.dead) {
    const net = p.money + p.assets.reduce((s, x) => s + x.v, 0), k = p.rel.filter(r => r.role == 'Gyerek').length, rb = [];
    if (p.age >= 90) rb.push('🏅 Hosszú élet'); if (p.age < 30) rb.push('💔 Korai búcsú'); if (net >= 1e8) rb.push('💰 Százmilliomos');
    if (k >= 3) rb.push('👨‍👩‍👧‍👦 Nagycsalád'); if (p.crim >= 2) rb.push('🚨 Köztörvényes'); if (p.edu == 2) rb.push('🎓 Diplomás'); if (p.rel.some(r => r.role == 'Házastárs')) rb.push('💍 Házasság');
    $('#es').textContent = `${p.name} ${p.age} évet élt (${p.city[0]}).\nVégzettség: ${T(EDU[p.edu])}\nMunka: ${p.job || (p.pension ? 'nyugdíjas' : 'nincs')}\nNettó vagyon: ${fmt(net)}\nGyerekek: ${k}` + (rb.length ? '\n\n' + rb.join('\n') : '');
    if ($('#end').hidden && !endT) { flash('bad'); endT = setTimeout(() => { $('#end').hidden = false; endT = 0; }, 1100); }
  }
  prev = { money: p.money }; for (const k in ST) prev[k] = Math.round(p[k]);
  save();
}

// ----- képernyők: főoldal és karakterkészítő -----
const show = id => document.querySelectorAll('.scr').forEach(s => s.hidden = s.id != id);
const clean = s => s.replace(/[<>&"'`\\]/g, '').trim().slice(0, 16);
function showTitle() { $('#tcont').hidden = !(p && !p.dead); show('title'); }
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
  { k: 'gift', l: T(['Tehetség (+15)', 'Talent (+15)']), o: [['hap', '😊 ' + T(['Vidám', 'Cheerful'])], ['hea', '❤️ ' + T(['Egészséges', 'Healthy'])], ['sma', '🧠 ' + T(['Okos', 'Smart'])], ['loo', '✨ ' + T(['Szép', 'Attractive'])], ['r', '🎲']] },
  { k: 'trait', l: T(['Jellem', 'Trait']), o: Object.entries(TRAITS).map(([k, v]) => [k, T(v)]).concat([['r', '🎲']]) }
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
function openCreate() { ackDead = true; $('#app').classList.remove('dead'); cc = { g: 'r', skin: 'r', hs: 'r', hc: 'r', oc: 'r', bd: 'r', ot: 'r', ht: 'r', ea: 'r', gl: 'r', nc: 'r', xc: 'r', city: 'r', fam: 'r', gift: 'r', trait: 'r' }; $('#cfn').value = $('#cln').value = ''; drawC(); show('create'); }
function startLife(rand) {
  newLife(rand ? {} : { ...cc, fn: clean($('#cfn').value), ln: clean($('#cln').value) });
  seen = 0; prev = null; tab = null; relOpen = null; lastTab = null; clearTimeout(endT); endT = 0; ackDead = false;
  document.querySelectorAll('.scr').forEach(s => s.hidden = true); $('#end').hidden = true; $('#modal').hidden = true;
  render(); confetti(90);
}

// ----- indítás -----
const UI = {
  menu: ['Menü', 'Menu'], work: ['Munka', 'Work'], assets: ['Vagyon', 'Assets'], ppl: ['Emberek', 'People'], todo: ['Teendők', 'Actions'], yr: ['év', 'yr'],
  tag: ['Egy élet. Annyi döntés.', 'One life. So many choices.'], start: ['Élet kezdése', 'Start a life'], cont: ['Folytatás', 'Continue'], back: ['‹ Vissza', '‹ Back'],
  sur: ['Vezetéknév', 'Last name'], giv: ['Keresztnév', 'First name'], ra: ['🎲 Teljesen véletlen', '🎲 Fully random'], go: ['Megszületek', 'Be born'],
  endt: ['Vége az életednek', 'Your life is over'], again: ['Új élet kezdése', 'Start a new life'], lang: ['Nyelv', 'Language'], names: ['Nevek mutatása', 'Show names'],
  nomoney: [' (nincs pénz)', ' (not enough money)'], conf: ['A mostani élet elvész. Biztos vagy benne?', 'Your current life will be lost. Are you sure?'] };
const u = k => T(UI[k]);
function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i]').forEach(e => e.textContent = u(e.dataset.i));
  document.querySelectorAll('[data-ip]').forEach(e => e.placeholder = u(e.dataset.ip));
  document.querySelectorAll('[data-l]').forEach(b => b.classList.toggle('on', b.dataset.l == LANG));
}
let lbl = false; try { lbl = localStorage.getItem('relife_lbl') == '1'; } catch (e) {}
function buildBars() {
  $('#bars').innerHTML = Object.entries(ST).map(([k, [e, n]]) => `<div class="cell" id="c${k}"><div class="ic">${e}<em>${T(n)}</em></div><div class="tr"><i id="b${k}"></i></div><span class="vn" id="v${k}"></span></div>`).join('') + `<button id="lbl" aria-label="${u('names')}">▾</button>`;
  $('#bars').classList.toggle('names', lbl);
  $('#lbl').onclick = () => { lbl = !lbl; try { localStorage.setItem('relife_lbl', lbl ? '1' : '0'); } catch (e) {} $('#bars').classList.toggle('names', lbl); };
}
document.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { LANG = b.dataset.l; try { localStorage.setItem('relife_lang', LANG); } catch (e) {} applyLang(); buildBars(); if (!$('#create').hidden) drawC(); if (p) render(); });
buildBars(); applyLang();
$('#up').onclick = up;
$('#nw').onclick = showTitle;
$('#tnew').onclick = () => { if (p && !p.dead && !confirm(u('conf'))) return; openCreate(); };
$('#tcont').onclick = () => { document.querySelectorAll('.scr').forEach(s => s.hidden = true); render(); };
$('#cback').onclick = showTitle;
$('#again').onclick = () => { $('#end').hidden = true; openCreate(); };
$('#crand').onclick = () => startLife(true);
$('#cgo').onclick = () => startLife(false);
$('#dice').onclick = () => { const g = cc.g == 'r' ? P(['f', 'm']) : cc.g; $('#cln').value = P(SN); $('#cfn').value = P(g == 'f' ? NF : NM); };
$('#copts').addEventListener('toggle', e => { apOpen = e.target.open; }, true);
$('#copts').onclick = e => { const b = e.target.closest('.chip'); if (b) { cc[b.dataset.k] = b.dataset.v; drawC(); } };
$('#cls').onclick = () => { tab = null; relOpen = null; render(); };
$('#sheet').onclick = e => { if (e.target.id == 'sheet') { tab = null; relOpen = null; render(); } };
document.querySelectorAll('#dock [data-s]').forEach(b => b.onclick = () => { tab = tab == b.dataset.s ? null : b.dataset.s; relOpen = null; render(); });
load();
if (p && p.lic == null) p.lic = hasCar(); // régi mentés: aki már autót vett, annak van jogsija
if (p && !p.dead) { seen = p.ln || 0; render(); }
showTitle();
