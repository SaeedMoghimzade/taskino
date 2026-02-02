
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { X, Save, AlertTriangle } from 'lucide-react';

interface PriorityManagerProps {
  onClose: () => void;
}

export const PriorityManager: React.FC<PriorityManagerProps> = ({ onClose }) => {
  const [labels, setLabels] = useState<{ [key: number]: string }>({ 1: '', 2: '', 3: '' });

  useEffect(() => {
    db.priorities.toArray().then(data => {
      const map: { [key: number]: string } = {};
      data.forEach(item => map[item.id] = item.label);
      setLabels(map);
    });
  }, []);

  const handleSave = async () => {
    await db.priorities.put({ id: 1, label: labels[1] });
    await db.priorities.put({ id: 2, label: labels[2] });
    await db.priorities.put({ id: 3, label: labels[3] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">تنظیم اولویت‌ها</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            {[1, 2, 3].map(num => (
              <div key={num} className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${num === 1 ? 'bg-red-500' : num === 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  عنوان اولویت {num === 1 ? 'بالا' : num === 2 ? 'متوسط' : 'پایین'}
                </label>
                <input
                  type="text"
                  value={labels[num] || ''}
                  onChange={(e) => setLabels({ ...labels, [num]: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
};
