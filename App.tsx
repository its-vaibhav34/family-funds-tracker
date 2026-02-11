
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FundProvider } from './context/FundContext';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Admin from './pages/Admin';
import History from './pages/History';
import { LayoutDashboard, ReceiptText, Settings, History as HistoryIcon, PlusCircle } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-50 text-blue-700 font-medium' 
        : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm">FF</span>
            FamilyFund
          </h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/ledger" icon={ReceiptText} label="Ledger" active={location.pathname === '/ledger'} />
          <SidebarItem to="/history" icon={HistoryIcon} label="Audit History" active={location.pathname === '/history'} />
          <SidebarItem to="/admin" icon={Settings} label="Admin Controls" active={location.pathname === '/admin'} />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium px-2">v1.0.0 Production</p>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50">
        <Link to="/" className="p-2 text-slate-600"><LayoutDashboard size={24} /></Link>
        <Link to="/ledger" className="p-2 text-slate-600"><ReceiptText size={24} /></Link>
        <Link to="/history" className="p-2 text-slate-600"><HistoryIcon size={24} /></Link>
        <Link to="/admin" className="p-2 text-slate-600"><Settings size={24} /></Link>
      </nav>

      {/* Header - Mobile */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <h1 className="font-bold text-slate-900">FamilyFund</h1>
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs">FF</div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <FundProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </MainLayout>
      </Router>
    </FundProvider>
  );
}
