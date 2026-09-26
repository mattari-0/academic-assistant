import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ShieldCheck, AlertCircle, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('benchanb.othman.2008@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // --- 1. Sign Up Admin ---
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { role: 'admin' }
          }
        });

        if (error) throw error;

        if (data?.user) {
          // Ensure role is recorded in profiles table
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            role: 'admin'
          });

          if (data.session) {
            onLoginSuccess(data.user);
            return;
          } else {
            setSuccessMsg("Compte créé ! Vous pouvez maintenant vous connecter.");
            setIsSignUp(false);
          }
        }
      } else {
        // --- 2. Sign In Admin ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        const user = data.user;

        // Verify admin role in profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isMasterAdmin = user.email === 'benchanb.othman.2008@gmail.com';
        if (profile?.role !== 'admin' && !isMasterAdmin) {
          await supabase.auth.signOut();
          throw new Error("Accès refusé : Ce compte n'a pas les droits d'administrateur.");
        }

        // Auto-promote master admin if needed
        if (isMasterAdmin && profile?.role !== 'admin') {
          await supabase.from('profiles').upsert({ id: user.id, email: user.email, role: 'admin' });
        }

        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMsg(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-950 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-xl shadow">
            E
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-3">
            {isSignUp ? 'Créer un Compte Administrateur' : 'Portail Administratif'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp ? 'Définissez vos identifiants administrateur' : 'Connexion sécurisée pour la gestion académique'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Administrateur</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@encg.ma"
                className="w-full text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-lg shadow transition flex items-center justify-center gap-2"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {loading
              ? 'Traitement...'
              : isSignUp
              ? 'Créer mon compte et entrer'
              : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs text-blue-900 hover:underline font-semibold"
          >
            {isSignUp
              ? 'Déjà un compte ? Se connecter'
              : "Première connexion ? Créer mon compte administrateur"}
          </button>
        </div>
      </div>
    </div>
  );
}
