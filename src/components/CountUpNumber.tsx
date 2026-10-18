import React, { useEffect, useState, useRef } from 'react';
import { useI18n } from '../i18n/LanguageProvider';

interface CountUpNumberProps {
  target: number;
  suffix?: string;
  duration?: number;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  target,
  suffix = '',
  duration = 1000,
}) => {
  const { lang } = useI18n();
  const [count, setCount] = useState<number>(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setCount(target);
      hasAnimated.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic formula
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(easeOut * target);

            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [target, duration]);

  // Format with Intl
  const locale = lang === 'ur' ? 'ur-PK' : 'en-PK';
  let formattedNumber = '';
  try {
    formattedNumber = new Intl.NumberFormat(locale).format(count);
  } catch (e) {
    formattedNumber = count.toString();
  }

  return (
    <span ref={elementRef} className="tabular-nums">
      {formattedNumber}
      {suffix}
    </span>
  );
};
