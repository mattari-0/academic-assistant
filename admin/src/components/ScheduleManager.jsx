import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, MapPin, RefreshCw, XCircle, Plus, Check } from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ScheduleManager() {
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [modules, setModules] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [selectedSection, setSelectedSection] = useState('S3');
  const [loading, setLoading] = useState(true);

  // Override Room Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [overrideRoom, setOverrideRoom] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  // Add Session Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModuleId, setNewModuleId] = useState('');
  const [newProfId, setNewProfId] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState('08:30');
  const [newEnd, setNewEnd] = useState('10:00');
  const [submitting, setSubmitting] = useState(false);

  // Inline Quick-Add states
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [customModuleTitle, setCustomModuleTitle] = useState('');
  const [isAddingProf, setIsAddingProf] = useState(false);
  const [customProfName, setCustomProfName] = useState('');

  useEffect(() => {
    fetchSchedule();
    fetchMetadata();
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

  async function fetchMetadata() {
    const { data: rData } = await supabase.from('rooms').select('*').order('room_number');
    if (rData) setRooms(rData);

    const { data: mData } = await supabase.from('modules').select('*').order('title');
    if (mData) setModules(mData);

    const { data: pData } = await supabase.from('professors').select('*').order('full_name');
    if (pData) setProfessors(pData);
  }

  async function handleQuickAddRoom(e) {
    if (e) e.preventDefault();
    if (!customRoomName.trim()) return;
    const { data, error } = await supabase
      .from('rooms')
      .insert([{ room_number: customRoomName.trim() }])
      .select()
      .single();

    if (error) {
      alert(`Erreur création salle: ${error.message}`);
    } else if (data) {
      setRooms(prev => [...prev, data]);
      setNewRoomId(data.id);
      setOverrideRoom(data.id);
      setCustomRoomName('');
      setIsAddingRoom(false);
    }
  }

  async function handleQuickAddModule(e) {
    if (e) e.preventDefault();
    if (!customModuleTitle.trim()) return;
    const { data, error } = await supabase
      .from('modules')
      .insert([{ 
        title: customModuleTitle.trim(),
        code: customModuleTitle.trim().slice(0, 6).toUpperCase()
      }])
      .select()
      .single();

    if (error) {
      alert(`Erreur création module: ${error.message}`);
    } else if (data) {
      setModules(prev => [...prev, data]);
      setNewModuleId(data.id);
      setCustomModuleTitle('');
      setIsAddingModule(false);
    }
  }

  async function handleQuickAddProf(e) {
    if (e) e.preventDefault();
    if (!customProfName.trim()) return;
    const { data, error } = await supabase
      .from('professors')
      .insert([{ full_name: customProfName.trim() }])
      .select()
      .single();

    if (error) {
      alert(`Erreur création professeur: ${error.message}`);
    } else if (data) {
      setProfessors(prev => [...prev, data]);
      setNewProfId(data.id);
      setCustomProfName('');
      setIsAddingProf(false);
    }
  }

  async function handleRoomChange(e) {
    e.preventDefault();
    if (!selectedSession || !overrideRoom) return;
    setSubmitting(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const { error } = await supabase.from('schedule_exceptions').insert([{
      session_id: selectedSession.session_id,
      exception_type: 'room_change',
      replacement_room_id: overrideRoom,
      new_date: todayStr,
      valid_until: expiryDate.toISOString(),
      reason: overrideReason || 'Modification administrative de salle'
    }]);

    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      setSelectedSession(null);
      setOverrideRoom('');
      setOverrideReason('');
      fetchSchedule();
    }
    setSubmitting(false);
  }

  async function handleCancellation(session) {
    if (!confirm(`Confirmer l'annulation de: ${session.module_title} ?`)) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const { error } = await supabase.from('schedule_exceptions').insert([{
      session_id: session.session_id,
      exception_type: 'cancellation',
      new_date: todayStr,
      valid_until: expiryDate.toISOString(),
      reason: 'Séance annulée par l\'administration'
    }]);

    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      fetchSchedule();
    }
  }

  async function handleAddSession(e) {
    e.preventDefault();
    if (!newModuleId || !newRoomId) {
      alert('Veuillez sélectionner au moins un module et une salle.');
      return;
    }
    setSubmitting(true);

    const { data: vData } = await supabase
      .from('timetable_versions')
      .select('id')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (!vData?.id) {
      alert("Aucune version active d'emploi du temps trouvée.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('sessions').insert([{
      timetable_version_id: vData.id,
      module_id: newModuleId,
      professor_id: newProfId || null,
      room_id: newRoomId,
      day_of_week: parseInt(newDay),
      start_time: newStart + ':00',
      end_time: newEnd + ':00',
      section: selectedSection,
      session_type: 'cours'
    }]);

    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      setShowAddModal(false);
      setNewModuleId('');
      setNewProfId('');
      setNewRoomId('');
      fetchSchedule();
    }
    setSubmitting(false);
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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow"
          >
            <Plus className="w-4 h-4" /> Ajouter Séance
          </button>
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
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Créer une séance
          </button>
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
              <p className="text-xs text-slate-600 mt-1">{s.professor_name || 'Professeur non assigné'}</p>
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

      {/* Modal: Changer Salle */}
      {selectedSession && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Changer de salle (Dérogation)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Séance: <span className="font-semibold text-slate-700">{selectedSession.module_title}</span>
            </p>

            <form onSubmit={handleRoomChange} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Nouvelle Salle</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingRoom(!isAddingRoom)}
                    className="text-xs text-blue-900 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <Plus className="w-3 h-3" /> Nouvelle salle
                  </button>
                </div>

                {isAddingRoom ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom de salle (ex: Salle 12)"
                      value={customRoomName}
                      onChange={e => setCustomRoomName(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddRoom}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
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
                )}
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
                  onClick={() => { setSelectedSession(null); setIsAddingRoom(false); }}
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

      {/* Modal: Ajouter Nouvelle Séance */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Ajouter une séance (Section {selectedSection})</h3>
            <form onSubmit={handleAddSession} className="mt-4 space-y-3">
              {/* Module selection + Quick add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Module</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingModule(!isAddingModule)}
                    className="text-xs text-blue-900 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <Plus className="w-3 h-3" /> Nouveau module
                  </button>
                </div>

                {isAddingModule ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom du module (ex: Marketing)"
                      value={customModuleTitle}
                      onChange={e => setCustomModuleTitle(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddModule}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <select
                    value={newModuleId}
                    onChange={e => setNewModuleId(e.target.value)}
                    required
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="">Sélectionner un module...</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Professor + Quick add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Professeur</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingProf(!isAddingProf)}
                    className="text-xs text-blue-900 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <Plus className="w-3 h-3" /> Nouveau professeur
                  </button>
                </div>

                {isAddingProf ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom (ex: Pr ALAMI)"
                      value={customProfName}
                      onChange={e => setCustomProfName(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddProf}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <select
                    value={newProfId}
                    onChange={e => setNewProfId(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none"
                  >
                    <option value="">Sélectionner un professeur (optionnel)...</option>
                    {professors.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Day & Room + Quick Add Room */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jour</label>
                  <select
                    value={newDay}
                    onChange={e => setNewDay(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none"
                  >
                    {DAYS.map((d, idx) => (
                      <option key={idx + 1} value={idx + 1}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Salle</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingRoom(!isAddingRoom)}
                      className="text-xs text-blue-900 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <Plus className="w-3 h-3" /> Nouvelle
                    </button>
                  </div>

                  {isAddingRoom ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Ex: Salle 8"
                        value={customRoomName}
                        onChange={e => setCustomRoomName(e.target.value)}
                        className="w-full text-sm border border-slate-300 rounded-lg p-1.5 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleQuickAddRoom}
                        className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={newRoomId}
                      onChange={e => setNewRoomId(e.target.value)}
                      required
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Salle...</option>
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.room_number}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Début</label>
                  <input
                    type="time"
                    required
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fin</label>
                  <input
                    type="time"
                    required
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setIsAddingModule(false); setIsAddingRoom(false); setIsAddingProf(false); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow"
                >
                  {submitting ? 'Création...' : 'Créer séance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
