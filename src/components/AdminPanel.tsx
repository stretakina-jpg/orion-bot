import React, { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  Users,
  File as FileIcon,
  Search,
  Loader2,
  Crown,
  Medal,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Upload,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Plus,
  ArrowLeft,
  Zap,
  KeyRound,
  DollarSign,
  Wallet,
  TrendingUp,
  SlidersHorizontal,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { supabase, ADMIN_USERS_FN_URL, ADMIN_SECRET, ADMIN_STORAGE_BUCKET, LOGO_URL } from '../lib/supabase';
import { UserAccount, StorageFile } from '../types';
import { getUserBalances, setUserBalances, loadOrionConfig } from '../lib/orionConfig';

const ADMIN_USER = 'admin';
const ADMIN_PASS = '#Orion12';
const SESSION_STORAGE_KEY = 'orion_admin_session';
const LOCAL_ACCOUNTS_KEY = 'orion_local_admin_accounts';

interface AdminPanelProps {
  onBack?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  // Conectado por padrão conforme solicitado: sem exigir digitar usuário e senha!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'ok');
      return true;
    }
    return true;
  });

  const [inputUsername, setInputUsername] = useState(ADMIN_USER);
  const [inputPassword, setInputPassword] = useState(ADMIN_PASS);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'editor' | 'files'>('editor');

  // Accounts tab state
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add account form state
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState<'ouro' | 'prata'>('ouro');
  const [newRealBal, setNewRealBal] = useState<number>(500);
  const [newDemoBal, setNewDemoBal] = useState<number>(10000);
  const [addingUser, setAddingUser] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState('');

  // Balance Editor State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<string>('glkhali7777@gmail.com');
  const [editRealBalance, setEditRealBalance] = useState<number>(500);
  const [editDemoBalance, setEditDemoBalance] = useState<number>(10000);
  const [quickAddAmount, setQuickAddAmount] = useState<number>(100);
  const [editorSuccessMsg, setEditorSuccessMsg] = useState<string>('');

  // Files tab state
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'ok');
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
      loadFiles();
    }
  }, [isAuthenticated]);

  // When selected user changes in the editor, load their current balances
  useEffect(() => {
    if (selectedUserForEdit) {
      const b = getUserBalances(selectedUserForEdit);
      setEditRealBalance(b.realBalance);
      setEditDemoBalance(b.demoBalance);
    }
  }, [selectedUserForEdit]);

  const getSeedAccounts = (): UserAccount[] => [
    {
      id: 'acc_vip_glkhali',
      email: 'glkhali7777@gmail.com',
      plan: 'ouro',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      last_seen_at: new Date().toISOString(),
      realBalance: 500,
      demoBalance: 10000,
    },
    {
      id: 'acc_vip_stretakina',
      email: 'stretakina@gmail.com',
      plan: 'ouro',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      last_seen_at: new Date().toISOString(),
      realBalance: 500,
      demoBalance: 10000,
    },
    {
      id: 'acc_demo_orion',
      email: 'trader.vip@orion.com',
      plan: 'ouro',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      last_seen_at: new Date(Date.now() - 3600000).toISOString(),
      realBalance: 1250,
      demoBalance: 10000,
    },
  ];

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    setAccountsError(null);

    let localList: UserAccount[] = [];
    try {
      const saved = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      if (saved) {
        localList = JSON.parse(saved);
      }
    } catch {}

    try {
      const res = await fetch(`${ADMIN_USERS_FN_URL}?action=list`, {
        headers: { 'X-Admin-Secret': ADMIN_SECRET },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao carregar contas da nuvem');
      
      let fetched: UserAccount[] = data.accounts || [];

      // Unir com contas padrão essenciais (garantir glkhali7777 e stretakina)
      const seed = getSeedAccounts();
      const existingEmails = new Set(fetched.map((a) => a.email.toLowerCase()));

      for (const s of [...seed, ...localList]) {
        if (!existingEmails.has(s.email.toLowerCase())) {
          fetched.push(s);
          existingEmails.add(s.email.toLowerCase());
        }
      }

      // Attach local real/demo balances to each account
      fetched = fetched.map((acc) => {
        const b = getUserBalances(acc.email);
        return {
          ...acc,
          realBalance: b.realBalance,
          demoBalance: b.demoBalance,
        };
      });

      setAccounts(fetched);
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(fetched));
    } catch {
      try {
        const { data: usersData } = await supabase
          .from('user_accounts')
          .select('*')
          .order('created_at', { ascending: false });
        const { data: premData } = await supabase.from('premium_users').select('email');
        const premSet = new Set((premData || []).map((p: any) => p.email.toLowerCase()));

        let combined: UserAccount[] = [];
        if (usersData && usersData.length > 0) {
          combined = usersData.map((u: any) => ({
            id: u.id,
            email: u.email,
            plan: premSet.has(u.email.toLowerCase()) ? 'ouro' : 'prata',
            created_at: u.created_at || new Date().toISOString(),
            last_seen_at: u.last_seen_at,
          }));
        }

        const existingEmails = new Set(combined.map((a) => a.email.toLowerCase()));
        for (const s of [...getSeedAccounts(), ...localList]) {
          if (!existingEmails.has(s.email.toLowerCase())) {
            combined.push(s);
            existingEmails.add(s.email.toLowerCase());
          }
        }

        combined = combined.map((acc) => {
          const b = getUserBalances(acc.email);
          return {
            ...acc,
            realBalance: b.realBalance,
            demoBalance: b.demoBalance,
          };
        });

        setAccounts(combined);
        localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(combined));
        return;
      } catch {
        const fallback = (localList.length > 0 ? localList : getSeedAccounts()).map((acc) => {
          const b = getUserBalances(acc.email);
          return { ...acc, realBalance: b.realBalance, demoBalance: b.demoBalance };
        });
        setAccounts(fallback);
      }
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAddingUser(true);
    setAddSuccessMsg('');

    const targetEmail = newEmail.trim().toLowerCase();

    try {
      await fetch(`${ADMIN_USERS_FN_URL}?action=${newPlan === 'ouro' ? 'upgrade' : 'create'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ email: targetEmail }),
      });
    } catch {}

    // Save balances for this user
    setUserBalances(targetEmail, newRealBal, newDemoBal);

    const newAcc: UserAccount = {
      id: `acc_${Date.now()}`,
      email: targetEmail,
      plan: newPlan,
      created_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      realBalance: newRealBal,
      demoBalance: newDemoBal,
    };

    setAccounts((prev) => {
      const filtered = prev.filter((a) => a.email.toLowerCase() !== targetEmail);
      const next = [newAcc, ...filtered];
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(next));
      return next;
    });

    setAddSuccessMsg(`Conta ${targetEmail} criada com R$ ${newRealBal.toFixed(2)} na Real!`);
    setNewEmail('');
    setAddingUser(false);
    setTimeout(() => setAddSuccessMsg(''), 4000);
  };

  const handleAccountAction = async (email: string, action: 'upgrade' | 'downgrade' | 'delete') => {
    setActionInProgress(`${email}:${action}`);
    const normalized = email.toLowerCase();

    try {
      await fetch(`${ADMIN_USERS_FN_URL}?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': ADMIN_SECRET,
        },
        body: JSON.stringify({ email: normalized }),
      });
    } catch {
      try {
        if (action === 'upgrade') {
          await supabase.from('premium_users').upsert({ email: normalized });
        } else if (action === 'downgrade') {
          await supabase.from('premium_users').delete().eq('email', normalized);
        } else if (action === 'delete') {
          await supabase.from('user_accounts').delete().eq('email', normalized);
          await supabase.from('premium_users').delete().eq('email', normalized);
        }
      } catch {}
    }

    setAccounts((prev) => {
      let updated: UserAccount[];
      if (action === 'delete') {
        updated = prev.filter((a) => a.email.toLowerCase() !== normalized);
      } else {
        updated = prev.map((a) =>
          a.email.toLowerCase() === normalized
            ? { ...a, plan: action === 'upgrade' ? 'ouro' : 'prata' }
            : a
        );
      }
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updated));
      return updated;
    });

    setActionInProgress(null);
  };

  // Balance Editor Actions
  const handleSaveBalances = (targetUser: string, newReal: number, newDemo: number) => {
    const cleanUser = targetUser.toLowerCase().trim();
    setUserBalances(cleanUser, Number(newReal), Number(newDemo));

    // Update table view
    setAccounts((prev) =>
      prev.map((a) =>
        a.email.toLowerCase() === cleanUser
          ? { ...a, realBalance: Number(newReal), demoBalance: Number(newDemo) }
          : a
      )
    );

    setEditorSuccessMsg(`Saldo de ${cleanUser} atualizado com sucesso! (Real: R$ ${Number(newReal).toFixed(2)} | Demo: $ ${Number(newDemo).toFixed(2)})`);
    setTimeout(() => setEditorSuccessMsg(''), 4000);
  };

  const handleQuickAddReal = (amountToAdd: number) => {
    const current = Number(editRealBalance) || 0;
    const next = Math.max(0, current + amountToAdd);
    setEditRealBalance(next);
    handleSaveBalances(selectedUserForEdit, next, editDemoBalance);
  };

  const handleQuickAddDemo = (amountToAdd: number) => {
    const current = Number(editDemoBalance) || 0;
    const next = Math.max(0, current + amountToAdd);
    setEditDemoBalance(next);
    handleSaveBalances(selectedUserForEdit, editRealBalance, next);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'ok');
    setIsAuthenticated(true);
    setAuthError('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAuthenticated(false);
    setInputUsername(ADMIN_USER);
    setInputPassword(ADMIN_PASS);
  };

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase.storage.from(ADMIN_STORAGE_BUCKET).list('', {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (!error && data) {
        const fileList: StorageFile[] = data
          .filter((f) => f.name && !f.name.startsWith('.'))
          .map((f) => {
            const { data: pubData } = supabase.storage
              .from(ADMIN_STORAGE_BUCKET)
              .getPublicUrl(f.name);
            return {
              name: f.name,
              url: pubData.publicUrl,
              size: (f.metadata as any)?.size,
              createdAt: f.created_at,
            };
          });
        setFiles(fileList);
      }
    } catch {}
    setLoadingFiles(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;

    setUploading(true);
    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      setUploadStatus(`Enviando ${i + 1}/${inputFiles.length}: ${file.name}`);
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = `${Date.now()}-${cleanName}`;

      const { error } = await supabase.storage.from(ADMIN_STORAGE_BUCKET).upload(uniqueName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        console.error(error);
        alert(`Falha ao enviar ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    setUploadStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    await loadFiles();
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Excluir ${fileName}?`)) return;
    const { error } = await supabase.storage.from(ADMIN_STORAGE_BUCKET).remove([fileName]);
    if (error) {
      alert(`Falha ao excluir: ${error.message}`);
      return;
    }
    await loadFiles();
  };

  const handleCopyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 1800);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Se o usuário tiver deslogado manualmente, mostra tela com credenciais já preenchidas
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/60 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-3 border border-purple-500/40">
                <ShieldCheck className="w-7 h-7 text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold font-heading text-white">Painel Master Admin</h1>
              <p className="text-slate-400 text-xs mt-1">Orion Trader Bot • Conexão Automática</p>
            </div>

            <div className="mb-6 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1 text-slate-300">
              <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Credenciais Prontas:</span>
              </div>
              <p>Usuário: <code className="text-white font-bold">{ADMIN_USER}</code></p>
              <p>Senha: <code className="text-white font-bold">{ADMIN_PASS}</code></p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-medium">
                  Usuário Admin
                </label>
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-medium">
                  Senha Master
                </label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {authError && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/30 text-sm"
              >
                Conectar ao Admin Automaticamente
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const filteredAccounts = accounts.filter((a) =>
    searchQuery.trim() ? a.email.toLowerCase().includes(searchQuery.trim().toLowerCase()) : true
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 selection:text-white">
      {/* Admin Top Header */}
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Voltar ao Painel Principal"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <img src={LOGO_URL} alt="Orion" className="h-7 w-auto object-contain hidden sm:block" />
            <div className="hidden sm:block h-5 w-px bg-white/15" />
            <div>
              <span className="font-heading font-bold text-sm bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent block">
                PAINEL MASTER ADMIN & EDITOR
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Conectado Automaticamente ({ADMIN_USER})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-400">
              <span>Admin:</span>
              <code className="text-purple-300 font-mono font-bold">{ADMIN_USER}</code>
              <span>• Senha:</span>
              <code className="text-purple-300 font-mono font-bold">{ADMIN_PASS}</code>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Ir para Trading</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Trocar usuário"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desconectar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Editor de Saldos (Demo & Real)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contas de Usuários ({accounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileIcon className="w-4 h-4" />
            <span>Arquivos & Mídia ({files.length})</span>
          </button>
        </div>

        {/* ===================== TAB: EDITOR DE SALDOS (DEMO & REAL) ===================== */}
        {activeTab === 'editor' && (
          <section className="space-y-6">
            {/* Quick Banner Alert */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-slate-900 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Editor de Saldos em Tempo Real</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      AO VIVO ⚡
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Selecione qualquer usuário para ver exatamente quanto ele tem na Conta Demo e Conta Real, e adicione ou aumente os valores na hora.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={loadAccounts}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronizar</span>
                </button>
              </div>
            </div>

            {/* Editor Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Selection List (Left Column) */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Selecione o Usuário
                  </h3>
                  <span className="text-[11px] text-purple-300 font-mono font-semibold">
                    {accounts.length} cadastrados
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {accounts.map((acc) => {
                    const isSelected = acc.email.toLowerCase() === selectedUserForEdit.toLowerCase();
                    const bal = getUserBalances(acc.email);

                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => setSelectedUserForEdit(acc.email)}
                        className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-purple-900/30 border-purple-500/50 shadow-md shadow-purple-950/50'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-white truncate">
                            {acc.email}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                              acc.plan === 'ouro'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-white/10 text-slate-300 border-white/10'
                            }`}
                          >
                            {acc.plan}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono mt-0.5">
                          <span className="text-emerald-400 font-semibold">
                            Real: R$ {bal.realBalance.toFixed(2)}
                          </span>
                          <span className="text-amber-400/80">
                            Demo: $ {bal.demoBalance.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Balance Modifier & Controls (Right 2 Columns) */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-6">
                  {/* Selected User Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Editando Saldo do Usuário:
                      </span>
                      <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <span>{selectedUserForEdit}</span>
                        {selectedUserForEdit.toLowerCase() === 'glkhali7777@gmail.com' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                            CONTA ATIVA
                          </span>
                        )}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Sincronização</span>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Pronto para Atualizar
                      </span>
                    </div>
                  </div>

                  {/* Dual Balances Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* CONTA REAL */}
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          Conta Real (BRL)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-bold font-mono">
                          R$ {Number(editRealBalance).toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Definir Novo Saldo Real (R$):
                        </label>
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={editRealBalance}
                          onChange={(e) => setEditRealBalance(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-black/70 border border-emerald-500/40 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      {/* Quick Increase Buttons */}
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                          Aumentar Saldo Rapidamente (+R$):
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[50, 100, 250, 500].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => handleQuickAddReal(amt)}
                              className="py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-emerald-300 font-bold text-xs cursor-pointer transition-colors"
                            >
                              +{amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CONTA DEMO */}
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-amber-400" />
                          Conta Demo (Treinamento)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold font-mono">
                          $ {Number(editDemoBalance).toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Definir Novo Saldo Demo ($):
                        </label>
                        <input
                          type="number"
                          step="500"
                          min="0"
                          value={editDemoBalance}
                          onChange={(e) => setEditDemoBalance(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-black/70 border border-amber-500/40 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Quick Increase Demo Buttons */}
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                          Recarregar Demo Rapidamente:
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1000, 5000, 10000, 25000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => handleQuickAddDemo(amt)}
                              className="py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-300 font-bold text-xs cursor-pointer transition-colors"
                            >
                              +{amt >= 1000 ? `${amt / 1000}k` : amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Save Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveBalances(selectedUserForEdit, editRealBalance, editDemoBalance)}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Salvar e Atualizar Saldos de {selectedUserForEdit}</span>
                    </button>
                  </div>

                  {editorSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{editorSuccessMsg}</span>
                    </div>
                  )}
                </div>

                {/* Quick Addition Input Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Adição Rápida de Saldo Real</span>
                    <span className="text-[11px] text-slate-400">
                      Digite um valor específico para creditar na conta {selectedUserForEdit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                        R$
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={quickAddAmount}
                        onChange={(e) => setQuickAddAmount(Number(e.target.value))}
                        className="pl-9 pr-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white font-mono font-bold w-28 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickAddReal(Number(quickAddAmount) || 0)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Creditar Valor</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===================== TAB: USERS / ACCOUNTS ===================== */}
        {activeTab === 'users' && (
          <section className="space-y-6">
            {/* Top Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-xs text-slate-400 block">Total de Usuários</span>
                <span className="text-2xl font-bold font-heading text-white">{accounts.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-xs text-amber-300/80 block">Plano Ouro VIP (Ilimitado)</span>
                <span className="text-2xl font-bold font-heading text-amber-300">
                  {accounts.filter((a) => a.plan === 'ouro').length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-xs text-slate-400 block">Plano Prata / Básico</span>
                <span className="text-2xl font-bold font-heading text-slate-300">
                  {accounts.filter((a) => a.plan === 'prata').length}
                </span>
              </div>
            </div>

            {/* Quick Add User Form with Initial Balances */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Adicionar Nova Conta com Saldo Inicial Personalizado</span>
              </h3>

              <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="novo.trader@gmail.com"
                  className="px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400 sm:col-span-2"
                />

                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as 'ouro' | 'prata')}
                  className="px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="ouro" className="bg-slate-900 text-amber-300">Plano Ouro (VIP)</option>
                  <option value="prata" className="bg-slate-900 text-slate-300">Plano Prata</option>
                </select>

                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-mono font-bold">R$</span>
                  <input
                    type="number"
                    value={newRealBal}
                    onChange={(e) => setNewRealBal(Number(e.target.value))}
                    placeholder="Saldo Real"
                    className="w-full pl-8 pr-2 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-400"
                    title="Saldo inicial Conta Real"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {addingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Criar Conta</span>
                </button>
              </form>

              {addSuccessMsg && (
                <div className="mt-2 text-xs text-emerald-400 font-medium animate-fadeIn">
                  ✓ {addSuccessMsg}
                </div>
              )}
            </div>

            {/* User List Table with Balance Columns & Direct Edit */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">Contas Cadastradas ({filteredAccounts.length})</h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por e-mail"
                      className="pl-8 pr-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors w-full sm:w-60"
                    />
                  </div>

                  <button
                    onClick={loadAccounts}
                    className="text-xs text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer font-medium"
                  >
                    Atualizar
                  </button>
                </div>
              </div>

              {accountsError && (
                <div className="m-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs">
                  {accountsError}
                </div>
              )}

              {loadingAccounts ? (
                <div className="py-16 flex items-center justify-center text-slate-400 gap-2 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <span>Carregando contas...</span>
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhuma conta encontrada para o termo pesquisado.</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {filteredAccounts.map((account) => {
                    const isOuro = account.plan === 'ouro';
                    const isUpgrading = actionInProgress === `${account.email}:upgrade`;
                    const isDowngrading = actionInProgress === `${account.email}:downgrade`;
                    const isDeleting = actionInProgress === `${account.email}:delete`;
                    const bal = getUserBalances(account.email);

                    return (
                      <li key={account.email} className="p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                isOuro
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                  : 'bg-white/5 border-white/10 text-slate-400'
                              }`}
                            >
                              {isOuro ? (
                                <Crown className="w-4 h-4" />
                              ) : (
                                <Medal className="w-4 h-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-white text-xs sm:text-sm font-mono truncate">
                                  {account.email}
                                </p>
                                <span
                                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                                    isOuro
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-white/10 text-slate-300 border-white/15'
                                  }`}
                                >
                                  {isOuro ? 'VIP OURO' : 'PRATA'}
                                </span>
                                {account.email.toLowerCase() === 'glkhali7777@gmail.com' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    CONTA ATIVA ⚡
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Registrado em {new Date(account.created_at).toLocaleDateString('pt-BR')}
                                {account.last_seen_at && (
                                  <> • Acesso {new Date(account.last_seen_at).toLocaleTimeString('pt-BR')}</>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Live Balance Summary for this account */}
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-white/10 text-xs font-mono">
                            <span className="text-emerald-400 font-bold">
                              Real: R$ {bal.realBalance.toFixed(2)}
                            </span>
                            <span className="text-slate-500">|</span>
                            <span className="text-amber-400/90 font-medium">
                              Demo: $ {bal.demoBalance.toFixed(2)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedUserForEdit(account.email);
                                setActiveTab('editor');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              title="Editar saldos desta conta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar Saldo</span>
                            </button>

                            {isOuro ? (
                              <button
                                onClick={() => handleAccountAction(account.email, 'downgrade')}
                                disabled={isDowngrading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-60 cursor-pointer"
                              >
                                {isDowngrading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ArrowDownCircle className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span>Mudar p/ Prata</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAccountAction(account.email, 'upgrade')}
                                disabled={isUpgrading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
                              >
                                {isUpgrading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ArrowUpCircle className="w-3.5 h-3.5" />
                                )}
                                <span>Upgrade Ouro</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Excluir conta ${account.email}?`)) {
                                  handleAccountAction(account.email, 'delete');
                                }
                              }}
                              disabled={isDeleting}
                              className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                              title="Excluir conta"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* ===================== TAB: FILES ===================== */}
        {activeTab === 'files' && (
          <section className="space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
              <label
                htmlFor="admin-file-upload"
                className={`flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                  uploading
                    ? 'border-purple-500/40 bg-purple-500/5'
                    : 'border-white/15 hover:border-purple-500/40 hover:bg-white/[0.02]'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                    <p className="text-white text-xs font-semibold">{uploadStatus}</p>
                    <p className="text-slate-400 text-[10px] mt-1">Aguarde o envio...</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/40 rounded-2xl flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm font-bold text-white mb-1">Clique para enviar arquivos</p>
                    <p className="text-slate-400 text-xs">Imagens, vídeos, scripts ou áudios para a nuvem</p>
                  </>
                )}
                <input
                  id="admin-file-upload"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold text-sm">Arquivos Armazenados ({files.length})</h2>
                <button
                  onClick={loadFiles}
                  className="text-xs text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                >
                  Atualizar
                </button>
              </div>

              {loadingFiles ? (
                <div className="py-16 flex items-center justify-center text-slate-400 gap-2 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <span>Carregando arquivos...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  <FileIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum arquivo enviado ainda.</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {files.map((file) => (
                    <li key={file.name} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                            <FileIcon className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs sm:text-sm text-white truncate">{file.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {formatFileSize(file.size)}
                              {file.createdAt && ` • ${new Date(file.createdAt).toLocaleDateString('pt-BR')}`}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">{file.url}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopyLink(file.url)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedUrl === file.url ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Abrir arquivo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleDeleteFile(file.name)}
                            className="p-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl transition-colors cursor-pointer"
                            title="Excluir arquivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
