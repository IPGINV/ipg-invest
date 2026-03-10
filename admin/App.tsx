
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Investor, 
  Transaction, 
  ViewState, 
  UserStatus, 
  TransactionType,
  PaymentIntent,
  InvestmentCycle
} from './types';
import { Icons } from './constants';

const ADMIN_AUTH_KEY = 'ipg_admin_authenticated';
const ADMIN_TOKEN_KEY = 'ipg_admin_token';

// --- Components ---

const Sidebar = ({
  activeView,
  setView,
  onOpenHost,
  onLogout
}: {
  activeView: ViewState;
  setView: (v: ViewState) => void;
  onOpenHost: () => void;
  onLogout?: () => void;
}) => {
  const navItems = [
    { id: 'DASHBOARD', label: 'Ð“Ð»Ð°Ð²Ð½Ð°Ñ', icon: <Icons.Layout /> },
    { id: 'INVESTORS', label: 'Ð˜Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ñ‹', icon: <Icons.Users /> },
    { id: 'TRANSACTIONS', label: 'Ð¢Ñ€Ð°Ð½Ð·Ð°ÐºÑ†Ð¸Ð¸', icon: <Icons.Activity /> },
    { id: 'CYCLES', label: 'Ð¦Ð¸ÐºÐ»Ñ‹', icon: <Icons.Cycles /> },
    { id: 'HOST', label: 'Host Shell', icon: <Icons.Layout />, action: onOpenHost }
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-white shadow-xl z-20">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Icons.Shield />
        </div>
        <span className="font-bold text-lg tracking-tight">AdminApp</span>
      </div>
      <nav className="flex-1 mt-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => (item.action ? item.action() : setView(item.id as ViewState))}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
              activeView === item.id 
                ? 'bg-blue-600 border-r-4 border-white' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 text-sm text-slate-400 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">A</div>
          <div>
            <p className="text-white font-medium">ÐÐ´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€</p>
            <p className="text-xs">Root-Ð´Ð¾ÑÑ‚ÑƒÐ¿</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-left"
        >
          <Icons.Logout />
          <span>Ð’Ñ‹Ñ…Ð¾Ð´</span>
        </button>
      </div>
    </div>
  );
};

const Header = ({ title, onOpenMenu }: { title: string; onOpenMenu: () => void }) => {
  const viewTitles: Record<string, string> = {
    'DASHBOARD': 'ÐŸÐ°Ð½ÐµÐ»ÑŒ ÑƒÐ¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ñ',
    'INVESTORS': 'Ð£Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð°Ð¼Ð¸',
    'TRANSACTIONS': 'Ð¡Ð¿Ð¸ÑÐ¾Ðº Ñ‚Ñ€Ð°Ð½Ð·Ð°ÐºÑ†Ð¸Ð¹',
    'CYCLES': 'Ð£Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ Ñ†Ð¸ÐºÐ»Ð°Ð¼Ð¸'
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between fixed top-0 right-0 left-64 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors flex items-center justify-center"
          title="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{viewTitles[title.toUpperCase()] || title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-blue-100">Live System</span>
        <div className="text-xs text-slate-500 font-medium italic">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </header>
  );
};

const UserProfileModal = ({ investor, onClose, onUpdate, onDelete, onAccrueYield, onConfirmDocuments, onRejectDocuments, documents = [], pendingDeposits = [], investorTransactions = [], onConfirmDeposit, apiBase }: { 
  investor: Investor, 
  onClose: () => void, 
  onUpdate: (u: Investor) => Promise<void> | void;
  onDelete?: () => Promise<void>;
  onAccrueYield?: () => Promise<{ accrued?: number } | void>;
  onConfirmDocuments?: () => Promise<void>;
  onRejectDocuments?: () => Promise<void>;
  documents?: { id: number; doc_type: string; file_url: string; status: string; uploaded_at: string }[];
  pendingDeposits?: Transaction[];
  investorTransactions?: Transaction[];
  onConfirmDeposit?: (txId: string, amount: number) => Promise<void>;
  apiBase?: string;
}) => {
  const [editedInvestor, setEditedInvestor] = useState<Investor>({ ...investor });
  const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
  const [confirmAmount, setConfirmAmount] = useState<Record<string, string>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccruing, setIsAccruing] = useState(false);

  const handleSave = async () => {
    await onUpdate(editedInvestor);
    onClose();
  };

  const handleStatusToggle = () => {
    const nextStatus = editedInvestor.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
    const newInv = { ...editedInvestor, status: nextStatus };
    setEditedInvestor(newInv);
  };

  const updateBalance = (type: 'main' | 'ghs', val: string) => {
    const numVal = parseFloat(val) || 0;
    setEditedInvestor({
      ...editedInvestor,
      balances: {
        ...editedInvestor.balances,
        [type]: numVal
      }
    });
  };

  const handleWalletChange = (index: number, val: string) => {
    const updatedWallets = [...(editedInvestor.cryptoWallets || [])];
    updatedWallets[index] = val;
    setEditedInvestor({ ...editedInvestor, cryptoWallets: updatedWallets });
  };

  const addWallet = () => {
    setEditedInvestor({
      ...editedInvestor,
      cryptoWallets: [...(editedInvestor.cryptoWallets || []), '']
    });
  };

  const removeWallet = (index: number) => {
    const updatedWallets = (editedInvestor.cryptoWallets || []).filter((_, i) => i !== index);
    setEditedInvestor({ ...editedInvestor, cryptoWallets: updatedWallets });
  };

  const transactionLabels: Record<string, string> = {
    DEPOSIT: 'Ð”ÐµÐ¿Ð¾Ð·Ð¸Ñ‚',
    WITHDRAWAL: 'Ð’Ñ‹Ð²Ð¾Ð´',
    PROFIT_ACCRUAL: 'ÐÐ°Ñ‡Ð¸ÑÐ»ÐµÐ½Ð¸Ðµ Ð´Ð¾Ñ…Ð¾Ð´Ð½Ð¾ÑÑ‚Ð¸',
    GHS_BONUS: 'Ð‘Ð¾Ð½ÑƒÑ GHS',
    GHS_PURCHASE: 'ÐŸÐ¾ÐºÑƒÐ¿ÐºÐ° Ñ‚Ð¾ÐºÐµÐ½Ð¾Ð²'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{editedInvestor.fullName}</h2>
            <p className="text-sm text-slate-500">ID Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð°: <span className="mono font-bold text-blue-600">{editedInvestor.investorDisplayId || editedInvestor.id}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Ð˜Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸Ñ Ð¾Ð± Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ðµ (read-only) */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Ð˜Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸Ñ Ð¾Ð± Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ðµ</h3>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ÐŸÐ¾Ñ‡Ñ‚Ð°</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{editedInvestor.email || 'â€”'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ð¢ÐµÐ»ÐµÑ„Ð¾Ð½</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{editedInvestor.phone || (editedInvestor as any).phone || 'â€”'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telegram</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{editedInvestor.socialId || 'â€”'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ÐŸÐ°Ñ€Ð¾Ð»ÑŒ</span>
                  <p className="text-sm font-mono text-slate-600 mt-0.5">{editedInvestor.password ? String(editedInvestor.password) : 'â€”'}</p>
                </div>
                {(editedInvestor as any).cryptoWallets?.length ? (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ÐšÐ¾ÑˆÐµÐ»Ñ‘Ðº</span>
                    <p className="text-sm font-mono text-slate-800 mt-0.5 break-all">{(editedInvestor as any).cryptoWallets[0] || 'â€”'}</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Info Section - editable */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Ð›Ð¸Ñ‡Ð½Ñ‹Ðµ Ð¸ ÑƒÑ‡ÐµÑ‚Ð½Ñ‹Ðµ Ð´Ð°Ð½Ð½Ñ‹Ðµ</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ð¤Ð˜Ðž / ÐŸÑÐµÐ²Ð´Ð¾Ð½Ð¸Ð¼</label>
                  <input 
                    type="text" 
                    value={editedInvestor.fullName} 
                    onChange={(e) => setEditedInvestor({...editedInvestor, fullName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Ð›Ð¾Ð³Ð¸Ð½)</label>
                    <input 
                      type="email" 
                      value={editedInvestor.email} 
                      onChange={(e) => setEditedInvestor({...editedInvestor, email: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ÐŸÐ°Ñ€Ð¾Ð»ÑŒ</label>
                    <input 
                      type="text" 
                      value={editedInvestor.password || ''} 
                      onChange={(e) => setEditedInvestor({...editedInvestor, password: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow mono font-bold text-blue-900 bg-blue-50" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ÐŸÐ°ÑÐ¿Ð¾Ñ€Ñ‚Ð½Ñ‹Ðµ Ð´Ð°Ð½Ð½Ñ‹Ðµ (Ð¢ÐµÐºÑÑ‚)</label>
                  <textarea 
                    value={editedInvestor.passportData || ''} 
                    onChange={(e) => setEditedInvestor({...editedInvestor, passportData: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow h-20 resize-none text-sm" 
                    placeholder="Ð¡ÐµÑ€Ð¸Ñ, Ð½Ð¾Ð¼ÐµÑ€, ÐºÐµÐ¼ Ð²Ñ‹Ð´Ð°Ð½..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ð¡Ð¾Ñ†Ð¸Ð°Ð»ÑŒÐ½Ñ‹Ð¹ ID</label>
                    <input 
                      type="text" 
                      value={editedInvestor.socialId || ''} 
                      onChange={(e) => setEditedInvestor({...editedInvestor, socialId: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ð¡Ñ‚Ð°Ñ‚ÑƒÑ Ð°ÐºÐºÐ°ÑƒÐ½Ñ‚Ð°</label>
                    <button 
                      onClick={handleStatusToggle}
                      className={`w-full px-4 py-2 rounded-lg font-bold text-xs transition-all border flex items-center justify-center gap-2 ${
                        editedInvestor.status === UserStatus.ACTIVE 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${editedInvestor.status === UserStatus.ACTIVE ? 'bg-green-500' : 'bg-red-500'}`} />
                      {editedInvestor.status === UserStatus.ACTIVE ? 'ÐÐšÐ¢Ð˜Ð’Ð•Ð' : 'Ð—ÐÐ‘Ð›ÐžÐšÐ˜Ð ÐžÐ’ÐÐ'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Finance and Wallets Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Ð¤Ð¸Ð½Ð°Ð½ÑÑ‹ Ð¸ ÐšÐ¾ÑˆÐµÐ»ÑŒÐºÐ¸</h3>
              
              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-900 rounded-2xl shadow-inner">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.1em]">ÐžÑÐ½Ð¾Ð²Ð½Ð¾Ð¹ Ð±Ð°Ð»Ð°Ð½Ñ (USD)</label>
                  <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                     <input 
                      type="number" 
                      step="0.01"
                      value={editedInvestor.balances.main} 
                      onChange={(e) => updateBalance('main', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xl mono text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.1em]">Ð¢Ð¾ÐºÐµÐ½Ñ‹ GHS</label>
                  <input 
                    type="number" 
                    value={editedInvestor.balances.ghs} 
                    onChange={(e) => updateBalance('ghs', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xl mono text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                {onAccrueYield && (
                  <div className="col-span-2 pt-2">
                    <button
                      onClick={async () => {
                        setIsAccruing(true);
                        try {
                          const res = await onAccrueYield();
                          if (res && typeof (res as any).accrued === 'number' && (res as any).accrued > 0) {
                            setEditedInvestor(prev => ({ ...prev, balances: { ...prev.balances, main: prev.balances.main + (res as any).accrued } }));
                          }
                        } finally {
                          setIsAccruing(false);
                        }
                      }}
                      disabled={isAccruing}
                      className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {isAccruing ? '...' : 'ÐÐ°Ñ‡Ð¸ÑÐ»Ð¸Ñ‚ÑŒ Ð´Ð¾Ñ…Ð¾Ð´Ð½Ð¾ÑÑ‚ÑŒ'}
                    </button>
                    <p className="text-[10px] text-slate-500 mt-2">Ð”Ð¾Ñ…Ð¾Ð´Ð½Ð¾ÑÑ‚ÑŒ Ñ€Ð°ÑÑÑ‡Ð¸Ñ‚Ñ‹Ð²Ð°ÐµÑ‚ÑÑ Ð¿Ð¾ Ñ„Ð¾Ñ€Ð¼ÑƒÐ»Ðµ Ð¸ Ð½Ð°Ñ‡Ð¸ÑÐ»ÑÐµÑ‚ÑÑ Ñ‚Ð¾Ð»ÑŒÐºÐ¾ Ð²Ñ€ÑƒÑ‡Ð½ÑƒÑŽ Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€Ð¾Ð¼.</p>
                  </div>
                )}
              </div>

              {pendingDeposits.length > 0 && (
                <div className="space-y-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest">ÐžÐ¶Ð¸Ð´Ð°ÑŽÑ‰Ð¸Ðµ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ Ð¿Ð¾Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¸Ñ</h4>
                  {pendingDeposits.map((dep) => (
                    <div key={dep.id} className="flex flex-wrap items-center gap-3 p-4 bg-white border border-amber-100 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">TX #{dep.id}</p>
                        <p className="text-xs text-slate-500 mono truncate">{dep.tx_hash || 'â€”'}</p>
                        <p className="text-xs text-amber-700 mt-1">{dep.date} â€¢ {dep.amount} {dep.currency}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Ð¡ÑƒÐ¼Ð¼Ð°"
                          value={confirmAmount[dep.id] ?? dep.amount}
                          onChange={(e) => setConfirmAmount((prev) => ({ ...prev, [dep.id]: e.target.value }))}
                          className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold"
                        />
                        <button
                          onClick={async () => {
                            if (!onConfirmDeposit) return;
                            setConfirmingTxId(dep.id);
                            try {
                              const amt = parseFloat(confirmAmount[dep.id] ?? String(dep.amount)) || dep.amount;
                              await onConfirmDeposit(dep.id, amt);
                              setConfirmAmount((prev) => { const n = { ...prev }; delete n[dep.id]; return n; });
                            } finally {
                              setConfirmingTxId(null);
                            }
                          }}
                          disabled={confirmingTxId !== null}
                          className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {confirmingTxId === dep.id ? '...' : 'ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-slate-700 tracking-tight">ÐšÑ€Ð¸Ð¿Ñ‚Ð¾ÐºÐ¾ÑˆÐµÐ»ÑŒÐºÐ¸ (ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ / Wallet App)</label>
                  <button 
                    onClick={addWallet}
                    className="text-[10px] font-black text-blue-600 uppercase border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    + Ð”Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {editedInvestor.cryptoWallets?.length ? editedInvestor.cryptoWallets.map((wallet, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        value={wallet} 
                        onChange={(e) => handleWalletChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs mono bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="ÐÐ´Ñ€ÐµÑ ÐºÐ¾ÑˆÐµÐ»ÑŒÐºÐ°..."
                      />
                      <button 
                        onClick={() => removeWallet(idx)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic py-2">ÐšÐ¾ÑˆÐµÐ»ÑŒÐºÐ¸ Ð½Ðµ Ð¿Ñ€Ð¸Ð²ÑÐ·Ð°Ð½Ñ‹.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Ð—Ð°Ð³Ñ€ÑƒÐ¶ÐµÐ½Ð½Ñ‹Ðµ Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ñ‹ (Ð’ÐµÑ€Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸Ñ)</h3>
              {documents.length > 0 && editedInvestor.kycStatus !== 'verified' && (
                <div className="flex gap-2">
                  {onConfirmDocuments && (
                    <button
                      onClick={async () => {
                        try {
                          await onConfirmDocuments();
                          setEditedInvestor(prev => ({ ...prev, kycStatus: 'verified' }));
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="px-5 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700"
                    >
                      ÐŸÐ¾Ð´Ñ‚Ð²ÐµÑ€Ð´Ð¸Ñ‚ÑŒ Ð²ÐµÑ€Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸ÑŽ
                    </button>
                  )}
                  {onRejectDocuments && (
                    <button
                      onClick={async () => {
                        try {
                          await onRejectDocuments();
                          setEditedInvestor(prev => ({ ...prev, kycStatus: 'pending' }));
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="px-5 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700"
                    >
                      ÐžÑ‚ÐºÐ»Ð¾Ð½Ð¸Ñ‚ÑŒ Ð²ÐµÑ€Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸ÑŽ
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(documents?.length ? documents : editedInvestor.documents || []).map((doc: any) => {
                const fileUrl = doc.file_url || '';
                const normalized = !fileUrl ? '' : fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
                const downloadUrl = !fileUrl
                  ? ''
                  : fileUrl.startsWith('http') || fileUrl.startsWith('data:')
                    ? fileUrl
                    : `${String(apiBase || '').replace(/\/$/, '')}${normalized}`;
                const fileName = doc.file_url?.split('/').pop() || 'document';
                const d = typeof doc.id === 'number'
                  ? { id: String(doc.id), name: doc.doc_type || fileName || 'Документ', type: (doc.doc_type || 'PASSPORT').toUpperCase(), uploadDate: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('ru-RU') : '', downloadUrl, fileName }
                  : { ...doc, downloadUrl: doc.downloadUrl || doc.previewUrl || '', fileName: doc.fileName || doc.name || 'document' };
                return (
                <div
                  key={d.id}
                  className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all shadow-sm"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M14 2v4h4"/></svg>
                  </div>
                  <div className="p-3 bg-white border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{d.type}</p>
                    <p className="text-[11px] font-bold text-slate-700 truncate">{d.name}</p>
                    <p className="text-[9px] text-slate-400">{d.uploadDate}</p>
                    {d.downloadUrl && (
                      <a href={d.downloadUrl} download={d.fileName} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline mt-2 inline-block">Скачать файл</a>
                    )}
                  </div>
                </div>
              );
              })}
              {(!documents?.length && !editedInvestor.documents?.length) && (
                <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <p className="text-xs font-medium">ÐÐµÑ‚ Ð·Ð°Ð³Ñ€ÑƒÐ¶ÐµÐ½Ð½Ñ‹Ñ… Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ð¾Ð²</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Ð˜ÑÑ‚Ð¾Ñ€Ð¸Ñ Ñ‚Ñ€Ð°Ð½Ð·Ð°ÐºÑ†Ð¸Ð¹</h3>
            <div className="space-y-3">
              {investorTransactions.length ? investorTransactions.map((tx) => (
                <div key={tx.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-black text-slate-900">
                          {transactionLabels[tx.rawType || ''] || tx.rawType || tx.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          tx.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tx.status === 'FAILED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{tx.date}</p>
                      {tx.comment ? (
                        <p className="text-xs text-slate-600 mt-2 break-words">{tx.comment}</p>
                      ) : null}
                      {tx.tx_hash ? (
                        <p className="text-[11px] text-slate-500 mt-2 mono break-all">TX: {tx.tx_hash}</p>
                      ) : null}
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <p className={`text-base font-black ${
                        tx.type === TransactionType.WITHDRAWAL ? 'text-red-600' : 'text-emerald-700'
                      }`}>
                        {tx.type === TransactionType.WITHDRAWAL ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">ID: {tx.id}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                  <p className="text-xs font-medium">Ð¢Ñ€Ð°Ð½Ð·Ð°ÐºÑ†Ð¸Ð¹ Ð¿Ð¾ÐºÐ° Ð½ÐµÑ‚</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            {onDelete && (
              <button
                onClick={async () => {
                  if (!confirm(`Ð’Ñ‹ ÑƒÐ²ÐµÑ€ÐµÐ½Ñ‹, Ñ‡Ñ‚Ð¾ Ñ…Ð¾Ñ‚Ð¸Ñ‚Ðµ ÑƒÐ´Ð°Ð»Ð¸Ñ‚ÑŒ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð° ${editedInvestor.fullName}? Ð­Ñ‚Ð¾ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ðµ Ð½ÐµÐ»ÑŒÐ·Ñ Ð¾Ñ‚Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ.`)) return;
                  setIsDeleting(true);
                  try {
                    await onDelete();
                    onClose();
                  } catch (err: any) {
                    alert(err?.message || 'ÐžÑˆÐ¸Ð±ÐºÐ° ÑƒÐ´Ð°Ð»ÐµÐ½Ð¸Ñ');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="px-6 py-2.5 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors border border-red-200"
              >
                {isDeleting ? '...' : 'Ð£Ð´Ð°Ð»Ð¸Ñ‚ÑŒ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð°'}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors">ÐžÑ‚Ð¼ÐµÐ½Ð°</button>
            <button 
              onClick={handleSave}
              className="px-12 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CycleEditModal = ({
  cycle,
  onClose,
  onSave,
  apiBase
}: {
  cycle: InvestmentCycle;
  onClose: () => void;
  onSave: () => void;
  apiBase?: string;
}) => {
  const [cycleDate, setCycleDate] = useState(cycle.cycle_date.slice(0, 10));
  const [yieldPercent, setYieldPercent] = useState(String((cycle.yield_rate * 100).toFixed(1)));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const base = apiBase ?? (window as any).__IPG_API_BASE ?? (window.location.hostname === 'localhost' ? '' : 'https://api.ipg-invest.ae');
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const rate = parseFloat(yieldPercent);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      setError('Ð”Ð¾Ñ…Ð¾Ð´Ð½Ð¾ÑÑ‚ÑŒ Ð´Ð¾Ð»Ð¶Ð½Ð° Ð±Ñ‹Ñ‚ÑŒ Ð¾Ñ‚ 0 Ð´Ð¾ 100%');
      return;
    }
    setSaving(true);
    try {
      if (!token) {
        setError('Ð¢Ñ€ÐµÐ±ÑƒÐµÑ‚ÑÑ Ð°Ð²Ñ‚Ð¾Ñ€Ð¸Ð·Ð°Ñ†Ð¸Ñ. Ð’Ñ‹Ð¹Ð´Ð¸Ñ‚Ðµ Ð¸ Ð²Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ Ð·Ð°Ð½Ð¾Ð²Ð¾.');
        return;
      }
      const res = await fetch(`${base}/cycles/${cycle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cycle_date: cycleDate, yield_rate: rate })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || data.message || 'ÐžÑˆÐ¸Ð±ÐºÐ° ÑÐ¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¸Ñ';
        throw new Error(res.status === 401 ? 'Ð¡ÐµÑÑÐ¸Ñ Ð¸ÑÑ‚ÐµÐºÐ»Ð°. Ð’Ð¾Ð¹Ð´Ð¸Ñ‚Ðµ Ð·Ð°Ð½Ð¾Ð²Ð¾.' : msg);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'ÐžÑˆÐ¸Ð±ÐºÐ°');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Ð ÐµÐ´Ð°ÐºÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ñ†Ð¸ÐºÐ» #{cycle.cycle_number}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium">{error}</div>}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Ð”Ð°Ñ‚Ð° Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¸Ñ</label>
            <input
              type="date"
              value={cycleDate}
              onChange={(e) => setCycleDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Ð”Ð¾Ñ…Ð¾Ð´Ð½Ð¾ÑÑ‚ÑŒ (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={yieldPercent}
              onChange={(e) => setYieldPercent(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50">
              ÐžÑ‚Ð¼ÐµÐ½Ð°
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-70">
              {saving ? '...' : 'Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateInvestorModal = ({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (payload: { email: string; password: string; full_name: string }) => Promise<any>;
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [createdInvestorId, setCreatedInvestorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setError('');
    setCreatedInvestorId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const result = await onCreate({
        email: email.trim(),
        password,
        full_name: fullName.trim()
      });
      setCreatedInvestorId(result?.investor_id || null);
    } catch (err: any) {
      setError(err?.message || 'ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ ÑÐ¾Ð·Ð´Ð°Ñ‚ÑŒ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð°');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">ÐÐ¾Ð²Ñ‹Ð¹ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€</h2>
            <p className="text-xs text-slate-500">Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð´Ð¾ÑÑ‚ÑƒÐ¿Ð° Ð² Ð»Ð¸Ñ‡Ð½Ñ‹Ð¹ ÐºÐ°Ð±Ð¸Ð½ÐµÑ‚</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-6">
          {createdInvestorId ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                <p className="text-xs font-black uppercase tracking-widest mb-2">Ð˜Ð½Ð²ÐµÑÑ‚Ð¾Ñ€ ÑÐ¾Ð·Ð´Ð°Ð½</p>
                <p className="text-sm font-medium">Ð˜Ð˜Ð (Investor ID): <span className="mono font-bold">{createdInvestorId}</span></p>
                <p className="text-xs text-emerald-700 mt-1">Ð¢ÐµÐ¿ÐµÑ€ÑŒ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€ Ð¼Ð¾Ð¶ÐµÑ‚ Ð²Ð¾Ð¹Ñ‚Ð¸ Ð¿Ð¾ email Ð¸ Ð¿Ð°Ñ€Ð¾Ð»ÑŽ.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={resetForm} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
                  Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ ÐµÑ‰Ðµ
                </button>
                <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
                  Ð—Ð°ÐºÑ€Ñ‹Ñ‚ÑŒ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ð¤Ð˜Ðž</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  placeholder="Ð˜Ð²Ð°Ð½Ð¾Ð² Ð˜Ð²Ð°Ð½ Ð˜Ð²Ð°Ð½Ð¾Ð²Ð¸Ñ‡"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  placeholder="investor@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">ÐŸÐ°Ñ€Ð¾Ð»ÑŒ (Ð¼Ð¸Ð½. 8 ÑÐ¸Ð¼Ð²Ð¾Ð»Ð¾Ð²)</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow mono font-bold text-slate-800 bg-slate-50"
                  placeholder="Ð¡Ð³ÐµÐ½ÐµÑ€Ð¸Ñ€ÑƒÐ¹Ñ‚Ðµ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 font-medium">{error}</div>
              )}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Ð¡Ð¾Ð·Ð´Ð°Ð½Ð¸Ðµ...' : 'Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð°'}
                </button>
                <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
                  ÐžÑ‚Ð¼ÐµÐ½Ð°
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

type AppProps = {
  apiBase?: string;
};

function AdminPasswordGate({ onAuthenticated, apiBase }: { onAuthenticated: () => void; apiBase?: string }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const base = apiBase ?? (window as any).__IPG_API_BASE ??
    (window.location.hostname === 'localhost' ? '' : 'https://api.ipg-invest.ae');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setLoading(true);
    try {
      const res = await fetch(`${base}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data.error || 'ÐÐµÐ²ÐµÑ€Ð½Ñ‹Ð¹ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ');
        return;
      }
      sessionStorage.setItem(ADMIN_AUTH_KEY, '1');
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.accessToken || '');
      onAuthenticated();
    } catch {
      setPasswordError('ÐžÑˆÐ¸Ð±ÐºÐ° ÑÐµÑ‚Ð¸');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs p-8 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Icons.Shield />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white text-center mb-2">Ð”Ð¾ÑÑ‚ÑƒÐ¿ Ð² Ð°Ð´Ð¼Ð¸Ð½-Ð¿Ð°Ð½ÐµÐ»ÑŒ</h2>
        <p className="text-slate-400 text-sm text-center mb-6">Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ Ð´Ð»Ñ Ð²Ñ…Ð¾Ð´Ð°</p>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(''); }}
          placeholder="ÐŸÐ°Ñ€Ð¾Ð»ÑŒ"
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        {passwordError && (
          <p className="mt-2 text-sm text-red-400">{passwordError}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70"
        >
          {loading ? 'Ð’Ñ…Ð¾Ð´...' : 'Ð’Ð¾Ð¹Ñ‚Ð¸'}
        </button>
      </form>
    </div>
  );
}

export default function App({ apiBase }: AppProps) {
  const [authenticated, setAuthenticated] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_AUTH_KEY) === '1'
  );

  const handleLogoutClear = useCallback(() => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setAuthenticated(false);
  }, []);

  if (!authenticated) {
    return <AdminPasswordGate onAuthenticated={() => setAuthenticated(true)} apiBase={apiBase} />;
  }

  return <AdminAppContent apiBase={apiBase} onLogout={handleLogoutClear} />;
}

function AdminAppContent({ apiBase, onLogout }: AppProps & { onLogout: () => void }) {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [userIdMap, setUserIdMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [investorVerificationFilter, setInvestorVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [investorDocuments, setInvestorDocuments] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cycles, setCycles] = useState<InvestmentCycle[]>([]);
  const [editingCycle, setEditingCycle] = useState<InvestmentCycle | null>(null);
  const base = apiBase ?? (window as any).__IPG_API_BASE ??
    (window.location.hostname === 'localhost' ? '' : 'https://api.ipg-invest.ae');

  const getAuthHeaders = () => {
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(ADMIN_TOKEN_KEY) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const openHost = () => {
    localStorage.setItem('ipg_host_token', 'ipg-admin-access');
    const hostUrl = window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://ipg-invest.ae';
    window.open(hostUrl, '_blank');
  };

  const openApp = (app: 'dashboard' | 'wallet' | 'info' | 'invest') => {
    const isLocal = window.location.hostname === 'localhost';
    if (isLocal) {
      const ports: Record<typeof app, number> = {
        dashboard: 3000,
        wallet: 5177,
        info: 3003,
        invest: 5182
      };
      window.location.href = `http://localhost:${ports[app]}`;
      return;
    }
    const subdomains: Record<typeof app, string> = {
      dashboard: 'https://dashboard.ipg-invest.ae',
      wallet: 'https://wallet.ipg-invest.ae',
      info: 'https://info.ipg-invest.ae',
      invest: 'https://ipg-invest.ae'
    };
    window.location.href = subdomains[app];
  };

  const fetchAdminData = useCallback(async () => {
    const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
    try {
      const [usersRes, balancesRes, contractsRes, txRes, paymentsRes, cyclesRes] = await Promise.all([
        fetch(`${base}/users?limit=500`, { headers }),
        fetch(`${base}/balances`, { headers }),
        fetch(`${base}/contracts?limit=500`, { headers }),
        fetch(`${base}/transactions?limit=500`, { headers }),
        fetch(`${base}/payments?limit=500`, { headers }),
        fetch(`${base}/cycles`, { headers })
      ]);

        const users = usersRes.ok ? await usersRes.json() : [];
        const balances = balancesRes.ok ? await balancesRes.json() : [];
        const contracts = contractsRes.ok ? await contractsRes.json() : [];
        const txs = txRes.ok ? await txRes.json() : [];
        const payments = paymentsRes.ok ? await paymentsRes.json() : [];
        const cyclesData = cyclesRes.ok ? await cyclesRes.json() : [];

        const idToInvestorId = new Map<number, string>();
        const investorIdToDbId: Record<string, number> = {};

        users.forEach((u: any) => {
          idToInvestorId.set(u.id, u.investor_id);
          investorIdToDbId[u.investor_id] = u.id;
        });

        const balanceByUser: Record<number, { main: number; ghs: number }> = {};
        balances.forEach((b: any) => {
          if (!balanceByUser[b.user_id]) balanceByUser[b.user_id] = { main: 0, ghs: 0 };
          if (b.currency === 'USD') balanceByUser[b.user_id].main = Number(b.amount) || 0;
          if (b.currency === 'GHS') balanceByUser[b.user_id].ghs = Number(b.amount) || 0;
        });

        const contractsByUser: Record<number, Investor['contracts']> = {};
        contracts.forEach((c: any) => {
          if (!contractsByUser[c.user_id]) contractsByUser[c.user_id] = [];
          contractsByUser[c.user_id].push({
            id: String(c.id),
            type: 'Standard',
            amount: Number(c.amount_invested) || 0,
            startDate: new Date(c.start_date).toLocaleDateString('ru-RU'),
            endDate: new Date(c.end_date).toLocaleDateString('ru-RU'),
            status: c.status === 'completed' ? 'COMPLETED' : 'ACTIVE'
          });
        });

        const mappedInvestors: Investor[] = users.map((u: any) => ({
          id: u.investor_id,
          investorDisplayId: u.investor_display_id || null,
          email: u.email,
          fullName: u.full_name || '',
          phone: u.phone || '',
          password: u.password_plain || '',
          socialId: u.telegram_id || '',
          passportData: u.passport_file_path || '',
          cryptoWallets: u.crypto_wallet ? [u.crypto_wallet] : [],
          documents: [],
          status: u.status === 'blocked' ? UserStatus.BLOCKED : UserStatus.ACTIVE,
          kycStatus: u.email_verified ? 'verified' : 'pending',
          onboardingStep: u.onboarding_step || 'registered',
          registrationDate: new Date(u.registration_date).toLocaleDateString('ru-RU'),
          balances: balanceByUser[u.id] || { main: 0, ghs: 0 },
          contracts: contractsByUser[u.id] || []
        }));

        const mappedTransactions: Transaction[] = txs.map((tx: any) => {
          const investorId = idToInvestorId.get(tx.user_id) || 'UNKNOWN';
          const investorName =
            mappedInvestors.find((inv) => inv.id === investorId)?.fullName || investorId;
          const typeMap: Record<string, TransactionType> = {
            DEPOSIT: TransactionType.DEPOSIT,
            WITHDRAWAL: TransactionType.WITHDRAWAL,
            PROFIT_ACCRUAL: TransactionType.PROFIT,
            GHS_BONUS: TransactionType.PROFIT,
            GHS_PURCHASE: TransactionType.TOKEN_PURCHASE
          };
          const statusMap: Record<string, Transaction['status']> = {
            completed: 'SUCCESS',
            pending: 'PENDING',
            failed: 'FAILED'
          };

          return {
            id: String(tx.id),
            investorId,
            investorName,
            type: typeMap[tx.type] || TransactionType.DEPOSIT,
            amount: Number(tx.amount) || 0,
            currency: tx.type === 'GHS_BONUS' || tx.type === 'GHS_PURCHASE' ? 'GHS' : 'USD',
            date: new Date(tx.created_at).toLocaleString('ru-RU'),
            status: statusMap[tx.status] || 'PENDING',
            tx_hash: tx.tx_hash || undefined,
            comment: tx.comment || undefined,
            rawType: tx.type
          };
        });

        setUserIdMap(investorIdToDbId);
        setInvestors(mappedInvestors);
        setTransactions(mappedTransactions);
        setPaymentIntents(Array.isArray(payments) ? payments : []);
        setCycles(Array.isArray(cyclesData) ? cyclesData.map((c: any) => ({
          id: c.id,
          cycle_number: c.cycle_number,
          cycle_date: c.cycle_date,
          yield_rate: Number(c.yield_rate) || 0,
          created_at: c.created_at,
          updated_at: c.updated_at
        })) : []);
    } catch (err) {
      console.error(err);
    }
  }, [base]);

  const handleCreateInvestor = useCallback(async (payload: { email: string; password: string; full_name: string }) => {
    const res = await fetch(`${base}/users/admin-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ ÑÐ¾Ð·Ð´Ð°Ñ‚ÑŒ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð°');
    }
    await fetchAdminData();
    return data;
  }, [base, fetchAdminData]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    if (!selectedInvestor) {
      setInvestorDocuments([]);
      return;
    }
    const dbId = userIdMap[selectedInvestor.id];
    if (!dbId) {
      setInvestorDocuments([]);
      return;
    }
    const headers = getAuthHeaders();
    fetch(`${base}/users/${dbId}/documents`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setInvestorDocuments(Array.isArray(data) ? data : []))
      .catch(() => setInvestorDocuments([]));
  }, [selectedInvestor, userIdMap, base]);

  useEffect(() => {
    if (!selectedInvestor) return;
    const freshInvestor = investors.find((inv) => inv.id === selectedInvestor.id);
    if (freshInvestor && freshInvestor !== selectedInvestor) {
      setSelectedInvestor(freshInvestor);
    }
  }, [investors, selectedInvestor]);

  // Filtering Logic: Ð¿Ð¾Ð¸ÑÐº + Ð²ÐµÑ€Ð¸Ñ„Ð¸ÐºÐ°Ñ†Ð¸Ñ
  const filteredInvestors = useMemo(() => {
    let list = investors;
    if (investorVerificationFilter === 'verified') {
      list = list.filter(i => i.kycStatus === 'verified');
    } else if (investorVerificationFilter === 'unverified') {
      list = list.filter(i => i.kycStatus !== 'verified');
    }
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(i =>
      i.id.toLowerCase().includes(q) ||
      i.fullName.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.socialId?.toLowerCase().includes(q) ||
      i.passportData?.toLowerCase().includes(q)
    );
  }, [investors, searchQuery, investorVerificationFilter]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.id.toLowerCase().includes(q) || 
      t.investorName.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const transactionTypeMap: Record<string, string> = {
    'DEPOSIT': 'Ð”Ð•ÐŸÐžÐ—Ð˜Ð¢',
    'WITHDRAWAL': 'Ð’Ð«Ð’ÐžÐ”',
    'PROFIT': 'ÐŸÐ Ð˜Ð‘Ð«Ð›Ð¬',
    'TOKEN_PURCHASE': 'ÐŸÐžÐšÐ£ÐŸÐšÐ Ð¢ÐžÐšÐ•ÐÐžÐ’',
    'CONTRACT_ACTIVATION': 'ÐÐšÐ¢Ð˜Ð’ÐÐ¦Ð˜Ð¯ ÐšÐžÐÐ¢Ð ÐÐšÐ¢Ð'
  };

  const totalDepositedFromBase = useMemo(() => {
    return transactions
      .filter(t => t.type === TransactionType.DEPOSIT && t.status === 'SUCCESS')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar activeView={view} setView={setView} onOpenHost={openHost} onLogout={onLogout} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 pt-16 p-8">
        <Header title={view} onOpenMenu={() => setIsMenuOpen(true)} />

        {/* Dashboard View */}
        {view === 'DASHBOARD' && (
          <div className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Ð’ÑÐµÐ³Ð¾ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð¾Ð²', val: investors.length, icon: <Icons.Users />, color: 'bg-indigo-600', sub: 'Ð—Ð°Ñ€ÐµÐ³Ð¸ÑÑ‚Ñ€Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ñ… Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÐµÐ¹' },
                { label: 'Ð’ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ðµ', val: investors.filter(i => i.kycStatus === 'verified').length, icon: <Icons.Shield />, color: 'bg-emerald-600', sub: 'Ð’ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ð¹ Ð¿Ð»Ð°Ñ‚Ð¸Ð½ÑƒÐ¼, Ð¿Ð¾Ð»Ð½Ñ‹Ð¹ Ð´Ð¾ÑÑ‚ÑƒÐ¿' },
                { label: 'ÐÐµÐ²ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ðµ', val: investors.filter(i => i.kycStatus !== 'verified').length, icon: <Icons.Users />, color: 'bg-amber-500', sub: 'ÐžÐ¶Ð¸Ð´Ð°ÑŽÑ‚ Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ Ð´Ð¾ÐºÑƒÐ¼ÐµÐ½Ñ‚Ð¾Ð²' },
                { label: 'Ð’ÑÐµÐ³Ð¾ Ð²Ð½ÐµÑÐµÐ½Ð¾ (USD)', val: `$${totalDepositedFromBase.toLocaleString()}`, icon: <Icons.Activity />, color: 'bg-blue-600', sub: 'ÐÐ° Ð¾ÑÐ½Ð¾Ð²Ðµ Ð²ÑÐµÑ… Ñ‚Ñ€Ð°Ð½Ð·Ð°ÐºÑ†Ð¸Ð¹ Ð±Ð°Ð·Ñ‹ Ð´Ð°Ð½Ð½Ñ‹Ñ…' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-blue-400 transition-all hover:-translate-y-1">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className="text-5xl font-black text-slate-900 mb-3 tracking-tight">{stat.val}</p>
                    <p className="text-sm text-slate-400 font-medium">{stat.sub}</p>
                  </div>
                  <div className={`p-6 rounded-2xl text-white shadow-2xl ${stat.color} transition-transform group-hover:scale-110`}>{stat.icon}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32" />
               <h3 className="text-2xl font-black text-slate-800 mb-4 relative z-10">Ð”Ð¾Ð±Ñ€Ð¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°Ñ‚ÑŒ Ð² AdminApp</h3>
               <p className="text-slate-500 max-w-2xl text-lg font-medium relative z-10">
                 ÐŸÐ°Ð½ÐµÐ»ÑŒ Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€Ð° MF-04 Ð¿Ñ€ÐµÐ´Ð¾ÑÑ‚Ð°Ð²Ð»ÑÐµÑ‚ Ð¿Ð¾Ð»Ð½Ñ‹Ð¹ ÐºÐ¾Ð½Ñ‚Ñ€Ð¾Ð»ÑŒ Ð½Ð°Ð´ Ñ„Ð¸Ð½Ð°Ð½ÑÐ¾Ð²Ñ‹Ð¼Ð¸ Ð¾Ð¿ÐµÑ€Ð°Ñ†Ð¸ÑÐ¼Ð¸ Ð¸ Ð´Ð°Ð½Ð½Ñ‹Ð¼Ð¸ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÐµÐ¹. 
                 Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐ¹Ñ‚Ðµ Ñ€Ð°Ð·Ð´ÐµÐ»Ñ‹ Ð¼ÐµÐ½ÑŽ ÑÐ»ÐµÐ²Ð° Ð´Ð»Ñ Ð¿ÐµÑ€ÐµÑ…Ð¾Ð´Ð° Ðº Ð´ÐµÑ‚Ð°Ð»ÑŒÐ½Ð¾Ð¼Ñƒ ÑƒÐ¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸ÑŽ Ð±Ð°Ð·Ð¾Ð¹ Ð´Ð°Ð½Ð½Ñ‹Ñ….
               </p>
               <div className="mt-8 flex gap-4 relative z-10">
                 <button onClick={() => setView('INVESTORS')} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">Ð£Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»ÑÐ¼Ð¸</button>
                 <button onClick={() => setView('TRANSACTIONS')} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">ÐŸÑ€Ð¾ÑÐ¼Ð¾Ñ‚Ñ€ Ñ‚Ñ€Ð°Ð½Ð·Ð°ÐºÑ†Ð¸Ð¹</button>
               </div>
            </div>
          </div>
        )}

        {/* Investors View */}
        {view === 'INVESTORS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Ð¤Ð¸Ð»ÑŒÑ‚Ñ€:</span>
                {[
                  { key: 'all' as const, label: 'Ð’ÑÐµ', count: investors.length },
                  { key: 'verified' as const, label: 'Ð’ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ðµ', count: investors.filter(i => i.kycStatus === 'verified').length },
                  { key: 'unverified' as const, label: 'ÐÐµÐ²ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ðµ', count: investors.filter(i => i.kycStatus !== 'verified').length },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setInvestorVerificationFilter(key)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                      investorVerificationFilter === key
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-xl">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
                  <input
                    type="text"
                    placeholder="ÐŸÐ¾Ð¸ÑÐº Ð¿Ð¾ Ð¸Ð¼ÐµÐ½Ð¸, email, ID Ð¸Ð»Ð¸ Ð¿Ð°ÑÐ¿Ð¾Ñ€Ñ‚Ñƒ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                  />
                </div>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
                >
                  Ð”Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð°
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð˜Ð½Ð²ÐµÑÑ‚Ð¾Ñ€</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð¡Ñ‚Ð°Ñ‚ÑƒÑ</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð‘Ð°Ð»Ð°Ð½Ñ (USD)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ð£Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ðµ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvestors.map((inv) => (
                    <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-lg border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            {inv.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-base leading-none mb-1.5">{inv.fullName}</p>
                            <p className="text-xs text-slate-500 mono font-medium">{(inv.investorDisplayId || inv.id)} â€¢ {inv.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border shadow-sm ${
                          inv.status === UserStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {inv.status === UserStatus.ACTIVE ? 'ÐÐºÑ‚Ð¸Ð²ÐµÐ½' : 'Ð‘Ð»Ð¾Ðº'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border shadow-sm ${
                          inv.kycStatus === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {inv.kycStatus === 'verified' ? 'Ð’ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ð¹ Ð¿Ð»Ð°Ñ‚Ð¸Ð½ÑƒÐ¼' : 'ÐÐµÐ²ÐµÑ€Ð¸Ñ„Ð¸Ñ†Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð½Ñ‹Ð¹'}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{inv.onboardingStep}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-base font-black text-slate-900">${inv.balances.main.toLocaleString()}</p>
                        <p className="text-[10px] text-blue-600 mono font-bold bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                          {inv.balances.ghs.toLocaleString()} GHS
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => setSelectedInvestor(inv)}
                          className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                        >
                          Ð ÐµÐ´Ð°ÐºÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvestors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic font-medium">ÐÐ¸Ñ‡ÐµÐ³Ð¾ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾ Ð¿Ð¾ Ð´Ð°Ð½Ð½Ð¾Ð¼Ñƒ Ð·Ð°Ð¿Ñ€Ð¾ÑÑƒ.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions View */}
        {view === 'TRANSACTIONS' && (
           <div className="space-y-6 animate-in fade-in duration-300">
             <div className="flex items-center justify-between">
               <div className="relative flex-1 max-w-md">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
                 <input 
                   type="text" 
                   placeholder="Ð¤Ð¸Ð»ÑŒÑ‚Ñ€ Ñ‚Ñ€Ð°Ð½Ð·Ð°ÐºÑ†Ð¸Ð¹..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                 />
               </div>
               <div className="flex gap-4">
                  <div className="px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">ÐžÐ±Ñ‰Ð¸Ð¹ Ð²Ð²Ð¾Ð´</span>
                    <span className="text-xl font-black leading-none">${totalDepositedFromBase.toLocaleString()}</span>
                  </div>
               </div>
             </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID TX</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð˜Ð½Ð²ÐµÑÑ‚Ð¾Ñ€</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð¡ÑƒÐ¼Ð¼Ð°</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð’Ñ€ÐµÐ¼Ñ</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð¡Ñ‚Ð°Ñ‚ÑƒÑ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 text-xs font-black text-blue-600 mono">{tx.id}</td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{tx.investorName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mono uppercase">{tx.investorId}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className={`text-sm font-black ${tx.type === TransactionType.WITHDRAWAL ? 'text-red-500' : 'text-emerald-600'}`}>
                          {tx.type === TransactionType.WITHDRAWAL ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">{transactionTypeMap[tx.type] || tx.type}</p>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-600 font-medium">{tx.date}</td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest border ${
                          tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {tx.status === 'SUCCESS' ? 'Ð£ÑÐ¿ÐµÑˆÐ½Ð¾' : tx.status === 'PENDING' ? 'ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ' : 'ÐžÑˆÐ¸Ð±ÐºÐ°'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">Crypto Gateway Payments</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intent</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset/Network</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentIntents.slice(0, 50).map((p) => (
                      <tr key={p.intent_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-blue-700 mono">{p.intent_id}</td>
                        <td className="px-6 py-4 text-xs text-slate-700">{p.crypto_asset} / {p.crypto_network || '-'}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-900">
                          {Number(p.expected_fiat_amount || 0).toLocaleString()} {p.settlement_currency}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest border ${
                            p.internal_status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : p.internal_status === 'failed' || p.internal_status === 'expired' || p.internal_status === 'cancelled'
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {p.internal_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!paymentIntents.length && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                          ÐÐµÑ‚ Ð´Ð°Ð½Ð½Ñ‹Ñ… Ð¿Ð¾ ÐºÑ€Ð¸Ð¿Ñ‚Ð¾Ð¿Ð»Ð°Ñ‚ÐµÐ¶Ð°Ð¼
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
           </div>
        )}

        {/* Cycles View */}
        {view === 'CYCLES' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <p className="text-slate-500 text-sm max-w-2xl">
              Ð ÐµÐ´Ð°ÐºÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ Ñ†Ð¸ÐºÐ»Ð¾Ð² Ð¿Ð¾ÑÑ‚Ð°Ð²ÐºÐ¸ 1â€“14: Ð´Ð°Ñ‚Ð° Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¸Ñ Ð¸ Ð´Ð¾Ñ…Ð¾Ð´Ð½Ð¾ÑÑ‚ÑŒ. ÐŸÐ¾Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¸Ñ Ð´Ð¾ 24 Ñ‡Ð°ÑÐ¾Ð² Ð´Ð¾ Ð´Ð°Ñ‚Ñ‹ Ñ†Ð¸ÐºÐ»Ð° ÑƒÑ‡Ð°ÑÑ‚Ð²ÑƒÑŽÑ‚ Ð² Ð½Ð°Ñ‡Ð¸ÑÐ»ÐµÐ½Ð¸Ð¸.
            </p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">â„– Ñ†Ð¸ÐºÐ»Ð°</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð”Ð°Ñ‚Ð° Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ð¸Ñ</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ð”Ð¾Ñ…Ð¾Ð´Ð½Ð¾ÑÑ‚ÑŒ (%)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ð”ÐµÐ¹ÑÑ‚Ð²Ð¸Ñ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cycles.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-900">#{c.cycle_number}</td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-700">{new Date(c.cycle_date).toLocaleDateString('ru-RU')}</td>
                      <td className="px-6 py-5">
                        <span className="text-emerald-600 font-black">{(c.yield_rate * 100).toFixed(1)}%</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => setEditingCycle(c)}
                          className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all"
                        >
                          Ð ÐµÐ´Ð°ÐºÑ‚Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!cycles.length && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400 italic">ÐÐµÑ‚ Ñ†Ð¸ÐºÐ»Ð¾Ð². Ð—Ð°Ð¿ÑƒÑÑ‚Ð¸Ñ‚Ðµ Ð¼Ð¸Ð³Ñ€Ð°Ñ†Ð¸ÑŽ migrate-investment-cycles.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* User Editing Modal */}
      {selectedInvestor && (
        <UserProfileModal 
          investor={selectedInvestor} 
          documents={investorDocuments}
          onConfirmDocuments={async () => {
            const dbId = userIdMap[selectedInvestor.id];
            if (!dbId) throw new Error('ID Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð° Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½');
            const res = await fetch(`${base}/users/${dbId}/confirm-documents`, {
              method: 'POST',
              headers: getAuthHeaders()
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'ÐžÑˆÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ');
            await fetchAdminData();
          }}
          onRejectDocuments={async () => {
            const dbId = userIdMap[selectedInvestor.id];
            if (!dbId) throw new Error('ID Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð° Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½');
            const res = await fetch(`${base}/users/${dbId}/reject-documents`, {
              method: 'POST',
              headers: getAuthHeaders()
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'ÐžÑˆÐ¸Ð±ÐºÐ° Ð¾Ñ‚ÐºÐ»Ð¾Ð½ÐµÐ½Ð¸Ñ');
            await fetchAdminData();
          }}
          onClose={() => setSelectedInvestor(null)} 
          onAccrueYield={async () => {
            const dbId = userIdMap[selectedInvestor.id];
            if (!dbId) throw new Error('ID Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð° Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½');
            const res = await fetch(`${base}/users/${dbId}/accrue-yield`, {
              method: 'POST',
              headers: getAuthHeaders()
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'ÐžÑˆÐ¸Ð±ÐºÐ° Ð½Ð°Ñ‡Ð¸ÑÐ»ÐµÐ½Ð¸Ñ');
            await fetchAdminData();
            return data;
          }}
          onDelete={async () => {
            const dbId = userIdMap[selectedInvestor.id];
            if (!dbId) throw new Error('ID Ð¸Ð½Ð²ÐµÑÑ‚Ð¾Ñ€Ð° Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½');
            const res = await fetch(`${base}/users/${dbId}`, {
              method: 'DELETE',
              headers: getAuthHeaders()
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'ÐžÑˆÐ¸Ð±ÐºÐ° ÑƒÐ´Ð°Ð»ÐµÐ½Ð¸Ñ');
            setSelectedInvestor(null);
            await fetchAdminData();
          }}
          pendingDeposits={transactions.filter(
            (t) => t.investorId === selectedInvestor.id && t.type === TransactionType.DEPOSIT && t.status === 'PENDING'
          )}
          investorTransactions={transactions.filter((t) => t.investorId === selectedInvestor.id)}
          apiBase={base}
          onConfirmDeposit={async (txId, amount) => {
            const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
            if (!token) throw new Error('Ð¢Ñ€ÐµÐ±ÑƒÐµÑ‚ÑÑ Ð°Ð²Ñ‚Ð¾Ñ€Ð¸Ð·Ð°Ñ†Ð¸Ñ Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑ‚Ñ€Ð°Ñ‚Ð¾Ñ€Ð°');
            const res = await fetch(`${base}/transactions/${txId}/confirm`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ amount })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'ÐžÑˆÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð´Ñ‚Ð²ÐµÑ€Ð¶Ð´ÐµÐ½Ð¸Ñ');
            await fetchAdminData();
          }}
          onUpdate={async (updated) => {
            const dbId = userIdMap[updated.id];
            if (!dbId) {
              setInvestors((prev) => prev.map((i) => i.id === updated.id ? updated : i));
              return;
            }

            const status = updated.status === UserStatus.BLOCKED ? 'blocked' : 'active';
            const userPayload: Record<string, string> = {
              email: updated.email,
              full_name: updated.fullName,
              status,
              passport_file_path: updated.passportData || '',
              telegram_id: updated.socialId || ''
            };
            const primaryWallet =
              updated.cryptoWallets?.find((wallet) => wallet && wallet.trim()) || '';
            userPayload.crypto_wallet = primaryWallet;
            if (updated.password && updated.password.trim()) {
              userPayload.password = updated.password.trim();
            }

            const authHeaders = getAuthHeaders();
            const reqHeaders = { 'Content-Type': 'application/json', ...authHeaders };

            await fetch(`${base}/users/${dbId}`, {
              method: 'PUT',
              headers: reqHeaders,
              body: JSON.stringify(userPayload)
            });

            await fetch(`${base}/balances`, {
              method: 'POST',
              headers: reqHeaders,
              body: JSON.stringify({
                user_id: dbId,
                currency: 'USD',
                amount: updated.balances.main
              })
            });

            await fetch(`${base}/balances`, {
              method: 'POST',
              headers: reqHeaders,
              body: JSON.stringify({
                user_id: dbId,
                currency: 'GHS',
                amount: updated.balances.ghs
              })
            });

            await fetchAdminData();
          }}
        />
      )}

      {editingCycle && (
        <CycleEditModal
          cycle={editingCycle}
          onClose={() => setEditingCycle(null)}
          onSave={fetchAdminData}
          apiBase={base}
        />
      )}

      {isCreateOpen && (
        <CreateInvestorModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateInvestor}
        />
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-[300] bg-white/98 backdrop-blur-3xl flex items-center justify-center p-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-8 right-8 p-3 rounded-full border border-black/5 text-black/60 hover:text-[#d4af37] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="flex flex-col gap-10 w-full max-w-lg text-center">
            <button onClick={() => openApp('dashboard')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black group-hover:text-[#d4af37] transition-all">Dashboard</span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>
            <button onClick={() => openApp('wallet')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">Wallet</span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>
            <button onClick={() => openApp('info')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">Info</span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>
            <button onClick={() => openApp('invest')} className="group flex flex-col items-center gap-2">
              <span className="text-2xl md:text-4xl font-['Playfair_Display'] font-black uppercase tracking-[0.1em] text-black/40 hover:text-black group-hover:text-[#d4af37] transition-all">Invest</span>
              <div className="h-[2px] w-0 group-hover:w-24 bg-[#d4af37] transition-all duration-300"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

