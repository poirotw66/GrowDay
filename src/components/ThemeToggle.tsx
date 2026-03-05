import React, { memo, useMemo } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = useMemo(() => [
    { value: 'light' as const, icon: Sun, label: '淺色' },
    { value: 'dark' as const, icon: Moon, label: '深色' },
    { value: 'system' as const, icon: Monitor, label: '系統' },
  ], []);

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
            ${theme === value 
              ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }
          `}
          title={label}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
});

export default ThemeToggle;
