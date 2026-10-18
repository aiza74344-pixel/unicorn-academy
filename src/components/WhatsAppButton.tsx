import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/LanguageProvider';
import { getSiteSettings } from '../services';

export const WhatsAppButton: React.FC = () => {
  const { t } = useI18n();
  const [whatsappNumber, setWhatsappNumber] = useState('923000000000');

  useEffect(() => {
    let isMounted = true;
    getSiteSettings().then((settings) => {
      if (isMounted && settings?.whatsapp) {
        setWhatsappNumber(settings.whatsapp);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside aria-label="Direct messaging">
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('common.whatsappUs')}
        title={t('common.whatsappUs')}
        className="fixed bottom-6 end-6 z-40 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 cursor-pointer"
      >
        <svg
          className="w-8 h-8 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
        </svg>
      </a>
    </aside>
  );
};
