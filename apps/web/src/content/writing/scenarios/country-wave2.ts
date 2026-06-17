import type { WritingScenario } from "./types";

export const COUNTRY_WAVE2_SCENARIOS: WritingScenario[] = [
  // pharmacy — US, NZ, CA
  {
    id: "w-pharm-us-wave2",
    profession: "pharmacy",
    difficulty: 2,
    meta: {
      title: "Statin myalgia counselling",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Smith",
      estimatedWordCount: 175,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Write to Dr Smith regarding Mrs Gonzalez, who reports muscle aches since starting rosuvastatin and requests your input.",
      bulletPoints: [
        "State purpose and patient identity",
        "Document statin dose, symptom onset, and CK result",
        "Summarise counselling and temporary cessation advice",
        "Request GP review and alternative lipid plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "12/06/26", text: "Mrs Rosa Gonzalez, 61y — statin counselling visit", relevant: true },
      { id: "n2", text: "Rosuvastatin 10mg started 18/05/26; bilateral thigh ache x 10 days", relevant: true },
      { id: "n3", text: "CK 420 U/L (mildly elevated); no dark urine or weakness", relevant: true },
      { id: "n4", text: "Advised hold statin; report if weakness or urine changes", relevant: true },
      { id: "n5", text: "Suggested GP review within 1 week for lipid reassessment", relevant: true },
      { id: "n6", text: "Patient walks daily with a church group", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Inform GP of possible statin myalgia and need for medication review",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-pharm-nz-wave2",
    profession: "pharmacy",
    difficulty: 2,
    meta: {
      title: "DOAC initiation counselling",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Williams",
      estimatedWordCount: 170,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to Dr Williams summarising your counselling of Mr Patel after his first apixaban prescription for atrial fibrillation.",
      bulletPoints: [
        "Confirm patient identity and indication",
        "Document dose, timing, and adherence aids discussed",
        "Outline bleeding precautions and when to seek help",
        "Note need for renal function monitoring",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Mr Raj Patel, 72y — new apixaban dispensing", relevant: true },
      { id: "n2", text: "Apixaban 5mg BD for AF; eGFR 58 mL/min", relevant: true },
      { id: "n3", text: "Counselled: take with food, do not double missed doses", relevant: true },
      { id: "n4", text: "Bleeding red flags reviewed; avoid NSAIDs unless GP agrees", relevant: true },
      { id: "n5", text: "Pill organiser supplied; renal review in 6 months suggested", relevant: true },
      { id: "n6", text: "Son lives in Auckland", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Document DOAC counselling and safety advice to GP",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-pharm-ca-wave2",
    profession: "pharmacy",
    difficulty: 2,
    meta: {
      title: "Sertraline–St John's wort interaction",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Tremblay",
      estimatedWordCount: 175,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay after identifying a herb–drug interaction risk for Ms Dubois taking sertraline.",
      bulletPoints: [
        "State reason for contact and patient details",
        "Document sertraline dose and OTC product purchased",
        "Explain serotonin syndrome risk and advice given",
        "Request GP follow-up if mood symptoms persist",
      ],
    },
    caseNotes: [
      { id: "n1", date: "15/06/26", text: "Ms Claire Dubois, 38y — OTC purchase review", relevant: true },
      { id: "n2", text: "Sertraline 100mg daily for anxiety; started 2 months ago", relevant: true },
      { id: "n3", text: "Purchased St John's wort capsules for low mood", relevant: true },
      { id: "n4", text: "Advised not to combine; explained agitation, tremor, fever risk", relevant: true },
      { id: "n5", text: "Refund offered; encouraged GP review if symptoms unchanged", relevant: true },
      { id: "n6", text: "Works as elementary school teacher", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Alert GP to herb–SSRI interaction and patient counselling",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // nursing — US, IE, NZ, CA
  {
    id: "w-nurs-us-wave2",
    profession: "nursing",
    difficulty: 2,
    meta: {
      title: "Fall prevention discharge handover",
      letterType: "discharge",
      readerRole: "Home Health Nurse",
      readerName: "Ms Linda Carter",
      estimatedWordCount: 195,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Write a discharge letter to home health nurse Ms Carter for Mr Washington after an inpatient fall assessment.",
      bulletPoints: [
        "Summarise fall event and injuries sustained",
        "Document mobility status and assistive device plan",
        "List home safety modifications and medication review",
        "Specify monitoring frequency and red-flag symptoms",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Mr James Washington, 79y, discharged home today", relevant: true },
      { id: "n2", text: "Fall at home; hip contusion only; X-ray negative for fracture", relevant: true },
      { id: "n3", text: "Gait unsteady; rolling walker ordered; PT referral placed", relevant: true },
      { id: "n4", text: "Held bedtime zolpidem pending Dr Smith medication review", relevant: true },
      { id: "n5", text: "Home visit x3/week x 2 weeks; report dizziness or new falls urgently", relevant: true },
      { id: "n6", text: "Daughter is primary caregiver", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Safe community handover after fall without fracture",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-nurs-ie-wave2",
    profession: "nursing",
    difficulty: 2,
    meta: {
      title: "COPD exacerbation community handover",
      letterType: "transfer",
      readerRole: "Public Health Nurse",
      readerName: "Ms Siobhan Kelly",
      estimatedWordCount: 200,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Write to public health nurse Ms Kelly regarding Mr Doyle's discharge after a COPD exacerbation.",
      bulletPoints: [
        "State admission reason and current respiratory status",
        "Document oxygen, nebuliser, and steroid taper plan",
        "Outline smoking cessation support and inhaler technique",
        "List symptoms requiring urgent GP or ED review",
      ],
    },
    caseNotes: [
      { id: "n1", date: "17/06/26", text: "Mr Sean Doyle, 68y, ready for home — COPD exacerbation", relevant: true },
      { id: "n2", text: "SpO2 94% room air; prednisolone taper over 5 days", relevant: true },
      { id: "n3", text: "Continue tiotropium and salbutamol PRN; spacer technique reviewed", relevant: true },
      { id: "n4", text: "Smoking cessation leaflet; referral to HSE quit service", relevant: true },
      { id: "n5", text: "Dr O'Brien review in 1 week; ED if severe breathlessness or cyanosis", relevant: true },
      { id: "n6", text: "Enjoys Gaelic football on television", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Community nursing handover after COPD exacerbation",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-nurs-nz-wave2",
    profession: "nursing",
    difficulty: 2,
    meta: {
      title: "Anticoagulation bridging post TKR",
      letterType: "discharge",
      readerRole: "District Nurse",
      readerName: "Mr Tom Hughes",
      estimatedWordCount: 195,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to district nurse Mr Hughes regarding Mrs Thompson after total knee replacement and anticoagulation bridging.",
      bulletPoints: [
        "Summarise surgery date and wound status",
        "Document enoxaparin regimen and warfarin restart plan",
        "Outline INR monitoring and injection teaching",
        "State when to contact orthopaedic team or GP urgently",
      ],
    },
    caseNotes: [
      { id: "n1", date: "18/06/26", text: "Mrs Helen Thompson, 71y, post TKR day 4", relevant: true },
      { id: "n2", text: "Wound dry; mobilising with frame; DVT prophylaxis ongoing", relevant: true },
      { id: "n3", text: "Enoxaparin 40mg SC daily until INR therapeutic", relevant: true },
      { id: "n4", text: "Warfarin restarted yesterday; INR clinic appointment Friday", relevant: true },
      { id: "n5", text: "Patient and husband taught injection technique; Dr Williams notified", relevant: true },
      { id: "n6", text: "Retired librarian", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Handover of post-operative anticoagulation bridging",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-nurs-ca-wave2",
    profession: "nursing",
    difficulty: 2,
    meta: {
      title: "Postpartum mood screening handover",
      letterType: "referral",
      readerRole: "General Practitioner",
      readerName: "Dr Tremblay",
      estimatedWordCount: 190,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay regarding Ms Lavoie, identified with elevated postpartum depression screening on the maternity ward.",
      bulletPoints: [
        "State screening result and gestational context",
        "Document mood symptoms and infant feeding status",
        "Summarise safety assessment and support offered",
        "Request urgent GP follow-up within one week",
      ],
    },
    caseNotes: [
      { id: "n1", date: "19/06/26", text: "Ms Isabelle Lavoie, 29y, postpartum day 3", relevant: true },
      { id: "n2", text: "EPDS score 16; tearful, poor sleep, intrusive guilt", relevant: true },
      { id: "n3", text: "Breastfeeding established; infant well; partner supportive", relevant: true },
      { id: "n4", text: "No self-harm disclosed; safety plan and crisis line provided", relevant: true },
      { id: "n5", text: "Referral to community maternal mental health; GP review within 7 days", relevant: true },
      { id: "n6", text: "Plans to return to office work in 10 months", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Refer for postpartum mood follow-up with safety documentation",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // medicine — IE, NZ, CA
  {
    id: "w-med-ie-wave2",
    profession: "medicine",
    difficulty: 2,
    meta: {
      title: "New AF anticoagulation plan",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr O'Brien",
      estimatedWordCount: 185,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Reply to Dr O'Brien regarding Mr Keane, whom you assessed in clinic for newly detected atrial fibrillation.",
      bulletPoints: [
        "Acknowledge referral and confirm diagnosis",
        "Summarise CHA2DS2-VASc score and bleeding risk discussion",
        "Outline anticoagulation choice and monitoring plan",
        "Document lifestyle advice and follow-up interval",
      ],
    },
    caseNotes: [
      { id: "n1", date: "11/06/26", text: "Mr Patrick Keane, 74y — new AF on opportunistic pulse check", relevant: true },
      { id: "n2", text: "ECG: AF rate controlled; echo: mild LV hypertrophy only", relevant: true },
      { id: "n3", text: "CHA2DS2-VASc 3; HAS-BLED 1; apixaban 5mg BD commenced", relevant: true },
      { id: "n4", text: "Alcohol reduction discussed; weight management advice given", relevant: true },
      { id: "n5", text: "Review in 4 weeks with repeat ECG and renal function", relevant: true },
      { id: "n6", text: "Member of local golf club", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply with AF diagnosis and anticoagulation management plan",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-med-nz-wave2",
    profession: "medicine",
    difficulty: 2,
    meta: {
      title: "Acute gout flare management",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Williams",
      estimatedWordCount: 180,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Write to Dr Williams updating management for Ms Morrison after an acute gout flare of the first MTP joint.",
      bulletPoints: [
        "Confirm presentation and examination findings",
        "Document acute treatment and response",
        "Outline urate-lowering plan and prophylaxis",
        "Recommend lifestyle modifications and follow-up",
      ],
    },
    caseNotes: [
      { id: "n1", date: "13/06/26", text: "Ms Fiona Morrison, 52y — acute gout review", relevant: true },
      { id: "n2", text: "Hot swollen R 1st MTP; serum urate 0.52 mmol/L", relevant: true },
      { id: "n3", text: "Colchicine 500mcg BD x 3 days; naproxen avoided (CKD stage 2)", relevant: true },
      { id: "n4", text: "Plan allopurinol 100mg after flare settles; colchicine prophylaxis 3 months", relevant: true },
      { id: "n5", text: "Reduce beer intake; weight loss discussed; review urate in 6 weeks", relevant: true },
      { id: "n6", text: "Travels to Fiji annually", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Update GP on acute gout treatment and urate-lowering strategy",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-med-ca-wave2",
    profession: "medicine",
    difficulty: 2,
    meta: {
      title: "Pre-operative medical clearance",
      letterType: "advice",
      readerRole: "Orthopaedic Surgeon",
      readerName: "Dr Tremblay",
      estimatedWordCount: 190,
      countryCode: "CA",
    },
    taskSheet: {
      instruction:
        "Write to Dr Tremblay providing pre-operative clearance for Mr Bergeron's planned total hip arthroplasty.",
      bulletPoints: [
        "State purpose and planned procedure date",
        "Summarise cardiac and pulmonary assessment",
        "Document medication adjustments including antiplatelet hold",
        "Confirm fitness for anaesthesia and post-op rehab needs",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Mr Marc Bergeron, 66y — pre-op assessment", relevant: true },
      { id: "n2", text: "THA scheduled 02/07/26 for osteoarthritis; BMI 29", relevant: true },
      { id: "n3", text: "ECG normal; METs >4; mild COPD stable on tiotropium", relevant: true },
      { id: "n4", text: "Hold aspirin 7 days pre-op per surgeon protocol; continue inhalers", relevant: true },
      { id: "n5", text: "Cleared for surgery; recommend post-op DVT prophylaxis and early physio", relevant: true },
      { id: "n6", text: "Speaks French at home", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Pre-operative clearance letter for elective hip replacement",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // dentistry — US, IE
  {
    id: "w-dent-us-wave2",
    profession: "dentistry",
    difficulty: 2,
    meta: {
      title: "Dental abscess antibiotic stewardship",
      letterType: "referral",
      readerRole: "Oral Surgeon",
      readerName: "Dr Smith",
      estimatedWordCount: 180,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Refer Ms Rivera to oral surgeon Dr Smith for drainage of a persistent mandibular abscess despite initial antibiotics.",
      bulletPoints: [
        "State referral reason and symptom duration",
        "Document examination, radiograph, and prior antibiotic course",
        "Note relevant medical history and allergy status",
        "Request urgent surgical assessment",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Ms Carmen Rivera, 34y — dental emergency", relevant: true },
      { id: "n2", text: "Swelling LR quadrant x 5 days; fever 38.1°C yesterday", relevant: true },
      { id: "n3", text: "PA radiograph: periapical abscess LR6; incomplete root canal", relevant: true },
      { id: "n4", text: "Amoxicillin 500mg TDS x 5 days completed — partial improvement only", relevant: true },
      { id: "n5", text: "No penicillin allergy; mild controlled asthma", relevant: true },
      { id: "n6", text: "Dental hygienist student", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Urgent surgical referral for unresolved dental abscess",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-dent-ie-wave2",
    profession: "dentistry",
    difficulty: 2,
    meta: {
      title: "TMJ dysfunction conservative plan",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr O'Brien",
      estimatedWordCount: 175,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Reply to Dr O'Brien regarding Mr Walsh's temporomandibular joint dysfunction and occlusal splint plan.",
      bulletPoints: [
        "Acknowledge referral for jaw pain and clicking",
        "Summarise examination and splint fabrication",
        "Outline self-care and analgesia advice",
        "State review interval and re-referral criteria",
      ],
    },
    caseNotes: [
      { id: "n1", date: "12/06/26", text: "Mr Conor Walsh, 42y — TMJ assessment", relevant: true },
      { id: "n2", text: "Unilateral pre-auricular pain; clicking on opening; no locking", relevant: true },
      { id: "n3", text: "Soft occlusal splint fitted; wear at night", relevant: true },
      { id: "n4", text: "Advised soft diet, jaw rest, warm compresses; paracetamol PRN", relevant: true },
      { id: "n5", text: "Review 6 weeks; refer maxfax if worsening or trismus", relevant: true },
      { id: "n6", text: "Plays hurling recreationally", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply documenting conservative TMJ management",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // physiotherapy — US, IE
  {
    id: "w-phys-us-wave2",
    profession: "physiotherapy",
    difficulty: 2,
    meta: {
      title: "Rotator cuff tendinopathy reply",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Smith",
      estimatedWordCount: 185,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Smith regarding Mr Johnson, referred with subacromial shoulder pain without red flags.",
      bulletPoints: [
        "Acknowledge referral and symptom duration",
        "Summarise objective findings and functional limits",
        "Outline progressive loading programme provided",
        "State expected recovery timeline and review plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "09/06/26", text: "Mr David Johnson, 48y — shoulder pain 8 weeks", relevant: true },
      { id: "n2", text: "Painful arc positive; supraspinatus weakness grade 4/5", relevant: true },
      { id: "n3", text: "No night pain or neurological signs; ultrasound not yet done", relevant: true },
      { id: "n4", text: "Scapular stability + isometric loading programme commenced", relevant: true },
      { id: "n5", text: "Review 4 weeks; imaging if no improvement", relevant: true },
      { id: "n6", text: "Coaches youth baseball", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply with rotator cuff rehab plan to GP",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-phys-ie-wave2",
    profession: "physiotherapy",
    difficulty: 2,
    meta: {
      title: "Post-stroke shoulder subluxation",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr O'Brien",
      estimatedWordCount: 190,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Write to Dr O'Brien regarding physiotherapy management of Mrs Byrne's painful shoulder subluxation after stroke.",
      bulletPoints: [
        "State stroke timeline and current mobility level",
        "Document shoulder assessment and pain score",
        "Describe positioning, support, and exercise programme",
        "Recommend analgesia review if pain limits therapy",
      ],
    },
    caseNotes: [
      { id: "n1", date: "11/06/26", text: "Mrs Maeve Byrne, 70y — post stroke week 4", relevant: true },
      { id: "n2", text: "Left hemiplegia; shoulder subluxation on X-ray; NPRS 6/10", relevant: true },
      { id: "n3", text: "Support sling for transfers only; not worn at rest", relevant: true },
      { id: "n4", text: "Gentle ROM + electrical stimulation programme started", relevant: true },
      { id: "n5", text: "Request GP review paracetamol dose if pain persists >5/10", relevant: true },
      { id: "n6", text: "Former primary school principal", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advise GP on hemiplegic shoulder management",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // occupational therapy — US, IE
  {
    id: "w-ot-us-wave2",
    profession: "occupational_therapy",
    difficulty: 2,
    meta: {
      title: "Dementia home safety assessment",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Smith",
      estimatedWordCount: 195,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Write to Dr Smith summarising home safety assessment for Mr Henderson with early Alzheimer's disease.",
      bulletPoints: [
        "State cognitive concerns and living arrangement",
        "Document hazards identified and modifications made",
        "Outline carer education and supervision plan",
        "Recommend GP review of driving and medication adherence",
      ],
    },
    caseNotes: [
      { id: "n1", date: "13/06/26", text: "Mr Robert Henderson, 76y — home OT visit", relevant: true },
      { id: "n2", text: "Early AD; MMSE 22/30; lives with wife", relevant: true },
      { id: "n3", text: "Stove auto-shutoff installed; medication blister pack set up", relevant: true },
      { id: "n4", text: "Grab rails in bathroom; clutter removed from stairs", relevant: true },
      { id: "n5", text: "Advise GP driving assessment; OT review in 8 weeks", relevant: true },
      { id: "n6", text: "Enjoys woodworking in garage", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Home safety summary for GP in early dementia",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-ot-ie-wave2",
    profession: "occupational_therapy",
    difficulty: 2,
    meta: {
      title: "Post carpal tunnel release rehab",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr O'Brien",
      estimatedWordCount: 185,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Reply to Dr O'Brien regarding Ms Kelly's occupational therapy after carpal tunnel release two weeks ago.",
      bulletPoints: [
        "Confirm procedure date and current symptoms",
        "Document scar management and grip restrictions",
        "Outline graded activity programme for daily tasks",
        "State discharge or review timeline",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Ms Aoife Kelly, 44y — post CTR week 2", relevant: true },
      { id: "n2", text: "Night pain resolved; mild pillar pain; sutures removed", relevant: true },
      { id: "n3", text: "Scar desensitisation and tendon gliding exercises taught", relevant: true },
      { id: "n4", text: "Light desk work permitted; no heavy lifting >2 kg x 4 weeks", relevant: true },
      { id: "n5", text: "Discharge in 2 weeks if grip strength progressing", relevant: true },
      { id: "n6", text: "Administrative assistant", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply documenting post-surgical hand therapy progress",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // podiatry — US
  {
    id: "w-pod-us-wave2",
    profession: "podiatry",
    difficulty: 2,
    meta: {
      title: "Plantar fasciitis orthotic plan",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Smith",
      estimatedWordCount: 170,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Reply to Dr Smith regarding Mr Davis, referred with chronic plantar heel pain consistent with plantar fasciitis.",
      bulletPoints: [
        "Acknowledge referral and symptom pattern",
        "Summarise biomechanical assessment findings",
        "Document orthotic prescription and stretching programme",
        "State expected improvement timeline and re-referral criteria",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Mr Michael Davis, 45y — heel pain 4 months", relevant: true },
      { id: "n2", text: "First-step pain; tender medial calcaneal tubercle", relevant: true },
      { id: "n3", text: "Moderate pes planus; custom foot orthoses ordered", relevant: true },
      { id: "n4", text: "Calf stretching and night splint discussed", relevant: true },
      { id: "n5", text: "Review 6 weeks; imaging if no improvement", relevant: true },
      { id: "n6", text: "Runs half-marathons", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply with plantar fasciitis management plan",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // optometry — IE, NZ
  {
    id: "w-opt-ie-wave2",
    profession: "optometry",
    difficulty: 2,
    meta: {
      title: "Dry AMD monitoring referral",
      letterType: "referral",
      readerRole: "Ophthalmologist",
      readerName: "Dr O'Brien",
      estimatedWordCount: 175,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Refer Mrs Murphy to ophthalmologist Dr O'Brien for monitoring of dry age-related macular degeneration.",
      bulletPoints: [
        "State reason for referral and visual symptoms",
        "Document acuity, OCT, and drusen findings",
        "Note smoking status and Amsler grid result",
        "Request specialist monitoring plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "15/06/26", text: "Mrs Sheila Murphy, 74y — routine macular review", relevant: true },
      { id: "n2", text: "VA 6/12 OU; mild metamorphopsia left eye", relevant: true },
      { id: "n3", text: "OCT: drusen + RPE changes; no fluid — dry AMD", relevant: true },
      { id: "n4", text: "Ex-smoker; AREDS2 supplements commenced", relevant: true },
      { id: "n5", text: "Amsler grid distortion noted; refer for macular service", relevant: true },
      { id: "n6", text: "Knits for charity shop", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Refer for specialist AMD monitoring",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-opt-nz-wave2",
    profession: "optometry",
    difficulty: 2,
    meta: {
      title: "Contact lens keratitis referral",
      letterType: "referral",
      readerRole: "Ophthalmologist",
      readerName: "Dr Williams",
      estimatedWordCount: 180,
      countryCode: "NZ",
    },
    taskSheet: {
      instruction:
        "Refer Ms Chen to Dr Williams for urgent assessment of suspected contact lens-related keratitis.",
      bulletPoints: [
        "State acute symptoms and lens wear history",
        "Document examination and fluorescein findings",
        "Note microbiology swab if taken",
        "Request same-day ophthalmology review",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Ms Amy Chen, 26y — red painful eye", relevant: true },
      { id: "n2", text: "Daily disposable lenses; slept in lenses 2 nights ago", relevant: true },
      { id: "n3", text: "VA R 6/18; corneal infiltrate central; fluorescein uptake", relevant: true },
      { id: "n4", text: "Lenses removed; topical antibiotic started pending review", relevant: true },
      { id: "n5", text: "Urgent ophthalmology same day; warned re vision loss risk", relevant: true },
      { id: "n6", text: "University student", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Urgent referral for contact lens keratitis",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // dietetics — US, IE
  {
    id: "w-diet-us-wave2",
    profession: "dietetics",
    difficulty: 2,
    meta: {
      title: "Celiac disease nutritional plan",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Smith",
      estimatedWordCount: 175,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Write to Dr Smith outlining dietary management for Ms Anderson following a new celiac disease diagnosis.",
      bulletPoints: [
        "State diagnosis context and symptom improvement",
        "Document strict gluten-free education provided",
        "Outline micronutrient monitoring needs",
        "Arrange dietetic follow-up and re-referral triggers",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Ms Laura Anderson, 32y — new celiac diagnosis", relevant: true },
      { id: "n2", text: "Positive TTG IgA; duodenal biopsy confirmed", relevant: true },
      { id: "n3", text: "Gluten-free diet education; label reading handout", relevant: true },
      { id: "n4", text: "Discussed iron, B12, vitamin D monitoring", relevant: true },
      { id: "n5", text: "Follow-up 6 weeks; contact if ongoing diarrhoea", relevant: true },
      { id: "n6", text: "Enjoys baking", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Advice letter on celiac nutritional management",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-diet-ie-wave2",
    profession: "dietetics",
    difficulty: 2,
    meta: {
      title: "Oncology malnutrition support",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr O'Brien",
      estimatedWordCount: 180,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Write to Dr O'Brien summarising nutritional support for Mr Doyle during chemotherapy for colorectal cancer.",
      bulletPoints: [
        "State treatment phase and weight trend",
        "Document oral intake assessment and symptoms",
        "Outline high-protein plan and oral supplements",
        "Recommend GP review if weight loss continues",
      ],
    },
    caseNotes: [
      { id: "n1", date: "11/06/26", text: "Mr Liam Doyle, 58y — cycle 3 FOLFOX", relevant: true },
      { id: "n2", text: "Weight loss 4 kg in 6 weeks; BMI now 20", relevant: true },
      { id: "n3", text: "Nausea days 2–4 post chemo; small frequent meals advised", relevant: true },
      { id: "n4", text: "High-protein snacks + 2 oral nutrition supplements daily", relevant: true },
      { id: "n5", text: "Weekly weights; GP review if loss >2% in 2 weeks", relevant: true },
      { id: "n6", text: "Supports local GAA club", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Summarise oncology nutrition support for GP",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // radiography — US
  {
    id: "w-rad-us-wave2",
    profession: "radiography",
    difficulty: 2,
    meta: {
      title: "CT PE protocol report",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Smith",
      estimatedWordCount: 170,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Write to Dr Smith with CT pulmonary angiography findings for Ms Taylor, investigated for suspected PE.",
      bulletPoints: [
        "State examination and clinical indication",
        "Describe presence or absence of emboli",
        "Note alternative findings if relevant",
        "Recommend correlation with D-dimer and clinical status",
      ],
    },
    caseNotes: [
      { id: "n1", date: "08/06/26", text: "Ms Jennifer Taylor, 49y — CTPA for pleuritic chest pain", relevant: true },
      { id: "n2", text: "Wells score intermediate; D-dimer elevated", relevant: true },
      { id: "n3", text: "No pulmonary embolism identified", relevant: true },
      { id: "n4", text: "Minor dependent atelectasis bases only", relevant: true },
      { id: "n5", text: "Suggest clinical reassessment for musculoskeletal cause", relevant: true },
      { id: "n6", text: "Recent long-haul flight", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Communicate negative CTPA with incidental findings",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // speech pathology — US
  {
    id: "w-sp-us-wave2",
    profession: "speech_pathology",
    difficulty: 2,
    meta: {
      title: "Professional voice strain referral",
      letterType: "referral",
      readerRole: "ENT Specialist",
      readerName: "Dr Smith",
      estimatedWordCount: 185,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Refer Ms Brooks to ENT Dr Smith for laryngoscopic assessment of hoarseness in a professional voice user.",
      bulletPoints: [
        "State symptom duration and occupational voice demands",
        "Summarise voice assessment and vocal hygiene advice",
        "Document smoking and reflux history",
        "Request laryngoscopy and joint management plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Ms Olivia Brooks, 35y — voice clinic assessment", relevant: true },
      { id: "n2", text: "Hoarseness 6 weeks; radio presenter; increased vocal load", relevant: true },
      { id: "n3", text: "Rough-harsh voice quality; reduced pitch range", relevant: true },
      { id: "n4", text: "Vocal hygiene and hydration plan started; no smoking", relevant: true },
      { id: "n5", text: "Refer ENT for stroboscopy; continue voice therapy", relevant: true },
      { id: "n6", text: "Runs marathons", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "ENT referral for occupational dysphonia",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  // veterinary science — US, IE
  {
    id: "w-vet-us-wave2",
    profession: "veterinary_science",
    difficulty: 2,
    meta: {
      title: "Canine parvovirus hospital update",
      letterType: "advice",
      readerRole: "Referring Veterinarian",
      readerName: "Dr Smith",
      estimatedWordCount: 180,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Write to referring veterinarian Dr Smith updating hospital care for Max, a puppy with parvovirus enteritis.",
      bulletPoints: [
        "Identify patient, age, and owner contact",
        "Document hydration status and laboratory trends",
        "Outline isolation, fluid therapy, and antiemetics",
        "State prognosis and discharge criteria",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Max, 4mo male Labrador, owner Mr Garcia", relevant: true },
      { id: "n2", text: "Parvo antigen positive; bloody diarrhoea x 2 days", relevant: true },
      { id: "n3", text: "IV crystalloids + antiemetics; glucose WNL today", relevant: true },
      { id: "n4", text: "Isolation ward; strict biosecurity; no visitors", relevant: true },
      { id: "n5", text: "Guarded prognosis; discharge when eating 48h without vomiting", relevant: true },
      { id: "n6", text: "Litter mate vaccinated", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Update referring vet on parvovirus inpatient care",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-vet-ie-wave2",
    profession: "veterinary_science",
    difficulty: 2,
    meta: {
      title: "Equine colic surgical referral",
      letterType: "referral",
      readerRole: "Equine Surgeon",
      readerName: "Dr O'Brien",
      estimatedWordCount: 175,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Refer Thunder, a competition horse with refractory colic, to equine surgeon Dr O'Brien for emergency assessment.",
      bulletPoints: [
        "Identify horse, owner, and presenting signs",
        "Document examination, reflux, and pain response",
        "Summarise analgesia and fluid therapy given",
        "Request urgent surgical evaluation",
      ],
    },
    caseNotes: [
      { id: "n1", date: "17/06/26", text: "Thunder, 9y Irish Sport Horse, owner Mr Walsh", relevant: true },
      { id: "n2", text: "Acute colic x 4 hours; rolling, flank watching", relevant: true },
      { id: "n3", text: "Nasogastric reflux 3L; heart rate 60 bpm; painful on re-exam", relevant: true },
      { id: "n4", text: "Flunixin + IV fluids administered; minimal response", relevant: true },
      { id: "n5", text: "Refer equine hospital 90 km; owner consents to surgery if needed", relevant: true },
      { id: "n6", text: "Competes in eventing", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Emergency surgical referral for refractory equine colic",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];
