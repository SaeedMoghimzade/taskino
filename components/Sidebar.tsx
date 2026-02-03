
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Note, Task } from '../db';
import { X, Send, History, Clock, Calendar, Edit3, Link as LinkIcon, ExternalLink, Save, Check, Bell, BellRing, Trash2, Tag, Sliders } from 'lucide-react';
import { JalaliDatePicker } from './JalaliInputs';

interface SidebarProps {
  taskId: number;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ taskId, onClose }) => {
  const task = useLiveQuery(() => db.tasks.get(taskId), [taskId]);
  const priorities = useLiveQuery(() => db.priorities.toArray());
  
  const [newNote, setNewNote] = useState('');
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [tempReminder, setTempReminder] = useState(new Date().toISOString());
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editLabels, setEditLabels] = useState('');
  const [editPriority, setEditPriority] = useState(2);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDeadline(task.deadline || '');
      setEditLink(task.link || '');
      setEditLabels(task.labels?.join(', ') || '');
      setEditPriority(task.priority || 2);
    }
  }, [task, isEditing]);

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !task) return;

    const note: Note = {
      id: crypto.randomUUID(),
      content: newNote.trim(),
      createdAt: Date.now()
    };

    const updates: any = {
      notes: [...(task.notes || []), note]
    };

    if (showReminderPicker) {
      updates.reminder = tempReminder;
    }

    await db.tasks.update(taskId, updates);
    setNewNote('');
    setShowReminderPicker(false);
  };

  const clearReminder = async () => {
    await db.tasks.update(taskId, { reminder: undefined });
  };

  const handleUpdateTask = async () => {
    if (!task || !editTitle.trim()) return;
    await db.tasks.update(taskId, {
      title: editTitle.trim(),
      deadline: editDeadline,
      link: editLink.trim(),
      priority: editPriority,
      labels: editLabels.split(',').map(l => l.trim()).filter(l => l)
    });
    setIsEditing(false);
  };

  const getJalaliFull = (iso?: string) => {
    if (!iso) return 'تنظیم نشده';
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { 
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(iso));
    } catch { return iso; }
  };

  if (!task) return null;

  return (
    <div className="absolute inset-y-0 left-0 w-full sm:w-[480px] bg-white shadow-2xl border-r border-slate-200 z-50 flex flex-col animate-in slide-in-from-left duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 mr-1">عنوان کار</label>
                  <input type="text" autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full text-base font-bold text-slate-800 bg-white border border-indigo-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 mr-1">مهلت انجام (شمسی)</label>
                    <JalaliDatePicker initialDate={editDeadline} onChange={setEditDeadline} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 mr-1">اولویت</label>
                    <select 
                      value={editPriority} 
                      onChange={(e) => setEditPriority(Number(e.target.value))}
                      className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    >
                      {priorities?.sort((a,b)=>a.id-b.id).map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 mr-1">لیبل‌ها (با کاما جدا کنید)</label>
                  <div className="relative">
                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={editLabels} 
                      onChange={(e) => setEditLabels(e.target.value)} 
                      className="w-full text-xs pr-9 bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      placeholder="فوری، خانه، پروژه..." 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 mr-1">پیوند (لینک مرتبط)</label>
                  <div className="relative">
                    <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="url" 
                      value={editLink} 
                      onChange={(e) => setEditLink(e.target.value)} 
                      className="w-full text-xs pr-9 bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      placeholder="https://..." 
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleUpdateTask} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"><Check className="w-4 h-4" /> ذخیره </button>
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-slate-200 text-slate-600 rounded-xl text-sm font-bold">انصراف</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{task.title}</h2>
                  <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 className="w-5 h-5" /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">تاریخ درج</span>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold"><Clock className="w-4 h-4 text-indigo-500" />{getJalaliFull(new Date(task.createdAt).toISOString())}</div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">مهلت (ددلاین)</span>
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-black"><Calendar className="w-4 h-4 text-rose-500" />{task.deadline ? getJalaliFull(task.deadline).split('،')[0] : 'ندارد'}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex-1 min-w-[120px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">اولویت</span>
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      {priorities?.find(p => p.id === task.priority)?.label || 'تعریف نشده'}
                    </div>
                  </div>
                  {task.labels && task.labels.length > 0 && (
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex-[2] min-w-[180px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">لیبل‌ها</span>
                      <div className="flex flex-wrap gap-1">
                        {task.labels.map(l => (
                          <span key={l} className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {task.link && (
                  <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between group/link">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-indigo-200">
                        <ExternalLink className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">لینک مرتبط</span>
                        <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-700 truncate block hover:underline">
                          {task.link}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {task.reminder && (
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between group/rem">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-amber-200">
                        <BellRing className="w-4 h-4 text-amber-600 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">یادآوری فعال</span>
                        <span className="text-xs font-bold text-amber-700">{getJalaliFull(task.reminder)}</span>
                      </div>
                    </div>
                    <button onClick={clearReminder} className="p-2 text-amber-300 hover:text-rose-500 transition-colors opacity-0 group-hover/rem:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors shrink-0 mr-4"><X className="w-6 h-6 text-slate-500" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <History className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">یادداشت‌ها و تاریخچه</span>
        </div>
        {task.notes && task.notes.length > 0 ? (
          <div className="space-y-5">
            {task.notes.sort((a, b) => b.createdAt - a.createdAt).map((note) => (
              <div key={note.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm"><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{note.content}</p><div className="mt-4 flex items-center text-[10px] text-slate-400 font-bold"><Clock className="w-3 h-3 ml-1" />{new Date(note.createdAt).toLocaleString('fa-IR')}</div></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center opacity-30"><History className="w-8 h-8 mb-4" /><p className="text-sm font-bold">یادداشتی ثبت نشده است.</p></div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 shadow-inner">
        <form onSubmit={addNote} className="space-y-4">
          <div className="relative">
            <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="یادداشت جدید..." className="w-full pr-4 pl-14 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm min-h-[100px] resize-none font-medium" />
            <button type="button" onClick={() => setShowReminderPicker(!showReminderPicker)} className={`absolute left-4 top-4 p-2.5 rounded-xl transition-all ${showReminderPicker ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`} title="افزودن یادآوری"><Bell className="w-5 h-5" /></button>
          </div>
          
          {showReminderPicker && (
            <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-amber-600 flex items-center gap-2"><BellRing className="w-4 h-4" /> تنظیم زمان یادآوری</span>
                <button type="button" onClick={() => setShowReminderPicker(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">انصراف</button>
              </div>
              <JalaliDatePicker initialDate={tempReminder} onChange={setTempReminder} withTime={true} />
            </div>
          )}

          <button type="submit" disabled={!newNote.trim()} className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"><Send className="w-5 h-5" /> ثبت یادداشت {showReminderPicker && 'و یادآوری'}</button>
        </form>
      </div>
    </div>
  );
};
