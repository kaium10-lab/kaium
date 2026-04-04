import React, { useState, useEffect } from 'react';
import { PortfolioData, Project, SkillCategory, SocialAccount } from '../types';
import { 
  Save, 
  Plus, 
  Trash2, 
  X, 
  Shield, 
  Key, 
  LogOut, 
  User, 
  Briefcase, 
  Wrench, 
  Mail, 
  Home,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  Share2,
  MapPin
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  data: PortfolioData;
  onSave: (newData: PortfolioData) => Promise<{ success: boolean; message?: string }>;
  onClose: () => void;
}

type Tab = 'hero' | 'about' | 'skills' | 'projects' | 'socials' | 'contact' | 'messages' | 'security';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, data, onSave, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [editData, setEditData] = useState<PortfolioData>(data);
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [credStatus, setCredStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [credError, setCredError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [cloudInfo, setCloudInfo] = useState<{ status: string, error?: string, configured: boolean } | null>(null);

  useEffect(() => {
    const checkCloud = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const diagnostics = await res.json();
          setCloudInfo({
            status: diagnostics.supabaseStatus,
            error: diagnostics.supabaseError,
            configured: diagnostics.supabaseConfigured
          });
        }
      } catch (err) {
        setCloudInfo({ status: 'Local Mode', configured: false });
      }
    };
    
    checkCloud();
    const interval = setInterval(checkCloud, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const token = data.security?.stayLoggedIn 
      ? localStorage.getItem('admin_token') 
      : sessionStorage.getItem('admin_token');
    
    if (token) {
      setIsAuthenticated(true);
    }

    // Check for existing login block
    const savedBlock = localStorage.getItem('login_blocked_until');
    if (savedBlock) {
      const until = parseInt(savedBlock, 10);
      if (until > Date.now()) {
        setBlockedUntil(until);
      } else {
        localStorage.removeItem('login_blocked_until');
      }
    }
  }, [data.security?.stayLoggedIn]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (blockedUntil && blockedUntil > Date.now()) {
      timer = setInterval(() => {
        if (Date.now() >= blockedUntil) {
          setBlockedUntil(null);
          localStorage.removeItem('login_blocked_until');
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [blockedUntil]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [activeTab]);

  // CRITICAL: Synchronize editData whenever the source data changes from the parent/database
  useEffect(() => {
    if (data) {
      setEditData(data);
    }
  }, [data]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/messages', {
        headers: getAuthHeader()
      });
      
      if (res.status === 401) {
        handleLogout();
        return;
      }
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Server returned non-JSON response for messages");
        return;
      }
      
      const result = await res.json();
      if (Array.isArray(result)) {
        setMessages(result);
      }
    } catch (err) {
      console.warn("Failed to fetch messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (res.status === 401) {
        handleLogout();
        return;
      }
      
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
        setNotification({ message: 'Message deleted successfully', type: 'success' });
      } else {
        const result = await res.json();
        setNotification({ message: 'Failed to delete message: ' + (result.message || 'Unknown error'), type: 'error' });
      }
    } catch (err) {
      console.warn("Failed to delete message", err);
      setNotification({ message: 'Network error while deleting message', type: 'error' });
    }
  };

  const handleSaveAll = async () => {
    setSaveStatus('saving');
    setSaveError('');
    const result = await onSave(editData);
    if (result.success) {
      setSaveStatus('success');
      if (result.message) {
        // If message suggests local only, use a warning type
        const isWarning = result.message.toLowerCase().includes('local') || result.message.toLowerCase().includes('supabase error');
        setNotification({ 
          message: result.message, 
          type: isWarning ? 'error' : 'success' 
        });
      }
      setTimeout(() => {
        setSaveStatus('idle');
        onClose();
      }, 3000);
    } else {
      const errorMsg = result.message || 'Failed to save data';
      setSaveStatus('error');
      setSaveError(errorMsg);
      setNotification({ message: errorMsg, type: 'error' });
      return { success: false, message: errorMsg };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setLoginError('Server error: Invalid response format');
        return;
      }
      
      const result = await res.json();
      if (result.success) {
        if (editData.security?.stayLoggedIn) {
          localStorage.setItem('admin_token', result.token);
        } else {
          sessionStorage.setItem('admin_token', result.token);
        }
        setIsAuthenticated(true);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        if (res.status === 429) {
          const blockTime = Date.now() + 60000; // 1 min
          setBlockedUntil(blockTime);
          localStorage.setItem('login_blocked_until', blockTime.toString());
        }
        setLoginError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const getAuthHeader = () => {
    // Check both storages to be safe
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  const handleUpdateCredentials = async () => {
    if (!newAdminEmail || !newAdminPassword) return;
    setCredStatus('saving');
    setCredError('');
    try {
      const res = await fetch('/api/update-credentials', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword })
      });
      
      if (res.status === 401) {
        handleLogout();
        return;
      }
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setCredStatus('error');
        setCredError('Server error: Invalid response format');
        return;
      }
      
      const result = await res.json();
      if (res.ok && result.success) {
        setCredStatus('success');
        setNewAdminEmail('');
        setNewAdminPassword('');
        setTimeout(() => setCredStatus('idle'), 3000);
      } else {
        setCredStatus('error');
        setCredError(result.message || 'Failed to update credentials');
      }
    } catch (err: any) {
      setCredStatus('error');
      setCredError(err.message || 'Network error');
    }
  };

  // --- Handlers ---
  const handleHeroChange = (field: string, value: any) => {
    setEditData({ ...editData, hero: { ...editData.hero, [field]: value } });
  };

  const handleAboutChange = (field: string, value: any) => {
    setEditData({ ...editData, about: { ...editData.about, [field]: value } });
  };

  const handleContactChange = (field: string, value: any) => {
    setEditData({ ...editData, contact: { ...editData.contact, [field]: value } });
  };

  const handleSecurityChange = (field: string, value: any) => {
    setEditData({ ...editData, security: { ...editData.security, [field]: value } });
  };

  // Projects
  const updateProject = (id: string, field: string, value: any) => {
    const newProjects = editData.projects.map(p => p.id === id ? { ...p, [field]: value } : p);
    setEditData({ ...editData, projects: newProjects });
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'New Project',
      desc: 'Description',
      tags: ['Tag'],
      img: 'https://picsum.photos/seed/new/800/600'
    };
    setEditData({ ...editData, projects: [...editData.projects, newProject] });
  };

  const deleteProject = (id: string) => {
    setEditData({ ...editData, projects: editData.projects.filter(p => p.id !== id) });
  };

  // Skills
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: Date.now().toString(),
      title: 'New Category',
      icon: 'Code2',
      skills: ['Skill 1']
    };
    setEditData({ ...editData, skills: [...editData.skills, newCat] });
  };

  const deleteSkillCategory = (id: string) => {
    setEditData({ ...editData, skills: editData.skills.filter(s => s.id !== id) });
  };

  const updateSkillCategory = (id: string, field: string, value: any) => {
    const newSkills = editData.skills.map(s => s.id === id ? { ...s, [field]: value } : s);
    setEditData({ ...editData, skills: newSkills });
  };

  const addSkillToCategory = (catId: string) => {
    const newSkills = editData.skills.map(s => {
      if (s.id === catId) {
        return { ...s, skills: [...s.skills, 'New Skill'] };
      }
      return s;
    });
    setEditData({ ...editData, skills: newSkills });
  };

  const removeSkillFromCategory = (catId: string, skillIndex: number) => {
    const newSkills = editData.skills.map(s => {
      if (s.id === catId) {
        const updatedSkills = [...s.skills];
        updatedSkills.splice(skillIndex, 1);
        return { ...s, skills: updatedSkills };
      }
      return s;
    });
    setEditData({ ...editData, skills: newSkills });
  };

  const updateSkillInCategory = (catId: string, skillIndex: number, value: string) => {
    const newSkills = editData.skills.map(s => {
      if (s.id === catId) {
        const updatedSkills = [...s.skills];
        updatedSkills[skillIndex] = value;
        return { ...s, skills: updatedSkills };
      }
      return s;
    });
    setEditData({ ...editData, skills: newSkills });
  };

  // Socials
  const addSocial = () => {
    const newSocial: SocialAccount = {
      id: Date.now().toString(),
      name: 'New Social',
      url: 'https://',
      icon: 'Globe'
    };
    setEditData({ ...editData, socials: [...(editData.socials || []), newSocial] });
  };

  const deleteSocial = (id: string) => {
    setEditData({ ...editData, socials: editData.socials.filter(s => s.id !== id) });
  };

  const updateSocial = (id: string, field: string, value: any) => {
    const newSocials = editData.socials.map(s => s.id === id ? { ...s, [field]: value } : s);
    setEditData({ ...editData, socials: newSocials });
  };

  // Typing Texts
  const addTypingText = () => {
    setEditData({ 
      ...editData, 
      hero: { 
        ...editData.hero, 
        typingTexts: [...editData.hero.typingTexts, 'New Text'] 
      } 
    });
  };

  const removeTypingText = (index: number) => {
    const newTexts = [...editData.hero.typingTexts];
    newTexts.splice(index, 1);
    setEditData({ 
      ...editData, 
      hero: { 
        ...editData.hero, 
        typingTexts: newTexts 
      } 
    });
  };

  const updateTypingText = (index: number, value: string) => {
    const newTexts = [...editData.hero.typingTexts];
    newTexts[index] = value;
    setEditData({ 
      ...editData, 
      hero: { 
        ...editData.hero, 
        typingTexts: newTexts 
      } 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 5MB (Vercel limit is 4.5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({ message: 'File is too large. Please upload an image smaller than 5MB.', type: 'error' });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeader(),
        // Note: Do NOT set Content-Type header when using FormData; fetch handles it with boundary
        body: formData
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON upload response:", text.substring(0, 100));
        throw new Error("Server returned non-JSON response during upload.");
      }

      const result = await res.json();
      if (result.success && result.url) {
        // Update local state so user sees the change immediately
        callback(result.url);
        setNotification({ message: 'Image uploaded successfully! Please click "Save All" to make it permanent.', type: 'info' });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setNotification({ message: `Upload failed: ${err.message}`, type: 'error' });
    } finally {
      setUploading(false);
      setIsAutoSaving(false);
    }
  };

  const CloudStatusIndicator = () => {
    if (!cloudInfo) return <div className="text-[10px] text-zinc-500 mt-1">Connecting...</div>;
    
    const isConnected = cloudInfo.status === "Connected (Cloud)";
    const isError = cloudInfo.status.includes("Error") || cloudInfo.status.includes("Exception") || cloudInfo.status === "Missing Credentials";
    
    return (
      <div className="group relative">
        <div className="flex items-center gap-1.5 mt-1 cursor-help">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
            isError ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
            'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
          }`} />
          <span className={`text-[10px] uppercase tracking-wider font-bold ${
            isConnected ? 'text-zinc-500' : isError ? 'text-red-500' : 'text-amber-500'
          }`}>
            {cloudInfo.status}
          </span>
        </div>
        {cloudInfo.error && (
          <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-zinc-900 border border-red-500/20 rounded-xl text-[10px] text-red-400 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
            <strong>Database Error:</strong> {cloudInfo.error}
            {!cloudInfo.configured && <p className="mt-1 text-zinc-500">HINT: Check your Vercel/Local environment variables.</p>}
          </div>
        )}
      </div>
    );
  };

  const ImageUploadField = ({ label, value, onChange }: { label: string, value: string, onChange: (url: string) => void }) => (
    <div className="space-y-2">
      <label className="text-sm text-zinc-400">{label}</label>
      <div className="flex flex-col gap-4">
        {value && (
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex gap-2">
          <input 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL"
            className="flex-1 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500 outline-none"
          />
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm">
            <Upload size={16} />
            <span>{uploading ? '...' : 'Upload'}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, onChange)}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[110] bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 bg-zinc-900 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="text-emerald-500" /> Admin Login
            </h2>
            <button onClick={handleClose} className="text-zinc-500 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Email Address</label>
              <input 
                required
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={!!blockedUntil}
                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                placeholder="admin@kaium.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Password</label>
              <input 
                required
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={!!blockedUntil}
                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            {blockedUntil && (
              <p className="text-amber-500 text-sm text-center bg-amber-500/10 py-2 rounded-lg border border-amber-500/20">
                Blocked for {Math.ceil((blockedUntil - Date.now()) / 1000)}s
              </p>
            )}
            <button 
              type="submit"
              disabled={!!blockedUntil}
              className="w-full py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: 'Hero', icon: <Home size={18} /> },
    { id: 'about', label: 'About', icon: <User size={18} /> },
    { id: 'skills', label: 'Skills', icon: <Wrench size={18} /> },
    { id: 'projects', label: 'Projects', icon: <Briefcase size={18} /> },
    { id: 'socials', label: 'Social Media', icon: <Share2 size={18} /> },
    { id: 'contact', label: 'Contact', icon: <Mail size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-zinc-900 border-r border-white/10 flex flex-col">
        {notification && (
          <div className={`fixed top-4 right-4 z-[200] p-4 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
            notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
            notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
            'bg-blue-500/10 border-blue-500/20 text-blue-500'
          }`}>
            {notification.message}
          </div>
        )}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <CloudStatusIndicator />
          </div>
          <button onClick={handleClose} className="md:hidden text-zinc-500 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-zinc-950 font-bold' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          {saveStatus === 'error' && (
            <p className="text-[10px] text-red-500 bg-red-500/10 p-2 rounded mb-2 break-words">
              {saveError}
            </p>
          )}
          <button 
            disabled={saveStatus === 'saving' || isAutoSaving}
            onClick={handleSaveAll}
            className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all ${
              saveStatus === 'success' 
                ? 'bg-emerald-600 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-600'
            }`}
          >
            {isAutoSaving ? (
              <><div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" /> Auto-saving...</>
            ) : saveStatus === 'saving' ? (
              <><div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" /> Saving...</>
            ) : saveStatus === 'success' ? (
              'Saved!'
            ) : (
              <><Save size={18} /> Save All</>
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white capitalize">{activeTab} Section</h2>
            <button onClick={handleClose} className="hidden md:block p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <ImageUploadField 
                    label="Site Logo (Optional)"
                    value={editData.hero.logo || ''}
                    onChange={(url) => handleHeroChange('logo', url)}
                  />
                  <ImageUploadField 
                    label="Hero Background Image (Optional)"
                    value={editData.hero.heroImage || ''}
                    onChange={(url) => handleHeroChange('heroImage', url)}
                  />
                  <ImageUploadField 
                    label="Favicon (Optional)"
                    value={editData.hero.favicon || ''}
                    onChange={(url) => handleHeroChange('favicon', url)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Display Name</label>
                  <input 
                    value={editData.hero.name}
                    onChange={(e) => handleHeroChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Professional Title</label>
                  <input 
                    value={editData.hero.title}
                    onChange={(e) => handleHeroChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-zinc-400">Typing Animations</label>
                    <button onClick={addTypingText} className="text-xs text-emerald-500 flex items-center gap-1 hover:underline">
                      <Plus size={14} /> Add Text
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editData.hero.typingTexts.map((text, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          value={text}
                          onChange={(e) => updateTypingText(idx, e.target.value)}
                          className="flex-1 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white text-sm"
                        />
                        <button onClick={() => removeTypingText(idx)} className="p-2 text-zinc-500 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Hero Description</label>
                  <textarea 
                    value={editData.hero.description}
                    onChange={(e) => handleHeroChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <ImageUploadField 
                  label="Profile Image"
                  value={editData.about.image}
                  onChange={(url) => handleAboutChange('image', url)}
                />
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Bio Paragraph 1</label>
                  <textarea 
                    value={editData.about.bio1}
                    onChange={(e) => handleAboutChange('bio1', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Bio Paragraph 2</label>
                  <textarea 
                    value={editData.about.bio2}
                    onChange={(e) => handleAboutChange('bio2', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Location</label>
                    <input 
                      value={editData.about.location}
                      onChange={(e) => handleAboutChange('location', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Experience/Education</label>
                    <input 
                      value={editData.about.experience}
                      onChange={(e) => handleAboutChange('experience', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-400">Manage your skill categories and individual skills.</p>
                  <button onClick={addSkillCategory} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm hover:bg-emerald-500/20 transition-all">
                    <Plus size={16} /> Add Category
                  </button>
                </div>
                <div className="space-y-6">
                  {editData.skills.map((cat) => (
                    <div key={cat.id} className="p-6 bg-zinc-900 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Category Title</label>
                            <input 
                              value={cat.title}
                              onChange={(e) => updateSkillCategory(cat.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Icon (Lucide Name)</label>
                            <input 
                              value={cat.icon}
                              onChange={(e) => updateSkillCategory(cat.id, 'icon', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                        </div>
                        <button onClick={() => deleteSkillCategory(cat.id)} className="ml-4 p-2 text-zinc-500 hover:text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase text-zinc-500 font-bold">Skills List</label>
                          <button onClick={() => addSkillToCategory(cat.id)} className="text-[10px] text-emerald-500 hover:underline">
                            + Add Skill
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cat.skills.map((skill, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1 bg-zinc-950 border border-white/10 rounded-lg px-2 py-1">
                              <input 
                                value={skill}
                                onChange={(e) => updateSkillInCategory(cat.id, sIdx, e.target.value)}
                                className="bg-transparent text-xs text-white outline-none w-24"
                              />
                              <button onClick={() => removeSkillFromCategory(cat.id, sIdx)} className="text-zinc-500 hover:text-red-500">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-400">Showcase your best work with images and descriptions.</p>
                  <button onClick={addProject} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm hover:bg-emerald-500/20 transition-all">
                    <Plus size={16} /> Add Project
                  </button>
                </div>
                <div className="space-y-6">
                  {editData.projects.map((project) => (
                    <div key={project.id} className="p-6 bg-zinc-900 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase text-zinc-500 font-bold">Project Title</label>
                              <input 
                                value={project.title}
                                onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                              />
                            </div>
                            <ImageUploadField 
                              label="Project Image"
                              value={project.img}
                              onChange={(url) => updateProject(project.id, 'img', url)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Description</label>
                            <textarea 
                              value={project.desc}
                              onChange={(e) => updateProject(project.id, 'desc', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm resize-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Tags (Comma separated)</label>
                            <input 
                              value={project.tags.join(', ')}
                              onChange={(e) => updateProject(project.id, 'tags', e.target.value.split(',').map(t => t.trim()))}
                              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">GitHub URL</label>
                            <input 
                              value={project.githubUrl || ''}
                              onChange={(e) => updateProject(project.id, 'githubUrl', e.target.value)}
                              placeholder="https://github.com/..."
                              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                            />
                          </div>
                        </div>
                        <button onClick={() => deleteProject(project.id)} className="ml-4 p-2 text-zinc-500 hover:text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'socials' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-400">Add your social media profiles to show in the footer and contact section.</p>
                  <button onClick={addSocial} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm hover:bg-emerald-500/20 transition-all">
                    <Plus size={16} /> Add Account
                  </button>
                </div>
                <div className="space-y-4">
                  {(editData.socials || []).map((social) => (
                    <div key={social.id} className="p-6 bg-zinc-900 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="flex-1 grid md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500 font-bold">Platform Name</label>
                          <input 
                            value={social.name}
                            onChange={(e) => updateSocial(social.id, 'name', e.target.value)}
                            placeholder="e.g. Facebook"
                            className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500 font-bold">Profile URL</label>
                          <input 
                            value={social.url}
                            onChange={(e) => updateSocial(social.id, 'url', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-zinc-500 font-bold">Icon (Lucide Name)</label>
                          <input 
                            value={social.icon}
                            onChange={(e) => updateSocial(social.id, 'icon', e.target.value)}
                            placeholder="e.g. Facebook, Github, Linkedin"
                            className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                      </div>
                      <button onClick={() => deleteSocial(social.id)} className="p-2 text-zinc-500 hover:text-red-500">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Address Section in Social Media Tab */}
                <div className="pt-8 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-4 text-white font-bold">
                    <MapPin size={18} className="text-emerald-500" />
                    <h3>Physical Address Management</h3>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Your Address</label>
                      <input 
                        value={editData.contact.address}
                        onChange={(e) => handleContactChange('address', e.target.value)}
                        placeholder="e.g. Dhaka, Bangladesh"
                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Address Link (Google Maps URL)</label>
                      <input 
                        value={editData.contact.addressLink || ''}
                        onChange={(e) => handleContactChange('addressLink', e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Note: This address is shown in the Contact section of your portfolio.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Email Address</label>
                    <input 
                      value={editData.contact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">LinkedIn Profile URL</label>
                    <input 
                      value={editData.contact.linkedin}
                      onChange={(e) => handleContactChange('linkedin', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">GitHub Profile URL</label>
                    <input 
                      value={editData.contact.github}
                      onChange={(e) => handleContactChange('github', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Physical Address</label>
                    <input 
                      value={editData.contact.address}
                      onChange={(e) => handleContactChange('address', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-400">View and manage messages sent from your contact form.</p>
                  <button onClick={fetchMessages} className="text-xs text-emerald-500 hover:underline">Refresh</button>
                </div>
                
                {loadingMessages ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-white/5">
                    <MessageSquare size={48} className="mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500">No messages yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="p-6 bg-zinc-900 rounded-2xl border border-white/5 space-y-4 relative group">
                        <button 
                          onClick={() => deleteMessage(msg.id)}
                          className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 bg-zinc-950/50 rounded-lg border border-white/5 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-white font-bold">{msg.name}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-emerald-500 text-sm">{msg.email}</p>
                              <a 
                                href={`mailto:${msg.email}?subject=Reply to your message from Portfolio&body=Hi ${msg.name},`}
                                className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded hover:bg-emerald-500 hover:text-zinc-950 transition-all font-bold"
                              >
                                Reply
                              </a>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-4 bg-zinc-950 rounded-xl border border-white/5">
                          <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Stay Logged In</h3>
                      <p className="text-sm text-zinc-400">If enabled, your session will persist after closing the browser.</p>
                    </div>
                    <button 
                      onClick={() => handleSecurityChange('stayLoggedIn', !editData.security?.stayLoggedIn)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${editData.security?.stayLoggedIn ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editData.security?.stayLoggedIn ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <Key size={18} /> Update Admin Credentials
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">New Email</label>
                        <input 
                          placeholder="admin@example.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="w-full px-4 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">New Password</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          className="w-full px-4 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                    <button 
                      disabled={credStatus === 'saving'}
                      onClick={handleUpdateCredentials}
                      className={`px-6 py-2 rounded-lg transition-colors text-sm font-bold ${
                        credStatus === 'success' 
                          ? 'bg-emerald-600 text-white' 
                          : credStatus === 'error'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      {credStatus === 'saving' ? 'Updating...' : credStatus === 'success' ? 'Credentials Updated!' : 'Update Credentials'}
                    </button>
                    {credStatus === 'error' && (
                      <p className="text-xs text-red-500 mt-2">{credError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
