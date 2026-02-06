
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Investor, 
  Transaction, 
  ViewState, 
  UserStatus, 
  TransactionType,
  InvestorDocument
} from './types';
import { Icons } from './constants';

// --- Components ---

const Sidebar = ({
  activeView,
  setView,
  onOpenHost
}: {
  activeView: ViewState;
  setView: (v: ViewState) => void;
  onOpenHost: () => void;
}) => {
  const navItems = [
    { id: 'DASHBOARD', label: 'Главная', icon: <Icons.Layout /> },
    { id: 'INVESTORS', label: 'Инвесторы', icon: <Icons.Users /> },
    { id: 'TRANSACTIONS', label: 'Транзакции', icon: <Icons.Activity /> },
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
            <p className="text-white font-medium">Администратор</p>
            <p className="text-xs">Root-доступ</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-left">
          <Icons.Logout />
          <span>Выход</span>
        </button>
      </div>
    </div>
  );
};

const Header = ({ title, onOpenMenu }: { title: string; onOpenMenu: () => void }) => {
  const viewTitles: Record<string, string> = {
    'DASHBOARD': 'Панель управления',
    'INVESTORS': 'Управление инвесторами',
    'TRANSACTIONS': 'Список транзакций'
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

const UserProfileModal = ({ investor, onClose, onUpdate }: { 
  investor: Investor, 
  onClose: () => void, 
  onUpdate: (u: Investor) => Promise<void> | void
}) => {
  const [editedInvestor, setEditedInvestor] = useState<Investor>({ ...investor });
  const [previewDoc, setPreviewDoc] = useState<InvestorDocument | null>(null);

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{editedInvestor.fullName}</h2>
            <p className="text-sm text-slate-500">Системный ID: <span className="mono font-bold text-blue-600">{editedInvestor.id}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Info Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Личные и учетные данные</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ФИО / Псевдоним</label>
                  <input 
                    type="text" 
                    value={editedInvestor.fullName} 
                    onChange={(e) => setEditedInvestor({...editedInvestor, fullName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Логин)</label>
                    <input 
                      type="email" 
                      value={editedInvestor.email} 
                      onChange={(e) => setEditedInvestor({...editedInvestor, email: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
                    <input 
                      type="text" 
                      value={editedInvestor.password || ''} 
                      onChange={(e) => setEditedInvestor({...editedInvestor, password: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow mono font-bold text-blue-900 bg-blue-50" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Паспортные данные (Текст)</label>
                  <textarea 
                    value={editedInvestor.passportData || ''} 
                    onChange={(e) => setEditedInvestor({...editedInvestor, passportData: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow h-20 resize-none text-sm" 
                    placeholder="Серия, номер, кем выдан..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Социальный ID</label>
                    <input 
                      type="text" 
                      value={editedInvestor.socialId || ''} 
                      onChange={(e) => setEditedInvestor({...editedInvestor, socialId: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Статус аккаунта</label>
                    <button 
                      onClick={handleStatusToggle}
                      className={`w-full px-4 py-2 rounded-lg font-bold text-xs transition-all border flex items-center justify-center gap-2 ${
                        editedInvestor.status === UserStatus.ACTIVE 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${editedInvestor.status === UserStatus.ACTIVE ? 'bg-green-500' : 'bg-red-500'}`} />
                      {editedInvestor.status === UserStatus.ACTIVE ? 'АКТИВЕН' : 'ЗАБЛОКИРОВАН'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Finance and Wallets Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Финансы и Кошельки</h3>
              
              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-900 rounded-2xl shadow-inner">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.1em]">Основной баланс (USD)</label>
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
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.1em]">Токены GHS</label>
                  <input 
                    type="number" 
                    value={editedInvestor.balances.ghs} 
                    onChange={(e) => updateBalance('ghs', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xl mono text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-slate-700 tracking-tight">Криптокошельки (Профиль / Wallet App)</label>
                  <button 
                    onClick={addWallet}
                    className="text-[10px] font-black text-blue-600 uppercase border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    + Добавить
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
                        placeholder="Адрес кошелька..."
                      />
                      <button 
                        onClick={() => removeWallet(idx)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic py-2">Кошельки не привязаны.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Загруженные документы (Верификация)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {editedInvestor.documents?.length ? editedInvestor.documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all cursor-pointer shadow-sm"
                  onClick={() => setPreviewDoc(doc)}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-slate-100">
                    <img src={doc.previewUrl} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 bg-white border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{doc.type}</p>
                    <p className="text-[11px] font-bold text-slate-700 truncate">{doc.name}</p>
                    <p className="text-[9px] text-slate-400">{doc.uploadDate}</p>
                  </div>
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-white p-2 rounded-full shadow-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <p className="text-xs font-medium">Нет загруженных документов</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors">Отмена</button>
          <button 
            onClick={handleSave}
            className="px-12 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            Сохранить изменения
          </button>
        </div>
      </div>

      {/* Internal Fullscreen Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/95 z-[60] flex items-center justify-center p-8 backdrop-blur-md animate-in fade-in duration-300">
          <button 
            onClick={() => setPreviewDoc(null)} 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="max-w-4xl w-full h-full flex flex-col items-center justify-center gap-6">
            <img 
              src={previewDoc.previewUrl} 
              alt={previewDoc.name} 
              className="max-h-[80vh] w-auto shadow-2xl rounded-lg border-4 border-white/10 object-contain" 
            />
            <div className="text-center">
              <p className="text-white text-xl font-bold">{previewDoc.name}</p>
              <p className="text-slate-400 text-sm">{previewDoc.type} • Загружен {previewDoc.uploadDate}</p>
            </div>
          </div>
        </div>
      )}
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
      setError(err?.message || 'Не удалось создать инвестора');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Новый инвестор</h2>
            <p className="text-xs text-slate-500">Создание доступа в личный кабинет</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-6">
          {createdInvestorId ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                <p className="text-xs font-black uppercase tracking-widest mb-2">Инвестор создан</p>
                <p className="text-sm font-medium">ИИН (Investor ID): <span className="mono font-bold">{createdInvestorId}</span></p>
                <p className="text-xs text-emerald-700 mt-1">Теперь инвестор может войти по email и паролю.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={resetForm} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
                  Создать еще
                </button>
                <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
                  Закрыть
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">ФИО</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  placeholder="Иванов Иван Иванович"
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Пароль (мин. 8 символов)</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow mono font-bold text-slate-800 bg-slate-50"
                  placeholder="Сгенерируйте пароль"
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
                  {isSubmitting ? 'Создание...' : 'Создать инвестора'}
                </button>
                <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
                  Отмена
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

export default function App({ apiBase }: AppProps) {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userIdMap, setUserIdMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const base = apiBase || (window as any).__IPG_API_BASE ||
    (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.ipg-invest.ae');
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
        wallet: 3003,
        info: 3002,
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
    try {
      const [usersRes, balancesRes, contractsRes, txRes] = await Promise.all([
        fetch(`${base}/users?limit=500`),
        fetch(`${base}/balances`),
        fetch(`${base}/contracts?limit=500`),
        fetch(`${base}/transactions?limit=500`)
      ]);

        const users = usersRes.ok ? await usersRes.json() : [];
        const balances = balancesRes.ok ? await balancesRes.json() : [];
        const contracts = contractsRes.ok ? await contractsRes.json() : [];
        const txs = txRes.ok ? await txRes.json() : [];

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
          email: u.email,
          fullName: u.full_name || '',
          password: '',
          socialId: u.telegram_id || '',
          passportData: u.passport_file_path || '',
          cryptoWallets: u.crypto_wallet ? [u.crypto_wallet] : [],
          documents: [],
          status: u.status === 'blocked' ? UserStatus.BLOCKED : UserStatus.ACTIVE,
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
            currency: 'USD',
            date: new Date(tx.created_at).toLocaleString('ru-RU'),
            status: statusMap[tx.status] || 'PENDING'
          };
        });

        setUserIdMap(investorIdToDbId);
        setInvestors(mappedInvestors);
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error(err);
    }
  }, [base]);

  const handleCreateInvestor = useCallback(async (payload: { email: string; password: string; full_name: string }) => {
    const res = await fetch(`${base}/users/admin-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Не удалось создать инвестора');
    }
    await fetchAdminData();
    return data;
  }, [base, fetchAdminData]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Filtering Logic
  const filteredInvestors = useMemo(() => {
    if (!searchQuery) return investors;
    const q = searchQuery.toLowerCase();
    return investors.filter(i => 
      i.id.toLowerCase().includes(q) || 
      i.fullName.toLowerCase().includes(q) || 
      i.email.toLowerCase().includes(q) ||
      i.socialId?.toLowerCase().includes(q) ||
      i.passportData?.toLowerCase().includes(q)
    );
  }, [investors, searchQuery]);

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
    'DEPOSIT': 'ДЕПОЗИТ',
    'WITHDRAWAL': 'ВЫВОД',
    'PROFIT': 'ПРИБЫЛЬ',
    'TOKEN_PURCHASE': 'ПОКУПКА ТОКЕНОВ',
    'CONTRACT_ACTIVATION': 'АКТИВАЦИЯ КОНТРАКТА'
  };

  const totalDepositedFromBase = useMemo(() => {
    return transactions
      .filter(t => t.type === TransactionType.DEPOSIT && t.status === 'SUCCESS')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar activeView={view} setView={setView} onOpenHost={openHost} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 pt-16 p-8">
        <Header title={view} onOpenMenu={() => setIsMenuOpen(true)} />

        {/* Dashboard View */}
        {view === 'DASHBOARD' && (
          <div className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Всего инвесторов', val: investors.length, icon: <Icons.Users />, color: 'bg-indigo-600', sub: 'Зарегистрированных пользователей' },
                { label: 'Всего внесено (USD)', val: `$${totalDepositedFromBase.toLocaleString()}`, icon: <Icons.Activity />, color: 'bg-emerald-600', sub: 'На основе всех транзакций базы данных' },
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
               <h3 className="text-2xl font-black text-slate-800 mb-4 relative z-10">Добро пожаловать в AdminApp</h3>
               <p className="text-slate-500 max-w-2xl text-lg font-medium relative z-10">
                 Панель администратора MF-04 предоставляет полный контроль над финансовыми операциями и данными пользователей. 
                 Используйте разделы меню слева для перехода к детальному управлению базой данных.
               </p>
               <div className="mt-8 flex gap-4 relative z-10">
                 <button onClick={() => setView('INVESTORS')} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">Управление пользователями</button>
                 <button onClick={() => setView('TRANSACTIONS')} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">Просмотр транзакций</button>
               </div>
            </div>
          </div>
        )}

        {/* Investors View */}
        {view === 'INVESTORS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xl">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
                <input 
                  type="text" 
                  placeholder="Поиск по имени, email, ID или паспорту..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
              </div>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
              >
                Добавить инвестора
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Инвестор</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Баланс (USD)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Управление</th>
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
                            <p className="text-xs text-slate-500 mono font-medium">{inv.id} • {inv.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border shadow-sm ${
                          inv.status === UserStatus.ACTIVE ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {inv.status === UserStatus.ACTIVE ? 'Активен' : 'Блок'}
                        </span>
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
                          Редактировать
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvestors.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-400 italic font-medium">Ничего не найдено по данному запросу.</td>
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
                   placeholder="Фильтр транзакций..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                 />
               </div>
               <div className="flex gap-4">
                  <div className="px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Общий ввод</span>
                    <span className="text-xl font-black leading-none">${totalDepositedFromBase.toLocaleString()}</span>
                  </div>
               </div>
             </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID TX</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Инвестор</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Сумма</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Время</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус</th>
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
                          {tx.status === 'SUCCESS' ? 'Успешно' : tx.status === 'PENDING' ? 'Ожидание' : 'Ошибка'}
                        </span>
                      </td>
                    </tr>
                  ))}
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
          onClose={() => setSelectedInvestor(null)} 
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

            await fetch(`${base}/users/${dbId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userPayload)
            });

            await fetch(`${base}/balances`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: dbId,
                currency: 'USD',
                amount: updated.balances.main
              })
            });

            await fetch(`${base}/balances`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
