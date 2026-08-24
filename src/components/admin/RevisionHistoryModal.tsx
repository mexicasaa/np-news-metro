import React, { useState } from 'react';
import { History, X, Check, ArrowRight, RotateCcw, Eye, Shield } from 'lucide-react';
import { ArticleRevision } from '../../types/admin';
import { mockRevisionsList } from '../../data/mockAdminData';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion?: (revision: ArticleRevision) => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  onClose,
  onRestoreVersion,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<ArticleRevision>(mockRevisionsList[0]);
  const [compareVersion, setCompareVersion] = useState<ArticleRevision | null>(mockRevisionsList[1] || null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-surface-lowest border border-border-subtle rounded-md shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-primary-container text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-ink">
                Article Revision Trace & Correction History
              </h2>
              <p className="text-xs text-ink-muted">
                Complete forensic audit trail of all headline, copy, and metadata edits.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-ink rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Revisions Split List & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border-subtle flex-1 overflow-hidden">
          {/* Left: Revisions Timeline (5 cols) */}
          <div className="md:col-span-5 p-4 overflow-y-auto space-y-2 text-xs">
            <div className="font-mono text-[10px] uppercase font-bold text-ink-muted pb-1 mb-2">
              Revision Snapshots ({mockRevisionsList.length})
            </div>

            {mockRevisionsList.map((rev) => {
              const isSelected = selectedVersion.id === rev.id;

              return (
                <div
                  key={rev.id}
                  onClick={() => setSelectedVersion(rev)}
                  className={`p-3 rounded-sm border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-50/60 border-editorial-red shadow-2xs'
                      : 'bg-white border-border-subtle hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary">
                      Version {rev.version}.0
                    </span>
                    <span className="text-[10px] font-mono text-ink-muted">
                      {rev.timestamp.split(' ')[1]}
                    </span>
                  </div>

                  <p className="font-semibold text-ink mt-1 truncate">
                    {rev.editorName} ({rev.editorRole})
                  </p>

                  <p className="text-[11px] text-ink-muted line-clamp-2 mt-0.5">
                    {rev.summaryOfChanges}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Version Details (7 cols) */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  Snapshot v{selectedVersion.version}.0
                </span>
                <p className="text-[11px] text-ink-muted font-mono mt-1">
                  Recorded: {selectedVersion.timestamp} by {selectedVersion.editorName}
                </p>
              </div>

              {onRestoreVersion && selectedVersion.version !== mockRevisionsList[0].version && (
                <button
                  onClick={() => onRestoreVersion(selectedVersion)}
                  className="px-3 py-1.5 bg-primary hover:bg-slate-800 text-white rounded-sm text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Version</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-mono uppercase font-bold text-[10px] text-ink-muted mb-1">
                  Headline at this version
                </label>
                <div className="p-3 bg-slate-50 border border-border-subtle rounded-sm font-serif font-bold text-sm text-ink leading-snug">
                  {selectedVersion.headline}
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase font-bold text-[10px] text-ink-muted mb-1">
                  Summary of Changes
                </label>
                <div className="p-3 bg-slate-50 border border-border-subtle rounded-sm text-ink-secondary leading-relaxed">
                  {selectedVersion.summaryOfChanges}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-border-subtle flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-ink rounded-sm text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
