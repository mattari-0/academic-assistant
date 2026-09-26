import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Clock, MapPin, CheckCircle, RefreshCw, XCircle } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ScheduleManager() {
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedSection, setSelectedSection] = useState('S2');
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [overrideRoom, setOverrideRoom] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedule();
    fetchRooms();
  }, [selectedSection]);

  async function fetchSchedule() {
    setLoading(true);
    const { data } = await supabase
      .from('v_student_effective_schedule')
      .select('*')
      .eq('section', selectedSection)
      .order('day_of_week')
      .order('scheduled_start_time');
    if (data) setSessions(data);
    setLoading(false);
  }

  async function fetchRooms() {
    const { data } = await supabase.from('rooms').select('*').order('room_number');
    if (data) setRooms(data);
  }

  async function handleRoomChange(e) {
    e.preventDefault();
    if (!selectedSession || !overrideRoom) return;
    setSubmitting(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await supabase.from('schedule_exceptions').insert([{
      session_id: selectedSession.session_id,
      exception_type: 'room_change',
      replacement_room_id: overrideRoom,
      new_date: todayStr,
      valid_until: expiryDate.toISOString(),
      reason: overrideReason || 'Modification administrative de salle'
    }]);

    setSelectedSession(null);
    setOverrideRoom('');
    setOverrideReason('');
    setSubmitting(false);
    fetchSchedule();
  }

  async function handleCancellation(session) {
    if (!confirm(`Confirmer l'annulation de: ${session.module_title} ?`)) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await supabase.from('schedule_exceptions').insert([{
      session_id: session.session_id,
      exception_type: 'cancellation',
      new_date: todayStr,
      valid_until: expiryDate.toISOString(),
      reason: 'Séance annulée par l\'administration'
    }]);

    fetchSchedule();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Emploi du Temps Opérationnel</h2>
          <p className="text-sm text-slate-500">Supervision des séances et gestion des dérogations temporaires</p>
        </div>
        <div className="flex items-center gap-2">
          {['S1', 'S2', 'S3'].map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition ${
                selectedSection === sec ? 'bg-blue-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Section {sec}
            </button>
          ))}
          <button onClick={fetchSchedule} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Chargement de la grille...</div>
      ) : sessions.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-600 font-medium">Aucune séance active trouvée pour la Section {selectedSection}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(s => (
            <div
              key={s.session_id}
              className={`p-4 rounded-xl border transition ${
                s.is_cancelled ? 'bg-red-50 border-red-200 opacity-75' : s.has_active_override ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {DAYS[s.day_of_week - 1]}
                </span>
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {s.scheduled_start_time.slice(0, 5)} - {s.scheduled_end_time.slice(0, 5)}
                </span>
              </div>
              <h3 className="mt-2 font-bold text-slate-900 leading-snug">{s.module_title}</h3>
              <p className="text-xs text-slate-600 mt-1">{s.professor_name}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {s.has_active_override ? (
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <span className="line-through text-slate-400">{s.original_room}</span>
                      <span>→ {s.effective_room}</span>
                    </span>
                  ) : (
                    <span className="text-slate-700">{s.effective_room}</span>
                  )}
                </div>
                {s.is_cancelled ? (
                  <span className="text-red-700 font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Annulé
                  </span>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedSession(s)}
                      className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded"
                    >
                      Changer Salle
                    </button>
                    <button
                      onClick={() => handleCancellation(s)}
                      className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 rounded"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSession && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Changer de salle (Dérogation)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Séance: <span className="font-semibold text-slate-700">{selectedSession.module_title}</span>
            </p>
            <form onSubmit={handleRoomChange} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nouvelle Salle</label>
                <select
                  value={overrideRoom}
                  onChange={e => setOverrideRoom(e.target.value)}
                  required
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="">Sélectionner une salle...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.room_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motif</label>
                <input
                  type="text"
                  placeholder="Ex: Réparation, amphi indisponible..."
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow"
                >
                  {submitting ? 'Validation...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
