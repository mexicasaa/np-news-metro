import React from 'react';
import { Pin, Radio, Clock, User, Share2 } from 'lucide-react';
import { LiveUpdate } from '../../types/wordpress';
import { useLanguage } from '../../context/LanguageContext';

interface LiveTimelineProps {
  updates: LiveUpdate[];
  status?: 'LIVE' | 'CONCLUDED';
}

export const LiveTimeline: React.FC<LiveTimelineProps> = ({
  updates,
  status = 'LIVE',
}) => {
  const { isHindi } = useLanguage();

  return (
    <div className="my-8">
      {/* Live Header Banner */}
      <div className="bg-primary text-white px-4 py-3 rounded-t-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {status === 'LIVE' ? (
            <span className="flex items-center gap-1.5 bg-editorial-red text-white text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>{isHindi ? 'लाइव अपडेट' : 'Live Updates'}</span>
            </span>
          ) : (
            <span className="bg-slate-700 text-slate-200 text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
              {isHindi ? 'कवरेज समाप्त' : 'Coverage Concluded'}
            </span>
          )}
          <span className="text-xs font-medium text-slate-300">
            {isHindi ? 'रीयल-टाइम ब्यूरो फ़ीड' : 'Real-time bureau feed'}
          </span>
        </div>
        <span className="text-[11px] text-slate-300 font-mono">
          {isHindi ? `${updates.length} अपडेट दर्ज` : `${updates.length} Updates Recorded`}
        </span>
      </div>

      {/* Stream of Updates */}
      <div className="bg-surface-lowest border-x border-b border-border-subtle p-4 sm:p-6 rounded-b-sm space-y-6">
        {updates.map((up) => (
          <div
            key={up.id}
            className={`relative pl-6 pb-6 border-l-2 last:border-l-0 last:pb-0 ${
              up.isPinned ? 'border-secondary' : 'border-border-subtle'
            }`}
          >
            {/* Timestamp Marker Dot */}
            <div
              className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                up.isPinned ? 'bg-secondary' : 'bg-primary'
              }`}
            >
              {up.isPinned ? (
                <Pin className="w-2.5 h-2.5 text-white" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              )}
            </div>

            {/* Content Body */}
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-primary bg-surface-container px-2 py-0.5 rounded-sm border border-border-subtle">
                  {up.timestamp}
                </span>

                {up.isPinned && (
                  <span className="bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border border-secondary/30">
                    {isHindi ? 'पिन किया गया अपडेट' : 'Pinned Update'}
                  </span>
                )}

                <span className="text-ink-muted text-xs flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{up.author}</span>
                </span>
              </div>

              <h4 className="font-serif font-bold text-base sm:text-lg text-ink leading-snug mb-2">
                {up.headline}
              </h4>

              <p className="text-sm text-ink-secondary leading-relaxed">
                {up.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
