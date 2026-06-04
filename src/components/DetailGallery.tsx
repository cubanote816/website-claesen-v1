import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
    url: string;
    thumb: string;
    alt: string;
}

interface Props {
    gallery: GalleryItem[];
    title: string;
}

export default function DetailGallery({ gallery, title }: Props) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const isOpen = activeIndex !== null;

    const showPrev = useCallback(() => {
        setActiveIndex(i => (i === null || i === 0 ? gallery.length - 1 : i - 1));
    }, [gallery.length]);

    const showNext = useCallback(() => {
        setActiveIndex(i => (i === null || i === gallery.length - 1 ? 0 : i + 1));
    }, [gallery.length]);

    const close = useCallback(() => setActiveIndex(null), []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, showPrev, showNext, close]);

    const current = activeIndex !== null ? gallery[activeIndex] : null;

    return (
        <>
            {/* Thumbnail grid — masonry */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                {gallery.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className="group block w-full overflow-hidden rounded-xl border border-white/10 hover:border-lux-gold/40 transition-colors break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold"
                        aria-label={img.alt || `${title} — foto ${i + 1}`}
                    >
                        <img
                            src={img.thumb || img.url}
                            alt={img.alt || title}
                            loading={i < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
                        />
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {isOpen && current && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center"
                        onClick={close}
                    >
                        {/* Close */}
                        <button
                            onClick={close}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Sluiten"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Counter */}
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-mono text-white/70 border border-white/10">
                            {(activeIndex ?? 0) + 1} / {gallery.length}
                        </div>

                        {/* Image */}
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-5xl max-h-[85vh] w-full px-16"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={current.url}
                                alt={current.alt || title}
                                className="w-full h-full max-h-[85vh] object-contain rounded-lg"
                            />
                        </motion.div>

                        {/* Prev / Next */}
                        {gallery.length > 1 && (
                            <>
                                <button
                                    onClick={e => { e.stopPropagation(); showPrev(); }}
                                    className="absolute left-4 p-3 bg-black/50 hover:bg-lux-gold/20 text-white rounded-xl transition-colors"
                                    aria-label="Vorige"
                                >
                                    <ChevronLeft className="w-7 h-7" />
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); showNext(); }}
                                    className="absolute right-4 p-3 bg-black/50 hover:bg-lux-gold/20 text-white rounded-xl transition-colors"
                                    aria-label="Volgende"
                                >
                                    <ChevronRight className="w-7 h-7" />
                                </button>
                            </>
                        )}

                        {/* Thumbnail strip */}
                        {gallery.length > 1 && (
                            <div
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 max-w-[90vw] overflow-x-auto"
                                onClick={e => e.stopPropagation()}
                            >
                                {gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveIndex(idx)}
                                        className={`relative w-12 h-9 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                                            idx === activeIndex
                                                ? 'border-lux-gold opacity-100'
                                                : 'border-transparent opacity-50 hover:opacity-80'
                                        }`}
                                        aria-label={`Foto ${idx + 1}`}
                                    >
                                        <img
                                            src={img.thumb || img.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
