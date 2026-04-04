import React from 'react';
import { motion } from 'motion/react';
import { Github } from 'lucide-react';
import { PortfolioData } from '../types';
import { SectionHeading } from './Shared';

export const Projects = ({ data }: { data: PortfolioData['projects'] }) => {
  return (
    <section id="projects" className="py-24 bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading 
          title="Projects & Experience" 
          subtitle="Practical applications of my learning journey." 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(data || []).map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={project.img} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 font-sans"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3">
                  {project.desc || "A project built with passion and code."}
                </p>
                <div className="mt-auto">
                  {project.githubUrl ? (
                    <a 
                      href={project.githubUrl.startsWith('http') ? project.githubUrl : `https://${project.githubUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github size={18} />
                      <span>View Source Code</span>
                    </a>
                  ) : (
                    <div className="text-[10px] text-zinc-600 border border-white/5 rounded-lg px-3 py-2 text-center">
                      GitHub link not set in Admin Panel
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
