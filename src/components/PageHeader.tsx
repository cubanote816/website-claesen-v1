import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
    return (
        <div className="text-center mb-20 relative pointer-events-none">
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lux-gold/5 blur-[100px] rounded-full opacity-50 pointer-events-none" />

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-4xl md:text-6xl font-bold mb-6 relative z-10"
            >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
                    {title}
                </span>
            </motion.h1>

            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-cool-slate text-lg max-w-2xl mx-auto relative z-10"
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}
