
import React, { useState, useEffect } from 'react';
import { toGregorian, toJalaali } from 'jalaali-js';

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

interface JalaliDatePickerProps {
  initialDate?: string; // ISO string
  onChange: (isoDate: string) => void;
  withTime?: boolean;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ initialDate, onChange, withTime = false }) => {
  const getInitial = () => {
    try {
      const date = initialDate ? new Date(initialDate) : new Date();
      if (isNaN(date.getTime())) return new Date();
      return date;
    } catch {
      return new Date();
    }
  };

  const initialObj = getInitial();
  const initialJ = toJalaali(initialObj);
  
  const [jy, setJy] = useState(initialJ.jy);
  const [jm, setJm] = useState(initialJ.jm);
  const [jd, setJd] = useState(initialJ.jd);
  const [hour, setHour] = useState(initialObj.getHours());
  const [minute, setMinute] = useState(initialObj.getMinutes());

  useEffect(() => {
    const updated = getInitial();
    const j = toJalaali(updated);
    setJy(j.jy);
    setJm(j.jm);
    setJd(j.jd);
    setHour(updated.getHours());
    setMinute(updated.getMinutes());
  }, [initialDate]);

  useEffect(() => {
    const { gy, gm, gd } = toGregorian(jy, jm, jd);
    const date = new Date(gy, gm - 1, gd, hour, minute);
    onChange(date.toISOString());
  }, [jy, jm, jd, hour, minute]);

  const currentYear = toJalaali(new Date()).jy;
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  const daysInMonth = jm <= 6 ? 31 : jm <= 11 ? 30 : 29;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select value={jd} onChange={(e) => setJd(Number(e.target.value))} className="flex-1 px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10">
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={jm} onChange={(e) => setJm(Number(e.target.value))} className="flex-[1.5] px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10">
          {JALALI_MONTHS.map((name, i) => <option key={i+1} value={i+1}>{name}</option>)}
        </select>
        <select value={jy} onChange={(e) => setJy(Number(e.target.value))} className="flex-[1.2] px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      
      {withTime && (
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 ml-auto">زمان:</span>
          <select value={minute} onChange={(e) => setMinute(Number(e.target.value))} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none">
            {Array.from({length: 60}, (_, i) => i).map(m => <option key={m} value={m}>{m < 10 ? `۰${m}` : m}</option>)}
          </select>
          <span className="text-slate-300">:</span>
          <select value={hour} onChange={(e) => setHour(Number(e.target.value))} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none">
            {Array.from({length: 24}, (_, i) => i).map(h => <option key={h} value={h}>{h < 10 ? `۰${h}` : h}</option>)}
          </select>
        </div>
      )}
    </div>
  );
};
