import type { WritingScenario } from "./types";

export const COUNTRY_WAVE3_SCENARIOS: WritingScenario[] = [
  // dentistry — NZ, CA
  {
    id: "w-dent-nz-wave3",
    profession: "dentistry",
    difficulty: 2,
    meta: {
      title: "Post-extraction dry socket management",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Williams",
      estimatedWordCount: 175,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Williams regarding Ms Thompson's alveolar osteitis following lower molar extraction three days ago.",
      bulletPoints: [
        "Acknowledge GP referral for persistent post-extraction pain",
        "Document extraction site findings and irrigation performed",
        "Outline dressing, analgesia, and oral hygiene advice",
        "State review interval and re-referral criteria",
      ],
    },
    caseNotes: [
      { id: "n1", date: "11/06/26", text: "Ms Kate Thompson, 38y — dry socket review", relevant: true },
      { id: "n2", text: "LR7 extracted 08/06/26; severe throbbing pain day 3", relevant: true },
      { id: "n3", text: "Socket empty; no pus; alveolar bone visible", relevant: true },
      { id: "n4", text: "Irrigated with chlorhexidine; Alvogyl dressing placed", relevant: true },
      { id: "n5", text: "Ibuprofen + paracetamol chart; avoid smoking; review 48h", relevant: true },
      { id: "n6", text: "Works as primary school teacher", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply documenting dry socket treatment and analgesia plan",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-dent-ca-wave3",
    profession: "dentistry",
    difficulty: 2,
    meta: {
      title: "Paediatric dental avulsion referral",
      letterType: "referral",
      readerRole: "Paediatric Dentist",
      readerName: "Dr Tremblay",
      estimatedWordCount: 180,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Refer Liam (9 years) to paediatric dentist Dr Tremblay after traumatic avulsion of his maxillary central incisor at hockey practice.",
      bulletPoints: [
        "State injury mechanism and time since avulsion",
        "Document emergency splinting and storage medium used",
        "Note tetanus status and soft tissue injuries",
        "Request specialist endodontic and splint review",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Liam Dubois, 9y — dental trauma emergency", relevant: true },
      { id: "n2", text: "Avulsed UR1 45 min ago; stored in Hank's solution en route", relevant: true },
      { id: "n3", text: "Tooth reimplanted and splinted with composite wire", relevant: true },
      { id: "n4", text: "Tetanus up to date; lip laceration sutured by ED", relevant: true },
      { id: "n5", text: "Refer paediatric dentist within 24h for pulp extirpation plan", relevant: true },
      { id: "n6", text: "Father is team coach", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Urgent paediatric referral after tooth avulsion and splinting",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // physiotherapy — AU, CA
  {
    id: "w-phys-au-wave3",
    profession: "physiotherapy",
    difficulty: 2,
    meta: {
      title: "Total knee replacement prehab plan",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Chen",
      estimatedWordCount: 185,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Chen regarding pre-operative physiotherapy for Mr Singh, listed for elective total knee replacement in six weeks.",
      bulletPoints: [
        "Acknowledge referral and surgical timeline",
        "Document strength, range of motion, and functional limits",
        "Outline prehab exercise programme and education provided",
        "State expected post-operative referral pathway",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Mr Harpreet Singh, 67y — TKR prehab assessment", relevant: true },
      { id: "n2", text: "Severe medial compartment OA; TKR booked 22/07/26", relevant: true },
      { id: "n3", text: "Knee flexion 105°; quads strength 3+/5; walks 200m with stick", relevant: true },
      { id: "n4", text: "Programme: quads sets, heel slides, stationary bike 10 min daily", relevant: true },
      { id: "n5", text: "Post-op PT referral arranged; review pre-op week 5", relevant: true },
      { id: "n6", text: "Retired accountant", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply with TKR prehab plan and post-operative pathway",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-phys-ca-wave3",
    profession: "physiotherapy",
    difficulty: 2,
    meta: {
      title: "Vestibular hypofunction rehabilitation",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Tremblay",
      estimatedWordCount: 190,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay summarising vestibular rehabilitation for Mrs Lavoie with persistent imbalance after vestibular neuritis.",
      bulletPoints: [
        "State onset, duration, and current symptom pattern",
        "Document vestibular assessment and fall risk",
        "Outline habituation and gaze-stability exercises",
        "Recommend medication review if nausea persists",
      ],
    },
    caseNotes: [
      { id: "n1", date: "12/06/26", text: "Mrs Marie Lavoie, 58y — vestibular rehab week 3", relevant: true },
      { id: "n2", text: "Vestibular neuritis 8 weeks ago; ongoing imbalance on head turn", relevant: true },
      { id: "n3", text: "Positive head impulse test left; dynamic visual acuity reduced", relevant: true },
      { id: "n4", text: "Gaze-stability and balance retraining programme progressed", relevant: true },
      { id: "n5", text: "Request GP review betahistine if vertigo limits exercises", relevant: true },
      { id: "n6", text: "Enjoys cross-country skiing", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advise GP on vestibular rehab progress and medication review",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // occupational therapy — UK, NZ
  {
    id: "w-ot-uk-wave3",
    profession: "occupational_therapy",
    difficulty: 2,
    meta: {
      title: "Rheumatoid arthritis hand splinting",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Patel",
      estimatedWordCount: 185,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Patel regarding occupational therapy for Ms Okonkwo with rheumatoid arthritis and ulnar drift affecting daily tasks.",
      bulletPoints: [
        "Acknowledge referral for hand pain and functional limits",
        "Document joint assessment and splint provision",
        "Outline joint protection and energy conservation training",
        "Recommend rheumatology review if morning stiffness worsens",
      ],
    },
    caseNotes: [
      { id: "n1", date: "13/06/26", text: "Ms Amara Okonkwo, 52y — RA hand OT assessment", relevant: true },
      { id: "n2", text: "Ulnar drift MCPs; grip painful; difficulty opening jars", relevant: true },
      { id: "n3", text: "Resting hand splint fitted for night use", relevant: true },
      { id: "n4", text: "Joint protection education; ergonomic kitchen aids supplied", relevant: true },
      { id: "n5", text: "Refer rheumatology if stiffness >60 min despite DMARDs", relevant: true },
      { id: "n6", text: "Works as hospital administrator", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply documenting RA hand splinting and functional training",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-ot-nz-wave3",
    profession: "occupational_therapy",
    difficulty: 2,
    meta: {
      title: "Traumatic brain injury cognitive rehab",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Williams",
      estimatedWordCount: 195,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to Dr Williams summarising cognitive rehabilitation for Mr Harrison, eight weeks after a moderate traumatic brain injury.",
      bulletPoints: [
        "State injury context and current cognitive complaints",
        "Document assessment findings and compensatory strategies",
        "Outline graded return to driving and work activities",
        "Recommend GP review of sleep and mood symptoms",
      ],
    },
    caseNotes: [
      { id: "n1", date: "15/06/26", text: "Mr James Harrison, 34y — TBI week 8 OT review", relevant: true },
      { id: "n2", text: "MVA concussion + contusion; reports memory lapses and fatigue", relevant: true },
      { id: "n3", text: "MoCA 22/30; pacing diary and smartphone reminders introduced", relevant: true },
      { id: "n4", text: "Graded return to desk work 3h/day; no driving until OT clearance", relevant: true },
      { id: "n5", text: "Advise GP screen depression and sleep if fatigue persists", relevant: true },
      { id: "n6", text: "Partner is primary support person", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advise GP on TBI cognitive rehab and return-to-activity plan",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // podiatry — AU, NZ, CA
  {
    id: "w-pod-au-wave3",
    profession: "podiatry",
    difficulty: 2,
    meta: {
      title: "Achilles tendinopathy loading plan",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Chen",
      estimatedWordCount: 170,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Chen regarding Mr O'Connor, referred with mid-portion Achilles tendinopathy affecting running training.",
      bulletPoints: [
        "Acknowledge referral and symptom duration",
        "Summarise examination and loading capacity",
        "Document eccentric programme and footwear advice",
        "State review timeline and imaging criteria",
      ],
    },
    caseNotes: [
      { id: "n1", date: "09/06/26", text: "Mr Sean O'Connor, 39y — Achilles pain 10 weeks", relevant: true },
      { id: "n2", text: "Mid-portion tenderness; painful hop test; no calf tear signs", relevant: true },
      { id: "n3", text: "Alfredson eccentric programme commenced; heel drop modified", relevant: true },
      { id: "n4", text: "Running paused; cross-training cycling permitted", relevant: true },
      { id: "n5", text: "Review 6 weeks; ultrasound if no progress", relevant: true },
      { id: "n6", text: "Training for half-marathon", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply with Achilles tendinopathy loading programme",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-pod-nz-wave3",
    profession: "podiatry",
    difficulty: 2,
    meta: {
      title: "Refractory onychomycosis treatment",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Williams",
      estimatedWordCount: 175,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to Dr Williams regarding podiatric management of Ms Rangi with long-standing toenail fungal infection unresponsive to topical therapy.",
      bulletPoints: [
        "State duration and prior treatments attempted",
        "Document nail appearance and mycology if taken",
        "Outline debridement plan and systemic therapy discussion",
        "Request GP prescription if oral antifungal agreed",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Ms Hine Rangi, 61y — onychomycosis review", relevant: true },
      { id: "n2", text: "Dystrophic hallux nails x 2 years; topical amorolfine failed", relevant: true },
      { id: "n3", text: "Nail clipping sent for PAS stain; KOH pending", relevant: true },
      { id: "n4", text: "Monthly podiatric debridement planned", relevant: true },
      { id: "n5", text: "Discussed oral terbinafine; request GP prescribe if LFTs acceptable", relevant: true },
      { id: "n6", text: "Enjoys kapa haka", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advise GP on refractory onychomycosis and systemic therapy request",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-pod-ca-wave3",
    profession: "podiatry",
    difficulty: 2,
    meta: {
      title: "Charcot foot offloading referral",
      letterType: "referral",
      readerRole: "General Practitioner",
      readerName: "Dr Tremblay",
      estimatedWordCount: 185,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay requesting coordinated management for Mr Bouchard with suspected Charcot neuroarthropathy of the midfoot.",
      bulletPoints: [
        "State suspicion basis and diabetes control context",
        "Document foot temperature, deformity, and sensation",
        "Outline total contact cast and offloading initiated",
        "Request GP glycaemic review and endocrine co-management",
      ],
    },
    caseNotes: [
      { id: "n1", date: "11/06/26", text: "Mr Pierre Bouchard, 64y — type 2 diabetes", relevant: true },
      { id: "n2", text: "Warm swollen midfoot; rocker-bottom deformity developing", relevant: true },
      { id: "n3", text: "Loss of protective sensation; HbA1c 9.2% last month", relevant: true },
      { id: "n4", text: "Total contact cast applied; non-weight-bearing x 6 weeks", relevant: true },
      { id: "n5", text: "Request GP urgent glycaemic optimisation and endocrine referral", relevant: true },
      { id: "n6", text: "Retired carpenter", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Referral-style letter requesting GP co-management of Charcot foot",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // optometry — UK, CA
  {
    id: "w-opt-uk-wave3",
    profession: "optometry",
    difficulty: 2,
    meta: {
      title: "Acute posterior vitreous detachment",
      letterType: "referral",
      readerRole: "Ophthalmologist",
      readerName: "Dr Patel",
      estimatedWordCount: 180,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Refer Mrs Adebayo to ophthalmologist Dr Patel for same-week review of acute posterior vitreous detachment with floaters and flashes.",
      bulletPoints: [
        "State acute symptom onset and visual disturbance",
        "Document dilated examination and vitreous findings",
        "Note absence or presence of retinal tear signs",
        "Request urgent retinal assessment",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Mrs Grace Adebayo, 58y — acute floaters and flashes", relevant: true },
      { id: "n2", text: "Symptoms began yesterday; cobweb floaters R eye", relevant: true },
      { id: "n3", text: "VA 6/6 OU; PVD confirmed; no tear seen today", relevant: true },
      { id: "n4", text: "Peripheral retina examined; lattice degeneration noted", relevant: true },
      { id: "n5", text: "Urgent ophthalmology within 1 week; warned of curtain vision loss", relevant: true },
      { id: "n6", text: "Drives for community nursing visits", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Urgent referral for PVD with lattice degeneration monitoring",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-opt-ca-wave3",
    profession: "optometry",
    difficulty: 2,
    meta: {
      title: "Ocular hypertension monitoring plan",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Tremblay",
      estimatedWordCount: 175,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay outlining monitoring for Mr Gagnon with ocular hypertension and family history of glaucoma.",
      bulletPoints: [
        "State examination findings and IOP readings",
        "Document optic nerve and visual field status",
        "Outline drop initiation and follow-up interval",
        "Request GP awareness of systemic beta-blocker interactions",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Mr Louis Gagnon, 55y — routine eye examination", relevant: true },
      { id: "n2", text: "IOP 26 mmHg OU; corneal thickness average", relevant: true },
      { id: "n3", text: "Optic discs healthy; visual fields full today", relevant: true },
      { id: "n4", text: "Father had glaucoma; started latanoprost OU nocte", relevant: true },
      { id: "n5", text: "Review 6 weeks; contact if red eye or vision change", relevant: true },
      { id: "n6", text: "Works night shifts in warehouse", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advise GP on ocular hypertension treatment and monitoring",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // dietetics — NZ, CA
  {
    id: "w-diet-nz-wave3",
    profession: "dietetics",
    difficulty: 2,
    meta: {
      title: "Heart failure sodium restriction plan",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Williams",
      estimatedWordCount: 175,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to Dr Williams summarising dietary counselling for Mr Wallace with newly decompensated heart failure and fluid overload.",
      bulletPoints: [
        "State admission context and current weight trend",
        "Document sodium and fluid restriction education",
        "Outline practical meal strategies and label reading",
        "Arrange dietetic review after diuretic stabilisation",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Mr Robert Wallace, 71y — HF dietetics review", relevant: true },
      { id: "n2", text: "Admitted with oedema; weight up 3 kg in 2 weeks", relevant: true },
      { id: "n3", text: "Sodium limit 1500 mg/day; fluid 1.5 L/day explained", relevant: true },
      { id: "n4", text: "Low-salt cooking handout; avoid processed meats and soups", relevant: true },
      { id: "n5", text: "Review 3 weeks post-discharge; daily weights chart supplied", relevant: true },
      { id: "n6", text: "Wife assists with shopping", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advice letter on heart failure sodium and fluid restriction",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-diet-ca-wave3",
    profession: "dietetics",
    difficulty: 2,
    meta: {
      title: "Crohn's disease flare nutrition",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Tremblay",
      estimatedWordCount: 180,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay outlining nutritional support for Ms Roy during a moderate Crohn's disease flare with reduced oral intake.",
      bulletPoints: [
        "State disease activity and recent weight change",
        "Document symptom-related dietary modifications",
        "Outline low-residue plan and micronutrient concerns",
        "Recommend GP review if weight loss continues",
      ],
    },
    caseNotes: [
      { id: "n1", date: "11/06/26", text: "Ms Sophie Roy, 29y — Crohn's flare dietetics", relevant: true },
      { id: "n2", text: "Increased stool frequency; abdominal cramping x 2 weeks", relevant: true },
      { id: "n3", text: "Weight down 2 kg; appetite poor; avoiding high-fibre foods", relevant: true },
      { id: "n4", text: "Low-residue, high-protein small meals; oral supplement BD", relevant: true },
      { id: "n5", text: "Monitor iron and vitamin D; GP review if loss >3% body weight", relevant: true },
      { id: "n6", text: "Graduate student in education", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Summarise Crohn's flare nutrition support for GP",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // radiography — IE, NZ, CA
  {
    id: "w-rad-ie-wave3",
    profession: "radiography",
    difficulty: 2,
    meta: {
      title: "Abdominal ultrasound gallstones report",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr O'Brien",
      estimatedWordCount: 170,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Write to Dr O'Brien with abdominal ultrasound findings for Mrs Keane, investigated for recurrent right upper quadrant pain.",
      bulletPoints: [
        "State examination performed and clinical indication",
        "Describe gallbladder and bile duct findings",
        "Note liver and pancreatic appearances",
        "Recommend correlation with LFTs and surgical referral if indicated",
      ],
    },
    caseNotes: [
      { id: "n1", date: "09/06/26", text: "Mrs Niamh Keane, 47y — RUQ ultrasound", relevant: true },
      { id: "n2", text: "Multiple gallstones; gallbladder wall normal", relevant: true },
      { id: "n3", text: "Common bile duct 4 mm; no intrahepatic dilatation", relevant: true },
      { id: "n4", text: "Liver echotexture normal; pancreas obscured by gas", relevant: true },
      { id: "n5", text: "Suggest surgical referral if pain recurrent despite diet modification", relevant: true },
      { id: "n6", text: "Non-smoker", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Communicate gallstone ultrasound findings to GP",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-rad-nz-wave3",
    profession: "radiography",
    difficulty: 2,
    meta: {
      title: "CT head stroke exclusion report",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Williams",
      estimatedWordCount: 170,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to Dr Williams with non-contrast CT head findings for Mr Tanaka, assessed in ED for sudden left arm weakness.",
      bulletPoints: [
        "State examination performed and clinical indication",
        "Describe haemorrhage or infarct findings",
        "Note incidental findings if present",
        "Recommend urgent neurology follow-up per stroke pathway",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Mr Hiro Tanaka, 68y — CT head for acute neuro symptoms", relevant: true },
      { id: "n2", text: "Onset left arm weakness 2 hours ago; FAST positive", relevant: true },
      { id: "n3", text: "No acute intracranial haemorrhage or established infarct", relevant: true },
      { id: "n4", text: "Chronic small vessel ischaemic changes; age-related atrophy", relevant: true },
      { id: "n5", text: "MRI brain recommended per stroke team; neurology notified", relevant: true },
      { id: "n6", text: "Lives with daughter in Christchurch", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Communicate negative CT head with stroke pathway recommendation",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-rad-ca-wave3",
    profession: "radiography",
    difficulty: 2,
    meta: {
      title: "Screening mammography recall report",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Tremblay",
      estimatedWordCount: 175,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay regarding screening mammography for Ms Fortin, recalled for focal asymmetry in the left breast.",
      bulletPoints: [
        "State examination type and screening context",
        "Describe mammographic finding and BI-RADS category",
        "Outline recommended diagnostic work-up",
        "Note patient notification and anxiety counselling",
      ],
    },
    caseNotes: [
      { id: "n1", date: "12/06/26", text: "Ms Isabelle Fortin, 54y — screening mammogram", relevant: true },
      { id: "n2", text: "Focal asymmetry left upper outer quadrant", relevant: true },
      { id: "n3", text: "BI-RADS 0 — incomplete; diagnostic mammogram + ultrasound needed", relevant: true },
      { id: "n4", text: "No palpable lump on clinical correlation today", relevant: true },
      { id: "n5", text: "Recall appointment booked; patient counselled on likely benign causes", relevant: true },
      { id: "n6", text: "Family history: mother breast cancer age 62", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Inform GP of mammography recall and diagnostic work-up",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // speech pathology — AU, NZ, CA
  {
    id: "w-sp-au-wave3",
    profession: "speech_pathology",
    difficulty: 2,
    meta: {
      title: "Post-stroke aphasia therapy update",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Chen",
      estimatedWordCount: 185,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Write to Dr Chen summarising speech pathology progress for Mr Papadopoulos, four weeks after ischaemic stroke with expressive aphasia.",
      bulletPoints: [
        "State stroke timeline and communication deficits",
        "Document therapy goals and strategies taught",
        "Outline carer communication training provided",
        "Recommend GP review of mood and carer strain",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Mr Nikos Papadopoulos, 66y — aphasia week 4", relevant: true },
      { id: "n2", text: "Non-fluent aphasia; word-finding difficulty; comprehension fair", relevant: true },
      { id: "n3", text: "Script training and semantic feature analysis commenced", relevant: true },
      { id: "n4", text: "Wife trained in supported conversation techniques", relevant: true },
      { id: "n5", text: "Advise GP screen depression; SLT review 6 weeks", relevant: true },
      { id: "n6", text: "Retired restaurateur", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Update GP on post-stroke aphasia rehabilitation progress",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-sp-nz-wave3",
    profession: "speech_pathology",
    difficulty: 2,
    meta: {
      title: "Parkinson's hypophonic dysarthria plan",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Williams",
      estimatedWordCount: 180,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to Dr Williams regarding speech pathology management of Mrs McKenzie with Parkinson's disease and declining speech clarity.",
      bulletPoints: [
        "State diagnosis duration and communication concerns",
        "Document voice and speech assessment findings",
        "Outline LSVT LOUD principles and home practice",
        "Recommend medication timing review if voice worse off-period",
      ],
    },
    caseNotes: [
      { id: "n1", date: "13/06/26", text: "Mrs Fiona McKenzie, 72y — PD dysarthria assessment", relevant: true },
      { id: "n2", text: "PD 6 years; family reports soft mumbling speech", relevant: true },
      { id: "n3", text: "Reduced vocal loudness; monotone prosody; intelligibility fair", relevant: true },
      { id: "n4", text: "LSVT LOUD programme 4 sessions/week x 4 weeks planned", relevant: true },
      { id: "n5", text: "Suggest GP review levodopa timing if voice worse before doses", relevant: true },
      { id: "n6", text: "Member of garden club", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advise GP on Parkinson's dysarthria therapy and medication timing",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-sp-ca-wave3",
    profession: "speech_pathology",
    difficulty: 2,
    meta: {
      title: "Tracheostomy speaking valve trial",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Tremblay",
      estimatedWordCount: 185,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay summarising speech pathology input for Mr Leclerc, post ICU tracheostomy, now trialling a speaking valve.",
      bulletPoints: [
        "State tracheostomy indication and current respiratory status",
        "Document swallow and voicing assessment results",
        "Outline speaking valve trial and carer training",
        "Specify red flags requiring urgent ENT or respiratory review",
      ],
    },
    caseNotes: [
      { id: "n1", date: "15/06/26", text: "Mr Jean Leclerc, 58y — tracheostomy week 3", relevant: true },
      { id: "n2", text: "Prolonged ventilation after pneumonia; cuff deflated today", relevant: true },
      { id: "n3", text: "FEES: silent aspiration thin fluids; thickened fluids safe", relevant: true },
      { id: "n4", text: "Passy-Muir valve tolerated 2h; weak voicing achieved", relevant: true },
      { id: "n5", text: "Urgent review if desaturation, distress, or inability to clear secretions", relevant: true },
      { id: "n6", text: "Daughter visiting daily", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advise GP on tracheostomy speaking valve trial and safety flags",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // veterinary science — NZ, CA
  {
    id: "w-vet-nz-wave3",
    profession: "veterinary_science",
    difficulty: 2,
    meta: {
      title: "Feline hyperthyroid treatment plan",
      letterType: "advice",
      readerRole: "Referring Veterinarian",
      readerName: "Dr Williams",
      estimatedWordCount: 180,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to referring veterinarian Dr Williams updating management of Coco, a geriatric cat newly diagnosed with hyperthyroidism.",
      bulletPoints: [
        "Identify patient, age, and owner",
        "Document thyroid and renal parameters",
        "Outline methimazole initiation and monitoring schedule",
        "State when to consider radioiodine or surgery",
      ],
    },
    caseNotes: [
      { id: "n1", date: "17/06/26", text: "Coco, 13y DSH cat, owner Mrs Patel", relevant: true },
      { id: "n2", text: "T4 elevated; weight loss despite good appetite", relevant: true },
      { id: "n3", text: "Methimazole 2.5mg BD commenced; BP 170 mmHg", relevant: true },
      { id: "n4", text: "Renal values WNL today; recheck T4 and creatinine 3 weeks", relevant: true },
      { id: "n5", text: "Discuss radioiodine if stable on medical therapy", relevant: true },
      { id: "n6", text: "Indoor-only cat", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Update referring vet on feline hyperthyroid medical management",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-vet-ca-wave3",
    profession: "veterinary_science",
    difficulty: 2,
    meta: {
      title: "Canine cruciate ligament surgical referral",
      letterType: "referral",
      readerRole: "Orthopaedic Surgeon",
      readerName: "Dr Tremblay",
      estimatedWordCount: 175,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Refer Max, a large-breed dog with cranial cruciate ligament rupture, to orthopaedic surgeon Dr Tremblay for TPLO assessment.",
      bulletPoints: [
        "Identify patient, breed, and owner",
        "Describe lameness duration and examination findings",
        "Document radiograph and drawer test results",
        "Request surgical assessment and pain management plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Max, 5y male Rottweiler, owner Mr Gagnon", relevant: true },
      { id: "n2", text: "Acute RH lameness after park play; partial weight-bearing", relevant: true },
      { id: "n3", text: "Positive cranial drawer RH; medial buttress palpable", relevant: true },
      { id: "n4", text: "Radiographs: stifle effusion; tibial thrust positive", relevant: true },
      { id: "n5", text: "Carprofen prescribed; refer TPLO within 2 weeks", relevant: true },
      { id: "n6", text: "Attends obedience classes", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Refer for surgical repair of canine cruciate ligament rupture",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];
