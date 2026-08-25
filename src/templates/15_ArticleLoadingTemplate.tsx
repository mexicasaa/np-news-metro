import React from 'react';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';

interface ArticleLoadingTemplateProps {
  categorySlug?: string;
  onNavigateHome: () => void;
  onSelectCategory?: (category: string) => void;
}

export const ArticleLoadingTemplate: React.FC<ArticleLoadingTemplateProps> = ({
  categorySlug = 'india',
  onNavigateHome,
  onSelectCategory,
}) => {
  return (
    <div className="bg-canvas min-h-screen">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: onNavigateHome },
          { 
            label: categorySlug.toUpperCase(), 
            onClick: () => onSelectCategory && onSelectCategory(categorySlug) 
          },
          { label: 'Loading Report...', isActive: true },
        ]}
      />

      <main className="max-w-site mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Article Column (8 Cols) */}
          <article className="lg:col-span-8 max-w-reading animate-pulse">
            {/* Category & Tag placeholder */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-5 w-20 bg-surface-container rounded-xs"></div>
              <div className="h-4 w-28 bg-surface-container rounded-xs"></div>
            </div>

            {/* Headline Skeleton */}
            <div className="space-y-3 mb-4">
              <div className="h-8 sm:h-10 bg-surface-container rounded-xs w-full"></div>
              <div className="h-8 sm:h-10 bg-surface-container rounded-xs w-5/6"></div>
            </div>

            {/* Sub-headline / Dek Skeleton */}
            <div className="space-y-2 mb-6 pb-5 border-b border-border-subtle">
              <div className="h-4 bg-surface-container rounded-xs w-full"></div>
              <div className="h-4 bg-surface-container rounded-xs w-4/5"></div>
            </div>

            {/* Author Byline Skeleton */}
            <div className="flex items-center justify-between py-3 border-y border-border-subtle mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-surface-container"></div>
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-surface-container rounded-xs"></div>
                  <div className="h-3 w-24 bg-surface-container rounded-xs"></div>
                </div>
              </div>
              <div className="h-8 w-24 bg-surface-container rounded-xs hidden sm:block"></div>
            </div>

            {/* Featured Image Skeleton */}
            <div className="mb-6">
              <div className="aspect-[16/9] w-full bg-surface-container rounded-sm"></div>
              <div className="h-3 w-1/2 bg-surface-container rounded-xs mt-2"></div>
            </div>

            {/* Social Share Bar Skeleton */}
            <div className="flex items-center gap-2 mb-8 py-2.5 px-3 bg-surface-lowest border border-border-subtle rounded-xs">
              <div className="h-7 w-20 bg-surface-container rounded-xs"></div>
              <div className="h-7 w-20 bg-surface-container rounded-xs"></div>
              <div className="h-7 w-20 bg-surface-container rounded-xs"></div>
            </div>

            {/* Article Content Paragraphs Skeleton */}
            <div className="space-y-4">
              <div className="h-4 bg-surface-container rounded-xs w-full"></div>
              <div className="h-4 bg-surface-container rounded-xs w-full"></div>
              <div className="h-4 bg-surface-container rounded-xs w-11/12"></div>
              <div className="h-4 bg-surface-container rounded-xs w-full"></div>
              
              <div className="p-4 my-6 bg-surface-lowest border-l-4 border-slate-300 rounded-r-sm space-y-2">
                <div className="h-4 bg-surface-container rounded-xs w-full"></div>
                <div className="h-4 bg-surface-container rounded-xs w-3/4"></div>
              </div>

              <div className="h-4 bg-surface-container rounded-xs w-full"></div>
              <div className="h-4 bg-surface-container rounded-xs w-5/6"></div>
              <div className="h-4 bg-surface-container rounded-xs w-full"></div>
            </div>
          </article>

          {/* Right Rail Sidebar Skeleton (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6 animate-pulse">
            <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm space-y-4">
              <div className="h-5 w-32 bg-surface-container rounded-xs"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-border-subtle last:border-0">
                    <div className="w-16 h-12 bg-surface-container rounded-xs flex-shrink-0"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-surface-container rounded-xs w-full"></div>
                      <div className="h-3 bg-surface-container rounded-xs w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
