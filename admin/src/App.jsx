import React, { useState } from 'react';
import { Calendar, Megaphone, Clock, ShieldCheck } from 'lucide-react';
import ScheduleManager from './components/ScheduleManager';
import AnnouncementsManager from './components/AnnouncementsManager';
import ExamsManager from './components/ExamsManager';

export default function App() {
  const [activeTab, setActiveTab] = useState('schedule');

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
          <span className="text-xs bg-blue-900 border border-blue-700 px-2.5 py-1 rounded-full text-blue-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            benchanb.othman.2008@gmail.com
          </span>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          {[
            { id: 'schedule', label: 'Emploi du Temps', icon: Clock },
            { id: 'announcements', label: 'Annonces', icon: Megaphone },
            { id: 'exams', label: 'Examens', icon: Calendar },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                  active ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'
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
      </main>
    </div>
  );
}
