import React from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';
import { PortfolioData } from '../types';
import { SectionHeading } from './Shared';

export const About = ({ data, heroName }: { data: PortfolioData['about'], heroName: string }) => {
  return (
    <section id="about" className="py-24 bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
              {data.image ? (
                <img 
                  src={data.image} 
                  alt={heroName || "Profile"} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(heroName || "Admin") + '&background=10b981&color=fff&size=512';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-800">
                  <User size={64} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-500 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-emerald-500/20 rounded-2xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SectionHeading 
              title="About Me" 
              subtitle="Python Enthusiast and Cyber Security Learner." 
            />
            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>{data.bio1 || "Python Enthusiast and Cyber Security Learner."}</p>
              <p>{data.bio2 || "Focused on building secure and efficient web applications."}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div>
                  <h4 className="text-white font-bold mb-2">Education</h4>
                  <p className="text-zinc-500 text-sm">{data.experience || "Daffodil Polytechnic Institute"}</p>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2">Location</h4>
                  <p className="text-zinc-500 text-sm">{data.location || "Dhaka, Bangladesh"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
