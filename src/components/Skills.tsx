import React from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  Palette, 
  Globe, 
  Database, 
  Cpu, 
  Layers, 
  Smartphone, 
  Server, 
  Terminal 
} from 'lucide-react';
import { PortfolioData } from '../types';
import { SectionHeading } from './Shared';

const SkillIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Code2: <Code2 className="text-emerald-500" />,
    Globe: <Globe className="text-emerald-500" />,
    Palette: <Palette className="text-emerald-500" />,
    Database: <Database className="text-emerald-500" />,
    Cpu: <Cpu className="text-emerald-500" />,
    Layers: <Layers className="text-emerald-500" />,
    Smartphone: <Smartphone className="text-emerald-500" />,
    Server: <Server className="text-emerald-500" />,
    Terminal: <Terminal className="text-emerald-500" />,
  };
  return icons[name] || <Code2 className="text-emerald-500" />;
};

export const Skills = ({ data }: { data: PortfolioData['skills'] }) => {
  return (
    <section id="skills" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading 
          title="My Skills" 
          subtitle="A blend of technical proficiency and essential soft skills." 
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data || []).map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-zinc-900 border border-white/5 hover:border-emerald-500/30 transition-all group"
            >
              <div className="mb-6 p-3 bg-emerald-500/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                <SkillIcon name={category.icon} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{category.title}</h3>
              <div className="flex flex-wrap gap-2">
                {(category?.skills || []).map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white/5 rounded-full text-xs text-zinc-400 border border-white/5">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
