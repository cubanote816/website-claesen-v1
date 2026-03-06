import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import ProjectGalleryModal from './ProjectGalleryModal';
import { portfolioService } from '../services/portfolio';
import type { Project } from '../types/portfolio';

export default function ProjectGrid() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');

    // Modal State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const categories = [
        { id: 'all', label: 'All Projects' },
        { id: 'sport', label: 'Sport' },
        { id: 'industrial', label: 'Industrial' },
        { id: 'public', label: 'Public Spaces' },
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
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`
                            relative px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border
                            ${activeCategory === category.id
                                ? 'bg-lux-gold text-obsidian border-lux-gold shadow-[0_0_20px_rgba(252,211,77,0.2)]'
                                : 'bg-white/5 text-cool-slate border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'}
                        `}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="w-12 h-12 border-2 border-lux-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project, index) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                index={index}
                                onClick={handleProjectClick}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {!loading && filteredProjects.length === 0 && (
                <div className="text-center py-32 border border-white/5 rounded-3xl bg-white/5">
                    <p className="text-cool-slate mb-6 font-medium text-lg">No projects found in this category.</p>
                    <button
                        onClick={() => setActiveCategory('all')}
                        className="px-8 py-3 bg-transparent border border-white/10 hover:border-lux-gold text-cool-slate hover:text-lux-gold rounded-full font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        Show All Projects
                    </button>
                </div>
            )}

            {/* Modal */}
            <ProjectGalleryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                project={selectedProject}
            />
        </div>
    );
}
