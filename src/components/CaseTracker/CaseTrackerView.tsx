import React, { useState } from 'react';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Trophy,
  Trash2,
  Eye,
  FileText,
  Plus,
} from 'lucide-react';
import { Case, CaseStatus } from '../../types';
import { storage } from '../../services/storage';

interface CaseTrackerViewProps {
  cases: Case[];
  onSelectCase: (caseId: string) => void;
  onOpenIntake: () => void;
  onOpenOutcomeModal: (c: Case) => void;
  onCaseUpdated: () => void;
}

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; badgeClass: string; borderClass: string }
> = {
  draft: {
    label: 'Draft / In Preparation',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    borderClass: 'border-l-slate-400',
  },
  sent: {
    label: 'Appeal Sent / Filed',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    borderClass: 'border-l-blue-500',
  },
  insurer_reviewing: {
    label: 'Insurer Reviewing',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-l-amber-500',
  },
  approved: {
    label: 'Approved / Won 🎉',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderClass: 'border-l-emerald-500',
  },
  denied: {
    label: 'Denied (Level 1 Upheld)',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    borderClass: 'border-l-rose-500',
  },
  external_review: {
    label: 'External Review (IRO)',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    borderClass: 'border-l-purple-500',
  },
  resolved: {
    label: 'Resolved & Settled',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    borderClass: 'border-l-teal-500',
  },
};

export const CaseTrackerView: React.FC<CaseTrackerViewProps> = ({
  cases,
  onSelectCase,
  onOpenIntake,
  onOpenOutcomeModal,
  onCaseUpdated,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [secondDenialModalCase, setSecondDenialModalCase] = useState<Case | null>(null);
  const [secondDenialNotes, setSecondDenialNotes] = useState('');

  const filteredCases = filterStatus === 'all'
    ? cases
    : cases.filter((c) => c.status === filterStatus);

  // Metrics
  const totalCases = cases.length;
  const approvedCases = cases.filter((c) => c.status === 'approved');
  const totalRecovered = approvedCases.reduce((acc, c) => acc + c.amount, 0);
  const pendingAmount = cases
    .filter((c) => c.status !== 'approved' && c.status !== 'resolved')
    .reduce((acc, c) => acc + c.amount, 0);
  const urgentCount = cases.filter((c) => c.deadlines.urgency_status === 'urgent' || c.deadlines.urgency_status === 'critical').length;

  const handleStatusChange = (caseId: string, newStatus: CaseStatus) => {
    storage.updateCase(caseId, { status: newStatus });
    onCaseUpdated();
  };

  const handleDeleteCase = (caseId: string) => {
    if (confirm('Are you sure you want to delete this case?')) {
      storage.deleteCase(caseId);
      onCaseUpdated();
    }
  };

  const handleEscalateToExternal = () => {
    if (!secondDenialModalCase) return;
    storage.updateCase(secondDenialModalCase.id, {
      status: 'external_review',
      notes: `${secondDenialModalCase.notes}\n[Level 1 Upheld]: ${secondDenialNotes || 'Uploaded second adverse determination. Initiated Independent External Review (IRO).'}`.trim(),
    });
    setSecondDenialModalCase(null);
    setSecondDenialNotes('');
    onCaseUpdated();
    onSelectCase(secondDenialModalCase.id);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-600" />
            <span>Case Tracker & Timelines</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track appeal statuses, monitor statutory insurer decision countdowns, and escalate to external review.
          </p>
        </div>

        <button
          onClick={onOpenIntake}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Appeal</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[11px]">Total Appeals</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCases}</span>
          <span className="text-[10px] text-slate-400">Household & active files</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[11px]">Pending Dollars In Review</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400">Currently being fought</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[11px]">Money Recovered</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            ${totalRecovered.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">{approvedCases.length} won claims</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[11px]">Urgent Deadlines</span>
          <span className={`text-2xl font-black mt-1 block ${urgentCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {urgentCount}
          </span>
          <span className="text-[10px] text-slate-400">Requiring immediate action</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {['all', 'draft', 'sent', 'insurer_reviewing', 'approved', 'denied', 'external_review', 'resolved'].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
              }`}
            >
              {status === 'all'
                ? 'All Cases'
                : STATUS_CONFIG[status as CaseStatus]?.label || status}
            </button>
          )
        )}
      </div>

      {/* Case List Grid */}
      <div className="space-y-3.5">
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No cases found in this filter</h3>
            <p className="text-xs text-slate-500 mt-1">Change your filter or start a new appeal.</p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const statusMeta = STATUS_CONFIG[c.status] || STATUS_CONFIG.draft;
            const isUrgentOrCritical =
              c.deadlines.urgency_status === 'urgent' ||
              c.deadlines.urgency_status === 'critical';

            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-xs border-l-4 ${statusMeta.borderClass} transition-all hover:shadow-md`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Service & Claim Facts */}
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {c.service}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Claim #{c.claim_no}
                      </span>
                      {c.is_urgent && (
                        <span className="px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
                          72h Expedited
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      Patient: <strong className="text-slate-800">{c.member_name}</strong> • Insurer:{' '}
                      <strong className="text-slate-800">{c.insurer}</strong> • DOS: <strong>{c.dos}</strong> • Jurisdiction: <strong>{c.state}</strong>
                    </p>

                    <div className="text-xs text-slate-500 line-clamp-1 italic">
                      "{c.denial_reason}"
                    </div>
                  </div>

                  {/* Middle: Amount & Deadline Badge */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Denied Total</div>
                      <div className="text-lg font-black text-rose-600">
                        ${c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Deadline Widget */}
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs text-right ${
                        isUrgentOrCritical
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Deadline</span>
                      </div>
                      <div className="font-extrabold text-xs">
                        {c.deadlines.internal_appeal_deadline}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.deadlines.days_remaining} days left (Verify)
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Dropdown & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Status Changer Dropdown */}
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value as CaseStatus)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-hidden ${statusMeta.badgeClass}`}
                    >
                      <option value="draft">Draft / Preparing</option>
                      <option value="sent">Appeal Sent / Filed</option>
                      <option value="insurer_reviewing">Insurer Reviewing</option>
                      <option value="approved">Approved / Won</option>
                      <option value="denied">Denied (Level 1)</option>
                      <option value="external_review">External Review (IRO)</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    {/* Open Appeal Kit */}
                    <button
                      onClick={() => onSelectCase(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Appeal Kit</span>
                    </button>

                    {/* Escalate 2nd Denial Button */}
                    {c.status === 'denied' && (
                      <button
                        onClick={() => setSecondDenialModalCase(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Escalate to IRO</span>
                      </button>
                    )}

                    {/* Report Win Button */}
                    {c.status !== 'approved' && (
                      <button
                        onClick={() => onOpenOutcomeModal(c)}
                        title="Report Win / Outcome"
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Trophy className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteCase(c.id)}
                      title="Delete Case"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Escalate to External Review (IRO) Modal */}
      {secondDenialModalCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-600" />
                <span>Second Denial: Escalate to Independent External Review (IRO)</span>
              </h3>
              <button
                onClick={() => setSecondDenialModalCase(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Under federal law (45 CFR § 147.136), once internal appeals are exhausted, you have the statutory right to an <strong>Independent Review Organization (IRO)</strong>. The IRO’s decision is legally binding on {secondDenialModalCase.insurer}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Upload Second Denial Notice (PDF / Photo)
                </label>
                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-[11px] text-slate-500">Drop 2nd denial notice or click to select</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Insurer’s Secondary Denial Rationale / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Insurer Level 1 committee upheld denial, stating peer clinical literature insufficient."
                  value={secondDenialNotes}
                  onChange={(e) => setSecondDenialNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 text-[11px]">
                ✓ Generating this request will create your official <strong>State DOI / HHS IRO Petition</strong> and update this case to External Review.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSecondDenialModalCase(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalateToExternal}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  Generate External Review Packet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
