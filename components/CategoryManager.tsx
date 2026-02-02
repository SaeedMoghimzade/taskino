
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { X, Plus, Trash2, Palette } from 'lucide-react';

interface CategoryManagerProps {
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const categories = useLiveQuery(() => db.categories.toArray());

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await db.categories.add({ name, color });
    setName('');
  };

  const deleteCategory = async (id: number) => {
    if (confirm('آیا مطمئن هستید؟ با حذف دسته، کارها بدون دسته خواهند شد.')) {
      await db.categories.delete(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">مدیریت دسته‌ها</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={addCategory} className="flex gap-2">
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام دسته جدید..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-11 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            />
            <button type="submit" className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
              <Plus className="w-6 h-6" />
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                <button 
                  onClick={() => deleteCategory(cat.id!)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
