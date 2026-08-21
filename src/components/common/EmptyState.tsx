import React from 'react';
import { Search, Compass, RefreshCw } from 'lucide-react';
import { mockCategories } from '../../data/mockWpData';
import { useLanguage } from '../../context/LanguageContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  onSelectCategory?: (slug: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  onReset,
  onSelectCategory,
}) => {
  const { t, isHindi } = useLanguage();

  const displayTitle = title || (isHindi ? 'कोई समाचार नहीं मिला' : 'No Stories Found');
  const displayDescription = description || (isHindi ? 'हम आपके वर्तमान फ़िल्टर मानदंडों से मेल खाने वाले लेखों का पता नहीं लगा सके।' : 'We could not locate articles matching your current filter criteria.');

  return (
    <div className="py-12 px-6 bg-surface-lowest border border-border-subtle rounded-sm text-center my-6 max-w-2xl mx-auto shadow-subtle">
      <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center text-primary mb-4">
        <Compass className="w-7 h-7" />
      </div>

      <h3 className="font-serif text-2xl font-bold text-ink mb-2">
        {displayTitle}
      </h3>

      <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto mb-6 leading-relaxed">
        {displayDescription}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 mb-6"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isHindi ? 'सभी फ़िल्टर रीसेट करें' : 'Reset All Filters'}</span>
        </button>
      )}

      {onSelectCategory && (
        <div className="pt-6 border-t border-border-subtle">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">
            {isHindi ? 'प्रमुख संपादकीय डेस्क देखें' : 'Explore Primary Editorial Desks'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {mockCategories.slice(0, 6).map((cat) => {
              const catLabel = isHindi && cat.nameHi ? cat.nameHi : cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-high text-xs font-medium text-ink rounded-sm border border-border-subtle transition-colors"
                >
                  {catLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
