import { describe, it, expect } from 'vitest';
import { billChecker } from '../src/services/billChecker';
import { SAMPLE_BILLS } from '../src/data/sampleBills';
import { BillLineItem } from '../src/types';

describe('Bill & EOB Checker Service', () => {
  it('detects duplicate charges on same CPT without modifier 76', () => {
    const lineItems: BillLineItem[] = [
      {
        id: 'it-1',
        cpt_hcpcs: '71046',
        description: 'Chest X-Ray',
        date_of_service: '2024-10-15',
        billed_amount: 850.0,
        status: 'valid',
      },
      {
        id: 'it-2',
        cpt_hcpcs: '71046',
        description: 'Chest X-Ray Duplicate',
        date_of_service: '2024-10-15',
        billed_amount: 850.0,
        status: 'error',
      },
    ];

    const audited = billChecker.auditBill(
      'Metro Hospital',
      'ACC-100',
      '2024-10-16',
      1700.0,
      200.0,
      lineItems
    );

    const dupFlag = audited.flags.find((f) => f.type === 'duplicate_charge');
    expect(dupFlag).toBeDefined();
    expect(dupFlag?.impact_amount).toBe(850.0);
    expect(dupFlag?.rule_reference).toContain('CMS');
  });

  it('detects illegal balance billing under No Surprises Act', () => {
    const sample = SAMPLE_BILLS[0];
    const nsaFlag = sample.flags.find((f) => f.type === 'balance_billing_violation');

    expect(nsaFlag).toBeDefined();
    expect(nsaFlag?.rule_reference).toContain('No Surprises Act');
    expect(nsaFlag?.impact_amount).toBeGreaterThan(0);
  });

  it('detects when bill exceeds EOB patient responsibility', () => {
    const sample = SAMPLE_BILLS[0];
    const eobFlag = sample.flags.find((f) => f.type === 'eob_mismatch');

    expect(eobFlag).toBeDefined();
    expect(eobFlag?.impact_amount).toBeGreaterThan(5000);
    expect(sample.potential_savings).toBeGreaterThan(8000);
  });

  it('generates itemized bill demand letter with HIPAA & FDCPA statutory notices', () => {
    const sample = SAMPLE_BILLS[0];
    const letter = billChecker.generateItemizedBillRequest(sample, 'Jordan Taylor');

    expect(letter).toContain('FORMAL DEMAND FOR COMPREHENSIVE ITEMIZED BILL');
    expect(letter).toContain('HIPAA Privacy Rules');
    expect(letter).toContain('Fair Debt Collection Practices Act');
    expect(letter).toContain(sample.bill_account_no);
  });
});
