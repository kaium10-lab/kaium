import React from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Share2, 
  Globe,
  Send,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { PortfolioData } from '../types';
import { SectionHeading } from './Shared';

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

interface ContactProps {
  data: PortfolioData['contact'];
  socials: PortfolioData['socials'];
  formData: { name: string; email: string; message: string };
  setFormData: (data: any) => void;
  formStatus: 'idle' | 'sending' | 'success' | 'error';
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const Contact = ({ data, socials, formData, setFormData, formStatus, handleSubmit }: ContactProps) => {
  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <SectionHeading 
              title="Contact Me" 
              subtitle="Feel free to reach out for collaborations or just a friendly hello." 
            />
            <div className="space-y-8 mt-12">
              {data?.phone && (
                <a href={`tel:${data.phone}`} className="flex items-start gap-6 group">
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Phone</h4>
                    <p className="text-zinc-400 group-hover:text-emerald-500 transition-colors">{data.phone}</p>
                  </div>
                </a>
              )}
              
              <a href={`mailto:${data?.email || ""}`} className="flex items-start gap-6 group">
                <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Email</h4>
                  <p className="text-zinc-400 group-hover:text-emerald-500 transition-colors">{data?.email || "admin@kaium.com"}</p>
                </div>
              </a>
              
              {(socials || []).map((social: any) => (
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

              {data?.addressLink ? (
                <a 
                  href={data.addressLink.startsWith('http') ? data.addressLink : `https://${data.addressLink}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-6 group"
                >
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Address</h4>
                    <p className="text-zinc-400 group-hover:text-emerald-500 transition-colors">
                      {data?.address || "Dhaka, Bangladesh"}
                    </p>
                  </div>
                </a>
              ) : (
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 text-emerald-500">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Address</h4>
                    <p className="text-zinc-400">{data?.address || "Dhaka, Bangladesh"}</p>
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
                  placeholder="How can I help you?"
                  className="w-full px-6 py-4 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-white resize-none"
                />
              </div>
              <button 
                type="submit"
                disabled={formStatus === 'sending'}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-zinc-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
              >
                {formStatus === 'sending' ? (
                  <div className="w-5 h-5 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
              
              {formStatus === 'success' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 size={18} />
                  <p className="text-sm font-medium">Message sent successfully!</p>
                </motion.div>
              )}
              {formStatus === 'error' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  <AlertCircle size={18} />
                  <p className="text-sm font-medium">Failed to send message. Please try again.</p>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
