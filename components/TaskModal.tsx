
import React, { useState } from 'react';
import { db, Category, PriorityLabel } from '../db';
import { X, Calendar, Tag, Link as LinkIcon } from 'lucide-react';
import { JalaliDatePicker } from './JalaliInputs';

interface TaskModalProps {
  categories: Category[];
  priorities: PriorityLabel[];
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ categories, priorities, onClose }) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 0);
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [labels, setLabels] = useState('');
  const [priority, setPriority] = useState(2);
  const [link, setLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Use current timestamp as initial order to place at the bottom
    const order = Date.now();

    await db.tasks.add({
      title,
      categoryId: Number(categoryId),
      deadline,
      priority,
      order,
      labels: labels.split(',').map(l => l.trim()).filter(l => l),
      notes: [],
      completed: false,
      createdAt: Date.now(),
      link: link.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">ایجاد کار جدید</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">عنوان کار</label>
            <input
              autoFocus
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              placeholder="مثال: خرید وسایل خانه"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">دسته‌بندی</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">اولویت</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
              >
                {priorities.sort((a,b)=>a.id-b.id).map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              ددلاین (شمسی)
            </label>
            <JalaliDatePicker initialDate={deadline} onChange={setDeadline} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              پیوند (لینک مرتبط)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              لیبل‌ها (با کاما جدا کنید)
            </label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
              placeholder="فوری، خانه، سفر..."
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button 
              type="submit" 
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              ثبت و ذخیره
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
