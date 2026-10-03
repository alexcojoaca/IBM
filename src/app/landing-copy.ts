export type LandingCopy = {
  kicker: string;
  hero: string;
  lead: string;
  primary: string;
  secondary: string;
  eyes: string;
  botTitle: string;
  botLead: string;
  botBody: string;
  botPoints: [string, string][];
  simonsKicker: string;
  simonsTitle: string;
  simons: string[];
  whyTitle: string;
  whyLead: string;
  why: [string, string][];
  closeTitle: string;
  closeBody: string;
};

const en: LandingCopy = {
  kicker: "International Business Multiplier",
  hero: "Stop watching the chart. Let a system take the shift.",
  lead: "IBM is an automated bot for MetaTrader 5. Its strategy follows the systematic method Jim Simons made famous: fixed rules, no emotion in the order, the same plan every time.",
  primary: "Start now",
  secondary: "I already have an account",
  eyes: "We do not guarantee income. We let you see it with your own eyes.",
  botTitle: "What the bot actually is",
  botLead: "A desk that does not get tired and does not change its mind at the worst moment.",
  botBody:
    "You connect it to MetaTrader 5. From there it watches the market, waits for its setup, and places the trade by itself. You are not clicking. You are not refreshing. You open the screen when you want to see what it did.",
  botPoints: [
    ["It decides", "The entry is a rule, not a feeling you had at 11 p.m."],
    ["It repeats", "The same standard on a quiet day and on a loud one."],
    ["It stays on", "The shift does not end because you left the room."],
  ],
  simonsKicker: "Where the idea comes from",
  simonsTitle: "Jim Simons stopped guessing. The market had to answer the data.",
  simons: [
    "James Harris Simons was a mathematician. In 1982 he founded Renaissance Technologies. The Medallion fund became the most talked-about money machine on Wall Street, and almost nobody outside the building was allowed in. He never published the models.",
    "What he did publish, by the way he worked, was the rule: fire the story. Hire people who can test. If the numbers say no, the idea is dead. Emotion does not get a vote.",
    "The bot uses a strategy built on that method. The rules sit in the code, and the order leaves without your mood, on your MetaTrader 5.",
  ],
  whyTitle: "Why people start with us",
  whyLead: "Not because someone shouted a number. Because the alternative is still you, alone, against the candle.",
  why: [
    ["Your hours come back", "The market runs all day. Your life does not have to sit in front of it."],
    ["One standard", "The bot does not have a good mood and a bad mood. The plan is the plan."],
    ["You see the work", "Activity stays in one place. You look when you decide to look."],
    ["A door behind you", "There is a network. People you bring do not end at the first handshake."],
  ],
  closeTitle: "If you are going to start, start where the clicking stops.",
  closeBody: "Create the account. Put the bot on MetaTrader 5. Then watch.",
};

const ro: LandingCopy = {
  kicker: "International Business Multiplier",
  hero: "Nu mai sta în grafic. Lasă un sistem să țină tura.",
  lead: "IBM este un bot automat pentru MetaTrader 5. Strategia lui urmează metoda sistematică pe care Jim Simons a făcut-o celebră: reguli fixe, fără emoție în ordin, același plan de fiecare dată.",
  primary: "Începe acum",
  secondary: "Am deja un cont",
  eyes: "Noi nu garantăm veniturile. Te lăsăm să le vezi cu ochii tăi.",
  botTitle: "Ce este botul, pe bune",
  botLead: "Un birou care nu obosește și nu se răzgândește în cel mai prost moment.",
  botBody:
    "Îl legi de MetaTrader 5. De acolo privește piața, așteaptă setup-ul lui și pune tranzacția singur. Tu nu dai click. Tu nu reîmprospătezi. Deschizi ecranul când vrei să vezi ce a făcut.",
  botPoints: [
    ["Decide el", "Intrarea este o regulă, nu o stare pe care ai avut-o la 23:00."],
    ["Repetă", "Același standard într-o zi liniștită și într-una gălăgioasă."],
    ["Rămâne pornit", "Tura nu se termină pentru că ai ieșit din cameră."],
  ],
  simonsKicker: "De unde vine ideea",
  simonsTitle: "Jim Simons a încetat să ghicească. Piața trebuia să răspundă datelor.",
  simons: [
    "James Harris Simons a fost matematician. În 1982 a înființat Renaissance Technologies. Fondul Medallion a devenit cea mai discutată mașină de bani de pe Wall Street, și aproape nimeni din afara clădirii nu avea voie înăuntru. Modelele nu le-a publicat niciodată.",
    "Ce a publicat, prin felul în care lucra, a fost regula: dai afară povestea. Angajezi oameni care știu să testeze. Dacă numerele spun nu, ideea e moartă. Emoția nu are vot.",
    "Botul folosește o strategie construită pe metoda asta. Regulile stau în cod, iar ordinul pleacă fără starea ta de moment, pe MetaTrader 5-ul tău.",
  ],
  whyTitle: "De ce să lucrezi cu noi",
  whyLead: "Nu pentru că cineva a strigat o cifră. Pentru că alternativa tot tu ești, singur, în fața lumânării.",
  why: [
    ["Orele tale se întorc", "Piața merge toată ziua. Viața ta nu trebuie să stea în fața ei."],
    ["Un singur standard", "Botul nu are zi bună și zi rea. Planul este planul."],
    ["Vezi munca", "Activitatea stă într-un singur loc. Te uiți când decizi tu să te uiți."],
    ["O ușă în spate", "Există o rețea. Oamenii pe care îi aduci nu se opresc la prima strângere de mână."],
  ],
  closeTitle: "Dacă începi, începe unde se oprește clickul.",
  closeBody: "Fă contul. Pune botul pe MetaTrader 5. Apoi uită-te.",
};

export function landingCopy(lang: string): LandingCopy {
  return lang === "ro" ? ro : en;
}
