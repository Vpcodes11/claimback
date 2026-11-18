import { describe, it, expect } from 'vitest';
import { letterGenerator } from '../src/services/letterGenerator';
import { Case } from '../src/types';

describe('Letter Generator Service', () => {
  const mockCase: Case = {
    id: 'test-case-01',
    user_id: 'usr-01',
    member_id: 'mem-01',
    member_name: 'Alex Johnson',
    insurer: 'Aetna Health Inc.',
    plan_type: 'employer_self_funded',
    state: 'CA',
    claim_no: 'CLM-778899',
    service: 'Spinal Disc Arthroplasty (CPT 22857)',
    cpt_code: '22857',
    dos: '2024-10-10',
    amount: 14500.0,
    denial_reason: 'Service denied as not medically necessary according to CPB guidelines.',
    denial_code: 'CARC 50',
    denial_category: 'not_medically_necessary',
    route: 'standard_internal',
    status: 'draft',
    is_urgent: false,
    provider_in_network: true,
    prior_auth_requested: true,
    deadlines: {
      denial_date: '2024-10-10',
      internal_appeal_deadline: '2025-04-08',
      is_deadline_estimated: true,
      days_remaining: 140,
      urgency_status: 'normal',
    },
    notes: 'Severe radiculopathy test note',
    created_at: '2024-10-11T00:00:00Z',
    updated_at: '2024-10-11T00:00:00Z',
  };

  it('generates Level 1 internal appeal letter with ERISA and ACA statutory citations', () => {
    const letter = letterGenerator.generateAppealLetter({ caseData: mockCase });

    expect(letter.title).toContain('Medical Necessity');
    expect(letter.content_markdown).toContain('FORMAL LEVEL 1 WRITTEN APPEAL');
    expect(letter.content_markdown).toContain('ERISA § 503');
    expect(letter.content_markdown).toContain('29 C.F.R. § 2560.503-1');
    expect(letter.content_markdown).toContain('Wit v. United Behavioral Health');
    expect(letter.statutes_cited).toContain('ERISA § 503 (29 U.S.C. § 1133)');
  });

  it('seamlessly weaves Plan Document SPD clauses into Section 3', () => {
    const planClause = 'Section 4.2: Covered spine services include artificial disc arthroplasty when prescribed by board certified neurosurgeons.';
    const letter = letterGenerator.generateAppealLetter({
      caseData: mockCase,
      planExcerpt: planClause,
    });

    expect(letter.content_markdown).toContain('CONFLICT WITH PLAN DOCUMENT / SUMMARY PLAN DESCRIPTION (SPD)');
    expect(letter.content_markdown).toContain(planClause);
    expect(letter.content_markdown).toContain('Firestone Tire & Rubber Co. v. Bruch');
  });

  it('triggers 72-Hour Expedited Header when case is marked urgent', () => {
    const urgentCase: Case = { ...mockCase, is_urgent: true };
    const letter = letterGenerator.generateAppealLetter({ caseData: urgentCase });

    expect(letter.content_markdown).toContain('URGENT / EXPEDITED APPEAL DEMAND (72-HOUR MANDATORY DETERMINATION');
  });

  it('generates physician Letter of Medical Necessity (LOMN) template', () => {
    const template = letterGenerator.generateDoctorLOMNTemplate(mockCase);

    expect(template.content_markdown).toContain('CONFIDENTIAL PHYSICIAN CLINICAL INSTRUCTION PACKET');
    expect(template.content_markdown).toContain('LETTER OF MEDICAL NECESSITY & PEER REBUTTAL');
    expect(template.content_markdown).toContain('Primary Diagnosis (ICD-10)');
    expect(template.content_markdown).toMatch(/conservative treatment history/i);
    expect(template.content_markdown).toMatch(/peer-to-peer/i);
  });

  it('generates formal Claim File Demand letter under 29 CFR § 2560.503-1', () => {
    const demand = letterGenerator.generateDocumentRequestLetter(mockCase);

    expect(demand.content_markdown).toContain('STATUTORY DEMAND FOR COMPLETE CLAIM FILE');
    expect(demand.content_markdown).toContain('free of charge upon request');
    expect(demand.content_markdown).toContain('Reviewer Qualifications & Specialty Credentials');
  });

  it('generates External Review (IRO) request letter', () => {
    const iro = letterGenerator.generateExternalReviewLetter(mockCase);

    expect(iro.content_markdown).toContain('REQUEST FOR INDEPENDENT EXTERNAL REVIEW (IRO)');
    expect(iro.content_markdown).toContain('ACA SECTION 2719');
    expect(iro.content_markdown).toContain('45 C.F.R. § 147.136');
  });

  it('generates Phone Script with 5 progressive escalation phases', () => {
    const script = letterGenerator.getPhoneScript(mockCase);

    expect(script.steps.length).toBe(5);
    expect(script.steps[0].phase).toContain('First-Line Representative');
    expect(script.steps[3].phase).toContain('Peer-to-Peer Review');
  });
});
