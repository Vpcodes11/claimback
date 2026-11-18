import { describe, it, expect, beforeEach } from 'vitest';
import { storage, calculateDeadlines } from '../src/services/storage';

describe('Storage & Deadlines Calculation Engine', () => {
  beforeEach(() => {
    storage.resetAllData();
  });

  it('calculates standard 180-day deadline for ERISA/ACA plans', () => {
    const todayStr = '2024-10-01';
    const deadlines = calculateDeadlines(todayStr, false, 'employer_self_funded');

    expect(deadlines.is_deadline_estimated).toBe(true);
    // 180 days after 2024-10-01 is 2025-03-30
    expect(deadlines.internal_appeal_deadline).toContain('2025-03');
  });

  it('calculates 60-day deadline for Medicare Advantage plans', () => {
    const todayStr = '2024-10-01';
    const deadlines = calculateDeadlines(todayStr, false, 'medicare_advantage');

    expect(deadlines.internal_appeal_deadline).toContain('2024-11');
  });

  it('calculates 3-day (72-hour) critical deadline for urgent care', () => {
    const todayStr = '2024-10-01';
    const deadlines = calculateDeadlines(todayStr, true, 'employer_self_funded');

    expect(deadlines.internal_appeal_deadline).toBe('2024-10-04');
    expect(deadlines.urgency_status).toBe('expired'); // because 2024-10-04 is in past relative to current year
  });

  it('adds, retrieves, and updates cases in storage', () => {
    const initialCases = storage.getCases();
    const countBefore = initialCases.length;

    const newCase = storage.addCase({
      user_id: 'usr-default-01',
      member_id: 'mem-01',
      member_name: 'Jordan Taylor',
      insurer: 'Humana',
      plan_type: 'medicare_advantage',
      state: 'FL',
      claim_no: 'CLM-TEST-001',
      service: 'Physical Therapy 12 Sessions',
      dos: '2024-11-01',
      amount: 1800.0,
      denial_reason: 'Benefit cap reached',
      denial_category: 'excluded_service',
      route: 'standard_internal',
      status: 'draft',
      is_urgent: false,
      provider_in_network: true,
      prior_auth_requested: true,
      deadlines: calculateDeadlines('2024-11-01', false, 'medicare_advantage'),
      notes: 'Test case note',
    });

    expect(newCase.id).toBeDefined();
    expect(storage.getCases().length).toBe(countBefore + 1);

    // Update status
    storage.updateCase(newCase.id, { status: 'approved' });
    const updated = storage.getCaseById(newCase.id);
    expect(updated?.status).toBe('approved');
  });

  it('adds call logs and associates them with cases', () => {
    const log = storage.addCallLog({
      case_id: 'case-mri-01',
      timestamp: new Date().toISOString(),
      rep_name: 'Agent Smith',
      rep_id: 'ID-007',
      reference_no: 'REF-12345',
      duration_mins: 12,
      notes: 'Verified fax number',
      call_checklist: {
        confirmed_receipt_of_appeal: true,
        requested_claim_file: true,
        asked_for_reviewer_credentials: true,
        inquired_about_peer_to_peer: false,
        recorded_fax_or_portal_target: true,
      },
    });

    expect(log.id).toBeDefined();
    const caseLogs = storage.getCallLogs('case-mri-01');
    expect(caseLogs.some((l) => l.rep_name === 'Agent Smith')).toBe(true);
  });

  it('records outcomes and updates case status automatically', () => {
    const outcome = storage.recordOutcome({
      case_id: 'case-mri-01',
      insurer: 'Aetna Health Inc.',
      denial_category: 'not_medically_necessary',
      service: 'MRI Lumbar Spine',
      result: 'won_full',
      amount_originally_denied: 2150.0,
      amount_recovered: 2150.0,
      turnaround_days: 21,
      resolution_date: '2024-11-10',
      notes: 'Overturned by medical director after doctor LOMN',
      consented_to_aggregate: true,
    });

    expect(outcome.id).toBeDefined();
    const targetCase = storage.getCaseById('case-mri-01');
    expect(targetCase?.status).toBe('approved');
  });
});
