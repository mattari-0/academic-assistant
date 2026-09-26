import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Calendar, Plus, Trash2, Clock } from 'lucide-react';

export default function AssignmentsManager() {
  const [assignments, setAssignments] = useState([]);
  const [modules, setModules] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetSection, setTargetSection] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchModules();
  }, []);

  async function fetchModules() {
    const { data } = await supabase.from('modules').select('*').order('title');
    if (data) setModules(data);
  }

  async function fetchAssignments() {
    setLoading(true);
    const { data } = await supabase
      .from('assignments')
      .select('*, modules(title)')
      .order('deadline', { ascending: true });
    if (data) setAssignments(data);
    setLoading(false);
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    if (!title || !moduleId || !deadline) return;
    setSubmitting(true);

    const { error } = await supabase.from('assignments').insert([{
      title,
      description,
      module_id: moduleId,
      deadline: new Date(deadline).toISOString(),
      target_section: targetSection
    }]);

    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      setTitle('');
      setDescription('');
      setModuleId('');
      setDeadline('');
      fetchAssignments();
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce devoir ?')) return;
    await supabase.from('assignments').delete().eq('id', id);
    fetchAssignments();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Creation Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-900" />
          Assigner un Devoir
        </h2>
        <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Module</label>
            <select
              value={moduleId}
              onChange={e => setModuleId(e.target.value)}
              required
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Sélectionner un module...</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Titre du devoir</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Étude de cas N°2"
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Section Cible</label>
            <select
              value={targetSection}
              onChange={e => setTargetSection(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none"
            >
              <option value="ALL">Toute la promotion (S1, S2, S3)</option>
              <option value="S1">Section S1</option>
              <option value="S2">Section S2</option>
              <option value="S3">Section S3</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date & Heure limite</label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Consignes</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Détails des livrables..."
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow transition"
          >
            {submitting ? 'Publication...' : 'Publier le devoir'}
          </button>
        </form>
      </div>

      {/* Assignments List */}
      <div className="lg:col-span-2 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Devoirs Programmés</h3>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement des devoirs...</div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">Aucun devoir en cours.</p>
          </div>
        ) : (
          assignments.map(a => (
            <div key={a.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  Section {a.target_section} • {a.modules?.title}
                </span>
                <h4 className="font-bold text-slate-900 text-base mt-1">{a.title}</h4>
                {a.description && (
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{a.description}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-red-700 font-semibold mt-2.5">
                  <Clock className="w-3.5 h-3.5" />
                  Date limite: {new Date(a.deadline).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                title="Supprimer"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
