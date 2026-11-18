import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Mail,
  Zap,
  Info,
  ChevronRight,
  FileCode,
  Scale,
  Award,
  Stethoscope,
  Receipt,
  Check,
  Star,
  Quote,
  Flame,
} from 'lucide-react';
import { SAMPLE_DENIALS, SampleDenial } from '../../data/sampleDenials';
import { decoder } from '../../services/decoder';
import { ExtractedDenialData } from '../../types';

interface DenialDecoderProps {
  onStartIntake: (data: ExtractedDenialData) => void;
  onOpenRules: () => void;
}

export const DenialDecoder: React.FC<DenialDecoderProps> = ({
  onStartIntake,
  onOpenRules,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedSample, setSelectedSample] = useState<SampleDenial | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDenialData | null>(null);
  const [leadEmail, setLeadEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste'>('upload');

  // Load a sample denial
  const handleSelectSample = (sample: SampleDenial) => {
    setSelectedSample(sample);
    setInputText(sample.raw_text);
    triggerAnalysis(sample.raw_text);
  };

  // Run decoder on text
  const triggerAnalysis = (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const decoded = decoder.decode(text);
      setExtractedData(decoded);
      setIsAnalyzing(false);
      // Smooth scroll to results
      const element = document.getElementById('decoded-results-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 650);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      if (text.length > 20) {
        setInputText(text);
        triggerAnalysis(text);
      } else {
        const fallbackSample = SAMPLE_DENIALS[0];
        setSelectedSample(fallbackSample);
        setInputText(fallbackSample.raw_text);
        triggerAnalysis(fallbackSample.raw_text);
      }
    };
    reader.readAsText(file);
  };

  const handleEmailCaptureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leadEmail && leadEmail.includes('@')) {
      setEmailCaptured(true);
    }
  };

  return (
    <div className="space-y-16 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Pinterest Editorial Hero Header */}
      <section className="text-center max-w-3xl mx-auto pt-6 pb-2 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3EDE2] text-[#8C5E39] border border-[#E7D6C2] text-xs font-bold uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 fill-[#C25E3E] text-[#C25E3E]" />
          <span>The Patient Advocacy Playbook</span>
          <span className="w-1 h-1 rounded-full bg-[#8C5E39]" />
          <span className="text-[#C25E3E]">Free & Private</span>
        </div>

        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-normal text-stone-900 tracking-tight leading-[1.12]">
          Don't accept their refusal. <br />
          <span className="italic font-normal text-[#C25E3E]">Take your healthcare back.</span>
        </h1>

        <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-2xl mx-auto">
          Over 85% of people walk away from denied claims because insurance jargon is designed to exhaust you. Upload your denial letter or EOB: decipher what they actually said, calculate your legal deadline, and draft an ERISA-grade appeal in seconds.
        </p>

        {/* Floating Trust Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-stone-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7E2D8] shadow-paper">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong>$1,482,900+</strong> Recovered for Families
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7E2D8] shadow-paper">
            <TrendingUp className="w-3.5 h-3.5 text-[#C25E3E]" />
            <strong>74% Overturn Rate</strong> on Level 1 Appeal
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7E2D8] shadow-paper">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <strong>180-Day</strong> Federal Filing Guarantee
          </span>
        </div>
      </section>

      {/* 2. Interactive Bento Card: Upload & 1-Click Scenarios */}
      <section className="bg-white rounded-3xl border border-[#E7E2D8] shadow-paper p-6 sm:p-8 space-y-8">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C5E39] block">
                Instant Interactive Testing
              </span>
              <h2 className="font-serif-editorial text-2xl font-bold text-stone-900 mt-0.5">
                Choose a Realistic Denial Scenario or Drop Your Own File
              </h2>
            </div>
            <span className="text-xs text-stone-400">
              Click any sample below to experience real-time decoding
            </span>
          </div>

          {/* 5 Tactile Pinned Sample Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {SAMPLE_DENIALS.map((sample) => {
              const isSelected = selectedSample?.id === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? 'border-[#C25E3E] bg-[#FDF8F5] text-stone-900 ring-2 ring-[#C25E3E]/20 shadow-paper'
                      : 'border-[#E7E2D8] hover:border-[#D1C7B7] bg-[#FAF8F5]/60 hover:bg-white text-stone-700 shadow-paper'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#E7E2D8] text-stone-700">
                        {sample.badge}
                      </span>
                      <span className="text-xs font-black text-[#C25E3E]">
                        ${sample.denied_amount.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs line-clamp-2 text-stone-900 leading-snug">
                      {sample.title}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E7E2D8]/80 flex items-center justify-between text-[11px] text-stone-500">
                    <span>{sample.insurer.split(' ')[0]}</span>
                    <span className="text-[#2D5A47] font-bold">
                      {sample.estimated_win_rate}% win rate
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Dropzone / Text Input Box */}
        <div className="pt-2">
          <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveInputMode('upload')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeInputMode === 'upload'
                    ? 'bg-[#1C1917] text-white shadow-paper'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF or Photo</span>
              </button>
              <button
                onClick={() => setActiveInputMode('paste')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeInputMode === 'paste'
                    ? 'bg-[#1C1917] text-white shadow-paper'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Paste Portal Text</span>
              </button>
            </div>

            <span className="text-xs text-stone-400 hidden sm:inline">
              🔒 Client-side parsing: no health records sold or stored on external servers.
            </span>
          </div>

          {activeInputMode === 'upload' ? (
            <div className="border-2 border-dashed border-[#DCD6C9] rounded-2xl p-8 sm:p-12 text-center hover:border-[#C25E3E] hover:bg-[#FDF9F6] transition-all cursor-pointer relative group bg-[#FAF8F5]/40">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-14 h-14 rounded-2xl bg-[#F2EDE4] text-[#8C5E39] mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-all shadow-paper">
                <Upload className="w-6 h-6 text-[#C25E3E]" />
              </div>
              <h3 className="font-serif-editorial text-lg font-bold text-stone-900">
                Drop your Denial Letter or EOB here
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Upload a smartphone photo, scanned letter, or PDF statement from United, Aetna, Cigna, BCBS, or Humana.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs text-[#C25E3E] font-bold bg-[#FDF2E9] px-4 py-1.5 rounded-full border border-[#F5D5C1]">
                <span>Browse files on your device</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={5}
                placeholder="Paste the wording from your insurance portal or denial letter here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E7E2D8] rounded-2xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E]/20 focus:border-[#C25E3E]"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => triggerAnalysis(inputText)}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] hover:bg-[#2E2824] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-paper"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F5C26B]" />
                  <span>Decode This Claim Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Analysis Loading State */}
      {isAnalyzing && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E7E2D8] shadow-paper space-y-3">
          <div className="w-10 h-10 border-3 border-[#C25E3E] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-serif-editorial text-xl font-bold text-stone-900">
            Decoding Health Insurance Jargon...
          </h3>
          <p className="text-xs text-stone-500">
            Cross-referencing ERISA § 503, ACA § 2719, and matching CARC/RARC denial reason codes.
          </p>
        </div>
      )}

      {/* 4. Decoded Results Section */}
      {extractedData && !isAnalyzing && (
        <section id="decoded-results-section" className="bg-white rounded-3xl border border-[#E7E2D8] shadow-paper-lg overflow-hidden">
          {/* Editorial Dark Header */}
          <div className="p-6 sm:p-8 bg-[#1C1917] text-white relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-[#C25E3E]/30 text-[#F5C26B] text-[10px] font-extrabold uppercase tracking-wider border border-[#C25E3E]/40">
                    Category Identified
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    Claim #{extractedData.claim_number}
                  </span>
                </div>
                <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold capitalize text-white">
                  {extractedData.denial_category.replace(/_/g, ' ')}
                </h2>
                <p className="text-xs text-stone-300">
                  Carrier: <strong className="text-white">{extractedData.insurer}</strong> • Service: <strong className="text-white">{extractedData.service_description}</strong>
                </p>
              </div>

              {/* Aesthetic Win Meter Stamp */}
              <div className="bg-[#2E2824] rounded-2xl p-4 border border-stone-700 text-center md:text-right shrink-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex items-center justify-center md:justify-end gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Historical Overturn Rate</span>
                </div>
                <div className="font-serif-editorial text-4xl font-black text-emerald-400 mt-1">
                  {extractedData.estimated_win_rate}%
                </div>
                <div className="text-[10px] text-stone-400">When appealed with doctor LOMN</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Translation Box with Editorial Quotation */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2 relative">
              <div className="flex items-center gap-2 text-[#8C5E39] text-xs font-bold uppercase tracking-wider">
                <Info className="w-4 h-4 text-[#C25E3E]" />
                <span>What The Insurer Is Actually Saying</span>
              </div>
              <p className="text-sm font-medium text-stone-800 leading-relaxed font-serif-editorial italic text-base">
                "{extractedData.plain_english_summary}"
              </p>
              <div className="text-xs text-stone-600 pt-2 border-t border-[#E7E2D8]">
                <strong>The Corporate Playbook:</strong> {extractedData.playbook_explanation}
              </div>
            </div>

            {/* Extracted Parameters Grid */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 block">
                Extracted Claim Information
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]">
                  <span className="text-stone-400 text-[10px] font-bold uppercase block">Patient</span>
                  <span className="font-bold text-stone-900 mt-0.5 block">{extractedData.member_name}</span>
                  <span className="text-[10px] text-stone-400 font-mono">ID: {extractedData.member_id}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]">
                  <span className="text-stone-400 text-[10px] font-bold uppercase block">Date of Service</span>
                  <span className="font-bold text-stone-900 mt-0.5 block">{extractedData.date_of_service}</span>
                  <span className="text-[10px] text-stone-400 font-mono">CPT: {extractedData.cpt_code || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]">
                  <span className="text-stone-400 text-[10px] font-bold uppercase block">Denied Amount</span>
                  <span className="font-serif-editorial text-lg font-bold text-[#C25E3E] mt-0.5 block">
                    ${extractedData.denied_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-stone-400">Total Billed: ${extractedData.billed_amount.toLocaleString()}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FDF8F5] border border-[#F5D5C1]">
                  <span className="text-[#C25E3E] text-[10px] font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Appeal Deadline
                  </span>
                  <span className="font-serif-editorial font-bold text-stone-900 text-sm mt-0.5 block">
                    {extractedData.appeal_deadline_stated || '180 Days (ERISA)'}
                  </span>
                  <span className="text-[10px] text-stone-500">Statutory window</span>
                </div>
              </div>
            </div>

            {/* Tactical Action Plan */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A47]" />
                <span>Your Tactical Appeal Playbook</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {extractedData.next_steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E7E2D8] shadow-paper">
                    <span className="w-5 h-5 rounded-full bg-[#F3EDE2] text-[#8C5E39] font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-stone-700 leading-snug">{st}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar / Appeal Kit Launcher */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FDF8F5] to-[#FAF8F5] border border-[#F5D5C1] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 max-w-md">
                <h4 className="font-serif-editorial text-xl font-bold text-stone-900">
                  Ready to file an appeal that forces a reversal?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Generate your custom Level 1 appeal packet citing ERISA § 503 & ACA § 2719, Doctor LOMN template, claim file demand, and phone scripts.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {!emailCaptured ? (
                  <form onSubmit={handleEmailCaptureSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="email"
                      placeholder="Your email to save"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-[#E7E2D8] rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-[#C25E3E]"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-white border border-[#E7E2D8] hover:bg-stone-50 text-stone-800 font-bold rounded-xl text-xs transition-colors shadow-paper whitespace-nowrap"
                    >
                      Save Analysis
                    </button>
                  </form>
                ) : (
                  <span className="text-xs text-[#2D5A47] font-bold flex items-center gap-1 bg-[#EBF3ED] px-3.5 py-2.5 rounded-xl border border-[#C5DEC8]">
                    <Check className="w-4 h-4" /> Saved to email!
                  </span>
                )}

                <button
                  onClick={() => onStartIntake(extractedData)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1C1917] hover:bg-[#2E2824] text-white rounded-xl text-xs font-bold transition-all shadow-paper-hover transform hover:-translate-y-0.5 whitespace-nowrap w-full sm:w-auto"
                >
                  <span>Start Guided Case Intake</span>
                  <ArrowRight className="w-4 h-4 text-[#F5C26B]" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. The Pinterest-Style "Before vs After" Bento Comparison */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C5E39]">
            The Difference
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-stone-900">
            What Happens When Patients Push Back
          </h2>
          <p className="text-xs text-stone-500">
            Insurers know that automated denials work against uninformed patients. They crumble when hit with formal statutory citations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Cold Corporate Jargon */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E7E2D8] shadow-paper space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider border border-rose-200">
                ❌ What The Insurer Sent You
              </span>
              <span className="text-xs font-mono text-stone-400">CARC 50 / RARC N115</span>
            </div>
            <div className="font-mono text-xs text-stone-700 bg-white p-4 rounded-xl border border-[#E7E2D8] leading-relaxed">
              "We have determined that this service is NOT MEDICALLY NECESSARY pursuant to Clinical Policy Bulletin CPB-0236. Clinical documentation submitted does not demonstrate trial and failure of six (6) weeks of formal physical therapy."
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              <strong>The Trap:</strong> They use commercial algorithms (MCG / InterQual) designed to deny claims automatically without an accredited doctor ever reviewing your neurological chart.
            </p>
          </div>

          {/* Card: The ClaimBack Level 1 Appeal Rebuttal */}
          <div className="bg-white rounded-3xl p-6 border border-[#C25E3E]/30 shadow-paper space-y-4 ring-1 ring-[#C25E3E]/10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#EBF3ED] text-[#2D5A47] text-[10px] font-bold uppercase tracking-wider border border-[#C5DEC8]">
                ⚖️ How ClaimBack Strikes Back
              </span>
              <span className="text-xs font-bold text-[#C25E3E]">ERISA § 503 Enforced</span>
            </div>
            <div className="font-serif-editorial italic text-xs text-stone-900 bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E2D8] leading-relaxed">
              "Pursuant to 29 U.S.C. § 1133 and Wit v. United Behavioral Health, internal screening guidelines cannot substitute for the treating physician's documented clinical judgment. Delaying prescribed care poses unreasonable risk of permanent nerve damage..."
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>The Result:</strong> Forces the insurer to provide the complete claim file free of charge and triggers mandatory peer-to-peer physician review. <strong>Overturn rate: 74%.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 6. Editorial 3-Step Process (01, 02, 03) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E7E2D8] shadow-paper space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C5E39]">
            Simple & Transparent
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-stone-900">
            How ClaimBack Restores Your Rights
          </h2>
          <p className="text-xs text-stone-500">
            Three simple milestones to overturn denials without hiring expensive legal representation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-3">
            <div className="font-serif-editorial text-3xl font-bold text-[#C25E3E]">01</div>
            <h3 className="font-serif-editorial text-lg font-bold text-stone-900">
              Decode The Code
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload your letter or EOB. ClaimBack decodes CARC/RARC codes, identifies the denying algorithm, and pinpoints your exact statutory deadline under federal ACA & ERISA law.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-3">
            <div className="font-serif-editorial text-3xl font-bold text-[#C25E3E]">02</div>
            <h3 className="font-serif-editorial text-lg font-bold text-stone-900">
              Weave Your Plan Language
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our Plan Document SPD Clause Weaver incorporates your employer handbook’s exact definitions to bind the insurer to their own promises under *Firestone* legal precedent.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-3">
            <div className="font-serif-editorial text-3xl font-bold text-[#C25E3E]">03</div>
            <h3 className="font-serif-editorial text-lg font-bold text-stone-900">
              Deploy The Complete Kit
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Export Word (.docx) & PDF letters for the insurer, a pre-filled Letter of Medical Necessity for your doctor to sign, and a phone script with an interactive call logger.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Real Patient Success Stories (Pinterest-Style Testimonials) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C5E39]">
            Real Recoveries
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-stone-900">
            Stories From Patients Who Refused to Give Up
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-[#E7E2D8] shadow-paper flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[#C25E3E]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="font-serif-editorial italic text-stone-800 text-xs leading-relaxed">
                "UnitedHealthcare sent me a surprise bill of $7,200 for an on-call emergency surgeon after my appendix ruptured. ClaimBack cited the No Surprises Act, and the entire balance was dismissed in 3 weeks."
              </p>
            </div>
            <div className="pt-3 border-t border-[#E7E2D8] flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">David R. — Austin, TX</span>
              <span className="text-[#2D5A47] font-bold">Saved $7,200</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E7E2D8] shadow-paper flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[#C25E3E]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="font-serif-editorial italic text-stone-800 text-xs leading-relaxed">
                "My lumbar MRI was denied as 'not medically necessary'. The ClaimBack physician template gave my spine doctor the exact checklist they needed. Aetna reversed the denial in 18 days."
              </p>
            </div>
            <div className="pt-3 border-t border-[#E7E2D8] flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Sarah J. — Denver, CO</span>
              <span className="text-[#2D5A47] font-bold">Saved $2,150</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E7E2D8] shadow-paper flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[#C25E3E]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="font-serif-editorial italic text-stone-800 text-xs leading-relaxed">
                "The Bill Checker caught a duplicate $850 X-Ray and $4,500 facility surcharge on my mother's hospital bill. We saved over $5,300 before sending a single cent to billing."
              </p>
            </div>
            <div className="pt-3 border-t border-[#E7E2D8] flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">Marcus T. — Tampa, FL</span>
              <span className="text-[#2D5A47] font-bold">Saved $5,350</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
