// ClaimBack Core Types & Database Schemas

export type PlanType =
  | 'employer_self_funded' // ERISA self-insured
  | 'employer_fully_insured' // State insurance law + ACA
  | 'aca_marketplace' // Individual / ACA Exchange
  | 'medicare_advantage' // Part C Medicare Advantage
  | 'traditional_medicare' // Part A/B Original Medicare
  | 'medicaid' // State Medicaid HMO or fee-for-service
  | 'tricare' // Military health
  | 'unknown';

export type DenialCategory =
  | 'missing_prior_auth' // Missing prior authorization / precertification
  | 'not_medically_necessary' // Medical necessity / clinical guidelines (MCG/InterQual)
  | 'out_of_network' // Out-of-network provider / balance billing / No Surprises Act
  | 'coding_admin_error' // Billing error, unbundling, missing modifier, NPI mismatch
  | 'excluded_service' // Benefit exclusion / cosmetic / plan limitation
  | 'experimental_investigational'; // Investigational / clinical trial / off-label

export type CaseStatus =
  | 'draft'
  | 'sent'
  | 'insurer_reviewing'
  | 'approved'
  | 'denied'
  | 'external_review'
  | 'resolved';

export type AppealRoute =
  | 'standard_internal' // Standard 30/60 day internal appeal
  | 'expedited_internal' // 72-hour urgent care expedited appeal
  | 'external_review' // IRO / HHS / State Dept of Insurance
  | 'provider_billing_fix' // Corrected claim via provider billing office
  | 'no_surprises_dispute'; // Independent Dispute Resolution (IDR) under No Surprises Act

export type SubscriptionTier = 'free' | 'appeal_kit_single' | 'family' | 'advocate';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  state: string;
  subscription_tier: SubscriptionTier;
  plan_expires_at?: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  user_id: string;
  full_name: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'client';
  dob?: string;
  insurance_id?: string;
  group_number?: string;
  notes?: string;
}

export interface CaseDeadlines {
  denial_date: string;
  internal_appeal_deadline: string; // Calculated or extracted
  external_review_deadline?: string;
  insurer_response_due?: string; // e.g. 30/60 days after filing
  is_deadline_estimated: boolean;
  days_remaining: number;
  urgency_status: 'normal' | 'urgent' | 'critical' | 'expired';
}

export interface ExtractedDenialData {
  insurer: string;
  plan_type: PlanType;
  member_name: string;
  member_id: string;
  group_number: string;
  claim_number: string;
  service_description: string;
  cpt_code?: string;
  date_of_service: string;
  billed_amount: number;
  denied_amount: number;
  denial_reason: string;
  denial_code?: string; // CARC/RARC e.g. CARC 197, 50, 96
  denial_category: DenialCategory;
  appeal_deadline_stated?: string;
  plain_english_summary: string;
  playbook_explanation: string;
  estimated_win_rate: number; // Percentage e.g. 68
  next_steps: string[];
}

export interface Case {
  id: string;
  user_id: string;
  member_id: string;
  member_name: string;
  insurer: string;
  plan_type: PlanType;
  state: string;
  claim_no: string;
  service: string;
  cpt_code?: string;
  dos: string; // Date of Service
  amount: number;
  denial_reason: string;
  denial_code?: string;
  denial_category: DenialCategory;
  route: AppealRoute;
  status: CaseStatus;
  is_urgent: boolean;
  provider_in_network: boolean | 'unknown';
  prior_auth_requested: boolean | 'unknown';
  deadlines: CaseDeadlines;
  notes: string;
  plan_excerpt?: string;
  created_at: string;
  updated_at: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  type: 'denial_letter' | 'eob' | 'bill' | 'spd_plan_doc' | 'doctor_record' | 'insurer_response';
  filename: string;
  file_size: string;
  uploaded_at: string;
  extracted?: Record<string, any>;
}

export interface GeneratedLetter {
  id: string;
  case_id: string;
  letter_type:
    | 'internal_appeal'
    | 'medical_necessity_request'
    | 'document_request'
    | 'provider_billing_dispute'
    | 'external_review_request';
  title: string;
  recipient: string;
  recipient_address: string;
  subject: string;
  content_markdown: string;
  statutes_cited: string[];
  created_at: string;
}

export interface CallLog {
  id: string;
  case_id: string;
  timestamp: string;
  rep_name: string;
  rep_id: string;
  reference_no: string;
  duration_mins: number;
  notes: string;
  call_checklist: {
    confirmed_receipt_of_appeal: boolean;
    requested_claim_file: boolean;
    asked_for_reviewer_credentials: boolean;
    inquired_about_peer_to_peer: boolean;
    recorded_fax_or_portal_target: boolean;
  };
  followup_date?: string;
}

export interface BillLineItem {
  id: string;
  cpt_hcpcs: string;
  description: string;
  date_of_service: string;
  billed_amount: number;
  allowed_amount?: number;
  insurance_paid?: number;
  patient_responsibility?: number;
  status: 'valid' | 'suspicious' | 'error';
  flags?: string[];
}

export interface BillAuditFlag {
  id: string;
  severity: 'high' | 'medium' | 'info';
  type:
    | 'duplicate_charge'
    | 'balance_billing_violation'
    | 'eob_mismatch'
    | 'missing_adjustment'
    | 'unbundled_service'
    | 'unitemized_blanket_charge';
  title: string;
  description: string;
  impact_amount: number;
  recommended_action: string;
  rule_reference: string;
}

export interface Bill {
  id: string;
  case_id?: string;
  provider_name: string;
  bill_account_no: string;
  bill_date: string;
  total_billed: number;
  eob_patient_responsibility: number;
  extracted_line_items: BillLineItem[];
  flags: BillAuditFlag[];
  potential_savings: number;
  created_at: string;
}

export interface InsuranceRule {
  id: string;
  title: string;
  category: 'internal_appeal' | 'external_review' | 'expedited_appeal' | 'surprise_billing' | 'mental_health_parity';
  jurisdiction: 'federal' | 'state';
  state?: string; // e.g. 'CA', 'NY', 'ALL'
  plan_types: PlanType[];
  timeline_days: number;
  statute: string;
  summary: string;
  source_name: string;
  source_url: string;
  verify_badge: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  case_id?: string;
  plan_or_package: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'refunded';
  date: string;
  payment_method: string;
}

export interface Outcome {
  id: string;
  case_id: string;
  insurer: string;
  denial_category: DenialCategory;
  service: string;
  result: 'won_full' | 'won_partial' | 'lost' | 'in_progress';
  amount_originally_denied: number;
  amount_recovered: number;
  turnaround_days: number;
  resolution_date: string;
  notes: string;
  consented_to_aggregate: boolean;
}
