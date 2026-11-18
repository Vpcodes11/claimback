import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DenialDecoder } from './components/DenialDecoder/DenialDecoder';
import { CaseTrackerView } from './components/CaseTracker/CaseTrackerView';
import { AppealKitView } from './components/AppealKit/AppealKitView';
import { BillCheckerView } from './components/BillChecker/BillCheckerView';
import { RulesExplorerView } from './components/RulesExplorer/RulesExplorerView';
import { HouseholdAdvocateView } from './components/HouseholdAdvocate/HouseholdAdvocateView';
import { OutcomeDashboardView } from './components/OutcomeDashboard/OutcomeDashboardView';
import { PricingModal } from './components/PricingModal';
import { CaseIntakeModal } from './components/CaseIntakeModal';
import { OutcomeModal } from './components/OutcomeModal';
import { storage } from './services/storage';
import { Case, ExtractedDenialData, HouseholdMember, Profile, SubscriptionTier } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('decoder');
  const [profile, setProfile] = useState<Profile>(() => storage.getProfile());
  const [cases, setCases] = useState<Case[]>(() => storage.getCases());
  const [members, setMembers] = useState<HouseholdMember[]>(() => storage.getMembers());
  const [activeCaseId, setActiveCaseId] = useState<string | null>(cases[0]?.id || null);

  // Modals
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeInitialData, setIntakeInitialData] = useState<ExtractedDenialData | null>(null);
  const [outcomeModalCase, setOutcomeModalCase] = useState<Case | null>(null);

  // Refresh cases and members from storage
  const refreshData = () => {
    setCases(storage.getCases());
    setMembers(storage.getMembers());
    setProfile(storage.getProfile());
  };

  const handleStartIntakeFromDecoder = (data: ExtractedDenialData) => {
    setIntakeInitialData(data);
    setShowIntakeModal(true);
  };

  const handleCaseCreated = (newCase: Case) => {
    refreshData();
    setActiveCaseId(newCase.id);
    setActiveTab('appeal-kit');
  };

  const handleSelectCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setActiveTab('appeal-kit');
  };

  const handleStartAppealForMember = (member: HouseholdMember) => {
    setIntakeInitialData({
      insurer: 'Blue Cross Blue Shield',
      plan_type: 'employer_self_funded',
      member_name: member.full_name,
      member_id: member.insurance_id || 'ID-992810',
      group_number: member.group_number || 'GRP-8819',
      claim_number: `CLM-${Math.floor(100000 + Math.random() * 900000)}`,
      service_description: 'Prescribed Medical Intervention',
      cpt_code: '99214',
      date_of_service: new Date().toISOString().split('T')[0],
      billed_amount: 1850.0,
      denied_amount: 1850.0,
      denial_reason: 'Prior authorization absent or documentation insufficient.',
      denial_code: 'CARC 197',
      denial_category: 'missing_prior_auth',
      plain_english_summary: 'Pre-service approval was not recorded on file before service.',
      playbook_explanation: 'Retroactive authorization can be granted upon submitting treating physician chart notes.',
      estimated_win_rate: 76,
      next_steps: ['Initiate retroactive auth', 'Submit clinical notes'],
    });
    setShowIntakeModal(true);
  };

  const handleResetDemoData = () => {
    if (confirm('Reset ClaimBack to default demo data?')) {
      storage.resetAllData();
      refreshData();
      setActiveTab('decoder');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Brand Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenPricing={() => setShowPricingModal(true)}
        onResetData={handleResetDemoData}
      />

      {/* Main Tab Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'decoder' && (
          <DenialDecoder
            onStartIntake={handleStartIntakeFromDecoder}
            onOpenRules={() => setActiveTab('rules')}
          />
        )}

        {activeTab === 'tracker' && (
          <CaseTrackerView
            cases={cases}
            onSelectCase={handleSelectCase}
            onOpenIntake={() => {
              setIntakeInitialData(null);
              setShowIntakeModal(true);
            }}
            onOpenOutcomeModal={(c) => setOutcomeModalCase(c)}
            onCaseUpdated={refreshData}
          />
        )}

        {activeTab === 'appeal-kit' && (
          <AppealKitView
            cases={cases}
            activeCaseId={activeCaseId}
            onSelectCase={(id) => setActiveCaseId(id)}
            onOpenPricing={() => setShowPricingModal(true)}
          />
        )}

        {activeTab === 'bill-checker' && (
          <BillCheckerView
            profile={profile}
            onOpenPricing={() => setShowPricingModal(true)}
          />
        )}

        {activeTab === 'rules' && <RulesExplorerView />}

        {activeTab === 'members' && (
          <HouseholdAdvocateView
            profile={profile}
            onOpenPricing={() => setShowPricingModal(true)}
            onStartAppealForMember={handleStartAppealForMember}
          />
        )}

        {activeTab === 'outcomes' && (
          <OutcomeDashboardView
            onOpenReportModal={() => {
              if (cases.length > 0) {
                setOutcomeModalCase(cases[0]);
              }
            }}
          />
        )}
      </main>

      {/* Pinterest Editorial Footer */}
      <footer className="bg-[#FAF8F5] border-t border-[#E7E2D8] py-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-serif-editorial text-xl font-bold text-stone-900">ClaimBack</span>
            <span className="text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider bg-[#F3EDE2] text-[#8C5E39] border border-[#E7D6C2]">
              Citizen Advocacy Engine
            </span>
          </div>
          <p className="font-medium text-stone-700 max-w-xl mx-auto text-xs leading-relaxed">
            Empowering American patients to challenge automated insurance rejections through statutory rights under ERISA § 503, ACA § 2719, and the No Surprises Act.
          </p>
          <p className="max-w-2xl mx-auto text-[11px] text-stone-400 pt-2 border-t border-[#E7E2D8]/60 leading-relaxed">
            Disclaimer: ClaimBack provides legal information, statutory citations, and document preparation tools. ClaimBack is not a law firm and does not provide formal legal representation. Always verify your specific appeal deadlines on your insurer's official Notice of Adverse Benefit Determination.
          </p>
        </div>
      </footer>

      {/* Guided Case Intake Wizard Modal */}
      <CaseIntakeModal
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        initialData={intakeInitialData}
        onCaseCreated={handleCaseCreated}
        householdMembers={members}
      />

      {/* Pricing & Subscription Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        profile={profile}
        onPlanUpdated={(tier) => {
          setProfile({ ...profile, subscription_tier: tier });
        }}
      />

      {/* Report Case Outcome / Win Modal */}
      <OutcomeModal
        isOpen={!!outcomeModalCase}
        onClose={() => setOutcomeModalCase(null)}
        caseData={outcomeModalCase}
        onOutcomeSaved={refreshData}
      />
    </div>
  );
}

export default App;
