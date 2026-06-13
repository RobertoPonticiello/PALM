import { useLanguage, type LangCode } from "@/hooks/useLanguage";
import type { ProfileId } from "@/lib/mockData";
import { EN_MAP } from "./i18nDict";

/**
 * Small, profile-aware i18n.
 *
 * Round 2 scope: only the BABY profile (Romeo) gets a real Arabic
 * translation + RTL. Other profiles + other languages still render in
 * Italian — by design, the user asked for an RTL demo on Romeo only.
 *
 * For any (lang, key) we don't have a translation for, we gracefully
 * fall back to the Italian source string.
 */

type Dict = Record<string, string>;

// Italian source = the keys; we only need to translate to other langs.
const IT: Dict = {};

const AR_ROMEO: Dict = {
  // top bar
  "Il tuo piccolo": "صغيرك",
  "Romeo": "روميو",
  "il tuo piccolo": "صغيرك",
  // hero
  "Peso attuale": "الوزن الحالي",
  "° percentile · nella norma": "° مئوي · ضمن المعدل الطبيعي",
  // chat bar
  "Chiedi a Palm": "اسأل بالم",
  "Palm conosce Romeo, le terapie e gli appuntamenti":
    "بالم يعرف روميو والعلاجات والمواعيد",
  // milestones
  "Traguardo": "إنجاز",
  "Festeggia 🎉": "احتفل 🎉",
  "Più tardi": "لاحقًا",
  "Romeo ha raggiunto i 3,1 kg": "وصل روميو إلى 3.1 كجم",
  "3 giorni di crescita costante ✨": "3 أيام من النمو المستمر ✨",
  // sections
  "Prossimi appuntamenti": "المواعيد القادمة",
  "Tutti": "الكل",
  "Attività recente": "النشاط الأخير",
  "Da preparare": "للتحضير",
  "Aggiornato in tempo reale": "محدّث في الوقت الفعلي",
  // bottom nav
  "Casa": "الرئيسية",
  "Impara": "تعلّم",
  "Registra": "تسجيل",
  "Docs": "ملفات",
  "Report": "تقرير",
  // educational suggestion
  "Palm consiglia oggi": "بالم يوصي اليوم",
  // events
  "Vaccino esavalente": "اللقاح السداسي",
  "Visita pediatrica 4 mesi": "فحص الأطفال – 4 أشهر",
  "Ecografia cerebrale": "تصوير الدماغ بالموجات فوق الصوتية",
  // metric labels (cards) — match exact source case from mockData
  "Lunghezza": "الطول",
  "Testa": "محيط الرأس",
  "Poppate oggi": "رضعات اليوم",
  "in linea": "ضمن المسار",
  "30° perc.": "٣٠° مئوي",
  "28° perc.": "٢٨° مئوي",
  "49 cm": "٤٩ سم",
  "35,5 cm": "٣٥٫٥ سم",
  "7 / 8": "٧ / ٨",
  // hero copy
  "3,10 kg": "٣٫١٠ كجم",
  "+120 g questa settimana · in linea con la traiettoria":
    "+١٢٠ غرام هذا الأسبوع · ضمن مسار النمو",
  // trend chart
  "Peso ultimi 7 giorni": "الوزن آخر ٧ أيام",
  "Costante": "ثابت",
  // floating chat bar
  "Scrivi a Palm…": "اكتب إلى بالم…",
  "Sempre con te": "دائمًا معك",
  // upcoming dates / details (match exact source from mockData)
  "ASL Roma 1 · via Ariosto 3": "وحدة الصحة المحلية روما ١ · شارع أريوستو ٣",
  "Libretto vaccinale + tessera sanitaria": "دفتر التطعيم + البطاقة الصحية",
  "Studio Dr.ssa Bianchi": "عيادة د. بيانكي",
  "Diario poppate ultimi 7 gg": "يوميات الرضاعة آخر ٧ أيام",
  "Bambino Gesù · Piazza S. Onofrio 4": "مستشفى الطفل يسوع · ساحة س. أونوفريو ٤",
  "Romeo a digiuno da 2h, ciuccio + copertina":
    "روميو صائم لساعتين، اللهاية + بطانية",
  // recent activity
  "Biberon · 65 ml · latte materno": "زجاجة · ٦٥ مل · حليب الأم",
  "Pannolino · pipì + feci normali": "حفاض · بول + براز طبيعي",
  "Seno · ~12 min": "رضاعة طبيعية · ~١٢ دقيقة",
  "Vitamina D · somministrata": "فيتامين د · تم إعطاؤه",
  // misc
  "Chiara": "كيارا",

  // ── Documents tab ─────────────────────────────────────────────────
  "Libreria": "المكتبة",
  "Documenti · Romeo": "ملفات · روميو",
  "Tutto in un posto sereno.": "كل شيء في مكان هادئ.",
  "Carichi un documento, Palm lo conserva originale e te lo spiega. Poi puoi farle domande sui valori.":
    "ترفع المستند، يحفظه بالم بالأصل ويشرحه لك. ثم يمكنك طرح أسئلة حول القيم.",
  "Carica un documento": "ارفع مستندًا",
  "PDF, foto o scansione · Palm lo salva in originale e te lo spiega in italiano semplice":
    "PDF أو صورة أو مسح ضوئي · يحفظه بالم بالأصل ويشرحه لك ببساطة",
  "Spiegati da Palm": "شرحها بالم",
  "Originali · 3 file": "الأصلية · ٣ ملفات",
  "🔒 I file originali sono custoditi cifrati. Puoi scaricarli o condividerli con un medico in un tap.":
    "🔒 الملفات الأصلية محفوظة مشفّرة. يمكنك تنزيلها أو مشاركتها مع طبيب بضغطة واحدة.",
  "Lettera di dimissione TIN": "خطاب الخروج من العناية المركزة لحديثي الولادة",
  "Bambino Gesù · 26 mar 2025": "مستشفى الطفل يسوع · ٢٦ مارس ٢٠٢٥",
  "Emocromo di controllo": "تحليل دم متابعة",
  "Bambino Gesù · 8 apr 2025": "مستشفى الطفل يسوع · ٨ أبريل ٢٠٢٥",
  "Visita neurologica + ecografia": "فحص أعصاب + تصوير بالموجات فوق الصوتية",
  "Bambino Gesù · 10 apr 2025": "مستشفى الطفل يسوع · ١٠ أبريل ٢٠٢٥",
  "Estratta": "مستخلصة",
  "Documento": "مستند",

  // ── Learn tab ─────────────────────────────────────────────────────
  "Video per Romeo": "فيديوهات لروميو",
  "Palm ha scelto per Romeo": "اختار بالم لروميو",
  "Selezionati per età corretta:": "مختارة حسب العمر المصحح:",
  "0 mesi e 18 giorni": "٠ أشهر و ١٨ يومًا",
  "Niente video generici. Solo cose che servono ora a te e a Romeo — riviste con i nostri Palm Doctors.":
    "لا فيديوهات عامة. فقط ما تحتاجين إليه أنت وروميو الآن — تمت مراجعتها مع أطباء بالم.",
  "In primo piano": "مميّز",
  "Apri video": "افتح الفيديو",
  "Curato dal team Palm · revisionato da pediatri, ginecologi e geriatri":
    "بإشراف فريق بالم · مراجعة من أطباء أطفال ونساء وكبار السن",
  "Nessun video in questa categoria.": "لا توجد فيديوهات في هذه الفئة.",

  // ── Log / Registra tab ────────────────────────────────────────────
  "In un tap": "بضغطة واحدة",
  "Peso": "الوزن",
  "Pasto": "وجبة",
  "Pannolino": "حفاض",
  "Rigurgito": "تجشؤ",
  "Farmaci": "أدوية",
  "Peso di oggi": "وزن اليوم",
  "Registra peso": "سجل الوزن",
  "Bellissimo": "رائع",
  "3 giorni di crescita costante.": "٣ أيام من النمو المستمر.",
  "Romeo è al 25° percentile, perfettamente in linea con la traiettoria di dimissione.":
    "روميو في الشريحة المئوية ٢٥، تمامًا ضمن مسار الخروج من المستشفى.",
  "Metodo": "الطريقة",
  "Seno": "رضاعة طبيعية",
  "Biberon": "زجاجة",
  "Sondino": "أنبوب",
  "Tipo di latte": "نوع الحليب",
  "Latte materno": "حليب الأم",
  "Formulato": "صناعي",
  "Timer poppata": "مؤقت الرضاعة",
  "Sinistro": "أيسر",
  "Destro": "أيمن",
  "Quantità": "الكمية",
  "Registra pasto · ora": "سجل الوجبة · الآن",
  "Tipo di pannolino": "نوع الحفاض",
  "Pipì": "بول",
  "Cacca": "براز",
  "Entrambi": "كلاهما",
  "Consistenza": "القوام",
  "Acquosa": "مائي",
  "Morbida": "ليّن",
  "Normale": "طبيعي",
  "Soda": "صلب",
  "Dura": "قاسٍ",
  "Mucosa": "مخاطي",
  "Registra pannolino": "سجل الحفاض",

  // ── Report tab ────────────────────────────────────────────────────
  "Briefing visita": "ملخص الزيارة",
  "Per la Dr.ssa Bianchi": "للدكتورة بيانكي",
  "Riassunto in 30 secondi": "ملخص في ٣٠ ثانية",
  "Punti di attenzione": "نقاط الانتباه",
  "Anamnesi essenziale": "تاريخ مرضي أساسي",
  "Farmaci e terapie regolari": "أدوية وعلاجات منتظمة",
  "Patologie familiari rilevanti": "أمراض عائلية ذات صلة",
  "Crescita tra visite": "النمو بين الزيارات",
  "Alimentazione · ultimi 7 giorni": "التغذية · آخر ٧ أيام",
  "Intestino e rigurgiti": "الأمعاء والتجشؤ",
  "Aderenza terapia": "الالتزام بالعلاج",
  "Sintomi registrati": "الأعراض المسجلة",
  "Esporta PDF at-a-glance per il pediatra": "صدّر PDF موجز لطبيب الأطفال",
  "Condividi link vista completa": "شارك رابط العرض الكامل",

  // ── Log tab — extra strings ──────────────────────────────────────
  "kg · ": "كجم · ",
  " g": " غ",
  "Quanto è uscito?": "كم خرج؟",
  "Goccia": "قطرة",
  "appena una goccia": "بالكاد قطرة",
  "Piccolo": "قليل",
  "un cucchiaino": "ملعقة صغيرة",
  "Medio": "متوسط",
  "un cucchiaio": "ملعقة كبيرة",
  "Tanto": "كثير",
  "tutto il pasto": "الوجبة كاملة",
  "Registra rigurgito": "سجّل التجشؤ",
  "Farmaci di oggi · tocca quando dato": "أدوية اليوم · اضغط عند الإعطاء",
  "Vitamina D₃": "فيتامين د₃",
  "400 UI": "٤٠٠ وحدة",
  "Solfato di ferro": "كبريتات الحديد",
  "2 mg/kg": "٢ ملغ/كغ",
  "Multivitaminico": "متعدد الفيتامينات",
  "0,3 ml": "٠٫٣ مل",
  "Dato": "أُعطي",
  "Da dare": "للإعطاء",
  "Tocca un seno per avviare/mettere in pausa · totale": "اضغط على الثدي للبدء/الإيقاف · المجموع",
  "reset": "تصفير",

  // ── Report tab — extra strings ──────────────────────────────────
  "Per la Dr.ssa": "للدكتورة",
  "Vista link completo": "العرض الكامل",
  "questo è ciò che vede il pediatra aprendo il link condiviso. Per la stampa o l'invio email, esporta il":
    "هذا ما يراه طبيب الأطفال عند فتح الرابط. للطباعة أو الإرسال بالبريد، صدّر",
  "PDF at-a-glance": "PDF موجز",
  "in fondo.": "في الأسفل.",
  "Visita · 2 mag 2025 · 16:00": "الزيارة · ٢ مايو ٢٠٢٥ · ١٦:٠٠",
  "In sintesi —": "باختصار —",
  "Crescita costante in traiettoria. Tolleranza alimentare ottima.":
    "نمو ثابت ضمن المسار. تحمّل غذائي ممتاز.",
  "2 episodi di rigurgito ↑ questa settimana": "حالتا تجشؤ ↑ هذا الأسبوع",
  ", per il resto nulla da segnalare. Aderenza terapia 96%.":
    "، خلاف ذلك لا يوجد ما يُذكر. الالتزام بالعلاج ٩٦٪.",
  "Rigurgiti in aumento": "تجشؤ متزايد",
  "6 negli ultimi 7g vs 2 settimana precedente": "٦ في آخر ٧ أيام مقابل ٢ الأسبوع السابق",
  "Aumento di peso costante": "زيادة وزن ثابتة",
  "+25 g/giorno · nel target": "+٢٥ غ/يوم · ضمن الهدف",
  "Aderenza Vitamina D": "الالتزام بفيتامين د",
  "7/7 giorni": "٧/٧ أيام",
  "Limitazioni attività vs coetanei": "قيود النشاط مقارنة بالأقران",
  "Trapianti": "زراعة الأعضاء",
  "Dispositivi medici / ausili": "أجهزة/معينات طبية",
  "Allergie (farmaci, alimenti, insetti)": "حساسية (أدوية، أطعمة، حشرات)",
  "Patologie importanti (asma, epilessia, diabete, cardiopatie)":
    "أمراض مهمة (ربو، صرع، سكري، أمراض قلب)",
  "Sì": "نعم",
  "No": "لا",
  "Tutti i parametri nelle fasce di riferimento INeS.":
    "كل القياسات ضمن النطاق المرجعي.",
  "Pasti/giorno": "وجبات/يوم",
  "Intake medio": "المتوسط الغذائي",
  "Tipo": "النوع",
  "Scariche/giorno": "تبرّز/يوم",
  "Rigurgiti/giorno": "تجشؤ/يوم",
  "Volume": "الكمية",
  "Vitamina D₃ 400 UI": "فيتامين د₃ ٤٠٠ وحدة",

  // ── Doctor flow / chat ──────────────────────────────────────────
  "Chiedi a Palm su questi valori": "اسأل بالم عن هذه القيم",
  "Hai una domanda?": "لديك سؤال؟",
  "Originale custodito": "الأصل محفوظ",
  "Il PDF originale è cifrato e sempre tuo. Scaricalo o condividilo con un medico in un tap.":
    "الملف الأصلي مشفّر ودائمًا ملك لك. حمّله أو شاركه مع طبيب بضغطة واحدة.",
  "Scegli un Palm Doctor": "اختر طبيب بالم",
  "Videoconsulto di 15 minuti. Il medico riceverà in automatico il riassunto della tua chat con Palm, così può aiutarti subito senza ripartire da zero.":
    "استشارة فيديو ١٥ دقيقة. سيتلقّى الطبيب ملخّص محادثتك مع بالم تلقائيًا ليساعدك فورًا دون البدء من الصفر.",
  "← Torna alla chat": "← العودة إلى المحادثة",
  "Disponibile in": "متاح خلال",
  "Servizio extra a pagamento.": "خدمة إضافية مدفوعة.",
  "Vedrai il prezzo finale prima di confermare.": "سترى السعر النهائي قبل التأكيد.",
  "Con quale medico vuoi parlare?": "مع أي طبيب تريد التحدث؟",
  "Scegli e ti mostro chi è disponibile adesso. Le domande di screening arrivano dopo, in 30 secondi.":
    "اختر وسأعرض لك من هو متاح الآن. أسئلة الفحص تأتي لاحقًا في ٣٠ ثانية.",
  "Pediatra": "طبيب أطفال",
  "per Romeo o per dubbi sui bambini": "لروميو أو لأي استفسار حول الأطفال",
  "Medico di base": "طبيب الأسرة",
  "salute generale, ricette, dubbi quotidiani": "صحة عامة، وصفات، استفسارات يومية",
  "Specialista": "أخصائي",
  "ginecologa, cardiologo, dermatologa…": "طبيبة نساء، طبيب قلب، طبيبة جلدية…",
  "Non sono sicura": "لست متأكدة",
  "Mostrami tutti i medici disponibili ora": "أرني جميع الأطباء المتاحين الآن",
  "Conferma il consulto": "تأكيد الاستشارة",
  "← Cambia medico": "← غيّر الطبيب",
  "In": "خلال",
  "Riassunto che invieremo al medico": "الملخص الذي سنرسله للطبيب",
  "Videochiamata": "مكالمة فيديو",
  "15 minuti · Palm Doctor": "١٥ دقيقة · طبيب بالم",
  "Continua · 4 domande veloci": "متابعة · ٤ أسئلة سريعة",
  "Palm fa qualche domanda di screening così il medico arriva preparato. Pagamento alla fine.":
    "يطرح بالم بعض أسئلة الفحص ليصل الطبيب مستعدًا. الدفع في النهاية.",
  "Screening pre-visita · generato da Palm": "فحص ما قبل الزيارة · أعدّه بالم",
  "Qualche domanda veloce": "بعض الأسئلة السريعة",
  "Le risposte arrivano a": "الإجابات تصل إلى",
  "prima del videoconsulto, insieme al riassunto del profilo. Così non si parte da zero.":
    "قبل الاستشارة بالفيديو، مع ملخص الملف. حتى لا نبدأ من الصفر.",
  "Palm sta preparando le domande giuste per te…": "بالم يُعدّ الأسئلة المناسبة لك…",
  "← Torna indietro": "← رجوع",
  "Invio al medico…": "جارٍ الإرسال للطبيب…",
  "Prenota e paga": "احجز وادفع",
  "Tutto pronto per il videoconsulto": "كل شيء جاهز لاستشارة الفيديو",
  "Rispondi a tutte le domande per continuare": "أجب على جميع الأسئلة للمتابعة",
  "Tutto pronto.": "كل شيء جاهز.",
  "Cosa succede ora": "ما الذي يحدث الآن",
  "Hai ricevuto un'email di conferma": "تلقيت بريد تأكيد",
  "Il medico ha già il tuo briefing": "الطبيب لديه ملخصك بالفعل",
  "Notifica 2 minuti prima dell'appuntamento": "إشعار قبل الموعد بدقيقتين",
  "Chiudi": "إغلاق",
  "Sempre qui per te": "دائمًا هنا لأجلك",
  "Palm offre": "يقدّم بالم",
  "supporto educativo e informativo": "دعمًا تعليميًا ومعلوماتيًا",
  ". Non fornisce diagnosi né terapie.": ". لا يقدّم تشخيصًا ولا علاجًا.",
  "Per sintomi gravi o urgenti contatta il pediatra o il 118.":
    "للأعراض الشديدة أو العاجلة تواصل مع طبيب الأطفال أو الطوارئ ١١٨.",
  "Scrivi un messaggio a Palm…": "اكتب رسالة إلى بالم…",
  "Premi Invio per inviare · Shift+Invio per andare a capo":
    "اضغط Enter للإرسال · Shift+Enter لسطر جديد",
  "Come ti senti ora?": "كيف تشعر الآن؟",
  "Mi basta così, grazie Palm": "يكفيني هذا، شكرًا بالم",
  "Voglio il parere di un medico Palm": "أريد رأي طبيب بالم",
  "Sessione chiusa con serenità": "أُغلقت الجلسة بسلام",
  "Più adatto a te": "الأنسب لك",
};

// Map: (lang, profileId) -> dictionary
const TABLE: Partial<Record<LangCode, Partial<Record<ProfileId, Dict>>>> = {
  it: {},
  ar: {
    matteo: AR_ROMEO,
  },
};

export function translate(
  lang: LangCode,
  profileId: ProfileId,
  key: string,
): string {
  if (lang === "en") return EN_MAP[key] ?? key;
  const langTable = TABLE[lang];
  if (!langTable) return key;
  const dict = langTable[profileId];
  if (!dict) return key;
  return dict[key] ?? key;
}

/** Reactive translate hook bound to the active language + given profile. */
export function useT(profileId: ProfileId) {
  const { lang, isRtl } = useLanguage();
  const t = (key: string) => translate(lang, profileId, key);
  return { t, lang, isRtl };
}