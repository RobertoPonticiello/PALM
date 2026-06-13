// Mock data for the Palm clickable demo (Italian)
export const childProfile = {
  name: "Romeo",
  ageMonths: 2,
  ageDays: 3,
  correctedAgeMonths: 0,
  correctedAgeDays: 18,
  weightG: 3100,
  weightPercentile: 25,
  lengthCm: 49,
  lengthPercentile: 30,
  headCm: 35.5,
  headPercentile: 28,
  status: "good" as "good" | "warn" | "bad",
  emoji: "👶🏻",
  birthWeightG: 1450,
  dischargeDate: "2025-03-26",
  pediatrician: "Dr.ssa Bianchi",
};

export const parentProfile = {
  name: "Chiara",
  initial: "C",
};

export const partnerProfile = {
  name: "Invita",
  initial: "+",
  empty: true,
};

// ====== Multi-profile system ======
// Three personas the user can switch between from ProfileSelect.
// id: "matteo" (baby, default), "chiara" (mother, 35), "riccardo" (father of Chiara, 79 — geriatric).

export type ProfileKind = "baby" | "toddler" | "adult" | "geriatric";
export type ProfileId = "matteo" | "chiara" | "riccardo" | "sofia";

export interface ProfileBase {
  id: ProfileId;
  name: string;
  kind: ProfileKind;
  emoji: string;
  photo?: string;
  ageLabel: string;
  status: "good" | "warn" | "bad";
  statusLabel: string;
  relation: string; // shown above name on card
  tags: string[]; // chips on card
  greeting: string; // shown on dashboard
}

export const profiles: Record<ProfileId, ProfileBase> = {
  matteo: {
    id: "matteo",
    name: "Romeo",
    kind: "baby",
    emoji: "👶🏻",
    ageLabel: "2 mesi · 3,10 kg",
    status: "good",
    statusLabel: "Tutto bene",
    relation: "Il tuo piccolo",
    tags: [],
    greeting: "Buon pomeriggio, Chiara",
  },
  chiara: {
    id: "chiara",
    name: "Chiara",
    kind: "adult",
    emoji: "🌸",
    ageLabel: "35 anni",
    status: "good",
    statusLabel: "Tutto bene",
    relation: "Tu",
    tags: [],
    greeting: "Bentornata, Chiara",
  },
  riccardo: {
    id: "riccardo",
    name: "Riccardo",
    kind: "geriatric",
    emoji: "👴🏻",
    ageLabel: "79 anni",
    status: "good",
    statusLabel: "Stabile",
    relation: "Tuo papà",
    tags: [],
    greeting: "Buon pomeriggio",
  },
  sofia: {
    id: "sofia",
    name: "Sofia",
    kind: "toddler",
    emoji: "🧒🏻",
    ageLabel: "3 anni · 14,2 kg",
    status: "good",
    statusLabel: "Tutto bene",
    relation: "La tua piccola",
    tags: [],
    greeting: "Buon pomeriggio, Chiara",
  },
};

// Order: the direct user first (Chiara), then those she cares for.
export const profileOrder: ProfileId[] = ["chiara", "matteo", "sofia", "riccardo"];

// ====== Per-profile dashboard data ======
export interface ProfileDashboard {
  hero: { value: string; label: string; trend?: string; ringPercentile: number; ringLabel: string; hideRing?: boolean };
  metrics: { label: string; value: string; sub: string; gradient: string }[];
  whisper: { title: string; body: string; cta?: string };
  upcoming: { id: number; title: string; date: string; time: string; icon: string; color: string; location?: string; prep?: string }[];
  recent: { id: number; time: string; detail: string }[];
  trend: { label: string; series: { day: string; v: number }[]; tag: string };
  featuredVideoId: string;
  caregiverChecklist?: { id: string; label: string; emoji: string; done: boolean; time?: string }[];
}

export const profileDashboards: Record<ProfileId, ProfileDashboard> = {
  matteo: {
    hero: { value: "3,10 kg", label: "+120 g questa settimana · in linea con la traiettoria", ringPercentile: 25, ringLabel: "peso · curva crescita" },
    metrics: [
      { label: "Lunghezza", value: "49 cm", sub: "30° perc.", gradient: "gradient-mint" },
      { label: "Testa", value: "35,5 cm", sub: "28° perc.", gradient: "gradient-sky" },
      { label: "Poppate oggi", value: "7 / 8", sub: "in linea", gradient: "gradient-warm" },
    ],
    whisper: {
      title: "Ciao Chiara 💛",
      body: "Domani alle 10:30 c'è il vaccino esavalente di Romeo. Vuoi che ti prepari cosa portare e cosa aspettarti dopo?",
      cta: "Continua con Palm",
    },
    upcoming: [
      { id: 1, title: "Vaccino esavalente", date: "24 apr", time: "10:30", icon: "💉", color: "pastel-blue", location: "ASL Roma 1 · via Ariosto 3", prep: "Libretto vaccinale + tessera sanitaria" },
      { id: 2, title: "Visita pediatrica 4 mesi", date: "2 mag", time: "16:00", icon: "🩺", color: "pastel-mint", location: "Studio Dr.ssa Bianchi", prep: "Diario poppate ultimi 7 gg" },
      { id: 3, title: "Ecografia cerebrale", date: "12 mag", time: "09:00", icon: "🧠", color: "pastel-lavender", location: "Bambino Gesù · Piazza S. Onofrio 4", prep: "Romeo a digiuno da 2h, ciuccio + copertina" },
    ],
    recent: [
      { id: 1, time: "14:30", detail: "Biberon · 65 ml · latte materno" },
      { id: 2, time: "13:55", detail: "Pannolino · pipì + feci normali" },
      { id: 3, time: "11:45", detail: "Seno · ~12 min" },
      { id: 4, time: "09:00", detail: "Vitamina D · somministrata" },
    ],
    trend: {
      label: "Peso ultimi 7 giorni",
      tag: "Costante",
      series: [
        { day: "L", v: 2980 }, { day: "M", v: 3010 }, { day: "M", v: 3035 },
        { day: "G", v: 3050 }, { day: "V", v: 3055 }, { day: "S", v: 3075 }, { day: "D", v: 3100 },
      ],
    },
    featuredVideoId: "nasal",
  },
  chiara: {
    hero: { value: "6.840", label: "passi oggi · obiettivo 8.000", ringPercentile: 85, ringLabel: "passi · oggi", hideRing: true },
    metrics: [
      { label: "Sonno", value: "5h 20m", sub: "frammentato", gradient: "gradient-parent" },
      { label: "Ciclo", value: "Giorno 14", sub: "fase fertile", gradient: "gradient-warm" },
      { label: "Vitamine", value: "1 / 2", sub: "manca ferro", gradient: "gradient-sky" },
    ],
    whisper: {
      title: "Ciao Chiara 💛",
      body: "Hai dormito meno di 4 ore per 4 notti di fila. Posso darti qualche consiglio pratico per recuperare un po' di riposo durante il giorno?",
      cta: "Parla con Palm",
    },
    upcoming: [
      { id: 1, title: "Visita ginecologica annuale", date: "28 apr", time: "11:00", icon: "🌸", color: "pastel-lavender", location: "Studio dr.ssa Conti · via Nomentana 88", prep: "Ultime analisi + lista farmaci" },
      { id: 2, title: "Pap test biennale", date: "15 mag", time: "09:30", icon: "🩺", color: "pastel-mint", location: "Consultorio ASL · via dei Mille 12", prep: "Tessera sanitaria, evita rapporti 48h prima" },
      { id: 3, title: "Controllo ferritina", date: "30 apr", time: "08:00", icon: "🩸", color: "pastel-blue", location: "Lab. Centrale · via del Tritone 90", prep: "Digiuno da 8 ore" },
    ],
    recent: [
      { id: 1, time: "07:10", detail: "Umore · 6/10 (un po' stanca)" },
      { id: 2, time: "08:00", detail: "Vitamina D · presa" },
      { id: 3, time: "ieri", detail: "Allenamento perineo · 12 min" },
      { id: 4, time: "ieri", detail: "Passi · 8.120" },
    ],
    trend: {
      label: "Ore di sonno · 7 gg",
      tag: "Frammentato",
      series: [
        { day: "L", v: 6.2 }, { day: "M", v: 5.4 }, { day: "M", v: 5.0 },
        { day: "G", v: 6.1 }, { day: "V", v: 4.8 }, { day: "S", v: 5.5 }, { day: "D", v: 5.3 },
      ],
    },
    featuredVideoId: "pp-pelvic",
  },
  riccardo: {
    hero: { value: "3.420", label: "passi oggi · obiettivo 5.000", ringPercentile: 68, ringLabel: "passi · oggi", hideRing: true },
    metrics: [
      { label: "Pressione", value: "128/82", sub: "media 7 gg", gradient: "gradient-mint" },
      { label: "Glicemia", value: "104", sub: "mg/dL · digiuno", gradient: "gradient-sky" },
      { label: "Sonno", value: "7h 10m", sub: "ieri notte", gradient: "gradient-warm" },
    ],
    whisper: {
      title: "Buon pomeriggio 💛",
      body: "Riccardo non ha ancora confermato la dose di Bisoprololo delle 8:00. Vuoi che gli mandi un promemoria audio sul suo telefono?",
      cta: "Manda alert a Riccardo",
    },
    upcoming: [
      { id: 1, title: "Controllo cardiologico", date: "22 apr", time: "09:30", icon: "❤️", color: "pastel-blue", location: "Osp. San Camillo · pad. C, amb. 4", prep: "Porta ECG di gennaio + lista farmaci, niente caffè dalla sera prima" },
      { id: 2, title: "Esami ematici di routine", date: "5 mag", time: "07:30", icon: "🩸", color: "pastel-mint", location: "Lab. ASL · via Marmorata 169", prep: "Digiuno da 12 ore, sospendere ferro 3 gg prima" },
      { id: 3, title: "Visita oculistica (cataratta)", date: "18 mag", time: "10:00", icon: "👁️", color: "pastel-lavender", location: "IRCCS Bietti · via Livenza 3", prep: "Accompagnatore richiesto (pupille dilatate)" },
    ],
    recent: [
      { id: 1, time: "08:00", detail: "Bisoprololo 2,5 mg · non confermato ⚠️" },
      { id: 2, time: "07:45", detail: "Pressione · 132/84 mmHg" },
      { id: 3, time: "ieri", detail: "Camminata · 28 min al parco" },
      { id: 4, time: "ieri", detail: "Glicemia · 98 mg/dL (digiuno)" },
    ],
    trend: {
      label: "Pressione sist. · 7 gg",
      tag: "Stabile",
      series: [
        { day: "L", v: 130 }, { day: "M", v: 128 }, { day: "M", v: 134 },
        { day: "G", v: 126 }, { day: "V", v: 129 }, { day: "S", v: 131 }, { day: "D", v: 128 },
      ],
    },
    featuredVideoId: "ger-bp",
    caregiverChecklist: [
      { id: "bp", label: "Misura pressione mattino", emoji: "🩺", done: true, time: "07:45" },
      { id: "biso", label: "Bisoprololo 2,5 mg", emoji: "💊", done: false, time: "08:00" },
      { id: "walk", label: "Camminata 20 min", emoji: "🚶", done: false, time: "10:30" },
      { id: "amlo", label: "Amlodipina 5 mg", emoji: "💊", done: true, time: "13:00" },
      { id: "ator", label: "Atorvastatina 20 mg", emoji: "💊", done: false, time: "20:00" },
    ],
  },
  sofia: {
    hero: { value: "14,2 kg", label: "+0,3 kg ultimo mese · crescita armonica", ringPercentile: 55, ringLabel: "peso · 3 anni" },
    metrics: [
      { label: "Altezza", value: "95 cm", sub: "60° perc.", gradient: "gradient-mint" },
      { label: "Sonno notturno", value: "10h 20m", sub: "regolare", gradient: "gradient-parent" },
      { label: "Vaccinazioni", value: "In regola", sub: "richiamo MPR a 5 anni", gradient: "gradient-sky" },
    ],
    whisper: {
      title: "Ciao Chiara 💛",
      body: "Sofia ha avuto un po' di tosse ieri sera. Vuoi capire insieme se è il caso di osservare o di chiamare la pediatra?",
      cta: "Parla con Palm",
    },
    upcoming: [
      { id: 1, title: "Visita pediatrica 3 anni", date: "10 mag", time: "16:30", icon: "🩺", color: "pastel-mint", location: "Studio Dr.ssa Bianchi", prep: "Libretto vaccinazioni + ultime misurazioni" },
      { id: 2, title: "Prima visita dentistica", date: "22 mag", time: "10:00", icon: "🦷", color: "pastel-blue", location: "Studio dr. Rinaldi · via Tuscolana 12", prep: "Ha lavato i denti la mattina · niente colazione zuccherata" },
      { id: 3, title: "Controllo logopedia (pronuncia)", date: "6 giu", time: "11:00", icon: "🗣️", color: "pastel-lavender", location: "Centro Ascolta · via Latina 5", prep: "Porta il libro preferito di Sofia" },
    ],
    recent: [
      { id: 1, time: "20:30", detail: "Tosse secca · ~5 colpi prima di addormentarsi" },
      { id: 2, time: "18:45", detail: "Cena · pasta al pomodoro + zucchine" },
      { id: 3, time: "ieri", detail: "Peso · 14,2 kg" },
      { id: 4, time: "ieri", detail: "Sonno · 10h 20m (1 risveglio breve)" },
    ],
    trend: {
      label: "Peso ultimi 6 mesi",
      tag: "Armonico",
      series: [
        { day: "N", v: 13.4 }, { day: "D", v: 13.6 }, { day: "G", v: 13.8 },
        { day: "F", v: 13.9 }, { day: "M", v: 14.0 }, { day: "A", v: 14.1 }, { day: "M", v: 14.2 },
      ],
    },
    featuredVideoId: "tod-fever",
  },
};

// ====== Per-profile documents library ======
export interface ProfileDoc {
  id: string;
  title: string;
  sub: string;
  icon: "file" | "flask" | "brain" | "heart" | "pill";
  tone: string;
  badge: string;
}

export const profileDocuments: Record<ProfileId, ProfileDoc[]> = {
  matteo: [
    { id: "discharge", title: "Lettera di dimissione TIN", sub: "Bambino Gesù · 26 mar 2025", icon: "file", tone: "gradient-warm", badge: "Estratta" },
    { id: "blood", title: "Emocromo di controllo", sub: "Bambino Gesù · 8 apr 2025", icon: "flask", tone: "gradient-sky", badge: "Estratta" },
    { id: "neuro", title: "Visita neurologica + ecografia", sub: "Bambino Gesù · 10 apr 2025", icon: "brain", tone: "gradient-parent", badge: "Estratta" },
  ],
  chiara: [
    { id: "pp-discharge", title: "Esami pre-dimissione ostetricia", sub: "Ostetricia · 2 gen 2025", icon: "file", tone: "gradient-parent", badge: "Estratta" },
    { id: "pp-visit", title: "Visita post-partum 6 settimane", sub: "Ginecologia · 14 mar 2025", icon: "file", tone: "gradient-warm", badge: "Estratta" },
    { id: "pp-blood", title: "Emocromo + ferritina post-partum", sub: "Lab. centrale · 1 apr 2025", icon: "flask", tone: "gradient-sky", badge: "Estratta" },
    { id: "pp-thyroid", title: "Funzionalità tiroidea (TSH, FT4)", sub: "Lab. centrale · 1 apr 2025", icon: "flask", tone: "gradient-mint", badge: "Estratta" },
    { id: "pp-pelvic", title: "Ecografia pelvica di controllo", sub: "Ginecologia · 14 mar 2025", icon: "heart", tone: "gradient-baby", badge: "Estratta" },
    { id: "pp-floor", title: "Valutazione pavimento pelvico", sub: "Ostetrica · 28 mar 2025", icon: "file", tone: "gradient-mint", badge: "Estratta" },
  ],
  riccardo: [
    { id: "ger-cardio", title: "Visita cardiologica + ECG", sub: "San Camillo · 12 feb 2025", icon: "heart", tone: "gradient-warm", badge: "Estratta" },
    { id: "ger-blood", title: "Pannello completo (lipidi, glicemia)", sub: "Lab. centrale · 20 mar 2025", icon: "flask", tone: "gradient-sky", badge: "Estratta" },
    { id: "ger-meds", title: "Piano terapeutico cronico", sub: "MMG dr. Conti · 2 gen 2025", icon: "pill", tone: "gradient-mint", badge: "Estratta" },
    { id: "ger-eye", title: "Visita oculistica · cataratta", sub: "IRCCS Bietti · 5 nov 2024", icon: "file", tone: "gradient-parent", badge: "Estratta" },
  ],
  sofia: [
    { id: "sof-vacc", title: "Libretto vaccinazioni", sub: "ASL Roma 1 · aggiornato 15 mar 2025", icon: "file", tone: "gradient-sky", badge: "Estratta" },
    { id: "sof-allergy", title: "Test allergie alimentari · negativo", sub: "Pediatra · 8 feb 2025", icon: "flask", tone: "gradient-mint", badge: "Estratta" },
    { id: "sof-growth", title: "Curva di crescita pediatrica", sub: "Dr.ssa Bianchi · 12 gen 2025", icon: "file", tone: "gradient-warm", badge: "Estratta" },
  ],
};

// ====== AI extracted summaries per document ======
export interface DocSummary {
  headline: string;
  bullets: { label: string; value: string; tone?: "good" | "warn" | "bad" }[];
  conclusion: string;
  source: string;
  date: string;
}

export const docSummaries: Record<string, DocSummary> = {
  // Chiara
  "pp-discharge": {
    headline: "Anemia post-partum lieve-moderata, resto regolare",
    source: "Ostetricia · dr.ssa Greco",
    date: "2 gennaio 2025",
    bullets: [
      { label: "Emoglobina", value: "10,4 g/dL (rif. 12-16)", tone: "warn" },
      { label: "Ematocrito", value: "31,2% (rif. 36-46)", tone: "warn" },
      { label: "Globuli bianchi", value: "11,8 ×10⁹/L", tone: "good" },
      { label: "Piastrine", value: "245 ×10⁹/L", tone: "good" },
      { label: "PT-INR", value: "1,02", tone: "good" },
      { label: "Fibrinogeno", value: "4,1 g/L", tone: "good" },
      { label: "Creatinina", value: "0,72 mg/dL", tone: "good" },
      { label: "Glicemia", value: "88 mg/dL", tone: "good" },
      { label: "PCR", value: "12 mg/L (rif. <5)", tone: "warn" },
    ],
    conclusion: "Anemia post-partum attesa dopo cesareo. Avviato ferro orale e dieta ricca di ferro. Resto degli esami nella norma; PCR in lieve rialzo coerente con il post-operatorio.",
  },
  "pp-visit": {
    headline: "Recupero post-partum nella norma",
    source: "Ginecologia · dr.ssa Conti",
    date: "14 marzo 2025",
    bullets: [
      { label: "Involuzione uterina", value: "Completata", tone: "good" },
      { label: "Cicatrice cesareo", value: "Guarita, no segni infiammatori", tone: "good" },
      { label: "Pavimento pelvico", value: "Lieve ipotono — riabilitazione consigliata", tone: "warn" },
      { label: "Allattamento", value: "Misto, senza dolore", tone: "good" },
    ],
    conclusion: "Tutto regolare. Iniziare 10 sedute di riabilitazione perineale. Prossimo controllo a 6 mesi.",
  },
  "pp-blood": {
    headline: "Anemia da carenza di ferro lieve",
    source: "Lab. Centrale",
    date: "1 aprile 2025",
    bullets: [
      { label: "Emoglobina", value: "11,2 g/dL (rif. 12-16)", tone: "warn" },
      { label: "Ferritina", value: "18 ng/mL (rif. 30-200)", tone: "warn" },
      { label: "Vit. B12", value: "342 pg/mL", tone: "good" },
      { label: "Folati", value: "8,1 ng/mL", tone: "good" },
    ],
    conclusion: "Iniziare integrazione di ferro orale 30 mg/die per 3 mesi, ricontrollo a giugno.",
  },
  "pp-thyroid": {
    headline: "Funzionalità tiroidea regolare",
    source: "Lab. Centrale",
    date: "1 aprile 2025",
    bullets: [
      { label: "TSH", value: "2,1 mIU/L (rif. 0.4-4)", tone: "good" },
      { label: "FT4", value: "1,2 ng/dL", tone: "good" },
      { label: "Anti-TPO", value: "Negativi", tone: "good" },
    ],
    conclusion: "Nessun segno di tiroidite post-partum. Ricontrollo a 12 mesi se sintomi.",
  },
  "pp-pelvic": {
    headline: "Utero in normale involuzione",
    source: "Ginecologia · dr.ssa Conti",
    date: "14 marzo 2025",
    bullets: [
      { label: "Utero", value: "Involuzione completa, 8 × 5 cm", tone: "good" },
      { label: "Endometrio", value: "Lineare, 4 mm", tone: "good" },
      { label: "Ovaie", value: "Aspetto regolare bilateralmente", tone: "good" },
      { label: "Cicatrice cesareo", value: "Continua, ben rappresentata", tone: "good" },
      { label: "Liquido libero", value: "Assente", tone: "good" },
    ],
    conclusion: "Quadro pelvico nella norma a 10 settimane dal cesareo. Nessun controllo aggiuntivo necessario.",
  },
  "pp-floor": {
    headline: "Lieve ipotono perineale, riabilitazione consigliata",
    source: "Ostetrica · dr.ssa Marini",
    date: "28 marzo 2025",
    bullets: [
      { label: "Tono perineale (Oxford)", value: "3/5", tone: "warn" },
      { label: "Diastasi addominale", value: "1,5 cm sopra-ombelicale", tone: "warn" },
      { label: "Continenza urinaria", value: "Conservata", tone: "good" },
      { label: "Dolore alla cicatrice", value: "Assente", tone: "good" },
      { label: "Sensibilità perineale", value: "Conservata", tone: "good" },
    ],
    conclusion: "Indicato ciclo di 10 sedute di riabilitazione perineale + esercizi di chiusura della diastasi. Rivalutazione fra 3 mesi.",
  },
  // Riccardo
  "ger-cardio": {
    headline: "Cardiopatia ipertensiva ben compensata",
    source: "San Camillo · dr. Russo",
    date: "12 febbraio 2025",
    bullets: [
      { label: "Pressione in studio", value: "134/86 mmHg", tone: "warn" },
      { label: "ECG", value: "Ritmo sinusale, FC 68 bpm", tone: "good" },
      { label: "Frazione eiezione", value: "58% (eco)", tone: "good" },
      { label: "Ipertrofia VS", value: "Lieve, non progressione", tone: "warn" },
    ],
    conclusion: "Continuare Bisoprololo + Amlodipina. Holter 24h tra 6 mesi. Limitare sale.",
  },
  "ger-blood": {
    headline: "Profilo lipidico al limite, glicemia ok",
    source: "Lab. Centrale",
    date: "20 marzo 2025",
    bullets: [
      { label: "Colesterolo LDL", value: "112 mg/dL (target <100)", tone: "warn" },
      { label: "HDL", value: "48 mg/dL", tone: "good" },
      { label: "Trigliceridi", value: "138 mg/dL", tone: "good" },
      { label: "Glicemia", value: "104 mg/dL", tone: "good" },
      { label: "Creatinina", value: "1,1 mg/dL", tone: "good" },
    ],
    conclusion: "LDL ancora sopra target: aumentare Atorvastatina a 40 mg. Ricontrollo 3 mesi.",
  },
  "ger-meds": {
    headline: "5 farmaci cronici · piano dr. Conti",
    source: "MMG dr. Conti",
    date: "2 gennaio 2025",
    bullets: [
      { label: "Bisoprololo", value: "2,5 mg · ore 08:00", tone: "good" },
      { label: "Amlodipina", value: "5 mg · ore 13:00", tone: "good" },
      { label: "Atorvastatina", value: "20 mg · ore 20:00", tone: "good" },
      { label: "Cardioaspirina", value: "100 mg · ore 13:00", tone: "good" },
      { label: "Vitamina D", value: "25.000 UI · 1 volta a settimana", tone: "good" },
    ],
    conclusion: "Schema cronico stabile. Rivalutare ogni 6 mesi. Attenzione a interazione ferro-statina.",
  },
  "ger-eye": {
    headline: "Cataratta bilaterale · OD prioritario",
    source: "IRCCS Bietti",
    date: "5 novembre 2024",
    bullets: [
      { label: "Visus OD", value: "5/10 con correzione", tone: "warn" },
      { label: "Visus OS", value: "7/10 con correzione", tone: "warn" },
      { label: "Tono oculare", value: "16/15 mmHg", tone: "good" },
      { label: "Fundus", value: "Nei limiti", tone: "good" },
    ],
    conclusion: "Indicazione a facoemulsificazione OD. Lista d'attesa programmata per maggio 2025.",
  },
};

// ====== Per-profile primary care reports (for adult/geriatric "report at-a-glance") ======
export const adultReportChiara = {
  patient: {
    name: "Chiara Romano",
    age: "35 anni",
    sex: "F",
    height: "168 cm",
    weight: "64 kg",
    bmi: "22,7",
  },
  context: "Donna 35 anni, post-partum (3 mesi), allatta misto. Si presenta dal MMG per stanchezza persistente e controllo periodico.",
  vitals: { bp: "118/74", hr: "72 bpm", temp: "36,5°C" },
  labs: [
    { label: "Emoglobina", value: "11,2 g/dL", tone: "warn" as const, ref: "12-16" },
    { label: "Ferritina", value: "18 ng/mL", tone: "warn" as const, ref: "30-200" },
    { label: "TSH", value: "2,1 mIU/L", tone: "good" as const, ref: "0.4-4" },
    { label: "Vit. D", value: "22 ng/mL", tone: "warn" as const, ref: ">30" },
  ],
  meds: ["Ferro solfato 30 mg/die (da 1 apr)", "Vitamina D 25.000 UI/sett", "Acido folico 400 mcg/die"],
  history: [
    "Cesareo gennaio 2025, decorso regolare",
    "Allattamento misto",
    "Familiarità: madre celiaca, padre ipertensione",
    "Nessuna allergia nota",
  ],
  lifestyle: [
    "Sonno: 5h 20m frammentato (4 notti < 4h)",
    "Passi: media 6.500/die",
    "Ciclo: ripreso 2 mesi fa, regolare",
    "Umore: 6/10, chiede consulto psicologico",
  ],
  reasons: [
    "Stanchezza marcata (probabile carenza ferro/vit D)",
    "Disturbi del sonno post-partum",
    "Richiesta screening psicologico perinatale",
  ],
  doctorAsk: [
    "Impegnativa ricontrollo emocromo + ferritina (giugno)",
    "Richiesta consulenza psicologa perinatale ASL",
    "Valutare screening ferro endovena se ferritina < 15",
  ],
};

export const geriatricReportRiccardo = {
  patient: {
    name: "Riccardo Romano",
    age: "79 anni",
    sex: "M",
    height: "172 cm",
    weight: "76 kg",
    bmi: "25,7",
  },
  context: "Uomo 79 anni, ipertensione + dislipidemia in trattamento. Vive da solo, autosufficiente. Caregiver: figlia Chiara.",
  vitals: { bp: "128/82 (media 7gg)", hr: "68 bpm", temp: "36,4°C", sat: "97%" },
  conditions: [
    "Cardiopatia ipertensiva (2018)",
    "Dislipidemia",
    "Cataratta bilaterale (OD da operare)",
    "Lieve ipoacusia bilaterale",
  ],
  meds: [
    { name: "Bisoprololo", dose: "2,5 mg · 1 cp/die ore 08:00" },
    { name: "Amlodipina", dose: "5 mg · 1 cp/die ore 13:00" },
    { name: "Atorvastatina", dose: "20 mg · 1 cp/die ore 20:00" },
    { name: "Cardioaspirina", dose: "100 mg · 1 cp/die ore 13:00" },
    { name: "Vitamina D", dose: "25.000 UI · 1/sett" },
  ],
  adherence: [
    { drug: "Bisoprololo", pct: 88 },
    { drug: "Amlodipina", pct: 96 },
    { drug: "Atorvastatina", pct: 81 },
    { drug: "Cardioaspirina", pct: 94 },
  ],
  labs: [
    { label: "LDL", value: "112 mg/dL", tone: "warn" as const, ref: "<100" },
    { label: "Glicemia", value: "104 mg/dL", tone: "good" as const, ref: "<110" },
    { label: "Creatinina", value: "1,1 mg/dL", tone: "good" as const, ref: "<1.3" },
    { label: "eGFR", value: "68 mL/min", tone: "warn" as const, ref: ">60" },
  ],
  family: ["Padre: infarto a 72 anni", "Sorella: diabete tipo 2"],
  allergies: "Nessuna nota",
  lifestyle: [
    "Passi: media 3.500/die (target 5.000)",
    "Sonno: 7h, una pausa notturna",
    "Camminata quotidiana al parco con la figlia",
    "Cognitive: MMSE 28/30 (gen 2025)",
  ],
  alerts: [
    "1 dose Bisoprololo non confermata oggi",
    "Aderenza Atorvastatina 81% (in calo)",
    "Visita oculistica + cardiologica nei prossimi 30 gg",
  ],
  doctorAsk: [
    "Impegnativa cardiologico + ECG (rinnovo annuale)",
    "Aumentare Atorvastatina a 40 mg (LDL > target)",
    "Holter 24h preventivo",
    "Verificare interazione ferro/statina",
  ],
};

// ====== Profile-specific log inputs ======
export interface LogTab {
  id: string;
  label: string;
  emoji: string;
  gradient: string;
}

export const logTabsByProfile: Record<ProfileId, LogTab[]> = {
  matteo: [], // baby tabs are hardcoded in Log.tsx
  chiara: [
    { id: "sleep", label: "Sonno", emoji: "🌙", gradient: "gradient-parent" },
    { id: "mood", label: "Umore", emoji: "💭", gradient: "gradient-warm" },
    { id: "cycle", label: "Ciclo", emoji: "🌸", gradient: "gradient-sunset" },
    { id: "vitamin", label: "Vitamine", emoji: "💊", gradient: "gradient-mint" },
    { id: "weight", label: "Peso", emoji: "⚖️", gradient: "gradient-sky" },
  ],
  riccardo: [], // empty per request
  sofia: [], // toddler: tracking flows through chat, not widgets
};

export const languages = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
];

export const upcomingEvents = [
  { id: 1, type: "vaccine", title: "Vaccino esavalente", date: "24 apr", time: "10:30", icon: "💉", color: "pastel-blue" },
  { id: 2, type: "visit", title: "Visita pediatrica 4 mesi", date: "2 mag", time: "16:00", icon: "🩺", color: "pastel-mint" },
  { id: 3, type: "scan", title: "Ecografia cerebrale", date: "12 mag", time: "09:00", icon: "🧠", color: "pastel-lavender" },
];

export const milestones = [
  { id: 1, text: "Romeo ha raggiunto i 3,1 kg", subtext: "3 giorni di crescita costante ✨", new: true },
  { id: 2, text: "Primo sorriso sociale", subtext: "Registrato 4 giorni fa", new: false },
];

export const todayChecklist = [
  { id: "vit-d", label: "Vitamina D in gocce", emoji: "💧", done: true },
  { id: "iron", label: "Gocce di ferro", emoji: "🩸", done: true },
  { id: "weight", label: "Pesare Romeo", emoji: "⚖️", done: true },
  { id: "feedings", label: "Registra le poppate", emoji: "🍼", done: false },
  { id: "wound", label: "Medicazione moncone ombelicale", emoji: "🩹", done: false },
  { id: "tummy", label: "Tummy time (15 min)", emoji: "🤸", done: false },
];

export const recentLogs = [
  { id: 1, type: "feed", time: "14:30", detail: "Biberon · 65 ml · latte materno" },
  { id: 2, type: "diaper", time: "13:55", detail: "Feci · consistenza normale" },
  { id: 3, type: "feed", time: "11:45", detail: "Seno · ~12 min" },
  { id: 4, type: "med", time: "09:00", detail: "Vitamina D · somministrata" },
  { id: 5, type: "weight", time: "08:15", detail: "3,10 kg · +25 g" },
];

export const weightSeries = [
  { day: "L", g: 2980 },
  { day: "M", g: 3010 },
  { day: "M", g: 3035 },
  { day: "G", g: 3050 },
  { day: "V", g: 3055 },
  { day: "S", g: 3075 },
  { day: "D", g: 3100 },
];

export const dischargeLetter = {
  hospital: "TIN — Ospedale Pediatrico Bambino Gesù, Roma",
  date: "26 marzo 2025",
  history:
    "Nato a 31+2 settimane di età gestazionale tramite taglio cesareo d'urgenza per distacco di placenta. APGAR 6/8. Peso alla nascita 1450 g (50° percentile per EG). Degenza in TIN: 47 giorni.",
  growth: {
    weight: { value: "2780 g", percentile: 22, ref: "INeS" },
    length: { value: "47 cm", percentile: 28, ref: "INeS" },
    head: { value: "34,5 cm", percentile: 30, ref: "INeS" },
  },
  labs: ["Hb 11,2 g/dL", "Bilirubina 4,1 mg/dL", "PCR < 0,5", "Ecografia cerebrale: nella norma", "Ecocardio: PFO, no intervento"],
  maternal: "Ipertensione gestazionale trattata con metildopa. Negativa per TORCH, SGB, HIV.",
  issues: ["Lieve anemia della prematurità", "PFO stabile, controllo a 6 mesi", "RGE — pasti piccoli e frequenti"],
  medications: [
    { name: "Vitamina D₃", dose: "400 UI", freq: "Una volta al giorno, orale" },
    { name: "Solfato di ferro", dose: "2 mg/kg", freq: "Una volta al giorno, orale" },
    { name: "Multivitaminico", dose: "0,3 ml", freq: "Una volta al giorno, orale" },
  ],
  nutrition: {
    qualitative:
      "Allattamento misto: latte materno + formula per pretermine fortificata (PreNidina FM 85). 8 pasti/die. Biberon quando l'attacco al seno non è possibile.",
    quantitative: "Apporto target: 150 ml/kg/die · 130 kcal/kg/die · 4,0 g proteine/kg/die",
  },
};

export const bloodTest = {
  hospital: "Laboratorio Analisi — Bambino Gesù",
  date: "8 aprile 2025",
  summary: "Emocromo di controllo post-dimissione · anemia in lieve miglioramento",
  results: [
    { name: "Emoglobina", value: "10,8", unit: "g/dL", range: "10–13", flag: "ok" },
    { name: "Ematocrito", value: "32,4", unit: "%", range: "30–38", flag: "ok" },
    { name: "MCV", value: "82", unit: "fL", range: "80–95", flag: "ok" },
    { name: "Ferritina", value: "38", unit: "ng/mL", range: "30–200", flag: "low" },
    { name: "Reticolociti", value: "2,1", unit: "%", range: "0,5–2,5", flag: "ok" },
    { name: "Bilirubina tot.", value: "1,2", unit: "mg/dL", range: "<1,5", flag: "ok" },
    { name: "PCR", value: "<0,3", unit: "mg/dL", range: "<0,5", flag: "ok" },
  ],
  conclusion:
    "Emoglobina in risalita rispetto alla dimissione (10,8 vs 9,9 g/dL). Continuare terapia marziale. Prossimo controllo tra 4 settimane.",
};

export const neuroExam = {
  hospital: "Neuropsichiatria Infantile — Bambino Gesù",
  date: "10 aprile 2025",
  summary: "Valutazione neurologica e ecografia cerebrale di follow-up",
  findings: [
    { area: "Tono muscolare", value: "Adeguato per età corretta", flag: "ok" },
    { area: "Riflessi primitivi", value: "Presenti e simmetrici (Moro, suzione, prensione)", flag: "ok" },
    { area: "Postura", value: "Simmetrica, controllo del capo in evoluzione", flag: "ok" },
    { area: "Interazione visiva", value: "Fissa e segue, sorriso sociale presente", flag: "ok" },
    { area: "Ecografia transfontanellare", value: "Ventricoli simmetrici, no IVH residua", flag: "ok" },
  ],
  recommendations: [
    "Stimolazione neuromotoria quotidiana — tummy time 3×15 min",
    "Continuare follow-up neurologico ogni 3 mesi nel primo anno",
    "Bilancio dello sviluppo a 6 e 12 mesi di età corretta",
  ],
  conclusion:
    "Sviluppo neurologico nella norma per l'età corretta. Nessun segno di sofferenza. Prosecuzione del follow-up programmato.",
};

// Educational videos curated for Romeo's corrected age (~0–2 months)
export type EduVideo = {
  id: string;
  title: string;
  duration: string;
  category: string;
  emoji: string;
  gradient: string;
  description: string;
  url: string; // external link (YouTube)
  ageBand: string;
  profile?: ProfileId; // if missing → matteo (legacy)
};

export const eduVideos: EduVideo[] = [
  {
    id: "nasal",
    title: "Lavaggio nasale: come farlo bene",
    duration: "2:48",
    category: "Cura",
    emoji: "💧",
    gradient: "gradient-sky",
    description: "Passo per passo con un'infermiera TIN. Posizione, quantità, frequenza.",
    url: "https://www.youtube.com/results?search_query=lavaggi+nasali+neonato+come+fare",
    ageBand: "0–6 mesi",
  },
  {
    id: "breast-positions",
    title: "Le 4 posizioni dell'allattamento",
    duration: "4:12",
    category: "Allattamento",
    emoji: "🤱",
    gradient: "gradient-warm",
    description: "Culla, culla incrociata, sotto al braccio, sdraiata. Quale per quando.",
    url: "https://www.youtube.com/results?search_query=posizioni+allattamento+al+seno",
    ageBand: "0–4 mesi",
  },
  {
    id: "colic-massage",
    title: "Massaggio anti-coliche",
    duration: "3:20",
    category: "Comfort",
    emoji: "🤲",
    gradient: "gradient-mint",
    description: "Tecnica 'I-L-U' sulla pancia per liberare aria e dolore.",
    url: "https://www.youtube.com/results?search_query=massaggio+coliche+neonato",
    ageBand: "0–4 mesi",
  },
  {
    id: "burping",
    title: "Far fare il ruttino dopo la poppata",
    duration: "1:45",
    category: "Allattamento",
    emoji: "🍼",
    gradient: "gradient-baby",
    description: "Tre posizioni sicure. Cosa fare se non arriva.",
    url: "https://www.youtube.com/results?search_query=ruttino+neonato+posizione",
    ageBand: "0–6 mesi",
  },
  {
    id: "tummy-time",
    title: "Tummy time per ex pretermine",
    duration: "3:05",
    category: "Sviluppo",
    emoji: "🤸",
    gradient: "gradient-sunset",
    description: "Come iniziare con dolcezza. Quanto, quando, segnali di stanchezza.",
    url: "https://www.youtube.com/results?search_query=tummy+time+neonato+prematuro",
    ageBand: "0–4 mesi (età corretta)",
  },
  {
    id: "sleep-safe",
    title: "Sonno sicuro: la regola ABC",
    duration: "2:30",
    category: "Sonno",
    emoji: "🌙",
    gradient: "gradient-parent",
    description: "Da soli, A pancia in su, nella propria Culla. Prevenzione SIDS.",
    url: "https://www.youtube.com/results?search_query=sonno+sicuro+neonato+sids",
    ageBand: "0–12 mesi",
  },
  {
    id: "bath",
    title: "Il primo bagnetto a casa",
    duration: "5:10",
    category: "Cura",
    emoji: "🛁",
    gradient: "gradient-sky",
    description: "Temperatura, tempi, sicurezza. Come tenerlo se hai paura.",
    url: "https://www.youtube.com/results?search_query=primo+bagnetto+neonato",
    ageBand: "0–6 mesi",
  },
  {
    id: "umbilical",
    title: "Cura del moncone ombelicale",
    duration: "2:00",
    category: "Cura",
    emoji: "🩹",
    gradient: "gradient-mint",
    description: "Come pulirlo, ogni quanto, segnali a cui fare attenzione.",
    url: "https://www.youtube.com/results?search_query=cura+moncone+ombelicale+neonato",
    ageBand: "0–1 mese",
  },
  // ===== Per Chiara (mamma 35 anni, post-partum) =====
  {
    id: "pp-pelvic",
    title: "Riabilitazione perineale dopo il parto",
    duration: "6:40",
    category: "Recupero",
    emoji: "🌸",
    gradient: "gradient-warm",
    description: "Esercizi guidati settimana per settimana. Sicuri anche se allatti.",
    url: "https://www.youtube.com/results?search_query=riabilitazione+perineale+post+parto",
    ageBand: "Post-partum",
    profile: "chiara",
  },
  {
    id: "pp-mind",
    title: "Baby blues vs depressione post-partum",
    duration: "8:12",
    category: "Mente",
    emoji: "🧠",
    gradient: "gradient-parent",
    description: "Quando è normale, quando chiedere aiuto. Con una psicologa perinatale.",
    url: "https://www.youtube.com/results?search_query=depressione+post+partum+sintomi",
    ageBand: "0–12 mesi post-partum",
    profile: "chiara",
  },
  {
    id: "pp-sleep",
    title: "Dormire meglio quando il bebè non dorme",
    duration: "4:55",
    category: "Sonno",
    emoji: "🌙",
    gradient: "gradient-sky",
    description: "Micro-sonni, igiene del sonno, come riprendersi più in fretta.",
    url: "https://www.youtube.com/results?search_query=sonno+neomamma+strategie",
    ageBand: "Post-partum",
    profile: "chiara",
  },
  {
    id: "pp-nutrition",
    title: "Mangiare bene mentre allatti",
    duration: "5:20",
    category: "Nutrizione",
    emoji: "🥗",
    gradient: "gradient-mint",
    description: "Ferro, omega-3, idratazione. Cosa evitare davvero.",
    url: "https://www.youtube.com/results?search_query=alimentazione+allattamento",
    ageBand: "Allattamento",
    profile: "chiara",
  },
  // ===== Per Riccardo (paziente geriatrico, 79 anni) =====
  {
    id: "ger-bp",
    title: "Misurare la pressione a casa, bene",
    duration: "3:15",
    category: "Cardio",
    emoji: "❤️",
    gradient: "gradient-warm",
    description: "Posizione del braccio, orari, come annotare. Errori comuni.",
    url: "https://www.youtube.com/results?search_query=misurare+pressione+arteriosa+casa",
    ageBand: "65+",
    profile: "riccardo",
  },
  {
    id: "ger-balance",
    title: "Esercizi anti-caduta per over 70",
    duration: "7:30",
    category: "Movimento",
    emoji: "🚶",
    gradient: "gradient-mint",
    description: "5 esercizi di equilibrio da fare tutti i giorni in salotto.",
    url: "https://www.youtube.com/results?search_query=esercizi+anziani+prevenzione+cadute",
    ageBand: "65+",
    profile: "riccardo",
  },
  {
    id: "ger-meds",
    title: "Gestire 5+ farmaci senza sbagliare",
    duration: "4:40",
    category: "Terapia",
    emoji: "💊",
    gradient: "gradient-sky",
    description: "Schema settimanale, interazioni, cosa fare se salti una dose.",
    url: "https://www.youtube.com/results?search_query=gestione+politerapia+anziano",
    ageBand: "65+",
    profile: "riccardo",
  },
  {
    id: "ger-memory",
    title: "Allenare la memoria ogni giorno",
    duration: "5:10",
    category: "Mente",
    emoji: "🧠",
    gradient: "gradient-parent",
    description: "Giochi e abitudini per mantenere la mente attiva e prevenire il declino.",
    url: "https://www.youtube.com/results?search_query=allenare+memoria+anziani",
    ageBand: "65+",
    profile: "riccardo",
  },
  // ===== Per Sofia (toddler 3 anni) =====
  {
    id: "tod-fever",
    title: "Febbre nel bambino: quando preoccuparsi davvero",
    duration: "5:40",
    category: "Cura",
    emoji: "🌡️",
    gradient: "gradient-warm",
    description: "Soglie reali, cosa serve e cosa no, segnali che richiedono il pediatra.",
    url: "https://www.youtube.com/results?search_query=febbre+bambino+quando+preoccuparsi",
    ageBand: "1–6 anni",
    profile: "sofia",
  },
  {
    id: "tod-tantrum",
    title: "Capricci a 3 anni: come gestirli senza esplodere",
    duration: "6:20",
    category: "Comportamento",
    emoji: "💢",
    gradient: "gradient-sunset",
    description: "Cosa succede nel cervello di un toddler e cosa fare nei 90 secondi cruciali.",
    url: "https://www.youtube.com/results?search_query=capricci+bambino+3+anni+gestione",
    ageBand: "2–4 anni",
    profile: "sofia",
  },
  {
    id: "tod-sleep",
    title: "Sonno del bambino in età prescolare",
    duration: "4:30",
    category: "Sonno",
    emoji: "🌙",
    gradient: "gradient-parent",
    description: "Quante ore servono, routine serale, paure notturne. Cosa è normale.",
    url: "https://www.youtube.com/results?search_query=sonno+bambino+3+anni+routine",
    ageBand: "2–5 anni",
    profile: "sofia",
  },
  {
    id: "tod-teeth",
    title: "Spazzolino e prima visita dal dentista",
    duration: "3:50",
    category: "Igiene",
    emoji: "🦷",
    gradient: "gradient-sky",
    description: "Tecnica per i più piccoli, quanto dentifricio e cosa aspettarsi alla prima visita.",
    url: "https://www.youtube.com/results?search_query=spazzolino+bambini+3+anni",
    ageBand: "1–6 anni",
    profile: "sofia",
  },
  {
    id: "tod-language",
    title: "Sviluppo del linguaggio a 3 anni",
    duration: "5:10",
    category: "Sviluppo",
    emoji: "🗣️",
    gradient: "gradient-mint",
    description: "Cosa dovrebbe già dire, quando rivolgersi a un logopedista, come stimolare il linguaggio in casa.",
    url: "https://www.youtube.com/results?search_query=sviluppo+linguaggio+bambino+3+anni",
    ageBand: "2–4 anni",
    profile: "sofia",
  },
  {
    id: "tod-nutrition",
    title: "Alimentazione del bambino in età prescolare",
    duration: "5:30",
    category: "Nutrizione",
    emoji: "🥦",
    gradient: "gradient-mint",
    description: "Porzioni reali, neofobia alimentare, come gestire chi 'non mangia niente'.",
    url: "https://www.youtube.com/results?search_query=alimentazione+bambini+3+anni",
    ageBand: "1–6 anni",
    profile: "sofia",
  },
  // ===== Pregnancy mode (Chiara when pregnant) =====
  {
    id: "preg-pelvic",
    title: "Pavimento pelvico in gravidanza: esercizi sicuri",
    duration: "6:10",
    category: "Corpo",
    emoji: "🌸",
    gradient: "gradient-warm",
    description: "Sequenza guidata adatta a tutti i trimestri. Riduce il rischio di incontinenza post-parto.",
    url: "https://www.youtube.com/results?search_query=esercizi+pavimento+pelvico+gravidanza",
    ageBand: "Tutti i trimestri",
  },
  {
    id: "preg-nutrition",
    title: "Cosa mangiare (e cosa evitare) in gravidanza",
    duration: "7:00",
    category: "Nutrizione",
    emoji: "🥗",
    gradient: "gradient-mint",
    description: "Ferro, folati, omega-3, calcio. Toxo, listeria: cosa contare davvero.",
    url: "https://www.youtube.com/results?search_query=alimentazione+in+gravidanza",
    ageBand: "Tutti i trimestri",
  },
  {
    id: "preg-redflag",
    title: "Segnali da non ignorare in gravidanza",
    duration: "4:40",
    category: "Sicurezza",
    emoji: "⚠️",
    gradient: "gradient-sunset",
    description: "Sanguinamento, contrazioni regolari, riduzione movimenti, edemi acuti. Cosa fare e quando.",
    url: "https://www.youtube.com/results?search_query=segnali+allarme+gravidanza",
    ageBand: "Tutti i trimestri",
  },
  {
    id: "preg-birth",
    title: "Come si riconosce il vero travaglio",
    duration: "5:30",
    category: "Parto",
    emoji: "👶",
    gradient: "gradient-baby",
    description: "Differenza tra Braxton-Hicks e contrazioni vere. Quando andare in ospedale.",
    url: "https://www.youtube.com/results?search_query=riconoscere+travaglio",
    ageBand: "3° trimestre",
  },
  {
    id: "preg-bag",
    title: "La valigia per l'ospedale, passo per passo",
    duration: "4:20",
    category: "Pratico",
    emoji: "🎒",
    gradient: "gradient-sky",
    description: "Cosa serve davvero per te e il neonato. Niente liste impossibili.",
    url: "https://www.youtube.com/results?search_query=valigia+ospedale+parto",
    ageBand: "3° trimestre",
  },
];

// ===== Pregnancy mode dashboard for Chiara (mock: week 24) =====
export const chiaraPregnancyDashboard: ProfileDashboard = {
  hero: { value: "Settimana 24", label: "2° trimestre · -16 settimane al parto", ringPercentile: 60, ringLabel: "gravidanza · 24/40 sett.", hideRing: true },
  metrics: [
    { label: "Peso", value: "68,2 kg", sub: "+4,2 kg dall'inizio", gradient: "gradient-warm" },
    { label: "Pressione", value: "118/74", sub: "media 7 gg", gradient: "gradient-mint" },
    { label: "Movimenti", value: "Regolari", sub: "sentiti oggi", gradient: "gradient-sunset" },
  ],
  whisper: {
    title: "Ciao Chiara 💛",
    body: "Sei alla settimana 24 — è il momento del test di tolleranza al glucosio. Vuoi che ti spieghi cos'è e come prepararti?",
    cta: "Parla con Palm",
  },
  upcoming: [
    { id: 1, title: "Ecografia morfologica", date: "18 mag", time: "10:30", icon: "🤰", color: "pastel-lavender", location: "Ginecologia · dr.ssa Conti", prep: "Vescica semi-piena · porta esami precedenti" },
    { id: 2, title: "Curva da carico glucosio (OGTT)", date: "26 mag", time: "08:00", icon: "🧪", color: "pastel-mint", location: "Lab. Centrale · via del Tritone 90", prep: "Digiuno da 8 ore · 3 prelievi nell'arco di 2h" },
    { id: 3, title: "Corso preparto · 1° incontro", date: "4 giu", time: "18:00", icon: "🧘", color: "pastel-blue", location: "Consultorio ASL · via dei Mille 12", prep: "Indossa abiti comodi · porta cuscino" },
  ],
  recent: [
    { id: 1, time: "21:10", detail: "Movimenti fetali · attivi 15 minuti" },
    { id: 2, time: "08:00", detail: "Acido folico + ferro · presi" },
    { id: 3, time: "ieri", detail: "Peso · 68,2 kg (+0,4 kg sett.)" },
    { id: 4, time: "ieri", detail: "Pressione · 116/72 mmHg" },
  ],
  trend: {
    label: "Peso ultime 7 sett.",
    tag: "Atteso",
    series: [
      { day: "18", v: 66.8 }, { day: "19", v: 67.1 }, { day: "20", v: 67.3 },
      { day: "21", v: 67.6 }, { day: "22", v: 67.8 }, { day: "23", v: 68.0 }, { day: "24", v: 68.2 },
    ],
  },
  featuredVideoId: "preg-pelvic",
};

// Extended pediatric anamnesis — for the doctor briefing
export const anamnesis = {
  dailyLimitations: { has: false, note: "Nessuna limitazione rispetto ai coetanei (età corretta)." },
  transplants: { has: false, note: "Nessun trapianto." },
  medicalDevices: { has: false, note: "Nessun dispositivo o ausilio in uso." },
  allergies: { has: false, note: "Nessuna allergia nota a farmaci, alimenti o insetti." },
  majorConditions: { has: false, note: "Nessuna patologia importante in atto (asma, epilessia, diabete, cardiopatie)." },
  regularTherapies: {
    has: true,
    items: ["Vitamina D₃ 400 UI/die", "Solfato di ferro 2 mg/kg/die", "Multivitaminico 0,3 ml/die"],
  },
  familyHistory: {
    has: true,
    items: [
      "Fratello maggiore: displasia dell'anca",
      "Padre: celiachia",
      "Madre: ipertensione gestazionale",
    ],
  },
};

// At-a-glance briefing for the printable PDF (concise, doctor-facing)
export const doctorBrief = {
  ageChronological: "2 mesi 3 giorni",
  ageCorrected: "18 giorni (nato a 31+2 sett.)",
  birth: {
    mode: "Taglio cesareo d'urgenza",
    term: "Pretermine — 31+2 settimane EG",
    apgar: "6/8",
    ninuStay: "47 giorni in TIN",
  },
  vaccines: {
    done: ["Epatite B (nascita)", "BCG non eseguito"],
    next: "Esavalente + Pneumococco — 24 apr 2025",
  },
  erVisits: [
    { date: "2 apr 2025", reason: "Iperbilirubinemia di controllo — dimesso stesso giorno" },
  ],
  daycare: { attends: false, note: "Non frequenta nido (età corretta 18 gg)" },
  weight: {
    current: { value: 3100, unit: "g", percentile: 25, date: "19 apr 2025" },
    birth: { value: 1450, unit: "g", percentile: 50, date: "7 feb 2025" },
    discharge: { value: 2780, unit: "g", percentile: 22, date: "26 mar 2025" },
    reference: "Curva INeS — pretermine",
  },
  feeding: {
    type: "Misto: latte materno + formula pretermine fortificata (PreNidina FM 85)",
    mlPerKgDie: 148,
    kcalPerKgDie: 128,
    proteinGPerKgDie: 3.8,
    notes: "8 pasti/die · biberon quando attacco al seno non possibile",
  },
  ongoingTherapy: [
    "Vitamina D₃ 400 UI/die",
    "Solfato di ferro 2 mg/kg/die",
    "Multivitaminico 0,3 ml/die",
  ],
  openIssuesSinceDischarge: [
    { issue: "PFO", plan: "Ecocardio di controllo a 6 mesi" },
    { issue: "RGE", plan: "Sola terapia nutrizionale (pasti piccoli e frequenti)" },
    { issue: "Anemia della prematurità", plan: "In terapia marziale, controllo Hb in 4 settimane" },
  ],
  currentProblems: [
    {
      problem: "Congestione nasale (riferita dalla mamma)",
      detail: "Già 2 lavaggi nasali/die",
      palmTip: "Consigliare umidificatore in camera (40–60% UR)",
    },
    {
      problem: "Rigurgiti dopo 2 pasti su 6",
      detail: "Non vomito, non sintomi ascrivibili a peggioramento RGE; alvo più frequente",
      palmTip: "Fratello con gastroenterite recente — valutare se prescrivere probiotici",
    },
  ],
  relevantHistory: [
    "Fratello maggiore: displasia dell'anca",
    "Familiarità per celiachia (lato paterno)",
    "Nato 31+2 sett., degenza TIN 47 gg",
  ],
  doctorReminders: [
    "Impegnativa per ecocardio (controllo PFO a 6 mesi)",
    "Impegnativa per visita oculistica (screening ROP follow-up)",
    "Prescrizione ferro (continuare terapia marziale)",
  ],
};

// Mock Palm Doctors available for video consult
export type PalmDoctor = {
  id: string;
  name: string;
  specialty: string;
  availableIn: string;
  emoji: string;
  forProfiles: ProfileId[];
  // Optional keyword tags — if any tag matches the chat transcript, this doctor
  // is boosted to the top of the suggestion list.
  tags?: string[];
};

export const palmDoctors: PalmDoctor[] = [
  // ── Pediatric (Romeo) ──────────────────────────────────────────────
  { id: "rossi", name: "Dr.ssa Elena Rossi", specialty: "Pediatra · ex TIN Bambino Gesù", availableIn: "12 min", emoji: "👩‍⚕️", forProfiles: ["matteo"], tags: ["pretermine", "tin", "neonato", "crescita", "peso"] },
  { id: "marini", name: "Dr. Luca Marini", specialty: "Neonatologo · 18 anni esperienza", availableIn: "26 min", emoji: "👨‍⚕️", forProfiles: ["matteo"], tags: ["respir", "apnee", "reflusso", "neonato"] },
  { id: "ferri", name: "Dr.ssa Sara Ferri", specialty: "Pediatra · IBCLC allattamento", availableIn: "40 min", emoji: "👩‍⚕️", forProfiles: ["matteo"], tags: ["allatt", "latte", "seno", "formula", "poppata"] },

  // ── Adult (Chiara, 35 — post-partum) ───────────────────────────────
  { id: "romano", name: "Dr.ssa Giulia Romano", specialty: "Ginecologa · post-partum & contraccezione", availableIn: "18 min", emoji: "👩‍⚕️", forProfiles: ["chiara"], tags: ["ciclo", "mestru", "contracc", "post-partum", "perineo", "dolore pelvic"] },
  { id: "deluca", name: "Dr.ssa Anna De Luca", specialty: "Psicologa perinatale · baby blues & ansia", availableIn: "32 min", emoji: "👩‍⚕️", forProfiles: ["chiara"], tags: ["ansia", "tristezza", "baby blues", "umore", "stanc", "esaurit", "sonno"] },
  { id: "conti-mmg", name: "Dr. Marco Conti", specialty: "Medico di base · medicina della donna", availableIn: "55 min", emoji: "👨‍⚕️", forProfiles: ["chiara"], tags: ["ferro", "anemia", "vitamin", "esami", "stanc"] },
  { id: "bianchi-nutr", name: "Dr.ssa Laura Bianchi", specialty: "Nutrizionista · allattamento & recupero", availableIn: "1 h 10 min", emoji: "👩‍⚕️", forProfiles: ["chiara"], tags: ["dieta", "alimentaz", "peso", "allatt", "ferro"] },

  // ── Geriatric (Riccardo, 79 — cardio + diabete + IRC) ───────────────
  { id: "lombardi", name: "Dr. Paolo Lombardi", specialty: "Geriatra · politerapia & fragilità", availableIn: "20 min", emoji: "👨‍⚕️", forProfiles: ["riccardo"], tags: ["pressione", "farmaci", "terapia", "cadut", "memoria", "sonno"] },
  { id: "esposito", name: "Dr.ssa Maria Esposito", specialty: "Cardiologa · scompenso & ipertensione", availableIn: "45 min", emoji: "👩‍⚕️", forProfiles: ["riccardo"], tags: ["pressione", "cuore", "fiato", "palpit", "tachic", "dolore toracico", "edemi"] },
  { id: "greco-diab", name: "Dr. Stefano Greco", specialty: "Diabetologo · diabete tipo 2 nell'anziano", availableIn: "1 h 5 min", emoji: "👨‍⚕️", forProfiles: ["riccardo"], tags: ["glicemi", "diabete", "metformin", "zucchero", "hba1c"] },
  { id: "ricci-nefro", name: "Dr.ssa Elena Ricci", specialty: "Nefrologa · insufficienza renale cronica", availableIn: "2 h", emoji: "👩‍⚕️", forProfiles: ["riccardo"], tags: ["rene", "creatinin", "egfr", "urina"] },
];
