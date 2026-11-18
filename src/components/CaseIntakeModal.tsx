import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Clock,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  Case,
  DenialCategory,
  PlanType,
  AppealRoute,
  HouseholdMember,
  ExtractedDenialData,
} from '../types';
import { storage, calculateDeadlines } from '../services/storage';
import { letterGenerator } from '../services/letterGenerator';

interface CaseIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ExtractedDenialData | null;
  onCaseCreated: (createdCase: Case) => void;
  householdMembers: HouseholdMember[];
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export const CaseIntakeModal: React.FC<CaseIntakeModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onCaseCreated,
  householdMembers,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [memberName, setMemberName] = useState(initialData?.member_name || householdMembers[0]?.full_name || 'Jordan Taylor');
  const [memberId, setMemberId] = useState(initialData?.member_id || 'ID-88391024');
  const [insurer, setInsurer] = useState(initialData?.insurer || 'Aetna Health Inc.');
  const [planType, setPlanType] = useState<PlanType>(initialData?.plan_type || 'employer_self_funded');
  const [state, setState] = useState('TX');
  const [claimNo, setClaimNo] = useState(initialData?.claim_number || `CLM-${Math.floor(100000 + Math.random() * 900000)}`);
  const [service, setService] = useState(initialData?.service_description || 'Lumbar Spine MRI with contrast');
  const [cptCode, setCptCode] = useState(initialData?.cpt_code || '72148');
  const [dos, setDos] = useState(initialData?.date_of_service || new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(initialData?.denied_amount || 2150.0);
  const [denialCategory, setDenialCategory] = useState<DenialCategory>(initialData?.denial_category || 'not_medically_necessary');
  const [denialCode, setDenialCode] = useState(initialData?.denial_code || 'CARC 50');
  const [denialReason, setDenialReason] = useState(initialData?.denial_reason || 'Claim denied for lack of conservative therapy documentation prior to advanced imaging.');

  // Gap filling questions (Step 2)
  const [providerInNetwork, setProviderInNetwork] = useState<boolean | 'unknown'>('unknown');
  const [priorAuthRequested, setPriorAuthRequested] = useState<boolean | 'unknown'>('unknown');
  const [isUrgent, setIsUrgent] = useState(false);
  const [planExcerpt, setPlanExcerpt] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen) return null;

  // Determine appeal route based on answers
  const determineRoute = (): AppealRoute => {
    if (isUrgent) return 'expedited_internal';
    if (denialCategory === 'out_of_network') return 'no_surprises_dispute';
    if (denialCategory === 'coding_admin_error') return 'provider_billing_fix';
    return 'standard_internal';
  };

  const currentRoute = determineRoute();
  const calculatedDeadlines = calculateDeadlines(dos, isUrgent, planType);

  const handleSubmit = () => {
    const deadlines = calculateDeadlines(dos, isUrgent, planType);

    const matchingMember = householdMembers.find((m) => m.full_name === memberName) || householdMembers[0];

    const newCase = storage.addCase({
      user_id: matchingMember?.user_id || 'usr-default-01',
      member_id: matchingMember?.id || 'mem-01',
      member_name: memberName,
      insurer,
      plan_type: planType,
      state,
      claim_no: claimNo,
      service,
      cpt_code: cptCode,
      dos,
      amount: Number(amount),
      denial_reason: denialReason,
      denial_code: denialCode,
      denial_category: denialCategory,
      route: currentRoute,
      status: 'draft',
      is_urgent: isUrgent,
      provider_in_network: providerInNetwork,
      prior_auth_requested: priorAuthRequested,
      deadlines,
      notes: customNotes || 'Case created via guided intake.',
      plan_excerpt: planExcerpt,
    });

    // Auto-generate initial set of tailored letters
    letterGenerator.generateAppealLetter({
      caseData: newCase,
      planExcerpt,
      customNotes,
    });

    letterGenerator.generateDoctorLOMNTemplate(newCase);
    letterGenerator.generateDocumentRequestLetter(newCase);
    letterGenerator.generateProviderBillingDisputeLetter(newCase);

    onCaseCreated(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 overflow-hidden border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {step} of 4: {step === 1 ? 'Claim Summary' : step === 2 ? 'Gap-Filling Assessment' : step === 3 ? 'Calculated Appeal Route' : 'Plan Document Clauses'}</span>
            <span className="text-blue-600 font-bold">{step * 25}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Basic Claim Facts */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Verify Denial Letter Information</h3>
            <p className="text-xs text-slate-500 mb-4">
              We extracted these details from your letter. Confirm or tweak any fields below.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient / Member Name</label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Health Insurance Carrier</label>
                  <input
                    type="text"
                    value={insurer}
                    onChange={(e) => setInsurer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Claim Number</label>
                  <input
                    type="text"
                    value={claimNo}
                    onChange={(e) => setClaimNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Service (DOS)</label>
                  <input
                    type="date"
                    value={dos}
                    onChange={(e) => setDos(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Denied Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Service / Procedure Description</label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPT / HCPCS Code</label>
                  <input
                    type="text"
                    value={cptCode}
                    onChange={(e) => setCptCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Denial Reason Code</label>
                  <input
                    type="text"
                    value={denialCode}
                    onChange={(e) => setDenialCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Denial Classification Category</label>
                  <select
                    value={denialCategory}
                    onChange={(e) => setDenialCategory(e.target.value as DenialCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                  >
                    <option value="not_medically_necessary">Not Medically Necessary (MCG / InterQual)</option>
                    <option value="missing_prior_auth">Missing Prior Authorization</option>
                    <option value="out_of_network">Out-of-Network / Surprise Balance Bill</option>
                    <option value="coding_admin_error">Coding / Administrative / Modifier Error</option>
                    <option value="experimental_investigational">Experimental / Investigational</option>
                    <option value="excluded_service">Plan Exclusion / Benefit Limit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Denial Letter Exact Wording</label>
                <textarea
                  rows={2}
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <span>Next: Gap-Filling Questions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Gap Filling Questions */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Key Context & Policy Questions</h3>
            <p className="text-xs text-slate-500 mb-4">
              Federal law provides different appeal rights depending on your plan type and clinical urgency.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">1. What type of health plan is this?</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value as PlanType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                >
                  <option value="employer_self_funded">Employer Self-Insured / Self-Funded (Governed by ERISA & Federal DOL)</option>
                  <option value="employer_fully_insured">Employer Fully-Insured Commercial (State Insurance Commissioner + ACA)</option>
                  <option value="aca_marketplace">ACA Individual / Marketplace Exchange Policy (Healthcare.gov)</option>
                  <option value="medicare_advantage">Medicare Advantage (Part C HMO / PPO Plan)</option>
                  <option value="traditional_medicare">Traditional Original Medicare (Part A / Part B)</option>
                  <option value="medicaid">Medicaid / State Managed Care Organization</option>
                  <option value="unknown">I'm Not Sure (Defaults to standard 180-day federal ACA/ERISA protection)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Tip: Look at the back of your insurance card or ask HR whether claims are paid from company funds (self-funded).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">2. Was the provider in-network?</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setProviderInNetwork(true)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                        providerInNetwork === true ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      In-Network
                    </button>
                    <button
                      type="button"
                      onClick={() => setProviderInNetwork(false)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                        providerInNetwork === false ? 'bg-amber-50 border-amber-600 text-amber-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      Out-of-Network
                    </button>
                    <button
                      type="button"
                      onClick={() => setProviderInNetwork('unknown')}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                        providerInNetwork === 'unknown' ? 'bg-slate-200 border-slate-400 text-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      Unsure
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">3. Was prior auth requested?</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPriorAuthRequested(true)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                        priorAuthRequested === true ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      Yes, denied
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriorAuthRequested(false)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                        priorAuthRequested === false ? 'bg-amber-50 border-amber-600 text-amber-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      Never filed
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriorAuthRequested('unknown')}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                        priorAuthRequested === 'unknown' ? 'bg-slate-200 border-slate-400 text-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      Unsure
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">4. Is this urgent care or ongoing treatment?</label>
                <div
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isUrgent
                      ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold block">Yes — Demand Expedited 72-Hour Review</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Check this if waiting standard timelines could seriously jeopardize life, health, ability to regain maximum function, or subject you to severe unmanageable pain (29 CFR § 2560.503-1).
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">5. State of Residence / Jurisdiction</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                  >
                    {US_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Additional Case Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Doctor says surgery cannot wait"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <span>Calculate Legal Appeal Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Route Calculation & Statutory Deadlines */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Determined Appeal Route & Timelines</h3>
            <p className="text-xs text-slate-500 mb-4">
              Based on the rules engine, here is your statutory path and deadline.
            </p>

            <div className="space-y-4">
              {/* Route Card */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Recommended Route</div>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      {currentRoute === 'expedited_internal' && 'Expedited 72-Hour Urgent Appeal'}
                      {currentRoute === 'no_surprises_dispute' && 'No Surprises Act Balance Billing Dispute'}
                      {currentRoute === 'provider_billing_fix' && 'Provider Corrected Claim + NCCI Modifier Fix'}
                      {currentRoute === 'standard_internal' && 'Standard Level 1 Internal Appeal → External Review (IRO)'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {currentRoute === 'expedited_internal'
                        ? 'Under 29 CFR § 2560.503-1, the insurer is legally required to render an appeal determination within 72 hours of receipt.'
                        : currentRoute === 'no_surprises_dispute'
                        ? 'Under 42 U.S.C. § 300gg-111, emergency or involuntary out-of-network care cannot be balance billed. Patient obligation is capped at in-network median.'
                        : currentRoute === 'provider_billing_fix'
                        ? 'The provider billing office must submit Form CMS-1500 / UB-04 with Modifier 59/25 and place an administrative freeze on collections.'
                        : 'Governed by ACA Section 2719 and ERISA § 503. Exhausting internal appeal unlocks the binding Independent External Review (IRO).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deadlines Box with Badge */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Statutory Deadlines
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                    Confirm with your insurer's Notice
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Notice Date</span>
                    <span className="font-bold text-slate-900">{dos}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Appeal Filing Deadline</span>
                    <span className="font-bold text-blue-700">{calculatedDeadlines.internal_appeal_deadline}</span>
                    <span className="text-[10px] text-emerald-600 block font-semibold">
                      ({calculatedDeadlines.days_remaining} days left)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block text-[11px]">Insurer Decision Due</span>
                    <span className="font-bold text-slate-900">
                      {isUrgent ? 'Within 72 Hours' : '30-60 Days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rights Notice */}
              <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-lg border border-slate-200">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Full & Fair Review Rights:</strong> Under federal law (29 CFR § 2560.503-1), you have the right to inspect your complete claim file and reviewer notes free of charge. Our kit automatically prepares this document request for you.
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <span>Next: Plan Document Wording (Optional)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Plan Document SPD Excerpt & Finalization */}
        {step === 4 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Cite Your Plan’s Own Words</h3>
            <p className="text-xs text-slate-500 mb-4">
              If you have your Summary Plan Description (SPD) or Evidence of Coverage booklet, paste the relevant coverage clause below to quote it directly in your appeal!
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Plan Document Excerpt (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder='e.g., "Section 4.1: Medically necessary services shall include diagnostic imaging recommended by a licensed physician to evaluate unremitting spinal symptoms..."'
                  value={planExcerpt}
                  onChange={(e) => setPlanExcerpt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono text-xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Citing the plan’s own definition of medical necessity forces reviewers to evaluate the claim against their own contractual language under ERISA *Firestone* standards.
                </span>
              </div>

              {/* Ready to generate summary */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your Appeal Kit Packet is Ready to Generate:</span>
                </div>
                <ul className="space-y-1.5 text-slate-700 text-[11px]">
                  <li>• Custom Level 1 Internal Appeal Letter tailored to {insurer}</li>
                  <li>• Doctor's "Letter of Medical Necessity" (LOMN) template with clinical checklist</li>
                  <li>• Formal 29 C.F.R. § 2560.503-1 Complete Claim File demand letter</li>
                  <li>• Provider Billing Office Corrected Claim demand (CMS-1500 Modifier fix)</li>
                  <li>• Step-by-step Insurer Phone Script & interactive Call Logger</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Create Case & Generate Appeal Kit</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
