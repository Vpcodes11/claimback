import { Case, DenialCategory, GeneratedLetter } from '../types';

interface LetterOptions {
  caseData: Case;
  planExcerpt?: string;
  customNotes?: string;
}

export class LetterGeneratorService {
  /**
   * Generate customized Level 1 Internal Appeal Letter
   */
  generateAppealLetter(options: LetterOptions): GeneratedLetter {
    const { caseData, planExcerpt, customNotes } = options;
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let statutesCited: string[] = [];
    let legalArgument = '';
    let categoryTitle = 'Internal Appeal';

    switch (caseData.denial_category) {
      case 'not_medically_necessary':
        categoryTitle = 'Medical Necessity & Clinical Guidelines Rebuttal';
        statutesCited = [
          'ERISA § 503 (29 U.S.C. § 1133)',
          '29 C.F.R. § 2560.503-1',
          'ACA Section 2719 (45 C.F.R. § 147.136)',
        ];
        legalArgument = `
### 1. ERRONEOUS APPLICATION OF MEDICAL NECESSITY CRITERIA
The plan’s denial asserts that the prescribed service (${caseData.service}) does not meet coverage guidelines or lacks prerequisite conservative therapy. This determination fails to reflect the treating physician's documented clinical judgment and established medical evidence.

Under ERISA § 503 and 29 C.F.R. § 2560.503-1(h)(2)(iv), full and fair review requires that plan fiduciaries consider all comments, medical records, and expert opinions submitted by the claimant. The treating provider has documented that alternative or conservative therapies have either failed, are medically contraindicated, or would pose unreasonable risk of irreversible deterioration.

### 2. REBUTTAL OF PROPRIETARY GUIDELINES (MCG / INTERQUAL)
Insurers frequently apply computerized screening algorithms (such as Milliman Care Guidelines or InterQual) as rigid coverage exclusions. Such guidelines cannot lawfully substitute for individualized medical evaluation by an accredited specialist. As affirmed in *Wit v. United Behavioral Health*, plan administrators breach their fiduciary duty when internal guidelines are more restrictive than generally accepted standards of medical care.`;
        break;

      case 'out_of_network':
        categoryTitle = 'No Surprises Act & Emergency Out-of-Network Balance Billing Dispute';
        statutesCited = [
          'No Surprises Act, Consolidated Appropriations Act 2021 (42 U.S.C. § 300gg-111)',
          '45 C.F.R. § 149.410 & § 149.420',
          'ACA § 2719 (45 C.F.R. § 147.136)',
        ];
        legalArgument = `
### 1. STATUTORY PROTECTIONS UNDER THE NO SURPRISES ACT
Federal law strictly prohibits out-of-network balance billing for emergency medical services and non-emergency ancillary services performed at participating healthcare facilities (42 U.S.C. § 300gg-111). Under 45 C.F.R. § 149, patients cannot be billed for amounts exceeding in-network cost-sharing.

The claim in question (${caseData.claim_no}) arises from care received without voluntary, informed out-of-network consent as defined under federal regulations. Consequently:
* The member's financial obligation is capped strictly at the applicable in-network deductible and coinsurance.
* The out-of-network provider and plan administrator must resolve any payment dispute through the federal Independent Dispute Resolution (IDR) process rather than balance billing the patient.`;
        break;

      case 'missing_prior_auth':
        categoryTitle = 'Prior Authorization Rebuttal & Retroactive Approval Request';
        statutesCited = [
          '29 C.F.R. § 2560.503-1(f)(2)(ii)',
          'ACA § 2719 (45 C.F.R. § 147.136)',
          'State Prompt Pay & Administrative Cure Standards',
        ];
        legalArgument = `
### 1. ADMINISTRATIVE DENIAL WITHOUT CLINICAL MERIT EVALUATION
The claim was denied purely for lack of pre-service authorization. Federal and state health benefit regulations recognize that procedural delays must not deprive beneficiaries of medically necessary care, particularly where clinical urgency or physician administrative error prevented timely pre-certification.

### 2. RIGHT TO RETROACTIVE PRE-CERTIFICATION
We request immediate retroactive authorization based upon the attached contemporaneous clinical chart notes. Denial of coverage for clinically appropriate care based solely on an administrative timing technicality constitutes an arbitrary and capricious benefit determination under 29 U.S.C. § 1133.`;
        break;

      case 'coding_admin_error':
        categoryTitle = 'Billing Code Correction & NCCI Edits Adjudication';
        statutesCited = [
          'CMS National Correct Coding Initiative (NCCI) Manual',
          'HIPAA Electronic Data Interchange (EDI) Standards (45 C.F.R. § 162)',
          'ERISA Full and Fair Review (29 U.S.C. § 1133)',
        ];
        legalArgument = `
### 1. CLERICAL BILLING CODE ERROR IDENTIFICATION
The adverse adjudication of this claim stems from an administrative or coding modifier omission (e.g. CPT modifier 59 / 25 or unbundling edit) rather than a lack of contractual benefit coverage. 

A corrected claim (Form CMS-1500 / UB-04) is being submitted simultaneously by the provider’s billing department with appropriate anatomical modifiers and diagnostic linkage. We demand that the plan re-adjudicate this claim upon receipt of the corrected billing dataset without imposing untimely filing penalties.`;
        break;

      case 'experimental_investigational':
        categoryTitle = 'Experimental / Investigational Exclusion Rebuttal';
        statutesCited = [
          'Social Security Act § 1861(t)(2)(B) (Approved Compendia)',
          'ACA Patient Protection Provisions (45 C.F.R. § 147.136)',
          'State Mandated Cancer Compendium & Off-Label Drug Statues',
        ];
        legalArgument = `
### 1. TREATMENT IS RECOGNIZED UNDER NATIONAL CLINICAL COMPENDIA
The plan’s characterization of this treatment (${caseData.service}) as 'experimental or investigational' is contradicted by national clinical practice guidelines and federally recognized compendia (such as the National Comprehensive Cancer Network [NCCN] Drugs & Biologics Compendium, Clinical Pharmacology, or American College of Cardiology guidelines).

Federal and state laws mandate coverage for off-label or novel therapies when recognized in authoritative compendia or supported by peer-reviewed clinical trials demonstrating therapeutic efficacy.`;
        break;

      default:
        categoryTitle = 'Comprehensive Benefit Denial Appeal';
        statutesCited = ['ERISA § 503 (29 U.S.C. § 1133)', 'ACA § 2719 (45 C.F.R. § 147.136)'];
        legalArgument = `
### 1. ARBITRARY BENEFIT EXCLUSION
The plan’s denial of coverage for ${caseData.service} violates the governing plan provisions and fails to provide a full and fair review as required by federal law. The service rendered was medically necessary, clinically appropriate, and falls within the scope of essential health benefits.`;
        break;
    }

    // Embed Plan document excerpt if provided
    let planDocSection = '';
    if (planExcerpt && planExcerpt.trim().length > 0) {
      planDocSection = `
### 3. CONFLICT WITH PLAN DOCUMENT / SUMMARY PLAN DESCRIPTION (SPD)
The governing Plan Document explicitly provides for coverage of medically necessary care. Specifically, Section ${planExcerpt.length > 50 ? 'of the Summary Plan Description' : planExcerpt}:
> "${planExcerpt.trim()}"

The adverse determination issued by the plan administrator directly conflicts with the express language of the governing plan document cited above. Under ERISA fiduciary standards (*Firestone Tire & Rubber Co. v. Bruch*), plan administrators must adhere strictly to the written terms of the employee benefit plan.`;
    }

    const urgencyHeader = caseData.is_urgent
      ? '⚠️ **URGENT / EXPEDITED APPEAL DEMAND (72-HOUR MANDATORY DETERMINATION UNDER 29 C.F.R. § 2560.503-1(i)(2)(i))**\n\n'
      : '';

    const customNotesSection = customNotes
      ? `\n\n### ADDITIONAL CASE FACTS & CLINICAL EVIDENCE:\n${customNotes}`
      : '';

    const contentMarkdown = `${urgencyHeader}**DATE:** ${today}

**VIA CERTIFIED MAIL, RETURN RECEIPT REQUESTED & FACSIMILE**

**TO:**
${caseData.insurer}
Attn: Appeals Resolution Department / Medical Review Committee
State of Jurisdiction: ${caseData.state}

**SUBJECT: FORMAL LEVEL 1 WRITTEN APPEAL — CLAIM #${caseData.claim_no}**
* **Patient / Member Name:** ${caseData.member_name}
* **Member ID:** ${caseData.member_id || 'On File'}
* **Claim Number:** ${caseData.claim_no}
* **Date of Service (DOS):** ${caseData.dos}
* **Service / Procedure:** ${caseData.service} (CPT: ${caseData.cpt_code || 'N/A'})
* **Total Disputed Amount:** $${caseData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
* **Denial Reason / Code Stated:** ${caseData.denial_code || ''} — ${caseData.denial_reason}

---

Dear Appeals Committee and Medical Director:

Please accept this letter as my formal written Level 1 Appeal disputing the adverse benefit determination issued on the above-referenced claim. This appeal is submitted pursuant to rights guaranteed under federal law, including **${statutesCited.join(', ')}**, and the terms of my health insurance policy.

${legalArgument}
${planDocSection}
${customNotesSection}

### MANDATORY STATUTORY DEMAND FOR CLAIM FILE & REVIEWER CREDENTIALS
Pursuant to federal regulations under **29 C.F.R. § 2560.503-1(h)(2)(iii)** and **45 C.F.R. § 147.136**, I hereby demand that the plan provide to me, free of charge within thirty (30) days:
1. The **complete administrative claim file**, including all medical reviewer notes, internal logs, and external vendor correspondence.
2. The specific **clinical criteria, medical policy bulletins, and screening algorithms** relied upon in issuing this denial.
3. The **identity, medical license number, and board-certified medical specialty** of the reviewer who rendered the adverse determination, verifying that the reviewer possesses the appropriate clinical expertise in the relevant field of medicine pursuant to 29 C.F.R. § 2560.503-1(h)(3)(iii).

### CONCLUSION & REQUEST FOR RELIEF
Based upon the attached medical evidence and statutory protections, I respectfully request that ${caseData.insurer} promptly overturn this adverse determination, approve the claim, and issue full payment.

If this appeal is not granted in full, please provide a written explanation detailing the clinical rationale, the specific plan provisions relied upon, and clear instructions for initiating an **Independent External Review (IRO)**.

Sincerely,

________________________________________
**${caseData.member_name}**
Patient / Authorized Representative
Claim Reference: ${caseData.claim_no}`;

    return {
      id: `let-appeal-${Date.now()}`,
      case_id: caseData.id,
      letter_type: 'internal_appeal',
      title: `Formal Appeal Letter: ${categoryTitle}`,
      recipient: `${caseData.insurer} Appeals Resolution Department`,
      recipient_address: 'Appeals Division, Claims Resolution Center',
      subject: `FORMAL APPEAL - CLAIM #${caseData.claim_no} - ${caseData.member_name}`,
      content_markdown: contentMarkdown,
      statutes_cited: statutesCited,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Generate "Letter of Medical Necessity" (LOMN) request template for the treating physician
   */
  generateDoctorLOMNTemplate(caseData: Case): GeneratedLetter {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const contentMarkdown = `**CONFIDENTIAL PHYSICIAN CLINICAL INSTRUCTION PACKET**
**ATTN: TREATING PHYSICIAN & CLINICAL STAFF**
**RE: LETTER OF MEDICAL NECESSITY (LOMN) REBUTTAL FOR PATIENT ${caseData.member_name.toUpperCase()}**

**DATE:** ${today}
* **Patient Name:** ${caseData.member_name}
* **Insurer:** ${caseData.insurer}
* **Claim #:** ${caseData.claim_no}
* **Procedure / Service:** ${caseData.service}
* **Date of Service / Proposed Date:** ${caseData.dos}
* **Insurer Stated Denial Reason:** "${caseData.denial_reason}"

---

### INSTRUCTIONS FOR THE PHYSICIAN / CLINICAL OFFICE:
Your patient’s insurance company has denied coverage for the service above. Insurers utilize automated guidelines (such as Milliman Care Guidelines / InterQual) designed to issue template denials unless the treating doctor explicitly addresses their algorithmic criteria.

To overturn this denial on appeal, please print the draft template below onto your **official clinic letterhead**, verify the clinical details, and sign.

---

### [DRAFT TEMPLATE — COPY TO OFFICIAL CLINIC LETTERHEAD]

**DATE:** ________________________

**TO:** ${caseData.insurer} — Medical Review & Appeals Committee
**RE: LETTER OF MEDICAL NECESSITY & PEER REBUTTAL**
* **Patient:** ${caseData.member_name} | **DOB:** ____________________
* **Policy / Member ID:** ${caseData.member_id || '____________________'}
* **Claim # / Auth Ref:** ${caseData.claim_no}
* **Prescribed Service / CPT:** ${caseData.service} (CPT: ${caseData.cpt_code || '__________'})

Dear Medical Director and Appeals Committee:

I am writing as the treating physician for ${caseData.member_name} to provide clinical substantiation regarding the medical necessity of ${caseData.service}. I have personally evaluated this patient and strongly dispute your denial determination dated ${caseData.dos}.

#### 1. PRIMARY DIAGNOSIS & CLINICAL PRESENTATION
* **Primary Diagnosis (ICD-10):** __________________________________________________
* **Onset & Duration of Symptoms:** ________________________________________________
* **Clinical Severity & Physical Exam Findings:**
  [Physician: Please document physical exam findings, e.g., functional impairment, neurological deficits, severe pain scale, limitation of activities of daily living].

#### 2. CONSERVATIVE TREATMENT HISTORY & WHY ALTERNATIVES ARE INAPPROPRIATE
* [ ] **Physical Therapy / Rehabilitation:** Patient completed _____ weeks of therapy from ________ to ________ with no significant relief / deterioration.
* [ ] **Pharmacological Interventions:** Patient previously tried and failed / had adverse reactions to: __________________________________________________.
* [ ] **Invasive / Injection Therapies:** ________________________________________.
* [ ] **Contraindications:** Standard first-line alternatives are clinically contraindicated due to: __________________________________________________.

#### 3. CLINICAL CONSEQUENCES OF WITHHOLDING / DELAYING THIS CARE
Delaying or withholding this prescribed treatment will result in:
* Severe, unremitting pain and progressive functional disability.
* Irreversible physiological deterioration or risk of acute emergency hospitalization.
* Compromise of long-term patient recovery and surgical outcome.

#### 4. PEER-REVIEWED MEDICAL LITERATURE & CLINICAL PRACTICE GUIDELINES
The requested treatment represents standard-of-care medicine in accordance with published guidelines from [e.g. American Academy of Orthopaedic Surgeons / American College of Radiology / NCCN]:
* [Physician: Insert citation or reference to standard peer-reviewed specialty literature].

#### 5. OFFER FOR PHYSICIAN PEER-TO-PEER DISCUSSION
If your medical director continues to question the medical necessity of this care, I request an immediate **Peer-to-Peer consultation** with a board-certified physician in my identical medical specialty. You may reach my clinical coordinator directly at: (_____) _____-_________ to schedule.

Respectfully submitted,

____________________________________________________
**Physician Name, MD / DO**
Board Certification: ________________________________
State Medical License #: ____________________________
NPI Number: _________________________________________
Clinic Address & Phone: ______________________________`;

    return {
      id: `let-lomn-${Date.now()}`,
      case_id: caseData.id,
      letter_type: 'medical_necessity_request',
      title: 'Physician Letter of Medical Necessity (LOMN) Template',
      recipient: 'Treating Physician Clinical Coordinator',
      recipient_address: 'Attending Physician Clinic',
      subject: `CLINICAL PACKET - Letter of Medical Necessity Request - ${caseData.member_name}`,
      content_markdown: contentMarkdown,
      statutes_cited: ['29 C.F.R. § 2560.503-1', 'AMA Ethical Opinion 10.01'],
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Generate formal Document & Claim File Request Letter under ERISA 29 CFR § 2560.503-1
   */
  generateDocumentRequestLetter(caseData: Case): GeneratedLetter {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const contentMarkdown = `**DATE:** ${today}

**VIA CERTIFIED MAIL (RETURN RECEIPT REQUESTED) & EMAIL**

**TO:**
${caseData.insurer}
Claims Administration & Privacy Compliance Department

**SUBJECT: STATUTORY DEMAND FOR COMPLETE CLAIM FILE & CLINICAL GUIDELINES**
* **Member Name:** ${caseData.member_name}
* **Member ID:** ${caseData.member_id || 'On File'}
* **Claim Number:** ${caseData.claim_no}
* **Date of Service:** ${caseData.dos}
* **Statutory Basis:** 29 C.F.R. § 2560.503-1(h)(2)(iii) & 45 C.F.R. § 164.524 (HIPAA)

Dear Claims Administrator:

Under federal regulations governing employee benefit plans and health insurance appeals, claimants are entitled to receive, **free of charge upon request**, reasonable access to and copies of all documents, records, and other information relevant to the claimant's claim for benefits (29 C.F.R. § 2560.503-1(h)(2)(iii)).

Please produce the following records within thirty (30) calendar days of receipt of this demand:

1. **The Entire Administrative Claim File:** Every document, note, email, telephone log, internal electronic claim note, and record generated, reviewed, or relied upon in adjudicating Claim #${caseData.claim_no}.
2. **Clinical Criteria & Guidelines:** The full, unredacted text of the specific clinical rules, medical policy bulletins, clinical criteria (including licensed Milliman Care Guidelines, InterQual, or internal algorithm criteria) utilized to deny this claim.
3. **Reviewer Qualifications & Specialty Credentials:** The full name, professional medical board certification, state medical license number, and medical specialty of the individual medical reviewer who reviewed and rendered the denial decision.
4. **Statement of Scientific Evidentiary Basis:** If the denial was based on medical necessity or experimental/investigational determination, an explanation of the scientific or clinical judgment for the determination, applying the terms of the plan to the claimant’s medical circumstances.
5. **Contractual Language:** The precise section of the Summary Plan Description (SPD) or policy certificate invoked to deny coverage.

Failure to provide these mandated documents constitutes a violation of federal claims procedure regulations and prejudices the claimant’s statutory right to a full and fair review.

Please transmit these records to the address or secure email provided below.

Sincerely,

________________________________________
**${caseData.member_name}**
Address on file with Plan`;

    return {
      id: `let-doc-req-${Date.now()}`,
      case_id: caseData.id,
      letter_type: 'document_request',
      title: 'Mandatory Claim File & Guidelines Request Letter',
      recipient: `${caseData.insurer} Claims Records Department`,
      recipient_address: 'Records & Disclosure Branch',
      subject: `STATUTORY RECORDS DEMAND - CLAIM #${caseData.claim_no} - ${caseData.member_name}`,
      content_markdown: contentMarkdown,
      statutes_cited: ['29 C.F.R. § 2560.503-1(h)(2)(iii)', 'HIPAA 45 C.F.R. § 164.524', 'ERISA § 502(c)'],
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Generate Provider Billing Office Demand Letter (for coding errors / balance bills)
   */
  generateProviderBillingDisputeLetter(caseData: Case): GeneratedLetter {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const contentMarkdown = `**DATE:** ${today}

**TO:** Hospital / Healthcare Provider Billing Department & Patient Financial Services
**RE: DEMAND FOR CORRECTED CLAIM SUBMISSION & ADMINISTRATIVE HOLD**
* **Patient Name:** ${caseData.member_name}
* **Account / Billing Reference:** ${caseData.claim_no}
* **Date of Service:** ${caseData.dos}
* **Service:** ${caseData.service}
* **Disputed Balance:** $${caseData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
* **Primary Insurer:** ${caseData.insurer}

Dear Billing Manager:

I am writing regarding the patient statement received for the above date of service. An audit of the Explanation of Benefits (EOB) indicates that the claim was rejected or underpaid due to an administrative or coding modifier error rather than a policy benefit exclusion.

### 1. SPECIFIC CODING / SUBMISSION REMEDIATION REQUIRED
The claim was adjudicated under reason code: **${caseData.denial_code || 'Administrative Edit'}** ("${caseData.denial_reason}").
To resolve this balance promptly, please take the following corrective steps:
* Submit a **Corrected Claim (Form CMS-1500 or UB-04)** to ${caseData.insurer}.
* Append the appropriate procedural modifier (e.g. Modifier 59/XS for distinct procedural services, or Modifier 25 for significant, separately identifiable E&M services).
* Attach the operative report or physician clinical notes validating independent anatomical sites or distinct sessions.

### 2. DEMAND FOR ADMINISTRATIVE COLLECTION FREEZE
Pursuant to consumer fair billing standards, please confirm in writing within ten (10) business days that:
1. This patient account has been placed on an **administrative hold** pending re-adjudication.
2. No late fees, interest, or collection activities will be initiated against the patient while the corrected claim is under review.
3. No derogatory reports will be transmitted to consumer credit reporting agencies.

Thank you for your prompt assistance in resolving this billing discrepancy.

Sincerely,

________________________________________
**${caseData.member_name}**
Patient`;

    return {
      id: `let-prov-disp-${Date.now()}`,
      case_id: caseData.id,
      letter_type: 'provider_billing_dispute',
      title: 'Provider Billing Office Corrected Claim Demand Letter',
      recipient: 'Healthcare Provider Patient Accounts Department',
      recipient_address: 'Patient Financial Services',
      subject: `BILLING DISPUTE & CORRECTED CLAIM DEMAND - ACCT #${caseData.claim_no}`,
      content_markdown: contentMarkdown,
      statutes_cited: ['HIPAA EDI Standards 45 C.F.R. § 162', 'Fair Debt Collection Practices Act (FDCPA)'],
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Generate External Review Request (IRO) when second denial arrives
   */
  generateExternalReviewLetter(caseData: Case): GeneratedLetter {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const contentMarkdown = `**REQUEST FOR INDEPENDENT EXTERNAL REVIEW (IRO)**
**SUBMITTED PURSUANT TO ACA SECTION 2719 & APPLICABLE STATE INSURANCE LAW**

**DATE:** ${today}

**TO:**
Federal External Review Process / State Department of Insurance
Office of Independent Medical Review
Jurisdiction State: ${caseData.state}

**APPLICANT / CLAIMANT INFORMATION:**
* **Patient Name:** ${caseData.member_name}
* **Insurance Carrier:** ${caseData.insurer}
* **Member / Policy ID:** ${caseData.member_id || 'On File'}
* **Claim Number:** ${caseData.claim_no}
* **Date of Final Adverse Determination:** ${caseData.dos}
* **Disputed Service:** ${caseData.service} (CPT: ${caseData.cpt_code || 'N/A'})
* **Denied Dollar Amount:** $${caseData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}

---

### 1. EXHAUSTION OF INTERNAL APPEALS
The claimant has timely pursued and exhausted the health plan’s internal claims and appeals procedures. The plan has upheld its adverse determination based on a dispute concerning **medical necessity, appropriateness, or experimental treatment status**.

### 2. STATUTORY ELIGIBILITY FOR INDEPENDENT EXTERNAL REVIEW
Under 45 C.F.R. § 147.136 and state insurance regulations, the claimant is legally entitled to an independent review conducted by an accredited Independent Review Organization (IRO). The IRO review is conducted by independent clinical specialists with no financial ties to ${caseData.insurer}.

### 3. GROUNDS FOR OVERTURNING THE INSURER'S ADVERSE DETERMINATION
1. **Clinical Appropriateness:** The treatment was prescribed in accordance with standard medical practice.
2. **Physician Testimony:** The attending physician has provided a detailed Letter of Medical Necessity demonstrating that withholding treatment poses substantial risk of medical deterioration.
3. **Flawed Plan Criteria:** The insurer’s internal screening criteria are excessively restrictive and conflict with established scientific compendia.

### 4. RELIEF REQUESTED
The claimant requests that the Independent Review Organization order ${caseData.insurer} to reverse its denial and immediately authorize and pay for the prescribed medical care.

Respectfully submitted,

________________________________________
**${caseData.member_name}**
Claimant / Authorized Representative`;

    return {
      id: `let-ext-rev-${Date.now()}`,
      case_id: caseData.id,
      letter_type: 'external_review_request',
      title: 'Formal Independent External Review (IRO) Petition',
      recipient: 'Independent Review Organization / Department of Insurance',
      recipient_address: 'HHS External Review / State DOI IRO Unit',
      subject: `PETITION FOR EXTERNAL REVIEW - CLAIM #${caseData.claim_no} - ${caseData.member_name}`,
      content_markdown: contentMarkdown,
      statutes_cited: ['ACA § 2719 (45 C.F.R. § 147.136)', 'State Insurance Code External Review Statutes'],
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Phone Script for calling the insurer
   */
  getPhoneScript(caseData: Case) {
    return {
      title: `Insurer Call Script: ${caseData.insurer}`,
      estimatedTime: '15-20 minutes',
      prepChecklist: [
        `Have Claim #${caseData.claim_no} and Member ID ${caseData.member_id || 'card'} ready`,
        'Keep pen and paper handy to log: Date, Rep Name, Employee ID, Reference #',
        'Stay calm, professional, and courteous — but persistently firm',
      ],
      steps: [
        {
          phase: 'Step 1: First-Line Representative Initial Contact',
          dialogue: `"Hello, my name is ${caseData.member_name}. I am calling regarding Claim #${caseData.claim_no} for date of service ${caseData.dos}. Before we begin, could you please give me your first name, employee ID number, and a call reference number for this call?"`,
          tip: 'Always log the reference number immediately. If the call drops, you can reference the exact recording.',
        },
        {
          phase: 'Step 2: Clarifying the Exact Denial Reason & Clinical Criteria',
          dialogue: `"I received a denial letter stating '${caseData.denial_reason}'. Can you tell me the exact clinical criteria or medical policy bulletin number your medical review team used to make this decision? Also, is there an active prior authorization request on file?"`,
          tip: 'Ask if the decision was automated or if a licensed physician personally reviewed it.',
        },
        {
          phase: 'Step 3: Demanding the Free Claim File under ERISA / ACA',
          dialogue: `"Under federal regulations 29 C.F.R. § 2560.503-1, I have a statutory right to receive a complete copy of my claim file and the reviewer's clinical credentials free of charge. Can you please mail or securely email that to me today?"`,
          tip: 'Representatives are trained to comply when federal CFR regulations are cited.',
        },
        {
          phase: 'Step 4: Requesting a Physician Peer-to-Peer Review',
          dialogue: `"My doctor is prepared to conduct a Peer-to-Peer review with your medical director to discuss the clinical urgency. What is the direct phone number, fax number, and scheduling deadline for my doctor's office to book this Peer-to-Peer?"`,
          tip: 'Peer-to-Peer reviews are often scheduled within 3-5 days and frequently resolve medical necessity disputes.',
        },
        {
          phase: 'Step 5: Verifying Submission Destination for Written Appeal',
          dialogue: `"I am filing a formal Level 1 written appeal packet today. What is the exact physical mailing address, secure portal upload URL, and direct appeals fax number to ensure it is logged immediately?"`,
          tip: 'Always ask for the fax number. Faxing with a transmission receipt provides legal proof of timely filing.',
        },
      ],
    };
  }
}

export const letterGenerator = new LetterGeneratorService();
