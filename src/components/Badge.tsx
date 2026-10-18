import React from 'react';
import { useI18n } from '../i18n/LanguageProvider';
import { BadgeStatus } from '../types';

export type ExtendedBadgeStatus = BadgeStatus | 'admission_open' | 'verified';

export interface BadgeProps {
  status: ExtendedBadgeStatus;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, className = '' }) => {
  const { t } = useI18n();

  const getStatusConfig = (s: ExtendedBadgeStatus) => {
    switch (s) {
      case 'verified':
      case 'paid':
        return {
          text: label || (s === 'verified' ? (label || t('badge.approved')) : t('badge.paid')),
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          ),
        };

      case 'unpaid':
        return {
          text: label || t('badge.unpaid'),
          classes: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'partial':
        return {
          text: label || t('badge.partial'),
          classes: 'bg-amber-50 text-amber-900 border-amber-200',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.5a.75.75 0 00.75.75h3a.75.75 0 000-1.5h-2.25V6.75z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'pending':
        return {
          text: label || t('badge.pending'),
          classes: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'approved':
        return {
          text: label || t('badge.approved'),
          classes: 'bg-teal-50 text-teal-900 border-teal-200',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'rejected':
        return {
          text: label || t('badge.rejected'),
          classes: 'bg-red-50 text-red-900 border-red-200',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'admission_open':
        return {
          text: label || t('badge.admissionOpen'),
          classes: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] font-semibold',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.814.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.206 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
            </svg>
          ),
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border shadow-2xs select-none ${config.classes} ${className}`}
    >
      <span className="shrink-0">{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
};
