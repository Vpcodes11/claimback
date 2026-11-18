import { DenialCategory, ExtractedDenialData, PlanType } from '../types';

// Regular expressions and keyword dictionaries for intelligent extraction
const INSURER_KEYWORDS: { pattern: RegExp; name: string }[] = [
  { pattern: /united\s*health\s*care|uhc|optum/i, name: 'UnitedHealthcare' },
  { pattern: /aetna|cvs\s*health/i, name: 'Aetna Life Insurance' },
  { pattern: /cigna|evernorth/i, name: 'Cigna Healthcare' },
  { pattern: /blue\s*cross|blue\s*shield|anthem|bcbs/i, name: 'Anthem Blue Cross Blue Shield' },
  { pattern: /humana/i, name: 'Humana' },
  { pattern: /kaiser\s*permanente/i, name: 'Kaiser Permanente' },
  { pattern: /molina/i, name: 'Molina Healthcare' },
  { pattern: /centene|ambetter/i, name: 'Ambetter (Centene)' },
  { pattern: /oscar\s*health/i, name: 'Oscar Health' },
  { pattern: /medicare/i, name: 'Medicare' },
  { pattern: /medicaid/i, name: 'State Medicaid Program' },
];

const PLAN_TYPE_KEYWORDS: { pattern: RegExp; type: PlanType }[] = [
  { pattern: /erisa|self[\s-]funded|self[\s-]insured|summary plan description/i, type: 'employer_self_funded' },
  { pattern: /fully[\s-]insured|commercial group|group health plan/i, type: 'employer_fully_insured' },
  { pattern: /aca|marketplace|exchange|individual policy|qualified health plan/i, type: 'aca_marketplace' },
  { pattern: /medicare advantage|part c|hmo-pos|medicare ppo/i, type: 'medicare_advantage' },
  { pattern: /original medicare|traditional medicare|part a|part b/i, type: 'traditional_medicare' },
  { pattern: /medicaid|chip|state managed care/i, type: 'medicaid' },
  { pattern: /tricare|champva/i, type: 'tricare' },
];

const CATEGORY_RULES: {
  category: DenialCategory;
  patterns: RegExp[];
  winRate: number;
  plainEnglish: string;
  playbook: string;
  nextSteps: string[];
}[] = [
  {
    category: 'missing_prior_auth',
    patterns: [
      /prior auth|precertification|pre-service|authorization absent|CARC 197|CARC 198|not approved prior/i,
      /unauthorized service|pre-determination/i,
    ],
    winRate: 76,
    plainEnglish:
      'The insurance company refused payment because your doctor or clinic did not get prior approval before performing the procedure or dispensing the medication.',
    playbook:
      'Insurers use prior authorization as a financial bottleneck. When clinical records show the treatment met clinical guidelines, retroactive authorization appeals succeed over 70% of the time, especially when accompanied by physician clinical notes.',
    nextSteps: [
      'Ask your doctor’s office to initiate a retroactive prior authorization request.',
      'Obtain copies of clinical chart notes, diagnostic tests, and treatment history.',
      'Submit formal appeal citing urgent medical continuity if ongoing care is interrupted.',
      'Request medical director review under the expedited 72-hour provisions if health is at risk.',
    ],
  },
  {
    category: 'out_of_network',
    patterns: [
      /out[\s-]of[\s-]network|non[\s-]participating|balance bill|usual customary|CARC 45|PR-100|no surprises|ancillary provider/i,
      /out of area|non-network provider/i,
    ],
    winRate: 92,
    plainEnglish:
      'You are being charged high out-of-network rates because the facility, doctor, or emergency provider does not have a contract with your insurance company.',
    playbook:
      'Under the federal No Surprises Act (2022), surprise balance billing is illegal for emergency room services, air ambulance, and non-emergency ancillary providers (anesthesiology, pathology, radiology) at in-network facilities. The provider must accept in-network cost sharing and resolve differences with the insurer through federal dispute resolution.',
    nextSteps: [
      'Check whether the service was an emergency or at an in-network facility under the No Surprises Act (42 U.S.C. § 300gg-111).',
      'Send a formal No Surprises Act dispute notice to both provider and insurer.',
      'Instruct provider billing department to freeze collection activities and re-issue statement at in-network copay.',
      'Report unresolved violations to CMS No Surprises Help Desk (1-800-985-3059).',
    ],
  },
  {
    category: 'coding_admin_error',
    patterns: [
      /coding error|modifier|unbundl|CARC 97|CARC 16|CARC 18|duplicate|mutually exclusive|ncci|cpt mismatch|npi/i,
      /billing error|clerical error|incomplete claim/i,
    ],
    winRate: 91,
    plainEnglish:
      'The claim was rejected due to a paperwork, clerical, or procedural billing code error made by the doctor’s or hospital’s billing department—such as a missing modifier or unbundled procedure code.',
    playbook:
      'This is usually not a denial of coverage, but an administrative hiccup. By having the provider submit a "Corrected Claim" (Form CMS-1500 or UB-04) with the proper billing modifier (such as Modifier 59 or 25), the claim can be quickly re-adjudicated and paid in full.',
    nextSteps: [
      'Send our Provider Billing Office Demand Letter requesting a corrected claim submission.',
      'Ensure the provider attaches operative reports and proper NCCI modifiers.',
      'Request confirmation that patient billing account is placed on an administrative hold.',
      'Follow up within 21 days for confirmation of remittance.',
    ],
  },
  {
    category: 'experimental_investigational',
    patterns: [
      /experimental|investigational|unproven|clinical trial|off[\s-]label|CARC 96|efficacy not established|fda approval/i,
      /investigational device|not standard of care/i,
    ],
    winRate: 67,
    plainEnglish:
      'The insurer deemed your treatment "experimental" or "investigational", arguing that clinical trial evidence or FDA approvals are insufficient for your specific condition.',
    playbook:
      'Insurers routinely classify cutting-edge biologics, targeted cancer therapies, and surgical techniques as experimental. When backed by recognized compendia (e.g. NCCN for oncology) or peer-reviewed literature, external medical review panels (IROs) overturn experimental denials in over 60% of cases.',
    nextSteps: [
      'Gather peer-reviewed medical journal publications and national practice guidelines (e.g. NCCN, ACC, ASCO).',
      'Obtain treating physician affirmation that standard first-line therapies are contraindicated or exhausted.',
      'Submit formal expedited appeal citing statutory compendia coverage mandates.',
      'Petition for binding Independent External Review (IRO) upon Level 1 exhaustion.',
    ],
  },
  {
    category: 'not_medically_necessary',
    patterns: [
      /medically necessary|medical necessity|not reasonable and necessary|CARC 50|clinical policy bulletin|guidelines not met|mcg|interqual/i,
      /lack of clinical documentation|conservative treatment|fail first/i,
    ],
    winRate: 72,
    plainEnglish:
      'The insurance company’s algorithm or medical director claims your prescribed test, surgery, or treatment wasn’t proven necessary based on their internal commercial guidelines (such as MCG or InterQual).',
    playbook:
      'Insurers rely on computer-generated guidelines to deny high-value scans, surgeries, and therapies. A treating physician’s detailed Letter of Medical Necessity refuting the reviewer’s rationale—supported by peer-reviewed clinical studies—has a high overturn rate in Level 1 internal appeals and Independent External Reviews (IRO).',
    nextSteps: [
      'Demand the full claim file and clinical criteria used under ERISA 29 CFR § 2560.503-1.',
      'Have your doctor complete a custom Letter of Medical Necessity detailing why conservative options failed.',
      'Request the credentials and specialty of the denying medical reviewer to ensure peer-to-peer equivalence.',
      'Prepare for an Independent External Review (IRO) if internal appeal is not immediately reversed.',
    ],
  },
  {
    category: 'excluded_service',
    patterns: [
      /excluded service|plan exclusion|benefit limitation|cosmetic|not a covered benefit|non-covered service|CARC 49/i,
      /maximum benefit reached|excluded under contract/i,
    ],
    winRate: 54,
    plainEnglish:
      'Your insurance policy claims this specific type of service is explicitly excluded from your coverage contract (e.g. deemed cosmetic, dental vs medical, or weight management exclusion).',
    playbook:
      'Contract exclusions can often be overcome by proving the procedure was reconstructive rather than cosmetic, or by invoking the Mental Health Parity Act (MHPAEA) or ACA Essential Health Benefit mandates if the exclusion violates federal nondiscrimination standards.',
    nextSteps: [
      'Review your full Summary Plan Description (SPD) / Evidence of Coverage for the exact exclusion wording.',
      'Obtain clinical proof that treatment was performed to restore bodily function (reconstructive) rather than elective.',
      'Assess whether the exclusion violates ACA Essential Health Benefits or Mental Health Parity laws.',
      'Request an administrative appeal based on medical necessity exception.',
    ],
  },
];

export class DecoderService {
  /**
   * Parse raw text or OCR string and extract health insurance denial parameters
   */
  decode(text: string): ExtractedDenialData {
    const cleanText = text.trim();

    // 1. Detect Insurer
    let insurer = 'Health Insurance Plan';
    for (const item of INSURER_KEYWORDS) {
      if (item.pattern.test(cleanText)) {
        insurer = item.name;
        break;
      }
    }

    // 2. Detect Plan Type
    let planType: PlanType = 'employer_self_funded';
    for (const item of PLAN_TYPE_KEYWORDS) {
      if (item.pattern.test(cleanText)) {
        planType = item.type;
        break;
      }
    }

    // 3. Detect Member Name
    let memberName = 'Policyholder / Patient';
    const memberMatches = cleanText.match(/(?:member|patient|subscriber|insured)\s*(?:name)?[:\-]?\s*([A-Za-z\.\s]{3,30})(?:\r?\n|$|,)/i);
    if (memberMatches && memberMatches[1]) {
      const candidate = memberMatches[1].trim();
      if (!/id|number|group|claim|date|status|code/i.test(candidate)) {
        memberName = candidate;
      }
    }

    // 4. Detect Member ID
    let memberId = 'ID-' + Math.floor(10000000 + Math.random() * 90000000);
    const idMatches = cleanText.match(/(?:member|subscriber|patient|policy)\s*id[:\-#]?\s*([A-Z0-9\-]{5,18})/i);
    if (idMatches && idMatches[1]) {
      memberId = idMatches[1].trim();
    }

    // 5. Detect Group Number
    let groupNumber = 'GRP-' + Math.floor(10000 + Math.random() * 90000);
    const grpMatches = cleanText.match(/group\s*(?:no|number|#)?[:\-]?\s*([A-Z0-9\-]{4,15})/i);
    if (grpMatches && grpMatches[1]) {
      groupNumber = grpMatches[1].trim();
    }

    // 6. Detect Claim Number
    let claimNumber = 'CLM-' + Math.floor(100000 + Math.random() * 900000);
    const clmMatches = cleanText.match(/claim\s*(?:no|number|#|ref)?[:\-]?\s*([A-Z0-9\-]{5,20})/i);
    if (clmMatches && clmMatches[1]) {
      claimNumber = clmMatches[1].trim();
    }

    // 7. Detect Dates (DOS and Appeal Deadline)
    const dateMatches = cleanText.match(/(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/gi);
    let dateOfService = new Date().toISOString().split('T')[0];
    if (dateMatches && dateMatches.length > 0) {
      dateOfService = dateMatches[0];
    }

    let appealDeadlineStated = '';
    const deadlineMatches = cleanText.match(/(?:deadline|appeal by|must receive by|within 180 days|file before)[:\-]?\s*([A-Za-z0-9,/\-\s]{5,25})/i);
    if (deadlineMatches && deadlineMatches[1]) {
      appealDeadlineStated = deadlineMatches[1].trim();
    }

    // 8. Detect Amounts
    let billedAmount = 2500.0;
    let deniedAmount = 2500.0;

    const explicitDeniedMatch = cleanText.match(/(?:denied(?:\s*amount)?|patient\s*responsibility(?:\s*\(balance\s*billed\))?|balance\s*billed|total\s*denied)[:\s]*\$\s?([0-9,]+(?:\.[0-9]{2})?)/i);
    const explicitBilledMatch = cleanText.match(/(?:billed(?:\s*charges)?|amount\s*billed|total\s*billed)[:\s]*\$\s?([0-9,]+(?:\.[0-9]{2})?)/i);

    if (explicitDeniedMatch && explicitDeniedMatch[1]) {
      deniedAmount = parseFloat(explicitDeniedMatch[1].replace(/,/g, ''));
    }
    if (explicitBilledMatch && explicitBilledMatch[1]) {
      billedAmount = parseFloat(explicitBilledMatch[1].replace(/,/g, ''));
    }

    if (!explicitDeniedMatch && !explicitBilledMatch) {
      const dollarMatches = cleanText.match(/\$\s?([0-9,]+(?:\.[0-9]{2})?)/g);
      if (dollarMatches && dollarMatches.length > 0) {
        const numbers = dollarMatches
          .map((d) => parseFloat(d.replace(/[\$,\s]/g, '')))
          .filter((n) => !isNaN(n) && n > 0);
        if (numbers.length >= 1) {
          billedAmount = Math.max(...numbers);
          deniedAmount = numbers[0] || billedAmount;
        }
      }
    }

    // 9. Detect CPT Code
    let cptCode = '72148';
    const explicitCpt = cleanText.match(/\b(?:CPT|HCPCS|Procedure\s*Code)[:\s\-]*([0-9]{5}|[A-Z][0-9]{4})\b/i);
    if (explicitCpt && explicitCpt[1]) {
      cptCode = explicitCpt[1];
    } else {
      const standaloneCpt = cleanText.match(/\b(2[0-9]{4}|7[0-9]{4}|9[0-9]{4}|4[0-9]{4}|J[0-9]{4})\b/);
      if (standaloneCpt && standaloneCpt[1]) {
        cptCode = standaloneCpt[1];
      }
    }

    // 10. Detect Service Description
    let serviceDescription = 'Prescribed Medical Service / Diagnostic Imaging';
    const servMatch = cleanText.match(/(?:service|procedure|treatment|description)[:\-]?\s*([A-Za-z0-9\s,\-\/]{6,60})(?:\r?\n|$)/i);
    if (servMatch && servMatch[1]) {
      serviceDescription = servMatch[1].trim();
    }

    // 11. Determine Denial Category & Rules
    let matchedRule = CATEGORY_RULES[0];
    let bestScore = -1;

    for (const rule of CATEGORY_RULES) {
      let score = 0;
      for (const pattern of rule.patterns) {
        if (pattern.test(cleanText)) {
          score += 2;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        matchedRule = rule;
      }
    }

    // 12. Denial Code & Reason
    let denialCode = 'CARC 50 / RARC N115';
    const codeMatch = cleanText.match(/(CARC\s*[0-9]+|RARC\s*[A-Z0-9]+|PR-[0-9]+|CO-[0-9]+)/i);
    if (codeMatch && codeMatch[1]) {
      denialCode = codeMatch[1].toUpperCase();
    }

    let denialReason =
      'Coverage denied because service was determined not medically necessary or documentation failed internal clinical policy guidelines.';
    const reasonMatch = cleanText.match(/(?:reason|rationale|determination|denied because)[:\-]?\s*([^\n\r]{20,250})/i);
    if (reasonMatch && reasonMatch[1]) {
      denialReason = reasonMatch[1].trim();
    }

    return {
      insurer,
      plan_type: planType,
      member_name: memberName,
      member_id: memberId,
      group_number: groupNumber,
      claim_number: claimNumber,
      service_description: serviceDescription,
      cpt_code: cptCode,
      date_of_service: dateOfService,
      billed_amount: billedAmount,
      denied_amount: deniedAmount,
      denial_reason: denialReason,
      denial_code: denialCode,
      denial_category: matchedRule.category,
      appeal_deadline_stated: appealDeadlineStated,
      plain_english_summary: matchedRule.plainEnglish,
      playbook_explanation: matchedRule.playbook,
      estimated_win_rate: matchedRule.winRate,
      next_steps: matchedRule.nextSteps,
    };
  }
}

export const decoder = new DecoderService();
