import React, { useState, useMemo } from 'react';
import { IndianRupee, Calculator, TrendingDown, Check, Info, Sparkles, Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import { NEW_REGIME_SLABS, OLD_REGIME_SLABS, STANDARD_DEDUCTION_NEW, STANDARD_DEDUCTION_OLD } from '../constants.ts';
import { getTaxAnalysis } from '../services/geminiService.ts';

const TaxPlanner: React.FC = () => {
  const [grossIncome, setGrossIncome] = useState<number>(1500000);
  const [investments80C, setInvestments80C] = useState<number>(150000);
  const [healthIns80D, setHealthIns80D] = useState<number>(25000);
  const [hraExemption, setHraExemption] = useState<number>(0);
  
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateTax = (income: number, slabs: { limit: number, rate: number }[]) => {
    let tax = 0;
    let prevLimit = 0;
    for (const slab of slabs) {
      if (income > prevLimit) {
        const taxableInSlab = Math.min(income, slab.limit) - prevLimit;
        tax += taxableInSlab * slab.rate;
        prevLimit = slab.limit;
      } else {
        break;
      }
    }
    const cess = tax * 0.04;
    return { tax, cess, total: tax + cess };
  };

  const results = useMemo(() => {
    const income = Number(grossIncome) || 0;
    const inv80C = Math.min(150000, Number(investments80C) || 0);
    const ins80D = Math.min(25000, Number(healthIns80D) || 0); // Assuming individual coverage limit
    const hra = Number(hraExemption) || 0;

    // New Regime FY 24-25 (Standard deduction 75k)
    const taxableNew = Math.max(0, income - STANDARD_DEDUCTION_NEW);
    const taxNew = calculateTax(taxableNew, NEW_REGIME_SLABS);
    
    // Rebate for New Regime (7L taxable income after std deduction)
    const effectiveTotalNew = taxableNew <= 700000 ? 0 : taxNew.total;

    // Old Regime (Standard deduction 50k)
    const totalDeductions = inv80C + ins80D + hra + STANDARD_DEDUCTION_OLD;
    const taxableOld = Math.max(0, income - totalDeductions);
    const taxOld = calculateTax(taxableOld, OLD_REGIME_SLABS);
    
    // Rebate for Old Regime (5L taxable income)
    const effectiveTotalOld = taxableOld <= 500000 ? 0 : taxOld.total;

    return {
      income,
      new: { taxable: taxableNew, total: effectiveTotalNew },
      old: { taxable: taxableOld, total: effectiveTotalOld, deductions: totalDeductions, appliedDeductions: totalDeductions - STANDARD_DEDUCTION_OLD },
      savings: Math.abs(effectiveTotalNew - effectiveTotalOld),
      best: effectiveTotalNew <= effectiveTotalOld ? 'NEW' : 'OLD'
    };
  }, [grossIncome, investments80C, healthIns80D, hraExemption]);

  const generateAIReport = async () => {
    setIsGenerating(true);
    const report = await getTaxAnalysis({
      grossIncome: results.income,
      investments80C,
      healthIns80D,
      hraExemption,
      bestRegime: results.best,
      savings: results.savings
    });
    setAiReport(report || "Could not generate report.");
    setIsGenerating(false);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const val = value === '' ? 0 : parseFloat(value);
    setter(isNaN(val) ? 0 : val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto pb-20">
      {/* Inputs */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Tax Parameters
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">AY 2025-26</span>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Annual Gross Salary</label>
              <div className="relative group">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="number" 
                  value={grossIncome === 0 ? '' : grossIncome}
                  onChange={(e) => handleInputChange(setGrossIncome, e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:text-slate-300 shadow-inner"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">80C Investments</label>
                <span className="text-[11px] text-indigo-600 font-black">Max ₹1.5L</span>
              </div>
              <input 
                type="range" min="0" max="150000" step="5000"
                value={investments80C}
                onChange={(e) => setInvestments80C(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-indigo-700">₹{investments80C.toLocaleString()}</span>
                <input 
                  type="number"
                  value={investments80C === 0 ? '' : investments80C}
                  onChange={(e) => handleInputChange(setInvestments80C, e.target.value)}
                  className="w-28 px-3 py-1.5 bg-slate-100 border border-slate-200 text-xs font-black text-slate-900 text-right rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Health Insurance (80D)</label>
              <div className="relative">
                <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="number" 
                  value={healthIns80D === 0 ? '' : healthIns80D}
                  onChange={(e) => handleInputChange(setHealthIns80D, e.target.value)}
                  placeholder="Up to ₹25,000"
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">HRA Exemption</label>
              <div className="relative">
                <MinusCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="number" 
                  value={hraExemption === 0 ? '' : hraExemption}
                  onChange={(e) => handleInputChange(setHraExemption, e.target.value)}
                  placeholder="HRA components"
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 border border-indigo-500 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-6 h-6" />
              <h4 className="font-black text-lg">Optimization Advice</h4>
            </div>
            <p className="text-base font-medium opacity-90 leading-relaxed mb-8">
              Based on your inputs, the <strong className="bg-white text-indigo-700 px-2 py-0.5 rounded-md">{results.best} Regime</strong> is significantly better for you.
            </p>
            <button 
              onClick={generateAIReport}
              disabled={isGenerating || results.income === 0}
              className="w-full py-4 bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              AI CA Analysis
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* New Regime Card */}
          <div className={`relative p-10 rounded-[32px] border-2 transition-all ${
            results.best === 'NEW' ? 'bg-white border-indigo-600 shadow-2xl scale-[1.03]' : 'bg-slate-50 border-slate-200 opacity-80'
          }`}>
            {results.best === 'NEW' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-700 text-white text-xs font-black py-1.5 px-6 rounded-full flex items-center gap-2 uppercase tracking-widest shadow-xl">
                <Check className="w-4 h-4" /> Recommended
              </div>
            )}
            <div className="mb-10">
              <h4 className="text-2xl font-black text-slate-900 mb-2">New Regime</h4>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Default Option FY 2024-25</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-xs font-black text-slate-500 uppercase mb-2">Taxable Income</p>
                <p className="text-3xl font-black text-slate-900">₹{results.new.taxable.toLocaleString()}</p>
              </div>
              <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                <p className="text-xs font-black text-indigo-400 uppercase mb-2">Final Tax Liability</p>
                <p className="text-5xl font-black text-indigo-700">₹{results.new.total.toLocaleString()}</p>
              </div>
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 uppercase tracking-tight">Std. Deduction</span>
                  <span className="text-emerald-700">₹75,000</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 uppercase tracking-tight">87A Rebate</span>
                  <span className={results.new.taxable <= 700000 ? 'text-emerald-700' : 'text-slate-400'}>
                    {results.new.taxable <= 700000 ? 'Applied' : 'Not Eligible'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Old Regime Card */}
          <div className={`relative p-10 rounded-[32px] border-2 transition-all ${
            results.best === 'OLD' ? 'bg-white border-indigo-600 shadow-2xl scale-[1.03]' : 'bg-slate-50 border-slate-200 opacity-80'
          }`}>
             {results.best === 'OLD' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-700 text-white text-xs font-black py-1.5 px-6 rounded-full flex items-center gap-2 uppercase tracking-widest shadow-xl">
                <Check className="w-4 h-4" /> Recommended
              </div>
            )}
            <div className="mb-10">
              <h4 className="text-2xl font-black text-slate-900 mb-2">Old Regime</h4>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Traditional Exemptions</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-xs font-black text-slate-500 uppercase mb-2">Taxable Income</p>
                <p className="text-3xl font-black text-slate-900">₹{results.old.taxable.toLocaleString()}</p>
              </div>
              <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                <p className="text-xs font-black text-indigo-400 uppercase mb-2">Final Tax Liability</p>
                <p className="text-5xl font-black text-indigo-700">₹{results.old.total.toLocaleString()}</p>
              </div>
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 uppercase tracking-tight">Std. Deduction</span>
                  <span className="text-emerald-700">₹50,000</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 uppercase tracking-tight">Investments & HRA</span>
                  <span className="text-emerald-700">₹{results.old.appliedDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        {aiReport && (
          <div className="bg-white rounded-[40px] border border-indigo-100 p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">CA Strategy Report</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personalized AI Insights</p>
                </div>
              </div>
              <button 
                onClick={() => setAiReport(null)}
                className="text-xs font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
              >
                Dismiss
              </button>
            </div>
            <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-inner">
              {aiReport.split('\n').map((para, i) => (
                <p key={i} className="text-base text-slate-800 font-medium leading-relaxed mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-black text-indigo-500 uppercase tracking-widest">
              <Info className="w-4 h-4" />
              Verified for Assessment Year 2025-26
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-8 rounded-3xl flex gap-6 items-start border border-indigo-200">
          <div className="bg-white p-2.5 rounded-xl shadow-sm">
            <Info className="w-6 h-6 text-indigo-700 shrink-0" />
          </div>
          <div>
            <p className="text-base font-black text-indigo-900 mb-2 uppercase tracking-tight">Crucial Budget 2024 Notice</p>
            <p className="text-sm text-indigo-800 font-medium leading-relaxed opacity-90">
              Standard deduction is significantly enhanced to <strong>₹75,000</strong> for salaried taxpayers opting for the New Regime. Additionally, the rebate threshold u/s 87A effectively makes income up to <strong>₹7.75 Lakhs</strong> tax-free under the revised New Regime slabs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxPlanner;