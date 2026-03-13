
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, IndianRupee, Landmark, Calendar, BellRing } from 'lucide-react';

const data = [
  { name: 'Apr', income: 150000, tax: 15000 },
  { name: 'May', income: 165000, tax: 16500 },
  { name: 'Jun', income: 155000, tax: 15500 },
  { name: 'Jul', income: 180000, tax: 18000 },
  { name: 'Aug', income: 150000, tax: 15000 },
  { name: 'Sep', income: 210000, tax: 21000 },
];

const pieData = [
  { name: 'Salary', value: 75, color: '#4f46e5' },
  { name: 'Capital Gains', value: 15, color: '#10b981' },
  { name: 'Other Sources', value: 10, color: '#f59e0b' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Gross Income', value: '₹18,50,000', icon: IndianRupee, change: '+12%', up: true },
          { label: 'Estimated Tax Liability', value: '₹2,15,400', icon: Landmark, change: '-4%', up: false },
          { label: 'TDS Deducted', value: '₹1,85,000', icon: TrendingUp, change: '+8%', up: true },
          { label: 'Potential Savings', value: '₹45,000', icon: IndianRupee, change: 'Target', up: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <stat.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Monthly Cash Flow & Tax Projection</h3>
            <select className="bg-slate-50 border-none text-xs font-medium rounded-lg px-3 py-1 text-slate-500 focus:ring-2 focus:ring-indigo-500">
              <option>FY 2024-25</option>
              <option>FY 2023-24</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#4f46e5" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Income Distribution</h3>
          <div className="h-[200px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Compliance Calendar
          </h3>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
             <BellRing className="w-3 h-3" /> Notifications Enabled
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { date: 'June 15', task: 'Advance Tax (1st Installment)', status: 'COMPLETED', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { date: 'Sept 15', task: 'Advance Tax (2nd Installment)', status: 'COMPLETED', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { date: 'Dec 15', task: 'Advance Tax (3rd Installment)', status: 'UPCOMING', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { date: 'Mar 15', task: 'Advance Tax (Final)', status: 'PENDING', color: 'bg-slate-50 text-slate-500 border-slate-100' },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-xl border-l-4 transition-transform hover:scale-[1.02] cursor-default ${item.color}`}>
              <p className="text-xs font-bold uppercase opacity-80 mb-1">{item.date}</p>
              <p className="text-sm font-semibold mb-2">{item.task}</p>
              <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${item.status === 'UPCOMING' ? 'bg-indigo-600 text-white' : 'bg-white/50'}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
