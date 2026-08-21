import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const { t, isHindi } = useLanguage();

  const getLocalizedLabel = (label: string) => {
    if (label.toLowerCase() === 'home') return t.nav_home;
    return label;
  };

  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-4 bg-transparent border-b border-border-subtle text-xs text-ink-secondary">
      <div className="max-w-site mx-auto flex items-center gap-1.5 flex-wrap">
        <button
          onClick={items[0]?.onClick}
          className="flex items-center gap-1 hover:text-primary transition-colors text-ink/70"
          aria-label={t.nav_home}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="sr-only">{t.nav_home}</span>
        </button>

        {items.map((item, index) => {
          const displayLabel = getLocalizedLabel(item.label);
          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3 h-3 text-border-strong flex-shrink-0" />
              {item.isActive || !item.onClick ? (
                <span className="font-semibold text-primary truncate max-w-xs sm:max-w-md" aria-current="page">
                  {displayLabel}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="hover:text-primary transition-colors text-ink/80 truncate max-w-xs"
                >
                  {displayLabel}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
