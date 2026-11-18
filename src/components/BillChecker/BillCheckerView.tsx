import React, { useState } from 'react';
import {
  Receipt,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  Copy,
  Printer,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Info,
  DollarSign,
  Tag,
  Check,
} from 'lucide-react';
import { Bill, BillAuditFlag, BillLineItem, Profile } from '../../types';
import { SAMPLE_BILLS } from '../../data/sampleBills';
import { billChecker } from '../../services/billChecker';
import { storage } from '../../services/storage';
import { exporter } from '../../services/exporter';

interface BillCheckerViewProps {
  profile: Profile;
  onOpenPricing: () => void;
}

export const BillCheckerView: React.FC<BillCheckerViewProps> = ({
  profile,
  onOpenPricing,
}) => {
  const [bills, setBills] = useState<Bill[]>(() => storage.getBills());
  const [selectedBill, setSelectedBill] = useState<Bill>(bills[0] || SAMPLE_BILLS[0]);
  const [activeModalLetter, setActiveModalLetter] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const isProSubscriber =
    profile.subscription_tier === 'family' ||
    profile.subscription_tier === 'advocate';

  const handleSelectSample = (sample: Bill) => {
    setSelectedBill(sample);
  };

  const handleOpenItemizedDemand = () => {
    const text = billChecker.generateItemizedBillRequest(selectedBill, profile.full_name || 'Jordan Taylor');
    setActiveModalLetter({
      title: 'Formal Demand for Comprehensive Itemized Hospital Bill',
      content: text,
    });
  };

  const handleOpenDisputeLetter = () => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const highFlags = selectedBill.flags.filter((f) => f.severity === 'high');

    const disputeMarkdown = `**FORMAL NOTICE OF BILLING DISPUTE & NO SURPRISES ACT VIOLATIONS**
**DATE:** ${today}

**VIA CERTIFIED MAIL (RETURN RECEIPT REQUESTED) & REGISTERED PATIENT PORTAL**

**TO:**
${selectedBill.provider_name}
Patient Financial Services / Accounts Receivable
Billing Reference Number: ${selectedBill.bill_account_no}

**PATIENT / ACCOUNT IDENTIFICATION:**
* **Patient Name:** ${profile.full_name || 'Jordan Taylor'}
* **Account Number:** ${selectedBill.bill_account_no}
* **Statement Date:** ${selectedBill.bill_date}
* **Disputed Dollar Total:** $${selectedBill.potential_savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}

Dear Billing Department Director:

I am writing to formally dispute the balance claimed on the above account. A cross-audit between your hospital statement and the Explanation of Benefits (EOB) issued by my health insurance plan has identified serious statutory violations, duplicate charges, and billing calculation errors.

### 1. SPECIFIC AUDIT DISCREPANCIES IDENTIFIED:
${highFlags
  .map(
    (flag, idx) => `
#### ${idx + 1}. ${flag.title} (Disputed Amount: $${flag.impact_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
* **Description:** ${flag.description}
* **Statutory Rule Violation:** ${flag.rule_reference}
* **Mandated Remedy:** ${flag.recommended_action}`
  )
  .join('\n')}

### 2. NO SURPRISES ACT & CONSUMER PROTECTION COMPLIANCE
Under the federal No Surprises Act (42 U.S.C. § 300gg-111, 45 C.F.R. § 149), healthcare facilities and providers are strictly prohibited from balance billing patients for emergency services or non-emergency ancillary care. The maximum legal patient financial obligation is limited strictly to in-network cost-sharing.

Furthermore, under the terms of your participating provider agreement, you may not bill patients for contractual discount amounts or administrative write-offs.

### 3. MANDATORY ACTIONS DEMANDED:
1. **Recalculate Ledger:** Re-adjudicate this account to reflect only the legitimate EOB patient responsibility of **$${selectedBill.eob_patient_responsibility.toFixed(2)}**.
2. **Administrative Dispute Freeze:** Place this account on an immediate billing dispute hold.
3. **No Third-Party Collections:** Do not refer this account to third-party collection agencies or report any adverse trade lines to consumer reporting agencies pursuant to 15 U.S.C. § 1692g.

Please provide a revised zero-balance or corrected statement within twenty (20) business days.

Sincerely,

________________________________________
**${profile.full_name || 'Jordan Taylor'}**
Patient`;

    setActiveModalLetter({
      title: 'Formal Provider Billing & Balance Billing Dispute Letter',
      content: disputeMarkdown,
    });
  };

  const handleCopyModalText = () => {
    if (!activeModalLetter) return;
    navigator.clipboard.writeText(activeModalLetter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!activeModalLetter) return;
    exporter.exportToPdf({
      id: 'disp-pdf',
      case_id: 'bill-audit',
      letter_type: 'provider_billing_dispute',
      title: activeModalLetter.title,
      recipient: selectedBill.provider_name,
      recipient_address: 'Patient Financial Services',
      subject: `BILLING DISPUTE - ACCT #${selectedBill.bill_account_no}`,
      content_markdown: activeModalLetter.content,
      statutes_cited: ['No Surprises Act 42 U.S.C. § 300gg-111', 'HIPAA 45 C.F.R. § 164.528'],
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
              Subscription Feature
            </span>
            <span className="text-xs text-slate-400">Included in Family & Advocate Plans</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Medical Bill & EOB Discrepancy Checker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit hospital bills against your Explanation of Benefits. Detect duplicate CPT codes, balance billing under the No Surprises Act, and missing insurance discounts.
          </p>
        </div>

        {!isProSubscriber && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-900 block">Previewing in Interactive Demo Mode</span>
              <span className="text-amber-700">Family plan ($12/mo) includes unlimited bill audits.</span>
            </div>
            <button
              onClick={onOpenPricing}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold shrink-0"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      {/* Sample Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Select an Audited Medical Bill:
          </span>
          <span className="text-xs text-slate-400">Switch between preloaded sample audits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_BILLS.map((b) => {
            const isSelected = selectedBill.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => handleSelectSample(b)}
                className={`text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-600/20 font-medium'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">{b.provider_name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Account: {b.bill_account_no} • Total Billed: ${b.total_billed.toLocaleString()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px] block mb-1">
                    {b.flags.length} Errors Found
                  </span>
                  <span className="text-emerald-700 font-black text-xs">
                    Save ${b.potential_savings.toLocaleString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Hospital Statement Total
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${selectedBill.total_billed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Total billed charges on statement</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
            Actual EOB Patient Responsibility
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            ${selectedBill.eob_patient_responsibility.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">What your insurer actually says you owe</span>
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md shadow-emerald-600/20">
          <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider block flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Potential Patient Savings
          </span>
          <div className="text-3xl font-black text-white mt-1">
            ${selectedBill.potential_savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-100 mt-0.5 block">Identified in improper billing & violations</span>
        </div>
      </div>

      {/* Audit Flags Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Billing Audit Findings ({selectedBill.flags.length} Issues Flagged)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review flagged billing discrepancies, statutory violations, and recommended dispute actions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenItemizedDemand}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Itemized Bill Request</span>
            </button>
            <button
              onClick={handleOpenDisputeLetter}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Generate Dispute Letter</span>
            </button>
          </div>
        </div>

        {/* Flag Cards Grid */}
        <div className="space-y-3">
          {selectedBill.flags.map((flag) => (
            <div
              key={flag.id}
              className={`p-4 rounded-xl border transition-all ${
                flag.severity === 'high'
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-amber-50/50 border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase ${
                        flag.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {flag.severity} Severity
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{flag.title}</h4>
                  </div>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{flag.description}</p>
                  <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                    <div>
                      <strong>Statutory Rule:</strong> {flag.rule_reference}
                    </div>
                    <div>
                      <strong>Action:</strong> {flag.recommended_action}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Impact</span>
                  <span className="text-base font-extrabold text-rose-600">
                    -${flag.impact_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Line Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-base font-extrabold text-slate-900 mb-3">
          Statement Line Items vs EOB Adjudication
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">CPT / HCPCS</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Billed</th>
                <th className="py-2.5 px-3 text-right">Allowed</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-right">Patient Owed</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {selectedBill.extracted_line_items.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 ${
                    item.status === 'error'
                      ? 'bg-rose-50/20'
                      : item.status === 'suspicious'
                      ? 'bg-amber-50/20'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.cpt_hcpcs}</td>
                  <td className="py-2.5 px-3">
                    <div>{item.description}</div>
                    {item.flags && item.flags.length > 0 && (
                      <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                        ⚠️ {item.flags.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.date_of_service}</td>
                  <td className="py-2.5 px-3 text-right font-mono">${item.billed_amount.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    ${item.allowed_amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    ${item.insurance_paid?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ${item.patient_responsibility?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'error'
                          ? 'bg-rose-100 text-rose-800'
                          : item.status === 'suspicious'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Dispute / Itemized Letter Modal */}
      {activeModalLetter && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {activeModalLetter.title}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyModalText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => setActiveModalLetter(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
              {activeModalLetter.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
