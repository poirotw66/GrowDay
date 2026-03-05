import React from 'react';
import { ChevronRight } from 'lucide-react';

export const SectionDivider: React.FC<{
  label: string;
  icon?: React.ReactNode;
}> = ({ label, icon }) => (
  <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-3 first:mt-0">
    {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
    {label}
  </div>
);

export const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string | number;
}> = ({ title, icon, isOpen, onToggle, children, badge }) => (
  <>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200 font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-full">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight
        size={16}
        className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="bg-slate-50 dark:bg-slate-700 p-3 m-2 rounded-xl border border-slate-100 dark:border-slate-600 transition-all duration-200">
        {children}
      </div>
    )}
  </>
);
