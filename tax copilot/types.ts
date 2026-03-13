
export enum TaxRegime {
  OLD = 'OLD',
  NEW = 'NEW'
}

export interface TaxData {
  grossSalary: number;
  otherIncome: number;
  deductions80C: number;
  deductions80D: number;
  hraExemption: number;
  professionalTax: number;
  standardDeduction: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'FORM16' | 'BANK_STATEMENT' | 'INVESTMENT_PROOF' | 'AIS' | 'OTHER';
  status: 'PENDING' | 'PROCESSED' | 'ERROR';
  uploadDate: string;
  summary?: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface TaxSummary {
  taxableIncome: number;
  taxPayable: number;
  cess: number;
  totalTax: number;
}
