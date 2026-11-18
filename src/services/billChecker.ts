import { Bill, BillAuditFlag, BillLineItem } from '../types';

export class BillCheckerService {
  /**
   * Run an automated audit on line items comparing bill to EOB
   */
  auditBill(
    providerName: string,
    billAccountNo: string,
    billDate: string,
    totalBilled: number,
    eobPatientResponsibility: number,
    lineItems: BillLineItem[]
  ): Bill {
    const flags: BillAuditFlag[] = [];
    const seenCpts: Record<string, BillLineItem[]> = {};

    // Group items by CPT to detect duplicates
    for (const item of lineItems) {
      const code = item.cpt_hcpcs.trim().toUpperCase();
      if (!seenCpts[code]) {
        seenCpts[code] = [];
      }
      seenCpts[code].push(item);
    }

    // 1. Detect Duplicate Charges
    for (const [code, items] of Object.entries(seenCpts)) {
      if (items.length > 1 && code !== 'MISC' && code !== 'REV-0250') {
        const dupAmount = items.slice(1).reduce((sum, it) => sum + it.billed_amount, 0);
        flags.push({
          id: `flag-dup-${code}`,
          severity: 'high',
          type: 'duplicate_charge',
          title: `Duplicate Charge Detected: ${code}`,
          description: `Code ${code} appears ${items.length} times on the same statement without standard repeat modifier (Modifier 76/77). Duplicate charge of $${dupAmount.toFixed(2)} should be dismissed.`,
          impact_amount: dupAmount,
          recommended_action: 'Request provider immediately reverse duplicate line item from patient ledger.',
          rule_reference: 'CMS Medicare Claims Processing Manual, Pub. 100-04, Ch. 1, § 10.1.4',
        });
      }
    }

    // 2. Check for Balance Billing / No Surprises Act Violations
    for (const item of lineItems) {
      const descLower = item.description.toLowerCase();
      if (
        descLower.includes('out-of-network') ||
        descLower.includes('emergency') ||
        descLower.includes('surcharge') ||
        descLower.includes('anesthesia') ||
        descLower.includes('pathology') ||
        descLower.includes('radiology')
      ) {
        if (item.patient_responsibility && item.patient_responsibility > 500) {
          flags.push({
            id: `flag-nsa-${item.id}`,
            severity: 'high',
            type: 'balance_billing_violation',
            title: `Potential Balance Billing Violation: ${item.description}`,
            description: `Line item '${item.description}' has patient responsibility of $${item.patient_responsibility.toFixed(2)}. Under the federal No Surprises Act, emergency services and ancillary providers at in-network facilities cannot balance bill above in-network cost sharing.`,
            impact_amount: item.patient_responsibility,
            recommended_action: 'Submit formal No Surprises Act Notice of Dispute citing 42 U.S.C. § 300gg-111.',
            rule_reference: 'No Surprises Act, Consolidated Appropriations Act 2021 & 45 CFR § 149.410',
          });
        }
      }
    }

    // 3. Check for EOB Patient Responsibility Mismatch
    const totalPatientResp = lineItems.reduce((acc, item) => acc + (item.patient_responsibility || 0), 0);
    if (totalPatientResp > eobPatientResponsibility + 50) {
      const discrepancy = totalPatientResp - eobPatientResponsibility;
      flags.push({
        id: 'flag-eob-discrepancy',
        severity: 'high',
        type: 'eob_mismatch',
        title: `Bill Exceeds Insurer EOB Patient Responsibility by $${discrepancy.toFixed(2)}`,
        description: `Your insurance Explanation of Benefits explicitly calculates your patient responsibility as $${eobPatientResponsibility.toFixed(2)}, yet the provider is billing you $${totalPatientResp.toFixed(2)}. The provider may be illegally billing you for contracted network discount write-offs.`,
        impact_amount: discrepancy,
        recommended_action: 'Demand billing office reconcile ledger directly against insurer payment remit.',
        rule_reference: 'Participating Provider Agreement Section 8 & State Balance Billing Statutes',
      });
    }

    // 4. Check for Unitemized Blanket Charges
    for (const item of lineItems) {
      if (
        item.cpt_hcpcs.startsWith('REV') ||
        item.description.toLowerCase().includes('lump sum') ||
        item.description.toLowerCase().includes('unitemized') ||
        item.description.toLowerCase().includes('supplies') ||
        item.description.toLowerCase().includes('pharmacy')
      ) {
        if (item.billed_amount > 1000) {
          flags.push({
            id: `flag-unitem-${item.id}`,
            severity: 'medium',
            type: 'unitemized_blanket_charge',
            title: `Unitemized Bulk Charge: ${item.description}`,
            description: `The line item '${item.description}' is billed as a lump sum of $${item.billed_amount.toFixed(2)} without itemized NDC pharmaceutical codes, dosage, or individual HCPCS units.`,
            impact_amount: Math.round(item.billed_amount * 0.7),
            recommended_action: 'Submit a formal written demand for a fully itemized hospital bill.',
            rule_reference: 'HIPAA Right of Accounting (45 CFR § 164.528) & CMS Hospital Price Transparency',
          });
        }
      }
    }

    // Calculate total potential savings
    const potential_savings = flags.reduce((acc, f) => acc + f.impact_amount, 0);

    return {
      id: `bill-${Date.now()}`,
      provider_name: providerName,
      bill_account_no: billAccountNo,
      bill_date: billDate,
      total_billed: totalBilled,
      eob_patient_responsibility: eobPatientResponsibility,
      extracted_line_items: lineItems,
      flags,
      potential_savings,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Generate formal itemized bill request with HIPAA & FDCPA statutory notice
   */
  generateItemizedBillRequest(bill: Bill, patientName: string): string {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `**DATE:** ${today}

**VIA CERTIFIED MAIL & PATIENT BILLING PORTAL**

**TO:**
${bill.provider_name}
Patient Financial Services / Billing Department
Account Reference: ${bill.bill_account_no}

**SUBJECT: FORMAL DEMAND FOR COMPREHENSIVE ITEMIZED BILL & REVENUE CODE AUDIT**
* **Patient Name:** ${patientName}
* **Account Number:** ${bill.bill_account_no}
* **Statement Date:** ${bill.bill_date}
* **Current Amount Claimed Due:** $${bill.total_billed.toLocaleString('en-US', { minimumFractionDigits: 2 })}

Dear Billing Director:

I am writing to formally dispute the current summary billing statement rendered for Account #${bill.bill_account_no}. The statement provided does not contain sufficient line-item detail to verify the accuracy of the charges, nor does it reconcile with the Explanation of Benefits (EOB) issued by my health insurer.

Pursuant to federal hospital billing compliance regulations, state patient bill of rights, and HIPAA Privacy Rules (45 C.F.R. § 164.524), I hereby demand that you provide a **complete, unredacted, itemized billing statement** containing:

1. **Procedural Coding:** The exact 5-digit CPT / HCPCS codes for every medical service, procedure, and intervention.
2. **Revenue Codes:** Standard CMS 4-digit UB-04 revenue codes associated with each charge.
3. **Pharmaceutical Itemization:** For every drug or IV medication administered, the 11-digit National Drug Code (NDC), exact brand or generic drug name, dosage, strength, and unit quantity.
4. **Anatomical & Billing Modifiers:** Any two-digit modifiers (such as 25, 59, 76, 78) submitted to the insurer.
5. **Contractual Adjustments:** Explicit accounting of all payments received from the insurance plan and all contractual allowance write-offs required under your in-network provider agreement.

### STATUTORY CEASE-AND-DESIST NOTICE ON COLLECTIONS
Please be advised that this account is in active dispute. Under federal fair billing guidelines and the Fair Debt Collection Practices Act (15 U.S.C. § 1692g), you are prohibited from:
* Referring this disputed account to third-party debt collection agencies.
* Assessing late fees, penalties, or interest charges while itemization is pending.
* Transmitting derogatory reports to any credit reporting agency (Equifax, Experian, TransUnion).

Please place this account on an immediate **Administrative Dispute Hold** and transmit the itemized breakdown within twenty (20) calendar days.

Sincerely,

________________________________________
**${patientName}**
Patient`;
  }
}

export const billChecker = new BillCheckerService();
