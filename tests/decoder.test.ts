import { describe, it, expect } from 'vitest';
import { decoder } from '../src/services/decoder';
import { SAMPLE_DENIALS } from '../src/data/sampleDenials';

describe('Denial Decoder Service', () => {
  it('correctly decodes Lumbar Spine MRI denial as "not_medically_necessary"', () => {
    const sample = SAMPLE_DENIALS[0];
    const result = decoder.decode(sample.raw_text);

    expect(result.insurer).toContain('Aetna');
    expect(result.denial_category).toBe('not_medically_necessary');
    expect(result.cpt_code).toBe('72148');
    expect(result.denied_amount).toBeGreaterThan(0);
    expect(result.estimated_win_rate).toBeGreaterThanOrEqual(70);
    expect(result.plain_english_summary).toContain('algorithm or medical director');
    expect(result.next_steps.length).toBeGreaterThan(0);
  });

  it('correctly decodes Emergency ER Appendectomy as "out_of_network" surprise bill', () => {
    const sample = SAMPLE_DENIALS[1];
    const result = decoder.decode(sample.raw_text);

    expect(result.insurer).toContain('UnitedHealthcare');
    expect(result.denial_category).toBe('out_of_network');
    expect(result.denied_amount).toBe(7200.0);
    expect(result.estimated_win_rate).toBeGreaterThanOrEqual(90);
    expect(result.playbook_explanation).toContain('No Surprises Act');
  });

  it('correctly decodes Ozempic/Biologic as "missing_prior_auth" with CARC 197', () => {
    const sample = SAMPLE_DENIALS[2];
    const result = decoder.decode(sample.raw_text);

    expect(result.insurer).toContain('Anthem');
    expect(result.denial_category).toBe('missing_prior_auth');
    expect(result.denial_code).toContain('CARC 197');
    expect(result.estimated_win_rate).toBe(76);
  });

  it('correctly decodes Knee Arthroscopy as "coding_admin_error" with NCCI modifier issues', () => {
    const sample = SAMPLE_DENIALS[3];
    const result = decoder.decode(sample.raw_text);

    expect(result.insurer).toContain('Cigna');
    expect(result.denial_category).toBe('coding_admin_error');
    expect(result.denied_amount).toBe(3200.0);
    expect(result.estimated_win_rate).toBeGreaterThanOrEqual(85);
  });

  it('correctly decodes Targeted Immunotherapy as "experimental_investigational"', () => {
    const sample = SAMPLE_DENIALS[4];
    const result = decoder.decode(sample.raw_text);

    expect(result.denial_category).toBe('experimental_investigational');
    expect(result.denied_amount).toBe(18500.0);
    expect(result.estimated_win_rate).toBe(67);
  });

  it('gracefully handles unstructured or partial user text', () => {
    const rawText = 'Blue Cross Blue Shield denied my surgery claim CLM-99120 for $4,500 because it was not medically necessary.';
    const result = decoder.decode(rawText);

    expect(result.insurer).toContain('Anthem Blue Cross');
    expect(result.claim_number).toBe('CLM-99120');
    expect(result.denial_category).toBe('not_medically_necessary');
    expect(result.denied_amount).toBe(4500.0);
  });
});
