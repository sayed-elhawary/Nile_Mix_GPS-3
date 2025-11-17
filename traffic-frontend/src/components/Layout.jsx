import React from 'react';

const Layout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      {/* Background متحرك خفيف (اختياري بس يجنن) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl animate-pulse"></div>
      </div>

      <div className="flex items-center justify-center px-4 py-8 sm:py-12 md:py-16">
        <div
          className="w-full max-w-5xl mx-auto animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
        >
          {title && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-8 sm:mb-12 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              {title}
            </h1>
          )}

          <div className="backdrop-blur-xl bg-gray-800/60 border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 md:p-12 lg:p-16">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
