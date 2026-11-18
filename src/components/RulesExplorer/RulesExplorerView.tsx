import React, { useState } from 'react';
import {
  Scale,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  Filter,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { InsuranceRule } from '../../types';
import { storage } from '../../services/storage';

export const RulesExplorerView: React.FC = () => {
  const [rules] = useState<InsuranceRule[]>(() => storage.getRules());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.statute.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || rule.category === selectedCategory;

    const matchesState =
      selectedState === 'ALL'
        ? true
        : rule.state === selectedState || rule.state === 'ALL';

    return matchesSearch && matchesCategory && matchesState;
  });

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200">
            Statutory Knowledge Base
          </span>
          <span className="text-xs text-slate-400">All rules verified against federal CFR & state codes</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Scale className="w-6 h-6 text-blue-600" />
          <span>US Health Insurance Appeals & Protections Rules Table</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore legal timelines, statutory appeal deadlines, expedited 72-hour rules, and surprise balance billing protections.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Important Rule Verification Notice:</span>
          Federal law provides standard minimum timelines (e.g. 180 days for internal appeal, 120 days for external review, 72 hours for urgent care). Always verify the exact deadline printed in your insurer's <em>Notice of Adverse Benefit Determination</em>, as some employer policies grant extended filing windows.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search statutes, e.g. 29 CFR, No Surprises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* State Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Jurisdiction:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden"
          >
            <option value="ALL">All Federal & State Rules</option>
            <option value="CA">California (DMHC / CDI)</option>
            <option value="NY">New York (DFS External Appeal)</option>
            <option value="TX">Texas (TDI IRO)</option>
            <option value="FL">Florida (FLOIR)</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Rules' },
          { id: 'internal_appeal', label: 'Internal Appeals' },
          { id: 'external_review', label: 'External Review (IRO)' },
          { id: 'expedited_appeal', label: 'Expedited 72-Hour' },
          { id: 'surprise_billing', label: 'No Surprises Act' },
          { id: 'mental_health_parity', label: 'Mental Health Parity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedCategory === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase border border-slate-200">
                  {rule.jurisdiction === 'federal' ? 'Federal Mandate' : `State: ${rule.state}`}
                </span>

                {rule.verify_badge && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                    Verify
                  </span>
                )}
              </div>

              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {rule.title}
              </h3>

              <div className="mt-1 font-mono text-[11px] text-blue-700 font-bold">
                {rule.statute}
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                {rule.summary}
              </p>

              {/* Applicable plan tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {rule.plan_types.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-slate-50 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200"
                  >
                    {p.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Timeline & Official Source Link */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-700 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {rule.timeline_days === 3
                    ? '72-Hour Turnaround'
                    : `${rule.timeline_days}-Day Filing Window`}
                </span>
              </span>

              <a
                href={rule.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-[11px] transition-colors"
              >
                <span>{rule.source_name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
