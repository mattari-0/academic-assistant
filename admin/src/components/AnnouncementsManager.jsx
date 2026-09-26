import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Megaphone, Send } from 'lucide-react';

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetSection, setTargetSection] = useState('ALL');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  }

  async function handleCreateAnnouncement(e) {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    await supabase.from('announcements').insert([{ title, content, target_section: targetSection, priority }]);
    setTitle('');
    setContent('');
    setSubmitting(false);
    fetchAnnouncements();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 lg:col-span-1 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-900" />
          Diffuser une Annonce
        </h2>
        <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Titre</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Report de contrôle"
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Section Cible</label>
            <select
              value={targetSection}
              onChange={e => setTargetSection(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none"
            >
              <option value="ALL">Toute la promotion (S1, S2, S3)</option>
              <option value="S1">Section S1</option>
              <option value="S2">Section S2</option>
              <option value="S3">Section S3</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priorité</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="radio" value="normal" checked={priority === 'normal'} onChange={() => setPriority('normal')} />
                Normal
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer text-red-600 font-semibold">
                <input type="radio" value="urgent" checked={priority === 'urgent'} onChange={() => setPriority('urgent')} />
                Urgent
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Message officiel..."
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Publication...' : 'Publier l\'annonce'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-3">
        <h3 className="text-base font-bold text-slate-800">Annonces Actives</h3>
        {announcements.map(a => (
          <div key={a.id} className="p-4 rounded-xl border bg-white border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold px-2 py-0.5 rounded ${
                a.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {a.priority.toUpperCase()} • Section {a.target_section}
              </span>
              <span className="text-slate-400">
                {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 mt-2">{a.title}</h4>
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{a.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
