import React from 'react';
import {
  ShieldAlert,
  FileSearch,
  FolderKanban,
  FileText,
  Receipt,
  Scale,
  Users,
  Trophy,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Profile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: Profile;
  onOpenPricing: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenPricing,
  onResetData,
}) => {
  const navItems = [
    { id: 'decoder', label: 'Decoder & Stories', icon: FileSearch, badge: 'Free' },
    { id: 'tracker', label: 'My Appeals', icon: FolderKanban },
    { id: 'appeal-kit', label: 'Appeal Kit', icon: FileText },
    { id: 'bill-checker', label: 'Bill Checker', icon: Receipt, badge: 'Pro' },
    { id: 'rules', label: 'Legal Rules', icon: Scale },
    { id: 'members', label: 'Household', icon: Users },
    { id: 'outcomes', label: 'Impact', icon: Trophy },
  ];

  const getTierBadge = () => {
    switch (profile.subscription_tier) {
      case 'advocate':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-purple-50 text-purple-900 border border-purple-200">
            Advocate Edition
          </span>
        );
      case 'family':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-[#EBF3ED] text-[#2D5A47] border border-[#C5DEC8]">
            Family Plan Active
          </span>
        );
      case 'appeal_kit_single':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            Appeal Kit Unlocked
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            Free Decoder
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('decoder')}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#1C1917] flex items-center justify-center text-white shadow-paper group-hover:scale-105 transition-all">
              <ShieldAlert className="w-5 h-5 text-[#E7C7A8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-editorial text-2xl font-bold tracking-tight text-stone-900">
                  ClaimBack
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider bg-[#F3EDE2] text-[#8C5E39] border border-[#E7D6C2]">
                  Patient Rights
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium tracking-tight">
                Healthcare Justice & Appeal Engine
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#F2EDE4]/60 p-1.5 rounded-2xl border border-[#E7E2D8]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-paper font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C25E3E]' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        item.badge === 'Free'
                          ? 'bg-[#EBF3ED] text-[#2D5A47]'
                          : 'bg-[#FDF2E9] text-[#C25E3E]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Tier & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onResetData}
              title="Reset Demo Data"
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-colors hidden sm:flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Reset Data</span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              {getTierBadge()}
            </div>

            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#1C1917] text-white hover:bg-[#2E2824] shadow-paper hover:shadow-paper-hover transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5C26B]" />
              <span>{profile.subscription_tier === 'free' ? 'Unlock Plans' : 'Membership'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2.5 border-t border-[#E7E2D8] no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-[#1C1917] text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
