import { readingBlock } from "./helpers";

/** Wave 2 — Part C texts per OET destination (inference + attitude). */
export const COUNTRY_READING_PART_C_WAVE2 = [
  readingBlock(
    {
      id: "r-uk-c-002",
      part: "C",
      countryCode: "UK",
      title: "NHS workforce — IMG integration",
      localeContext: "Health Education England interview",
      durationMinutes: 22,
      tags: ["reading:part-c", "reading:part-c-inference"],
      paragraphs: [
        "The interviewee argues that supervised practice programmes for international graduates succeed when mentors receive accent-awareness training and protected time, not when new arrivals are expected to assimilate informally on busy wards.",
        "She criticises one-off cultural awareness lectures as insufficient compared with longitudinal mentorship and structured feedback on handover communication.",
      ],
    },
    [
      {
        id: "r-uk-c-002-q1",
        prompt: "The interviewee prefers…",
        options: [
          "One-off lectures only",
          "Longitudinal mentorship and handover feedback",
          "No mentor support",
          "Written exams only",
        ],
        correctAnswer: "Longitudinal mentorship and handover feedback",
        explanation: "Structured mentorship beats single lectures.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-au-c-002",
      part: "C",
      countryCode: "AU",
      title: "Rural health — fly-in workforce",
      localeContext: "Rural Doctors Association",
      durationMinutes: 22,
      tags: ["reading:part-c"],
      paragraphs: [
        "The speaker acknowledges that overseas-trained doctors sustain rural services but warns that without cultural orientation to Aboriginal communities, clinical competence alone does not build trust.",
        "He supports bonded scholarships tying training placements to rural return-of-service periods.",
      ],
    },
    [
      {
        id: "r-au-c-002-q1",
        prompt: "Trust in Aboriginal communities requires…",
        options: [
          "Clinical skill alone",
          "Cultural orientation beyond clinical competence",
          "Urban-only training",
          "Shorter consultations",
        ],
        correctAnswer: "Cultural orientation beyond clinical competence",
        explanation: "Cultural orientation needed alongside clinical skill.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-us-c-002",
      part: "C",
      countryCode: "US",
      title: "Hospital language access lawsuit",
      localeContext: "Healthcare law commentary",
      durationMinutes: 22,
      tags: ["reading:part-c"],
      paragraphs: [
        "The author contends that relying on bilingual family members for consent continues despite federal guidance because hospitals underfund interpreter services, creating preventable adverse events among Spanish-speaking patients.",
        "She recommends budgeting qualified interpreter hours per emergency department shift rather than per incident.",
      ],
    },
    [
      {
        id: "r-us-c-002-q1",
        prompt: "The author blames adverse events partly on…",
        options: [
          "Patient literacy only",
          "Underfunded interpreter services",
          "Too many regulations",
          "Excess CPD",
        ],
        correctAnswer: "Underfunded interpreter services",
        explanation: "Underfunding leads to family interpreting and harm.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-ie-c-002",
      part: "C",
      countryCode: "IE",
      title: "Sláintecare primary care shift",
      localeContext: "Policy analyst",
      durationMinutes: 22,
      tags: ["reading:part-c"],
      paragraphs: [
        "The analyst is cautiously optimistic about moving care from hospitals to community teams but notes that GP capacity in rural Ireland remains the bottleneck, especially for migrants awaiting registration recognition.",
        "She urges aligned social care packages before expanding eligibility lists.",
      ],
    },
    [
      {
        id: "r-ie-c-002-q1",
        prompt: "The main bottleneck is…",
        options: [
          "Hospital building costs",
          "GP capacity in rural areas",
          "Pharmacy closures",
          "Nursing uniforms",
        ],
        correctAnswer: "GP capacity in rural areas",
        explanation: "Rural GP capacity limits community shift.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-nz-c-002",
      part: "C",
      countryCode: "NZ",
      title: "PHARMAC funding equity",
      localeContext: "Health policy debate",
      durationMinutes: 22,
      tags: ["reading:part-c"],
      paragraphs: [
        "The debater argues PHARMAC should weight Māori and Pacific health gain more heavily in funding decisions, while opponents claim this risks politicising clinical cost-effectiveness analysis.",
        "Both sides agree clearer public reporting of subgroup evidence would improve legitimacy.",
      ],
    },
    [
      {
        id: "r-nz-c-002-q1",
        prompt: "Both sides agree on…",
        options: [
          "Eliminating PHARMAC",
          "Clearer public reporting of subgroup evidence",
          "No subgroup data",
          "US-style pricing",
        ],
        correctAnswer: "Clearer public reporting of subgroup evidence",
        explanation: "Both want better subgroup evidence reporting.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-ca-c-002",
      part: "C",
      countryCode: "CA",
      title: "Provincial licensure mobility",
      localeContext: "Canadian Medical Association forum",
      durationMinutes: 22,
      tags: ["reading:part-c"],
      paragraphs: [
        "The forum speaker supports pan-Canadian licensure portability but warns that French-language service requirements in Québec remain a distinct competency employers must assess, not assume from English practice elsewhere.",
        "International graduates still face province-specific practice-ready assessment pathways.",
      ],
    },
    [
      {
        id: "r-ca-c-002-q1",
        prompt: "Québec employers must assess…",
        options: [
          "English-only skills",
          "French-language service requirements",
          "US board certification",
          "UK GMC status only",
        ],
        correctAnswer: "French-language service requirements",
        explanation: "French service competency distinct from English practice.",
      },
    ],
  ),
];
