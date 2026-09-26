import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Plus } from 'lucide-react';

export default function ExamsManager() {
  const [exams, setExams] = useState([]);
  const [modules, setModules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [moduleId, setModuleId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [targetSection, setTargetSection] = useState('ALL');
  const [syllabusScope, setSyllabusScope] = useState('');
  const [materials, setMaterials] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchMetadata();
  }, []);

  async function fetchMetadata() {
    const { data: mData } = await supabase.from('modules').select('*').order('title');
    const { data: rData } = await supabase.from('rooms').select('*').order('room_number');
    if (mData) setModules(mData);
    if (rData) setRooms(rData);
  }

  async function fetchExams() {
    const { data } = await supabase
      .from('exams')
      .select('*, modules(title, code), rooms(room_number)')
      .order('exam_date');
    if (data) setExams(data);
  }

  async function handleCreateExam(e) {
    e.preventDefault();
    if (!moduleId || !roomId || !examDate) return;
    setSubmitting(true);
    await supabase.from('exams').insert([{
      module_id: moduleId,
      room_id: roomId,
      exam_date: examDate,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      target_section: targetSection,
      syllabus_scope: syllabusScope,
      required_materials: materials
    }]);

    setModuleId('');
    setSyllabusScope('');
    setMaterials('');
    setSubmitting(false);
    fetchExams();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 lg:col-span-1 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-900" />
          Planifier un Examen
        </h2>
        <form onSubmit={handleCreateExam} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Module</label>
            <select
              value={moduleId}
              onChange={e => setModuleId(e.target.value)}
              required
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Sélectionner...</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salle</label>
              <select
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                required
                className="w-full text-sm border border-slate-300 rounded-lg p-2 outline-none"
              >
                <option value="">Salle...</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.room_number}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chapitres</label>
            <input
              type="text"
              placeholder="Ex: Chapitres 1 à 3"
              value={syllabusScope}
              onChange={e => setSyllabusScope(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow"
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-3">
        <h3 className="text-base font-bold text-slate-800">Examens Programmés</h3>
        {exams.map(ex => (
          <div key={ex.id} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">Section {ex.target_section}</span>
              <h4 className="font-bold text-slate-900 mt-1">{ex.modules?.title}</h4>
              <p className="text-xs text-slate-500">Chapitres: {ex.syllabus_scope || 'Général'}</p>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold text-slate-900 block">{ex.exam_date}</span>
              <span className="text-slate-500">{ex.start_time.slice(0, 5)} - {ex.end_time.slice(0, 5)}</span>
              <span className="block font-semibold text-slate-700 mt-1">{ex.rooms?.room_number}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
