import { listeningBlock } from "./helpers";

/** Original OET-style scripts — royalty-free practice content (not official OET audio). */
export const UNIVERSAL_LISTENING_BLOCKS = [
  listeningBlock(
    {
      id: "l-part-a-001",
      part: "A",
      title: "GP consultation — back pain",
      durationMinutes: 12,
      accent: "UK",
      localeContext: "Part A · consultation notes",
      bundledAudioPath: "audio/part-a-back-pain.wav",
      tags: ["listening:part-a", "listening:part-a-detail", "listening:spelling"],
      transcript:
        "Patient reports lower back pain for three weeks after lifting a box at work. Pain is worse when bending. Currently taking ibuprofen 400mg three times daily with partial relief. No red-flag symptoms. Plan: physiotherapy referral and review in two weeks.",
      noteTemplate:
        "Presenting complaint: {{q1}}\nDuration: {{q2}}\nCurrent medication: {{q3}}\nPlan: {{q4}}",
      noteFields: [
        { id: "q1", label: "Presenting complaint" },
        { id: "q2", label: "Duration" },
        { id: "q3", label: "Current medication" },
        { id: "q4", label: "Plan" },
      ],
    },
    [
      {
        id: "l-a-001-q1",
        prompt: "Presenting complaint",
        correctAnswer: "lower back pain",
        explanation: "Patient reports lower back pain after lifting at work.",
        type: "gap_fill",
      },
      {
        id: "l-a-001-q2",
        prompt: "Duration of symptoms",
        correctAnswer: "three weeks",
        explanation: "Pain has lasted three weeks.",
        type: "gap_fill",
      },
      {
        id: "l-a-001-q3",
        prompt: "Current medication (dose)",
        correctAnswer: "ibuprofen 400mg",
        explanation: "Taking ibuprofen 400mg three times daily.",
        type: "gap_fill",
        tags: ["listening:spelling"],
      },
      {
        id: "l-a-001-q4",
        prompt: "Management plan",
        correctAnswer: "physiotherapy referral",
        explanation: "Plan includes physiotherapy referral and review in two weeks.",
        type: "gap_fill",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-002",
      part: "A",
      title: "Pharmacy review — asthma inhaler",
      durationMinutes: 12,
      accent: "AU",
      localeContext: "Part A · medication review",
      bundledAudioPath: "audio/part-a-asthma.wav",
      tags: ["listening:part-a", "listening:spelling"],
      transcript:
        "Patient uses salbutamol inhaler two to three times weekly for wheeze. Adherence to preventer budesonide is poor — often forgets evening dose. No hospital admissions this year. Pharmacist recommends spacer device and alarms on phone for evening dose.",
      noteTemplate:
        "Reliever use: {{q1}}\nPreventer: {{q2}}\nAdherence issue: {{q3}}\nRecommendation: {{q4}}",
      noteFields: [
        { id: "q1", label: "Reliever use" },
        { id: "q2", label: "Preventer name" },
        { id: "q3", label: "Adherence issue" },
        { id: "q4", label: "Recommendation" },
      ],
    },
    [
      {
        id: "l-a-002-q1",
        prompt: "Reliever frequency",
        correctAnswer: "two to three times weekly",
        explanation: "Salbutamol used two to three times weekly.",
        type: "gap_fill",
      },
      {
        id: "l-a-002-q2",
        prompt: "Preventer medication",
        correctAnswer: "budesonide",
        explanation: "Preventer is budesonide.",
        type: "gap_fill",
        tags: ["listening:spelling"],
      },
      {
        id: "l-a-002-q3",
        prompt: "Adherence problem",
        correctAnswer: "forgets evening dose",
        explanation: "Patient often forgets the evening preventer dose.",
        type: "gap_fill",
      },
      {
        id: "l-a-002-q4",
        prompt: "Pharmacist recommendation",
        correctAnswer: "spacer device",
        explanation: "Spacer device and phone alarms recommended.",
        type: "gap_fill",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-001",
      part: "B",
      title: "Ward handover snippet",
      durationMinutes: 8,
      accent: "UK",
      bundledAudioPath: "audio/part-b-handover.wav",
      tags: ["listening:part-b", "listening:part-b-gist"],
      transcript:
        "Bed 12 — Mr Chen — observations stable overnight. Blood culture results due at ten. Please chase microbiology if not back by eleven. Daughter visiting at two; patient prefers afternoon ward round.",
    },
    [
      {
        id: "l-b-001-q1",
        prompt: "What should the nurse do if culture results are delayed?",
        options: [
          "Discharge the patient",
          "Contact microbiology",
          "Cancel the ward round",
          "Stop antibiotics immediately",
        ],
        correctAnswer: "Contact microbiology",
        explanation: "Handover asks to chase microbiology if results not back by eleven.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-002",
      part: "B",
      title: "Team briefing — infection control",
      durationMinutes: 8,
      accent: "US",
      bundledAudioPath: "audio/part-b-infection.wav",
      tags: ["listening:part-b", "listening:part-b-gist"],
      transcript:
        "Reminder: all staff must complete the updated isolation signage training by Friday. New posters are at the nurses' station. Contact infection control extension 4421 for questions.",
    },
    [
      {
        id: "l-b-002-q1",
        prompt: "What is the main purpose of this message?",
        options: [
          "To announce ward closure",
          "To remind staff about mandatory training",
          "To report an outbreak",
          "To change visiting hours",
        ],
        correctAnswer: "To remind staff about mandatory training",
        explanation: "The briefing reminds staff to complete isolation signage training.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-001",
      part: "C",
      title: "Presentation — telehealth expansion",
      durationMinutes: 18,
      accent: "mixed",
      bundledAudioPath: "audio/part-c-telehealth.wav",
      tags: ["listening:part-c", "listening:part-c-inference"],
      transcript:
        "The presenter describes a telehealth pilot that reduced missed appointments by eighteen percent in rural clinics. Uptake among older patients was slower than expected, partly due to device setup anxiety. The speaker suggests hybrid models may be more sustainable than full remote care, though funding remains uncertain beyond the pilot year.",
    },
    [
      {
        id: "l-c-001-q1",
        prompt: "The presenter implies older patients…",
        options: [
          "Refused all telehealth offers",
          "Adopted telehealth faster than younger groups",
          "Were slower to adopt telehealth",
          "Preferred in-person care only for emergencies",
        ],
        correctAnswer: "Were slower to adopt telehealth",
        explanation: "Uptake among older patients was slower than expected.",
      },
      {
        id: "l-c-001-q2",
        prompt: "The speaker's overall attitude to telehealth is…",
        options: [
          "Entirely negative",
          "Cautiously positive with limitations",
          "Dismissive of rural needs",
          "Certain that full remote care is best",
        ],
        correctAnswer: "Cautiously positive with limitations",
        explanation: "Benefits noted alongside setup anxiety and funding uncertainty.",
      },
      {
        id: "l-c-001-q3",
        prompt: "What outcome improved in the pilot?",
        options: [
          "Staff overtime",
          "Missed appointments",
          "Medication errors",
          "Hospital bed occupancy",
        ],
        correctAnswer: "Missed appointments",
        explanation: "Missed appointments fell by eighteen percent.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-002",
      part: "C",
      title: "Interview — antimicrobial stewardship",
      durationMinutes: 18,
      accent: "IE",
      bundledAudioPath: "audio/part-c-stewardship.wav",
      tags: ["listening:part-c", "listening:part-c-inference"],
      transcript:
        "The interviewee argues that ward pharmacists should lead daily antibiotic reviews, not only consultants. She acknowledges resistance from overstretched teams but cites a thirty percent reduction in broad-spectrum use where the model was trialled. Long-term success, she says, depends on protected time rather than goodwill alone.",
    },
    [
      {
        id: "l-c-002-q1",
        prompt: "Who does the interviewee believe should lead daily reviews?",
        options: [
          "Medical students",
          "Ward pharmacists",
          "Hospital managers",
          "Patients' relatives",
        ],
        correctAnswer: "Ward pharmacists",
        explanation: "She argues ward pharmacists should lead daily antibiotic reviews.",
      },
      {
        id: "l-c-002-q2",
        prompt: "What does she identify as essential for lasting change?",
        options: [
          "More weekend shifts",
          "Protected time for reviews",
          "Eliminating all broad-spectrum drugs",
          "Public advertising campaigns",
        ],
        correctAnswer: "Protected time for reviews",
        explanation: "Long-term success depends on protected time rather than goodwill.",
      },
    ],
  ),
];
