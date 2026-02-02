
import React from 'react';
import { Task, Category } from '../db';
import { Calendar, Tag, Trash2, CheckCircle2, AlertCircle, AlertTriangle, Info, Bell, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  priorityLabel?: string;
  category?: Category;
  onToggle: () => void;
  onDelete: () => void;
  onSelect: () => void;
  onPriorityChange: (p: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  priorityLabel,
  category, 
  onToggle, 
  onDelete, 
  onSelect,
}) => {
  const isDeadlinePassed = task.deadline && new Date(task.deadline) < new Date();
  const isReminderActive = task.reminder && new Date(task.reminder) < new Date() && !task.completed;
  
  const getJalaliDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { 
        dateStyle: 'medium' 
      }).format(new Date(dateStr));
    } catch { return dateStr; }
  };

  const priorityConfig = {
    1: { icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'bg-red-500 text-white', label: priorityLabel || 'فوری' },
    2: { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'bg-amber-500 text-white', label: priorityLabel || 'متوسط' },
    3: { icon: <Info className="w-3.5 h-3.5" />, color: 'bg-emerald-500 text-white', label: priorityLabel || 'عادی' }
  }[task.priority as 1 | 2 | 3];

  return (
    <div 
      className={`group relative bg-white border rounded-xl p-4 transition-all hover:shadow-lg cursor-grab active:cursor-grabbing ${
        isDeadlinePassed && !task.completed ? 'bg-red-50 border-red-200' : 'border-slate-200 shadow-sm'
      } ${task.completed ? 'opacity-60 bg-slate-50' : ''}`}
    >
      <div className="flex items-start gap-2 mb-3">
        <div className="opacity-0 group-hover:opacity-40 transition-opacity mt-1 -mr-2 cursor-grab">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors mt-0.5 ${
            task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-500'
          }`}
        >
          {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 
            onClick={onSelect}
            className={`text-sm font-bold cursor-pointer transition-colors hover:text-indigo-600 leading-snug break-words ${
              task.completed ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
          >
            {task.title}
          </h3>
        </div>
        
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm ${priorityConfig.color}`}>
          {priorityConfig.icon}
          {priorityConfig.label}
        </div>

        {task.deadline && (
          <div className={`flex items-center gap-1 text-[10px] font-bold ${isDeadlinePassed && !task.completed ? 'text-red-600' : 'text-slate-500'}`}>
            <Calendar className="w-3 h-3" />
            {getJalaliDate(task.deadline)}
          </div>
        )}

        {task.reminder && !task.completed && (
          <div className={`flex items-center gap-1 text-[10px] font-bold ${isReminderActive ? 'text-amber-600' : 'text-slate-400'}`}>
            <Bell className={`w-3 h-3 ${isReminderActive ? 'animate-bounce' : ''}`} />
            <span className="sr-only">دارای یادآوری</span>
          </div>
        )}
      </div>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.labels.map((label, idx) => (
            <span key={idx} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded-md border border-slate-200 font-bold">
              <Tag className="w-2.5 h-2.5" />
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-80" style={{ backgroundColor: category?.color }} />
    </div>
  );
};
