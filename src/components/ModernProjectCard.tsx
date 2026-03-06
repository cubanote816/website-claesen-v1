import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Project } from '../types/portfolio';
import { portfolioService } from '../services/portfolio';

interface ModernProjectCardProps {
    project: Project;
    onClick: (project: Project) => void;
    index: number;
}

export default function ModernProjectCard({ project, onClick, index }: ModernProjectCardProps) {
    const getLocalized = (content: any) => portfolioService.getLocalizedValue(content);
    const categoryLabel = typeof project.category === 'string' ? project.category : 'Project';
    const placeholderImg = `${import.meta.env.BASE_URL || ''}/placeholder-project.jpg`.replace(/\/\//g, '/');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="group relative w-full mb-6 break-inside-avoid rounded-3xl overflow-hidden cursor-pointer"
            onClick={() => onClick(project)}
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url(${project.featured_image_url || placeholderImg})` }}
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-obsidian/20 group-hover:bg-transparent transition-colors duration-500" />

                {/* Border Glow */}
                <div className="absolute inset-0 border border-white/10 rounded-3xl transition-colors duration-300 group-hover:border-lux-gold/50" />

                {/* Content Container */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">

                    {/* Top Right Arrow */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                        <ArrowUpRight className="w-4 h-4 text-lux-gold" />
                    </div>

                    {/* Text Content */}
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <div className="flex items-center gap-3 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-lux-gold">
                                {categoryLabel}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/40"></span>
                            <span className="text-[10px] font-mono tracking-wider text-cool-slate">
                                {project.year}
                            </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold font-display text-white mb-1 leading-tight">
                            {getLocalized(project.title)}
                        </h3>

                        {getLocalized(project.location) && (
                            <div className="flex items-center gap-2 text-cool-slate text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                                <MapPin className="w-3 h-3 text-lux-gold" />
                                <p className="line-clamp-1 font-medium">
                                    {getLocalized(project.location)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
