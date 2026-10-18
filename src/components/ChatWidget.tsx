import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/LanguageProvider';
import { sendChatMessage } from '../services';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  isError?: boolean;
}

export const ChatWidget: React.FC = () => {
  const { lang, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize with welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'bot',
          text: t('chat.welcomeMessage'),
        },
      ]);
    }
  }, [isOpen, messages.length, t]);

  // Manage focus on open/close & Esc key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          openButtonRef.current?.focus();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (userTextToSend?: string) => {
    const text = (userTextToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(text, lang);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        isError: response.isError,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-err-${Date.now()}`,
          sender: 'bot',
          text: t('chat.errorText'),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    handleSend(chipText);
  };

  const chips = [
    { label: t('chat.chipApply'), text: lang === 'ur' ? 'داخلہ کیسے لیں؟' : 'How do I apply for admission?' },
    { label: t('chat.chipClasses'), text: lang === 'ur' ? 'کون سی کلاسز ہیں؟' : 'What classes and subjects are offered?' },
    { label: t('chat.chipFees'), text: lang === 'ur' ? 'ماہانہ فیس کیا ہے؟' : 'What is the monthly fee structure?' },
    { label: t('chat.chipTiming'), text: lang === 'ur' ? 'کلاسز کے اوقات کیا ہیں؟' : 'What are the class timings?' },
    { label: t('chat.chipContact'), text: lang === 'ur' ? 'اکیڈمی کا رابطہ اور پتہ' : 'Campus location and contact number?' },
  ];

  return (
    <>
      {/* Floating Chat Button at bottom START corner (WhatsApp is at bottom END corner) */}
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t('chat.closeAria') : t('chat.openAria')}
        title={t('chat.widgetTitle')}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="fixed bottom-6 start-6 z-40 w-14 h-14 bg-[#312E81] hover:bg-[#1E1B4B] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#312E81]/40 cursor-pointer"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window: Full-width bottom drawer on mobile, 360px box on desktop */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('chat.widgetTitle')}
          className="fixed z-50 bottom-22 start-4 end-4 sm:end-auto sm:start-6 sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-[#312E81] text-white px-5 py-4 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-[#1E1B4B] flex items-center justify-center font-bold text-xs shrink-0 font-heading">
                UA
              </div>
              <div className="text-start">
                <h3 className="font-heading font-semibold text-sm leading-tight text-white">
                  {t('chat.widgetTitle')}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-slate-200 font-medium">{t('chat.badge')}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openButtonRef.current?.focus();
              }}
              aria-label={t('chat.closeAria')}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div
            aria-live="polite"
            className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-sm"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed text-start ${
                    m.sender === 'user'
                      ? 'bg-[#312E81] text-white rounded-br-xs'
                      : m.isError
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  aria-label={t('chat.typing')}
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce motion-reduce:animate-none" />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce motion-reduce:animate-none"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce motion-reduce:animate-none"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0 pb-2.5">
            {chips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChipClick(chip.text)}
                disabled={isTyping}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-[#312E81] hover:text-white text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] disabled:opacity-50 shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 300))}
                placeholder={t('chat.inputPlaceholder')}
                disabled={isTyping}
                maxLength={300}
                className="w-full h-10 px-3.5 pe-8 rounded-lg border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] disabled:bg-slate-100 placeholder:text-slate-400"
              />
              {input.length > 200 && (
                <span className="absolute end-2 top-2.5 text-[10px] text-slate-400 pointer-events-none">
                  {300 - input.length}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label={t('chat.sendAria')}
              className="w-10 h-10 rounded-lg bg-[#312E81] text-white flex items-center justify-center hover:bg-[#1E1B4B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81]"
            >
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          {/* Bottom helper disclaimer */}
          <div className="px-4 py-1.5 bg-slate-50 text-[10px] text-slate-500 text-center border-t border-slate-100">
            {t('chat.disclaimer')}
          </div>
        </div>
      )}
    </>
  );
};
