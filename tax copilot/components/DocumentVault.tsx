import React, { useState } from 'react';
import { 
  Upload, FileText, CheckCircle2, Clock, AlertCircle, Search, 
  Trash2, Eye, ShieldCheck, Info, FileSearch
} from 'lucide-react';
import { analyzeDocument } from '../services/geminiService.ts';

interface ProcessedDoc {
  id: string;
  name: string;
  type: string;
  status: 'processing' | 'ready' | 'error';
  summary: string;
  data: string;
  recommendation: string;
  date: string;
}

const DocumentVault: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<ProcessedDoc[]>([
    {
      id: '1',
      name: 'Form16_FY23-24.pdf',
      type: 'Form 16',
      status: 'ready',
      summary: 'Part A & B consolidated for current employer.',
      data: 'Gross: ₹12.5L, TDS: ₹1.4L',
      recommendation: 'Verify TDS with Form 26AS.',
      date: '2024-05-20'
    },
    {
      id: '2',
      name: 'HDFC_Statement_Q2.pdf',
      type: 'Bank Statement',
      status: 'ready',
      summary: 'Interest income and major investments detected.',
      data: 'Int: ₹12,400',
      recommendation: 'Declare under Income from Other Sources.',
      date: '2024-10-15'
    }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<ProcessedDoc | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Convert to base64 for Gemini
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const analysis = await analyzeDocument(base64, file.type, file.name);
      
      if (analysis) {
        const newDoc: ProcessedDoc = {
          id: Date.now().toString(),
          name: file.name,
          type: analysis.docType || 'Unknown',
          status: 'ready',
          summary: analysis.summary || 'Processed successfully.',
          data: analysis.extractedData || 'Data extracted.',
          recommendation: analysis.recommendations || 'Proceed with filing.',
          date: new Date().toISOString().split('T')[0]
        };
        setDocuments(prev => [newDoc, ...prev]);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
      {/* List Area */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-2xl border border-dashed border-indigo-200 text-center relative group hover:bg-indigo-50/50 transition-colors">
          <input 
            type="file" 
            onChange={handleFileUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.png,.jpg,.jpeg,.csv"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">Upload Indian Tax Documents</p>
              <p className="text-sm text-slate-500">Drag & drop Form 16, AIS, Bank Statements, or Investment Proofs</p>
            </div>
            <div className="flex items-center gap-6 mt-4">
               <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Bank-Grade Encryption
               </div>
               <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  Auto-Expiry in 30 Days
               </div>
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-center items-center justify-center flex-col gap-3">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-bold text-indigo-600">AI Analyzer at work...</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col flex-1">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Your Secure Vault</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border-none text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Document Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500 px-2.5 py-1 bg-slate-100 rounded-lg">{doc.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">PROCESSED</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{doc.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Area */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-0">
          <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-100">
            <FileSearch className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">AI Deep Analysis</h3>
          </div>

          {selectedDoc ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selectedDoc.name}</p>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{selectedDoc.type}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                  <Info className="w-3 h-3" /> AI Summary
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedDoc.summary}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-800 mb-2">Key Extracted Data</p>
                  <p className="text-sm text-slate-600 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    {selectedDoc.data}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 mb-2">CA Recommendations</p>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                      {selectedDoc.recommendation}
                    </li>
                  </ul>
                </div>
              </div>

              <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                Download CA-Verified PDF
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <FileSearch className="w-16 h-16 mb-4" />
              <p className="text-sm font-medium">Select a document from the vault<br/>to see AI-powered analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVault;