import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  PhoneCall,
  UserCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Scale,
  FolderOpen,
  Send,
  Plus,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { Case, GeneratedLetter, CallLog } from '../../types';
import { storage } from '../../services/storage';
import { letterGenerator } from '../../services/letterGenerator';
import { exporter } from '../../services/exporter';

interface AppealKitViewProps {
  cases: Case[];
  activeCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onOpenPricing: () => void;
}

export const AppealKitView: React.FC<AppealKitViewProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onOpenPricing,
}) => {
  const currentCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  const [activeLetterType, setActiveLetterType] = useState<
    'appeal' | 'doctor_lomn' | 'doc_request' | 'provider_dispute' | 'external_review' | 'phone_script'
  >('appeal');

  const [planExcerptInput, setPlanExcerptInput] = useState(currentCase?.plan_excerpt || '');
  const [copied, setCopied] = useState(false);
  const [showCallLogModal, setShowCallLogModal] = useState(false);

  // New Call Log Form State
  const [repName, setRepName] = useState('');
  const [repId, setRepId] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [durationMins, setDurationMins] = useState(15);
  const [logNotes, setLogNotes] = useState('');
  const [checklist, setChecklist] = useState({
    confirmed_receipt_of_appeal: true,
    requested_claim_file: true,
    asked_for_reviewer_credentials: true,
    inquired_about_peer_to_peer: false,
    recorded_fax_or_portal_target: true,
  });

  if (!currentCase) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4 text-center">
        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Cases Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          Scan a denial letter in the Denial Decoder first to create your case.
        </p>
      </div>
    );
  }

  // Generate the letters dynamically for current case
  const appealLetter = letterGenerator.generateAppealLetter({
    caseData: currentCase,
    planExcerpt: planExcerptInput,
  });

  const doctorLomnLetter = letterGenerator.generateDoctorLOMNTemplate(currentCase);
  const docRequestLetter = letterGenerator.generateDocumentRequestLetter(currentCase);
  const providerDisputeLetter = letterGenerator.generateProviderBillingDisputeLetter(currentCase);
  const externalReviewLetter = letterGenerator.generateExternalReviewLetter(currentCase);
  const phoneScript = letterGenerator.getPhoneScript(currentCase);

  const callLogs = storage.getCallLogs(currentCase.id);

  // Get current active letter object
  const getCurrentLetter = (): GeneratedLetter => {
    switch (activeLetterType) {
      case 'doctor_lomn':
        return doctorLomnLetter;
      case 'doc_request':
        return docRequestLetter;
      case 'provider_dispute':
        return providerDisputeLetter;
      case 'external_review':
        return externalReviewLetter;
      default:
        return appealLetter;
    }
  };

  const handleCopy = () => {
    const letter = getCurrentLetter();
    navigator.clipboard.writeText(letter.content_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const letter = getCurrentLetter();
    exporter.exportToPdf(letter);
  };

  const handleDownloadDocx = async () => {
    const letter = getCurrentLetter();
    await exporter.exportToDocx(letter);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    storage.addCallLog({
      case_id: currentCase.id,
      timestamp: new Date().toISOString(),
      rep_name: repName || 'Customer Service Representative',
      rep_id: repId || 'N/A',
      reference_no: referenceNo || `REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
      duration_mins: Number(durationMins),
      notes: logNotes || 'Spoke with insurer representative regarding claim status.',
      call_checklist: checklist,
      followup_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });

    // Reset
    setRepName('');
    setRepId('');
    setReferenceNo('');
    setLogNotes('');
    setShowCallLogModal(false);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Case Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Active Appeal Kit
            </span>
            <span className="text-xs text-slate-400">Claim #{currentCase.claim_no}</span>
            {currentCase.is_urgent && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase animate-pulse">
                Expedited 72-Hour
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentCase.service}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Insurer: <strong className="text-slate-800">{currentCase.insurer}</strong> • Patient: <strong className="text-slate-800">{currentCase.member_name}</strong> • Amount: <strong className="text-rose-600 font-bold">${currentCase.amount.toLocaleString()}</strong>
          </p>
        </div>

        {/* Case Switcher & Quick Deadline Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Switch Case
            </label>
            <select
              value={currentCase.id}
              onChange={(e) => onSelectCase(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.member_name} - {c.claim_no} (${c.amount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs">
            <div className="text-[10px] text-amber-800 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" /> Deadline
            </div>
            <div className="font-extrabold text-slate-900">
              {currentCase.deadlines.internal_appeal_deadline}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {currentCase.deadlines.days_remaining} days left (Verify)
            </div>
          </div>
        </div>
      </div>

      {/* Appeal Kit Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveLetterType('appeal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeLetterType === 'appeal'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Level 1 Appeal Letter</span>
        </button>

        <button
          onClick={() => setActiveLetterType('doctor_lomn')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeLetterType === 'doctor_lomn'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Doctor LOMN Template</span>
        </button>

        <button
          onClick={() => setActiveLetterType('doc_request')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeLetterType === 'doc_request'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Claim File Request (ERISA)</span>
        </button>

        <button
          onClick={() => setActiveLetterType('provider_dispute')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeLetterType === 'provider_dispute'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Provider Billing Dispute</span>
        </button>

        <button
          onClick={() => setActiveLetterType('external_review')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeLetterType === 'external_review'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>External Review (IRO)</span>
        </button>

        <button
          onClick={() => setActiveLetterType('phone_script')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeLetterType === 'phone_script'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Insurer Phone Script & Call Log</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeLetterType !== 'phone_script' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Letter Preview & Formatted Markdown */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {/* Document Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {getCurrentLetter().title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getCurrentLetter().statutes_cited?.map((stat, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadDocx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOCX (Word)</span>
                  </button>
                </div>
              </div>

              {/* Rendered Letter Document */}
              <div className="bg-slate-50/70 p-6 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                {getCurrentLetter().content_markdown}
              </div>
            </div>
          </div>

          {/* Right Column: Plan Document SPD Clause Weaver & Instructions */}
          <div className="space-y-4">
            {/* Plan Document Clause Extractor */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Plan Document (SPD) Clause Weaver
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Paste wording from your Summary Plan Description or Evidence of Coverage. ClaimBack weaves it directly into Section 3 of your appeal letter to cite the plan's own rules!
              </p>
              <textarea
                rows={4}
                placeholder='e.g., "Section 5.3: Diagnostic imaging shall be authorized when requested by an orthopedic specialist following acute traumatic symptom onset..."'
                value={planExcerptInput}
                onChange={(e) => {
                  setPlanExcerptInput(e.target.value);
                  storage.updateCase(currentCase.id, { plan_excerpt: e.target.value });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <div className="mt-2 text-[11px] text-emerald-700 font-medium">
                ✓ Changes automatically update the appeal text above.
              </div>
            </div>

            {/* Document Checklist for Filing */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Appeal Packet Assembly Checklist
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Signed Level 1 Appeal Letter (Download PDF/DOCX)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Copy of Insurer Denial Notice / EOB</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Treating Doctor's signed Letter of Medical Necessity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Relevant Clinical Chart Notes & Diagnostic Reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Proof of Mailing (USPS Certified Mail Receipt or Fax Confirmation)</span>
                </li>
              </ul>
            </div>

            {/* Submission Advice Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-blue-900 block flex items-center gap-1">
                <Send className="w-3.5 h-3.5" /> Submission Best Practice:
              </span>
              <p>
                Never rely solely on an unconfirmed online portal. Always <strong>fax with a transmission confirmation page</strong> or mail via <strong>USPS Certified Mail with Return Receipt</strong> to create legal proof of timely delivery before your deadline expires.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Phone Script & Call Logger View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Phone Script Steps */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-purple-600" />
                    <span>{phoneScript.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Estimated Call Duration: {phoneScript.estimatedTime}
                  </p>
                </div>

                <button
                  onClick={() => setShowCallLogModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log This Call</span>
                </button>
              </div>

              {/* Prep Checklist */}
              <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
                  Before You Dial Checklist:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-purple-950">
                  {phoneScript.prepChecklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by step dialogue */}
              <div className="space-y-4">
                {phoneScript.steps.map((st, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{st.phase}</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-serif italic text-slate-800 mt-2">
                      {st.dialogue}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                      <span>{st.tip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call History & Logger Column */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Call History for Claim #{currentCase.claim_no}
                </h4>
                <span className="text-xs font-bold text-purple-700">{callLogs.length} logged</span>
              </div>

              {callLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No calls logged yet. Click "Log This Call" to record reference numbers and representative details.
                </p>
              ) : (
                <div className="space-y-3">
                  {callLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.rep_name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Ref #: <strong className="font-mono text-slate-800">{log.reference_no}</strong> ({log.duration_mins} mins)
                      </div>
                      <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200/60">
                        {log.notes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Call Log Modal */}
      {showCallLogModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-purple-600" />
                <span>Log Call with {currentCase.insurer}</span>
              </h3>
              <button
                onClick={() => setShowCallLogModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCallLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Representative Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sandra M."
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rep ID / Badge #</label>
                  <input
                    type="text"
                    placeholder="e.g. ID-8821"
                    value={repId}
                    onChange={(e) => setRepId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Call Reference Number</label>
                  <input
                    type="text"
                    placeholder="e.g. REF-992810"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Checklist Verified</label>
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.confirmed_receipt_of_appeal}
                      onChange={(e) => setChecklist({ ...checklist, confirmed_receipt_of_appeal: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span>Confirmed receipt of previous submissions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.requested_claim_file}
                      onChange={(e) => setChecklist({ ...checklist, requested_claim_file: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span>Demanded full claim file under 29 CFR § 2560.503-1</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.asked_for_reviewer_credentials}
                      onChange={(e) => setChecklist({ ...checklist, asked_for_reviewer_credentials: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span>Asked for medical reviewer credentials & specialty</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.inquired_about_peer_to_peer}
                      onChange={(e) => setChecklist({ ...checklist, inquired_about_peer_to_peer: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span>Requested Peer-to-Peer physician appointment contact</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Call Notes & Representative Statements</label>
                <textarea
                  rows={3}
                  placeholder="Notes from conversation..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCallLogModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  Save Call Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
