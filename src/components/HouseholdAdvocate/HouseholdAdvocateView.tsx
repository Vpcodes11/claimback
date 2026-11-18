import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  UserPlus,
  ShieldCheck,
  FolderKanban,
  FileText,
  Trash2,
  Edit2,
  Sparkles,
  Check,
} from 'lucide-react';
import { HouseholdMember, Profile } from '../../types';
import { storage } from '../../services/storage';

interface HouseholdAdvocateViewProps {
  profile: Profile;
  onOpenPricing: () => void;
  onStartAppealForMember: (member: HouseholdMember) => void;
}

export const HouseholdAdvocateView: React.FC<HouseholdAdvocateViewProps> = ({
  profile,
  onOpenPricing,
  onStartAppealForMember,
}) => {
  const [members, setMembers] = useState<HouseholdMember[]>(() => storage.getMembers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState<HouseholdMember['relationship']>('spouse');
  const [dob, setDob] = useState('1988-04-15');
  const [insuranceId, setInsuranceId] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [notes, setNotes] = useState('');

  const isAdvocate = profile.subscription_tier === 'advocate';
  const isFamily = profile.subscription_tier === 'family';

  const cases = storage.getCases();

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFullName('');
    setRelationship(isAdvocate ? 'client' : 'spouse');
    setDob('1990-01-01');
    setInsuranceId('');
    setGroupNumber('');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (m: HouseholdMember) => {
    setEditingMember(m);
    setFullName(m.full_name);
    setRelationship(m.relationship);
    setDob(m.dob || '');
    setInsuranceId(m.insurance_id || '');
    setGroupNumber(m.group_number || '');
    setNotes(m.notes || '');
    setShowAddModal(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    if (editingMember) {
      storage.updateMember(editingMember.id, {
        full_name: fullName,
        relationship,
        dob,
        insurance_id: insuranceId,
        group_number: groupNumber,
        notes,
      });
    } else {
      storage.addMember({
        user_id: profile.id,
        full_name: fullName,
        relationship,
        dob,
        insurance_id: insuranceId,
        group_number: groupNumber,
        notes,
      });
    }

    setMembers(storage.getMembers());
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this person/client from your profile?')) {
      storage.deleteMember(id);
      setMembers(storage.getMembers());
    }
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200">
              {isAdvocate ? 'Advocate Client Management' : 'Household & Family Coverage'}
            </span>
            <span className="text-xs text-slate-400">
              {isAdvocate ? 'Up to 25 client dossiers' : 'Manage family members'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {isAdvocate ? (
              <>
                <Briefcase className="w-6 h-6 text-purple-600" />
                <span>Patient Advocate Client Dossiers</span>
              </>
            ) : (
              <>
                <Users className="w-6 h-6 text-blue-600" />
                <span>Household Members & Family Profiles</span>
              </>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdvocate
              ? 'Manage active client files, generate tailored appeal letters for multiple patients, and track advocate caseloads.'
              : 'Add spouses, dependent children, or elderly parents to manage appeals and medical bills under one family umbrella.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAdvocate ? '+ Add New Client' : '+ Add Family Member'}</span>
        </button>
      </div>

      {/* Plan Benefit Banner if not subscribed */}
      {!isFamily && !isAdvocate && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Family & Advocate Plans Available</span>
              <span className="text-slate-600">
                Upgrade to Family ($12/mo) for unlimited household member appeals, or Advocate ($49/mo) for 25 client dossiers.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenPricing}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shrink-0"
          >
            Explore Plans
          </button>
        </div>
      )}

      {/* Member / Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => {
          const memberCases = cases.filter((c) => c.member_id === m.id || c.member_name === m.full_name);

          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border border-slate-200">
                    {m.relationship}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {m.relationship !== 'self' && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{m.full_name}</h3>
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  {m.dob && <div>DOB: <span className="text-slate-800 font-medium">{m.dob}</span></div>}
                  {m.insurance_id && <div>Member ID: <span className="font-mono text-slate-800">{m.insurance_id}</span></div>}
                  {m.group_number && <div>Group #: <span className="font-mono text-slate-800">{m.group_number}</span></div>}
                </div>

                {m.notes && (
                  <p className="text-xs text-slate-600 mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {m.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                  <span>{memberCases.length} Active Appeals</span>
                </span>

                <button
                  onClick={() => onStartAppealForMember(m)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>New Appeal</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingMember ? 'Edit Profile' : isAdvocate ? 'Add Client Dossier' : 'Add Household Member'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Taylor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as HouseholdMember['relationship'])}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="spouse">Spouse</option>
                    <option value="child">Child / Dependent</option>
                    <option value="parent">Parent</option>
                    <option value="client">Client (Advocate)</option>
                    <option value="self">Self</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Insurance Member ID</label>
                  <input
                    type="text"
                    placeholder="e.g. UHC-992810"
                    value={insuranceId}
                    onChange={(e) => setInsuranceId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Group Number</label>
                  <input
                    type="text"
                    placeholder="e.g. GRP-4401"
                    value={groupNumber}
                    onChange={(e) => setGroupNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical / Policy Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on coverage or medical conditions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
