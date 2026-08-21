import React from 'react';

interface SkeletonCardProps {
  variant?: 'hero' | 'grid' | 'row';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'grid' }) => {
  if (variant === 'hero') {
    return (
      <div className="bg-surface-lowest border border-border-subtle p-6 rounded-sm animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 aspect-[16/9] bg-surface-container rounded-sm"></div>
        <div className="lg:col-span-5 space-y-4">
          <div className="h-4 bg-surface-container rounded w-24"></div>
          <div className="h-8 bg-surface-container rounded w-full"></div>
          <div className="h-8 bg-surface-container rounded w-3/4"></div>
          <div className="h-4 bg-surface-container rounded w-full"></div>
          <div className="h-4 bg-surface-container rounded w-2/3"></div>
          <div className="h-10 bg-surface-container rounded w-full mt-6"></div>
        </div>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className="py-3 px-3 border-b border-border-subtle animate-pulse flex items-start gap-4">
        <div className="w-16 h-4 bg-surface-container rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-container rounded w-full"></div>
          <div className="h-3 bg-surface-container rounded w-3/4"></div>
        </div>
        <div className="w-14 h-14 bg-surface-container rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-lowest border border-border-subtle p-4 rounded-sm animate-pulse space-y-3">
      <div className="aspect-[16/10] bg-surface-container rounded-sm"></div>
      <div className="h-3 bg-surface-container rounded w-20"></div>
      <div className="h-5 bg-surface-container rounded w-full"></div>
      <div className="h-5 bg-surface-container rounded w-4/5"></div>
      <div className="h-3 bg-surface-container rounded w-full"></div>
    </div>
  );
};
