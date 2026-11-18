import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  X,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Case, Outcome } from '../types';
import { storage } from '../services/storage';

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case | null;
  onOutcomeSaved: () => void;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onOutcomeSaved,
}) => {
  if (!isOpen || !caseData) return null;

  const [result, setResult] = useState<Outcome['result']>('won_full');
  const [amountRecovered, setAmountRecovered] = useState<number>(caseData.amount);
  const [turnaroundDays, setTurnaroundDays] = useState<number>(24);
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (result === 'won_full' || result === 'won_partial') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    storage.recordOutcome({
      case_id: caseData.id,
      insurer: caseData.insurer,
      denial_category: caseData.denial_category,
      service: caseData.service,
      result,
      amount_originally_denied: caseData.amount,
      amount_recovered: Number(amountRecovered),
      turnaround_days: Number(turnaroundDays),
      resolution_date: new Date().toISOString().split('T')[0],
      notes: notes || 'Appeal completed.',
      consented_to_aggregate: consent,
    });

    onOutcomeSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Report Case Resolution</h3>
          <p className="text-xs text-slate-500 mt-1">
            Claim #{caseData.claim_no} • {caseData.service}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">What was the outcome?</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setResult('won_full');
                  setAmountRecovered(caseData.amount);
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                  result === 'won_full'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                🎉 Won Full ($)
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult('won_partial');
                  setAmountRecovered(Math.round(caseData.amount * 0.7));
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                  result === 'won_partial'
                    ? 'bg-blue-50 border-blue-600 text-blue-800 ring-1 ring-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Partial Win
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult('lost');
                  setAmountRecovered(0);
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                  result === 'lost'
                    ? 'bg-rose-50 border-rose-600 text-rose-800 ring-1 ring-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Denied / Lost
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount Recovered ($)</label>
              <input
                type="number"
                step="0.01"
                value={amountRecovered}
                onChange={(e) => setAmountRecovered(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Turnaround Days</label>
              <input
                type="number"
                value={turnaroundDays}
                onChange={(e) => setTurnaroundDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resolution Details & Strategy Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Doctor's signed LOMN and citation of ERISA claim file disclosure forced the insurer medical director to overturn..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Privacy Consent Checkbox */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded text-blue-600"
              />
              <span className="text-[11px] text-slate-600">
                <strong>Anonymized Community Impact Consent:</strong> I agree to contribute this recovery dollar amount ($) and insurer name to the anonymous aggregate community impact dashboard to encourage other patients. (No personal health identifiers are ever shared).
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md shadow-emerald-600/20"
            >
              Confirm & Save Outcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
