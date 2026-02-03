
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Task, Category, seedDatabase } from './db';
import { Plus, Filter, Search, Settings, CheckCircle, Sliders, MoreHorizontal, Bell, BellRing, Clock, Calendar, CheckCheck } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { TaskCard } from './components/TaskCard';
import { CategoryManager } from './components/CategoryManager';
import { PriorityManager } from './components/PriorityManager';
import { CompletedTasksModal } from './components/CompletedTasksModal';

const App: React.FC = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dropTargetCategory, setDropTargetCategory] = useState<number | null>(null);
  
  const remindersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const tasks = useLiveQuery(() => db.tasks.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const priorities = useLiveQuery(() => db.priorities.toArray());

  useEffect(() => {
    seedDatabase();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (remindersRef.current && !remindersRef.current.contains(event.target as Node)) {
        setIsRemindersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const priorityMap = useMemo(() => {
    const map: { [key: number]: string } = {};
    priorities?.forEach(p => map[p.id] = p.label);
    return map;
  }, [priorities]);

  const activeReminders = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter(t => !t.completed && t.reminder && new Date(t.reminder) <= now)
      .sort((a, b) => new Date(b.reminder!).getTime() - new Date(a.reminder!).getTime());
  }, [tasks, now]);

  const groupedTasks = useMemo(() => {
    if (!tasks || !categories) return [];
    
    return categories.map(cat => {
      const catTasks = tasks.filter(t => 
        !t.completed && // Only show non-completed tasks in columns
        t.categoryId === cat.id &&
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!filterLabel || t.labels.includes(filterLabel))
      ).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return { ...cat, tasks: catTasks };
    });
  }, [tasks, categories, searchQuery, filterLabel]);

  const allLabels = useMemo(() => {
    if (!tasks) return [];
    const labels = new Set<string>();
    tasks.forEach(t => t.labels.forEach(l => labels.add(l)));
    return Array.from(labels);
  }, [tasks]);

  const onDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('taskId', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = () => {
    setDraggedTaskId(null);
    setDropTargetCategory(null);
  };

  const onDragOver = (e: React.DragEvent, categoryId: number) => {
    e.preventDefault();
    if (dropTargetCategory !== categoryId) {
      setDropTargetCategory(categoryId);
    }
  };

  const onDrop = async (e: React.DragEvent, categoryId: number, targetOrder?: number, targetId?: number) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('taskId');
    const taskId = parseInt(taskIdStr);
    
    setDraggedTaskId(null);
    setDropTargetCategory(null);

    if (isNaN(taskId)) return;
    if (taskId === targetId) return;

    const updates: any = { categoryId };

    if (targetOrder !== undefined && tasks) {
      const columnTasks = tasks
        .filter(t => !t.completed && t.categoryId === categoryId && t.id !== taskId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const targetIndex = columnTasks.findIndex(t => t.order === targetOrder);
      const prevTask = columnTasks[targetIndex - 1];
      
      if (!prevTask) {
        updates.order = targetOrder - 1000;
      } else {
        updates.order = (prevTask.order + targetOrder) / 2;
      }
    } else if (tasks) {
      const maxOrder = Math.max(...tasks.filter(t => t.categoryId === categoryId).map(t => t.order || 0), 0);
      updates.order = maxOrder + 1000;
    }

    await db.tasks.update(taskId, updates);
  };

  const toggleTaskStatus = async (id: number, currentStatus: boolean) => {
    await db.tasks.update(id, { completed: !currentStatus });
  };

  const deleteTask = async (id: number) => {
    if (confirm('آیا از حذف این مورد اطمینان دارید؟')) {
      await db.tasks.delete(id);
      if (selectedTaskId === id) setSelectedTaskId(null);
    }
  };

  const updatePriority = async (id: number, newPriority: number) => {
    await db.tasks.update(id, { priority: newPriority });
  };

  const formatJalali = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { 
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(new Date(iso));
    } catch { return iso; }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] text-slate-900 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 relative z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <CheckCircle className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            تسکینو
          </h1>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="جستجو در کارها..."
              className="w-full pr-9 pl-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCompletedModalOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
            title="کارهای انجام شده"
          >
            <CheckCheck className="w-5 h-5" />
            <span className="hidden lg:inline text-xs font-bold">انجام شده‌ها</span>
          </button>

          <div className="relative" ref={remindersRef}>
            <button 
              onClick={() => setIsRemindersOpen(!isRemindersOpen)}
              className={`p-2 rounded-lg transition-all relative ${isRemindersOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
              title="یادآوری‌های فعال"
            >
              {activeReminders.length > 0 ? (
                <BellRing className="w-5 h-5 animate-bounce text-amber-500" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
              {activeReminders.length > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {activeReminders.length}
                </span>
              )}
            </button>

            {isRemindersOpen && (
              <div className="absolute left-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">هشدار یادآوری</h3>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{activeReminders.length} مورد</span>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {activeReminders.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">یادآوری جدیدی وجود ندارد</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {activeReminders.map(rem => (
                        <button
                          key={rem.id}
                          onClick={() => {
                            setSelectedTaskId(rem.id!);
                            setIsRemindersOpen(false);
                          }}
                          className="w-full p-4 text-right hover:bg-slate-50 transition-colors flex flex-col gap-1.5"
                        >
                          <span className="text-sm font-bold text-slate-700 truncate block">{rem.title}</span>
                          <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600">
                               <Clock className="w-3 h-3" />
                               {formatJalali(rem.reminder!)}
                             </div>
                             <span className="text-[9px] font-black text-rose-500 animate-pulse">زمان رسیده است!</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-4">
             <Filter className="w-4 h-4 text-slate-400" />
             <select 
               className="bg-transparent text-sm font-medium outline-none text-slate-600 cursor-pointer hover:text-indigo-600"
               value={filterLabel || ''}
               onChange={(e) => setFilterLabel(e.target.value || null)}
             >
               <option value="">همه لیبل‌ها</option>
               {allLabels.map(l => (
                 <option key={l} value={l}>{l}</option>
               ))}
             </select>
          </div>
          
          <button 
            onClick={() => setIsPriorityModalOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="اولویت‌ها"
          >
            <Sliders className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="دسته‌ها"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md text-sm"
          >
            <Plus className="w-4 h-4" />
            کار جدید
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#f0f2f5] p-6 relative">
        <div className="flex h-full items-start gap-6">
          {groupedTasks.map(group => (
            <section 
              key={group.id} 
              onDragOver={(e) => onDragOver(e, group.id!)}
              onDragLeave={() => setDropTargetCategory(null)}
              onDrop={(e) => onDrop(e, group.id!)}
              className={`flex flex-col w-[320px] max-h-full shrink-0 rounded-2xl border transition-all duration-200 ${
                dropTargetCategory === group.id 
                ? 'bg-indigo-50 border-indigo-300 shadow-inner' 
                : 'bg-slate-200/40 border-slate-200/60'
              }`}
            >
              <div className="p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: group.color }} />
                  <h2 className="text-sm font-bold text-slate-700 truncate">{group.name}</h2>
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                    {group.tasks.length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-3 custom-scrollbar">
                {group.tasks.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center opacity-40">
                    <Plus className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-[10px] font-bold text-slate-500 text-center">کاری در این بخش نیست</p>
                  </div>
                ) : (
                  group.tasks.map((task) => (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id!)}
                      onDragEnd={onDragEnd}
                      onDragOver={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.stopPropagation();
                        onDrop(e, group.id!, task.order, task.id);
                      }}
                      className={`transition-all ${draggedTaskId === task.id ? 'opacity-30 grayscale scale-95' : ''}`}
                    >
                      <TaskCard 
                        task={task} 
                        priorityLabel={priorityMap[task.priority]}
                        category={group}
                        onToggle={() => toggleTaskStatus(task.id!, task.completed)}
                        onDelete={() => deleteTask(task.id!)}
                        onSelect={() => setSelectedTaskId(task.id!)}
                        onPriorityChange={(p) => updatePriority(task.id!, p)}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}

          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="w-[320px] h-14 shrink-0 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all font-bold text-sm"
          >
            <Plus className="w-5 h-5" />
            افزودن دسته جدید
          </button>
        </div>

        {selectedTaskId !== null && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTaskId(null)} />
            <Sidebar 
              taskId={selectedTaskId} 
              onClose={() => setSelectedTaskId(null)} 
            />
          </div>
        )}
      </div>

      {isTaskModalOpen && (
        <TaskModal 
          categories={categories || []} 
          priorities={priorities || []}
          onClose={() => setIsTaskModalOpen(false)} 
        />
      )}
      {isCategoryModalOpen && (
        <CategoryManager 
          onClose={() => setIsCategoryModalOpen(false)} 
        />
      )}
      {isPriorityModalOpen && (
        <PriorityManager 
          onClose={() => setIsPriorityModalOpen(false)} 
        />
      )}
      {isCompletedModalOpen && (
        <CompletedTasksModal 
          categories={categories || []}
          onRestore={(id) => toggleTaskStatus(id, true)}
          onClose={() => setIsCompletedModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
