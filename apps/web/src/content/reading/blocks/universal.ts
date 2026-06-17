import { readingBlock } from "./helpers";

/** Cross-country workplace texts — shown when no locale-specific block matches. */
export const UNIVERSAL_READING_BLOCKS = [
  readingBlock(
    {
      id: "r-part-a-001",
      part: "A",
      title: "Ward handover notices",
      countryCode: "ALL",
      localeContext: "Universal · all professions",
      durationMinutes: 15,
      tags: ["reading:part-a", "reading:scan"],
      paragraphs: [
        "Text A — Medication chart update: Insulin glargine dose increased to 18 units at bedtime from Monday. Patient education leaflet placed at bedside. GP notified by secure message.",
        "Text B — Falls risk: New yellow wristband applied. Bed alarm activated overnight. Physiotherapy referral sent for mobility assessment within 24 hours.",
        "Text C — Discharge planning: Expected discharge Thursday if wound review satisfactory. Community nurse visit booked for Friday 09:00. Daughter (next of kin) prefers morning calls.",
        "Text D — Infection control: Contact precautions lifted. Single room no longer required. Continue MRSA screen until culture result available.",
      ],
    },
    [
      { id: "r-a-001-q1", prompt: "Which text mentions a change to bedtime medication?", options: ["Text A", "Text B", "Text C", "Text D"], correctAnswer: "Text A", explanation: "Text A describes an insulin dose change at bedtime.", type: "matching" },
      { id: "r-a-001-q2", prompt: "Which text refers to a mobility assessment?", options: ["Text A", "Text B", "Text C", "Text D"], correctAnswer: "Text B", explanation: "Text B mentions a physiotherapy referral for mobility.", type: "matching" },
      { id: "r-a-001-q3", prompt: "Which text includes a scheduled community visit?", options: ["Text A", "Text B", "Text C", "Text D"], correctAnswer: "Text C", explanation: "Text C books a community nurse visit for Friday morning.", type: "matching" },
      { id: "r-a-001-q4", prompt: "Which text indicates isolation precautions have ended?", options: ["Text A", "Text B", "Text C", "Text D"], correctAnswer: "Text D", explanation: "Text D states contact precautions were lifted.", type: "matching" },
    ],
  ),
  readingBlock(
    {
      id: "r-part-b-001",
      part: "B",
      title: "Hospital visiting policy update",
      countryCode: "ALL",
      localeContext: "Universal · all professions",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:skim"],
      paragraphs: [
        "From 1 March, visiting hours on acute medical wards will run 10:00–20:00 daily. A maximum of two visitors per patient applies at any one time, though one carer may stay overnight when agreed with the nurse in charge.",
        "Visitors with respiratory symptoms are asked to postpone visits and use the video-call tablets available at each nurses' station. Children under 12 may visit only when accompanied by an adult and with prior ward approval.",
        "The policy aims to balance patient rest with family support. Ward managers may restrict visiting temporarily during norovirus outbreaks; notices will be posted at ward entrances and on the trust website.",
      ],
    },
    [
      { id: "r-b-001-q1", prompt: "What is the main purpose of the policy change?", options: ["To eliminate all ward visitors", "To balance patient rest with family support", "To reduce nursing workload only", "To charge for overnight stays"], correctAnswer: "To balance patient rest with family support", explanation: "The third paragraph states this aim explicitly." },
      { id: "r-b-001-q2", prompt: "How many visitors are allowed at one time?", options: ["One only", "Two maximum", "Three with approval", "Unlimited"], correctAnswer: "Two maximum", explanation: "The first paragraph sets a maximum of two visitors." },
      { id: "r-b-001-q3", prompt: "When may visiting be restricted further?", options: ["During norovirus outbreaks", "Every weekend", "When patients request silence", "During pharmacy deliveries"], correctAnswer: "During norovirus outbreaks", explanation: "Ward managers may restrict visiting during norovirus outbreaks." },
    ],
  ),
  readingBlock(
    {
      id: "r-part-c-001",
      part: "C",
      title: "Remote monitoring pilot evaluation",
      countryCode: "ALL",
      localeContext: "Universal · all professions",
      durationMinutes: 23,
      difficulty: 2,
      tags: ["reading:part-c", "reading:inference"],
      paragraphs: [
        "A six-month pilot placed blood-pressure cuffs and scales in 120 homes of patients with heart failure. Nurses reviewed uploads twice weekly and called patients when readings crossed agreed thresholds.",
        "Adherence was higher than expected: 78% of participants transmitted readings at least five days per week. However, several patients reported anxiety when alerts triggered overnight, and two requested return to clinic-only monitoring.",
        "The evaluation concludes that remote monitoring can reduce unplanned admissions when combined with clear escalation protocols and patient education about what alerts mean. Funding for a wider rollout depends on commissioner approval in the next financial year.",
      ],
    },
    [
      { id: "r-c-001-q1", prompt: "The writer implies that overnight alerts were sometimes…", options: ["Welcomed by all patients", "A source of concern for some patients", "Ignored by nursing staff", "Illegal under trust policy"], correctAnswer: "A source of concern for some patients", explanation: "Patients reported anxiety when alerts triggered overnight." },
      { id: "r-c-001-q2", prompt: "What must happen before the programme expands?", options: ["All patients must agree", "Commissioner funding approval", "Elimination of clinic visits", "Replacement of nursing staff"], correctAnswer: "Commissioner funding approval", explanation: "Wider rollout depends on commissioner approval next financial year." },
      { id: "r-c-001-q3", prompt: "The overall tone of the evaluation is…", options: ["Entirely negative", "Cautiously positive with noted limitations", "Dismissive of patient views", "Promotional without evidence"], correctAnswer: "Cautiously positive with noted limitations", explanation: "Benefits are noted alongside anxiety and funding conditions." },
    ],
  ),
  readingBlock(
    {
      id: "r-part-a-002",
      part: "A",
      title: "Clinic appointment slips",
      countryCode: "ALL",
      durationMinutes: 15,
      tags: ["reading:part-a", "reading:scan"],
      paragraphs: [
        "Text A — Podiatry: Mr Okonkwo booked for nail surgery review Tuesday 14:30, Room 4. Fasting not required. Bring current footwear.",
        "Text B — Dietetics: Mrs Silva diabetes group education cancelled; rebooked to virtual session Thursday 11:00. Link emailed.",
        "Text C — Radiology: MRI lumbar spine for Ms Chen — arrive 20 minutes early, no metal jewellery. Sedation not planned.",
        "Text D — Physiotherapy: Post-TKR class moved from Gym 1 to Gym 2 from next week. Patients should check screens on arrival.",
      ],
    },
    [
      { id: "r-a-002-q1", prompt: "Which text mentions a change to session format (virtual)?", options: ["Text A", "Text B", "Text C", "Text D"], correctAnswer: "Text B", explanation: "Text B rebooks to a virtual session.", type: "matching" },
      { id: "r-a-002-q2", prompt: "Which text gives preparation advice about metal?", options: ["Text A", "Text B", "Text C", "Text D"], correctAnswer: "Text C", explanation: "Text C asks the patient to remove metal jewellery before MRI.", type: "matching" },
      { id: "r-a-002-q3", prompt: "Which text refers to a venue change only?", options: ["Text A", "Text B", "Text C", "Text D"], correctAnswer: "Text D", explanation: "Text D moves a class between gym rooms.", type: "matching" },
      { id: "r-a-002-q4", prompt: "Which text tells the patient what to bring?", options: ["Text A", "Text B", "Text C", "Text D"], correctAnswer: "Text A", explanation: "Text A asks the patient to bring current footwear.", type: "matching" },
    ],
  ),
  readingBlock(
    {
      id: "r-part-c-002",
      part: "C",
      title: "Same-day emergency care expansion",
      countryCode: "ALL",
      durationMinutes: 23,
      difficulty: 2,
      tags: ["reading:part-c-inference", "reading:inference"],
      paragraphs: [
        "The trust opened a Same Day Emergency Care (SDEC) unit to divert low-acuity admissions from the emergency department. Early data show median length of stay fell from 11 hours to 6 hours for suitable patients.",
        "Some consultants remain sceptical, arguing that SDEC shifts workload rather than reducing it. Nursing leads counter that patients receive definitive care faster and bed occupancy has improved modestly.",
        "The board will decide in April whether to extend SDEC hours to weekends. Critics note that weekend staffing remains the main barrier, not patient demand.",
      ],
    },
    [
      { id: "r-c-002-q1", prompt: "Consultant scepticism suggests they believe SDEC…", options: ["Eliminates all ED work", "May redistribute rather than reduce work", "Has failed completely", "Is illegal"], correctAnswer: "May redistribute rather than reduce work", explanation: "Sceptics argue SDEC shifts workload rather than reducing it." },
      { id: "r-c-002-q2", prompt: "Weekend extension is most likely blocked by…", options: ["Lack of patient demand", "Staffing availability", "Patient refusal", "Legal bans"], correctAnswer: "Staffing availability", explanation: "Critics cite weekend staffing as the main barrier." },
    ],
  ),
];
