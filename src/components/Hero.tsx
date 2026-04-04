import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { PortfolioData } from '../types';

const TypingEffect = ({ texts }: { texts: string[] }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) return;
    
    const handleTyping = () => {
      const fullText = texts[currentTextIndex];
      
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (!isDeleting) {
        const nextText = fullText.substring(0, currentText.length + 1);
        setCurrentText(nextText);
        
        if (nextText === fullText) {
          setIsPaused(true);
        }
      } else {
        const nextText = fullText.substring(0, currentText.length - 1);
        setCurrentText(nextText);
        
        if (nextText === '') {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    };

    const speed = isPaused ? 2000 : isDeleting ? 100 : 150;
    const timer = setTimeout(handleTyping, speed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, isPaused, currentTextIndex, texts]);

  return <span className="text-emerald-500 typing-cursor">{currentText}</span>;
};

export const Hero = ({ data }: { data: PortfolioData['hero'] }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {data.heroImage ? (
          <>
            <img 
              src={data.heroImage} 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-20"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement?.remove(); // Remove background if broken
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950 to-zinc-950" />
          </>
        ) : (
          <>
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold tracking-widest uppercase mb-6">
            {data.title}
          </span>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-tight text-white">
            Hi, I'm <span className="text-emerald-500">{data.name}</span>
          </h1>
          <div className="text-2xl md:text-4xl font-medium text-zinc-300 mb-8">
            I'm a <TypingEffect texts={data.typingTexts} />
          </div>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            {data.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#contact" 
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Contact Me
            </a>
            <a 
              href="#projects" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
            >
              My Work
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="animate-bounce text-zinc-500" size={32} />
        </motion.div>
      </div>
    </section>
  );
};
