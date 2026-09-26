import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, AlertCircle, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthPortal({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState('S1');

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
        // --- 1. Student Sign Up (Only for students) ---
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
            onLoginSuccess(data.user);
          } else {
            setSuccessMsg("Compte étudiant créé avec succès ! Vous pouvez maintenant vous connecter.");
            setIsSignUp(false);
          }
        }
      } else {
        // --- 2. Unified Sign In (Auto-detects Admin vs Student) ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (data?.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-950 text-white rounded-2xl mx-auto flex items-center justify-center font-bold text-xl shadow">
            E
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-3">
            {isSignUp ? 'Créer un Compte Étudiant' : 'Portail Académique ENCG'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp
              ? 'Renseignez vos coordonnées pour accéder à votre emploi du temps'
              : 'Connectez-vous pour accéder à votre espace'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fields only visible during Student Sign Up */}
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom & Prénom</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Votre Section</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nom@encg.ma"
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
            disabled={loading}
            className="w-full py-2.5 text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <span>
              {loading
                ? 'Traitement en cours...'
                : isSignUp
                ? 'Créer mon compte étudiant'
                : 'Se connecter'}
            </span>
            <ArrowRight className="w-4 h-4" />
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
            className="text-xs font-bold text-blue-950 hover:underline"
          >
            {isSignUp
              ? 'Déjà inscrit ? Se connecter'
              : 'Nouveau étudiant ? Créer un compte'}
          </button>
        </div>
      </div>
    </div>
  );
}
