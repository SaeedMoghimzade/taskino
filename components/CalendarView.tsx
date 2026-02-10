
import React, { useState, useMemo } from 'react';
import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, AlertCircle, Bell, Video, Plus, ExternalLink } from 'lucide-react';
import { Task, Category, Event, db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { EventModal } from './EventModal';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  onSelectTask: (id: number) => void;
  onSelectEvent: (id: number) => void;
}

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, categories, onSelectTask, onSelectEvent }) => {
  const [viewType, setViewType] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const events = useLiveQuery(() => db.events.toArray());

  const currentJ = useMemo(() => toJalaali(currentDate), [currentDate]);

  const monthDays = useMemo(() => {
    const total = jalaaliMonthLength(currentJ.jy, currentJ.jm);
    const firstDayG = toGregorian(currentJ.jy, currentJ.jm, 1);
    const firstDate = new Date(firstDayG.gy, firstDayG.gm - 1, firstDayG.gd);
    const startPadding = (firstDate.getDay() + 1) % 7;
    
    const days = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  }, [currentJ]);

  const weekDaysRange = useMemo(() => {
    const dayOfWeek = (currentDate.getDay() + 1) % 7;
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    return week;
  }, [currentDate]);

  const getDayItems = (year: number, month: number, day: number) => {
    const dayTasks = tasks.filter(t => {
      if (t.completed) return false;
      const dDate = t.deadline ? toJalaali(new Date(t.deadline)) : null;
      const rDate = t.reminder ? toJalaali(new Date(t.reminder)) : null;
      const matchDeadline = dDate && dDate.jy === year && dDate.jm === month && dDate.jd === day;
      const matchReminder = rDate && rDate.jy === year && rDate.jm === month && rDate.jd === day;
      return matchDeadline || matchReminder;
    });

    const dayEvents = (events || []).filter(e => {
      const eDate = toJalaali(new Date(e.date));
      return eDate.jy === year && eDate.jm === month && eDate.jd === day;
    });

    return { tasks: dayTasks, events: dayEvents };
  };

  const navigate = (direction: number) => {
    if (viewType === 'month') {
      let nextMonth = currentJ.jm + direction;
      let nextYear = currentJ.jy;
      if (nextMonth > 12) { nextMonth = 1; nextYear++; }
      else if (nextMonth < 1) { nextMonth = 12; nextYear--; }
      const { gy, gm, gd } = toGregorian(nextYear, nextMonth, 1);
      setCurrentDate(new Date(gy, gm - 1, gd));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction * 7));
      setCurrentDate(newDate);
    }
  };

  const deleteEvent = async (id: number) => {
    if (confirm('آیا از حذف این رویداد اطمینان دارید؟')) {
      await db.events.delete(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-slate-800 min-w-[140px]">
            {viewType === 'month' ? `${JALALI_MONTHS[currentJ.jm - 1]} ${currentJ.jy}` : 'نمای هفتگی'}
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setViewType('month')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewType === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>ماهانه</button>
            <button onClick={() => setViewType('week')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewType === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>هفتگی</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 text-xs"
          >
            <Plus className="w-4 h-4" />
            رویداد جدید
          </button>
          <div className="h-8 w-px bg-slate-200 mx-1" />
          <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200">امروز</button>
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-50/50">
        {viewType === 'month' ? (
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {WEEK_DAYS.map(day => (
              <div key={day} className="bg-slate-50 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
            ))}
            {monthDays.map((day, idx) => {
              const { tasks: dayTasks, events: dayEvents } = day ? getDayItems(currentJ.jy, currentJ.jm, day) : { tasks: [], events: [] };
              const todayJ = toJalaali(new Date());
              const isToday = day && todayJ.jd === day && todayJ.jm === currentJ.jm && todayJ.jy === currentJ.jy;
              
              return (
                <div key={idx} className={`min-h-[100px] sm:min-h-[140px] bg-white p-2 flex flex-col gap-1 transition-colors ${day ? 'hover:bg-indigo-50/30' : 'bg-slate-50/50'}`}>
                  {day && (
                    <>
                      <span className={`text-xs font-black mb-2 self-start w-6 h-6 flex items-center justify-center rounded-lg ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-400'}`}>{day}</span>
                      <div className="space-y-1">
                        {dayEvents.map(event => (
                          <button key={event.id} onClick={() => onSelectEvent(event.id!)} className="w-full text-right p-1 rounded-md text-[9px] font-black truncate flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100">
                            <Video className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </button>
                        ))}
                        {dayTasks.map(task => {
                          const isDeadline = task.deadline && toJalaali(new Date(task.deadline)).jd === day;
                          return (
                            <button key={task.id} onClick={() => onSelectTask(task.id!)} className={`w-full text-right p-1 rounded-md text-[9px] font-bold truncate flex items-center gap-1.5 border ${isDeadline ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {isDeadline ? <AlertCircle className="w-2.5 h-2.5 shrink-0" /> : <Bell className="w-2.5 h-2.5 shrink-0" />}
                              <span className="truncate">{task.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 h-full">
            {weekDaysRange.map((date, idx) => {
              const jDate = toJalaali(date);
              const { tasks: dayTasks, events: dayEvents } = getDayItems(jDate.jy, jDate.jm, jDate.jd);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div key={idx} className="flex flex-col gap-3">
                  <div className={`text-center p-3 rounded-2xl border transition-all ${isToday ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-200'}`}>
                    <span className={`block text-[10px] font-black uppercase mb-1 ${isToday ? 'text-indigo-100' : 'text-slate-400'}`}>{WEEK_DAYS[idx]}</span>
                    <span className={`text-lg font-black ${isToday ? 'text-white' : 'text-slate-700'}`}>{jDate.jd}</span>
                    <span className={`block text-[9px] font-bold ${isToday ? 'text-indigo-200' : 'text-slate-400'}`}>{JALALI_MONTHS[jDate.jm - 1]}</span>
                  </div>

                  <div className="flex-1 space-y-3 bg-slate-200/20 rounded-2xl p-2 border border-dashed border-slate-200 min-h-[150px]">
                    {dayEvents.map(event => (
                      <button 
                        key={event.id} 
                        onClick={() => onSelectEvent(event.id!)}
                        className="group relative w-full text-right p-3 rounded-xl bg-white border border-violet-200 text-violet-800 border-r-4 border-r-violet-600 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Video className="w-3 h-3 text-violet-600" />
                            <span className="text-[9px] font-black uppercase">رویداد / جلسه</span>
                          </div>
                          <span className="text-[9px] font-bold bg-violet-50 px-1.5 py-0.5 rounded text-violet-600">
                            {new Date(event.date).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-black leading-relaxed line-clamp-2 mb-2">{event.title}</p>
                        <div className="flex items-center gap-2">
                           {event.link && (
                             <div className="p-1.5 bg-violet-100 text-violet-700 rounded-lg">
                               <ExternalLink className="w-3 h-3" />
                             </div>
                           )}
                           <span className="text-[8px] font-bold text-slate-400">مدت: {event.duration} دقیقه</span>
                           <div 
                              onClick={(e) => { e.stopPropagation(); deleteEvent(event.id!); }}
                              className="mr-auto opacity-0 group-hover:opacity-100 p-1 text-rose-300 hover:text-rose-500 transition-all text-[8px] font-bold"
                           >
                             حذف
                           </div>
                        </div>
                      </button>
                    ))}
                    
                    {dayTasks.map(task => {
                      const isDeadline = task.deadline && toJalaali(new Date(task.deadline)).jd === jDate.jd;
                      return (
                        <button key={task.id} onClick={() => onSelectTask(task.id!)} className={`w-full text-right p-3 rounded-xl shadow-sm border transition-all hover:translate-y-[-2px] hover:shadow-md ${isDeadline ? 'bg-white border-rose-200 text-rose-700 border-r-4 border-r-rose-500' : 'bg-white border-amber-200 text-amber-700 border-r-4 border-r-amber-500'}`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            {isDeadline ? <Clock className="w-3 h-3 text-rose-500" /> : <Bell className="w-3 h-3 text-amber-500" />}
                            <span className="text-[10px] font-black uppercase tracking-tight">{isDeadline ? 'ددلاین' : 'یادآوری'}</span>
                          </div>
                          <p className="text-xs font-bold leading-relaxed line-clamp-2">{task.title}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isEventModalOpen && (
        <EventModal onClose={() => setIsEventModalOpen(false)} />
      )}
    </div>
  );
};
