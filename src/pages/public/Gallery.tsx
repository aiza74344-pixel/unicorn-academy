import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useI18n } from '../../i18n/LanguageProvider';
import { usePageMeta } from '../../hooks/usePageMeta';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import { getGalleryItems } from '../../services';
import { GalleryItem, GalleryCategory } from '../../types';

export default function Gallery() {
  const { lang, dir, t } = useI18n();

  // Dynamic SEO title & description
  usePageMeta({
    title: t('gallery.seoTitle'),
    description: t('gallery.seoDescription'),
  });

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox modal state
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGalleryItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const categories: { key: GalleryCategory | 'all'; label: string }[] = [
    { key: 'all', label: t('gallery.catAll') },
    { key: 'classroom', label: t('gallery.catClassroom') },
    { key: 'events', label: t('gallery.catEvents') },
    { key: 'results', label: t('gallery.catResults') },
  ];

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter((i) => i.category === selectedCategory);
  }, [items, selectedCategory]);

  const openLightbox = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    lastTriggerRef.current = e.currentTarget;
    setActiveLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
    lastTriggerRef.current?.focus();
  }, []);

  const nextPhoto = useCallback(() => {
    if (activeLightboxIndex === null || filteredItems.length === 0) return;
    setActiveLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
  }, [activeLightboxIndex, filteredItems.length]);

  const prevPhoto = useCallback(() => {
    if (activeLightboxIndex === null || filteredItems.length === 0) return;
    setActiveLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  }, [activeLightboxIndex, filteredItems.length]);

  // Handle keyboard navigation inside Lightbox (Esc, Left/Right arrow keys with RTL support)
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        // In RTL, right arrow moves to previous; in LTR, moves to next
        dir === 'rtl' ? prevPhoto() : nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        // In RTL, left arrow moves to next; in LTR, moves to previous
        dir === 'rtl' ? nextPhoto() : prevPhoto();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, closeLightbox, nextPhoto, prevPhoto, dir]);

  if (error && !loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto p-8 border-rose-200 bg-rose-50/50">
          <p className="text-rose-800 font-medium mb-4">{error}</p>
          <Button variant="primary" onClick={loadGallery}>
            {t('common.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  const activeItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  return (
    <div className="py-10 md:py-16 space-y-12 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Header */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#312E81]/8 text-[#312E81] text-xs sm:text-sm font-semibold tracking-wide">
          {t('brand.name')}
        </div>
        <h1 className="h1-title text-[#312E81] tracking-tight">
          {t('gallery.title')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {t('gallery.subtitle')}
        </p>
      </header>

      {/* Category Filter Buttons */}
      <div className="flex justify-center">
        <div
          role="group"
          aria-label={t('gallery.title')}
          className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-2xs gap-1 flex-wrap justify-center"
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] ${
                selectedCategory === cat.key
                  ? 'bg-[#312E81] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[4/3] rounded-xl w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto p-8 border-slate-200">
            <p className="text-slate-600">{t('gallery.emptyCategory')}</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => {
            const caption = lang === 'ur' ? item.caption_ur : item.caption_en;

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => openLightbox(idx, e)}
                className="group block text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] rounded-2xl overflow-hidden cursor-pointer"
              >
                <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-[#312E81]/15 via-[#7C3AED]/15 to-[#F59E0B]/15 border border-slate-200 flex flex-col justify-between p-4 relative group-hover:scale-[1.02] transition-transform duration-200 shadow-2xs group-hover:shadow-md">
                  {/* Category Pill */}
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-white/90 text-[#312E81] backdrop-blur-xs border border-white/60">
                      {item.category}
                    </span>
                    <span className="w-7 h-7 rounded-full bg-white/90 text-[#312E81] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </span>
                  </div>

                  {/* Visual Artwork Center */}
                  <div className="flex items-center justify-center my-auto text-[#312E81]/40 group-hover:text-[#312E81] transition-colors">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  {/* Caption Strip */}
                  <p className="text-xs font-medium text-slate-800 line-clamp-2 bg-white/85 p-2 rounded-lg backdrop-blur-xs">
                    {caption}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal Lightbox */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ur' ? activeItem.caption_ur : activeItem.caption_en}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            {/* Lightbox Header with Navigation and Close */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-xs uppercase font-semibold text-[#7C3AED] bg-[#7C3AED]/10 px-3 py-1 rounded-full">
                {activeItem.category} • {(activeLightboxIndex! + 1)} / {filteredItems.length}
              </span>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={prevPhoto}
                  aria-label={t('gallery.lightboxPrev')}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] cursor-pointer"
                >
                  <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={nextPhoto}
                  aria-label={t('gallery.lightboxNext')}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] cursor-pointer"
                >
                  <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label={t('gallery.lightboxClose')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81] cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lightbox Visual Area */}
            <div className="w-full aspect-[16/10] bg-gradient-to-br from-[#312E81]/15 via-[#7C3AED]/20 to-[#F59E0B]/20 flex flex-col items-center justify-center p-8 sm:p-12 relative">
              <div className="w-20 h-20 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-[#312E81] mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800 font-heading">
                Unicorn Academy Sadiqabad
              </p>
            </div>

            {/* Lightbox Caption */}
            <div className="p-6 bg-slate-50 text-start border-t border-slate-100">
              <p className="text-base text-slate-900 font-medium leading-relaxed">
                {lang === 'ur' ? activeItem.caption_ur : activeItem.caption_en}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Use Left / Right arrow keys to browse, Esc to close.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
