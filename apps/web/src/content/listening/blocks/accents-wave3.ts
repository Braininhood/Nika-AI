import { listeningBlock } from "./helpers";

/** Wave 3 — nine additional accent blocks (US/NZ/CA Part B depth + mixed parts). */
export const ACCENT_LISTENING_BLOCKS_WAVE3 = [
  listeningBlock(
    {
      id: "l-part-b-us-004",
      part: "B",
      title: "US hospital — sepsis bundle compliance",
      accent: "US",
      localeContext: "Quality meeting · Boston",
      durationMinutes: 8,
      tags: ["listening:part-b", "listening:part-b-gist"],
      transcript:
        "The speaker explains that sepsis bundle compliance improved after nurse-led huddles but blood culture collection before antibiotics still lags on night shift.",
    },
    [
      {
        id: "l-b-us-004-q1",
        prompt: "Night-shift weakness is…",
        options: [
          "Too many huddles",
          "Blood cultures before antibiotics",
          "Discharge planning",
          "Visitor restrictions",
        ],
        correctAnswer: "Blood cultures before antibiotics",
        explanation: "Blood cultures before antibiotics still lag on nights.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-nz-004",
      part: "B",
      title: "NZ DHB — Māori health equity plan",
      accent: "NZ",
      localeContext: "DHB board · Wellington",
      durationMinutes: 8,
      tags: ["listening:part-b", "listening:part-b-gist"],
      transcript:
        "The manager describes co-designed clinics with kaupapa Māori providers and says routine data must report outcomes by ethnicity to track equity gaps.",
    },
    [
      {
        id: "l-b-nz-004-q1",
        prompt: "Progress will be tracked by…",
        options: [
          "Bed occupancy only",
          "Outcomes reported by ethnicity",
          "Overseas recruitment",
          "Private insurance uptake",
        ],
        correctAnswer: "Outcomes reported by ethnicity",
        explanation: "Routine data must report outcomes by ethnicity.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-b-ca-004",
      part: "B",
      title: "Canadian clinic — opioid stewardship",
      accent: "CA",
      localeContext: "Primary care · Vancouver",
      durationMinutes: 8,
      tags: ["listening:part-b", "listening:part-b-gist"],
      transcript:
        "The pharmacist notes that shared decision-making tools reduced new opioid starts but patients still expect quick fixes for chronic back pain.",
    },
    [
      {
        id: "l-b-ca-004-q1",
        prompt: "A remaining challenge is…",
        options: [
          "Lack of physiotherapists",
          "Patient expectations for quick fixes",
          "Illegal prescribing",
          "No pain guidelines",
        ],
        correctAnswer: "Patient expectations for quick fixes",
        explanation: "Patients still expect quick fixes for chronic back pain.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-au-004",
      part: "A",
      title: "AU telehealth — dermatology review",
      accent: "AU",
      localeContext: "Telehealth · Melbourne",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:part-a-detail"],
      transcript:
        "Patient presents via video for spreading erythematous rash on trunk after amoxicillin. No lip swelling or wheeze. Advised to stop antibiotic, use antihistamine, present to ED if breathing difficulty. Photo uploaded to record.",
      noteTemplate: "Mode: {{q1}}\nTrigger: {{q2}}\nRed flags absent: {{q3}}\nAdvice: {{q4}}",
      noteFields: [
        { id: "q1", label: "Consultation mode" },
        { id: "q2", label: "Suspected trigger" },
        { id: "q3", label: "Red flags absent" },
        { id: "q4", label: "Advice" },
      ],
    },
    [
      { id: "l-a-au-004-q1", prompt: "Mode", correctAnswer: "video", type: "gap_fill", explanation: "Telehealth video consult." },
      { id: "l-a-au-004-q2", prompt: "Trigger", correctAnswer: "amoxicillin", type: "gap_fill", tags: ["listening:spelling"], explanation: "Rash after amoxicillin." },
      { id: "l-a-au-004-q3", prompt: "Red flags absent", correctAnswer: "lip swelling", type: "gap_fill", explanation: "No lip swelling or wheeze." },
      { id: "l-a-au-004-q4", prompt: "Advice", correctAnswer: "stop antibiotic", type: "gap_fill", explanation: "Stop antibiotic, antihistamine, ED if breathing difficulty." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-ie-004",
      part: "A",
      title: "IE GP — antenatal booking visit",
      accent: "IE",
      localeContext: "GP maternity shared care · Dublin",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:spelling"],
      transcript:
        "Booking visit at ten weeks. BMI twenty-six. Taking folic acid four hundred micrograms daily. No smoking. Dating scan booked at hospital. Discussed pertussis vaccination in third trimester.",
      noteTemplate: "Gestation: {{q1}}\nBMI: {{q2}}\nSupplement: {{q3}}\nScan: {{q4}}",
      noteFields: [
        { id: "q1", label: "Gestation" },
        { id: "q2", label: "BMI" },
        { id: "q3", label: "Supplement" },
        { id: "q4", label: "Scan" },
      ],
    },
    [
      { id: "l-a-ie-004-q1", prompt: "Gestation", correctAnswer: "ten weeks", type: "gap_fill", explanation: "Booking at 10 weeks." },
      { id: "l-a-ie-004-q2", prompt: "BMI", correctAnswer: "twenty-six", type: "gap_fill", explanation: "BMI 26." },
      { id: "l-a-ie-004-q3", prompt: "Supplement", correctAnswer: "folic acid", type: "gap_fill", tags: ["listening:spelling"], explanation: "Folic acid 400 micrograms daily." },
      { id: "l-a-ie-004-q4", prompt: "Scan", correctAnswer: "dating scan", type: "gap_fill", explanation: "Dating scan booked at hospital." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-a-us-004",
      part: "A",
      title: "US urgent care — ankle sprain",
      accent: "US",
      localeContext: "Urgent care · Denver",
      durationMinutes: 12,
      tags: ["listening:part-a", "listening:part-a-detail"],
      transcript:
        "Twisted ankle playing basketball yesterday. Ottawa rules negative for fracture. RICE advice given. Air stirrup brace supplied. Follow up primary care if not weight bearing in five days.",
      noteTemplate: "Mechanism: {{q1}}\nRule-out: {{q2}}\nTreatment: {{q3}}\nFollow-up: {{q4}}",
      noteFields: [
        { id: "q1", label: "Mechanism" },
        { id: "q2", label: "Fracture rule-out" },
        { id: "q3", label: "Treatment" },
        { id: "q4", label: "Follow-up" },
      ],
    },
    [
      { id: "l-a-us-004-q1", prompt: "Mechanism", correctAnswer: "basketball", type: "gap_fill", explanation: "Injury playing basketball." },
      { id: "l-a-us-004-q2", prompt: "Fracture rule-out", correctAnswer: "ottawa rules negative", type: "gap_fill", explanation: "Ottawa rules negative for fracture." },
      { id: "l-a-us-004-q3", prompt: "Treatment", correctAnswer: "rice", type: "gap_fill", explanation: "RICE advice and stirrup brace." },
      { id: "l-a-us-004-q4", prompt: "Follow-up", correctAnswer: "five days", type: "gap_fill", explanation: "Follow up if not weight bearing in 5 days." },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-uk-004",
      part: "C",
      title: "UK NHS — workforce retention interview",
      accent: "UK",
      localeContext: "HR podcast · Leeds",
      durationMinutes: 18,
      tags: ["listening:part-c", "listening:part-c-inference"],
      transcript:
        "The interviewee argues that flexible rotas and protected training time matter more than one-off bonuses for retaining overseas nurses, though she acknowledges housing costs in some cities remain a barrier.",
    },
    [
      {
        id: "l-c-uk-004-q1",
        prompt: "She believes retention is driven mainly by…",
        options: [
          "One-off bonuses",
          "Flexible rotas and training time",
          "Shorter shifts only",
          "Eliminating appraisals",
        ],
        correctAnswer: "Flexible rotas and training time",
        explanation: "Flexible rotas and protected training time matter more than bonuses.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-us-004",
      part: "C",
      title: "US — rural telemedicine expansion",
      accent: "US",
      localeContext: "Health policy interview · Minnesota",
      durationMinutes: 18,
      tags: ["listening:part-c"],
      transcript:
        "The guest says broadband investment enabled specialist video consults in rural counties but licensure differences across states still limit which doctors can follow patients after relocation.",
    },
    [
      {
        id: "l-c-us-004-q1",
        prompt: "A continuing barrier is…",
        options: [
          "Patient refusal of video",
          "State licensure differences",
          "Lack of hospitals",
          "No broadband funding",
        ],
        correctAnswer: "State licensure differences",
        explanation: "Licensure differences limit follow-up after relocation.",
      },
    ],
  ),
  listeningBlock(
    {
      id: "l-part-c-ie-004",
      part: "C",
      title: "IE — Sláintecare reform progress",
      accent: "IE",
      localeContext: "Policy discussion · Cork",
      durationMinutes: 18,
      tags: ["listening:part-c", "listening:part-c-inference"],
      transcript:
        "The analyst cautions that shifting care from hospitals to community teams is slower than planned because GP capacity and social care packages are not scaling at the same pace.",
    },
    [
      {
        id: "l-c-ie-004-q1",
        prompt: "Reform is slowed by…",
        options: [
          "Patient opposition",
          "GP and social care capacity lagging",
          "Excess hospital beds",
          "EU funding rules",
        ],
        correctAnswer: "GP and social care capacity lagging",
        explanation: "GP capacity and social care not scaling with hospital shift.",
      },
    ],
  ),
];
