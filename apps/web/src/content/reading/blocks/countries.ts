import { readingBlock } from "./helpers";

/** Part B texts with locale-specific health-system vocabulary (6 OET destinations). */
export const COUNTRY_READING_BLOCKS = [
  readingBlock(
    {
      id: "r-uk-b-001",
      part: "B",
      title: "NHS trust visiting policy",
      countryCode: "UK",
      localeContext: "NHS acute trust · United Kingdom",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:skim"],
      paragraphs: [
        "From April, visiting on adult medical wards at Riverside NHS Foundation Trust will be 11:00–20:00. Two visitors per bed space apply; one carer may remain overnight when agreed with the ward sister or charge nurse.",
        "Anyone with respiratory symptoms should delay visiting and use ward iPads for video calls. Children under 12 require ward manager approval and must be supervised.",
        "During norovirus or COVID-19 outbreaks the trust may suspend visiting temporarily. Updates will appear on the trust intranet and at ward entrances.",
      ],
    },
    [
      {
        id: "r-uk-b-001-q1",
        prompt: "What is the main purpose of the policy?",
        options: [
          "Ban all visitors permanently",
          "Balance patient rest with carer access",
          "Reduce nursing documentation",
          "Charge for overnight stays",
        ],
        correctAnswer: "Balance patient rest with carer access",
        explanation: "The policy limits hours while allowing carer overnight stays when agreed.",
      },
      {
        id: "r-uk-b-001-q2",
        prompt: "How many visitors are permitted at one time?",
        options: ["One", "Two", "Three", "Unlimited"],
        correctAnswer: "Two",
        explanation: "Two visitors per bed space is stated in paragraph one.",
      },
      {
        id: "r-uk-b-001-q3",
        prompt: "When may visiting be suspended?",
        options: [
          "During infectious outbreaks",
          "Every bank holiday",
          "When GPs are unavailable",
          "During pharmacy stocktake",
        ],
        correctAnswer: "During infectious outbreaks",
        explanation: "Norovirus or COVID-19 outbreaks may trigger temporary suspension.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-uk-b-002",
      part: "B",
      title: "CQC inspection readiness memo",
      countryCode: "UK",
      localeContext: "Care Quality Commission · United Kingdom",
      durationMinutes: 22,
      difficulty: 2,
      tags: ["reading:part-b-gist", "reading:scan"],
      paragraphs: [
        "Clinical areas must display up-to-date mandatory training compliance on the staff board from Monday. Missing fire-drill records for Q4 must be uploaded to the governance folder by Wednesday.",
        "Medicines refrigerators require twice-daily temperature logs with corrective action documented when readings fall outside 2–8°C. Pharmacy will audit ward 6 on Thursday.",
        "The memo reminds teams that CQC may ask patients about dignity and involvement in decisions. Feedback cards should be offered at discharge.",
      ],
    },
    [
      {
        id: "r-uk-b-002-q1",
        prompt: "What must be visible on staff boards from Monday?",
        options: [
          "Holiday rosters only",
          "Mandatory training compliance",
          "Patient phone numbers",
          "Menu choices",
        ],
        correctAnswer: "Mandatory training compliance",
        explanation: "Paragraph one requires training compliance on staff boards.",
      },
      {
        id: "r-uk-b-002-q2",
        prompt: "Who will audit ward 6 refrigerators?",
        options: ["CQC directly", "Pharmacy", "Security", "Catering"],
        correctAnswer: "Pharmacy",
        explanation: "Pharmacy will audit ward 6 on Thursday.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-au-b-001",
      part: "B",
      title: "AHPRA continuing professional development reminder",
      countryCode: "AU",
      localeContext: "AHPRA registration · Australia",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:skim"],
      paragraphs: [
        "Registered practitioners must complete 20 hours of CPD per year, including at least 10 hours of interactive activities. Portfolio entries are due before renewal.",
        "From July, random audits will request evidence within 28 days. Acceptable evidence includes certificates, reflective notes, and supervisor sign-off for clinical hours.",
        "Practitioners working across multiple divisions must meet requirements for each registration held. AHPRA publishes case studies on its website.",
      ],
    },
    [
      {
        id: "r-au-b-001-q1",
        prompt: "How many CPD hours are required annually?",
        options: ["5", "10", "20", "40"],
        correctAnswer: "20",
        explanation: "Twenty hours of CPD per year is mandatory.",
      },
      {
        id: "r-au-b-001-q2",
        prompt: "What happens from July regarding audits?",
        options: [
          "CPD is optional",
          "Random audits may request evidence within 28 days",
          "All registrations are cancelled",
          "Only managers are audited",
        ],
        correctAnswer: "Random audits may request evidence within 28 days",
        explanation: "Random audits with a 28-day evidence window begin in July.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-au-b-002",
      part: "B",
      title: "Medicare Benefits Schedule update",
      countryCode: "AU",
      localeContext: "Medicare · Australia",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:scan"],
      paragraphs: [
        "Item numbers for telehealth chronic disease management have changed effective 1 May. Practices must update clinical software templates before billing.",
        "Bulk-billing incentives for eligible pensioners continue in regional areas but require correct patient concession card documentation at attendance.",
        "Incorrect item selection may trigger Services Australia recovery notices. The practice manager will run a weekly MBS compliance report.",
      ],
    },
    [
      {
        id: "r-au-b-002-q1",
        prompt: "What must practices update before billing?",
        options: [
          "Staff uniforms",
          "Clinical software templates",
          "Parking permits",
          "Social media pages",
        ],
        correctAnswer: "Clinical software templates",
        explanation: "Templates must reflect new telehealth item numbers.",
      },
      {
        id: "r-au-b-002-q2",
        prompt: "Incorrect MBS item selection may lead to…",
        options: [
          "Automatic bonus payments",
          "Recovery notices from Services Australia",
          "Free registration",
          "No consequences",
        ],
        correctAnswer: "Recovery notices from Services Australia",
        explanation: "Wrong items may trigger recovery notices.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-us-b-001",
      part: "B",
      title: "HIPAA privacy refresher",
      countryCode: "US",
      localeContext: "HIPAA compliance · United States",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:skim"],
      paragraphs: [
        "Protected health information must not be discussed in public elevators or cafeteria lines. Use secure messaging for patient identifiers.",
        "Screens must lock after 60 seconds of inactivity. Shared workstations require unique login credentials — never share passwords.",
        "Report suspected breaches to the privacy officer within one hour. The compliance team will coordinate required patient notification if applicable.",
      ],
    },
    [
      {
        id: "r-us-b-001-q1",
        prompt: "Where should PHI not be discussed?",
        options: [
          "Private offices only",
          "Public elevators or cafeteria lines",
          "Secure messaging apps",
          "Encrypted email",
        ],
        correctAnswer: "Public elevators or cafeteria lines",
        explanation: "Public areas are explicitly named as inappropriate for PHI discussion.",
      },
      {
        id: "r-us-b-001-q2",
        prompt: "How quickly must suspected breaches be reported?",
        options: ["Within one week", "Within one hour", "Never", "After annual review"],
        correctAnswer: "Within one hour",
        explanation: "The privacy officer must be notified within one hour.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-us-b-002",
      part: "B",
      title: "Joint Commission readiness bulletin",
      countryCode: "US",
      localeContext: "Joint Commission · United States",
      durationMinutes: 22,
      difficulty: 2,
      tags: ["reading:part-b-gist", "reading:scan"],
      paragraphs: [
        "Two patient identifiers must be used before medications, blood products, or procedures. Acceptable identifiers include name and date of birth or medical record number per hospital policy.",
        "Time-outs are mandatory in procedural areas — anyone may speak up if identity or site is uncertain.",
        "Surveyors may trace a patient journey from ED to floor. Ensure handoff documentation is complete and legible.",
      ],
    },
    [
      {
        id: "r-us-b-002-q1",
        prompt: "How many patient identifiers are required?",
        options: ["One", "Two", "Four", "None"],
        correctAnswer: "Two",
        explanation: "Two identifiers are required before meds, blood, or procedures.",
      },
      {
        id: "r-us-b-002-q2",
        prompt: "Who may halt a procedure if identity is uncertain?",
        options: [
          "Only the surgeon",
          "Anyone in the team",
          "Only administration",
          "No one",
        ],
        correctAnswer: "Anyone in the team",
        explanation: "Anyone may speak up during mandatory time-outs.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-ie-b-001",
      part: "B",
      title: "HSE hand hygiene campaign",
      countryCode: "IE",
      localeContext: "Health Service Executive · Ireland",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:skim"],
      paragraphs: [
        "Hand hygiene compliance on medical wards will be audited anonymously each week until year end. Results feed the national HSE quality dashboard.",
        "Alcohol gel is not a substitute for soap and water when hands are visibly soiled or after caring for patients with Clostridioides difficile.",
        "Staff with broken skin on hands must report to occupational health before patient contact. Cover with waterproof dressing when approved.",
      ],
    },
    [
      {
        id: "r-ie-b-001-q1",
        prompt: "When is gel alone insufficient?",
        options: [
          "Always",
          "When hands are visibly soiled or after C. difficile care",
          "Never",
          "Only at night",
        ],
        correctAnswer: "When hands are visibly soiled or after C. difficile care",
        explanation: "Soap and water is required in those situations.",
      },
      {
        id: "r-ie-b-001-q2",
        prompt: "Audit results are reported to…",
        options: [
          "Local restaurants",
          "National HSE quality dashboard",
          "Social media",
          "Private insurers only",
        ],
        correctAnswer: "National HSE quality dashboard",
        explanation: "Results feed the national HSE quality dashboard.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-nz-b-001",
      part: "B",
      title: "Te Whatu Ora patient safety notice",
      countryCode: "NZ",
      localeContext: "Te Whatu Ora · New Zealand",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:skim"],
      paragraphs: [
        "All clinical staff must complete the updated falls prevention e-learning module by 30 June. Ward champions will verify completion on the LMS.",
        "Bed rails are not restraint devices — assess each patient individually using the national falls toolkit.",
        "Incident reports for falls with harm must be entered within 24 hours to support national learning.",
      ],
    },
    [
      {
        id: "r-nz-b-001-q1",
        prompt: "What must staff complete by 30 June?",
        options: [
          "Parking registration",
          "Updated falls prevention e-learning",
          "Annual leave forms only",
          "Social club membership",
        ],
        correctAnswer: "Updated falls prevention e-learning",
        explanation: "The e-learning module deadline is 30 June.",
      },
      {
        id: "r-nz-b-001-q2",
        prompt: "Harmful falls must be reported within…",
        options: ["24 hours", "One month", "One year", "Never"],
        correctAnswer: "24 hours",
        explanation: "Incident reports with harm must be entered within 24 hours.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-ca-b-001",
      part: "B",
      title: "Provincial nursing standards update",
      countryCode: "CA",
      localeContext: "Provincial regulator · Canada",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:skim"],
      paragraphs: [
        "Registered nurses must document reassessment within 24 hours of a change in patient condition or after a transfer from emergency.",
        "Mandatory reporting of suspected abuse applies regardless of setting — long-term care, community, or acute hospital.",
        "Continuing competence portfolios are due at registration renewal. Random audits may request two complete patient care examples.",
      ],
    },
    [
      {
        id: "r-ca-b-001-q1",
        prompt: "When must nurses reassess and document?",
        options: [
          "Only at discharge",
          "Within 24 hours of condition change or ED transfer",
          "Once per year",
          "Never in community settings",
        ],
        correctAnswer: "Within 24 hours of condition change or ED transfer",
        explanation: "Reassessment within 24 hours is required after change or transfer.",
      },
      {
        id: "r-ca-b-001-q2",
        prompt: "Mandatory abuse reporting applies…",
        options: [
          "Only in hospitals",
          "Regardless of setting",
          "Only when police attend",
          "Never for elderly patients",
        ],
        correctAnswer: "Regardless of setting",
        explanation: "Reporting applies in all settings listed.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-ie-b-002",
      part: "B",
      title: "NMBI scope of practice reminder",
      countryCode: "IE",
      localeContext: "NMBI · Ireland",
      durationMinutes: 22,
      difficulty: 2,
      tags: ["reading:part-b-gist", "reading:scan"],
      paragraphs: [
        "Nurses must practise within their scope and escalate when tasks exceed competence. Delegation to healthcare assistants requires documented competency assessment.",
        "Prescription medicine administration follows the nine rights; double-check high-alert medicines with a second registered nurse where policy requires.",
        "Fitness to practise concerns should be discussed with the nurse manager before self-referral to NMBI when appropriate.",
      ],
    },
    [
      {
        id: "r-ie-b-002-q1",
        prompt: "Delegation to assistants requires…",
        options: [
          "Verbal agreement only",
          "Documented competency assessment",
          "No documentation",
          "Patient consent only",
        ],
        correctAnswer: "Documented competency assessment",
        explanation: "Delegation requires documented competency assessment.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-nz-b-002",
      part: "B",
      title: "Health NZ infection prevention memo",
      countryCode: "NZ",
      localeContext: "Health New Zealand · New Zealand",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:scan"],
      paragraphs: [
        "Surgical mask use in clinical corridors continues during winter respiratory season. Masks must cover nose and mouth.",
        "Single rooms for droplet precautions require sign-off on the isolation checklist at shift handover.",
        "Visitors who refuse hand hygiene may be asked to leave after education is provided.",
      ],
    },
    [
      {
        id: "r-nz-b-002-q1",
        prompt: "Isolation rooms require…",
        options: [
          "No documentation",
          "Checklist sign-off at handover",
          "Police attendance",
          "Permanent closure",
        ],
        correctAnswer: "Checklist sign-off at handover",
        explanation: "Isolation checklist sign-off is required at shift handover.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-ca-b-002",
      part: "B",
      title: "Canadian patient safety bulletin",
      countryCode: "CA",
      localeContext: "Patient Safety Institute · Canada",
      durationMinutes: 22,
      tags: ["reading:part-b-gist", "reading:scan"],
      paragraphs: [
        "Medication reconciliation at admission and discharge reduces adverse events. Compare home medicines with inpatient orders within 24 hours.",
        "Look-alike sound-alike drug pairs must be stored separately when possible. Pharmacists will label high-alert bins in red.",
        "Report near-misses without patient harm — they reveal system weaknesses before harm occurs.",
      ],
    },
    [
      {
        id: "r-ca-b-002-q1",
        prompt: "Medication reconciliation at admission should occur within…",
        options: ["24 hours", "One week", "One month", "Never"],
        correctAnswer: "24 hours",
        explanation: "Compare home medicines within 24 hours of admission.",
      },
    ],
  ),
];
