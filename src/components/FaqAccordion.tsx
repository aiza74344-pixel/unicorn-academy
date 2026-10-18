import React, { useState } from 'react';
import { useI18n } from '../i18n/LanguageProvider';
import { FaqItem } from '../types';

interface FaqAccordionProps {
  faqs: FaqItem[];
  defaultOpenIndex?: number;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  faqs,
  defaultOpenIndex = 0,
}) => {
  const { lang } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-3.5 w-full text-start" role="region" aria-label="FAQ Accordion">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const question = lang === 'ur' ? faq.question_ur : faq.question_en;
        const answer = lang === 'ur' ? faq.answer_ur : faq.answer_en;
        const buttonId = `faq-btn-${faq.id}`;
        const panelId = `faq-panel-${faq.id}`;

        return (
          <div
            key={faq.id}
            className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-2xs transition-colors"
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(idx)}
                className="w-full py-4 px-5 sm:px-6 flex items-center justify-between gap-4 text-start font-heading font-semibold text-slate-900 hover:text-[#312E81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] cursor-pointer transition-colors"
              >
                <span className="text-sm sm:text-base leading-snug">{question}</span>
                <span
                  className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#312E81] text-white' : ''
                  }`}
                  aria-hidden="true"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </h3>

            {/* Accordion Panel */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={`px-5 sm:px-6 pb-4 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100/70 transition-all ${
                isOpen ? 'block' : 'hidden'
              }`}
            >
              <p className="max-w-[70ch]">{answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
