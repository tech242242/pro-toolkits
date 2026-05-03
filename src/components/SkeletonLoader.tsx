import React from 'react';

export const SkeletonProfile = () => (
  <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-pulse">
    <div className="flex flex-col md:flex-row items-start gap-6 border-b border-white/5 pb-8">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10" />
      <div className="flex-1 space-y-4">
        <div className="h-10 bg-white/10 rounded-lg w-1/3" />
        <div className="h-4 bg-white/10 rounded-lg w-1/4" />
        <div className="h-16 bg-white/10 rounded-lg w-full max-w-xl" />
        <div className="flex gap-4">
          <div className="h-6 bg-white/10 rounded-full w-24" />
          <div className="h-6 bg-white/10 rounded-full w-24" />
        </div>
      </div>
    </div>
    
    <div className="mt-8 space-y-6">
      <div className="h-12 bg-white/10 rounded-2xl w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="w-full aspect-square bg-white/10 rounded-2xl" />
            <div className="h-4 bg-white/10 rounded-lg w-3/4" />
            <div className="h-3 bg-white/10 rounded-lg w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="flex-1 min-h-screen bg-[#03040B] text-white p-4 md:p-8 animate-pulse">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div className="space-y-2">
          <div className="h-8 bg-white/10 rounded-lg w-48" />
          <div className="h-4 bg-white/10 rounded-lg w-32" />
        </div>
        <div className="h-10 bg-white/20 rounded-full w-10 sm:w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-white/5 rounded-3xl border border-white/5" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-[400px] bg-white/5 rounded-3xl border border-white/5" />
          <div className="h-64 bg-white/5 rounded-3xl border border-white/5" />
        </div>
        <div className="space-y-8">
          <div className="h-96 bg-white/5 rounded-3xl border border-white/5" />
          <div className="h-64 bg-white/5 rounded-3xl border border-white/5" />
        </div>
      </div>
    </div>
  </div>
);
