export type LandingCopy = {
  kicker: string;
  hero: string;
  lead: string;
  primary: string;
  secondary: string;
  members: string;
  license: string;
  levels: string;
  risk: string;
  earnTitle: string;
  earnLead: string;
  botTitle: string;
  botBody: string;
  botPoints: string[];
  affTitle: string;
  affBody: string;
  affRows: [string, string][];
  simonsTitle: string;
  simonsLead: string;
  simonsBody: string[];
  rulesTitle: string;
  rules: [string, string][];
  proofTitle: string;
  proofLead: string;
  proofs: [string, string][];
  stayTitle: string;
  stayBody: string;
  disclaimer: string;
};

const en: LandingCopy = {
  kicker: "International Business Multiplier",
  hero: "A rules desk for MetaTrader 5. A network paid on verified sales.",
  lead: "IBM runs a fixed momentum model and a three-level affiliate program. The bot does not guess. Affiliate USDT is sent only after a license payment is confirmed on the blockchain.",
  primary: "Create account",
  secondary: "I already have an account",
  members: "People in the network",
  license: "License",
  levels: "Affiliate levels",
  risk: "Default risk / trade",
  earnTitle: "Two ways the desk pays attention to money",
  earnLead: "Trading results are never guaranteed. Affiliate figures below are commissions on the license, not trading profits.",
  botTitle: "The bot",
  botBody:
    "IBM Momentum reads trend, pullback, and momentum. It sizes from a risk percent, places a stop from ATR, and aims for a defined reward. You choose DEMO or REAL. REAL asks for an explicit confirmation.",
  botPoints: [
    "EMA 20 / 50 / 200, ATR 14",
    "Stop 1.2 ATR, target 1.5R on the standard preset",
    "Default risk 0.5% and one open position",
    "Spread filter on. No silent change of your risk",
  ],
  affTitle: "The affiliate share",
  affBody:
    "A verified 150 USDT license is split only when the buyer came through the network. Missing levels stay with the company. Payouts go to the USDT TRC20 wallet the affiliate saved.",
  affRows: [
    ["Level 1 — direct sponsor", "30 USDT"],
    ["Level 2", "15 USDT"],
    ["Level 3", "5 USDT"],
    ["Company, full tree", "100 USDT"],
    ["No sponsor", "150 USDT stays with the company"],
  ],
  simonsTitle: "Built in the spirit of Jim Simons",
  simonsLead: "A mathematician who treated markets as a research problem, not a story.",
  simonsBody: [
    "James Harris Simons (1938–2024) was a mathematician, known for Chern–Simons theory, before he founded Renaissance Technologies in 1982. The firm’s Medallion Fund became famous for exceptional results. It was closed to outside investors. The models were never published.",
    "What he put in public was the method: hire people who can test ideas, throw away what the data rejects, and take the human story out of the order. Discretion was the enemy. Measurement was the job.",
    "IBM is not Medallion, and it does not use Renaissance’s models. Nobody outside that firm does. IBM is our own momentum system: written rules, a stop, a target, and a risk limit you can read. The debt to Simons is the discipline, not a borrowed secret and not a promised return.",
  ],
  rulesTitle: "What the model actually checks",
  rules: [
    ["Trend", "Structure of the higher timeframe before a trade is allowed."],
    ["Pullback", "Price returns toward the average instead of chasing the extreme."],
    ["Momentum", "The move has to resume. A setup without momentum is a pass."],
    ["Risk", "Size comes from the percent you set. The stop is placed before entry."],
  ],
  proofTitle: "What you can verify yourself",
  proofLead: "We do not publish invented customer quotes. These are the checks the product already runs.",
  proofs: [
    ["Payment", "150 USDT TRC20 is matched to a transaction hash before a license is issued."],
    ["License", "The key stays in your account. It is not only on one computer."],
    ["Affiliate", "Each share is a row you can see, with status paid, pending, or failed."],
  ],
  stayTitle: "Stay connected",
  stayBody:
    "The account, the license, and the referral link stay on this site. Open them from a Windows PC, a Mac, or a phone. The bot itself runs on Windows with MetaTrader 5. If you do not have that computer, leave it on a Windows server and keep watching the desk from here.",
  disclaimer:
    "Trading foreign exchange can lose money. Past results of any fund, including Medallion, are not a forecast for IBM. Affiliate amounts are commissions on a license sale.",
};

const ro: LandingCopy = {
  kicker: "International Business Multiplier",
  hero: "Un birou cu reguli pentru MetaTrader 5. O rețea plătită pe vânzări verificate.",
  lead: "IBM rulează un model de momentum cu reguli fixe și un program de afiliere pe trei niveluri. Botul nu ghicește. USDT-ul de afiliat pleacă doar după ce plata licenței este confirmată pe blockchain.",
  primary: "Creează cont",
  secondary: "Am deja un cont",
  members: "Oameni în rețea",
  license: "Licență",
  levels: "Niveluri de afiliere",
  risk: "Risc implicit / tranzacție",
  earnTitle: "Două locuri în care se uită banii",
  earnLead:
    "Rezultatul la tranzacționare nu este garantat. Cifrele de afiliere de mai jos sunt comision pe licență, nu profit din tranzacții.",
  botTitle: "Botul",
  botBody:
    "IBM Momentum citește trendul, retragerea și momentum-ul. Calculează volumul dintr-un procent de risc, pune stop din ATR și țintește un câștig definit. Alegi DEMO sau REAL. Pe REAL ți se cere o confirmare explicită.",
  botPoints: [
    "EMA 20 / 50 / 200, ATR 14",
    "Stop 1,2 ATR, țintă 1,5R pe presetul standard",
    "Risc implicit 0,5% și o singură poziție deschisă",
    "Filtru de spread pornit. Riscul tău nu este schimbat pe tăcute",
  ],
  affTitle: "Cota de afiliat",
  affBody:
    "O licență de 150 USDT verificată se împarte doar dacă cumpărătorul a venit prin rețea. Nivelurile lipsă rămân la firmă. Plata pleacă către wallet-ul USDT TRC20 salvat de afiliat.",
  affRows: [
    ["Nivelul 1 — sponsorul direct", "30 USDT"],
    ["Nivelul 2", "15 USDT"],
    ["Nivelul 3", "5 USDT"],
    ["Firma, arbore complet", "100 USDT"],
    ["Fără sponsor", "150 USDT rămân la firmă"],
  ],
  simonsTitle: "Construit în spiritul lui Jim Simons",
  simonsLead: "Un matematician care a tratat piața ca pe o problemă de cercetare, nu ca pe o poveste.",
  simonsBody: [
    "James Harris Simons (1938–2024) a fost matematician, cunoscut pentru teoria Chern–Simons, înainte să înființeze Renaissance Technologies în 1982. Fondul Medallion a devenit celebru pentru rezultate excepționale. A fost închis investitorilor din afară. Modelele nu au fost publicate.",
    "Ce a spus public a fost metoda: angajezi oameni care pot testa idei, arunci ce resping datele și scoți povestea omului din ordin. Discreția era dușmanul. Măsurarea era meseria.",
    "IBM nu este Medallion și nu folosește modelele Renaissance. Nimeni din afara firmei nu le folosește. IBM este sistemul nostru de momentum: reguli scrise, un stop, o țintă și o limită de risc pe care o poți citi. Datoria față de Simons este disciplina, nu un secret împrumutat și nu un câștig promis.",
  ],
  rulesTitle: "Ce verifică modelul",
  rules: [
    ["Trend", "Structura timeframe-ului mai mare, înainte să fie permis un trade."],
    ["Retragere", "Prețul se întoarce spre medie, în loc să alerge după extrem."],
    ["Momentum", "Mișcarea trebuie să reia. Un setup fără momentum este un pas."],
    ["Risc", "Volumul iese din procentul pe care îl setezi. Stopul este pus înainte de intrare."],
  ],
  proofTitle: "Ce poți verifica singur",
  proofLead: "Nu publicăm citate de clienți inventate. Astea sunt verificările pe care produsul le face deja.",
  proofs: [
    ["Plata", "150 USDT TRC20 sunt puși lângă hash-ul tranzacției înainte să se emită licența."],
    ["Licența", "Cheia rămâne în cont. Nu stă doar pe un calculator."],
    ["Afiliatul", "Fiecare cotă este un rând pe care îl vezi: plătit, în așteptare sau eșuat."],
  ],
  stayTitle: "Rămâi conectat",
  stayBody:
    "Contul, licența și linkul de recomandare rămân pe site. Le deschizi de pe Windows, Mac sau telefon. Botul rulează pe Windows, cu MetaTrader 5. Dacă nu ai calculatorul ăsta, îl lași pe un server Windows și urmărești biroul de aici.",
  disclaimer:
    "Tranzacționarea pe valută poate pierde bani. Rezultatele oricărui fond, inclusiv Medallion, nu sunt o prognoză pentru IBM. Sumele de afiliere sunt comision pe vânzarea unei licențe.",
};

export function landingCopy(lang: string): LandingCopy {
  return lang === "ro" ? ro : en;
}
