import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Users, Camera } from 'lucide-react';
import { portfolioService } from '../services/portfolio';
import type { Project } from '../types/portfolio';
import { ui, defaultLang } from '../i18n/ui';

interface ProjectGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    lang?: string;
}

export default function ProjectGalleryModal({ isOpen, onClose, project, lang = defaultLang }: ProjectGalleryModalProps) {
    const t = ui[lang as keyof typeof ui] || ui[defaultLang];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollPositionRef = useRef<number>(0);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            scrollPositionRef.current = window.scrollY;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Reset index on project change
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [project]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, project, currentImageIndex]);

    if (!project) return null;

    const images = project.gallery_images || [];
    const currentImage = images[currentImageIndex];

    const showPrev = () => {
        setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const showNext = () => {
        setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const getLocalized = (content: any) => portfolioService.getLocalizedValue(content, lang);
    const placeholderImg = `${import.meta.env.BASE_URL || ''}/placeholder-project.jpg`.replace(/\/\//g, '/');

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-8"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full max-w-7xl bg-gunmetal/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close Button Mobile */}
                        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full md:hidden">
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Image Section */}
                        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImage?.url}
                                    src={currentImage?.url || placeholderImg}
                                    alt={currentImage?.alt || getLocalized(project.title)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button onClick={showPrev} className="absolute left-4 p-3 bg-black/50 hover:bg-lux-gold/20 text-white rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>
                                    <button onClick={showNext} className="absolute right-4 p-3 bg-black/50 hover:bg-lux-gold/20 text-white rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                                        <ChevronRight className="w-8 h-8" />
                                    </button>
                                </>
                            )}

                            {/* Counter */}
                            {images.length > 1 && (
                                <div className="absolute top-6 left-6 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-mono text-white/70 border border-white/10">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* Info Panel */}
                        <div className="w-full md:w-[400px] bg-obsidian border-l border-white/5 flex flex-col">

                            {/* Header */}
                            <div className="p-8 border-b border-white/5 relative">
                                <button onClick={onClose} className="absolute top-6 right-6 hidden md:block hover:text-lux-gold transition-colors">
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-xl mb-6 text-lux-gold">
                                    <Camera className="w-6 h-6" />
                                </div>

                                <h2 className="text-2xl font-display font-bold mb-2 text-white">
                                    {getLocalized(project.title)}
                                </h2>
                                <div className="w-12 h-1 bg-lux-gold rounded-full mb-6"></div>

                                <div className="space-y-3 text-sm text-cool-slate">
                                    {getLocalized(project.location) && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-lux-gold" />
                                            <span>{getLocalized(project.location)}</span>
                                        </div>
                                    )}
                                    {project.year && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-lux-gold" />
                                            <span>{project.year}</span>
                                        </div>
                                    )}
                                    {getLocalized(project.client) && (
                                        <div className="flex items-center gap-3">
                                            <Users className="w-4 h-4 text-lux-gold" />
                                            <span>{getLocalized(project.client)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex-1 p-8 overflow-y-auto">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">{t['portfolio.modal.about']}</h3>
                                <div
                                    className="prose prose-invert prose-sm text-cool-slate"
                                    dangerouslySetInnerHTML={{ __html: getLocalized(project.description) }}
                                />
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="p-4 border-t border-white/5 bg-gunmetal/30">
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {images.map((img, idx) => (
                                            <button
                                                key={img.id || idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-lux-gold opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                                                    }`}
                                            >
                                                <img
                                                    src={img.thumb}
                                                    onError={(e) => {
                                                        const target = e.currentTarget as HTMLImageElement;
                                                        if (target.src !== img.url) {
                                                            target.src = img.url;
                                                        }
                                                    }}
                                                    alt={img.alt || ''}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
