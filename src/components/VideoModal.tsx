import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface VideoModalProps {
    videoUrl: string;
}

export default function VideoModal({ videoUrl }: VideoModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Listen to custom event dispatched by the 'Watch Showreel' button
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-showreel', handleOpen);

        return () => {
            window.removeEventListener('open-showreel', handleOpen);
        };
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    // Handle body scroll locking
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
                onClick={() => setIsOpen(false)}
            >
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-lux-gold hover:text-obsidian transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Video Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="relative w-full max-w-6xl aspect-video bg-obsidian rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
