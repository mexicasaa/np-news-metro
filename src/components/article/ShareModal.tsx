import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Mail, 
  Sparkles,
  Smartphone,
  Globe
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  generateSocialShareLinks, 
  shareArticleNative, 
  getAbsoluteImageUrl, 
  ShareOptions 
} from '../../utils/shareUtils';
import { handleImageError } from '../../utils/imageFallback';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  imageUrl?: string;
  summary?: string;
  category?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  imageUrl,
  summary,
  category,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);
  const { isHindi } = useLanguage();

  if (!isOpen) return null;

  const shareOptions: ShareOptions = {
    title,
    url,
    imageUrl,
    summary,
    category,
  };

  const links = generateSocialShareLinks(shareOptions);
  const absoluteImage = links.absoluteImage;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyImage = async () => {
    try {
      const response = await fetch(absoluteImage);
      const blob = await response.blob();
      if ((navigator.clipboard as any)?.write) {
        await (navigator.clipboard as any).write([
          new ClipboardItem({ [blob.type || 'image/jpeg']: blob })
        ]);
        setImageCopied(true);
        setTimeout(() => setImageCopied(false), 2500);
        return;
      }
    } catch {
      // If clipboard write failed, trigger download
    }
    // Fallback: download image
    handleDownloadImage();
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = absoluteImage;
    link.download = `npnews-${(category || 'news').toLowerCase()}-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNativeShare = async () => {
    setIsSharingNative(true);
    await shareArticleNative(shareOptions);
    setIsSharingNative(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div 
        className="relative w-full max-w-lg bg-surface-lowest border border-border-subtle rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-container/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-base font-serif font-bold text-ink leading-tight">
                {isHindi ? 'खबर और फोटो शेयर करें' : 'Share Article & Featured Image'}
              </h2>
              <p className="text-[11px] text-ink-muted leading-tight">
                {isHindi ? 'फोटो सहित सभी सोशल मीडिया पर तुरंत साझा करें' : 'Share with high-resolution image preview across platforms'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-high rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Article Live Preview Card */}
          <div className="bg-surface-container/30 border border-border-subtle rounded-md p-3 flex gap-3.5 items-start">
            <div className="relative w-24 h-20 sm:w-28 sm:h-20 flex-shrink-0 bg-slate-900 rounded overflow-hidden shadow-2xs">
              <img
                src={absoluteImage}
                alt={title}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-white font-mono px-1 py-0.5 rounded leading-none">
                HD
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {category && (
                <span className="inline-block text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  {category}
                </span>
              )}
              <h3 className="text-xs sm:text-sm font-serif font-bold text-ink leading-snug line-clamp-2">
                {title}
              </h3>
              <p className="text-[11px] text-ink-muted mt-1 truncate">
                npnewsmetro.com
              </p>
            </div>
          </div>

          {/* Top Quick Action: WhatsApp & Native Device Share */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs shadow-xs transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>{isHindi ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp'}</span>
            </a>

            {/* Native OS Share Sheet with Image Attachment */}
            <button
              onClick={handleNativeShare}
              disabled={isSharingNative}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-md font-semibold text-xs shadow-xs transition-all active:scale-[0.98] disabled:opacity-75"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isHindi ? 'मोबाइल ऐप्स पर भेजें (फोटो सहित)' : 'Share via Device (with Image)'}</span>
            </button>
          </div>

          {/* Social Platforms Grid */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block mb-2">
              {isHindi ? 'अन्य सोशल प्लेटफॉर्म' : 'More Social Platforms'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* X / Twitter */}
              <a
                href={links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 bg-surface-lowest hover:bg-surface-high border border-border-subtle rounded-md text-xs font-medium text-ink transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">𝕏</span>
                <span>X / Post</span>
              </a>

              {/* Facebook */}
              <a
                href={links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 bg-surface-lowest hover:bg-surface-high border border-border-subtle rounded-md text-xs font-medium text-ink transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">f</span>
                <span>Facebook</span>
              </a>

              {/* Telegram */}
              <a
                href={links.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 bg-surface-lowest hover:bg-surface-high border border-border-subtle rounded-md text-xs font-medium text-ink transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">✈</span>
                <span>Telegram</span>
              </a>

              {/* LinkedIn */}
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 bg-surface-lowest hover:bg-surface-high border border-border-subtle rounded-md text-xs font-medium text-ink transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-bold">in</span>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Secondary Actions: Email & Google News */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={links.email}
              className="flex items-center justify-center gap-1.5 p-2 bg-surface-container hover:bg-surface-high border border-border-subtle rounded-md text-xs font-medium text-ink transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>{isHindi ? 'ईमेल से भेजें' : 'Share via Email'}</span>
            </a>

            <a
              href={links.googleNews}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 bg-surface-container hover:bg-surface-high border border-border-subtle rounded-md text-xs font-medium text-ink transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{isHindi ? 'Google News पर देखें' : 'View on Google News'}</span>
            </a>
          </div>

          {/* Copy Link & Featured Image Box */}
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            {/* Copy Article URL */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-container border border-border-subtle px-3 py-2 rounded-md text-xs font-mono text-ink-muted truncate">
                {url}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{isHindi ? 'कॉपी हो गया' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Image Tools (Download or Copy for Status/Stories) */}
            <div className="flex items-center justify-between p-2.5 bg-surface-container/50 rounded-md border border-border-subtle text-xs">
              <div className="flex items-center gap-2 text-ink-secondary">
                <Sparkles className="w-3.5 h-3.5 text-secondary-gold" />
                <span className="text-[11px]">
                  {isHindi ? 'WhatsApp स्टेटस / स्टोरी के लिए फोटो डाउनलोड करें:' : 'Save photo for WhatsApp Status / Instagram Story:'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyImage}
                  className="px-2.5 py-1 bg-surface-lowest hover:bg-surface-high border border-border-subtle rounded text-[11px] font-medium text-ink flex items-center gap-1 transition-colors"
                  title="Copy Image to Clipboard"
                >
                  {imageCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{imageCopied ? (isHindi ? 'फोटो कॉपी हुई' : 'Image Copied') : (isHindi ? 'फोटो कॉपी' : 'Copy Photo')}</span>
                </button>

                <button
                  onClick={handleDownloadImage}
                  className="px-2.5 py-1 bg-surface-lowest hover:bg-surface-high border border-border-subtle rounded text-[11px] font-medium text-ink flex items-center gap-1 transition-colors"
                  title="Download Image"
                >
                  <Download className="w-3 h-3" />
                  <span>{isHindi ? 'डाउनलोड' : 'Download'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container/30 border-t border-border-subtle flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-container hover:bg-surface-high text-ink font-medium text-xs rounded-md transition-colors"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
