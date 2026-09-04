import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles, Shield, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { subscribeNewsletter } from '../../services/subscriberService';

interface NewsletterModuleProps {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export const NewsletterModule: React.FC<NewsletterModuleProps> = ({
  isOpen = true,
  onClose,
  inline = false,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const { t, isHindi } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      subscribeNewsletter(email, [frequency]).catch(() => {});
    }
  };

  const content = (
    <div className="bg-surface-lowest border-2 border-primary p-6 sm:p-8 rounded-sm shadow-subtle relative">
      {onClose && !inline && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-surface-container rounded text-ink-muted"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {subscribed ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-ink mb-2">
            {isHindi ? 'ब्रीफिंग में आपका स्वागत है' : 'Welcome to the Briefing'}
          </h3>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto mb-4">
            {isHindi
              ? `पुष्टिकरण ईमेल ${email} पर भेज दिया गया है। आपको कल सुबह 7:30 बजे अपना पहला समाचार पत्र प्राप्त होगा।`
              : `A confirmation email has been sent to ${email}. You will receive your first editorial briefing tomorrow at 7:30 AM IST.`}
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-primary text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm"
            >
              {isHindi ? 'पढ़ना जारी रखें' : 'Continue Reading'}
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 text-secondary font-bold uppercase tracking-widest text-[11px] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-secondary-gold" />
            <span>{isHindi ? 'एनपी न्यूज़ मेट्रो संपादकीय प्रेषण' : 'NP News Metro Newsroom Dispatches'}</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-3 leading-tight">
            {t.newsletterTitle}
          </h3>

          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed mb-6 max-w-xl">
            {t.newsletterSubhead}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletterPlaceholder}
                required
                className="flex-1 bg-surface-container border border-border-subtle px-4 py-2.5 text-sm text-ink rounded-sm focus:outline-hidden focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shadow-subtle flex-shrink-0"
              >
                <Mail className="w-4 h-4 text-secondary-gold" />
                <span>{t.newsletterBtn}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs text-ink-muted flex-wrap pt-2 border-t border-border-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    checked={frequency === 'daily'}
                    onChange={() => setFrequency('daily')}
                    className="accent-primary"
                  />
                  <span>{isHindi ? 'दैनिक प्रभात ब्रीफिंग (सुबह 7:30)' : 'Daily Morning Briefing (7:30 AM)'}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    checked={frequency === 'weekend'}
                    onChange={() => setFrequency('weekend')}
                    className="accent-primary"
                  />
                  <span>{isHindi ? 'साप्ताहिक विशेष संस्करण (शनिवार)' : 'Weekly Longform Edition (Saturday)'}</span>
                </label>
              </div>

              <span className="flex items-center gap-1 text-[11px]">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>{t.newsletterPrivacy}</span>
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  if (inline) {
    return <div className="my-10">{content}</div>;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink/70 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl animate-fadeIn">
        {content}
      </div>
    </div>
  );
};
