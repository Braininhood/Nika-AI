import { listeningBlock } from "./helpers";

/** Accent + locale rotation — original OET-style scripts (Layer B). */
export const ACCENT_LISTENING_BLOCKS = [
  // Part A — more consultations
  listeningBlock(
    {
      id: "l-part-a-uk-003",
      part: "A",
      title: "NHS diabetes review — HbA1c",
      accent: "UK",
      localeContext: "NHS GP · London",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:spelling"],
      transcript:
        "Patient attends six-month diabetes review. HbA1c is seven point two percent, up from six point nine. Taking metformin one gram twice daily. Reports occasional hypoglycaemia when skipping lunch. Dietitian referral arranged. Retinal screening booked for next month.",
      noteTemplate: "Review type: {{q1}}\nHbA1c: {{q2}}\nMedication: {{q3}}\nReferral: {{q4}}",
      noteFields: [
        { id: "q1", label: "Review type" },
        { id: "q2", label: "HbA1c" },
        { id: "q3", label: "Medication" },
        { id: "q4", label: "Referral" },
      ],
    },
    [
      { id: "l-a-uk-003-q1", prompt: "Review type", correctAnswer: "six-month diabetes review", type: "gap_fill", explanation: "Six-month diabetes review." },
      { id: "l-a-uk-003-q2", prompt: "HbA1c result", correctAnswer: "seven point two percent", type: "gap_fill", explanation: "HbA1c is 7.2%." },
      { id: "l-a-uk-003-q3", prompt: "Medication", correctAnswer: "metformin", type: "gap_fill", tags: ["listening:spelling"], explanation: "Metformin 1g twice daily." },
      { id: "l-a-uk-003-q4", prompt: "Referral", correctAnswer: "dietitian", type: "gap_fill", explanation: "Dietitian referral arranged." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-us-003",
      part: "A",
      title: "US clinic — migraine follow-up",
      accent: "US",
      localeContext: "Outpatient clinic · Chicago",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:part-a-detail"],
      transcript:
        "Patient presents with migraine twice weekly, lasting four to six hours. Currently on sumatriptan fifty milligrams as needed. Sleep improved since reducing screen time. Neurology follow-up scheduled in three weeks if no improvement.",
      noteTemplate: "Frequency: {{q1}}\nRescue med: {{q2}}\nLifestyle change: {{q3}}\nFollow-up: {{q4}}",
      noteFields: [
        { id: "q1", label: "Frequency" },
        { id: "q2", label: "Rescue medication" },
        { id: "q3", label: "Lifestyle" },
        { id: "q4", label: "Follow-up" },
      ],
    },
    [
      { id: "l-a-us-003-q1", prompt: "Migraine frequency", correctAnswer: "twice weekly", type: "gap_fill", explanation: "Migraines twice weekly." },
      { id: "l-a-us-003-q2", prompt: "Rescue medication", correctAnswer: "sumatriptan", type: "gap_fill", tags: ["listening:spelling"], explanation: "Sumatriptan 50mg PRN." },
      { id: "l-a-us-003-q3", prompt: "Lifestyle change", correctAnswer: "reducing screen time", type: "gap_fill", explanation: "Sleep improved after less screen time." },
      { id: "l-a-us-003-q4", prompt: "Follow-up plan", correctAnswer: "three weeks", type: "gap_fill", explanation: "Neurology in three weeks if needed." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-nz-003",
      part: "A",
      title: "NZ primary care — skin rash",
      accent: "NZ",
      localeContext: "General practice · Auckland",
      durationMinutes: 12,
      tags: ["listening:part-a"],
      transcript:
        "Patient developed itchy rash on forearms after gardening. No airway symptoms. Started topical hydrocortisone one percent twice daily yesterday with mild relief. Advised to avoid suspected plant and return if spreading or fever develops.",
      noteTemplate: "Location: {{q1}}\nTreatment started: {{q2}}\nSafety advice: {{q3}}",
      noteFields: [
        { id: "q1", label: "Rash location" },
        { id: "q2", label: "Treatment" },
        { id: "q3", label: "Safety advice" },
      ],
    },
    [
      { id: "l-a-nz-003-q1", prompt: "Rash location", correctAnswer: "forearms", type: "gap_fill", explanation: "Rash on forearms after gardening." },
      { id: "l-a-nz-003-q2", prompt: "Topical treatment", correctAnswer: "hydrocortisone", type: "gap_fill", explanation: "Hydrocortisone 1% BD." },
      { id: "l-a-nz-003-q3", prompt: "Return if", correctAnswer: "spreading or fever", type: "gap_fill", explanation: "Return if spreading or fever." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-ca-003",
      part: "A",
      title: "Canadian pharmacy — hypertension check",
      accent: "CA",
      localeContext: "Community pharmacy · Ontario",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:spelling"],
      transcript:
        "Blood pressure readings at home average one forty-two over eighty-eight. Taking ramipril ten milligrams each morning. Patient missed doses while travelling. Pharmacist suggests pill organizer and BP log for two weeks before GP review.",
      noteTemplate: "Home BP: {{q1}}\nMedication: {{q2}}\nAdherence issue: {{q3}}\nPlan: {{q4}}",
      noteFields: [
        { id: "q1", label: "Home BP" },
        { id: "q2", label: "Medication" },
        { id: "q3", label: "Adherence" },
        { id: "q4", label: "Plan" },
      ],
    },
    [
      { id: "l-a-ca-003-q1", prompt: "Average home BP", correctAnswer: "one forty-two over eighty-eight", type: "gap_fill", explanation: "142/88 average." },
      { id: "l-a-ca-003-q2", prompt: "Medication", correctAnswer: "ramipril", type: "gap_fill", tags: ["listening:spelling"], explanation: "Ramipril 10mg morning." },
      { id: "l-a-ca-003-q3", prompt: "Adherence issue", correctAnswer: "missed doses while travelling", type: "gap_fill", explanation: "Missed doses while travelling." },
      { id: "l-a-ca-003-q4", prompt: "Pharmacist plan", correctAnswer: "pill organizer", type: "gap_fill", explanation: "Pill organizer + BP log for two weeks." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-ie-003",
      part: "A",
      title: "Irish GP — post-operative wound",
      accent: "IE",
      localeContext: "GP surgery · Dublin",
      durationMinutes: 12,
      tags: ["listening:part-a"],
      transcript:
        "Patient is five days post laparoscopic cholecystectomy. Wound dry with mild redness, no discharge. Taking paracetamol and ibuprofen alternately. Advised normal showering but pat dry. Return if fever, pus, or increasing pain.",
      noteTemplate: "Procedure: {{q1}}\nDay post-op: {{q2}}\nAnalgesia: {{q3}}\nRed flags: {{q4}}",
      noteFields: [
        { id: "q1", label: "Procedure" },
        { id: "q2", label: "Day post-op" },
        { id: "q3", label: "Analgesia" },
        { id: "q4", label: "Red flags" },
      ],
    },
    [
      { id: "l-a-ie-003-q1", prompt: "Procedure", correctAnswer: "laparoscopic cholecystectomy", type: "gap_fill", explanation: "Post cholecystectomy." },
      { id: "l-a-ie-003-q2", prompt: "Days post-op", correctAnswer: "five", type: "gap_fill", explanation: "Five days post-op." },
      { id: "l-a-ie-003-q3", prompt: "Analgesia", correctAnswer: "paracetamol and ibuprofen", type: "gap_fill", explanation: "Paracetamol and ibuprofen alternately." },
      { id: "l-a-ie-003-q4", prompt: "Return if", correctAnswer: "fever, pus, or increasing pain", type: "gap_fill", explanation: "Red flags listed." },
    ],
  ),
  // Part B — workplace extracts
  listeningBlock(
    {
      id: "l-part-b-au-003",
      part: "B",
      title: "AHPRA audit reminder",
      accent: "AU",
      localeContext: "Hospital admin · Melbourne",
      durationMinutes: 8,
      tags: ["listening:part-b", "listening:part-b-gist"],
      transcript:
        "Reminder for all credentialed staff: annual CPR renewal certificates must be uploaded to the credentialing portal by Friday. Late submissions may delay roster approval for next month.",
    },
    [
      {
        id: "l-b-au-003-q1",
        prompt: "What must staff do by Friday?",
        options: ["Upload CPR certificates", "Attend a new orientation", "Submit vacation requests", "Complete a drug calculation test"],
        correctAnswer: "Upload CPR certificates",
        explanation: "CPR renewal certificates must be uploaded by Friday.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-nz-003",
      part: "B",
      title: "Rural clinic — vaccine fridge alarm",
      accent: "NZ",
      localeContext: "Rural health centre · Canterbury",
      durationMinutes: 8,
      tags: ["listening:part-b"],
      transcript:
        "The vaccine fridge temperature alarm triggered at six am. Duty nurse moved stock to the backup fridge and logged readings every thirty minutes. Manufacturer advised doses remain usable if below eight degrees within four hours.",
    },
    [
      {
        id: "l-b-nz-003-q1",
        prompt: "What is the nurse's immediate action?",
        options: ["Discard all vaccines", "Transfer stock to backup fridge", "Close the clinic", "Call the media"],
        correctAnswer: "Transfer stock to backup fridge",
        explanation: "Stock moved to backup fridge with logged readings.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-ca-003",
      part: "B",
      title: "OH&S briefing — needle-stick",
      accent: "CA",
      localeContext: "Acute care · Vancouver",
      durationMinutes: 8,
      tags: ["listening:part-b"],
      transcript:
        "After today's needle-stick incident, remember: wash the site, report to occupational health within two hours, and begin source-patient testing pathways. Forms are on the intranet under OH and S.",
    },
    [
      {
        id: "l-b-ca-003-q1",
        prompt: "When must occupational health be notified?",
        options: ["Within two hours", "Next week", "Only if symptomatic", "After shift change"],
        correctAnswer: "Within two hours",
        explanation: "Report to occupational health within two hours.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-ie-003",
      part: "B",
      title: "HSE hand hygiene audit",
      accent: "IE",
      localeContext: "Acute hospital · Dublin",
      durationMinutes: 8,
      tags: ["listening:part-b"],
      transcript:
        "Hand hygiene compliance on Ward Four was seventy-eight percent last month. All staff must complete the updated WHO five-moments module on the learning portal before the Joint Commission visit next Thursday.",
    },
    [
      {
        id: "l-b-ie-003-q1",
        prompt: "What must staff complete before Thursday?",
        options: [
          "Updated WHO five-moments module",
          "Annual leave requests",
          "Fire drill attendance",
          "New uniform fitting",
        ],
        correctAnswer: "Updated WHO five-moments module",
        explanation: "WHO five-moments module on the learning portal before Thursday visit.",
      },
    ],
  ),
  // Part C — presentations
  listeningBlock(
    {
      id: "l-part-c-uk-003",
      part: "C",
      title: "NICE guideline update — hypertension",
      accent: "UK",
      localeContext: "Trust education session · Manchester",
      durationMinutes: 18,
      tags: ["listening:part-c", "listening:part-c-inference"],
      transcript:
        "The presenter explains that ambulatory blood pressure monitoring is now preferred before starting treatment in adults under forty. She acknowledges GP workload pressures but argues ABPM reduces unnecessary prescribing. Implementation will depend on local device availability and admin support.",
    },
    [
      {
        id: "l-c-uk-003-q1",
        prompt: "The speaker's attitude to ABPM is…",
        options: ["Dismissive", "Supportive despite practical barriers", "Uncertain about all patients", "Opposed to any monitoring"],
        correctAnswer: "Supportive despite practical barriers",
        explanation: "Supports ABPM while noting workload and device availability.",
      },
      {
        id: "l-c-uk-003-q2",
        prompt: "What may limit rollout?",
        options: ["Patient refusal only", "Local device availability", "EU regulations", "Elimination of GP roles"],
        correctAnswer: "Local device availability",
        explanation: "Implementation depends on local device availability.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-us-003",
      part: "C",
      title: "HIPAA refresher — telehealth",
      accent: "US",
      localeContext: "Hospital compliance webinar",
      durationMinutes: 18,
      tags: ["listening:part-c"],
      transcript:
        "The compliance officer stresses that telehealth visits require the same minimum necessary standard as in-person care. Recordings for quality review need explicit patient consent. She warns that personal mobile apps without BAA agreements remain prohibited.",
    },
    [
      {
        id: "l-c-us-003-q1",
        prompt: "What is required for quality-review recordings?",
        options: ["Manager approval only", "Explicit patient consent", "No documentation", "Public upload"],
        correctAnswer: "Explicit patient consent",
        explanation: "Recordings need explicit patient consent.",
      },
      {
        id: "l-c-us-003-q2",
        prompt: "Personal mobile apps without a BAA are…",
        options: ["Encouraged", "Prohibited", "Mandatory", "Free to use"],
        correctAnswer: "Prohibited",
        explanation: "Apps without BAA agreements remain prohibited.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-au-003",
      part: "C",
      title: "Medicare Benefits Schedule changes",
      accent: "AU",
      localeContext: "Primary care webinar · Sydney",
      durationMinutes: 18,
      tags: ["listening:part-c"],
      transcript:
        "The presenter notes new item numbers for longer mental health consultations but cautions that documentation must justify time spent. Uptake in rural practices has been slower due to connectivity and billing support gaps.",
    },
    [
      {
        id: "l-c-au-003-q1",
        prompt: "Rural uptake has been slower mainly because of…",
        options: ["Patient disinterest", "Connectivity and billing support", "Elimination of item numbers", "Mandatory hospital admission"],
        correctAnswer: "Connectivity and billing support",
        explanation: "Slower rural uptake due to connectivity and billing support gaps.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-ie-003",
      part: "C",
      title: "Sláintecare workforce planning",
      accent: "IE",
      localeContext: "Health policy briefing · Cork",
      durationMinutes: 18,
      tags: ["listening:part-c", "listening:part-c-inference"],
      transcript:
        "The speaker argues that community nursing posts must be ring-fenced before expanding acute beds. She accepts budget limits but warns that without primary-care staffing, emergency departments will remain the default safety net.",
    },
    [
      {
        id: "l-c-ie-003-q1",
        prompt: "The speaker prioritises…",
        options: [
          "More acute beds first",
          "Community nursing posts",
          "Private hospital expansion",
          "Reducing GP training",
        ],
        correctAnswer: "Community nursing posts",
        explanation: "Community nursing posts must be ring-fenced before expanding acute beds.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-nz-003",
      part: "C",
      title: "PHARMAC funding decisions",
      accent: "NZ",
      localeContext: "National medicines forum · Wellington",
      durationMinutes: 18,
      tags: ["listening:part-c"],
      transcript:
        "The presenter explains that new diabetes medicines face longer assessment when evidence for Māori and Pacific populations is limited. She supports faster access but insists on equitable subgroup data before listing.",
    },
    [
      {
        id: "l-c-nz-003-q1",
        prompt: "Listing may be delayed when…",
        options: [
          "Drug cost is low",
          "Subgroup evidence is limited",
          "GPs oppose the medicine",
          "Export rules change",
        ],
        correctAnswer: "Subgroup evidence is limited",
        explanation: "Longer assessment when evidence for Māori and Pacific populations is limited.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-ca-003",
      part: "C",
      title: "Provincial health authority — primary care attachment",
      accent: "CA",
      localeContext: "Primary care summit · Toronto",
      durationMinutes: 18,
      tags: ["listening:part-c"],
      transcript:
        "The interviewee states that unattached patients in rural Ontario wait longest for family doctors. She recommends team-based models with nurse practitioners but notes billing codes still favour solo physician practices.",
    },
    [
      {
        id: "l-c-ca-003-q1",
        prompt: "A barrier to team-based care is…",
        options: [
          "Patient refusal",
          "Billing codes favour solo practices",
          "Lack of hospitals",
          "Elimination of nursing roles",
        ],
        correctAnswer: "Billing codes favour solo practices",
        explanation: "Billing codes still favour solo physician practices.",
      },
    ],
  ),
];
