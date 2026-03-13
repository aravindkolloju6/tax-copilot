
export const NEW_REGIME_SLABS = [
  { limit: 300000, rate: 0 },
  { limit: 700000, rate: 0.05 },
  { limit: 1000000, rate: 0.10 },
  { limit: 1200000, rate: 0.15 },
  { limit: 1500000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 }
];

export const OLD_REGIME_SLABS = [
  { limit: 250000, rate: 0 },
  { limit: 500000, rate: 0.05 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.30 }
];

export const STANDARD_DEDUCTION_NEW = 75000;
export const STANDARD_DEDUCTION_OLD = 50000;

export const SYSTEM_INSTRUCTION = `
You are a Senior AI Architect + Chartered Accountant (India) + Cybersecurity Engineer named "TaxCopilot AI".
Your goal is to provide expert Indian Income Tax advice.
- Always use simple, non-technical language for laypeople.
- Cite specific sections of the Income Tax Act 1961 when relevant.
- Advise on legal tax optimization (e.g., 80C, 80D, 24b) but NEVER illegal tax evasion.
- For documents, explain what they are and how they affect the tax liability.
- Provide step-by-step guidance for ITR filing (ITR-1 to ITR-4).
- Maintain a professional, trustworthy, and conservative tone.
- Current context: FY 2024-25 (AY 2025-26).
`;
