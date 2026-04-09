import React from 'react';

interface Props {
  label: string;
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<Props> = ({ label, color, onChange, className }) => {
  return (
    <div className={`flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors duration-200 ${className}`}>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{label}</span>
        <div className="flex items-center gap-3">
            <input 
                type="text" 
                value={color} 
                onChange={(e) => onChange(e.target.value)}
                maxLength={7}
                className="w-20 text-center text-xs font-mono font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 focus:ring-2 focus:ring-brand-500 outline-none uppercase transition-colors duration-200"
            />
            <div className="relative overflow-hidden rounded-full w-10 h-10 shadow-md ring-2 ring-white dark:ring-slate-800 cursor-pointer transition-colors duration-200">
                <input 
                    type="color" 
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                />
            </div>
        </div>
    </div>
  );
};
