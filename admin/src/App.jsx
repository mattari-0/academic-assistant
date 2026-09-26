import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { 
  Calendar, Megaphone, Clock, ShieldCheck, LogOut, UserPlus, X, 
  Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2, BookOpen, ShieldAlert
} from 'lucide-react';
import ScheduleManager from './components/ScheduleManager';
import AnnouncementsManager from './components/AnnouncementsManager';
import ExamsManager from './components/ExamsManager';
import AssignmentsManager from './components/AssignmentsManager';
import AuditLogsManager from './components/AuditLogsManager';
import StudentPortal from './components/StudentPortal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');

  // Auth Screen State
  const [authMode, setAuthMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState('S1');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Modal: Add Admin
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function resolveUser(user) {
    if (!user) {
      setCurrentUser(null);
      setUserProfile(null);
      setCheckingAuth(false);
      return;
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const isMaster = user.email === 'benchanb.othman.2008@gmail.com';
    const role = prof?.role || (isMaster ? 'admin' : (user.user_metadata?.role || 'student'));

    setCurrentUser(user);
    setUserProfile({
      ...prof,
      role: role,
      section: prof?.section || user.user_metadata?.section || 'S1',
      full_name: prof?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]
    });

    setCheckingAuth(false);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'signup') {
        if (!fullName.trim() || !email.trim() || !password) {
          throw new Error("Le nom complet, l'email et le mot de passe sont obligatoires.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role: 'student',
              section: section,
              full_name: fullName.trim()
            }
          }
        });

        if (error) throw error;

        if (data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName.trim(),
            role: 'student',
            section: section
          });

          if (data.session) {
            resolveUser(data.user);
          } else {
            setAuthSuccess("Inscription réussie ! Vous pouvez vous connecter avec votre nom ou email.");
            setIdentifier(fullName.trim());
            setAuthMode('login');
          }
        }
      } else {
        let loginEmail = identifier.trim();
        if (!loginEmail) throw new Error("Veuillez saisir votre email ou nom complet.");

        if (!loginEmail.includes('@')) {
          const { data: prof, error: profErr } = await supabase
            .from('profiles')
            .select('email')
            .ilike('full_name', loginEmail)
            .maybeSingle();

          if (profErr || !prof?.email) {
            throw new Error(`Aucun compte trouvé au nom de "${loginEmail}".`);
          }
          loginEmail = prof.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password
        });

        if (error) throw error;
        if (data?.user) resolveUser(data.user);
      }
    } catch (err) {
      setAuthError(err.message || "Erreur d'authentification");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
    setIdentifier('');
  }

  async function handleCreateAdmin(e) {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword) return;
    setAdminSubmitting(true);

    try {
      const tempClient = createClient(
        'https://hdheotqkjxnvplgphnms.supabase.co',
        'sb_publishable_i9PuToqD7zJ2e8uJD0q3mw_U2FUdr1K',
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data, error } = await tempClient.auth.signUp({
        email: newAdminEmail.trim(),
        password: newAdminPassword,
        options: {
          data: { role: 'admin', full_name: newAdminName.trim() || 'Administrateur' }
        }
      });

      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: newAdminEmail.trim(),
          role: 'admin',
          full_name: newAdminName.trim() || 'Administrateur'
        });
      }

      alert(`Administrateur ${newAdminEmail} créé avec succès !`);
      setShowAddAdmin(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setAdminSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              className={`py-2.5 text-sm font-bold rounded-2xl transition ${
                authMode === 'login' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthSuccess(''); }}
              className={`py-2.5 text-sm font-bold rounded-2xl transition ${
                authMode === 'signup' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Inscription
            </button>
          </div>

          <div className="p-7">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-950 text-white rounded-2xl mx-auto flex items-center justify-center font-bold text-xl shadow">
                E
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mt-3">
                {authMode === 'login' ? 'Connexion' : 'Inscription Étudiant'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'login'
                  ? 'Connectez-vous avec votre email ou votre nom complet'
                  : 'Renseignez vos informations pour créer votre profil'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom & Prénom (Obligatoire)</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Ex: Yasmine Alami"
                        className="w-full text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['S1', 'S2', 'S3'].map(sec => (
                        <button
                          type="button"
                          key={sec}
                          onClick={() => setSection(sec)}
                          className={`py-2 text-xs font-bold rounded-xl border transition ${
                            section === sec
                              ? 'bg-blue-950 text-white border-blue-950 shadow'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Section {sec}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {authMode === 'signup' ? 'Adresse Email (Obligatoire)' : 'Email ou Nom complet'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={authMode === 'signup' ? email : identifier}
                    onChange={e => authMode === 'signup' ? setEmail(e.target.value) : setIdentifier(e.target.value)}
                    placeholder={authMode === 'signup' ? 'email@encg.ma' : 'email@encg.ma ou Nom complet'}
                    className="w-full text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <span>
                  {authLoading
                    ? 'Traitement...'
                    : authMode === 'signup'
                    ? 'Créer mon compte'
                    : 'Se connecter'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Student View
  if (userProfile?.role === 'student') {
    return <StudentPortal user={currentUser} profile={userProfile} onLogout={handleLogout} />;
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-blue-950 text-white shadow border-b border-blue-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center font-bold text-base border border-blue-700">
              E
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">ENCG Assistant — Dashboard</h1>
              <p className="text-xs text-blue-300">Portail Administratif</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddAdmin(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-800 hover:bg-blue-700 text-white rounded-lg border border-blue-700 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Ajouter Admin
            </button>
            <span className="text-xs bg-blue-900 border border-blue-700 px-2.5 py-1 rounded-full text-blue-200 hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {userProfile?.full_name || currentUser.email}
            </span>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Extended Navigation Bar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
          {[
            { id: 'schedule', label: 'Emploi du Temps', icon: Clock },
            { id: 'announcements', label: 'Annonces', icon: Megaphone },
            { id: 'exams', label: 'Examens', icon: Calendar },
            { id: 'assignments', label: 'Devoirs', icon: BookOpen },
            { id: 'audit', label: 'Journal Audit', icon: ShieldAlert },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
                  active ? 'border-blue-900 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'schedule' && <ScheduleManager />}
        {activeTab === 'announcements' && <AnnouncementsManager />}
        {activeTab === 'exams' && <ExamsManager />}
        {activeTab === 'assignments' && <AssignmentsManager />}
        {activeTab === 'audit' && <AuditLogsManager />}
      </main>

      {/* Modal: Add Admin */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-900" />
                Créer un compte Administrateur
              </h3>
              <button onClick={() => setShowAddAdmin(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  placeholder="Ex: Pr Directeur"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email de l'administrateur</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="admin.nom@encg.ma"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe temporaire</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdmin(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adminSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow"
                >
                  {adminSubmitting ? 'Création...' : 'Créer Administrateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
