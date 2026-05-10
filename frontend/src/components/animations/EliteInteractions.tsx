'use client';

import { useEffect, useState } from 'react';

export function EliteInteractions() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [konamiMode, setKonamiMode] = useState(false);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Custom Cursor Trail
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Konami Code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...konamiSequence, e.key].slice(-10);
      setKonamiSequence(newSequence);

      if (newSequence.join(',') === konamiCode.join(',')) {
        setKonamiMode(!konamiMode);
        document.body.classList.toggle('konami-dark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiSequence, konamiMode]);

  // Binary Rain
  useEffect(() => {
    const binaryChars = ['0', '1'];
    const rainContainer = document.createElement('div');
    rainContainer.className = 'binary-rain';
    document.body.appendChild(rainContainer);

    for (let i = 0; i < 20; i++) {
      const char = document.createElement('div');
      char.className = 'binary-char';
      char.textContent = binaryChars[Math.floor(Math.random() * 2)];
      char.style.left = `${Math.random() * 100}%`;
      char.style.animationDuration = `${5 + Math.random() * 10}s`;
      char.style.animationDelay = `${Math.random() * 5}s`;
      rainContainer.appendChild(char);
    }

    return () => {
      document.body.removeChild(rainContainer);
    };
  }, []);

  // Magnetic Buttons
  useEffect(() => {
    const buttons = document.querySelectorAll('.magnetic-btn');
    
    buttons.forEach((button) => {
      const handleMouseMove = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = (button as HTMLElement).getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left - rect.width / 2;
        const y = mouseEvent.clientY - rect.top - rect.height / 2;
        const distance = Math.sqrt(x * x + y * y);

        if (distance < 100) {
          const strength = (100 - distance) / 100;
          (button as HTMLElement).style.transform = `translate(${x * strength * 0.3}px, ${y * strength * 0.3}px)`;
        }
      };

      const handleMouseLeave = () => {
        (button as HTMLElement).style.transform = 'translate(0, 0)';
      };

      button.addEventListener('mousemove', handleMouseMove);
      button.addEventListener('mouseleave', handleMouseLeave);
    });
  }, []);

  return (
    <>
      {/* Scroll Progress Bar */}
      <div 
        className="scroll-progress" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Custom Cursor Trail */}
      <div 
        className="cursor-trail"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Konami Mode Indicator */}
      {konamiMode && (
        <div className="fixed top-4 left-4 bg-black text-green-500 px-4 py-2 rounded font-mono text-sm z-50 animate-pulse">
          TERMINAL MODE ACTIVATED
        </div>
      )}
    </>
  );
}
