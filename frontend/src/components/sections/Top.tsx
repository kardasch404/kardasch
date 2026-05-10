'use client';

import { useState, useEffect } from 'react';

export function Top() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      
      setDate(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`);
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="select-none text-black/90 font-Helvetica text-xs flex flex-row justify-between items-center">
      <div className="flex flex-col items-start">
        <span className="text-black/75 text-base font-semibold hover:underline cursor-pointer">
          <a href="mailto:kardasch.zakaria@outlook.de">kardasch.zakaria@outlook.de</a>
        </span>
        <span className="text-black/75 text-base font-semibold cursor-pointer">
          Phone: <a href="tel:+212613450087" className="hover:text-themeOrange hover:underline">+212 613-450-087</a>
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-black/75 font-semibold text-sm">Casablanca, Morocco</span>
        <span className="text-black/80 font-semibold text-base">{date}</span>
        <span className="flex flex-row gap-1 font-sans font-semibold">
          Local Time {time}
        </span>
      </div>
    </div>
  );
}
