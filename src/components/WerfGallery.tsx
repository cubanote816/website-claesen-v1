import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface WerfImage {
    url: string;
    label: string;
}

interface Props {
    images: WerfImage[];
    title: string;
}

export default function WerfGallery({ images, title }: Props) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [autoplayPaused, setAutoplayPaused] = useState(false);

    const isOpen = activeIndex !== null;

    const showPrev = useCallback(() => {
        setActiveIndex(i => (i === null || i === 0 ? images.length - 1 : i - 1));
    }, [images.length]);

    const showNext = useCallback(() => {
        setActiveIndex(i => (i === null || i === images.length - 1 ? 0 : i + 1));
    }, [images.length]);

    const close = useCallback(() => setActiveIndex(null), []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
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


    useEffect(() => {
        if (!isOpen || autoplayPaused || images.length <= 1) return;
        const id = setInterval(showNext, 4000);
        return () => clearInterval(id);
    }, [isOpen, activeIndex, autoplayPaused, showNext, images.length]);
    const current = activeIndex !== null ? images[activeIndex] : null;

    return (
        <>
            {/* Werf photo grid: desktop 3 cols — big (col1 rows1-2) + 4 small; mobile 2 cols */}
            <div className="grid grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] auto-rows-[180px] lg:auto-rows-[210px] gap-3 lg:gap-4">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={[
                            'relative overflow-hidden rounded-lg border border-white/8 bg-[#181b21] isolate',
                            'cursor-pointer group',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold',
                            i === 0 ? 'col-span-2 row-span-2 lg:col-span-1' : '',
                        ].filter(Boolean).join(' ')}
                        aria-label={img.label || `${title} — foto ${i + 1}`}
                    >
                        <img
                            src={img.url}
                            alt={img.label}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-[1]"
                            aria-hidden="true"
                        />
                        <span className="absolute bottom-3.5 left-4 z-[2] text-[11px] font-extrabold uppercase tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                            {img.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Lightbox — identical behaviour to DetailGallery */}
            <AnimatePresence>
                {isOpen && current && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center"
                        onClick={close}
                        onMouseEnter={() => setAutoplayPaused(true)}
                        onMouseLeave={() => setAutoplayPaused(false)}
                    >
                        <button
                            onClick={close}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Sluiten"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-mono text-white/70 border border-white/10">
                            {(activeIndex ?? 0) + 1} / {images.length}
                        </div>

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
                                alt={current.label || title}
                                className="w-full h-full max-h-[85vh] object-contain rounded-lg"
                            />
                            {current.label && (
                                <p className="text-center text-white/60 text-[13px] mt-3">{current.label}</p>
                            )}
                        </motion.div>

                        {images.length > 1 && (
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

                        {images.length > 1 && (
                            <div
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 max-w-[90vw] overflow-x-auto"
                                onClick={e => e.stopPropagation()}
                            >
                                {images.map((img, idx) => (
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
                                            src={img.url}
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
