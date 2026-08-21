import React from 'react';
import { AlertCircle, History } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CorrectionNoticeProps {
  date: string;
  text: string;
}

export const CorrectionNotice: React.FC<CorrectionNoticeProps> = ({
  date,
  text,
}) => {
  const { isHindi } = useLanguage();

  return (
    <div className="my-6 p-4 bg-amber-50/70 border border-amber-200/90 rounded-sm text-xs text-amber-950">
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-amber-900 mb-1">
        <AlertCircle className="w-3.5 h-3.5 text-editorial-red" />
        <span>{isHindi ? 'संपादकीय सुधार सूचना' : 'Editorial Correction Notice'}</span>
        <span className="text-amber-700 font-normal">({date})</span>
      </div>
      <p className="leading-relaxed text-ink-secondary">
        {text}
      </p>
    </div>
  );
};
