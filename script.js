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
const exl = role => p.rel.filter(r => r.alive && r.role == role && r.age >= 18);
const mkNpc = o => { const g = P(['f', 'm']); return { n: `${P(SN)} ${P(g == 'f' ? NF : NM)}`, role: o.role, age: o.a ? R(o.a[0], o.a[1]) : Math.max(3, p.age + R(o.r[0], o.r[1])), bond: 40, alive: true }; };
const NF = ['Anna', 'Hanna', 'Lili', 'Zsófia', 'Emma', 'Nóra', 'Boglárka', 'Dóra', 'Réka', 'Vivien', 'Luca', 'Eszter', 'Panna', 'Kinga', 'Fanni', 'Bianka'];
const NM = ['Bence', 'Máté', 'Levente', 'Dániel', 'Marcell', 'Ádám', 'Zalán', 'Patrik', 'Balázs', 'Gergő', 'Olivér', 'Kristóf', 'Milán', 'Tamás', 'Noel', 'Barnabás'];
const SN = ['Kovács', 'Tóth', 'Szabó', 'Németh', 'Farkas', 'Horváth', 'Varga', 'Kiss', 'Molnár', 'Balogh', 'Papp', 'Takács', 'Juhász', 'Lakatos', 'Mészáros', 'Simon'];
const ST = { hap: ['😊', ['Boldog', 'Happy']], hea: ['❤️', ['Egészség', 'Health']], sma: ['🧠', ['Okos', 'Smart']], loo: ['✨', ['Kinézet', 'Looks']] };
const fmt = n => { const a = Math.abs(n), en = LANG == 'en'; return (n < 0 ? '−' : '') + (a >= 1e6 ? (a / 1e6).toFixed(1).replace('.', en ? '.' : ',') + ' M Ft' : Math.round(a / 1e3) + (en ? ' k Ft' : ' e Ft')); };
const EDU = [['Általános', 'Primary'], ['Érettségi', 'High school'], ['Diploma', 'Degree']];
let p, tab = null;

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
  { a: [16, 22], t: 'Jogosítvány', d: 'Letennéd a jogosítványt? A vizsga 150 e Ft.', o: [
    ['Igen', [[3, 'Elsőre átmentél!', { money: -15e4, hap: 10 }], [1, 'Elbuktál, újra kell próbálni.', { money: -15e4, hap: -8 }]], 15e4],
    ['Később', [[1, 'Még vársz vele.', { hap: -1 }]]]] },
  { a: [19, 35], t: 'Tetoválás', d: 'Egy tetováló stúdió előtt állsz. 50 e Ft.', o: [
    ['Csináltatok', [[1, 'Menő lett!', { money: -5e4, loo: 5, hap: 6 }]], 5e4],
    ['Inkább nem', [[1, 'A bőröd tiszta maradt.', { hap: 1 }]]]] },
  { a: [35, 60], t: 'Életközepi válság', d: 'Megtetszik egy sportautó. 10 M Ft.', o: [
    ['Megveszem', [[1, 'Szuper érzés! Jól áll neked.', { money: -1e7, hap: 15, loo: 4 }]], 1e7],
    ['Józan maradok', [[1, 'A válság elmúlt.', { hap: -2 }]]]] },
  { a: [18, 80], u: () => p.assets.some(x => x.t == 'car'), t: 'Gyorshajtás', d: 'Késésben vagy, az út üres.', o: [
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
  [20, 70, 'Elromlott az autód, sokba került a javítás.', { money: -4e5 }],
  [1, 12, 'Elestél biciklivel, lehorzsoltad a térded.', { hea: -4 }],
  [25, 70, 'Egy régi barátod váratlanul felhívott.', { hap: 8 }],
  [30, 100, 'Olvastál egy könyvet, ami elgondolkodtatott.', { sma: 4 }]
];

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
    edu: 0, uni: false, job: null, pay: 0, yrs: 0, pension: 0, fam: [1, 2, 3].includes(+o.fam) ? +o.fam : R(1, 3), dead: false, done: {}, logs: [], rel: [], assets: [], crim: 0, prison: 0, sick: null, city };
  p[gk] = cl(p[gk] + 15);
  p.look = { g, sk: skin, hs: pk(o.hs, () => P(g == 'f' ? [1, 2, 0, 4] : [0, 3, 4, 0])), hc: pk(o.hc, () => R(0, 4)), oc: pk(o.oc, () => R(0, 7)) };
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
  if (!ev && !jail && Math.random() < .5) { const l = RN.filter(e => a >= e[0] && a <= e[1]); if (l.length) { const e = P(l); fxlog(e[2], e[3]); } }
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
function doAct(id) {
  const x = ACT.find(q => q.id == id), c = p.age < 18 ? 0 : x.c;
  if (p.done[id] || p.dead || p.money < c || (x.k && p.prison > 0)) return;
  p.done[id] = 1; p.money -= c; x.run(); render();
}

function crime(n, ok, loot, term) {
  if (Math.random() < ok) return fxlog(`${n}: nem kaptak el, ${fmt(loot)} a zsebedben.`, { money: loot, hap: 4 });
  p.crim++;
  if (term < 2 && Math.random() < .6) return fxlog(`${n}: elkaptak! Pénzbüntetést kaptál.`, { money: p.age < 18 ? 0 : -loot * 2, hap: -10 });
  p.prison = term; p.job = null; p.pay = 0;
  fxlog(`${n}: elkaptak, ${term} évre börtönbe kerültél!`, { hap: -20 });
}
function buy(i) { const x = ASSETS[i]; if (p.money < x.v || p.age < 18) return; p.money -= x.v; p.assets.push({ ...x }); fxlog(`Megvetted: ${x.n}.`, { hap: x.t == 'house' ? 12 : 8 }); render(); }
function sell(i) { const x = p.assets[i]; p.money += x.v; p.assets.splice(i, 1); lg(`Eladtad: ${x.n} (${fmt(x.v)}).`); render(); }

// ----- emberek -----
function talk(i) { const r = p.rel[i]; if (p.done['t' + i]) return; p.done['t' + i] = 1; r.bond = cl(r.bond + R(5, 12)); fxlog(`Beszélgettél vele: ${r.n}.`, { hap: 3 }); render(); }
function gift(i) { const r = p.rel[i], c = p.age < 18 ? 0 : 1e5; if (p.done['g' + i] || p.money < c) return; p.done['g' + i] = 1; p.money -= c; r.bond = cl(r.bond + R(8, 15)); lg(`Megajándékoztad: ${r.n}.`, 'good'); render(); }
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
function quit() { if (confirm('Biztosan felmondasz?')) { lg(`Felmondtál (${p.job}).`); p.job = null; p.pay = 0; render(); } }

// ----- megjelenítés -----
const TT = { job: ['Munka és tanulás', 'Work & study'], assets: ['Vagyon', 'Assets'], rel: ['Emberek', 'People'], act: ['Teendők', 'Actions'] };
const logHtml = () => { const L = p.logs; let h = '', last = -1; for (let j = L.length - 1; j >= 0; j--) { const l = L[j]; if (l.a !== last) { h += `<h3>${l.a} éves</h3>`; last = l.a; } h += `<p class="lg ${l.c}${l.n > seen ? ' new' : ''}" style="animation-delay:${(L.length - 1 - j) * 70}ms">${l.t}</p>`; } return h; };
const row = (top, sub, btn) => `<div class="card"><div class="top"><b>${top}</b><small>${sub}</small></div>${btn}</div>`;

function panel(t) {
  const a = p.age;
  if (t == 'act') {
    const card = x => { const c = a < 18 ? 0 : x.c, off = p.done[x.id] || p.dead || p.money < c || (x.k && p.prison > 0); return `<button class="act" ${off ? 'disabled' : ''} onclick="doAct('${x.id}')"><b>${x.i} ${x.n}</b><small>${c ? fmt(c) : 'ingyen'}</small></button>`; };
    const l = ACT.filter(x => a >= x.m), k = l.filter(x => x.k);
    return (p.sick ? `<p class="lg bad">🤒 Betegség: ${p.sick}. Menj orvoshoz!</p>` : '') + (p.prison > 0 ? `<p class="lg bad">⛓️ Még ${p.prison} év börtön van hátra.</p>` : '')
      + '<div class="grid">' + l.filter(x => !x.k).map(card).join('') + '</div>' + (k.length ? '<h3>Törvénytelen</h3><div class="grid">' + k.map(card).join('') + '</div>' : '');
  }
  if (t == 'assets') {
    const own = p.assets.map((x, i) => row(`${x.i} ${x.n}`, fmt(x.v), `<div class="btns"><button class="alt" onclick="sell(${i})">Eladás</button></div>`)).join('');
    return (own ? '<h3>Tulajdonod</h3>' + own : '') + '<h3>Vásárlás</h3>' + (a < 18 ? '<p class="empty">18 évesen vásárolhatsz.</p>'
      : ASSETS.map((x, i) => row(`${x.i} ${x.n}`, fmt(x.v), `<div class="btns"><button ${p.money < x.v ? 'disabled' : ''} onclick="buy(${i})">Megveszem</button></div>`)).join(''));
  }
  if (t == 'rel') {
    return p.rel.map((r, i) => {
      if (!r.alive) return '';
      const gc = a < 18 ? 0 : 1e5, pr = r.role == 'Párod' || r.role == 'Házastárs';
      let b = `<button ${p.done['t' + i] ? 'disabled' : ''} onclick="talk(${i})">Beszélgetés</button>`;
      if (a >= 8 && r.age >= 3) b += `<button ${p.done['g' + i] || p.money < gc ? 'disabled' : ''} onclick="gift(${i})">Ajándék${gc ? ' (100 e)' : ''}</button>`;
      if (r.par && a >= 18) b += `<button ${p.done['m' + i] ? 'disabled' : ''} onclick="beg(${i})">Pénzt kérek</button>`;
      if (r.role == 'Párod' && a >= 18) b += `<button class="alt" ${p.done['p' + i] ? 'disabled' : ''} onclick="propose(${i})">Házassági ajánlat</button>`;
      if (r.role == 'Házastárs' && a <= 45) b += `<button class="alt" ${p.done['b' + i] ? 'disabled' : ''} onclick="baby(${i})">Gyerek vállalása</button>`;
      if (pr) b += `<button class="alt" onclick="split(${i})">Szakítás</button>`;
      const ib = RI.filter(x => a >= (x.m || 0) && (!x.role || x.role == r.role)).map(x => `<button class="alt" ${p.done['i' + x.k + i] ? 'disabled' : ''} onclick="rint(${i},'${x.k}')">${T(x.l)}</button>`).join('');
      return `<div class="card"><div class="rwrap"><div class="rav">${avSvg(lk(r), r.age)}</div><div class="rbody"><div class="top"><b>${dn(r.n)}</b><small>${rl(r.role)}, ${r.age}${T([' éves', ' y/o'])}</small></div><div class="tr"><i style="width:${r.bond}%"></i></div><small class="dsc">${desc(lk(r))}</small><div class="btns">${b}${ib}</div></div></div></div>`;
    }).join('') || '<p class="empty">Nincs senki körülötted.</p>';
  }
  let h = row('Végzettség', T(EDU[p.edu]) + (p.uni ? ' (egyetemista)' : ''), '') + (p.crim ? row('Büntetett előélet', p.crim + ' ügy', '') : '');
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
function beg(i) { const r = p.rel[i]; p.done['m' + i] = 1; if (r.bond >= 55 && Math.random() < .7) fxlog(`${r.n} adott neked pénzt.`, { money: R(1, 4) * 1e5 * p.fam }); else fxlog(`${r.n} nemet mondott.`, { hap: -4 }); render(); }
function split(i) { const r = p.rel[i]; if (!confirm(`Biztosan szakítasz vele: ${r.n}?`)) return; if (r.role == 'Házastárs') p.money = Math.round(p.money * .7); r.alive = false; fxlog(`Szakítottál vele: ${r.n}.`, { hap: -8 }); render(); }

// ----- effektek -----
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
let seen = 0, prev = null, lastTab = null, endT = 0;
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

const HC = ['#24180f', '#6b4226', '#e0b24a', '#b5381f', '#8a8f9a', '#d96a9f'], OC = ['#e4572e', '#1f8a83', '#3a6fd8', '#f0b429', '#7a5cc7', '#3b3b46', '#e86a9a', '#4a9d4a'], SW = { skin: SKINC, hc: HC, oc: OC };
const HSN = [['rövid', 'short'], ['hosszú', 'long'], ['feltűzött', 'tied-up'], ['nagyon rövid', 'buzzed'], ['göndör', 'curly']];
const HCN = [['fekete', 'black'], ['barna', 'brown'], ['szőke', 'blond'], ['vörös', 'red'], ['ősz', 'gray'], ['rózsaszín', 'pink']];
const OCN = [['piros', 'red'], ['kékeszöld', 'teal'], ['kék', 'blue'], ['sárga', 'yellow'], ['lila', 'purple'], ['sötét', 'dark'], ['rózsaszín', 'pink'], ['zöld', 'green']];
const pk = (v, f) => v != null && v !== 'r' ? +v : f();
const mkLook = (g, sk) => ({ g, sk: sk || R(1, 5), hs: P(g == 'f' ? [1, 2, 0, 4] : [0, 3, 4, 0]), hc: R(0, 4), oc: R(0, 7) });
const lk = r => r.look || (r.look = mkLook(NF.includes(r.n.split(' ')[1]) || r.role == 'Anya' ? 'f' : 'm'));
const desc = l => T([`${T(HCN[l.hc])} ${T(HSN[l.hs])} haj, ${T(OCN[l.oc])} felső`, `${T(HCN[l.hc])} ${T(HSN[l.hs])} hair, ${T(OCN[l.oc])} top`]);
function avSvg(l, a, dead) {
  if (dead) return '🪦';
  const sk = SKINC[l.sk] || SKINC[3], hc = a >= 65 ? '#cfd3da' : HC[l.hc], oc = OC[l.oc], f = l.g == 'f', k = 'stroke="#24180f" stroke-width="2.4" stroke-linejoin="round"', sc = a >= 18 ? 1 : .55 + .45 * a / 18, hs = l.hs;
  const front = `<path d="M18 30Q16 13 32 13Q48 13 46 30Q40 21 32 21Q24 21 18 30Z" fill="${hc}" ${k}/>`;
  const back = hs == 1 ? `<path d="M17 30Q13 11 32 11Q51 11 47 30L50 54H14Z" fill="${hc}" ${k}/>` : hs == 2 ? `<circle cx="32" cy="9" r="6.5" fill="${hc}" ${k}/>` : hs == 4 ? `<ellipse cx="32" cy="24" rx="19" ry="16" fill="${hc}" ${k}/>` : '';
  const fr = hs == 3 ? `<path d="M19 27Q20 16 32 16Q44 16 45 27Q38 20 32 20Q26 20 19 27Z" fill="${hc}" opacity=".55"/>` : front;
  const lower = f ? `<path d="M20 44H44L49 73H15Z" fill="${oc}" ${k}/><rect x="23" y="72" width="6" height="6" rx="2" fill="${sk}" ${k}/><rect x="35" y="72" width="6" height="6" rx="2" fill="${sk}" ${k}/>`
    : `<rect x="20" y="55" width="10" height="22" rx="3" fill="#3b4a63" ${k}/><rect x="34" y="55" width="10" height="22" rx="3" fill="#3b4a63" ${k}/><path d="M18 58V50Q18 44 25 44H39Q46 44 46 50V58Z" fill="${oc}" ${k}/>`;
  return `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg"><g transform="translate(32 79) scale(${sc}) translate(-32 -79)">${back}<rect x="11" y="45" width="8" height="17" rx="4" fill="${oc}" ${k}/><rect x="45" y="45" width="8" height="17" rx="4" fill="${oc}" ${k}/>${lower}<path d="M18 44H46" stroke="#000" opacity=".12"/><rect x="28" y="40" width="8" height="7" fill="${sk}" ${k}/><circle cx="19" cy="32" r="3" fill="${sk}" ${k}/><circle cx="45" cy="32" r="3" fill="${sk}" ${k}/><ellipse cx="32" cy="30" rx="13" ry="14" fill="${sk}" ${k}/><path d="M32 16A13 14 0 0 1 32 44Z" fill="#000" opacity=".1"/>${fr}<ellipse cx="26" cy="32" rx="2.3" ry="3.1" fill="#24180f"/><ellipse cx="38" cy="32" rx="2.3" ry="3.1" fill="#24180f"/><circle cx="26.8" cy="30.8" r=".9" fill="#fff"/><circle cx="38.8" cy="30.8" r=".9" fill="#fff"/><ellipse cx="22.5" cy="37" rx="2.6" ry="1.6" fill="#ff6b81" opacity=".35"/><ellipse cx="41.5" cy="37" rx="2.6" ry="1.6" fill="#ff6b81" opacity=".35"/><path d="M29 39Q32 42 35 39" fill="none" stroke="#24180f" stroke-width="1.8" stroke-linecap="round"/></g></svg>`;
}
const RI = [
  { k: 'hang', l: ['Közös program', 'Hang out'], ok: [9, 4, 'Együtt töltöttetek egy délutánt: ', 'You spent an afternoon with: '] },
  { k: 'joke', l: ['Vicc', 'Joke'], w: .7, ok: [5, 4, 'Jót nevettetek együtt: ', 'You shared a good laugh with: '], no: [-2, -1, 'Rosszul sült el a poénod: ', 'Your joke fell flat with: '] },
  { k: 'compl', l: ['Bók', 'Compliment'], w: .75, ok: [5, 3, 'Megdicsérted: ', 'You complimented: '], no: [-3, -2, 'Kínosra sikerült a bók: ', 'Your compliment got awkward with: '] },
  { k: 'adv', l: ['Tanácsot kérek', 'Ask advice'], m: 8, ok: [4, 2, 'Jó tanácsot kaptál tőle: ', 'You got good advice from: '] },
  { k: 'cook', l: ['Közös főzés', 'Cook together'], m: 10, ok: [8, 5, 'Együtt főztetek: ', 'You cooked together with: '] },
  { k: 'prank', l: ['Csíny', 'Prank'], m: 8, w: .5, ok: [8, 5, 'A csínytevésed sikerült, jót nevettetek: ', 'Your prank worked, you laughed with: '], no: [-10, -3, 'A csínytevésed rosszul sült el: ', 'Your prank backfired on: '] },
  { k: 'arg', l: ['Veszekedés', 'Argue'], m: 6, ok: [-12, -4, 'Összevesztetek: ', 'You had a fight with: '] },
  { k: 'peace', l: ['Kibékülés', 'Make peace'], role: 'Riválisod', w: .6, ok: [30, 6, 'Kibékültetek: ', 'You made peace with: '], no: [-5, -3, 'Nem sikerült kibékülni: ', 'Making peace failed with: '] }
];
function rint(i, k) {
  const r = p.rel[i], x = RI.find(q => q.k == k), id = 'i' + k + i; if (p.done[id]) return; p.done[id] = 1;
  const b = Math.random() < (x.w || 1) ? x.ok : x.no; r.bond = cl(r.bond + b[0]);
  if (k == 'peace' && b == x.ok) r.role = 'Barát';
  fxlog(T([b[2], b[3]]) + dn(r.n) + '.', { hap: b[1] }); render();
}
const avatar = (g, a, skin, dead) => dead ? '🪦' : (a < 2 ? '👶' : a < 20 ? (g == 'f' ? '👧' : '👦') : a < 65 ? (g == 'f' ? '👩' : '👨') : (g == 'f' ? '👵' : '👴')) + (SKIN[skin] || '');

function render() {
  const A = $('#app'), a = p.age;
  A.dataset.st = a < 13 ? 'kid' : a < 20 ? 'teen' : a < 65 ? 'adult' : 'old'; A.classList.toggle('dead', p.dead);
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
  $('#sheet').hidden = !tab; $('#stt').textContent = T(TT[tab]) || '';
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
  { k: 'skin', l: T(['Bőrszín', 'Skin tone']), o: [[1, ''], [2, ''], [3, ''], [4, ''], [5, ''], ['r', '🎲']] },
  { k: 'hs', l: T(['Haj', 'Hair']), o: [[0, T(['Rövid', 'Short'])], [1, T(['Hosszú', 'Long'])], [2, T(['Feltűzött', 'Tied-up'])], [3, T(['Kopasz', 'Buzzed'])], [4, T(['Göndör', 'Curly'])], ['r', '🎲']] },
  { k: 'hc', l: T(['Hajszín', 'Hair color']), o: [[0, ''], [1, ''], [2, ''], [3, ''], [4, ''], [5, ''], ['r', '🎲']] },
  { k: 'oc', l: T(['Ruha', 'Outfit']), o: [[0, ''], [1, ''], [2, ''], [3, ''], [4, ''], [5, ''], [6, ''], [7, ''], ['r', '🎲']] },
  { k: 'city', l: T(['Szülőváros', 'Hometown']), o: CITY.map(c => [c[0], c[0]]).concat([['r', '🎲']]) },
  { k: 'fam', l: T(['Család', 'Family']), o: [[1, T(['Szerény', 'Modest'])], [2, T(['Átlagos', 'Average'])], [3, T(['Tehetős', 'Wealthy'])], ['r', '🎲']] },
  { k: 'gift', l: T(['Tehetség (+15)', 'Talent (+15)']), o: [['hap', '😊 ' + T(['Vidám', 'Cheerful'])], ['hea', '❤️ ' + T(['Egészséges', 'Healthy'])], ['sma', '🧠 ' + T(['Okos', 'Smart'])], ['loo', '✨ ' + T(['Szép', 'Attractive'])], ['r', '🎲']] },
  { k: 'trait', l: T(['Jellem', 'Trait']), o: Object.entries(TRAITS).map(([k, v]) => [k, T(v)]).concat([['r', '🎲']]) }
];
let cc = {};
function drawC() {
  $('#copts').innerHTML = cfg().map(c => `<div class="cg"><small>${c.l}</small><div class="chips">${c.o.map(([v, t]) =>
    `<button class="chip${cc[c.k] == v ? ' on' : ''}" data-k="${c.k}" data-v="${v}">${SW[c.k] && v != 'r' ? `<i class="sw" style="background:${SW[c.k][v]}"></i>` : t}</button>`).join('')}</div></div>`).join('');
  $('#cav').innerHTML = avSvg({ g: cc.g == 'f' ? 'f' : 'm', sk: cc.skin == 'r' ? 3 : +cc.skin, hs: cc.hs == 'r' ? (cc.g == 'f' ? 1 : 0) : +cc.hs, hc: cc.hc == 'r' ? 1 : +cc.hc, oc: cc.oc == 'r' ? 0 : +cc.oc }, 20);
}
function openCreate() { cc = { g: 'r', skin: 'r', hs: 'r', hc: 'r', oc: 'r', city: 'r', fam: 'r', gift: 'r', trait: 'r' }; $('#cfn').value = $('#cln').value = ''; drawC(); show('create'); }
function startLife(rand) {
  newLife(rand ? {} : { ...cc, fn: clean($('#cfn').value), ln: clean($('#cln').value) });
  seen = 0; prev = null; tab = null; lastTab = null; clearTimeout(endT); endT = 0;
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
$('#copts').onclick = e => { const b = e.target.closest('.chip'); if (b) { cc[b.dataset.k] = b.dataset.v; drawC(); } };
$('#cls').onclick = () => { tab = null; render(); };
$('#sheet').onclick = e => { if (e.target.id == 'sheet') { tab = null; render(); } };
document.querySelectorAll('#dock [data-s]').forEach(b => b.onclick = () => { tab = tab == b.dataset.s ? null : b.dataset.s; render(); });
load();
if (p && !p.dead) { seen = p.ln || 0; render(); }
showTitle();
