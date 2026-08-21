import React, { useState } from 'react';
import { Share2, Bookmark, Check, Printer, MessageSquare, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ArticleShareBarProps {
  title: string;
  url?: string;
  commentCount?: number;
  onOpenComments?: () => void;
}

export const ArticleShareBar: React.FC<ArticleShareBarProps> = ({
  title,
  url = window.location.href,
  commentCount = 0,
  onOpenComments,
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const { t, isHindi } = useLanguage();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${title} — via @NPNewsMetro`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${title} - ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="py-2.5 px-3 sm:py-3 sm:px-4 bg-surface-lowest border border-border-subtle rounded-sm flex flex-wrap items-center justify-between gap-2.5 text-xs my-6 shadow-subtle">
      {/* Left: Share Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <span className="font-bold text-ink uppercase tracking-wider text-[10px] sm:text-[11px] flex items-center gap-1">
          <Share2 className="w-3.5 h-3.5 text-primary" />
          <span className="hidden xs:inline">{isHindi ? 'शेयर करें:' : 'Share:'}</span>
        </span>

        {/* WhatsApp */}
        <button
          onClick={handleShareWhatsApp}
          className="px-2.5 py-1 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 transition-colors"
          title="WhatsApp पर शेयर करें"
        >
          <Send className="w-3 h-3" />
          <span>WhatsApp</span>
        </button>

        {/* X / Twitter */}
        <button
          onClick={handleShareTwitter}
          className="px-2.5 py-1 rounded-sm bg-slate-900 hover:bg-black text-white font-medium flex items-center gap-1 transition-colors"
          title="X पर शेयर करें"
        >
          <span>X / Post</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="px-2.5 py-1 rounded-sm bg-surface-container hover:bg-surface-high border border-border-subtle text-ink font-medium transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">{t.linkCopied}</span>
            </>
          ) : (
            <span>{isHindi ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
          )}
        </button>
      </div>

      {/* Right: Bookmark & Comments trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className={`p-1.5 rounded-sm border transition-colors ${
            bookmarked
              ? 'bg-secondary/10 border-secondary text-secondary'
              : 'border-border-subtle text-ink-muted hover:bg-surface-container hover:text-ink'
          }`}
          title={bookmarked ? (isHindi ? 'सहेज लिया गया' : 'Saved to Bookmarks') : (isHindi ? 'बाद में पढ़ने के लिए सहेजें' : 'Save Story for Later')}
          aria-label={bookmarked ? (isHindi ? 'सहेज लिया गया' : 'Saved to Bookmarks') : (isHindi ? 'बाद में पढ़ने के लिए सहेजें' : 'Save Story for Later')}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={() => window.print()}
          className="hidden sm:flex p-1.5 rounded-sm border border-border-subtle text-ink-muted hover:bg-surface-container hover:text-ink transition-colors"
          title={isHindi ? 'लेख प्रिंट करें' : 'Print Article'}
          aria-label={isHindi ? 'लेख प्रिंट करें' : 'Print Article'}
        >
          <Printer className="w-4 h-4" />
        </button>

        {commentCount > 0 && onOpenComments && (
          <button
            onClick={onOpenComments}
            className="flex items-center gap-1 text-ink-secondary hover:text-primary transition-colors text-xs font-semibold pl-2 border-l border-border-subtle"
          >
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span>{commentCount}</span>
          </button>
        )}
      </div>
    </div>
  );
};
