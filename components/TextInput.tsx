import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  helpText?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, id, helpText, className = '', ...props }) => {
  const baseInputClasses = "block w-full bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:opacity-75 disabled:bg-slate-200 px-3 py-2 border";
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
          {label} {props.required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`${baseInputClasses} ${className}`.trim()}
        {...props}
      />
      {helpText && <p className="mt-1 text-xs text-slate-400">{helpText}</p>}
    </div>
  );
};