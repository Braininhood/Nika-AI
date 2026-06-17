import type { WritingScenario } from "./types";

export const DENTISTRY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-dent-003",
    profession: "dentistry",
    difficulty: 2,
    meta: {
      title: "Third molar surgical referral",
      letterType: "referral",
      readerRole: "Oral Surgeon",
      readerName: "Dr Fiona Walsh",
      estimatedWordCount: 185,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Refer Mr Okafor to Dr Walsh for assessment of symptomatic lower third molars.",
      bulletPoints: [
        "State reason for referral and symptoms",
        "Document examination and radiograph findings",
        "Note medical history relevant to surgery",
        "Request assessment and treatment plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "11/06/26", text: "Mr Chidi Okafor, 26y — dental emergency", relevant: true },
      { id: "n2", text: "C/o recurrent pericoronal pain LL8 x 3 weeks", relevant: true },
      { id: "n3", text: "OPG: mesioangular LL8, partial eruption; no caries", relevant: true },
      { id: "n4", text: "Medical hx: mild asthma, salbutamol PRN", relevant: true },
      { id: "n5", text: "Smokes 5/day; counselled to stop pre-op", relevant: true },
      { id: "n6", text: "Works as graphic designer", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Refer for surgical assessment of impacted third molar",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-dent-004",
    profession: "dentistry",
    difficulty: 2,
    meta: {
      title: "Periodontal maintenance to GP",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Lisa Park",
      estimatedWordCount: 175,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Park regarding Mr Nguyen's periodontal maintenance and glycaemic control in the context of type 2 diabetes.",
      bulletPoints: [
        "Acknowledge referral for bleeding gums",
        "Summarise periodontal findings and treatment completed",
        "Link diabetes control to periodontal outcomes",
        "Recommend coordinated follow-up intervals",
      ],
    },
    caseNotes: [
      { id: "n1", date: "13/06/26", text: "Mr Duc Nguyen, 55y — periodontal review", relevant: true },
      { id: "n2", text: "Generalised BOP; pockets 5–6mm posterior sextants", relevant: true },
      { id: "n3", text: "Scale and root plan completed; OHI reinforced", relevant: true },
      { id: "n4", text: "HbA1c 64 mmol/mol per GP letter — discussed with patient", relevant: true },
      { id: "n5", text: "Recall 3 months; request GP review if HbA1c not improving", relevant: true },
      { id: "n6", text: "Patient cycles to work daily", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply documenting periodontal care and diabetes link",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];

export const PHYSIOTHERAPY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-phys-004",
    profession: "physiotherapy",
    difficulty: 2,
    meta: {
      title: "Low back pain reply to GP",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Helen Marsh",
      estimatedWordCount: 190,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Marsh regarding Ms Turner, referred with subacute low back pain without red flags.",
      bulletPoints: [
        "Acknowledge referral",
        "Summarise assessment findings and functional goals",
        "Outline treatment provided and home exercise plan",
        "State discharge or review plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "09/06/26", text: "Ms Laura Turner, 34y, referred — LBP 6 weeks", relevant: true },
      { id: "n2", text: "No red flags; SLR negative; lumbar flexion limited", relevant: true },
      { id: "n3", text: "6 sessions completed: manual therapy + core programme", relevant: true },
      { id: "n4", text: "Returned to desk work; pain NPRS 3/10 from 7/10", relevant: true },
      { id: "n5", text: "Discharged with HEP; review if symptoms worsen", relevant: true },
      { id: "n6", text: "Patient runs marathons", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply with assessment, treatment, and discharge plan",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-phys-005",
    profession: "physiotherapy",
    difficulty: 2,
    meta: {
      title: "ACL post-op rehab update",
      letterType: "advice",
      readerRole: "Orthopaedic Surgeon",
      readerName: "Dr Tom Becker",
      estimatedWordCount: 185,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to Dr Becker updating rehabilitation progress for Ms Chen, six weeks post ACL reconstruction.",
      bulletPoints: [
        "State purpose and post-operative week",
        "Document range of motion and strength milestones",
        "Outline current exercise programme and restrictions",
        "Request surgical review if extension lag persists",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Ms Amy Chen, 28y — post ACLR week 6", relevant: true },
      { id: "n2", text: "Flexion 115°, extension −5°; mild effusion", relevant: true },
      { id: "n3", text: "Quadriceps strength 60% vs contralateral limb", relevant: true },
      { id: "n4", text: "Programme: closed-chain strengthening, bike, balance", relevant: true },
      { id: "n5", text: "No running until surgeon clearance; extension lag noted", relevant: true },
      { id: "n6", text: "Patient is physiotherapy student", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Update surgeon on rehab milestones and extension concern",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];

export const OCCUPATIONAL_THERAPY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-ot-005",
    profession: "occupational_therapy",
    difficulty: 2,
    meta: {
      title: "Stroke home adaptation report",
      letterType: "discharge",
      readerRole: "General Practitioner",
      readerName: "Dr Mark Ellis",
      estimatedWordCount: 200,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Write to Dr Ellis summarising occupational therapy input for Mr Nguyen after mild stroke and home discharge.",
      bulletPoints: [
        "State purpose and patient context",
        "Document functional assessment and equipment provided",
        "Outline carer training and community supports",
        "Recommend GP follow-up priorities",
      ],
    },
    caseNotes: [
      { id: "n1", date: "13/06/26", text: "Mr Minh Nguyen, 68y, discharged home yesterday", relevant: true },
      { id: "n2", text: "Right-sided weakness; independent transfers with rail", relevant: true },
      { id: "n3", text: "Installed shower chair, grab rails, raised toilet seat", relevant: true },
      { id: "n4", text: "Wife trained in safe mobility; Meals on Wheels arranged", relevant: true },
      { id: "n5", text: "Recommend GP review fatigue and mood in 2 weeks", relevant: true },
      { id: "n6", text: "Patient previously worked as accountant", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Discharge summary of OT home setup after stroke",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-ot-006",
    profession: "occupational_therapy",
    difficulty: 2,
    meta: {
      title: "Workplace return-to-work plan",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Naomi Fraser",
      estimatedWordCount: 190,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Fraser outlining a graded return-to-work plan for Mr Olsen after a wrist fracture.",
      bulletPoints: [
        "State injury and current functional capacity",
        "Describe workplace assessment and modifications",
        "Outline phased hours and task restrictions",
        "Request GP support for fit-to-work certificate",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Mr Erik Olsen, 41y — OT workplace assessment", relevant: true },
      { id: "n2", text: "Distal radius fracture ORIF 8 weeks ago; grip strength improving", relevant: true },
      { id: "n3", text: "Office role; ergonomic keyboard and padded mouse recommended", relevant: true },
      { id: "n4", text: "Plan: 4h/day week 1, 6h week 2, full hours week 3", relevant: true },
      { id: "n5", text: "Avoid heavy lifting >5 kg until orthopaedic review", relevant: true },
      { id: "n6", text: "Patient coaches youth hockey", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Graded RTW plan with ergonomic modifications",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];

export const PODIATRY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-pod-006",
    profession: "podiatry",
    difficulty: 2,
    meta: {
      title: "Diabetic foot ulcer referral",
      letterType: "referral",
      readerRole: "Vascular Surgeon",
      readerName: "Mr Robert Hale",
      estimatedWordCount: 185,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Refer Mr Peters to Mr Hale for vascular assessment of a non-healing diabetic foot ulcer.",
      bulletPoints: [
        "State referral reason and ulcer duration",
        "Document wound size, location, and infection status",
        "Include diabetes control and offloading measures",
        "Request urgent vascular review",
      ],
    },
    caseNotes: [
      { id: "n1", date: "12/06/26", text: "Mr Alan Peters, 59y, type 2 diabetes", relevant: true },
      { id: "n2", text: "Plantar ulcer left foot 1.2cm; no probing to bone", relevant: true },
      { id: "n3", text: "HbA1c 68 mmol/mol; on metformin + gliclazide", relevant: true },
      { id: "n4", text: "Offloading boot supplied; no systemic infection signs", relevant: true },
      { id: "n5", text: "DP pulses weak; capillary refill delayed", relevant: true },
      { id: "n6", text: "Patient attends football weekly", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Urgent vascular referral for diabetic foot ulcer with poor pulses",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-pod-007",
    profession: "podiatry",
    difficulty: 1,
    meta: {
      title: "Ingrown toenail procedure summary",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Sean Murphy",
      estimatedWordCount: 165,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Murphy confirming partial nail avulsion for Ms Walsh and post-procedure care.",
      bulletPoints: [
        "Confirm procedure performed and indication",
        "Document anaesthesia and wound care advice",
        "State expected healing timeline",
        "Advise when to re-refer if recurrence",
      ],
    },
    caseNotes: [
      { id: "n1", date: "12/06/26", text: "Ms Fiona Walsh, 22y — ingrown hallux nail", relevant: true },
      { id: "n2", text: "Partial nail avulsion with phenolisation today", relevant: true },
      { id: "n3", text: "Local anaesthetic; dressing applied; walking permitted", relevant: true },
      { id: "n4", text: "Soak and redress daily x 3 days; review in 1 week", relevant: true },
      { id: "n5", text: "Antibiotics not required; no diabetes", relevant: true },
      { id: "n6", text: "Plays camogie competitively", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Confirm procedure and aftercare to GP",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];

export const OPTOMETRY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-opt-007",
    profession: "optometry",
    difficulty: 2,
    meta: {
      title: "Suspected glaucoma referral",
      letterType: "referral",
      readerRole: "Ophthalmologist",
      readerName: "Dr Mei Lin",
      estimatedWordCount: 180,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Refer Mrs Collins to Dr Lin for assessment of suspected primary open-angle glaucoma.",
      bulletPoints: [
        "State reason for referral",
        "Document visual fields, IOP, and optic disc findings",
        "Note relevant history and current drops if any",
        "Request specialist assessment",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Mrs Diane Collins, 62y — routine eye exam", relevant: true },
      { id: "n2", text: "IOP R 24, L 26 mmHg; no symptoms", relevant: true },
      { id: "n3", text: "Cup-to-disc ratio 0.6 bilaterally; RNFL thinning on OCT", relevant: true },
      { id: "n4", text: "Family hx: father with glaucoma", relevant: true },
      { id: "n5", text: "Started latanoprost nocte OU today pending review", relevant: true },
      { id: "n6", text: "Drives long distances for work", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Refer for glaucoma confirmation and long-term management",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-opt-008",
    profession: "optometry",
    difficulty: 2,
    meta: {
      title: "Diabetic retinopathy screening result",
      letterType: "referral",
      readerRole: "Ophthalmologist",
      readerName: "Dr James Wu",
      estimatedWordCount: 175,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Refer Mr Jackson to Dr Wu for assessment of moderate non-proliferative diabetic retinopathy.",
      bulletPoints: [
        "State screening indication and visual acuity",
        "Describe retinal findings and OCT if performed",
        "Include diabetes duration and HbA1c",
        "Request specialist review and treatment plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "15/06/26", text: "Mr Derek Jackson, 59y — diabetic eye exam", relevant: true },
      { id: "n2", text: "VA 6/9 OU; no symptomatic change", relevant: true },
      { id: "n3", text: "Moderate NPDR both eyes; microaneurysms and dot haemorrhages", relevant: true },
      { id: "n4", text: "Type 2 DM 12 years; HbA1c 8.1%", relevant: true },
      { id: "n5", text: "No macular oedema on OCT; refer for specialist monitoring", relevant: true },
      { id: "n6", text: "Retired postal worker", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Refer for ophthalmology management of moderate diabetic retinopathy",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];

export const DIETETICS_SCENARIOS: WritingScenario[] = [
  {
    id: "w-diet-008",
    profession: "dietetics",
    difficulty: 2,
    meta: {
      title: "Type 2 diabetes dietary plan",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Susan Reid",
      estimatedWordCount: 175,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Write to Dr Reid outlining your dietary management plan for Mr Hassan, newly diagnosed with type 2 diabetes.",
      bulletPoints: [
        "State purpose of nutritional assessment",
        "Summarise weight, BMI, and eating pattern",
        "List key dietary recommendations agreed",
        "Arrange follow-up and when to re-refer",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Mr Yusuf Hassan, 45y — dietetics new patient", relevant: true },
      { id: "n2", text: "BMI 31; HbA1c 58 mmol/mol per GP letter", relevant: true },
      { id: "n3", text: "Irregular meals; high sugary drinks; limited vegetables", relevant: true },
      { id: "n4", text: "Plan: portion control, reduce sugar, increase fibre", relevant: true },
      { id: "n5", text: "Follow-up in 4 weeks; contact if weight loss >5%", relevant: true },
      { id: "n6", text: "Patient enjoys cricket", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advice letter documenting diabetes dietary plan to GP",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-diet-009",
    profession: "dietetics",
    difficulty: 2,
    meta: {
      title: "Renal diet counselling summary",
      letterType: "advice",
      readerRole: "Nephrologist",
      readerName: "Dr Anita Desai",
      estimatedWordCount: 180,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Write to Dr Desai summarising dietary counselling for Mrs O'Brien with stage 4 chronic kidney disease.",
      bulletPoints: [
        "State purpose and CKD stage context",
        "Document protein, potassium, and fluid recommendations",
        "Note phosphate binder timing with meals",
        "Arrange dietetic review after medication changes",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Mrs Claire O'Brien, 68y — renal dietetics", relevant: true },
      { id: "n2", text: "eGFR 22; not yet on dialysis", relevant: true },
      { id: "n3", text: "Protein 0.8 g/kg; low potassium choices discussed", relevant: true },
      { id: "n4", text: "Fluid limit 1.2 L/day; weight chart provided", relevant: true },
      { id: "n5", text: "Phosphate binders with meals; review if binder dose changes", relevant: true },
      { id: "n6", text: "Grandchildren visit weekly", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Summarise CKD dietary plan for nephrology team",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];

export const RADIOGRAPHY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-rad-009",
    profession: "radiography",
    difficulty: 2,
    meta: {
      title: "Chest X-ray incidental nodule",
      letterType: "referral",
      readerRole: "General Practitioner",
      readerName: "Dr Emma Clarke",
      estimatedWordCount: 170,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Write to Dr Clarke regarding incidental findings on Mr Boyd's chest X-ray performed for cough.",
      bulletPoints: [
        "State examination performed and clinical indication",
        "Describe nodule size and location",
        "Recommend GP follow-up imaging pathway",
        "Note patient was asymptomatic for other findings",
      ],
    },
    caseNotes: [
      { id: "n1", date: "08/06/26", text: "Mr Peter Boyd, 55y — CXR for persistent cough", relevant: true },
      { id: "n2", text: "6mm nodule right upper lobe; no effusion", relevant: true },
      { id: "n3", text: "Heart size normal; lungs otherwise clear", relevant: true },
      { id: "n4", text: "Suggested CT chest per local guideline; GP to arrange", relevant: true },
      { id: "n5", text: "Patient smoker 20 pack-years; counselled", relevant: true },
      { id: "n6", text: "Previous knee injury 2019", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Inform GP of incidental pulmonary nodule requiring follow-up",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-rad-010",
    profession: "radiography",
    difficulty: 2,
    meta: {
      title: "MRI knee meniscal tear report",
      letterType: "reply",
      readerRole: "Orthopaedic Surgeon",
      readerName: "Mr Paul Greer",
      estimatedWordCount: 170,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Write to Mr Greer with MRI findings for Mr Ahmed, referred with persistent medial knee pain after twisting injury.",
      bulletPoints: [
        "State examination performed and clinical question",
        "Describe meniscal and ligament findings",
        "Note effusion and cartilage status",
        "Recommend correlation with clinical examination",
      ],
    },
    caseNotes: [
      { id: "n1", date: "09/06/26", text: "Mr Sam Ahmed, 35y — MRI knee without contrast", relevant: true },
      { id: "n2", text: "Clinical question: medial meniscal tear post twisting injury", relevant: true },
      { id: "n3", text: "Horizontal tear posterior horn medial meniscus", relevant: true },
      { id: "n4", text: "ACL intact; mild joint effusion", relevant: true },
      { id: "n5", text: "No significant chondral defect", relevant: true },
      { id: "n6", text: "Patient is semi-professional footballer", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Communicate MRI knee findings to orthopaedic surgeon",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];

export const SPEECH_PATHOLOGY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-sp-010",
    profession: "speech_pathology",
    difficulty: 2,
    meta: {
      title: "Dysphagia ENT referral",
      letterType: "referral",
      readerRole: "ENT Specialist",
      readerName: "Dr Rachel Stone",
      estimatedWordCount: 185,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Refer Mr Edwards to Dr Stone for ENT assessment of progressive dysphagia to solids.",
      bulletPoints: [
        "State referral reason and symptom timeline",
        "Summarise swallow assessment and aspiration risk",
        "Note weight loss and relevant medical history",
        "Request urgent laryngoscopy",
      ],
    },
    caseNotes: [
      { id: "n1", date: "15/06/26", text: "Mr Geoff Edwards, 70y — SLT assessment", relevant: true },
      { id: "n2", text: "Progressive dysphagia solids x 8 weeks; weight loss 3 kg", relevant: true },
      { id: "n3", text: "Videofluoroscopy: residue in valleculae; cough post-swallow", relevant: true },
      { id: "n4", text: "Modified diet IDDSI Level 5 recommended pending ENT review", relevant: true },
      { id: "n5", text: "Ex-smoker; hoarse voice noted", relevant: true },
      { id: "n6", text: "Retired teacher", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Urgent ENT referral for progressive dysphagia",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-sp-011",
    profession: "speech_pathology",
    difficulty: 2,
    meta: {
      title: "Paediatric language delay update",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Emma O'Connor",
      estimatedWordCount: 175,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Write to Dr O'Connor summarising speech pathology assessment for Noah (4 years) with expressive language delay.",
      bulletPoints: [
        "State assessment reason and developmental context",
        "Summarise language profile and hearing status",
        "Outline home strategies and therapy plan",
        "Recommend GP review if regression or red flags",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Noah Byrne, 4y — SLT initial assessment", relevant: true },
      { id: "n2", text: "Expressive language below age expectations; receptive skills stronger", relevant: true },
      { id: "n3", text: "Hearing screen normal; no autism red flags on screening", relevant: true },
      { id: "n4", text: "Parent coaching: expansions, labelling, reduced screen time", relevant: true },
      { id: "n5", text: "Block therapy 6 sessions; review progress at 8 weeks", relevant: true },
      { id: "n6", text: "Older sibling in primary school", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Update GP on paediatric language delay management",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];

export const VETERINARY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-vet-011",
    profession: "veterinary_science",
    difficulty: 2,
    meta: {
      title: "Complex fracture referral",
      letterType: "referral",
      readerRole: "Veterinary Surgeon",
      readerName: "Dr Kate Morrison",
      estimatedWordCount: 180,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Refer Bella, a Labrador with a comminuted tibial fracture, to Dr Morrison for surgical management.",
      bulletPoints: [
        "Identify patient and owner",
        "Describe injury mechanism and examination findings",
        "Document analgesia and stabilisation given",
        "Request surgical assessment",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Bella, 4y female Labrador, owner Mrs Shaw", relevant: true },
      { id: "n2", text: "Hit by car yesterday; non-weight-bearing RH limb", relevant: true },
      { id: "n3", text: "Radiographs: comminuted mid-tibial fracture RH", relevant: true },
      { id: "n4", text: "Morphine CRI overnight; buprenorphine continued", relevant: true },
      { id: "n5", text: "Chest auscultation clear; PCV 38%", relevant: true },
      { id: "n6", text: "Owner has pet insurance", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Refer for surgical repair of comminuted tibial fracture",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-vet-012",
    profession: "veterinary_science",
    difficulty: 2,
    meta: {
      title: "Chronic kidney disease monitoring",
      letterType: "advice",
      readerRole: "Referring Veterinarian",
      readerName: "Dr Susan Holt",
      estimatedWordCount: 175,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Write to the referring GP clinic summarising CKD monitoring for Mittens, a geriatric cat, and owner compliance plan.",
      bulletPoints: [
        "Identify patient, species, age, and owner",
        "Document renal parameters and blood pressure",
        "Outline diet and medication adjustments",
        "Schedule recheck and when to escalate",
      ],
    },
    caseNotes: [
      { id: "n1", date: "18/06/26", text: "Mittens, 14y DSH cat, owner Mr Lee", relevant: true },
      { id: "n2", text: "Creatinine 280 µmol/L; USG 1.018 — IRIS stage 3", relevant: true },
      { id: "n3", text: "BP 165 mmHg systolic; started amlodipine 0.625mg OD", relevant: true },
      { id: "n4", text: "Renal diet transitioned; subcut fluids discussed — owner declined", relevant: true },
      { id: "n5", text: "Recheck renal profile and BP in 4 weeks", relevant: true },
      { id: "n6", text: "Indoor-only cat", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Communicate CKD staging and monitoring plan to referring clinic",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];
