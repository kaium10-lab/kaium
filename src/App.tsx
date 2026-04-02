import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Menu, 
  X, 
  ChevronDown, 
  Code2, 
  Palette, 
  Globe, 
  Send,
  Lock,
  Database,
  Cpu,
  Layers,
  Smartphone,
  Server,
  Terminal,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Share2,
  MapPin
} from 'lucide-react';

const SocialIcon = ({ name, url, size = 20 }: { name: string, url?: string, size?: number }) => {
  const normalizedName = name.toLowerCase().trim();
  const normalizedUrl = (url || '').toLowerCase();
  
  const isMatch = (platform: string) => 
    normalizedName.includes(platform) || normalizedUrl.includes(platform);

  if (isMatch('facebook') || normalizedName === 'fb') return <Facebook size={size} />;
  if (isMatch('linkedin') || normalizedName === 'li') return <Linkedin size={size} />;
  if (isMatch('github') || normalizedName === 'gh') return <Github size={size} />;
  if (isMatch('instagram') || normalizedName === 'ig' || normalizedName === 'insta') return <Instagram size={size} />;
  if (isMatch('twitter') || normalizedName === 'x') return <Twitter size={size} />;
  if (isMatch('youtube') || normalizedName === 'yt') return <Youtube size={size} />;
  if (isMatch('mail') || normalizedName.includes('email')) return <Mail size={size} />;
  if (isMatch('map') || isMatch('location') || isMatch('address')) return <MapPin size={size} />;
  if (normalizedName.includes('share')) return <Share2 size={size} />;
    
  return <Globe size={size} />;
};

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
import { PortfolioData } from './types';
import { AdminPanel } from './components/AdminPanel';

const INITIAL_DATA: PortfolioData = {
  hero: {
    name: "John Doe",
    title: "Full Stack Developer",
    typingTexts: ["Web Developer", "UI/UX Designer", "Problem Solver"],
    description: "Building digital experiences that matter.",
  },
  about: {
    bio1: "I am a passionate developer with a love for clean code and innovative solutions.",
    bio2: "With years of experience in the industry, I specialize in building scalable web applications.",
    location: "New York, USA",
    experience: "5+ Years",
    image: "https://picsum.photos/seed/dev/800/800"
  },
  skills: [],
  projects: [],
  socials: [],
  contact: {
    email: "hello@example.com",
    linkedin: "#",
    github: "#",
    address: "123 Dev Street, Tech City"
  },
  security: {
    stayLoggedIn: true
  }
};

// --- Components ---

const Navbar = ({ logo }: { logo?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
          {logo ? (
            <img src={logo} alt="Logo" className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
          ) : (
            <>PORTFOLIO<span className="text-emerald-500">.</span></>
          )}
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-zinc-900 border-b border-white/10 py-6 px-6 flex flex-col space-y-4 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

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

const SectionHeading = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-12">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl font-bold mb-4"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-zinc-400 max-w-2xl"
      >
        {subtitle}
      </motion.p>
    )}
    <div className="w-20 h-1 bg-emerald-500 mt-6 rounded-full" />
  </div>
);

// --- Main App ---

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [data, setData] = useState<PortfolioData | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (formStatus !== 'idle' && formStatus !== 'sending') {
      timer = setTimeout(() => setFormStatus('idle'), 5000);
    }
    return () => clearTimeout(timer);
  }, [formStatus]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data?.hero.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.hero.favicon;
    }
  }, [data?.hero.favicon]);

  useEffect(() => {
    if (data?.hero.name) {
      document.title = `${data.hero.name} | ${data.hero.title}`;
    }
  }, [data?.hero.name, data?.hero.title]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) {
        console.warn(`Data fetch returned status: ${res.status}. Using default data.`);
        setData(INITIAL_DATA);
        return;
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Server did not return JSON. Using default data.");
        setData(INITIAL_DATA);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn("Failed to fetch data from server. Using default data.", err);
      setData(INITIAL_DATA);
    }
  };

  const syncBase64Images = async (data: any, token: string | null): Promise<any> => {
    if (!data) return data;
    
    if (typeof data === 'string' && data.startsWith('data:image/')) {
      try {
        const res = await fetch(data);
        const blob = await res.blob();
        const file = new File([blob], `sync-${Date.now()}.png`, { type: blob.type });
        
        const formData = new FormData();
        formData.append('image', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        });
        
        if (uploadRes.ok) {
          const result = await uploadRes.json();
          if (result.success && result.url) return result.url;
        }
      } catch (err) {
        console.error("Failed to sync base64 image:", err);
      }
      return data;
    }
    
    if (Array.isArray(data)) {
      return Promise.all(data.map(item => syncBase64Images(item, token)));
    }
    
    if (typeof data === 'object' && data !== null) {
      const synced: any = {};
      for (const [key, value] of Object.entries(data)) {
        synced[key] = await syncBase64Images(value, token);
      }
      return synced;
    }
    
    return data;
  };

  const handleSaveData = async (newData: PortfolioData): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      // Pre-save sync to convert any remaining base64 images to permanent URLs
      const syncedData = await syncBase64Images(newData, token);
      
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(syncedData)
      });
      
      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');
        return { success: false, message: "Session expired. Please login again." };
      }
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response body snippet:", text.substring(0, 500));
        
        let customMsg = `Server returned non-JSON response (${res.status}).`;
        if (res.status === 413) {
          customMsg = "The data you are trying to save is too large for the server. Please try reducing the number of high-resolution images.";
        } else if (res.status === 504) {
          customMsg = "The server timed out while saving. This can happen with very large datasets or slow connections.";
        }
        
        return { success: false, message: customMsg };
      }
      
      const result = await res.json();
      if (res.ok && result.success) {
        // If it was saved locally only, we should update the local state with the _storage flag
        const updatedData = { 
          ...newData, 
          _storage: result.localOnly ? 'local' : 'supabase' 
        };
        setData(updatedData);
        return { 
          success: true, 
          message: result.warning || (result.localOnly ? "Saved locally (Supabase offline)" : "Saved successfully") 
        };
      }
      return { success: false, message: result.message || 'Failed to save data' };
    } catch (err: any) {
      console.warn("Failed to save data", err);
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch (err) {
      console.warn("Failed to send message", err);
      setFormStatus('error');
    }
  };

  if (!data) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-[60] origin-left" style={{ scaleX }} />

      <Navbar logo={data.hero.logo} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {data.hero.heroImage ? (
            <>
              <img 
                src={data.hero.heroImage} 
                alt="Hero Background" 
                className="w-full h-full object-cover opacity-20"
                referrerPolicy="no-referrer"
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
              {data.hero.title}
            </span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-tight text-white">
              Hi, I'm <span className="text-emerald-500">{data.hero.name}</span>
            </h1>
            <div className="text-2xl md:text-4xl font-medium text-zinc-300 mb-8">
              I'm a <TypingEffect texts={data.hero.typingTexts} />
            </div>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              {data.hero.description}
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

      {/* About Section */}
      <section id="about" className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src={data.about.image} 
                  alt={data.hero.name} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-500 rounded-2xl -z-10" />
            </motion.div>

            <div>
              <SectionHeading 
                title="About Me" 
                subtitle={data.hero.title} 
              />
              <div className="space-y-6 text-zinc-400 leading-relaxed">
                <p>{data.about.bio1}</p>
                <p>{data.about.bio2}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="text-white font-bold mb-2">Education</h4>
                    <p>{data.about.experience}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Location</h4>
                    <p>{data.about.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading 
            title="My Skills" 
            subtitle="A blend of technical proficiency and essential soft skills." 
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.skills.map((category, idx) => (
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
                  {category.skills.map(skill => (
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

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading 
            title="Projects & Experience" 
            subtitle="Practical applications of my learning journey." 
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {data.projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={project.img} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <div className="flex gap-2 mb-4">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    {project.desc}
                  </p>
                  <div className="mt-8">
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

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <SectionHeading 
                title="Contact Me" 
                subtitle="Feel free to reach out for collaborations or just a friendly hello." 
              />
              <div className="space-y-8 mt-12">
                <a href={`mailto:${data.contact.email}`} className="flex items-start gap-6 group">
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Email</h4>
                    <p className="text-zinc-400 group-hover:text-emerald-500 transition-colors">{data.contact.email}</p>
                  </div>
                </a>
                
                {(data.socials || []).map((social) => (
                  <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-6 group">
                    <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                      <SocialIcon name={social.icon} url={social.url} size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{social.name}</h4>
                      <p className="text-zinc-400 group-hover:text-emerald-500 transition-colors">Visit Profile</p>
                    </div>
                  </a>
                ))}

                {data.contact.addressLink ? (
                  <a 
                    href={data.contact.addressLink.startsWith('http') ? data.contact.addressLink : `https://${data.contact.addressLink}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-start gap-6 group"
                  >
                    <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Address</h4>
                      <p className="text-zinc-400 group-hover:text-emerald-500 transition-colors">{data.contact.address}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-start gap-6">
                    <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-emerald-500">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Address</h4>
                      <p className="text-zinc-400">{data.contact.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 md:p-12 rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-6 py-4 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-6 py-4 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Message</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Your Message..."
                    className="w-full px-6 py-4 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-white resize-none"
                  />
                </div>
                <button 
                  disabled={formStatus === 'sending'}
                  type="submit" 
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {formStatus === 'sending' ? (
                    <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  ) : formStatus === 'success' ? (
                    'Message Sent!'
                  ) : formStatus === 'error' ? (
                    'Failed to Send'
                  ) : (
                    <>Send Message <Send size={18} /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <a href="#" className="text-xl font-bold tracking-tighter text-white mb-2 block">
              {data.hero.logo ? (
                <img src={data.hero.logo} alt="Logo" className="h-6 w-auto object-contain inline-block mr-2" referrerPolicy="no-referrer" />
              ) : (
                <>{data.hero.name.toUpperCase()}<span className="text-emerald-500">.</span></>
              )}
            </a>
            <p className="text-zinc-500 text-sm">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          <div className="flex gap-4 items-center flex-wrap justify-center">
            {(data.socials || []).map((social) => (
              <a 
                key={social.id} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-zinc-900 rounded-xl text-zinc-400 hover:text-zinc-950 hover:bg-emerald-500 transition-all"
                title={social.name}
              >
                <SocialIcon name={social.icon} url={social.url} />
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Admin Panel Trigger (Fixed Corner) */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-4 right-4 z-[100] p-1.5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-700 hover:text-emerald-500 rounded-md border border-white/5 transition-all opacity-20 hover:opacity-100"
        title="Admin Panel"
      >
        <Lock size={12} />
      </button>

      {/* Admin Panel Overlay */}
      <AnimatePresence>
        {isAdminOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminPanel 
              data={data} 
              onSave={handleSaveData} 
              onClose={() => setIsAdminOpen(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
