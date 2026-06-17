import { listeningBlock } from "./helpers";

/**
 * Wave 4 — accent diversity pack.
 * OET Listening uses varied English accents; patients and clinicians may differ.
 */
export const ACCENT_LISTENING_BLOCKS_WAVE4 = [
  listeningBlock(
    {
      id: "l-part-a-mixed-001",
      part: "A",
      title: "London ED — Polish-background patient chest pain",
      accent: "mixed",
      clinicianAccent: "UK",
      patientAccent: "IE",
      localeContext: "London ED · clinician UK · patient Eastern European rhythm",
      accentNote: "Patient speaks clear English with non-native stress patterns — focus on clinical content, not accent.",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:accent-diversity"],
      transcript:
        "Patient Mr Kowalski, fifty-two, central chest tightness two hours. Born in Poland, lives in UK twenty years. No radiation to jaw. Troponin pending. ECG sinus rhythm. Given aspirin three hundred milligrams. Anxious about father's heart attack at fifty.",
      noteTemplate: "Name: {{q1}}\nSymptom: {{q2}}\nECG: {{q3}}\nGiven: {{q4}}",
      noteFields: [
        { id: "q1", label: "Patient" },
        { id: "q2", label: "Symptom" },
        { id: "q3", label: "ECG" },
        { id: "q4", label: "Treatment" },
      ],
    },
    [
      { id: "l-a-mix-001-q1", prompt: "Patient", correctAnswer: "kowalski", type: "gap_fill", explanation: "Mr Kowalski." },
      { id: "l-a-mix-001-q2", prompt: "Symptom", correctAnswer: "chest tightness", type: "gap_fill", explanation: "Central chest tightness two hours." },
      { id: "l-a-mix-001-q3", prompt: "ECG", correctAnswer: "sinus rhythm", type: "gap_fill", explanation: "ECG sinus rhythm." },
      { id: "l-a-mix-001-q4", prompt: "Treatment", correctAnswer: "aspirin", type: "gap_fill", tags: ["listening:spelling"], explanation: "Aspirin 300mg given." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-mixed-002",
      part: "A",
      title: "Sydney clinic — Māori patient diabetes review",
      accent: "mixed",
      clinicianAccent: "AU",
      patientAccent: "NZ",
      localeContext: "Auckland outreach clinic · AU-trained GP · NZ Māori patient",
      accentNote: "NZ vowel sounds — listen for numbers and medication names carefully.",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:accent-diversity"],
      transcript:
        "Mrs Hemara, fifty-eight, HbA1c fifty-eight millimoles per mole. Taking metformin one gram twice daily and empagliflozin ten milligrams morning. Reports dizziness when fasting for lab tests. Whānau support for meal planning discussed.",
      noteTemplate: "HbA1c: {{q1}}\nMeds: {{q2}}\nSide effect: {{q3}}\nSupport: {{q4}}",
      noteFields: [
        { id: "q1", label: "HbA1c" },
        { id: "q2", label: "Medications" },
        { id: "q3", label: "Symptom" },
        { id: "q4", label: "Support" },
      ],
    },
    [
      { id: "l-a-mix-002-q1", prompt: "HbA1c", correctAnswer: "fifty-eight", type: "gap_fill", explanation: "HbA1c 58 mmol/mol." },
      { id: "l-a-mix-002-q2", prompt: "Medications", correctAnswer: "metformin", type: "gap_fill", tags: ["listening:spelling"], explanation: "Metformin 1g BD and empagliflozin." },
      { id: "l-a-mix-002-q3", prompt: "Symptom", correctAnswer: "dizziness", type: "gap_fill", explanation: "Dizziness when fasting." },
      { id: "l-a-mix-002-q4", prompt: "Support", correctAnswer: "whānau", type: "gap_fill", explanation: "Whānau support for meals." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-mixed-003",
      part: "A",
      title: "Toronto — Caribbean-Canadian patient hypertension",
      accent: "mixed",
      clinicianAccent: "CA",
      patientAccent: "US",
      localeContext: "Toronto community health · Canadian clinician · Caribbean-background patient",
      accentNote: "North American rhythm with Caribbean cadence — note BP readings and drug names.",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:accent-diversity"],
      transcript:
        "Mr Sinclair, forty-five, BP one fifty-four over ninety-six repeated. Jamaican-born, in Canada fifteen years. On amlodipine five milligrams. Salt intake high — takeaway four nights weekly. Advised DASH diet leaflet and home BP diary.",
      noteTemplate: "BP: {{q1}}\nOrigin: {{q2}}\nRx: {{q3}}\nAdvice: {{q4}}",
      noteFields: [
        { id: "q1", label: "Blood pressure" },
        { id: "q2", label: "Background" },
        { id: "q3", label: "Medication" },
        { id: "q4", label: "Advice" },
      ],
    },
    [
      { id: "l-a-mix-003-q1", prompt: "BP", correctAnswer: "one fifty-four over ninety-six", type: "gap_fill", explanation: "154/96 mmHg." },
      { id: "l-a-mix-003-q2", prompt: "Background", correctAnswer: "jamaican", type: "gap_fill", explanation: "Jamaican-born." },
      { id: "l-a-mix-003-q3", prompt: "Medication", correctAnswer: "amlodipine", type: "gap_fill", tags: ["listening:spelling"], explanation: "Amlodipine 5mg." },
      { id: "l-a-mix-003-q4", prompt: "Advice", correctAnswer: "dash diet", type: "gap_fill", explanation: "DASH diet leaflet and BP diary." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-ie-005",
      part: "A",
      title: "Dublin — rural Irish patient COPD review",
      accent: "IE",
      clinicianAccent: "IE",
      patientAccent: "IE",
      localeContext: "Cork GP surgery · strong Munster accent",
      accentNote: "Regional Irish accent — consonants may be softened; numbers and drug names are key.",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:accent-diversity", "listening:spelling"],
      transcript:
        "Mr O'Sullivan, seventy, COPD GOLD stage two. Salbutamol inhaler two puffs PRN. Started tiotropium this month. Still smoking five a day. Flu vaccine due. Pulmonary rehab referral sent to Bantry.",
      noteTemplate: "Diagnosis: {{q1}}\nNew inhaler: {{q2}}\nSmoking: {{q3}}\nReferral: {{q4}}",
      noteFields: [
        { id: "q1", label: "Diagnosis" },
        { id: "q2", label: "New medicine" },
        { id: "q3", label: "Smoking" },
        { id: "q4", label: "Referral" },
      ],
    },
    [
      { id: "l-a-ie-005-q1", prompt: "Diagnosis", correctAnswer: "copd", type: "gap_fill", explanation: "COPD GOLD stage 2." },
      { id: "l-a-ie-005-q2", prompt: "New medicine", correctAnswer: "tiotropium", type: "gap_fill", tags: ["listening:spelling"], explanation: "Tiotropium started this month." },
      { id: "l-a-ie-005-q3", prompt: "Smoking", correctAnswer: "five a day", type: "gap_fill", explanation: "Still smoking 5/day." },
      { id: "l-a-ie-005-q4", prompt: "Referral", correctAnswer: "pulmonary rehab", type: "gap_fill", explanation: "Pulmonary rehab to Bantry." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-nz-005",
      part: "A",
      title: "Wellington — Pacific patient antenatal booking",
      accent: "NZ",
      clinicianAccent: "NZ",
      patientAccent: "AU",
      localeContext: "Wellington midwifery · Samoan-Australian patient",
      accentNote: "Pacific-Australian English — listen for gestation weeks and supplement doses.",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:accent-diversity"],
      transcript:
        "Ms Fa'amoe, twenty-eight, twelve weeks gestation, BMI twenty-four. Folic acid five hundred micrograms and iodine one hundred fifty micrograms daily. No smoking. Dating scan at hospital next Tuesday. Partner attends tonight's antenatal class.",
      noteTemplate: "Gestation: {{q1}}\nFolic acid: {{q2}}\nScan: {{q3}}\nClass: {{q4}}",
      noteFields: [
        { id: "q1", label: "Gestation" },
        { id: "q2", label: "Folic acid dose" },
        { id: "q3", label: "Scan timing" },
        { id: "q4", label: "Class" },
      ],
    },
    [
      { id: "l-a-nz-005-q1", prompt: "Gestation", correctAnswer: "twelve weeks", type: "gap_fill", explanation: "12 weeks gestation." },
      { id: "l-a-nz-005-q2", prompt: "Folic acid", correctAnswer: "five hundred micrograms", type: "gap_fill", explanation: "Folic acid 500 micrograms." },
      { id: "l-a-nz-005-q3", prompt: "Scan", correctAnswer: "next tuesday", type: "gap_fill", explanation: "Dating scan next Tuesday." },
      { id: "l-a-nz-005-q4", prompt: "Class", correctAnswer: "antenatal", type: "gap_fill", explanation: "Antenatal class tonight." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-mixed-001",
      part: "B",
      title: "Multicultural ward — interpreter policy",
      accent: "mixed",
      clinicianAccent: "UK",
      localeContext: "NHS trust · diverse staff accents on ward",
      accentNote: "Speaker has South Asian English — policy details are standard UK NHS wording.",
      durationMinutes: 8,
      tags: ["listening:part-b", "listening:accent-diversity"],
      transcript:
        "The nurse manager explains that professional interpreters must be booked for consent and discharge, not children or untrained relatives, except in immediate life-threatening emergencies when telephone interpreter lines are used.",
    },
    [
      {
        id: "l-b-mix-001-q1",
        prompt: "When may relatives interpret?",
        options: [
          "Never under any circumstances",
          "Only in immediate life-threatening emergencies",
          "For all routine discharge",
          "When the patient prefers it",
        ],
        correctAnswer: "Only in immediate life-threatening emergencies",
        explanation: "Relatives not used except immediate emergencies with phone interpreter backup.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-us-005",
      part: "B",
      title: "US hospital — Spanish-speaking patient rights",
      accent: "US",
      localeContext: "California hospital · bilingual signage policy",
      accentNote: "Californian US accent — legal terms for language access.",
      durationMinutes: 8,
      tags: ["listening:part-b", "listening:accent-diversity"],
      transcript:
        "The compliance officer states that qualified bilingual staff or certified interpreters must be offered before procedures, and patients may decline but must sign a language-access waiver documented in the chart.",
    },
    [
      {
        id: "l-b-us-005-q1",
        prompt: "If a patient declines an interpreter…",
        options: [
          "Proceed without documentation",
          "Document a signed language-access waiver",
          "Cancel the procedure",
          "Use only family members",
        ],
        correctAnswer: "Document a signed language-access waiver",
        explanation: "Decline allowed but waiver must be signed and charted.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-au-005",
      part: "B",
      title: "AU rural — fly-in fly-out medic briefing",
      accent: "AU",
      localeContext: "Pilbara mine site · broad Australian accent",
      accentNote: "Broad Australian vowels — focus on evacuation criteria numbers.",
      durationMinutes: 8,
      tags: ["listening:part-b", "listening:accent-diversity"],
      transcript:
        "The site medic clarifies that any chest pain with abnormal ECG or systolic BP below ninety triggers helicopter evacuation; minor lacerations are sutured on site if tetanus up to date.",
    },
    [
      {
        id: "l-b-au-005-q1",
        prompt: "Helicopter evacuation is triggered when…",
        options: [
          "Any laceration",
          "Chest pain with abnormal ECG or systolic BP below 90",
          "Tetanus overdue",
          "Mild headache",
        ],
        correctAnswer: "Chest pain with abnormal ECG or systolic BP below 90",
        explanation: "Chest pain + abnormal ECG or SBP <90 triggers evacuation.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-mixed-001",
      part: "C",
      title: "Interview — accent bias in clinical handover",
      accent: "mixed",
      localeContext: "Medical education podcast · UK host, IE guest",
      accentNote: "Two accents in dialogue — UK and Irish — assess communication content not style.",
      durationMinutes: 18,
      tags: ["listening:part-c", "listening:accent-diversity"],
      transcript:
        "The guest argues that structured SBAR handovers reduce miscommunication when staff accents differ, but only if teams practise active listening and repeat-back for drug names and doses.",
    },
    [
      {
        id: "l-c-mix-001-q1",
        prompt: "The guest recommends reducing errors by…",
        options: [
          "Avoiding international hires",
          "SBAR with repeat-back for medicines",
          "Written orders only",
          "Shorter shifts",
        ],
        correctAnswer: "SBAR with repeat-back for medicines",
        explanation: "Structured SBAR plus repeat-back for drug names and doses.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-ca-005",
      part: "C",
      title: "CA — Indigenous health liaison interview",
      accent: "CA",
      localeContext: "Vancouver · First Nations health advocate",
      accentNote: "Canadian English — cultural safety terminology.",
      durationMinutes: 18,
      tags: ["listening:part-c", "listening:accent-diversity"],
      transcript:
        "The advocate emphasises that cultural safety training must include understanding regional Indigenous languages and family decision-making structures, not only medical vocabulary in English.",
    },
    [
      {
        id: "l-c-ca-005-q1",
        prompt: "Cultural safety should include…",
        options: [
          "Medical English only",
          "Regional Indigenous languages and family decision structures",
          "Eliminating family involvement",
          "Standardised US protocols",
        ],
        correctAnswer: "Regional Indigenous languages and family decision structures",
        explanation: "Beyond English — languages and family decision-making.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-nz-005",
      part: "C",
      title: "NZ — accent and OSCE fairness",
      accent: "NZ",
      localeContext: "Medical council podcast · Wellington",
      accentNote: "NZ accent — policy discussion on examiner training.",
      durationMinutes: 18,
      tags: ["listening:part-c", "listening:accent-diversity"],
      transcript:
        "The speaker notes that OET and workplace OSCEs assess intelligibility and clinical communication, not conformity to a single national accent, provided examiners complete accent-awareness training.",
    },
    [
      {
        id: "l-c-nz-005-q1",
        prompt: "Workplace assessments focus on…",
        options: [
          "Single national accent only",
          "Intelligibility and clinical communication",
          "Written grammar scores",
          "Speed of speech",
        ],
        correctAnswer: "Intelligibility and clinical communication",
        explanation: "Intelligibility and clinical comm — not one national accent.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-uk-005",
      part: "A",
      title: "Birmingham — South Asian patient asthma review",
      accent: "UK",
      clinicianAccent: "UK",
      patientAccent: "mixed",
      localeContext: "Midlands GP · British-Punjabi patient",
      accentNote: "British South Asian English — clear but different rhythm on numbers.",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:accent-diversity"],
      transcript:
        "Mrs Begum, thirty-four, asthma review. Uses salbutamol three times weekly. Started beclometasone two puffs twice daily last month. No night waking. Peak flow three eighty litres per minute. Ramadan fasting discussed — adjust preventer timing.",
      noteTemplate: "Reliever use: {{q1}}\nPreventer: {{q2}}\nPeak flow: {{q3}}\nDiscussion: {{q4}}",
      noteFields: [
        { id: "q1", label: "Reliever frequency" },
        { id: "q2", label: "Preventer" },
        { id: "q3", label: "Peak flow" },
        { id: "q4", label: "Special topic" },
      ],
    },
    [
      { id: "l-a-uk-005-q1", prompt: "Reliever", correctAnswer: "three times weekly", type: "gap_fill", explanation: "Salbutamol 3× weekly." },
      { id: "l-a-uk-005-q2", prompt: "Preventer", correctAnswer: "beclometasone", type: "gap_fill", tags: ["listening:spelling"], explanation: "Beclometasone 2 puffs BD." },
      { id: "l-a-uk-005-q3", prompt: "Peak flow", correctAnswer: "three eighty", type: "gap_fill", explanation: "Peak flow 380 L/min." },
      { id: "l-a-uk-005-q4", prompt: "Topic", correctAnswer: "ramadan", type: "gap_fill", explanation: "Ramadan fasting and preventer timing." },
    ],
  ),
];
