import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative clean background element */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Sleek Brand Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center shadow-md ring-1 ring-gray-900/10">
              <span className="text-white text-base font-bold tracking-tight">LF</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Loan<span className="text-gray-500 font-normal">Flow</span>
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
