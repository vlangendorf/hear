import React from 'react';
import { Scroll, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  isFloating?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  isFloating = false,
}) => {
  const { toggleTheme, isParchment } = useTheme();

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer select-none active:scale-95 ${
        isParchment
          ? 'bg-[#eddcb8]/80 hover:bg-[#faecd1] text-[#543417] hover:text-[#381e09] border border-[#c5a374]/60 shadow-xs backdrop-blur-md'
          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/60 shadow-xs backdrop-blur-md'
      } ${
        isFloating
          ? 'fixed top-3 right-3 sm:top-4 sm:right-4 z-50'
          : ''
      } ${className}`}
      title={
        isParchment
          ? 'Alternar para o Tema Moderno (Dark)'
          : 'Alternar para o Tema Pergaminho Medieval RPG'
      }
    >
      {isParchment ? (
        <>
          <Sun size={13} className="text-amber-700 shrink-0" />
          <span className="font-serif text-[11px] font-semibold tracking-wide">
            Tema Moderno
          </span>
        </>
      ) : (
        <>
          <Scroll size={13} className="text-amber-400 shrink-0" />
          <span className="text-[11px] font-medium">
            Tema Pergaminho
          </span>
        </>
      )}
    </button>
  );
};
