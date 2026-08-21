import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t, isHindi } = useLanguage();
  if (totalPages <= 1) return null;

  return (
    <div className="py-8 flex items-center justify-center gap-2 text-xs font-semibold">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-sm border border-border-subtle bg-surface-lowest hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors text-ink"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{isHindi ? 'पिछला' : 'Previous'}</span>
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-sm flex items-center justify-center transition-colors ${
            page === currentPage
              ? 'bg-primary text-white font-bold'
              : 'border border-border-subtle bg-surface-lowest hover:bg-surface-container text-ink'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-sm border border-border-subtle bg-surface-lowest hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors text-ink"
      >
        <span>{isHindi ? 'अगला' : 'Next'}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
