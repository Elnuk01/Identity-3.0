import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface CountdownProps {
  darkMode: boolean;
  eventDate?: string; // Default: August 1, 2026 at 10:00:00
}

export default function Countdown({ darkMode, eventDate = '2026-08-01T10:00:00' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const target = new Date(eventDate).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [eventDate]);

  if (timeLeft.isExpired) {
    return (
      <div className={`p-4 rounded-2xl border text-center transition-all ${
        darkMode ? 'bg-zinc-900/50 border-zinc-805 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-650'
      }`}>
        <p className="font-mono text-xs font-bold uppercase tracking-wider">
          🎉 The Event is Currently Live or Completed!
        </p>
      </div>
    );
  }

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days, color: 'from-blue-500 to-indigo-500' },
    { label: 'Hours', value: timeLeft.hours, color: 'from-indigo-500 to-purple-500' },
    { label: 'Minutes', value: timeLeft.minutes, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className={`mb-8 p-5 sm:p-6 rounded-3xl border transition-all ${
      darkMode 
        ? 'bg-zinc-900/40 border-zinc-800/80 shadow-inner' 
        : 'bg-zinc-50 border-zinc-200/60 shadow-inner'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/10">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-black text-xs sm:text-sm uppercase tracking-tight">
              EVENT COUNTDOWN
            </h3>
            <p className={`text-[10px] font-mono tracking-wider ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
              AUGUST 1, 2026 • 10:00 AM
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-mono font-black tracking-widest uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full animate-bounce">
          <Sparkles className="w-3 h-3 text-amber-500" />
          HURRY, SPOTS FILLING UP
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {timeBlocks.map((block) => (
          <div
            key={block.label}
            className={`p-3.5 rounded-2xl border relative overflow-hidden flex flex-col items-center justify-center transition-colors ${
              darkMode 
                ? 'bg-zinc-950/80 border-zinc-900 text-white' 
                : 'bg-white border-zinc-200 text-zinc-950 shadow-sm'
            }`}
          >
            {/* Visual gradient accent under values */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${block.color} opacity-40`} />

            <div className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none mb-1">
              {String(block.value).padStart(2, '0')}
            </div>
            
            <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest ${
              darkMode ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
