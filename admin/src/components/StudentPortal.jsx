import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, MapPin, Calendar, Megaphone, GraduationCap, XCircle, LogOut, RefreshCw } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function StudentPortal({ user, profile, onLogout }) {
  const studentSection = profile?.section || user?.user_metadata?.section || 'S1';
  const studentName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0];

  const [activeTab, setActiveTab] = useState('schedule');
  const [sessions, setSessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [studentSection]);

  async function loadData() {
    setLoading(true);

    const { data: sData } = await supabase
      .from('v_student_effective_schedule')
      .select('*')
      .eq('section', studentSection)
      .order('day_of_week')
      .order('scheduled_start_time');
    if (sData) setSessions(sData);

    const { data: aData } = await supabase
      .from('announcements')
      .select('*')
      .or(`target_section.eq.${studentSection},target_section.eq.ALL`)
      .order('created_at', { ascending: false });
    if (aData) setAnnouncements(aData);

    const { data: eData } = await supabase
      .from('exams')
      .select('*, modules(title, code), rooms(room_number)')
      .or(`target_section.eq.${studentSection},target_section.eq.ALL`)
      .order('exam_date');
    if (eData) setExams(eData);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-800 rounded-xl flex items-center justify-center font-bold text-lg border border-emerald-700">
              <GraduationCap className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">ENCG Assistant</h1>
              <p className="text-xs text-emerald-200">Espace Étudiant • Section {studentSection}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold block leading-tight">{studentName}</span>
              <span className="text-[11px] text-emerald-300">{user.email}</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-800 border border-emerald-700 rounded-lg text-xs font-extrabold text-white">
              {studentSection}
            </span>
            <button
              onClick={onLogout}
              title="Déconnexion"
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 flex border-t border-emerald-800/60">
          {[
            { id: 'schedule', label: 'Emploi du Temps', icon: Clock },
            { id: 'announcements', label: `Annonces (${announcements.length})`, icon: Megaphone },
            { id: 'exams', label: `Examens (${exams.length})`, icon: Calendar },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 transition ${
                  active ? 'border-white text-white font-bold' : 'border-transparent text-emerald-200 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Informations pour la <span className="text-emerald-800 font-extrabold">Section {studentSection}</span>
          </p>
          <button
            onClick={loadData}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement...</div>
        ) : (
          <>
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">Aucun cours programmé pour votre section.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {sessions.map(s => (
                      <div
                        key={s.session_id}
                        className={`p-4 rounded-2xl border shadow-sm transition ${
                          s.is_cancelled
                            ? 'bg-red-50/70 border-red-200 opacity-75'
                            : s.has_active_override
                            ? 'bg-amber-50/80 border-amber-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            {DAYS[s.day_of_week - 1]}
                          </span>
                          <span className="font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {s.scheduled_start_time.slice(0, 5)} - {s.scheduled_end_time.slice(0, 5)}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mt-2 leading-tight">
                          {s.module_title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          {s.professor_name || 'Professeur non spécifié'}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {s.has_active_override ? (
                              <span className="text-amber-800 flex items-center gap-1">
                                <span className="line-through text-slate-400">{s.original_room}</span>
                                <span>→ {s.effective_room}</span>
                              </span>
                            ) : (
                              <span className="text-slate-700">{s.effective_room}</span>
                            )}
                          </div>

                          {s.is_cancelled ? (
                            <span className="text-red-700 font-bold flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded">
                              <XCircle className="w-3.5 h-3.5" /> Annulé
                            </span>
                          ) : s.has_active_override ? (
                            <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                              Changement de salle
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Maintenu</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">Aucune annonce pour le moment.</p>
                  </div>
                ) : (
                  announcements.map(a => (
                    <div
                      key={a.id}
                      className={`p-4 rounded-2xl border bg-white shadow-sm ${
                        a.priority === 'urgent' ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            a.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {a.priority === 'urgent' ? 'URGENT' : 'INFO'} • {a.target_section === 'ALL' ? 'Toute la promotion' : `Section ${a.target_section}`}
                        </span>
                        <span className="text-slate-400">
                          {new Date(a.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
                      <p className="text-sm text-slate-700 mt-1 whitespace-pre-line leading-relaxed">{a.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'exams' && (
              <div className="space-y-3">
                {exams.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">Aucun examen programmé pour votre section.</p>
                  </div>
                ) : (
                  exams.map(ex => (
                    <div key={ex.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded">
                          Section {ex.target_section}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{ex.modules?.title}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          <span className="font-semibold text-slate-700">Programme:</span> {ex.syllabus_scope || 'Tout le cours'}
                        </p>
                        {ex.required_materials && (
                          <p className="text-xs text-amber-800 mt-0.5 font-medium">
                            Matériel requis: {ex.required_materials}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <span className="font-bold text-slate-900 block text-sm">{ex.exam_date}</span>
                        <span className="text-slate-500 font-medium">
                          {ex.start_time.slice(0, 5)} - {ex.end_time.slice(0, 5)}
                        </span>
                        <span className="block font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-1.5 text-center">
                          {ex.rooms?.room_number}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
