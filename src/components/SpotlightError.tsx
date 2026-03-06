import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function SpotlightError() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative w-full h-screen bg-obsidian overflow-hidden flex flex-col items-center justify-center text-center cursor-none">
            {/* Dark Base Layer */}
            <div className="absolute inset-0 bg-obsidian z-0"></div>

            {/* Revealed Image Layer (Masked by Spotlight) */}
            <motion.div
                className="absolute inset-0 z-10 bg-[url('https://images.unsplash.com/photo-1504450758481-7338ba680586?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale-0"
                animate={{
                    maskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 80%)`,
                    WebkitMaskImage: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 80%)`
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
            />

            {/* Overlay for Text Legibility */}
            <div className="absolute inset-0 z-20 bg-black/60 pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-30 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="font-display text-[12rem] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 opacity-10 select-none">
                        404
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative -mt-12"
                >
                    <div className="inline-block relative">
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 relative drop-shadow-xl">
                            Lights Out!
                        </h2>
                    </div>

                    <p className="text-gray-300 text-lg md:text-xl max-w-md mx-auto mb-10 drop-shadow-md">
                        This view is currently in the dark. Use your light to explore or head back to the main luminous structures.
                    </p>

                    <a
                        href="/"
                        className="inline-flex items-center gap-2 bg-lux-gold text-obsidian px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(252,211,77,0.3)] hover:shadow-[0_0_50px_rgba(252,211,77,0.5)] cursor-pointer pointer-events-auto relative z-50"
                    >
                        <Home className="w-5 h-5" />
                        Back to Light
                    </a>
                </motion.div>
            </div>

            {/* Custom Cursor Ring */}
            <motion.div
                className="fixed top-0 left-0 w-12 h-12 rounded-full border border-lux-gold/60 pointer-events-none z-50 mix-blend-difference"
                animate={{
                    x: mousePosition.x - 24,
                    y: mousePosition.y - 24
                }}
                transition={{ type: "tween", ease: "linear", duration: 0 }}
            />
        </div>
    );
}
