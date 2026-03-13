import React, { useState } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import DocumentVault from './components/DocumentVault.tsx';
import AICopilot from './components/AICopilot.tsx';
import TaxPlanner from './components/TaxPlanner.tsx';
import { ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'vault': return <DocumentVault />;
      case 'copilot': return <AICopilot />;
      case 'planner': return <TaxPlanner />;
      case 'security': 
        return (
          <div className="max-w-4xl mx-auto space-y-8 py-10">
            <div className="bg-indigo-600 p-10 rounded-3xl text-white relative overflow-hidden">
               <ShieldAlert className="absolute top-0 right-0 w-64 h-64 -translate-y-12 translate-x-12 opacity-10" />
               <h2 className="text-3xl font-black mb-4">Bank-Grade Security</h2>
               <p className="text-lg opacity-90 max-w-xl">
                 Your financial data is protected by the highest standards of cybersecurity. We use AES-256 at-rest and TLS 1.3 in-transit encryption.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Zero-Knowledge Architecture', desc: 'We cannot see your raw documents. Only the AI parses them in a sandboxed environment.' },
                { title: 'Data Isolation', desc: 'Each user has a dedicated secure vault. No data is used for training the base AI model.' },
                { title: 'Audit Logging', desc: 'Every data access event is logged and visible to you. Full transparency on data lifecycle.' },
                { title: 'Automated Expiry', desc: 'Financial documents are automatically deleted after 30 days unless specified otherwise.' }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;