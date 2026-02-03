
import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Category } from '../db';
import { X, RotateCcw, CheckCheck, Trash2, Calendar, Tag } from 'lucide-react';

interface CompletedTasksModalProps {
  onClose: () => void;
  onRestore: (id: number) => void;
  categories: Category[];
}

export const CompletedTasksModal: React.FC<CompletedTasksModalProps> = ({ onClose, onRestore, categories }) => {
  // Fix: Cast 'true' to any because Dexie's IndexableType does not strictly include boolean in its type definition, 
  // though it is supported at runtime in modern browsers.
  const completedTasks = useLiveQuery(() => 
    db.tasks.where('completed').equals(true as any).reverse().sortBy('createdAt')
  );

  const categoryMap = useMemo(() => {
    const map: { [key: number]: Category } = {};
    categories.forEach(c => map[c.id!] = c);
    return map;
  }, [categories]);

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف دائمی این کار اطمینان دارید؟')) {
      await db.tasks.delete(id);
    }
  };

  const getJalali = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'short' }).format(new Date(iso));
    } catch { return iso; }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCheck className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">کارهای انجام شده</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">بایگانی کارهای تکمیل شده</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
          {!completedTasks || completedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <CheckCheck className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold text-sm">هنوز هیچ کاری را تکمیل نکرده‌اید</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="group flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-700 line-through decoration-slate-400 decoration-2">{task.title}</span>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryMap[task.categoryId]?.color || '#ddd' }} />
                      <span className="text-[10px] font-bold text-slate-400">{categoryMap[task.categoryId]?.name || 'بدون دسته'}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                       {task.deadline && (
                         <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                           <Calendar className="w-3 h-3" />
                           {getJalali(task.deadline)}
                         </div>
                       )}
                       {task.labels && task.labels.length > 0 && (
                         <div className="flex gap-1">
                           {task.labels.map(l => (
                             <span key={l} className="text-[8px] font-black bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400">
                               {l}
                             </span>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => onRestore(task.id!)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                      title="بازگرداندن به لیست اصلی"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">بازگردانی</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id!)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="حذف دائمی"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تعداد کل: {completedTasks?.length || 0} مورد</span>
          <p className="text-[9px] font-bold text-slate-400 italic">کارهای تکمیل شده از لیست اصلی مخفی شده‌اند</p>
        </div>
      </div>
    </div>
  );
};
