import { DenialCategory, PlanType } from '../types';

export interface SampleDenial {
  id: string;
  title: string;
  badge: string;
  category: DenialCategory;
  plan_type: PlanType;
  insurer: string;
  member_name: string;
  member_id: string;
  group_number: string;
  claim_number: string;
  service_description: string;
  cpt_code: string;
  date_of_service: string;
  billed_amount: number;
  denied_amount: number;
  denial_code: string;
  denial_reason: string;
  appeal_deadline_stated?: string;
  plain_english_summary: string;
  playbook_explanation: string;
  estimated_win_rate: number;
  next_steps: string[];
  raw_text: string;
}

export const SAMPLE_DENIALS: SampleDenial[] = [
  {
    id: 'sample-mri-lumbar',
    title: 'Lumbar Spine MRI Denied as "Not Medically Necessary"',
    badge: 'Medical Necessity',
    category: 'not_medically_necessary',
    plan_type: 'employer_self_funded',
    insurer: 'Aetna Health Inc.',
    member_name: 'Sarah M. Jenkins',
    member_id: 'W928472910',
    group_number: 'GRP-849201',
    claim_number: 'CLM-2024-88391',
    service_description: 'MRI Lumbar Spine with and without contrast (CPT 72148)',
    cpt_code: '72148',
    date_of_service: '2024-10-14',
    billed_amount: 2450.0,
    denied_amount: 2150.0,
    denial_code: 'CARC 50 - Non-covered service, medical necessity not established (MCG Spine Guidelines)',
    denial_reason:
      'Coverage is denied because documentation does not demonstrate completion of 6 consecutive weeks of conservative physical therapy or failure of oral NSAID therapy prior to advanced imaging request pursuant to Aetna Clinical Policy Bulletin #0236.',
    appeal_deadline_stated: '2025-04-12',
    plain_english_summary:
      'Aetna is refusing to pay for your lumbar MRI because their automated review algorithm looked for notes proving you tried 6 weeks of physical therapy and painkillers first. Even if you were in agonizing pain or already did therapy at home, their computer rubber-stamped a denial.',
    playbook_explanation:
      'Insurers use commercial screening software (like MCG or InterQual) to issue bulk denials for imaging. They count on 85% of patients giving up without appealing. When your doctor submits a Letter of Medical Necessity documenting neurological red flags (radiculopathy, sensory deficits, or intractable pain despite conservative efforts), overturn rates exceed 68%.',
    estimated_win_rate: 72,
    next_steps: [
      'Demand complete claim file and Medical Director reviewer qualifications under 29 CFR § 2560.503-1.',
      'Have your physician complete our Letter of Medical Necessity template highlighting neurological deficits and failed home conservative measures.',
      'File formal Level 1 Internal Appeal citing ERISA 29 U.S.C. § 1133 within 180 days.',
      'Schedule a Physician Peer-to-Peer review with Aetna medical director if treatment is urgent.',
    ],
    raw_text: `AETNA LIFE INSURANCE COMPANY
PO BOX 14079, LEXINGTON, KY 40512
EXPLANATION OF BENEFITS / NOTICE OF ADVERSE BENEFIT DETERMINATION

Date of Notice: October 22, 2024
Member Name: Sarah M. Jenkins
Member ID: W928472910 | Group Number: GRP-849201
Claim Number: CLM-2024-88391
Provider: Metro Imaging Center LLC (In-Network)
Date of Service: 10/14/2024
Procedure Code: CPT 72148 - MRI LUMBAR SPINE W/O CONTRAST
Billed Charges: $2,450.00
Plan Allowed: $0.00 | Paid: $0.00
Patient Responsibility: $2,150.00

DENIAL REASON CODE: CARC 50 / RARC N115
Reason: We have determined that this service is NOT MEDICALLY NECESSARY according to Aetna Clinical Policy Bulletin #0236. The clinical documentation submitted does not demonstrate documented trial and failure of at least six (6) weeks of formal physical therapy, or evidence of progressive acute neurological deficit within the preceding 90 days.

YOUR APPEAL RIGHTS:
If you disagree with this adverse benefit determination, you have the right to request an internal appeal within one hundred eighty (180) days of receiving this notice. Your deadline to file is April 12, 2025. Send written appeal to: Aetna Appeals Resolution Dept, PO Box 14463, Lexington, KY 40512. Under ERISA, you are entitled to receive free copies of all documents and clinical criteria used to make this decision upon written request.`,
  },
  {
    id: 'sample-er-surprise-bill',
    title: 'Emergency ER Appendectomy Out-of-Network Balance Bill',
    badge: 'Surprise / OON Bill',
    category: 'out_of_network',
    plan_type: 'employer_fully_insured',
    insurer: 'UnitedHealthcare',
    member_name: 'David L. Rodriguez',
    member_id: 'UHC-910283471',
    group_number: 'GRP-99231',
    claim_number: 'CLM-2024-55420',
    service_description: 'Emergency Laparoscopic Appendectomy (CPT 44970) & Trauma Surgical Team',
    cpt_code: '44970',
    date_of_service: '2024-09-02',
    billed_amount: 8750.0,
    denied_amount: 7200.0,
    denial_code: 'CARC 45 / PR-100 - Charges exceed Out-of-Network Usual, Customary & Reasonable (UCR) benchmark',
    denial_reason:
      'The attending on-call surgeon was not contracted with UnitedHealthcare Network. The claim was processed at non-participating provider rates. Patient is responsible for balance billing amount of $7,200.00.',
    appeal_deadline_stated: '2025-03-01',
    plain_english_summary:
      'You had an acute emergency appendectomy at an in-network hospital, but the on-call trauma surgeon was an out-of-network contractor who billed you $7,200. Under the federal No Surprises Act, this is an illegal surprise balance bill! You cannot be penalized for an out-of-network emergency provider.',
    playbook_explanation:
      'The federal No Surprises Act (Consolidated Appropriations Act 2021) strictly prohibits surprise balance billing for emergency medical conditions. You are only responsible for your standard in-network cost-sharing (deductible/copay). The provider and insurer must settle the difference through the federal Independent Dispute Resolution (IDR) portal—not bill you!',
    estimated_win_rate: 94,
    next_steps: [
      'Issue formal No Surprises Act dispute letter citing 42 U.S.C. § 300gg-111 & 45 CFR § 149 to both UnitedHealthcare and the surgical billing group.',
      'Instruct surgeon billing office to immediately cease collection activity and re-bill at in-network median cost-sharing.',
      'File complaint with the CMS "No Surprises Help Desk" (1-800-985-3059) if provider does not dismiss balance within 30 days.',
      'Notify credit bureaus if any negative trade lines are reported in violation of federal debt protection.',
    ],
    raw_text: `UNITEDHEALTHCARE SERVICES, INC.
CLAIMS PROCESSING UNIT - SALT LAKE CITY, UT
EXPLANATION OF BENEFITS

Date: September 18, 2024
Subscriber: David L. Rodriguez
Member ID: UHC-910283471 | Policy: Choice Plus PPO
Claim Number: CLM-2024-55420
Facility: St. Jude Regional Hospital (In-Network)
Treating Physician: Apex Surgical Associates LLC (Out-of-Network)
Date of Service: 09/02/2024
CPT 44970 - LAPAROSCOPY, SURGICAL, APPENDECTOMY
Billed Charges: $8,750.00
Eligible Network Allowance: $1,550.00
Plan Paid: $1,550.00
Patient Responsibility (Balance Billed): $7,200.00

EXPLANATION:
Provider is not in our network. Claim processed according to out-of-network benefit schedule. Patient is balance billed for charges exceeding the maximum allowable amount.
To appeal, submit written request within 180 calendar days.`,
  },
  {
    id: 'sample-prior-auth-specialty',
    title: 'GLP-1 / Biologic Specialty Drug Denied - Missing Prior Auth',
    badge: 'Prior Auth Missing',
    category: 'missing_prior_auth',
    plan_type: 'aca_marketplace',
    insurer: 'Anthem Blue Cross Blue Shield',
    member_name: 'Marcus E. Thorne',
    member_id: 'ANT-773829102',
    group_number: 'IND-ACA-2024',
    claim_number: 'RX-2024-91823',
    service_description: 'Semaglutide / Ozempic Injection 2mg/3mL (HCPCS J3490 / NDC 00169-4130-13)',
    cpt_code: 'J3490',
    date_of_service: '2024-11-01',
    billed_amount: 1180.0,
    denied_amount: 1180.0,
    denial_code: 'CARC 197 - Precertification/authorization/notification absent',
    denial_reason:
      'Pre-service prior authorization was required prior to dispensing this specialty tier formulary medication pursuant to Plan Clinical Guideline DRUG-0012. No authorization was on file.',
    appeal_deadline_stated: '',
    plain_english_summary:
      'Anthem denied your specialty medication because your doctor or pharmacy dispensed or submitted the claim without getting formal prior approval beforehand. Insurers routinely use prior authorization as a speed bump to delay high-cost pharmaceuticals.',
    playbook_explanation:
      'Missing prior auth is one of the most common administrative hurdles. If you have clinical documentation showing Type 2 diabetes diagnosis, HbA1c > 7.0%, or prior failure of metformin, we can request a retroactive prior authorization approval and expedited appeal.',
    estimated_win_rate: 76,
    next_steps: [
      'Submit request for retroactive prior authorization review with physician clinic clinical chart notes.',
      'Obtain laboratory blood test showing baseline HbA1c and medical history of previous first-line therapies.',
      'File formal expedited appeal letter citing urgent medication continuity under 45 CFR § 147.136.',
      'Demand insurer pharmacy committee review with step-therapy exception request.',
    ],
    raw_text: `ANTHEM BLUE CROSS BLUE SHIELD
PHARMACY SERVICES & APPEALS BRANCH
NOTICE OF ADVERSE BENEFIT DETERMINATION

Claim / Reference Number: RX-2024-91823
Date of Notice: November 05, 2024
Patient Name: Marcus E. Thorne
Subscriber ID: ANT-773829102 | Group: IND-ACA-2024
Prescribing Provider: Dr. Elena Vance, MD
Date of Service: 11/01/2024
Prescription / NDC: 00169-4130-13 (Semaglutide 2mg Pen)
Amount Billed: $1,180.00
Amount Approved: $0.00
Patient Responsibility: $1,180.00

REASON FOR DENIAL:
CARC 197: Precertification/prior authorization/notification absent.
This drug is classified as a Tier 4 Specialty agent requiring prior authorization approval based on step therapy criteria (trial of preferred generic agents). Because no prior authorization request was approved prior to claim adjudication, benefit coverage cannot be extended.

APPEAL RIGHTS:
Under ACA regulations, you may submit an appeal within 180 days of this notice. If your health condition is urgent, your prescriber may request an expedited 72-hour review.`,
  },
  {
    id: 'sample-knee-arthroscopy-coding',
    title: 'Knee Arthroscopy Denied for Billing / Unbundling Modifier Error',
    badge: 'Coding Error',
    category: 'coding_admin_error',
    plan_type: 'employer_fully_insured',
    insurer: 'Cigna Healthcare',
    member_name: 'Jessica Reynolds',
    member_id: 'CIG-44910284',
    group_number: 'GRP-33120',
    claim_number: 'CLM-2024-104928',
    service_description: 'Arthroscopy Knee Surgical with Meniscectomy & Chondroplasty (CPT 29881 + 29877)',
    cpt_code: '29881',
    date_of_service: '2024-08-20',
    billed_amount: 5400.0,
    denied_amount: 3200.0,
    denial_code: 'CARC 97 - The benefit for this service is included in the payment/allowance for another service',
    denial_reason:
      'CPT 29877 (debridement/chondroplasty) was submitted without appropriate National Correct Coding Initiative (NCCI) modifier 59/XS, representing unbundled procedural billing with CPT 29881.',
    appeal_deadline_stated: '2025-02-16',
    plain_english_summary:
      'Cigna slashed your surgery claim because the hospital billing department forgot to attach a specific two-digit billing modifier ("Modifier 59" or "XS") that proves the surgeon operated on two distinct compartments of your knee. This is a clerical mistake by billing, not a lack of insurance coverage!',
    playbook_explanation:
      'Insurers use automated NCCI bundling edits to automatically strike down multi-procedure claims. A simple corrected claim (Form CMS-1500 / UB-04 with Modifier 59) submitted by the provider’s billing department will immediately unlock the payment without an adversarial legal battle.',
    estimated_win_rate: 91,
    next_steps: [
      'Generate our "Billing Office Demand Letter" requesting immediate submission of a Corrected Claim with CPT 29881 and 29877-59.',
      'Request the operative notes from the surgeon clearly stating separate anatomical knee compartments (patellofemoral vs medial compartment).',
      'Instruct provider to put collections on hold while corrected claim adjudicates.',
      'File backup appeal with Cigna claims department within the 180-day window.',
    ],
    raw_text: `CIGNA HEALTH AND LIFE INSURANCE COMPANY
CLAIM REMITTANCE NOTICE

Date: August 28, 2024
Subscriber: Jessica Reynolds
ID: CIG-44910284 | Group: GRP-33120
Claim Ref: CLM-2024-104928
Provider: OrthoSport Surgery Center
Date of Service: 08/20/2024

CPT 29881 - ARTHROSCOPY KNEE MENISCECTOMY: Paid $2,200.00
CPT 29877 - ARTHROSCOPY KNEE DEBRIDEMENT/CHONDROPLASTY: Billed $3,200.00 | Paid $0.00

ADJUSTMENT REASON:
CARC 97: The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated under CMS NCCI mutually exclusive edits.
REMARKS: Unbundled procedure without distinct procedural modifier.
Total Denied: $3,200.00
Appeal filing deadline: 180 days from notice date (February 16, 2025).`,
  },
  {
    id: 'sample-immunotherapy-experimental',
    title: 'CAR-T / Novel Oncology Therapy Denied as "Experimental"',
    badge: 'Experimental',
    category: 'experimental_investigational',
    plan_type: 'employer_self_funded',
    insurer: 'Kaiser Permanente / Plan Administrator',
    member_name: 'Robert K. Chen',
    member_id: 'KP-882910384',
    group_number: 'ERISA-90012',
    claim_number: 'CLM-2024-77291',
    service_description: 'Targeted Immunotherapy Infusion / Off-Label NCCN Compendium Category 2A (HCPCS J9999)',
    cpt_code: 'J9999',
    date_of_service: '2024-10-05',
    billed_amount: 18500.0,
    denied_amount: 18500.0,
    denial_code: 'CARC 96 - Non-covered charges; experimental or investigational exclusion',
    denial_reason:
      'Treatment was denied as experimental, investigational, and unproven for this specific solid tumor histology pursuant to Plan Exclusion Section 12.4. Safety and efficacy not established in Phase III FDA registration trial.',
    appeal_deadline_stated: '2025-04-03',
    plain_english_summary:
      'Kaiser denied your cancer therapy claim by labeling it "experimental", even though your oncologist prescribed it based on national cancer guidelines (NCCN). Insurers use the "experimental" label to avoid paying for cutting-edge targeted treatments.',
    playbook_explanation:
      'Under federal and state insurance laws, insurers cannot dismiss oncology treatments as experimental if they are recognized in recognized drug compendia (e.g. NCCN Guidelines Category 1 or 2A, Clinical Pharmacology, Lexi-Drugs). Over 65% of experimental oncology denials are overturned upon submitting peer-reviewed clinical data and independent external review (IRO).',
    estimated_win_rate: 67,
    next_steps: [
      'Extract NCCN Compendium guidelines confirming 2A recommendation for this biomarker.',
      'Obtain signed oncologist letter specifying standard chemotherapy failure and molecular tumor board consensus.',
      'Submit comprehensive Level 1 expedited appeal citing federal compendia recognition statutes.',
      'Prepare simultaneous State / HHS Independent External Review petition.',
    ],
    raw_text: `KAISER PERMANENTE HEALTH PLAN
BENEFIT ADJUDICATION AND GRIEVANCE DEPARTMENT
NOTICE OF ADVERSE BENEFIT DETERMINATION

Date of Decision: October 10, 2024
Patient Name: Robert K. Chen
Medical Record / ID: KP-882910384 | Group: ERISA-90012
Claim Number: CLM-2024-77291
Facility: Kaiser Regional Cancer Pavilion
Attending Oncologist: Dr. Patricia Vance, MD, PhD
Date of Service: 10/05/2024
Procedure: Infusion of Targeted Molecular Immunotherapy (HCPCS J9999)
Total Billed: $18,500.00
Denied Amount: $18,500.00

RATIONALE FOR DENIAL:
CARC 96: Non-covered charge. The requested pharmaceutical and associated infusion are considered EXPERIMENTAL, INVESTIGATIONAL, OR UNPROVEN for the member's current diagnosis. Our technology assessment committee finds insufficient peer-reviewed Phase III clinical literature demonstrating superior overall survival for this specific off-label indication.

YOUR RIGHTS:
You are entitled to an expedited internal appeal (72-hour turnaround for ongoing cancer therapies). Deadline: 180 days from receipt (April 03, 2025). If your internal appeal is denied, you have the statutory right to an Independent External Review by an independent medical specialist.`,
  },
];
