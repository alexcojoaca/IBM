export type LandingCopy = {
  kicker: string;
  hero: string;
  lead: string;
  primary: string;
  secondary: string;
  advantages: [string, string][];
  deskTitle: string;
  deskLead: string;
  deskBody: string;
  netTitle: string;
  netLead: string;
  netPoints: string[];
  whyTitle: string;
  why: [string, string][];
  stayTitle: string;
  stayBody: string;
};

const en: LandingCopy = {
  kicker: "International Business Multiplier",
  hero: "Let the market work while your day stays yours.",
  lead: "IBM is an automated bot for MetaTrader 5. It uses advanced, Wall Street-style strategies: a system that decides, executes, and stays cold when the chart gets loud.",
  primary: "Create account",
  secondary: "I already have an account",
  advantages: [
    ["Your time back", "You stop living inside the candle. The desk follows the plan without asking how you feel."],
    ["A colder hand", "No chase. No second-guessing. The order comes from rules, the way serious desks are built."],
    ["A network behind you", "Bring people in. When they take a license, your place in the line is already there."],
  ],
  deskTitle: "Built like a Wall Street desk",
  deskLead: "The same idea the big floors use: take the person out of the click.",
  deskBody:
    "Institutional trading is not a feeling and not a tip. It is a model that watches, filters, and acts the same way every time. IBM brings that posture to MetaTrader 5. You do not need the formula. You need the bot switched on, and a screen that still belongs to your life.",
  netTitle: "The network pays the people who open the door",
  netLead: "A license sold through you does not stop at you.",
  netPoints: [
    "Three levels. The person you bring, and the people they bring.",
    "Your share is tied to a verified sale, then sent to the wallet you saved.",
    "The link stays in your account. You open it from a computer or a phone.",
  ],
  whyTitle: "Why people lean in",
  why: [
    ["They want out of the chart", "The day is full. The market is not going to wait for a free hour."],
    ["They want a standard", "A system with a posture, not a group chat full of opinions."],
    ["They want a second door", "Trade the desk, or grow the network. Some people do both."],
  ],
  stayTitle: "Stay with it",
  stayBody:
    "Your account, your license, and your link live here. Open them from Windows, Mac, or a phone. The bot runs on Windows with MetaTrader 5 — on your computer, or on a server that stays awake while you do not.",
};

const ro: LandingCopy = {
  kicker: "International Business Multiplier",
  hero: "Lasă piața să lucreze, iar ziua să rămână a ta.",
  lead: "IBM este un bot automat pentru MetaTrader 5. Folosește strategii avansate, de tip Wall Street: un sistem care decide, execută și rămâne rece când graficul se agită.",
  primary: "Creează cont",
  secondary: "Am deja un cont",
  advantages: [
    ["Timpul tău înapoi", "Nu mai trăiești în lumânare. Biroul ține planul, fără să te întrebe cum te simți."],
    ["O mână mai rece", "Fără alergat după preț. Fără răzgândire. Ordinul vine din reguli, cum se construiesc birourile serioase."],
    ["O rețea în spate", "Aduci oameni. Când își iau licența, locul tău în linie este deja acolo."],
  ],
  deskTitle: "Construit ca un birou de pe Wall Street",
  deskLead: "Aceeași idee pe care o folosesc sălile mari: omul iese din click.",
  deskBody:
    "Tranzacționarea instituțională nu este o stare și nu este un pont. Este un model care privește, filtrează și acționează la fel de fiecare dată. IBM aduce postura asta pe MetaTrader 5. Nu ai nevoie de formulă. Ai nevoie de botul pornit și de un ecran care rămâne al vieții tale.",
  netTitle: "Rețeaua îi plătește pe cei care deschid ușa",
  netLead: "O licență vândută prin tine nu se oprește la tine.",
  netPoints: [
    "Trei niveluri. Omul pe care îl aduci, și oamenii pe care îi aduce el.",
    "Cota ta se leagă de o vânzare verificată, apoi pleacă spre wallet-ul pe care l-ai salvat.",
    "Linkul rămâne în cont. Îl deschizi de pe calculator sau de pe telefon.",
  ],
  whyTitle: "De ce se apropie oamenii",
  why: [
    ["Vor să iasă din grafic", "Ziua este plină. Piața nu așteaptă o oră liberă."],
    ["Vor un standard", "Un sistem cu postură, nu un grup plin de păreri."],
    ["Vor o a doua ușă", "Tranzacționezi biroul, sau crești rețeaua. Unii le fac pe amândouă."],
  ],
  stayTitle: "Rămâi aproape",
  stayBody:
    "Contul, licența și linkul trăiesc aici. Le deschizi de pe Windows, Mac sau telefon. Botul rulează pe Windows cu MetaTrader 5 — pe calculatorul tău, sau pe un server care stă treaz când tu nu stai.",
};

export function landingCopy(lang: string): LandingCopy {
  return lang === "ro" ? ro : en;
}
