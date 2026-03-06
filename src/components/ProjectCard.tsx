import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Project } from '../types/portfolio';
import { portfolioService } from '../services/portfolio';

interface ProjectCardProps {
    project: Project;
    onClick: (project: Project) => void;
    index: number;
}

export default function ProjectCard({ project, onClick, index }: ProjectCardProps) {
    const getLocalized = (content: any) => portfolioService.getLocalizedValue(content);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'sport': return 'text-lux-gold';
            case 'industrial': return 'text-blue-400';
            case 'public': return 'text-green-400';
            default: return 'text-white';
        }
    };

    const categoryLabel = typeof project.category === 'string' ? project.category : 'Project';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-3xl bg-gunmetal border border-white/5 aspect-[4/3] cursor-pointer shadow-lg hover:shadow-lux-gold/10 hover:border-lux-gold/30 transition-all duration-500"
            onClick={() => onClick(project)}
        >
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                style={{ backgroundImage: `url(${project.featured_image_url || '/placeholder-project.jpg'})` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent opacity-90" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start z-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-mono tracking-wider uppercase ${getCategoryColor(categoryLabel)}`}>
                        {categoryLabel}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="text-xs font-mono tracking-wider text-cool-slate uppercase">
                        {project.year}
                    </span>
                </div>

                <h3 className="text-2xl font-bold font-display text-white mb-2 group-hover:text-lux-gold transition-colors">
                    {getLocalized(project.title)}
                </h3>

                <div className="flex items-center gap-2 text-cool-slate text-sm">
                    <MapPin className="w-3 h-3" />
                    <p className="line-clamp-1">
                        {getLocalized(project.location)}
                    </p>
                </div>

                {/* Action Icon */}
                <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md p-3 rounded-full text-white opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 border border-white/10 group-hover:bg-lux-gold group-hover:text-obsidian group-hover:border-lux-gold">
                    <ArrowUpRight className="w-5 h-5" />
                </div>
            </div>
        </motion.div>
    );
}
