'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
        } ${className}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({ label, error, id, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        } ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
