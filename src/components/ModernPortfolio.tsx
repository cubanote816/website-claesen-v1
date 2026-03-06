import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernProjectCard from './ModernProjectCard';
import ProjectGalleryModal from './ProjectGalleryModal';
import { portfolioService } from '../services/portfolio';
import type { Project } from '../types/portfolio';
import { ui, defaultLang } from '../i18n/ui';

interface ModernPortfolioProps {
    lang?: keyof typeof ui;
}

export default function ModernPortfolio({ lang = defaultLang }: ModernPortfolioProps) {
    const t = ui[lang as keyof typeof ui] || ui[defaultLang];

    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');

    // Modal State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = [
        { id: 'all', label: t['portfolio.cat.all'] },
        { id: 'sport', label: t['portfolio.cat.sport'] },
        { id: 'industrial', label: t['portfolio.cat.industrial'] },
        { id: 'public', label: t['portfolio.cat.public'] },
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await portfolioService.getProjects({ published: true });
                setProjects(response.projects);
                setFilteredProjects(response.projects);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        if (activeCategory === 'all') {
            setFilteredProjects(projects);
        } else {
            setFilteredProjects(projects.filter(p => {
                const cat = typeof p.category === 'string' ? p.category : '';
                return cat === activeCategory;
            }));
        }
    }, [activeCategory, projects]);

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`
                            relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-md
                            ${activeCategory === category.id
                                ? 'bg-lux-gold text-obsidian border-lux-gold shadow-lg shadow-lux-gold/20'
                                : 'bg-white/5 text-cool-slate border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20'}
                        `}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Uniform Grid */}
            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="w-12 h-12 border-2 border-lux-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project, index) => (
                            <div key={project.id} className="w-full">
                                <ModernProjectCard
                                    project={project}
                                    index={index}
                                    onClick={handleProjectClick}
                                />
                            </div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {!loading && filteredProjects.length === 0 && (
                <div className="text-center py-32 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-md">
                    <p className="text-cool-slate mb-6 font-medium text-lg">{t['portfolio.empty.text']}</p>
                    <button
                        onClick={() => setActiveCategory('all')}
                        className="px-8 py-3 bg-transparent border border-white/10 hover:border-lux-gold text-cool-slate hover:text-lux-gold rounded-full font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        {t['portfolio.empty.btn']}
                    </button>
                </div>
            )}

            {/* Modal */}
            <ProjectGalleryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={selectedProject}
                lang={lang}
            />
        </div>
    );
}
