import React from 'react';

export const FrontendLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas animate-pulse" aria-label="Loading NP News Metro">
      {/* 1. Breaking News Ticker Skeleton */}
      <div className="bg-surface-lowest border-y border-border-subtle py-2.5 px-4 mb-4">
        <div className="max-w-site mx-auto flex items-center gap-3">
          <div className="h-5 w-24 bg-primary/20 rounded-xs"></div>
          <div className="h-4 flex-1 bg-surface-container rounded-xs max-w-xl"></div>
        </div>
      </div>

      <main className="max-w-site mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-8">
        {/* 2. Grand Hero & Supporting Cluster Skeleton */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* Main Hero Card Placeholder (8 cols) */}
          <div className="lg:col-span-8 bg-surface-lowest border border-border-subtle p-4 sm:p-6 rounded-sm space-y-4">
            {/* 16:9 Image Box */}
            <div className="aspect-[16/9] w-full bg-surface-container rounded-sm"></div>

            {/* Category tag & Read time */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-4 w-20 bg-secondary/30 rounded-xs"></div>
              <div className="h-3 w-16 bg-surface-container rounded-xs"></div>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <div className="h-7 sm:h-9 bg-surface-container rounded-xs w-full"></div>
              <div className="h-7 sm:h-9 bg-surface-container rounded-xs w-4/5"></div>
            </div>

            {/* Excerpt / Dek */}
            <div className="space-y-1.5 pt-1">
              <div className="h-4 bg-surface-container rounded-xs w-full"></div>
              <div className="h-4 bg-surface-container rounded-xs w-3/4"></div>
            </div>

            {/* Byline and Share Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container"></div>
                <div className="h-4 w-32 bg-surface-container rounded-xs"></div>
              </div>
              <div className="h-6 w-20 bg-surface-container rounded-xs"></div>
            </div>
          </div>

          {/* Right Column: Editor's Picks / Supporting Headlines (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="pb-2 border-b-2 border-primary flex justify-between items-center">
              <div className="h-4 w-28 bg-primary/20 rounded-xs"></div>
              <div className="h-3 w-14 bg-surface-container rounded-xs"></div>
            </div>

            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface-lowest rounded-sm border border-border-subtle p-3 flex gap-3 items-center"
              >
                <div className="w-20 h-16 bg-surface-container rounded-sm shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 bg-surface-container rounded-xs"></div>
                  <div className="h-4 bg-surface-container rounded-xs w-full"></div>
                  <div className="h-3 bg-surface-container rounded-xs w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 3-Column Story Grid Skeletons */}
        <section className="pt-4 border-t border-border-subtle">
          <div className="h-6 w-36 bg-primary/25 rounded-xs mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-lowest border border-border-subtle p-4 rounded-sm space-y-3">
                <div className="aspect-[16/10] bg-surface-container rounded-sm"></div>
                <div className="h-3 w-20 bg-secondary/30 rounded-xs"></div>
                <div className="h-5 bg-surface-container rounded-xs w-full"></div>
                <div className="h-5 bg-surface-container rounded-xs w-3/4"></div>
                <div className="h-3 bg-surface-container rounded-xs w-full"></div>
                <div className="h-3 bg-surface-container rounded-xs w-2/3"></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
