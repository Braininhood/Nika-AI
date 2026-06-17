import { readingBlock } from "./helpers";

/** Wave 2 — second Part B per OET destination (regulator-aware health policy). */
export const COUNTRY_READING_BLOCKS_WAVE2 = [
  readingBlock(
    {
      id: "r-uk-b-w2",
      part: "B",
      countryCode: "UK",
      title: "GMC revalidation for IMG doctors",
      localeContext: "GMC · United Kingdom",
      durationMinutes: 22,
      tags: ["reading:part-b", "reading:part-b-gist"],
      paragraphs: [
        "International medical graduates must complete GMC registration and an approved induction before unsupervised practice. Revalidation every five years requires annual appraisals, multisource feedback, and evidence of CPD aligned to GMC Good Medical Practice.",
        "Designated bodies (usually NHS trusts) support revalidation. Doctors without a connection must join a suitable responsible officer scheme within three months of starting UK practice.",
        "Fitness to practise concerns are separate from revalidation and may trigger GMC investigation regardless of appraisal outcomes.",
      ],
    },
    [
      {
        id: "r-uk-b-w2-q1",
        prompt: "Revalidation occurs every…",
        options: ["Two years", "Five years", "Ten years", "Annually only"],
        correctAnswer: "Five years",
        explanation: "Revalidation cycle is five years with annual appraisals.",
      },
      {
        id: "r-uk-b-w2-q2",
        prompt: "Who typically supports NHS doctor revalidation?",
        options: ["Pharmacy regulator", "Designated bodies such as NHS trusts", "Patients directly", "Overseas universities"],
        correctAnswer: "Designated bodies such as NHS trusts",
        explanation: "NHS trusts act as designated bodies.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-au-b-w2",
      part: "B",
      countryCode: "AU",
      title: "AHPRA mandatory reporting",
      localeContext: "AHPRA · Australia",
      durationMinutes: 22,
      tags: ["reading:part-b"],
      paragraphs: [
        "Registered practitioners and employers must notify AHPRA when they form a reasonable belief that another practitioner has behaved in a way that places the public at substantial risk.",
        "Mandatory reporting does not replace clinical governance locally; it runs parallel to hospital incident reporting. Practitioners are protected from civil liability when reports are made in good faith.",
        "Notifications are assessed by the relevant National Board (e.g. Nursing and Midwifery Board) which may impose conditions, suspend registration, or refer to a tribunal.",
      ],
    },
    [
      {
        id: "r-au-b-w2-q1",
        prompt: "Mandatory reporting applies when…",
        options: [
          "Any minor documentation error occurs",
          "There is reasonable belief of substantial public risk",
          "Patients complain about waiting times",
          "CPD hours are incomplete",
        ],
        correctAnswer: "There is reasonable belief of substantial public risk",
        explanation: "Reasonable belief of substantial public risk triggers notification.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-us-b-w2",
      part: "B",
      countryCode: "US",
      title: "Joint Commission pain assessment",
      localeContext: "US acute hospital · Joint Commission standards",
      durationMinutes: 22,
      tags: ["reading:part-b"],
      paragraphs: [
        "Hospitals must assess pain on admission and reassess after interventions using validated scales. Cultural and linguistic differences affect pain expression; interpreters must be offered before consent procedures.",
        "Opioid prescribing requires documented non-pharmacological options and functional goals. State prescription drug monitoring programmes must be checked where legally required.",
        "Patients have the right to refuse pain medication; refusal is documented without judgement in the medical record.",
      ],
    },
    [
      {
        id: "r-us-b-w2-q1",
        prompt: "Pain must be assessed…",
        options: ["Only at discharge", "On admission and after interventions", "Weekly", "If patients request it"],
        correctAnswer: "On admission and after interventions",
        explanation: "Admission and post-intervention reassessment required.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-ie-b-w2",
      part: "B",
      countryCode: "IE",
      title: "HSE open disclosure policy",
      localeContext: "HSE · Ireland",
      durationMinutes: 22,
      tags: ["reading:part-b"],
      paragraphs: [
        "When patient harm occurs, clinicians should apologise sincerely, explain what happened in understandable language, and outline steps to prevent recurrence. Open disclosure is separate from medico-legal admission of liability.",
        "Patients and families may bring a support person. Written follow-up summarising the conversation should be offered within ten working days where significant harm occurred.",
        "NMBI and Medical Council standards align with HSE policy on honest communication after adverse events.",
      ],
    },
    [
      {
        id: "r-ie-b-w2-q1",
        prompt: "Open disclosure includes…",
        options: [
          "Avoiding apology to limit liability",
          "Sincere apology and explanation in plain language",
          "Legal admission only",
          "Written communication only",
        ],
        correctAnswer: "Sincere apology and explanation in plain language",
        explanation: "Apology and clear explanation — not same as legal liability.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-nz-b-w2",
      part: "B",
      countryCode: "NZ",
      title: "Te Whatu Ora cultural safety",
      localeContext: "Te Whatu Ora · New Zealand",
      durationMinutes: 22,
      tags: ["reading:part-b"],
      paragraphs: [
        "Cultural safety requires practitioners to reflect on how their own culture affects care and to enable Māori and Pacific peoples to define what safe care means for them.",
        "Training includes use of te reo Māori greetings where appropriate and understanding whānau-inclusive decision-making. Interpreters for Pacific languages must be qualified, not children.",
        "Complaints about culturally unsafe care may be referred to the Health and Disability Commissioner alongside professional body review.",
      ],
    },
    [
      {
        id: "r-nz-b-w2-q1",
        prompt: "Cultural safety means…",
        options: [
          "Treating all patients identically",
          "Patients define what safe care means for them",
          "Using English only",
          "Avoiding family involvement",
        ],
        correctAnswer: "Patients define what safe care means for them",
        explanation: "Māori and Pacific peoples define cultural safety.",
      },
    ],
  ),
  readingBlock(
    {
      id: "r-ca-b-w2",
      part: "B",
      countryCode: "CA",
      title: "CPSO informed consent",
      localeContext: "Ontario · CPSO standards",
      durationMinutes: 22,
      tags: ["reading:part-b"],
      paragraphs: [
        "Valid consent requires information on diagnosis, proposed treatment, alternatives, material risks, and consequences of no treatment — in language the patient understands. Interpreters are documented in the chart.",
        "Consent must be voluntary without coercion. Capacity assessments use province-specific guides; substitute decision-makers follow hierarchical lists in legislation.",
        "College of Nurses of Ontario and provincial pharmacy colleges publish parallel consent guidance for regulated acts within scope.",
      ],
    },
    [
      {
        id: "r-ca-b-w2-q1",
        prompt: "Valid consent requires information on…",
        options: [
          "Diagnosis and treatment only",
          "Diagnosis, treatment, alternatives, risks, and no-treatment consequences",
          "Insurance coverage only",
          "Physician qualifications only",
        ],
        correctAnswer: "Diagnosis, treatment, alternatives, risks, and no-treatment consequences",
        explanation: "Full information package for informed consent.",
      },
    ],
  ),
];
