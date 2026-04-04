import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Cpu } from 'lucide-react';
import { PortfolioData } from './types';
import { AdminPanel } from './components/AdminPanel';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';

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
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (!data) setIsOffline(true);
    }, 10000); // 10s timeout
    return () => clearTimeout(timeout);
  }, [data]);

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
      const jsonData = await res.json();
      
      const mergedData: PortfolioData = {
        ...INITIAL_DATA,
        ...jsonData,
        hero: { ...INITIAL_DATA.hero, ...(jsonData?.hero || {}) },
        about: { ...INITIAL_DATA.about, ...(jsonData?.about || {}) },
        socials: Array.isArray(jsonData?.socials) ? jsonData.socials : INITIAL_DATA.socials,
        skills: Array.isArray(jsonData?.skills) ? jsonData.skills : (jsonData?.skills ? Object.values(jsonData.skills) : INITIAL_DATA.skills),
        projects: Array.isArray(jsonData?.projects) ? jsonData.projects : (jsonData?.projects ? Object.values(jsonData.projects) : INITIAL_DATA.projects),
      };
      
      setData(mergedData);
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
        let customMsg = `Server returned non-JSON response (${res.status}).`;
        if (res.status === 413) customMsg = "Data too large for server.";
        return { success: false, message: customMsg };
      }
      
      const result = await res.json();
      if (res.ok && result.success) {
        const updatedData = { ...newData, _storage: result.localOnly ? 'local' : 'supabase' };
        setData(updatedData);
        return { success: true, message: result.warning || "Saved successfully" };
      }
      return { success: false, message: result.message || 'Failed to save data' };
    } catch (err: any) {
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
      setFormStatus('error');
    }
  };

  if (isOffline && !data) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <Cpu className="text-red-500 animate-pulse" size={32} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Backend Server Offline</h1>
      <p className="text-zinc-400 max-w-sm mb-8">
        Your portfolio cannot connect to the database because the server is not running.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="w-full max-w-xs py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-600 transition-all"
      >
        Check Again
      </button>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <p className="text-zinc-500 text-sm animate-pulse">Connecting to Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-[60] origin-left" style={{ scaleX }} />

      <Navbar logo={data.hero.logo} />
      
      <Hero data={data.hero} />
      
      <About data={data.about} heroName={data.hero.name} />
      
      <Skills data={data.skills} />
      
      <Projects data={data.projects} />
      
      <Contact 
        data={data.contact} 
        socials={data.socials}
        formData={formData}
        setFormData={setFormData}
        formStatus={formStatus}
        handleSubmit={handleSubmit}
      />

      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        data={data} 
        onSave={handleSaveData} 
      />
      
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-zinc-500 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95 group z-[100]"
        title="Admin Panel"
      >
        <Cpu size={24} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
