export type LegalBlock = { h: string; p: string[] };

const termsRo: LegalBlock[] = [
  {
    h: "1. Părțile și acceptarea",
    p: [
      "Prezentele termeni și condiții («Termenii») reglementează accesul la site-ul IBM («Site-ul») și folosirea contului, a licenței software, a botului pentru MetaTrader 5 și a programului de afiliere (împreună, «Serviciul»). Operatorul Serviciului este denumit în continuare «IBM», «noi» sau «Operatorul». Persoana care își creează cont este «Utilizatorul».",
      "Crearea contului, bifarea căsuței de accept și folosirea Serviciului constituie acceptarea integrală a Termenilor și a Politicii de confidențialitate, în versiunea afișată la data acceptării. Dacă nu ești de acord, nu îți crea cont și nu folosi Serviciul.",
      "Termenii sunt un document contractual. Nu sunt o ofertă de consultanță juridică, fiscală sau de investiții. Limbajul este intenționat formal.",
    ],
  },
  {
    h: "2. Ce este și ce nu este Serviciul",
    p: [
      "IBM pune la dispoziție un program software care se poate conecta la terminalul MetaTrader 5 al Utilizatorului și un cont online pentru licență și afiliere. MetaTrader 5 este un produs al terților. Contul de broker este deschis de Utilizator, în numele lui, la un broker ales de el.",
      "IBM nu este broker, nu este bancă, nu este fond de investiții, nu administrează bani în numele Utilizatorului și nu execută ordine în contul lui de broker în calitate de intermediar financiar. Ordinele, dacă există, sunt trimise de software către terminalul pe care Utilizatorul îl ține pornit.",
      "Nu promitem funcționare neîntreruptă, compatibilitate cu orice broker, orice simbol, orice server sau orice versiune de terminal.",
    ],
  },
  {
    h: "3. Contul",
    p: [
      "Utilizatorul declară că are cel puțin 18 ani și capacitate deplină de exercițiu. Datele din cont trebuie să fie ale lui. Un cont nu se cedează și nu se împarte.",
      "Parola este responsabilitatea Utilizatorului. Orice acțiune făcută din cont se prezumă a fi a titularului, până la o notificare credibilă de acces neautorizat.",
      "Putem suspenda sau închide un cont dacă există indicii de abuz, fraudă, chargeback, încălcare a Termenilor sau folosire care pune în pericol Serviciul ori pe alți utilizatori.",
    ],
  },
  {
    h: "4. Licența software",
    p: [
      "După o plată recunoscută de sistem, Utilizatorul poate primi o cheie de licență personală, pentru durata și numărul de dispozitive afișate în cont. Licența este un drept limitat, neexclusiv, netransmisibil, de a folosi software-ul.",
      "Nu vinzi, nu închiriezi, nu copiezi și nu modifici software-ul. Nu încerci să ocolești verificarea licenței. Cheia nu este un instrument financiar și nu are valoare de piață garantată.",
      "Putem revoca o licență obținută prin plată contestată, identitate falsă sau încălcarea Termenilor. Revocarea nu este, prin ea însăși, o recunoaștere a culpei Operatorului.",
    ],
  },
  {
    h: "5. Plățile",
    p: [
      "Plata licenței, când este oferită, se face în criptomonedă, în rețeaua și la adresa afișate în cont. Utilizatorul verifică rețeaua înainte să trimită. O tranzacție trimisă pe o rețea greșită, către o adresă greșită sau cu o sumă insuficientă poate fi pierdută. IBM nu recuperează astfel de transferuri.",
      "Recunoașterea plății depinde de datele publice ale rețelei și de funcționarea furnizorilor tehnici. O întârziere sau o eroare de rețea nu obligă Operatorul să emită licența înainte de confirmare.",
      "Taxele, impozitele și comisioanele de rețea sunt ale Utilizatorului.",
    ],
  },
  {
    h: "6. Nicio garanție de rezultat",
    p: [
      "Noi nu garantăm veniturile. Nu garantăm profit, randament, număr de tranzacții, recuperarea sumei plătite pentru licență sau vreun rezultat financiar.",
      "Orice cifră văzută în timpul folosirii, în trecut sau la alte persoane este un fapt istoric al aceluia, dacă există, și nu o promisiune. Piețele se schimbă. O strategie poate produce pierderi, inclusiv pierderea întregului capital din contul de broker.",
      "Utilizatorul decide singur dacă pornește botul, pe ce cont, cu ce sumă și în ce mod. Decizia îi aparține în întregime.",
    ],
  },
  {
    h: "7. Programul de afiliere",
    p: [
      "Programul de afiliere, dacă este deschis contului, poate înregistra cote atunci când o persoană adusă prin link cumpără o licență și plata este verificată. Cotele, nivelurile și momentul plății sunt cele din regulile afișate în cont la data vânzării.",
      "Nu garantăm că o vânzare va avea loc, că un nivel va exista, că wallet-ul afiliatului este valid sau că rețeaua cripto va livra transferul. O plată eșuată poate fi reîncercată sau poate rămâne neexecutată, fără ca aceasta să nască o datorie certă a Operatorului în afara regulilor afișate.",
      "Este interzis spam-ul, promisiunea de câștig garantat făcută în numele IBM și orice prezentare care contrazice acești Termeni. Putem anula cotele provenite din astfel de practici.",
    ],
  },
  {
    h: "8. Obligațiile Utilizatorului",
    p: [
      "Utilizatorul își păstrează propriile credențiale de broker. Nu ni le trimite și nu le scrie în câmpuri care nu sunt destinate lor. Respectă regulile brokerului său și legea din țara lui, inclusiv cele despre publicitate financiară dacă recrutează afiliați.",
      "Nu folosește Serviciul pentru spălare de bani, fraudă, acces neautorizat sau pentru a încărca malware. Nu supraîncarcă intenționat infrastructura.",
      "Este responsabil pentru calculatorul sau serverul pe care rulează terminalul, pentru curent, internet și pentru faptul că lasă sau nu un program pornit.",
    ],
  },
  {
    h: "9. Proprietate intelectuală",
    p: [
      "Site-ul, textele, marca IBM, software-ul și documentația aparțin Operatorului sau licențiatorilor săi. Numele unor terți, inclusiv nume de persoane publice sau de firme, sunt folosite doar pentru descriere istorică sau comparativă și nu înseamnă sponsorizare, parteneriat sau licență din partea acelor persoane sau firme.",
      "Nimic din Serviciu nu îți transferă un drept asupra metodelor, modelelor sau mărcilor unor terți.",
    ],
  },
  {
    h: "10. Disponibilitate și modificări",
    p: [
      "Serviciul este furnizat «ca atare» și «după disponibilitate». Putem modifica, întrerupe sau retrage funcții, inclusiv botul, site-ul sau afilierea, cu sau fără anunț prealabil, în măsura permisă de lege.",
      "Putem actualiza Termenii. Versiunea nouă se aplică de la publicare pentru folosirea ulterioară. Data versiunii acceptate rămâne înregistrată în cont.",
    ],
  },
  {
    h: "11. Limitarea răspunderii",
    p: [
      "În măsura maximă permisă de legea aplicabilă, IBM nu răspunde pentru pierderi de tranzacționare, pierderi de profit, pierderi de date, întreruperi, erori de cotație, decizii ale brokerului, eșecuri ale MetaTrader 5, eșecuri ale rețelei blockchain, acte ale furnizorilor de hosting sau pentru orice daună indirectă, incidentală ori consecventă.",
      "În măsura maximă permisă de lege, răspunderea totală a Operatorului față de un Utilizator, pentru toate pretențiile legate de Serviciu, este limitată la suma plătită efectiv de acel Utilizator către IBM pentru licență în cele trei luni dinaintea faptului care naște pretenția. Dacă nu a plătit nimic, limita este zero.",
      "Nimic din acești Termeni nu exclude răspunderea care nu poate fi exclusă legal, inclusiv, unde legea o impune, pentru dol, vinovăție gravă sau drepturi imperative ale consumatorilor. Dacă ești consumator în Uniunea Europeană, păstrezi drepturile care nu pot fi înlăturate prin contract.",
    ],
  },
  {
    h: "12. Despăgubire",
    p: [
      "Utilizatorul va despăgubi Operatorul pentru pretenții ale terților născute din folosirea Serviciului de către Utilizator, din conținutul pe care îl publică despre IBM sau din încălcarea legii ori a Termenilor, în măsura permisă de lege.",
    ],
  },
  {
    h: "13. Încetare",
    p: [
      "Utilizatorul poate înceta folosirea oricând, prin închiderea contului sau prin simpla oprire a software-ului. Încetarea nu șterge obligațiile deja născute și nu obligă Operatorul să ramburseze o licență deja emisă, în afara cazurilor în care legea impune altfel.",
      "Putem înceta sau suspenda accesul conform secțiunii 3.",
    ],
  },
  {
    h: "14. Legea aplicabilă",
    p: [
      "Termenii sunt guvernați de legea română, fără a privea consumatorul de protecția imperativă din țara lui de reședință, atunci când o astfel de protecție se aplică. Instanțele din România sunt competente, sub aceeași rezervă.",
      "Dacă o clauză este nulă, restul rămâne în vigoare.",
    ],
  },
  {
    h: "15. Contact",
    p: [
      "Pentru întrebări despre Termeni, scrie din contul cu care te-ai înregistrat, ca să putem identifica acceptarea salvată. Versiunea acestui document este 2026-10-03.",
    ],
  },
];

const privacyRo: LegalBlock[] = [
  {
    h: "1. Cine prelucrează",
    p: [
      "Această politică descrie cum sunt prelucrate datele cu caracter personal în legătură cu site-ul și contul IBM. Operatorul este entitatea care oferă Serviciul, denumită aici IBM.",
      "Politica se citește împreună cu Termenii. Nu este o consultanță.",
    ],
  },
  {
    h: "2. Ce date colectăm",
    p: [
      "Date de cont: nume, email, parolă stocată de furnizorul de autentificare sub formă protejată, limbă, telefon și țară dacă le completezi, cod de recomandare și relația de recomandare.",
      "Date tehnice: identificatori de dispozitiv folosiți la activarea licenței, jurnale de acces, adresă IP aproximativă prin infrastructura de hosting, momentul acceptării documentelor legale și versiunea acceptată.",
      "Date de plată: hash de tranzacție, rețea, adresă de wallet publică folosită la plată sau la afiliere, stare comandă. Nu îți cerem cheia privată a wallet-ului.",
      "Nu îți cerem parola de la broker și nu o stocăm intenționat. Nu o introduce în formularele noastre.",
    ],
  },
  {
    h: "3. De ce le folosim",
    p: [
      "Ca să creăm și să ținem contul, să emitem și să verificăm licența, să înregistrăm acceptul legal, să administrăm afilierea și să răspundem la mesaje.",
      "Temeiurile sunt executarea contractului, obligațiile legale atunci când există și interesul legitim de a securiza Serviciul și de a preveni abuzul. Marketingul prin email, dacă va exista, va avea un temei separat.",
    ],
  },
  {
    h: "4. Cât timp le păstrăm",
    p: [
      "Datele de cont se păstrează cât timp contul este deschis și apoi o perioadă rezonabilă pentru securitate, contabilitate și apărarea unor pretenții, de regulă până la termenele legale aplicabile.",
      "Înregistrarea acceptului termenilor se păstrează pe toată durata contului și după închidere, cât timp este necesar pentru a dovedi că acceptarea a avut loc.",
    ],
  },
  {
    h: "5. Cui îi sunt transmise",
    p: [
      "Folosim furnizori tehnici pentru autentificare, bază de date și găzduire, inclusiv Supabase și Vercel, care pot prelucra date în Uniunea Europeană sau în alte țări, cu garanțiile prevăzute de acești furnizori.",
      "Putem divulga date dacă legea, o autoritate sau apărarea unui drept o cere. Nu vindem liste de emailuri.",
    ],
  },
  {
    h: "6. Drepturile tale",
    p: [
      "În condițiile legii aplicabile poți cere accesul, rectificarea, ștergerea, restricționarea, opoziția sau portabilitatea, și poți depune plângere la autoritatea de supraveghere. Unele date nu pot fi șterse imediat dacă trebuie păstrate pentru o obligație legală sau pentru dovedirea acceptului.",
      "Pentru exercitarea drepturilor, scrie din emailul contului.",
    ],
  },
  {
    h: "7. Securitate",
    p: [
      "Luăm măsuri rezonabile, tehnice și organizatorice. Niciun sistem conectat la internet nu este lipsit de risc. Nu garantăm securitate absolută.",
    ],
  },
  {
    h: "8. Minori",
    p: [
      "Serviciul nu este destinat persoanelor sub 18 ani. Nu colectăm cu bună știință date ale minorilor.",
    ],
  },
  {
    h: "9. Modificări",
    p: [
      "Putem actualiza politica. Versiunea curentă este 2026-10-03. Folosirea în continuare după publicare înseamnă că ai luat cunoștință de textul nou, fără a șterge acceptul deja salvat pentru versiunea anterioară.",
    ],
  },
];

const termsEn: LegalBlock[] = [
  {
    h: "1. Parties and acceptance",
    p: [
      "These terms govern access to the IBM website and use of the account, the software license, the MetaTrader 5 bot, and the affiliate program (together, the Service). The operator is called IBM or we. The person who creates an account is the User.",
      "Creating an account, ticking the acceptance box, and using the Service is full acceptance of these Terms and the Privacy Policy in the version shown on that date. If you disagree, do not create an account.",
      "This is a contract. It is not legal, tax, or investment advice. The wording is formal on purpose.",
    ],
  },
  {
    h: "2. What the Service is not",
    p: [
      "IBM provides software that can connect to the User’s own MetaTrader 5 terminal, plus an online account for a license and affiliates. MetaTrader 5 belongs to a third party. The brokerage account is opened by the User, in the User’s name, at a broker the User chooses.",
      "IBM is not a broker, a bank, or an investment fund. IBM does not manage the User’s money and does not act as a financial intermediary. If orders are sent, the software sends them to the terminal the User keeps running.",
      "We do not promise uninterrupted operation or compatibility with every broker, symbol, server, or terminal version.",
    ],
  },
  {
    h: "3. The account",
    p: [
      "The User states that they are at least 18 and have full legal capacity. Account data must be theirs. An account is not shared or transferred.",
      "The password is the User’s responsibility. Actions from the account are presumed to be the holder’s until a credible notice of unauthorized access.",
      "We may suspend or close an account for abuse, fraud, a disputed payment, a breach of these Terms, or use that endangers the Service or other users.",
    ],
  },
  {
    h: "4. Software license",
    p: [
      "After a payment the system recognizes, the User may receive a personal license key for the duration and device count shown in the account. The license is a limited, non-exclusive, non-transferable right to use the software.",
      "You do not sell, rent, copy, or modify the software, and you do not bypass license checks. The key is not a financial instrument and has no guaranteed market value.",
      "We may revoke a license obtained through a disputed payment, a false identity, or a breach of these Terms.",
    ],
  },
  {
    h: "5. Payments",
    p: [
      "When a license fee is offered, it is paid in cryptocurrency on the network and to the address shown in the account. The User checks the network before sending. A transfer on the wrong network, to the wrong address, or for the wrong amount may be lost. IBM does not recover those transfers.",
      "Recognition of a payment depends on public chain data and on technical providers. A delay does not oblige us to issue a license before confirmation.",
      "Taxes and network fees belong to the User.",
    ],
  },
  {
    h: "6. No guarantee of results",
    p: [
      "We do not guarantee income. We do not guarantee profit, return, number of trades, recovery of the license fee, or any financial result.",
      "Any figure seen in use, in the past, or by another person is that person’s history, if it exists, and not a promise. Markets change. A strategy can lose money, including the whole balance at the broker.",
      "The User alone decides whether to start the bot, on which account, with what size, and in which mode.",
    ],
  },
  {
    h: "7. Affiliates",
    p: [
      "If the affiliate program is open on the account, shares may be recorded when a person who arrived through a link buys a license and the payment is verified. Levels and timing are those shown in the account on the date of the sale.",
      "We do not guarantee that a sale will happen, that a level will exist, that a wallet address is valid, or that a chain transfer will complete.",
      "Spam and any promise of guaranteed profit made in IBM’s name are forbidden. Shares that come from those practices may be cancelled.",
    ],
  },
  {
    h: "8. User duties",
    p: [
      "The User keeps their own broker credentials. They do not send them to us. They follow their broker’s rules and the law of their country.",
      "The User does not use the Service for fraud, unauthorized access, or malware, and does not deliberately overload the infrastructure.",
      "The User is responsible for the computer or server that runs the terminal, for power, for internet, and for leaving a program running.",
    ],
  },
  {
    h: "9. Intellectual property",
    p: [
      "The site, texts, the IBM name, the software, and the documentation belong to the operator or its licensors. Names of third parties, including public figures or firms, are used only as historical or descriptive references. That use is not sponsorship, partnership, or a license from those persons or firms.",
      "Nothing in the Service transfers a right in any third party’s methods, models, or trademarks.",
    ],
  },
  {
    h: "10. Availability and changes",
    p: [
      "The Service is provided as is and as available. We may change, pause, or remove features, including the bot, the site, or affiliates, with or without notice, to the extent the law allows.",
      "We may update these Terms. The new version applies from publication to later use. The version you accepted stays recorded on the account.",
    ],
  },
  {
    h: "11. Limitation of liability",
    p: [
      "To the maximum extent permitted by applicable law, IBM is not liable for trading losses, lost profits, lost data, outages, quote errors, broker decisions, MetaTrader 5 failures, blockchain failures, hosting failures, or any indirect or consequential damage.",
      "To the maximum extent permitted by law, our total liability to a User for all claims related to the Service is limited to the amount that User actually paid IBM for a license in the three months before the event. If they paid nothing, the limit is zero.",
      "Nothing here excludes liability that cannot legally be excluded, including, where the law requires it, for fraud, gross fault, or mandatory consumer rights. If you are a consumer in the European Union, you keep the rights that a contract cannot remove.",
    ],
  },
  {
    h: "12. Indemnity",
    p: [
      "The User will indemnify the operator against third-party claims arising from the User’s use of the Service, from what the User publishes about IBM, or from a breach of law or of these Terms, to the extent the law allows.",
    ],
  },
  {
    h: "13. Ending",
    p: [
      "The User may stop at any time by closing the account or by turning the software off. Stopping does not erase duties already incurred and does not require a refund of an issued license, except where the law says otherwise.",
    ],
  },
  {
    h: "14. Law",
    p: [
      "These Terms are governed by Romanian law, without depriving a consumer of mandatory protection in their country of residence where that protection applies. Courts in Romania have jurisdiction, with the same reservation.",
      "If a clause is void, the rest stays in force. Document version 2026-10-03.",
    ],
  },
];

const privacyEn: LegalBlock[] = [
  {
    h: "1. Who processes data",
    p: [
      "This policy describes how personal data is processed for the IBM site and account. The controller is the entity that offers the Service, called IBM here.",
      "Read it with the Terms. It is not advice.",
    ],
  },
  {
    h: "2. What we collect",
    p: [
      "Account data: name, email, a password stored by the authentication provider in protected form, language, phone and country if you fill them in, referral code, and referral relationship.",
      "Technical data: device identifiers used to activate a license, access logs, an approximate IP through the host, the time you accepted the legal documents, and the version accepted.",
      "Payment data: transaction hash, network, the public wallet address used for a payment or an affiliate payout, and order status. We do not ask for your wallet private key.",
      "We do not ask for your broker password and we do not intend to store it. Do not type it into our forms.",
    ],
  },
  {
    h: "3. Why",
    p: [
      "To create and keep the account, to issue and check a license, to record legal acceptance, to run affiliates, and to answer messages.",
      "The bases are the contract, legal duties where they exist, and the legitimate interest in securing the Service and preventing abuse.",
    ],
  },
  {
    h: "4. How long",
    p: [
      "Account data is kept while the account is open and then for a reasonable period for security, accounting, and claims, usually up to the legal periods that apply.",
      "The record that you accepted the terms is kept for the life of the account and afterwards for as long as needed to prove that acceptance happened.",
    ],
  },
  {
    h: "5. Who receives data",
    p: [
      "We use technical providers for authentication, database, and hosting, including Supabase and Vercel. They may process data in the European Union or elsewhere, under their own safeguards.",
      "We may disclose data if the law, an authority, or the defense of a right requires it. We do not sell email lists.",
    ],
  },
  {
    h: "6. Your rights",
    p: [
      "Where the law gives them, you may request access, correction, deletion, restriction, objection, or portability, and you may complain to a supervisory authority. Some data cannot be deleted at once if it must be kept for a legal duty or to prove acceptance.",
    ],
  },
  {
    h: "7. Security and children",
    p: [
      "We take reasonable technical and organizational measures. No internet system is free of risk. We do not guarantee absolute security.",
      "The Service is not for anyone under 18. We do not knowingly collect children’s data. Version 2026-10-03.",
    ],
  },
];

export const LEGAL = {
  ro: {
    termsTitle: "Termeni și condiții",
    privacyTitle: "Politica de confidențialitate",
    terms: termsRo,
    privacy: privacyRo,
  },
  en: {
    termsTitle: "Terms and conditions",
    privacyTitle: "Privacy policy",
    terms: termsEn,
    privacy: privacyEn,
  },
};
