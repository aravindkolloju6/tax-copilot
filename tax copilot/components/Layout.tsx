
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Calculator, 
  Settings,
  Bell,
  User,
  X,
  Info,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Key
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'alert' | 'success';
  time: string;
  isRead: boolean;
}

// Fix: Use AIStudio type directly and make it optional to match potential environmental declarations
// This resolves the "identical modifiers" and "subsequent property declarations" errors.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Advance Tax Reminder',
      description: 'The 3rd installment of Advance Tax for FY 24-25 is due by Dec 15. Check your tax planner.',
      type: 'alert',
      time: '2 hours ago',
      isRead: false
    },
    {
      id: '2',
      title: 'New Budget 2024 Update',
      description: 'Standard deduction for the New Regime has been increased to ₹75,000. Your liability is updated.',
      type: 'info',
      time: '1 day ago',
      isRead: false
    },
    {
      id: '3',
      title: 'Document Processed',
      description: 'Your HDFC Bank Statement for Q2 has been successfully analyzed by AI Copilot.',
      type: 'success',
      time: '3 days ago',
      isRead: true
    }
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleChangeKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vault', label: 'Document Vault', icon: FileText },
    { id: 'copilot', label: 'AI Copilot', icon: MessageSquare },
    { id: 'planner', label: 'Tax Planner', icon: Calculator },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">TaxCopilot AI</h1>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Health Score</p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl font-bold text-indigo-600">82/100</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+4.2%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 md:hidden">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">TaxCopilot</h1>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <button 
              onClick={handleChangeKey}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Key className="w-3.5 h-3.5" /> Change API Key
            </button>
            
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-600 relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                    <button onClick={markAllAsRead} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`mt-1 p-1.5 rounded-lg shrink-0 ${
                            n.type === 'alert' ? 'bg-rose-50 text-rose-600' : 
                            n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {n.type === 'alert' ? <AlertCircle className="w-3.5 h-3.5" /> : 
                             n.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 mb-0.5">{n.title}</p>
                            <p className="text-[11px] text-slate-500 leading-tight mb-1">{n.description}</p>
                            <span className="text-[10px] font-medium text-slate-400">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200"></div>
            
            <button className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">JD</div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800">Jai Dev</p>
                <p className="text-[10px] font-medium text-slate-400">Pro Tier</p>
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// Fix: Add default export to resolve App.tsx import error
export default Layout;
