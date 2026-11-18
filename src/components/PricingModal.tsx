import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Users,
  Briefcase,
  Lock,
  Tag,
} from 'lucide-react';
import { Profile, SubscriptionTier } from '../types';
import { storage } from '../services/storage';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onPlanUpdated: (newTier: SubscriptionTier) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  profile,
  onPlanUpdated,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'SAVE10' || couponCode.toUpperCase() === 'HEALTHHERO') {
      setCouponApplied(true);
    } else {
      alert('Invalid coupon code. Try SAVE10 or HEALTHHERO for demo discount!');
    }
  };

  const handleSubscribe = (tier: SubscriptionTier) => {
    setIsProcessing(true);
    setTimeout(() => {
      let amount = 0;
      let planName = 'Free';
      if (tier === 'appeal_kit_single') {
        amount = couponApplied ? 19.0 : 29.0;
        planName = 'Appeal Kit ($29 One-Time)';
      } else if (tier === 'family') {
        amount = billingCycle === 'yearly' ? 99.0 : 12.0;
        planName = `Family Plan (${billingCycle === 'yearly' ? '$99/yr' : '$12/mo'})`;
      } else if (tier === 'advocate') {
        amount = 49.0;
        planName = 'Advocate Plan ($49/mo)';
      }

      storage.updateProfile({ subscription_tier: tier });
      if (amount > 0) {
        storage.addOrder({
          user_id: profile.id,
          plan_or_package: planName,
          amount,
          status: 'succeeded',
          payment_method: 'Visa •••• 4242',
        });
      }

      setIsProcessing(false);
      setSuccessMessage(`Success! Your account is now active on the ${planName}.`);
      onPlanUpdated(tier);

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#FAF8F5] rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 overflow-hidden border border-[#E7E2D8]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EDE2] text-[#8C5E39] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C25E3E]" />
            Transparent Healthcare Justice Pricing
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Choose Your Level of Advocacy
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every plan includes legal-grade appeal letters, physician LOMN templates, and federal statutory citations under ERISA § 503 & ACA § 2719.
          </p>

          {/* Billing Toggle */}
          <div className="mt-4 inline-flex items-center p-1 bg-[#F2EDE4] rounded-2xl border border-[#E7E2D8]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-stone-900 shadow-paper' : 'text-stone-600'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                billingCycle === 'yearly' ? 'bg-white text-stone-900 shadow-paper' : 'text-stone-600'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 bg-[#EBF3ED] text-[#2D5A47] rounded-full text-[9px] font-extrabold uppercase">
                Save 31%
              </span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-[#EBF3ED] border border-[#C5DEC8] text-[#2D5A47] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-[#2D5A47]" />
            {successMessage}
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Plan 1: Single Appeal Kit */}
          <div className="rounded-3xl p-6 border border-[#E7E2D8] bg-white shadow-paper flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-[#8C5E39] uppercase tracking-wider">
                Single Case
              </div>
              <h3 className="font-serif-editorial text-xl font-bold text-stone-900 mt-1">
                Appeal Kit
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Full legal appeal packet for one specific claim denial.
              </p>

              <div className="mt-4 flex items-baseline">
                <span className="font-serif-editorial text-3xl font-black text-stone-900">
                  ${couponApplied ? '19' : '29'}
                </span>
                <span className="text-xs text-stone-500 ml-1.5">one-time payment</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Custom Level 1 Appeal Letter citing ERISA & ACA</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Physician Letter of Medical Necessity template</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Free Claim File demand letter (29 CFR § 2560.503-1)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Phone scripts & interactive insurer call log</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>DOCX & PDF export ready for fax or portal</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('appeal_kit_single')}
              disabled={isProcessing}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-paper ${
                profile.subscription_tier === 'appeal_kit_single'
                  ? 'bg-stone-100 text-stone-500 cursor-default'
                  : 'bg-[#1C1917] text-white hover:bg-[#2E2824]'
              }`}
            >
              {profile.subscription_tier === 'appeal_kit_single' ? 'Current Plan' : 'Get Appeal Kit ($29)'}
            </button>
          </div>

          {/* Plan 2: Family Plan (Featured) */}
          <div className="relative rounded-3xl p-6 border-2 border-[#C25E3E] bg-[#FDF8F5] shadow-paper-lg flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#C25E3E] text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-xs">
              Most Popular
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#C25E3E] uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Household Protection</span>
              </div>
              <h3 className="font-serif-editorial text-xl font-bold text-stone-900 mt-1">
                Family Plan
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Unlimited appeals + Medical Bill & EOB Error Checker.
              </p>

              <div className="mt-4 flex items-baseline">
                <span className="font-serif-editorial text-3xl font-black text-stone-900">
                  {billingCycle === 'yearly' ? '$99' : '$12'}
                </span>
                <span className="text-xs text-stone-500 ml-1.5">
                  {billingCycle === 'yearly' ? '/year ($8.25/mo)' : '/month'}
                </span>
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-stone-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <strong className="text-stone-900">Unlimited appeals for all household members</strong>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <strong className="text-stone-900">Bill & EOB Error Checker (duplicate & surprise bills)</strong>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Hospital Itemized Bill & HIPAA dispute letters</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>External Review (IRO) request generator for 2nd denials</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Priority email assistance from patient advocates</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('family')}
              disabled={isProcessing}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-paper ${
                profile.subscription_tier === 'family'
                  ? 'bg-[#EBF3ED] text-[#2D5A47] cursor-default'
                  : 'bg-[#C25E3E] text-white hover:bg-[#A94C30]'
              }`}
            >
              {profile.subscription_tier === 'family' ? 'Current Plan' : 'Start Family Plan'}
            </button>
          </div>

          {/* Plan 3: Advocate Plan */}
          <div className="rounded-3xl p-6 border border-[#E7E2D8] bg-white shadow-paper flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Professional Navigators</span>
              </div>
              <h3 className="font-serif-editorial text-xl font-bold text-stone-900 mt-1">
                Advocate Plan
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                For independent navigators managing multiple clients.
              </p>

              <div className="mt-4 flex items-baseline">
                <span className="font-serif-editorial text-3xl font-black text-stone-900">
                  $49
                </span>
                <span className="text-xs text-stone-500 ml-1.5">/month</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <strong className="text-stone-900">Manage up to 25 separate client dossiers</strong>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Unlimited appeals, LOMN requests & document demands</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Bill & EOB Audit Suite with custom branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#2D5A47] shrink-0 mt-0.5" />
                  <span>Exportable case outcome reports for client billing</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('advocate')}
              disabled={isProcessing}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-paper ${
                profile.subscription_tier === 'advocate'
                  ? 'bg-purple-100 text-purple-900 cursor-default'
                  : 'bg-purple-900 text-white hover:bg-purple-950'
              }`}
            >
              {profile.subscription_tier === 'advocate' ? 'Current Plan' : 'Start Advocate ($49/mo)'}
            </button>
          </div>
        </div>

        {/* Promo Code & Security Guarantees */}
        <div className="mt-8 pt-6 border-t border-[#E7E2D8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleApplyCoupon} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Promo Code (SAVE10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E7E2D8] rounded-xl uppercase focus:outline-hidden focus:ring-1 focus:ring-[#C25E3E]"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-bold bg-[#F2EDE4] hover:bg-[#E7E0D3] text-stone-800 rounded-xl transition-colors"
            >
              Apply
            </button>
            {couponApplied && (
              <span className="text-xs text-[#2D5A47] font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> $10 Discount Applied!
              </span>
            )}
          </form>

          <div className="flex items-center gap-4 text-stone-500 text-xs">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-stone-400" /> 256-Bit SSL Encryption
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" /> 30-Day Money Back Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
