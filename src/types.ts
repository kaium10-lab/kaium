export interface Project {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  img: string;
  githubUrl?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  skills: string[];
}

export interface SocialAccount {
  id: string;
  name: string;
  url: string;
  icon: string; // lucide icon name
}

export interface PortfolioData {
  hero: {
    name: string;
    title: string;
    typingTexts: string[];
    description: string;
    logo?: string;
    heroImage?: string;
    favicon?: string;
  };
  about: {
    bio1: string;
    bio2: string;
    location: string;
    experience: string;
    image: string;
  };
  skills: SkillCategory[];
  projects: Project[];
  socials: SocialAccount[];
  contact: {
    email: string;
    linkedin: string;
    github: string;
    address: string;
    addressLink?: string;
    phone?: string;
  };
  security: {
    stayLoggedIn: boolean;
  };
  _storage?: 'supabase' | 'local' | 'default';
}
