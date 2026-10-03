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

export function landingCopy(): LandingCopy {
  return en;
}
