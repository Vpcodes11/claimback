import {
  Profile,
  HouseholdMember,
  Case,
  CaseDocument,
  GeneratedLetter,
  CallLog,
  Bill,
  InsuranceRule,
  Order,
  Outcome,
  SubscriptionTier,
  CaseDeadlines,
} from '../types';
import { SEED_RULES } from '../data/seedRules';
import { SAMPLE_DENIALS } from '../data/sampleDenials';
import { SAMPLE_BILLS } from '../data/sampleBills';

const STORAGE_KEYS = {
  PROFILE: 'claimback_profile',
  MEMBERS: 'claimback_members',
  CASES: 'claimback_cases',
  DOCUMENTS: 'claimback_documents',
  LETTERS: 'claimback_letters',
  CALL_LOGS: 'claimback_call_logs',
  BILLS: 'claimback_bills',
  RULES: 'claimback_rules',
  ORDERS: 'claimback_orders',
  OUTCOMES: 'claimback_outcomes',
};

// Default initial profile
const DEFAULT_PROFILE: Profile = {
  id: 'usr-default-01',
  email: 'jordan.taylor@example.com',
  full_name: 'Jordan Taylor',
  phone: '(555) 392-8819',
  address: '1428 Elmwood Terrace, Austin, TX 78701',
  state: 'TX',
  subscription_tier: 'free',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
};

// Default household members
const DEFAULT_MEMBERS: HouseholdMember[] = [
  {
    id: 'mem-01',
    user_id: 'usr-default-01',
    full_name: 'Jordan Taylor',
    relationship: 'self',
    dob: '1984-06-12',
    insurance_id: 'TX-44910283-01',
    group_number: 'BCBS-TX-7740',
    notes: 'Primary policyholder',
  },
  {
    id: 'mem-02',
    user_id: 'usr-default-01',
    full_name: 'Emily Taylor',
    relationship: 'spouse',
    dob: '1986-11-23',
    insurance_id: 'TX-44910283-02',
    group_number: 'BCBS-TX-7740',
    notes: 'Spouse coverage',
  },
  {
    id: 'mem-03',
    user_id: 'usr-default-01',
    full_name: 'Leo Taylor',
    relationship: 'child',
    dob: '2016-04-19',
    insurance_id: 'TX-44910283-03',
    group_number: 'BCBS-TX-7740',
    notes: 'Dependent minor',
  },
];

// Helper to calculate deadlines
export function calculateDeadlines(denialDateStr: string, isUrgent = false, planType = 'employer_self_funded'): CaseDeadlines {
  const denialDate = new Date(denialDateStr || Date.now());
  const now = new Date();

  // Standard internal appeal is 180 days for ACA/ERISA, 60 days for Medicare Advantage
  let daysAllowed = 180;
  if (planType === 'medicare_advantage') daysAllowed = 60;
  if (planType === 'medicaid') daysAllowed = 60;
  if (isUrgent) daysAllowed = 3; // 72 hours for urgent expedited

  const internalDeadline = new Date(denialDate.getTime() + daysAllowed * 86400000);
  const externalDeadline = new Date(internalDeadline.getTime() + 120 * 86400000); // 4 months for external
  const insurerResponseDue = new Date(Date.now() + 30 * 86400000);

  const diffTime = internalDeadline.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  let urgency_status: CaseDeadlines['urgency_status'] = 'normal';
  if (daysRemaining <= 0) {
    urgency_status = 'expired';
  } else if (isUrgent || daysRemaining <= 3) {
    urgency_status = 'critical';
  } else if (daysRemaining <= 14) {
    urgency_status = 'urgent';
  }

  return {
    denial_date: denialDate.toISOString().split('T')[0],
    internal_appeal_deadline: internalDeadline.toISOString().split('T')[0],
    external_review_deadline: externalDeadline.toISOString().split('T')[0],
    insurer_response_due: insurerResponseDue.toISOString().split('T')[0],
    is_deadline_estimated: true,
    days_remaining: daysRemaining,
    urgency_status,
  };
}

// Initial cases created from sample denials
const DEFAULT_CASES: Case[] = [
  {
    id: 'case-mri-01',
    user_id: 'usr-default-01',
    member_id: 'mem-01',
    member_name: 'Jordan Taylor',
    insurer: 'Aetna Health Inc.',
    plan_type: 'employer_self_funded',
    state: 'TX',
    claim_no: 'CLM-2024-88391',
    service: 'MRI Lumbar Spine with and without contrast (CPT 72148)',
    cpt_code: '72148',
    dos: '2024-10-14',
    amount: 2150.0,
    denial_reason:
      'Coverage is denied because documentation does not demonstrate completion of 6 consecutive weeks of physical therapy pursuant to Clinical Policy Bulletin #0236.',
    denial_code: 'CARC 50',
    denial_category: 'not_medically_necessary',
    route: 'standard_internal',
    status: 'sent',
    is_urgent: false,
    provider_in_network: true,
    prior_auth_requested: true,
    deadlines: calculateDeadlines('2024-10-22', false, 'employer_self_funded'),
    notes: 'Submitted formal Level 1 appeal packet with Dr. Alvarez clinic chart notes on 11/02/2024.',
    created_at: '2024-10-23T09:00:00Z',
    updated_at: '2024-11-02T14:20:00Z',
  },
  {
    id: 'case-er-02',
    user_id: 'usr-default-01',
    member_id: 'mem-02',
    member_name: 'Emily Taylor',
    insurer: 'UnitedHealthcare',
    plan_type: 'employer_fully_insured',
    state: 'TX',
    claim_no: 'CLM-2024-55420',
    service: 'Emergency Laparoscopic Appendectomy (CPT 44970)',
    cpt_code: '44970',
    dos: '2024-09-02',
    amount: 7200.0,
    denial_reason: 'Non-participating on-call surgeon balance billed above UCR benchmark rate.',
    denial_code: 'CARC 45',
    denial_category: 'out_of_network',
    route: 'no_surprises_dispute',
    status: 'approved',
    is_urgent: false,
    provider_in_network: false,
    prior_auth_requested: false,
    deadlines: calculateDeadlines('2024-09-18', false, 'employer_fully_insured'),
    notes: 'WON! Insurer and provider settled under No Surprises Act. Full $7,200 balance dismissed.',
    created_at: '2024-09-20T11:00:00Z',
    updated_at: '2024-10-25T16:00:00Z',
  },
  {
    id: 'case-specialty-03',
    user_id: 'usr-default-01',
    member_id: 'mem-01',
    member_name: 'Jordan Taylor',
    insurer: 'Anthem Blue Cross Blue Shield',
    plan_type: 'aca_marketplace',
    state: 'TX',
    claim_no: 'RX-2024-91823',
    service: 'Semaglutide 2mg/3mL Injection (J3490)',
    cpt_code: 'J3490',
    dos: '2024-11-01',
    amount: 1180.0,
    denial_reason: 'Prior authorization absent. Step therapy trial requirements unverified.',
    denial_code: 'CARC 197',
    denial_category: 'missing_prior_auth',
    route: 'expedited_internal',
    status: 'insurer_reviewing',
    is_urgent: true,
    provider_in_network: true,
    prior_auth_requested: false,
    deadlines: calculateDeadlines('2024-11-05', true, 'aca_marketplace'),
    notes: 'Requested expedited 72-hour review with endocrinologist chart history.',
    created_at: '2024-11-06T10:00:00Z',
    updated_at: '2024-11-07T08:30:00Z',
  },
];

// Initial default outcomes
const DEFAULT_OUTCOMES: Outcome[] = [
  {
    id: 'out-01',
    case_id: 'case-er-02',
    insurer: 'UnitedHealthcare',
    denial_category: 'out_of_network',
    service: 'Emergency Laparoscopic Appendectomy',
    result: 'won_full',
    amount_originally_denied: 7200.0,
    amount_recovered: 7200.0,
    turnaround_days: 28,
    resolution_date: '2024-10-25',
    notes: 'Provider agreed to dismiss all balance billing charges pursuant to No Surprises Act 42 U.S.C. § 300gg-111.',
    consented_to_aggregate: true,
  },
  {
    id: 'out-seed-02',
    case_id: 'case-prev-99',
    insurer: 'Cigna',
    denial_category: 'not_medically_necessary',
    service: 'Cervical Spine Total Disc Replacement',
    result: 'won_full',
    amount_originally_denied: 34500.0,
    amount_recovered: 34500.0,
    turnaround_days: 41,
    resolution_date: '2024-09-14',
    notes: 'External review IRO overturned denial finding disc arthroplasty superior to fusion.',
    consented_to_aggregate: true,
  },
  {
    id: 'out-seed-03',
    case_id: 'case-prev-98',
    insurer: 'Aetna',
    denial_category: 'missing_prior_auth',
    service: 'Cardiac Echocardiogram Stress Test',
    result: 'won_full',
    amount_originally_denied: 3850.0,
    amount_recovered: 3850.0,
    turnaround_days: 19,
    resolution_date: '2024-08-30',
    notes: 'Retroactive authorization granted after primary care physician clinic notes submitted.',
    consented_to_aggregate: true,
  },
  {
    id: 'out-seed-04',
    case_id: 'case-prev-97',
    insurer: 'Blue Cross Blue Shield',
    denial_category: 'coding_admin_error',
    service: 'Multi-Compartment Knee Arthroscopy',
    result: 'won_full',
    amount_originally_denied: 4600.0,
    amount_recovered: 4600.0,
    turnaround_days: 12,
    resolution_date: '2024-08-11',
    notes: 'Provider submitted corrected 1500 claim with Modifier 59.',
    consented_to_aggregate: true,
  },
  {
    id: 'out-seed-05',
    case_id: 'case-prev-96',
    insurer: 'Humana Medicare Advantage',
    denial_category: 'not_medically_necessary',
    service: 'Subacute Inpatient Rehab Facility Stay',
    result: 'won_partial',
    amount_originally_denied: 22400.0,
    amount_recovered: 18200.0,
    turnaround_days: 35,
    resolution_date: '2024-07-22',
    notes: 'Appealed to MAXIMUS IRE; secured 14 additional approved inpatient days.',
    consented_to_aggregate: true,
  },
];

// Initial call logs
const DEFAULT_CALL_LOGS: CallLog[] = [
  {
    id: 'call-01',
    case_id: 'case-mri-01',
    timestamp: '2024-10-24T14:15:00Z',
    rep_name: 'Derrick M.',
    rep_id: 'AET-REP-8831',
    reference_no: 'REF-9948201',
    duration_mins: 18,
    notes:
      'Representative confirmed denial was generated automatically via MCG 27th edition spine imaging guideline. Verified that complete claim file can be requested in writing. Gave direct appeals fax: 860-907-4200.',
    call_checklist: {
      confirmed_receipt_of_appeal: false,
      requested_claim_file: true,
      asked_for_reviewer_credentials: true,
      inquired_about_peer_to_peer: true,
      recorded_fax_or_portal_target: true,
    },
    followup_date: '2024-11-15',
  },
];

// Initial generated letters
const DEFAULT_LETTERS: GeneratedLetter[] = [
  {
    id: 'let-01',
    case_id: 'case-mri-01',
    letter_type: 'internal_appeal',
    title: 'Formal Level 1 Internal Appeal - Medical Necessity Rebuttal',
    recipient: 'Aetna Appeals Resolution Department',
    recipient_address: 'PO Box 14463, Lexington, KY 40512\nFax: (860) 907-4200',
    subject: 'FORMAL LEVEL 1 APPEAL - CLAIM #CLM-2024-88391 - SARAH M. JENKINS',
    content_markdown: `**DATE:** November 02, 2024

**VIA CERTIFIED MAIL & FACSIMILE (860) 907-4200**

**TO:**
Aetna Appeals Resolution Department
PO Box 14463
Lexington, KY 40512

**RE: FORMAL LEVEL 1 INTERNAL APPEAL & NOTICE OF ADVERSE BENEFIT DETERMINATION DISPUTE**
* **Claimant / Member:** Sarah M. Jenkins
* **Member ID:** W928472910 | **Group Number:** GRP-849201
* **Claim Number:** CLM-2024-88391
* **Date of Service:** 10/14/2024
* **Service Denied:** CPT 72148 - MRI Lumbar Spine with and without contrast
* **Billed Amount:** $2,450.00 | **Denied Amount:** $2,150.00
* **Denial Reason / Code:** CARC 50 - Medical Necessity Not Established

Dear Appeals Committee and Medical Director:

Please accept this letter as my formal written Level 1 Internal Appeal pursuant to the Employee Retirement Income Security Act of 1974 (ERISA § 503, 29 U.S.C. § 1133), the Patient Protection and Affordable Care Act (45 C.F.R. § 147.136), and the terms of my governing Summary Plan Description.

### 1. SUMMARY OF ADVERSE BENEFIT DETERMINATION
On October 22, 2024, Aetna issued a denial of coverage asserting that the prescribed lumbar MRI was not medically necessary pursuant to Clinical Policy Bulletin #0236, citing an alleged lack of 6 weeks of documented conservative physical therapy. This denial is clinically unsound, contradicts established American College of Radiology (ACR) Appropriateness Criteria, and constitutes an improper failure of full and fair review under federal law.

### 2. CLINICAL NECESSITY & ORTHOPEDIC JUSTIFICATION
As documented in the attached clinical chart notes from treating specialist Dr. Marcus Alvarez, MD:
1. The claimant presents with severe, progressive L5-S1 lumbar radiculopathy with radiating paresthesia and motor weakness extending into the left lower extremity.
2. Conservative management (including home exercise regimen, active ergonomic modifications, and maximum dose NSAID therapy) has been maintained for over 8 weeks with progressive worsening rather than improvement.
3. Advanced MRI imaging is urgently required to assess for acute neural foraminal stenosis and nerve root compression prior to epidural intervention or surgical consultation.

### 3. STATUTORY DEMAND FOR CLAIM FILE (29 C.F.R. § 2560.503-1)
Pursuant to 29 C.F.R. § 2560.503-1(h)(2)(iii), I hereby demand that Aetna provide to me, free of charge within 30 days:
* The complete administrative claim file, including all medical records, correspondence, and clinical reviewer notes.
* The specific clinical rationale and internal guidelines utilized (including full text of CPB #0236 and any licensed Milliman/MCG criteria).
* The identity, professional medical board certification, and state licensure of the physician reviewer who issued this denial, specifically demonstrating that said reviewer holds active board certification in the same or similar medical specialty as the treating physician (Neurology / Physical Medicine & Rehabilitation).

### 4. CONCLUSION & DEMAND FOR EXPEDITED REVERSAL
Because the medical necessity of this diagnostic imaging is unequivocally supported by both clinical presentation and established medical standards, I request that Aetna immediately reverse this adverse determination and issue an approved authorization.

Should Aetna uphold this improper denial, please provide the complete documentation required to immediately petition for an Independent External Review (IRO) under 45 C.F.R. § 147.136.

Sincerely,

**Sarah M. Jenkins**
Member ID: W928472910
Telephone: (555) 392-8819`,
    statutes_cited: ['ERISA 29 U.S.C. § 1133', '29 C.F.R. § 2560.503-1', '45 C.F.R. § 147.136'],
    created_at: '2024-11-02T14:00:00Z',
  },
];

// In-memory or LocalStorage accessor
class StorageService {
  private memoryStore: Record<string, string> = {};

  private isLocalStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined' && localStorage !== null;
  }

  private get<T>(key: string, fallback: T): T {
    try {
      if (this.isLocalStorageAvailable()) {
        const data = localStorage.getItem(key);
        if (!data) return fallback;
        return JSON.parse(data);
      } else {
        const memData = this.memoryStore[key];
        if (!memData) return fallback;
        return JSON.parse(memData);
      }
    } catch (e) {
      console.warn(`Failed to read key "${key}":`, e);
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.memoryStore[key] = serialized;
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(key, serialized);
      }
    } catch (e) {
      console.warn(`Failed to write key "${key}":`, e);
    }
  }

  // Profile
  getProfile(): Profile {
    return this.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }

  updateProfile(profile: Partial<Profile>): Profile {
    const current = this.getProfile();
    const updated = { ...current, ...profile };
    this.set(STORAGE_KEYS.PROFILE, updated);
    return updated;
  }

  // Household / Clients
  getMembers(): HouseholdMember[] {
    return this.get<HouseholdMember[]>(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
  }

  addMember(member: Omit<HouseholdMember, 'id'>): HouseholdMember {
    const members = this.getMembers();
    const newMember: HouseholdMember = {
      ...member,
      id: `mem-${Date.now()}`,
    };
    members.push(newMember);
    this.set(STORAGE_KEYS.MEMBERS, members);
    return newMember;
  }

  updateMember(id: string, updates: Partial<HouseholdMember>): HouseholdMember | null {
    const members = this.getMembers();
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return null;
    members[index] = { ...members[index], ...updates };
    this.set(STORAGE_KEYS.MEMBERS, members);
    return members[index];
  }

  deleteMember(id: string): void {
    const members = this.getMembers().filter((m) => m.id !== id);
    this.set(STORAGE_KEYS.MEMBERS, members);
  }

  // Cases
  getCases(): Case[] {
    return this.get<Case[]>(STORAGE_KEYS.CASES, DEFAULT_CASES);
  }

  getCaseById(id: string): Case | undefined {
    return this.getCases().find((c) => c.id === id);
  }

  addCase(caseData: Omit<Case, 'id' | 'created_at' | 'updated_at'>): Case {
    const cases = this.getCases();
    const now = new Date().toISOString();
    const newCase: Case = {
      ...caseData,
      id: `case-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    cases.unshift(newCase);
    this.set(STORAGE_KEYS.CASES, cases);
    return newCase;
  }

  updateCase(id: string, updates: Partial<Case>): Case | null {
    const cases = this.getCases();
    const index = cases.findIndex((c) => c.id === id);
    if (index === -1) return null;
    cases[index] = {
      ...cases[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.CASES, cases);
    return cases[index];
  }

  deleteCase(id: string): void {
    const cases = this.getCases().filter((c) => c.id !== id);
    this.set(STORAGE_KEYS.CASES, cases);
  }

  // Letters
  getLetters(caseId?: string): GeneratedLetter[] {
    const letters = this.get<GeneratedLetter[]>(STORAGE_KEYS.LETTERS, DEFAULT_LETTERS);
    if (caseId) return letters.filter((l) => l.case_id === caseId);
    return letters;
  }

  saveLetter(letter: Omit<GeneratedLetter, 'id' | 'created_at'>): GeneratedLetter {
    const letters = this.getLetters();
    const newLetter: GeneratedLetter = {
      ...letter,
      id: `let-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    letters.unshift(newLetter);
    this.set(STORAGE_KEYS.LETTERS, letters);
    return newLetter;
  }

  // Call Logs
  getCallLogs(caseId?: string): CallLog[] {
    const logs = this.get<CallLog[]>(STORAGE_KEYS.CALL_LOGS, DEFAULT_CALL_LOGS);
    if (caseId) return logs.filter((l) => l.case_id === caseId);
    return logs;
  }

  addCallLog(log: Omit<CallLog, 'id'>): CallLog {
    const logs = this.getCallLogs();
    const newLog: CallLog = {
      ...log,
      id: `call-${Date.now()}`,
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.CALL_LOGS, logs);
    return newLog;
  }

  // Bills
  getBills(): Bill[] {
    return this.get<Bill[]>(STORAGE_KEYS.BILLS, SAMPLE_BILLS);
  }

  saveBill(bill: Omit<Bill, 'id' | 'created_at'>): Bill {
    const bills = this.getBills();
    const newBill: Bill = {
      ...bill,
      id: `bill-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    bills.unshift(newBill);
    this.set(STORAGE_KEYS.BILLS, bills);
    return newBill;
  }

  // Rules
  getRules(): InsuranceRule[] {
    return this.get<InsuranceRule[]>(STORAGE_KEYS.RULES, SEED_RULES);
  }

  // Outcomes
  getOutcomes(): Outcome[] {
    return this.get<Outcome[]>(STORAGE_KEYS.OUTCOMES, DEFAULT_OUTCOMES);
  }

  recordOutcome(outcome: Omit<Outcome, 'id'>): Outcome {
    const outcomes = this.getOutcomes();
    const newOutcome: Outcome = {
      ...outcome,
      id: `out-${Date.now()}`,
    };
    outcomes.unshift(newOutcome);
    this.set(STORAGE_KEYS.OUTCOMES, outcomes);

    // Also update case status
    if (outcome.case_id) {
      const caseStatus = outcome.result === 'won_full' || outcome.result === 'won_partial' ? 'approved' : 'denied';
      this.updateCase(outcome.case_id, { status: caseStatus });
    }

    return newOutcome;
  }

  // Orders & Subscriptions
  getOrders(): Order[] {
    return this.get<Order[]>(STORAGE_KEYS.ORDERS, [
      {
        id: 'ord-8831',
        user_id: 'usr-default-01',
        case_id: 'case-mri-01',
        plan_or_package: 'Appeal Kit ($29 One-Time)',
        amount: 29.0,
        status: 'succeeded',
        date: '2024-11-02T13:58:00Z',
        payment_method: 'Visa •••• 4242',
      },
    ]);
  }

  addOrder(order: Omit<Order, 'id' | 'date'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      date: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    this.set(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  }

  // Reset to demo data
  resetAllData(): void {
    this.memoryStore = {};
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.MEMBERS);
      localStorage.removeItem(STORAGE_KEYS.CASES);
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
      localStorage.removeItem(STORAGE_KEYS.LETTERS);
      localStorage.removeItem(STORAGE_KEYS.CALL_LOGS);
      localStorage.removeItem(STORAGE_KEYS.BILLS);
      localStorage.removeItem(STORAGE_KEYS.RULES);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.OUTCOMES);
    }
  }
}

export const storage = new StorageService();
