
import React, { useState } from 'react';
import { db } from '../db';
import { X, Calendar, Clock, Link as LinkIcon, AlignLeft, Timer } from 'lucide-react';
import { JalaliDatePicker } from './JalaliInputs';

interface EventModalProps {
  onClose: () => void;
  initialDate?: Date;
}

export const EventModal: React.FC<EventModalProps> = ({ onClose, initialDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate?.toISOString() || new Date().toISOString());
  const [duration, setDuration] = useState(60);
  const [link, setLink] = useState('');
  const [initialNotes, setInitialNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await db.events.add({
      title: title.trim(),
      date,
      duration,
      link: link.trim() || undefined,
      notes: initialNotes.trim() ? [{
        id: crypto.randomUUID(),
        content: initialNotes.trim(),
        createdAt: Date.now()
      }] : [],
      createdAt: Date.now()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-violet-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-violet-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">ثبت رویداد یا جلسه</h2>
              <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">فقط در تقویم نمایش داده می‌شود</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">عنوان رویداد</label>
            <input
              autoFocus
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all"
              placeholder="مثال: جلسه هفتگی تیم فنی"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-500" />
              تاریخ و زمان (شمسی)
            </label>
            <JalaliDatePicker initialDate={date} onChange={setDate} withTime={true} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Timer className="w-4 h-4 text-violet-500" />
              مدت زمان (دقیقه)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-violet-500" />
              پیوند مرتبط (لینک جلسه)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all"
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-violet-500" />
              یادداشت اولیه
            </label>
            <textarea
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all resize-none"
              placeholder="توضیحات تکمیلی..."
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button 
              type="submit" 
              className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 shadow-xl shadow-violet-100 transition-all active:scale-[0.98]"
            >
              ثبت رویداد
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
